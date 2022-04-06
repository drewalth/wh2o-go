package lib

import (
	_ "embed"
	"encoding/json"
	"net/http"

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

//go:embed sources/timezones.json
var timezones []byte

//go:embed sources/us-states.json
var usStates []byte

func GetUsStates(c *gin.Context) {

	var states []UsState

	marshalErr := json.Unmarshal(usStates, &states)

	if marshalErr != nil {
		panic(marshalErr)
	}

	c.JSON(http.StatusOK, &states)
}

func GetTimezones(c *gin.Context) {

	var parsedTimezones []string

	marshalErr := json.Unmarshal(timezones, &parsedTimezones)

	if marshalErr != nil {
		panic(marshalErr)
	}

	c.JSON(http.StatusOK, &parsedTimezones)

}
