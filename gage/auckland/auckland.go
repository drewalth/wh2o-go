package auckland

import (
	"bufio"
	"encoding/csv"
	"fmt"
	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/launcher"
	"gorm.io/gorm"
	"io/ioutil"
	"log"
	"os"
	"strconv"
	"strings"
	"time"
	"wh2o-go/alert"
	"wh2o-go/common"
	"wh2o-go/model"
)

func Run(db *gorm.DB) {
	t := time.Now()

	gages := getGages(db)

	if len(gages) == 0 {
		log.Println("No New Zealand Gages")
		return
	}

	readings := scrapeGageReadings(gages, db)

	alert.CheckImmediateAlerts(&readings, db)

	fmt.Println(len(readings))

	latency := time.Since(t)

	log.Println(fmt.Sprintf("Env Auckland Scraping Job Latency: %s", latency))
}

func getGages(db *gorm.DB) []model.Gage {
	var gages []model.Gage
	result := db.Where("country = ? AND source = ?", "NZ", "ENVIRONMENT_AUCKLAND").Find(&gages)
	common.CheckError(result.Error)
	return gages
}

func scrapeGageReadings(gages []model.Gage, db *gorm.DB) []model.Reading {

	l := launcher.New().
		Headless(true).
		Devtools(false)

	defer l.Cleanup() // remove launcher.FlagUserDataDir

	url := l.MustLaunch()

	tempDir, tE := ioutil.TempDir(".", "tmp-env-auckland")
	common.CheckError(tE)
	defer func() {
		err := os.RemoveAll(tempDir)
		common.CheckError(err)
	}()

	for _, g := range gages {

		gageUrl := fmt.Sprintf("https://environmentauckland.org.nz/Data/DataSet/Grid/Location/%s/DataSet/River%%20Discharge/Continuous/Interval/Latest", g.SiteId)

		browser := rod.New().
			ControlURL(url).
			Trace(true).
			SlowMotion(2 * time.Second).
			MustConnect()

		defer browser.MustClose()

		page := browser.MustPage(gageUrl)

		waitErr := page.WaitIdle(15 * time.Second)

		common.CheckError(waitErr)

		page.MustElement("#dstab_grid")

		page.MustEval(`() => document.querySelector(".export_data").click();`)

		browser.WaitDownload(tempDir)

	}

	files, err := ioutil.ReadDir(tempDir)

	common.CheckError(err)

	readingsBucket := make([]model.Reading, 0)

	defer func() {
		var readings []model.Reading
		result := db.Model(&readings).Create(readingsBucket)
		common.CheckError(result.Error)
	}()

	for _, f := range files {

		if isValidCsv(tempDir + "/" + f.Name()) {

			records := readCsvFile(tempDir + "/" + f.Name())

			var metric model.Metric

			if records[1][1] == "Value (m^3/s)" {
				metric = "CMS"
			}
			if records[1][1] == "Value (m)" {
				metric = "M"
			}

			header := records[0][0]

			sId := strings.Trim(strings.Split(strings.Split(header, "-")[2], "@")[1], " ")

			matchingGage := getMatchingGage(gages, sId)

			parsedValue, pE := strconv.ParseFloat(records[2][1], 64)

			common.CheckError(pE)

			readingsBucket = append(readingsBucket, model.Reading{
				Value:  parsedValue,
				Metric: metric,
				GageID: matchingGage.ID,
				SiteId: matchingGage.SiteId,
			})

			updateGageLatestReading(db, matchingGage, readingsBucket)
		}

	}

	return readingsBucket

}

func isValidCsv(filePath string) bool {

	file, err := os.Open(filePath)

	common.CheckError(err)

	defer func() {
		closeErr := file.Close()
		common.CheckError(closeErr)
	}()

	reader := bufio.NewReader(file)
	var line string

	for {
		line, err = reader.ReadString('\n')

		// is the file an HTML 404 page?
		if strings.Contains(line, "DOCTYPE") {
			return false
		} else {
			return true
		}
	}
}

func readCsvFile(filePath string) [][]string {

	fmt.Print("READING FILE: ", filePath)

	f, err := os.Open(filePath)

	common.CheckError(err)

	defer func() {
		closeErr := f.Close()
		common.CheckError(closeErr)
	}()

	csvReader := csv.NewReader(f)
	records, readErr := csvReader.ReadAll()

	common.CheckError(readErr)

	return records
}

func getMatchingGage(gages []model.Gage, siteId string) model.Gage {

	for _, g := range gages {

		if g.SiteId == siteId {
			return g
		} else {
			continue
		}
	}

	return model.Gage{}
}

func updateGageLatestReading(db *gorm.DB, g model.Gage, readings []model.Reading) {

	for _, r := range readings {

		if r.GageID == g.ID && r.Metric == g.Metric {

			var localGage model.Gage

			result := db.Model(&localGage).Where("id = ?", g.ID).Update("reading", r.Value)

			common.CheckError(result.Error)

		}
	}
}
