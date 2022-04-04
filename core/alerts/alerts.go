package alerts

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Alert struct {
	ID         uint   `gorm:"primaryKey"`
	Name       string `gorm:"unique"`
	Active     bool   `gorm:"default:true"`
	Minimum    float64
	Maximum    float64
	Criteria   string // above, below, or between
	Channel    string // email or sms
	Interval   string // daily or immediate
	Metric     string // cfs, ft, temp or immediate
	Value      float64
	GageID     int
	UserID     int
	LastSent   time.Time
	NotifyTime string
	CreatedAt  time.Time `gorm:"autoCreateTime"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime"`
}

type UpdateAlertDto struct {
	ID         uint    `form:"ID"`
	Name       string  `form:"Name"`
	Active     bool    `form:"Active"`
	Minimum    float64 `form:"Minimum"`
	Maximum    float64 `form:"Maximum"`
	Criteria   string  `form:"Criteria"`
	Channel    string  `form:"Channel"`
	Interval   string  `form:"Interval"`
	Metric     string  `form:"Metric"`
	Value      float64 `form:"Value"`
	GageID     int     `form:"GageID"`
	NotifyTime string  `form:"NotifyTime"`
}

type CreateAlertDto struct {
	UserID     int     `json:"UserID"`
	GageID     int     `json:"GageID"`
	Metric     string  `json:"Metric"`
	Name       string  `json:"Name"`
	Minimum    float64 `json:"Minimum"`
	Maximum    float64 `json:"Maximum"`
	NotifyTime string
	Criteria   string  `json:"Criteria"` // above, below, or between
	Channel    string  `json:"Channel"`  // email or sms
	Interval   string  `json:"Interval"` // daily or immediate
	Value      float64 `json:"Value"`
}

type DeleteAlertUri struct {
	ID string `uri:"id" binding:"required"`
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

func HandleDeleteAlert(c *gin.Context) {

	var alertURI DeleteAlertUri

	if c.ShouldBindUri(&alertURI) == nil {

		db := c.MustGet("db").(*gorm.DB)

		db.Delete(&Alert{}, alertURI.ID)

		c.JSON(http.StatusOK, alertURI.ID)
	}
}

// @TODO add missing fields
// https://gorm.io/docs/update.html#Updates-multiple-columns
func HandleUpdateAlert(c *gin.Context) {
	var updateAlertDto UpdateAlertDto
	var alert Alert

	alert.ID = updateAlertDto.ID

	if c.ShouldBind(&updateAlertDto) == nil {

		db := c.MustGet("db").(*gorm.DB)

		db.Model(&alert).Where("id = ?", updateAlertDto.ID).Update(
			"Active", updateAlertDto.Active,
		)

		c.JSON(http.StatusOK, alert)
	}
}

func LoadImmediateAlerts(db *gorm.DB) []Alert {
	var alerts []Alert
	db.Where("interval = ?", "immediate").Find(&alerts)

	return alerts
}

// can refactor. merge this with above. make interval arg.
func LoadDailyAlerts(db *gorm.DB) []Alert {
	var alerts []Alert
	db.Where("interval = ? AND active = ?", "daily", true).Find(&alerts)

	return alerts
}
