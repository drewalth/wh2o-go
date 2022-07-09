package canada

import (
	"bufio"
	"encoding/csv"
	"fmt"
	"gorm.io/gorm"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
	"wh2o-go/alert"
	"wh2o-go/common"
	"wh2o-go/model"
)

// Run fetches gage reading report CSVs
// published by Environment Canada
func Run(db *gorm.DB) {

	provinces := []string{"AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "SK", "YT", "QC"}

	var wg sync.WaitGroup

	for _, province := range provinces {

		wg.Add(1)

		go func(p string) {
			log.Println("Fetching readings for ", p)
			readingBucket := make([]model.Reading, 0)
			defer func() {
				if len(readingBucket) > 0 {
					result := db.Create(&readingBucket)
					common.CheckError(result.Error)
					alert.CheckImmediateAlerts(&readingBucket, db)
				}
				log.Println("Finished fetching readings for ", p)
				wg.Done()
			}()

			tempDir, err := ioutil.TempDir(".", fmt.Sprintf("tmp-env-canada-%s-", p))

			common.CheckError(err)

			gages := loadGagesByProvince(p, db)

			if len(gages) == 0 {
				log.Println("No gages for Canadian Province: ", p)
				removeErr := os.RemoveAll(tempDir)
				common.CheckError(removeErr)
				return
			}

			chunkedGages := chunkGages(gages, len(gages)/4)

			for chunkIdx, chunk := range chunkedGages {
				// wait before downloading
				// the remaining chunks
				if chunkIdx != 0 {
					log.Println(fmt.Sprintf("[%s]: Sleeping...", p))
					time.Sleep(5 * time.Second)
				}

				for _, g := range chunk {

					downloadReportCSV(tempDir, p, g.SiteId)

					csvFilePath := tempDir + fmt.Sprintf("/%s-%s.csv", p, g.SiteId)

					if isValidCsv(csvFilePath) {
						log.Println(fmt.Sprintf("[%s]: %s", p, csvFilePath))
						records := readCsvFile(csvFilePath)
						latestRecord := records[len(records)-1]

						var reading float64

						// Check gage primary metric and update
						// the latest reading on gage record
						//
						// water level (M) is col 2 of csv
						// discharge (CMS) is col 6 of csv

						if g.Metric == model.M {
							reading = common.ConvertStringToFloat(latestRecord[2])
						}

						if g.Metric == model.CMS {
							reading = common.ConvertStringToFloat(latestRecord[6])
						}

						res := db.Model(&g).Where("id = ?", g.ID).Update("reading", reading)

						common.CheckError(res.Error)

						readingBucket = append(readingBucket, model.Reading{
							Value:  common.ConvertStringToFloat(latestRecord[2]),
							Metric: model.M,
							GageID: g.ID,
							SiteId: g.SiteId,
						})

						readingBucket = append(readingBucket, model.Reading{
							Value:  common.ConvertStringToFloat(latestRecord[6]),
							Metric: model.CMS,
							GageID: g.ID,
							SiteId: g.SiteId,
						})

					} else {
						res2 := db.Model(&g).Where("id = ?", g.ID).Update("disabled", true)
						common.CheckError(res2.Error)
					}
				}
			}

			removeErr := os.RemoveAll(tempDir)
			common.CheckError(removeErr)

		}(province)

	}

	wg.Wait()

	log.Println("Done fetching Canadian gages")

}

func loadGagesByProvince(province string, db *gorm.DB) []model.Gage {
	var gages []model.Gage

	result := db.Where("country = ? AND source = ? AND state = ? AND disabled = ?", "CA", "ENVIRONMENT_CANADA", province, false).Find(&gages)

	common.CheckError(result.Error)

	return gages
}

// chunkGages takes a large list of gages and splits them up into smaller
// chunks. We then iterate over the chunks and pause between iterations
// to avoid overburdening source servers. #goodnetizens
func chunkGages(slice []model.Gage, chunkSize int) [][]model.Gage {
	var chunks [][]model.Gage
	for {
		if len(slice) == 0 {
			break
		}

		if len(slice) < chunkSize {
			chunkSize = len(slice)
		}

		chunks = append(chunks, slice[0:chunkSize])
		slice = slice[chunkSize:]
	}

	return chunks
}

// downloadReportCSV fetches CSVs from source for the provided province and gage site
func downloadReportCSV(tempDirPath string, province string, siteId string) {

	remoteFileUrl := fmt.Sprintf("https://dd.weather.gc.ca/hydrometric/csv/%s/hourly/%s_%s_hourly_hydrometric.csv", province, province, siteId)
	localFilePath := fmt.Sprintf("%s/%s-%s.csv", tempDirPath, province, siteId)

	// fetch CSV from source
	response, httpErr := http.Get(remoteFileUrl)

	common.CheckError(httpErr)

	defer func() {
		closeErr := response.Body.Close()
		common.CheckError(closeErr)
	}()

	// create the local CSV file
	file, fileErr := os.Create(localFilePath)

	common.CheckError(fileErr)

	defer func() {
		closeErr := file.Close()
		common.CheckError(closeErr)
	}()

	// write response data to local file
	_, writeErr := io.Copy(file, response.Body)

	common.CheckError(writeErr)

}

// isValidCsv verifies that the CSV file downloaded for a gage is valid.
// If the gage does not have a valid, CSV, it usually means that the source
// server returned a 404 HTML document.
func isValidCsv(filePath string) bool {

	file, err := os.Open(filePath)

	if err != nil {
		return false
	}

	common.CheckError(err)

	defer func() {
		closeErr := file.Close()
		common.CheckError(closeErr)
	}()

	reader := bufio.NewReader(file)
	var line string
	var readErr error = nil

	for {
		line, readErr = reader.ReadString('\n')

		common.CheckError(readErr)

		return strings.Contains(line, "ID,Date,Water")
	}

}

// readCsvFile parses the downloaded CSV file and returns
// its data
func readCsvFile(filePath string) [][]string {

	f, err := os.Open(filePath)
	if err != nil {
		log.Fatal("Unable to read input file "+filePath, err)
	}
	defer func() {
		closeErr := f.Close()
		common.CheckError(closeErr)
	}()

	csvReader := csv.NewReader(f)
	records, err := csvReader.ReadAll()
	if err != nil {
		log.Fatal("Unable to parse file as CSV for "+filePath, err)
	}

	return records
}
