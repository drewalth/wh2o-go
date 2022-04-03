package gages

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
	"wh2o-next/core/alerts"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SiteCode struct {
	Value      string
	Network    string
	AgencyCode string
}

type ReadingValue struct {
	Value []USGSReadingVal `json:"value"`
}

type USGSReadingVal struct {
	Value      string   `json:"value"`
	Qualifiers []string `json:"qualifiers"`
	DateTime   string   `json:"dateTime"`
}
type SourceInfo struct {
	SiteName string
	SiteCode []SiteCode `json:"siteCode"`
}

type VariableCode struct {
	Value      string
	Network    string
	VariableID int
}

type USGSTimeSeriesVariable struct {
	VariableCode []VariableCode `json:"variableCode"`
}
type USGSTimeSeries struct {
	SourceInfo SourceInfo             `json:"sourceInfo"`
	Values     []ReadingValue         `json:"values"`
	Variable   USGSTimeSeriesVariable `json:"variable"`
}

type USGSGageDataVal struct {
	TimeSeries []USGSTimeSeries `json:"timeSeries"`
}
type USGSGageData struct {
	Value USGSGageDataVal `json:"value"`
}

type CreateGageDto struct {
	SiteId string `json:"SiteId"`
	Metric string `json:"Metric"`
	Name   string `json:"Name"`
}

type GageSource struct {
	GageName string `json:"gageName"`
	SiteId   string `json:"siteId"`
}

type Gage struct {
	ID           int    `gorm:"primaryKey"`
	Name         string `gorm:"required"`
	SiteId       string `gorm:"unique"`
	State        string `gorm:"required"`
	Metric       string `gorm:"required"` // primary metric. CFS, FT, or TEMP
	Reading      float64
	Alerts       []alerts.Alert
	CreatedAt    time.Time `gorm:"autoCreateTime"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime"`
	GageReadings []GageReading
}

