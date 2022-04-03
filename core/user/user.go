package user

import (
	"net/http"
	"time"
	"wh2o-next/core/alerts"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type User struct {
	ID                    int `gorm:"primaryKey"`
	MailgunKey            string
	MailgunDomain         string
	Email                 string
	Timezone              string
	TwilioAccountSID      string
	TwilioAuthToken       string
	TwilioPhoneNumberTo   string
	TwilioPhoneNumberFrom string
	Alerts                []alerts.Alert
	CreatedAt             time.Time `gorm:"autoCreateTime"`
	UpdatedAt             time.Time `gorm:"autoUpdateTime"`
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

type Body struct {
	MailgunKey            string `form:"MailgunKey"`
	MailgunDomain         string `form:"MailgunDomain"`
	Email                 string `form:"Email"`
	Timezone              string `form:"Timezone"`
	TwilioAccountSID      string `form:"TwilioAccountSID"`
	TwilioAuthToken       string `form:"TwilioAuthToken"`
	TwilioPhoneNumberTo   string `form:"TwilioPhoneNumberTo"`
	TwilioPhoneNumberFrom string `form:"TwilioPhoneNumberFrom"`
}

func HandleUpdateUserSettings(c *gin.Context) {
	db := c.MustGet("db").(*gorm.DB)

	var user User

	var body Body

	if err := c.Bind(&body); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	db.First(&user)

	user.Email = body.Email
	user.MailgunDomain = body.MailgunDomain
	user.MailgunKey = body.MailgunKey
	user.Timezone = body.Timezone
	user.TwilioAccountSID = body.TwilioAccountSID
	user.TwilioAuthToken = body.TwilioAuthToken
	user.TwilioPhoneNumberFrom = body.TwilioPhoneNumberFrom
	user.TwilioPhoneNumberTo = body.TwilioPhoneNumberTo

	db.Save(&user)

	c.JSON(http.StatusAccepted, &user)
}
