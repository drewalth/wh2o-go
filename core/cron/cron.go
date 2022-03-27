package cron

import (
	"fmt"
	"time"
	"wh2o-next/core/alerts"
	"wh2o-next/core/gages"
	"wh2o-next/core/notify"

	"github.com/go-co-op/gocron"
	"gorm.io/gorm"
)

func InitializeCronJobs(db *gorm.DB) {
	s := gocron.NewScheduler(time.UTC)

	s.Every(15).Minutes().Do(func() {

		// do gage reading work
		userGages := gages.GetUserGages(db)

		if len(userGages) == 0 {
			fmt.Println("No Gages :/ ")
			return
		}

		gageData := gages.FetchGageReadings(db, userGages)
		formattedReadings := gages.FormatUSGSData(gageData, userGages)

		gages.DeleteStaleReadings(db)
		gages.SaveGageReadings(db, formattedReadings, userGages)
		gages.UpdateGageLatestReading(db, formattedReadings, userGages)

		userAlerts := alerts.LoadImmediateAlerts(db)

		if len(userAlerts) == 0 {
			fmt.Println("No Immediate Alerts")
			return
		}

		notify.CheckLatestReadings(formattedReadings, userAlerts, db)

	})

	s.Every(30).Seconds().Do(func() {

		dailyReports := alerts.LoadDailyAlerts(db)

		if len(dailyReports) == 0 {

			fmt.Println("No Daily Reports")
			return
		}

		notify.CheckDailyReports(dailyReports, db)

	})

	s.StartAsync()
}
