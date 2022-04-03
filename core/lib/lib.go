package lib

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type UsState struct {
	Name         string `json:"name"`
	Abbreviation string `json:"abbreviation"`
}

type GageEntry struct {
	GageName string `json:"gageName"`
	SiteId   string `json:"siteId"`
}

type AllGages struct {
	State string      `json:"state"`
	Gages []GageEntry `json:"gages"`
}

func GetUsStates(c *gin.Context) {

	jsonFile, err := os.Open("./core/lib/sources/us-states.json")

	if err != nil {
		panic(err)
	}

	var states []UsState

	byteValue, _ := ioutil.ReadAll(jsonFile)

	marshalErr := json.Unmarshal(byteValue, &states)

	if marshalErr != nil {
		panic(marshalErr)
	}

	defer jsonFile.Close()

	c.JSON(http.StatusOK, states)

}

func GetTimezones(c *gin.Context) {

	jsonFile, err := os.Open("./core/lib/sources/timezones.json")

	if err != nil {
		panic(err)
	}

	var timezones []string

	byteValue, _ := ioutil.ReadAll(jsonFile)

	marshalErr := json.Unmarshal(byteValue, &timezones)

	if marshalErr != nil {
		panic(marshalErr)
	}

	defer jsonFile.Close()

	c.JSON(http.StatusOK, timezones)

}