type GageReading struct {
	// gorm.Model
	ID        uint      `gorm:"primaryKey"`
	SiteId    string    `gorm:"required"`
	Value     float64   `gorm:"required"`
	Metric    string    `gorm:"required"`
	GageID    int       `gorm:"required"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func FetchGageReadings(db *gorm.DB, gages []Gage) USGSGageData {

	if len(gages) > 100 {
		panic("Cannot load more than 100 gages at a time")
	}
	// create comma separated string of gage siteIds
	// and place after sites= below
	// max 100 sites.

	siteIds := make([]string, 0)

	for _, g := range gages {
		siteIds = append(siteIds, g.SiteId)
	}

	formattedIds := strings.Join(siteIds, ",")

	resp, err := http.Get("http://waterservices.usgs.gov/nwis/iv/?format=json&sites=" + formattedIds + "&parameterCd=00060,00065,00010&siteStatus=all")

	if err != nil {
		log.Fatalln(err)
	}

	body, readErr := ioutil.ReadAll(resp.Body)

	if readErr != nil {
		log.Fatalln(err)
	}

	gageData := USGSGageData{}

	jsonErr := json.Unmarshal(body, &gageData)

	if jsonErr != nil {
		log.Fatal(jsonErr)
	}

	return gageData
}

func HandleGetGages(c *gin.Context) {

	db := c.MustGet("db").(*gorm.DB)

	var gages []Gage
	db.Preload("GageReadings").Find(&gages)

	c.JSON(http.StatusOK, gages)
}

func HandleCreateGage(c *gin.Context) {
	var createGageDto CreateGageDto
	db := c.MustGet("db").(*gorm.DB)

	if c.ShouldBind(&createGageDto) == nil {
		gage := &Gage{
			Name:   createGageDto.Name,
			SiteId: createGageDto.SiteId,
			Metric: createGageDto.Metric,
		}

		result := db.Create(&gage)

		fmt.Println(result.Error)

		var newGage Gage

		db.First(&newGage, gage.ID)

		c.JSON(http.StatusOK, newGage)

	}

}

type DeleteGageUri struct {
	ID string `uri:"id" binding:"required"`
}

type GageSourceUri struct {
	State string `uri:"state" binding:"required"`
}

type UpdateGageDto struct {
	ID     int    `form:"ID"`
	Metric string `form:"Metric"`
}

func HandleDeleteGage(c *gin.Context) {

	var gage DeleteGageUri
	if c.ShouldBindUri(&gage) == nil {

		db := c.MustGet("db").(*gorm.DB)

		db.Delete(&Gage{}, gage)

		c.JSON(http.StatusOK, gage)

	}

}

func HandleUpdateGage(c *gin.Context) {

	db := c.MustGet("db").(*gorm.DB)

	var updateGageDto UpdateGageDto

	var gage Gage

	if c.ShouldBind(&updateGageDto) == nil {

		db.Model(&gage).Where("id = ?", updateGageDto.ID).Updates(Gage{
			Metric: updateGageDto.Metric,
		})

		var editedGage Gage
		db.First(&editedGage, updateGageDto.ID)

		c.JSON(http.StatusOK, editedGage)

	}

}

func HandleGetGageSources(c *gin.Context) {
	var state GageSourceUri

	if c.ShouldBindUri(&state) == nil {

		stateGages := GetUSStateGages(state.State)

		c.JSON(http.StatusOK, stateGages)

	}

}

func GetGageID(siteId string, gages []Gage) int {

	var ID int

	for _, n := range gages {

		if siteId == n.SiteId {
			ID = int(n.ID)
			break
		}

	}
	return ID
}

func GetUserGages(db *gorm.DB) []Gage {
	var gages []Gage
	db.Find(&gages)
	return gages
}

func FormatUSGSData(gageData USGSGageData, gages []Gage) []GageReading {

	readingData := make([]GageReading, 0)

	for _, ts := range gageData.Value.TimeSeries {

		// get reading value
		latestReadingString := ts.Values[len(ts.Values)-1].Value[0].Value
		// convert to float64
		latestReading, err := strconv.ParseFloat(latestReadingString, 64)

		if err != nil {
			panic(err)
		}

		// get reading metric
		parameter := ts.Variable.VariableCode[0].Value

		// CFS, FT, or TEMP
		metric := "CFS"

		switch parameter {
		case "00060": // CFS
			metric = "CFS"
		case "00065": // FT
			metric = "FT"
		case "00010": // DEG_CELCIUS
			metric = "TEMP"
		}

		siteId := ts.SourceInfo.SiteCode[0].Value

		readingData = append(readingData, GageReading{
			Value:  latestReading,
			Metric: metric,
			SiteId: siteId,
			// CreatedAt: time.Now(), // value should come from USGS
			// UpdatedAt: time.Now(), // value should come from USGS
		})

	}

	return readingData
}

func SaveGageReadings(db *gorm.DB, readings []GageReading, gages []Gage) {

	for _, r := range readings {

		for _, gage := range gages {

			if gage.SiteId == r.SiteId {

				gage_reading := &GageReading{
					Value:  r.Value,
					GageID: gage.ID,
					Metric: r.Metric,
					SiteId: r.SiteId,
				}

				// should be batch create
				db.Create(&gage_reading)

				break

			}
		}

	}
}

func DeleteStaleReadings(db *gorm.DB) {

	db.Exec("DELETE FROM gage_readings WHERE created_at <= date('now', '-1 day')")

}

func FilterReadings(readings []GageReading, gageSiteId string) []GageReading {

	bucket := make([]GageReading, 0, 3)

	for _, r := range readings {

		if r.SiteId == gageSiteId {
			bucket = append(bucket, r)
		}

	}

	return bucket
}

func UpdateGageLatestReading(db *gorm.DB, readings []GageReading, gages []Gage) {

	for _, gage := range gages {

		filteredReadings := FilterReadings(readings, gage.SiteId)

		if len(filteredReadings) == 0 {
			log.Fatal("Unable to associate readings and gage")
		}

		for _, r := range filteredReadings {

			if r.Metric == gage.Metric {

				db.Model(&gage).Where("metric = ?", gage.Metric).Update("reading", r.Value)

			}

		}

	}

}

// load USGS gages by state from source json
func GetUSStateGages(state string) []GageSource {

	jsonFile, err := os.Open("./core/gages/sources/" + state + "-gage-sources.json")

	if err != nil {
		panic(err)
	}

	byteValue, _ := ioutil.ReadAll(jsonFile)

	var gageSources []GageSource

	marshalErr := json.Unmarshal(byteValue, &gageSources)

	if marshalErr != nil {
		panic(marshalErr)
	}

	defer jsonFile.Close()

	return gageSources

}
