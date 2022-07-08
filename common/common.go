package common

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"strconv"
)

func CheckError(err error) {
	if err != nil {
		panic(err)
	}
}

func ConvertStringToFloat(str string) float64 {
	val, err := strconv.ParseFloat(str, 64)

	CheckError(err)
	return val
}

func GetDB(c *gin.Context) *gorm.DB {
	db := c.MustGet("db").(*gorm.DB)
	return db
}
