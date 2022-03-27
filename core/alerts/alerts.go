package alerts

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Alert struct {
	ID         uint   `gorm:"primaryKey"`
	Name       string `gorm:"unique"`
	Minimum    int
	Maximum    int
	Criteria   string // above, below, or between
	Channel    string // email or sms
	Interval   string // daily or immediate
	Metric     string // cfs, ft, temp or immediate
	Value      int
	GageID     uint
	UserID     int
	LastSent   time.Time
	NotifyTime string
	CreatedAt  time.Time `gorm:"autoCreateTime"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime"`
}

type CreateAlertDto struct {
	GageID     uint   `json:"GageID"`
	Metric     string `json:"Metric"`
	Name       string `json:"Name"`
	Minimum    int    `json:"Minimum"`
	Maximum    int    `json:"Maximum"`
	NotifyTime string
	Criteria   string `json:"Criteria"` // above, below, or between
	Channel    string `json:"Channel"`  // email or sms
	Interval   string `json:"Interval"` // daily or immediate
	Value      int    `json:"Value"`
}

func AlertFindOne(alertId int) {

	fmt.Println("Alert get handler")

	// result := database.FindGages()

	// return result
}

func HandleGetAlerts(c *gin.Context) {

	db := c.MustGet("db").(*gorm.DB)

	var alerts []Alert
	db.Find(&alerts)

	c.JSON(http.StatusOK, alerts)
}

func HandleCreateAlert(c *gin.Context) {
	var createDto CreateAlertDto
	db := c.MustGet("db").(*gorm.DB)

	if c.ShouldBind(&createDto) == nil {

		db.Table("alerts").Create(createDto)
	}

}

type DeleteAlertUri struct {
	ID string `uri:"id" binding:"required"`
}

func HandleDeleteAlert(c *gin.Context) {

	var alertURI DeleteAlertUri

	if c.ShouldBindUri(&alertURI) == nil {

		db := c.MustGet("db").(*gorm.DB)

		db.Delete(&Alert{}, alertURI.ID)

		c.JSON(http.StatusOK, alertURI.ID)

	}

}

func HandleUpdateAlert(c *gin.Context) {
	fmt.Println("update alert!")
}

func LoadImmediateAlerts(db *gorm.DB) []Alert {
	var alerts []Alert
	db.Where("interval = ?", "immediate").Find(&alerts)

	return alerts
}

// can refactor. merge this with above. make interval arg.
func LoadDailyAlerts(db *gorm.DB) []Alert {
	var alerts []Alert
	db.Where("interval = ?", "daily").Find(&alerts)

	return alerts
}
