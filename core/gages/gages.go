package gages

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"reflect"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CreateGageDto struct {
	SiteId string `form:"SiteId"`
	State  string `form:"State"`
	Name   string `form:"Name"`
}

type Gage struct {
	ID        uint `gorm:"primaryKey"`
	Name      string
	SiteId    string `gorm:"unique"`
	State     string
	Reading   int
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func FetchGageReadings() {

	// add usgs fetch
	resp, err := http.Get("https://pokeapi.co/api/v2/pokemon/ditto")

	if err != nil {
		log.Fatalln(err)
	}

	body, err := ioutil.ReadAll(resp.Body)

	if err != nil {
		log.Fatalln(err)
	}

	sb := string(body)
	fmt.Println(reflect.TypeOf(sb))

}

func HandleGetGages(c *gin.Context) {

	db := c.MustGet("db").(*gorm.DB)

	var gages []Gage
	db.Find(&gages)

	c.JSON(http.StatusOK, gin.H{
		"data": gages,
	})
}

func HandleCreateGage(c *gin.Context) {
	var createGageDto CreateGageDto
	db := c.MustGet("db").(*gorm.DB)

	if c.ShouldBind(&createGageDto) == nil {

		gage := &Gage{
			Name:   createGageDto.Name,
			SiteId: createGageDto.SiteId,
			State:  createGageDto.State,
		}

		result := db.Create(&gage)

		fmt.Println(result.Error)

		var newGage Gage

		db.First(&newGage, gage.ID)

		c.JSON(http.StatusOK, gin.H{
			"data": newGage,
		})

	}

}

type DeleteGageUri struct {
	ID string `uri:"id" binding:"required"`
}

func HandleDeleteGage(c *gin.Context) {

	var gage DeleteGageUri
	if c.ShouldBindUri(&gage) == nil {

		id, err := strconv.Atoi(gage.ID)

		if err != nil {
			panic(err)
		}

		fmt.Println(id)

		db := c.MustGet("db").(*gorm.DB)

		db.Delete(&Gage{}, gage)

		c.JSON(http.StatusOK, gin.H{
			"data": gage,
		})

	}

}

func HandleUpdateGage(c *gin.Context) {

	db := c.MustGet("db").(*gorm.DB)

	var gage Gage

	if c.ShouldBind(&gage) == nil {

		db.Model(&gage).Updates(gage)

		var editedGage Gage
		db.First(&editedGage, gage.ID)

		c.JSON(http.StatusOK, gin.H{
			"data": editedGage,
		})

	}

}
