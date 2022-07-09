package export

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"net/http"
	"time"
	"wh2o-go/common"
	"wh2o-go/model"
)

type Data struct {
	Alerts   []model.Alert `json:"alerts"`
	Gages    []model.Gage  `json:"gages"`
	Settings model.User    `json:"settings"`
}

func DataOut(c *gin.Context) {

	var user model.User
	var alerts []model.Alert
	var gages []model.Gage

	db := common.GetDB(c)

	res1 := db.Model(model.Alert{}).Find(&alerts)
	common.CheckError(res1.Error)

	fmt.Println("alerts: ", alerts)

	res2 := db.Model(model.Gage{}).Find(&gages)

	common.CheckError(res2.Error)

	fmt.Println("gages: ", gages)

	res3 := db.Model(model.User{}).First(&user)

	common.CheckError(res3.Error)

	var dataOut Data

	dataOut.Settings = user
	dataOut.Alerts = alerts
	dataOut.Gages = gages

	fmt.Println("dataOut: ", dataOut)

	jsonData, err1 := json.Marshal(dataOut)

	common.CheckError(err1)

	fileName := fmt.Sprintf("wh2o-data-export-%s.json", time.Now().Format("2006-02-01"))

	err2 := ioutil.WriteFile(fileName, jsonData, 0644)

	common.CheckError(err2)

	c.JSON(http.StatusOK, dataOut)

}

func DataIn(c *gin.Context) {

	var data Data

	if c.ShouldBind(&data) == nil {

		db := common.GetDB(c)

		res1 := db.Model(model.Alert{}).Create(&data.Alerts)

		common.CheckError(res1.Error)

		res2 := db.Model(model.Gage{}).Create(&data.Gages)

		common.CheckError(res2.Error)

		res3 := db.Model(model.User{}).Where("id = ?", 1).Updates(&data.Settings)

		common.CheckError(res3.Error)

		c.JSON(http.StatusOK, "data imported")

	} else {
		c.JSON(http.StatusBadRequest, "Bad request")
	}

}
