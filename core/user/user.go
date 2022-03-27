package user

import (
	"net/http"
	"time"
	"wh2o-next/core/alerts"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type User struct {
	ID                        int `gorm:"primaryKey"`
	MailgunKey                string
	MailgunDomain             string
	Email                     string
	Timezone                  string
	TwilioAccountSID          string
	TwilioAuthToken           string
	TwilioMessagingServiceSID string
	TwilioPhoneNumberTo       string
	TwilioPhoneNumberFrom     string
	Alerts                    []alerts.Alert
	CreatedAt                 time.Time `gorm:"autoCreateTime"`
	UpdatedAt                 time.Time `gorm:"autoUpdateTime"`
}

type GetUserUri struct {
	ID string `uri:"id" binding:"required"`
}

func HandleGetSettings(c *gin.Context) {
	var userURI GetUserUri

	if c.ShouldBindUri(&userURI) == nil {

		db := c.MustGet("db").(*gorm.DB)

		var user User
		db.First(&user)

		c.JSON(http.StatusOK, user)

	}

}

func HandleUpdateUserSettings(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)

	var user User

	if c.ShouldBind(&user) == nil {
		db.Model(&user).Updates(user)

		var editedUser User

		db.First(&editedUser, user.ID)

		c.JSON(http.StatusOK, editedUser)

	}

}
