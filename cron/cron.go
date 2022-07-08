package cron

import (
	"github.com/go-co-op/gocron"
	"gorm.io/gorm"
	"log"
	"time"
	"wh2o-go/alert"
	"wh2o-go/common"
	"wh2o-go/gage"
	"wh2o-go/model"
)

func RunCronJobs(db *gorm.DB) {
	scheduler := gocron.NewScheduler(time.UTC)

	_, job01Err := scheduler.Every(15).Minutes().Do(func() {

		var u model.User

		res1 := db.Model(&model.User{}).First(&u)

		common.CheckError(res1.Error)

		userGages := u.GetGages(db)

		if len(userGages) == 0 {
			log.Println("No bookmarked gages")
			return
		}

		latestReadings := gage.GetEnabledGageReadings(userGages, db)

		alert.CheckImmediateAlerts(&latestReadings, db)

	})

	common.CheckError(job01Err)

	_, job02Err := scheduler.Every(5).Minutes().Do(func() {
		alert.CheckDailyAlerts(db)
	})

	common.CheckError(job02Err)

	scheduler.StartAsync()
}
