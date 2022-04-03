package exporter

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"
	"wh2o-next/core/alerts"
	"wh2o-next/core/gages"
	"wh2o-next/core/user"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ExportData struct {
	Gages  []gages.Gage   `json:"gages"`
	Alerts []alerts.Alert `json:"alerts"`
	Config user.User      `json:"config"`
}

func ExportAllData(c *gin.Context) {

	db := c.MustGet("db").(*gorm.DB)

	var gages []gages.Gage
	db.Find(&gages)

	var alerts []alerts.Alert
	db.Find(&alerts)

	var user user.User
	db.First(&user)

	data := &ExportData{
		Gages:  gages,
		Alerts: alerts,
		Config: user,
	}

	file, _ := json.MarshalIndent(data, "", "")

	timestamp := time.Now().Format("2006-01-02")

	fileName := "wh2o-data-" + timestamp + ".json"

	_ = ioutil.WriteFile(fileName, file, 0644)

	cwd, err := os.Getwd()

	downloadPath := cwd + "/" + fileName

	if err != nil {
		log.Println(err)
	}

	c.JSON(http.StatusOK, downloadPath)

}

func ImportData(c *gin.Context) {

	// db := c.MustGet("db").(*gorm.DB)

	var exportData ExportData

	if c.ShouldBind(&exportData) == nil {

		fmt.Println("exportData", exportData)

	}

}
