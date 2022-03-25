package cron

import (
	"time"
	"wh2o-next/core/gages"

	"github.com/go-co-op/gocron"
)

func InitializeCronJobs() {
	s := gocron.NewScheduler(time.UTC)

	s.Every(5).Minutes().Do(func() {

		gages.FetchGageReadings()

	})

	s.StartAsync()
}
