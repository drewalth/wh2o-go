package gage

import (
	"embed"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
	"wh2o-go/common"
	"wh2o-go/model"
)

type JSONSource struct {
	GageName string `json:"gageName"`
	SiteId   string `json:"siteId"`
}

type USGSResponseData struct {
	Value struct {
		TimeSeries []struct {
			SourceInfo struct {
				SiteName string `json:"siteName"`
				SiteCode []struct {
					Value      string `json:"value"`
					Network    string `json:"network"`
					AgencyCode string `json:"agencyCode"`
				} `json:"siteCode"`
				GeoLocation struct {
					GeogLocation struct {
						Latitude  float64 `json:"latitude"`
						Longitude float64 `json:"longitude"`
					}
				} `json:"geoLocation"`
			} `json:"sourceInfo"`
			Variable struct {
				VariableCode []struct {
					Value      string `json:"value"`
					Network    string `json:"network"`
					VariableID int    `json:"variableId"`
				} `json:"variableCode"`
			} `json:"variable"`
			Values []struct {
				Value []struct {
					Value      string   `json:"value"`
					Qualifiers []string `json:"qualifiers"`
					DateTime   string   `json:"dateTime"`
				} `json:"value"`
			} `json:"values"`
		} `json:"timeSeries"`
	} `json:"value"`
}

//go:embed sources/usgs/*.json
var gageSourcesDir embed.FS

// GetEnabledGageReadings loads enabled gages from the database
// then requests their latest readings from the USGS, stores the readings
// and updates the individual gage records
func GetEnabledGageReadings(gages []model.Gage, db *gorm.DB) []model.Reading {
	response := fetchLatestReadings(gages)
	readings := formatUSGSData(response)
	deleteStaleReadings(db)
	storeGageReadings(&readings, gages, db)
	updateGageLatestReading(&readings, gages, db)
	return readings
}

// fetchLatestReadings submits an HTTP request to the USGS REST API
// to get the latest readings for the provided list of gages
func fetchLatestReadings(gages []model.Gage) USGSResponseData {
	gageCount := len(gages)

	if gageCount == 0 {
		log.Print("No gages provided")
		return USGSResponseData{}
	}

	if gageCount > 100 {
		log.Print("Cannot request more than 100 gages at a time!")
		return USGSResponseData{}
	}

	siteIds := make([]string, 0)

	for _, g := range gages {
		siteIds = append(siteIds, g.SiteId)
	}

	formattedIds := strings.Join(siteIds, ",")

	resp, err := http.Get("http://waterservices.usgs.gov/nwis/iv/?format=json&sites=" + formattedIds + "&parameterCd=00060,00065,00010&siteStatus=all")

	common.CheckError(err)

	defer func() {
		closeErr := resp.Body.Close()
		common.CheckError(closeErr)
	}()

	body, readErr := ioutil.ReadAll(resp.Body)

	common.CheckError(readErr)

	gageData := USGSResponseData{}

	jsonErr := json.Unmarshal(body, &gageData)

	common.CheckError(jsonErr)

	return gageData
}

// formatUSGSData takes the response from the HTTP request to the USGS
// and maps it to something we can easily work with
func formatUSGSData(data USGSResponseData) []model.Reading {

	readings := make([]model.Reading, 0)

	for _, ts := range data.Value.TimeSeries {

		// get reading value
		latestReadingString := ts.Values[len(ts.Values)-1].Value[0].Value
		// convert to float64
		latestReading := common.ConvertStringToFloat(latestReadingString)

		// get reading metric
		parameter := ts.Variable.VariableCode[0].Value

		// CFS, FT, or TEMP
		metric := model.CFS

		switch parameter {
		case "00060": // CFS
			metric = model.CFS
		case "00065": // FT
			metric = model.FT
		case "00010": // DEG_CELSIUS
			metric = model.TEMP
		}

		siteId := ts.SourceInfo.SiteCode[0].Value

		readings = append(readings, model.Reading{
			Value:  latestReading,
			Metric: metric,
			SiteId: siteId,
		})
	}

	return readings
}

