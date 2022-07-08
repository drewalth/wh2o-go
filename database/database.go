package database

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"wh2o-go/common"
	"wh2o-go/model"
)

const databaseFile = "db.sqlite"

func Connect() *gorm.DB {

	db, err := gorm.Open(sqlite.Open(databaseFile), &gorm.Config{})

	if err != nil {
		panic("failed to connect database")
	}

	models := []interface{}{
		&model.Gage{},
		&model.Reading{},
		&model.Alert{},
		&model.User{},
	}

	for _, m := range models {
		migrateErr := db.AutoMigrate(m)
		common.CheckError(migrateErr)
	}

	db.Create(&model.User{
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
