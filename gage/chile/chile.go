package chile

import (
	"fmt"
	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/launcher"
	"github.com/go-rod/stealth"
	"gorm.io/gorm"
	"log"
	"strings"
	"time"
	"wh2o-go/common"
	"wh2o-go/model"
)

const formUrl = "https://snia.mop.gob.cl/dgasat/pages/dgasat_param/dgasat_param.jsp?param=1"

func init() {
	launcher.NewBrowser().MustGet()
}

func Run(db *gorm.DB) {
	readingBucket := make([]model.Reading, 0)

	var gages []model.Gage

	dbRes1 := db.Where("source = ? AND disabled = ?", model.ENVIRONMENT_CHILE, false).Find(&gages)

	common.CheckError(dbRes1.Error)

	if len(gages) == 0 {
		log.Println("No Chilean gages")
		return
	}

	browser := rod.New().Timeout(time.Minute * 3).MustConnect()

	defer func() {

		log.Println("Closing browser...")
		browser.MustClose()

		if len(readingBucket) > 0 {
			log.Println("Saving readings...")
			createResult := db.Create(&readingBucket)
			common.CheckError(createResult.Error)
			//alert.CheckImmediateAlerts(&readingBucket, db)
		}
	}()

	page := stealth.MustPage(browser)

	for _, g := range gages {

		// some gages may have CMS and M readings
		// some may have one, or neither.
		var meterCubedReadingAvailable = true
		var meterStageReadingAvailable = true

		log.Println("Loading page")

		page.MustNavigate(formUrl)

		wait(page)

		log.Println("Selecting gage")

		page.MustElement(".dgatbl")
		page.MustElement("select[name='estacion1']").MustSelect(g.SiteId)
		page.MustElement("input[value='Ver Parámetros ']").MustClick()

		log.Println("Waiting for navigation")

		waitNavigation1 := page.MustWaitNavigation()
		waitNavigation1()

		log.Println("Selecting parameters")

		metersCubed, err := page.Element("input[value*='m3/seg']")

		if err != nil {
			meterCubedReadingAvailable = false
			log.Println(err)
		}

		if meterCubedReadingAvailable {
			metersCubed.MustClick()
		}

		meterStage, err2 := page.Element("input[value*='(m)']")

		if err2 != nil {
			meterStageReadingAvailable = false
			log.Println(err2)
		}

		if meterStageReadingAvailable {
			meterStage.MustClick()
		}

		if !meterStageReadingAvailable && !meterCubedReadingAvailable {

			log.Println("NO AVAILABLE READINGS FOR GAGE: ", g.Name)

			disRes := db.Where("id = ?", g.ID).Update("disabled", true)

			common.CheckError(disRes.Error)
			continue
		}

		log.Println("waiting for page load")

		wait(page)

		_, evalErr := page.Eval(`() => reporte(frm_param_estac,'P')`)

		common.CheckError(evalErr)

		waitNavigation2 := page.MustWaitNavigation()
		waitNavigation2()

		wait(page)

		var meterStageCol = 0
		var metersCubedCol = 0

		readingTable := page.MustElement("#datos")

		readingTableHeaderCells := readingTable.MustElement("thead").MustElement("tr").MustElements("th")

		if meterStageReadingAvailable {
			meterStageCol = getMeterStageColIndex(readingTableHeaderCells)
		}

		if meterCubedReadingAvailable {
			metersCubedCol = getMeterCubedColIndex(readingTableHeaderCells)
		}

		readingTableBody := readingTable.MustElement("tbody")
		lastRow := readingTableBody.MustElements("tr").Last()
		readingCells := lastRow.MustElements("td")

		tmpReadingBucket := make([]model.Reading, 0)

		if meterStageCol != 0 {

			val1, err4 := readingCells[meterStageCol].Text()

			common.CheckError(err4)

			tmpReadingBucket = append(tmpReadingBucket, model.Reading{
				Value:  common.ConvertStringToFloat(val1),
				GageID: g.ID,
				SiteId: g.SiteId,
				Metric: model.M,
			})

		} else {
			fmt.Println("METER STAGE COL NOT AVAILABLE")
		}

		if metersCubedCol != 0 {
			val2, err5 := readingCells[metersCubedCol].Text()

			common.CheckError(err5)

			tmpReadingBucket = append(tmpReadingBucket, model.Reading{
				Value:  common.ConvertStringToFloat(val2),
				GageID: g.ID,
				SiteId: g.SiteId,
				Metric: model.CMS,
			})

		} else {
			fmt.Println("METER CUBED COL NOT AVAILABLE")
		}

		if len(tmpReadingBucket) > 0 {

			var hasPrimaryMetricReading = false

			// find reading that matches primary gage metric
			// and update gage reading value
			for _, r := range tmpReadingBucket {
				if r.Metric == g.Metric {
					res1 := db.Model(&g).Where("id = ?", g.ID).Update("reading", r.Value)

					common.CheckError(res1.Error)
					hasPrimaryMetricReading = true
					break
				}

			}

			// if reading for gage primary metric not available
			// update gage primary metric and reading from available
			if !hasPrimaryMetricReading && len(tmpReadingBucket) == 1 {

				val := tmpReadingBucket[0]

				res2 := db.Model(&g).Where("id = ?", g.ID).Update("reading", val.Value).Update("metric", val.Metric)

				common.CheckError(res2.Error)

			}

			readingBucket = append(readingBucket, tmpReadingBucket...)
		}

	}

}

func wait(page *rod.Page) {
	err := page.WaitIdle(time.Second * 5)
	common.CheckError(err)
}

// getMeterStageColIndex find which table column contains
// data for Meters stage (M). Column index can vary,
// so we need to find it on the fly
func getMeterStageColIndex(cells []*rod.Element) int {

	var index = 0

	for cellIdx, cell := range cells {

		cellHTML := cell.MustHTML()

		if strings.Contains(cellHTML, "(m)") {

			index = cellIdx
		}

	}

	return index
}

// getMeterCubedColIndex find which table column contains
// data for Cubic Meters per Second (CMS). Column index can vary,
// so we need to find it on the fly
func getMeterCubedColIndex(cells []*rod.Element) int {

	var index = 0

	for cellIdx, cell := range cells {

		cellHTML := cell.MustHTML()

		if strings.Contains(cellHTML, "(m3/seg)") {

			index = cellIdx
		}

	}

	return index
}