func deleteStaleReadings(db *gorm.DB) {

	result := db.Exec("DELETE FROM gage_readings WHERE created_at <= date('now', '-1 day')")

	common.CheckError(result.Error)

}

// storeGageReadings saves the provided gage readings to the database
func storeGageReadings(readings *[]model.Reading, gages []model.Gage, db *gorm.DB) {

	readingBucket := make([]model.Reading, 0)

	defer func() {
		if len(readingBucket) > 0 {
			result := db.Create(&readingBucket)
			common.CheckError(result.Error)
		}
	}()

	for _, r := range *readings {
		for _, g := range gages {
			if g.SiteId == r.SiteId {
				readingBucket = append(readingBucket, model.Reading{
					Value:  r.Value,
					GageID: g.ID,
					Metric: r.Metric,
					SiteId: r.SiteId,
				})
				break
			}
		}
	}
}

// updateGageLatestReading updates the gage record "reading" column with the
// latest reading that matches the gage's primary metric
func updateGageLatestReading(readings *[]model.Reading, gages []model.Gage, db *gorm.DB) {

	for _, g := range gages {

		filteredReadings := g.FilterReadings(*readings)

		if len(filteredReadings) == 0 {
			// @todo investigate why this happens and disable gage
			log.Println(fmt.Sprintf("No readings for gage %s.", g.Name))
			continue
		}

		for _, r := range filteredReadings {

			if g.ShouldUpdateLatestReading(r) {
				if r.Value == -999999 {
					res1 := db.Model(&g).Where("id = ? AND metric = ?", g.ID, g.Metric).Update("disabled", true)
					common.CheckError(res1.Error)
				} else {
					res2 := db.Model(&g).Where("id = ? AND metric = ?", g.ID, g.Metric).Update("reading", r.Value).Update("disabled", false)

					common.CheckError(res2.Error)
				}
			}

		}

	}
}

func GetAll(c *gin.Context) {

	db := common.GetDB(c)

	var gages []model.Gage

	result := db.Preload("Readings").Find(&gages)

	common.CheckError(result.Error)

	c.JSON(http.StatusOK, gages)
}

func GetSources(c *gin.Context) {

	var s struct {
		State string `uri:"state"`
	}

	files, err := gageSourcesDir.ReadDir("sources/usgs")

	common.CheckError(err)

	if c.ShouldBindUri(&s) == nil {

		for _, file := range files {

			if strings.Contains(file.Name(), s.State) {
				val, readErr := gageSourcesDir.ReadFile("sources/usgs/" + file.Name())

				common.CheckError(readErr)

				var source []JSONSource

				jsonErr := json.Unmarshal(val, &source)

				common.CheckError(jsonErr)

				c.JSON(http.StatusOK, &source)
				break
			}
		}

	} else {
		c.JSON(http.StatusBadRequest, "Bad request")
	}

}

func Create(c *gin.Context) {

	var g model.Gage

	if c.ShouldBind(&g) == nil {

		db := common.GetDB(c)

		res := db.Model(&model.Gage{}).Clauses(clause.Returning{}).Create(g)

		common.CheckError(res.Error)

		c.JSON(http.StatusOK, g)

	} else {
		c.JSON(http.StatusBadRequest, "Bad request")
	}

}

func Update(c *gin.Context) {

	var g model.Gage

	if c.ShouldBind(&g) == nil {

		db := common.GetDB(c)

		res := db.Model(&model.Gage{}).Clauses(clause.Returning{}).Where("id = ?", g.ID).Updates(g)

		common.CheckError(res.Error)

		c.JSON(http.StatusOK, g)

	} else {
		c.JSON(http.StatusBadRequest, "Bad request")
	}

}

func Delete(c *gin.Context) {

	var g struct {
		ID int `uri:"id"`
	}

	if c.ShouldBindUri(&g) == nil {

		db := common.GetDB(c)

		res := db.Model(&model.Gage{}).Where("id = ?", g.ID).Delete(&model.Gage{})

		common.CheckError(res.Error)

		c.JSON(http.StatusOK, g)

	} else {
		c.JSON(http.StatusBadRequest, "Bad request")
	}
}
