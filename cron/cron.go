package cron

import (
	"github.com/go-co-op/gocron"
	"gorm.io/gorm"
	"log"
	"time"
	"wh2o-go/alert"
	"wh2o-go/common"
	"wh2o-go/gage"
	"wh2o-go/gage/auckland"
	"wh2o-go/gage/canada"
	"wh2o-go/gage/chile"
	"wh2o-go/model"
)

func RunCronJobs(db *gorm.DB) {
	scheduler := gocron.NewScheduler(time.UTC)

	_, job01Err := scheduler.Cron("*/15 * * * *").Do(func() {

		var u model.User

		res1 := db.Model(&model.User{}).First(&u)

		common.CheckError(res1.Error)

		userGages := u.GetUSGSGages(db)

		if len(userGages) == 0 {
			log.Println("No bookmarked gages")
			return
		}

		latestReadings := gage.GetEnabledGageReadings(userGages, db)

		alert.CheckImmediateAlerts(&latestReadings, db)

	})

	common.CheckError(job01Err)

	_, job02Err := scheduler.Cron("*/5 * * * *").Do(func() {
		alert.CheckDailyAlerts(db)
	})

	common.CheckError(job02Err)

	_, job03Err := scheduler.Cron("*/60 * * * *").Do(func() {
		auckland.Run(db)
		chile.Run(db)
		canada.Run(db)
	})

	common.CheckError(job03Err)

	scheduler.StartAsync()
}
