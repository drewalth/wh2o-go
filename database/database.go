package database

import (
	"log"
	"time"
	"wh2o-next/core/alerts"
	gages "wh2o-next/core/gages"
	user "wh2o-next/core/user"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const databaseFile = "db.sqlite"

func Database() gin.HandlerFunc {

	db, err := gorm.Open(sqlite.Open(databaseFile), &gorm.Config{})

	if err != nil {
		panic("failed to connect database")
	}

	return func(c *gin.Context) {

		t := time.Now()

		c.Set("Database", db)

		c.Next()

		latency := time.Since(t)
		log.Print(latency)

	}
}

func InitializeDatabase() *gorm.DB {

	db, err := gorm.Open(sqlite.Open(databaseFile), &gorm.Config{})

	if err != nil {
		panic("failed to connect database")
	}

	db.AutoMigrate(&gages.Gage{})
	db.AutoMigrate(&gages.GageReading{})
	db.AutoMigrate(&alerts.Alert{})
	db.AutoMigrate(&user.User{})

	db.Create(&user.User{
		ID:                    1,
		Email:                 "",
		MailgunKey:            "",
		Timezone:              "America/Denver",
		MailgunDomain:         "",
		TwilioAccountSID:      "",
		TwilioAuthToken:       "",
		TwilioPhoneNumberTo:   "",
		TwilioPhoneNumberFrom: "",
	})

	return db
}
