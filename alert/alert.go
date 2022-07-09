package alert

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"log"
	"net/http"
	"time"
	"wh2o-go/common"
	"wh2o-go/gage"
	"wh2o-go/model"
	"wh2o-go/notify"
)

func CheckImmediateAlerts(readings *[]model.Reading, db *gorm.DB) {
	var alerts []model.Alert

	result := db.Where("interval = ? AND active = ?", model.IMMEDIATE, true).Find(&alerts)

	common.CheckError(result.Error)

	if len(alerts) == 0 {
		log.Println("No immediate alerts")
		return
	}

	checkReadings(readings, alerts, db)
}

func checkReadings(readings *[]model.Reading, alerts []model.Alert, db *gorm.DB) {

	for _, alert := range alerts {

		var g model.Gage
		result := db.Find(&g, alert.GageID)

		common.CheckError(result.Error)

		filteredReadings := g.FilterReadings(*readings)

		for _, reading := range filteredReadings {

			if alert.IsStale() && alert.ReadingMeetsCriteria(reading) {

				if alert.Channel == model.EMAIL {
					notify.Email(notify.EmailDto{
						Subject:   "",
						Body:      "",
						Recipient: "",
					})
				}

			}
		}
	}
}

func CheckDailyAlerts(db *gorm.DB) {

	newLayout := "15:04"
	var alerts []model.Alert

	result := db.Model(&model.Alert{}).Where("interval = ?", model.DAILY).Find(&alerts)

	common.CheckError(result.Error)

	if len(alerts) == 0 {
		log.Println("No Daily alerts")
		return
	}

	for _, r := range alerts {

		// @TODO include user timezone in the initial loadAlerts query
		var u model.User
		dbResult := db.Where("id = ?", r.UserID).Find(&u)

		common.CheckError(dbResult.Error)
		setTimezone(u.Timezone)

		notifyTime, _ := time.Parse("2006-01-02T15:04:05", r.NotifyTime)

		now := time.Now()

		formattedNow := now.Format(newLayout)
		notifyTimeEnd := notifyTime.Add(time.Minute * 30)
		formattedTimeEnd := notifyTimeEnd.Format(newLayout)
		formattedNotifyTimeStart := notifyTime.Format(newLayout)

		// then parse again
		check, _ := time.Parse(newLayout, formattedNow)
		start, _ := time.Parse(newLayout, formattedNotifyTimeStart)
		end, _ := time.Parse(newLayout, formattedTimeEnd)

		isWithinTimeSpan := inTimeSpan(start, end, check)

		if isWithinTimeSpan && r.IsStale() {

			if len(u.Gages) > 0 {

				staleGages := make([]model.Gage, 0)

				for _, g := range u.Gages {
					if g.IsUSGSGage() && g.IsStale() {
						staleGages = append(staleGages, g)
					}
				}

				if len(staleGages) > 0 {
					//readings := fetch.GetEnabledUSGSGageReadings(staleGages, db)
					//go func(r []model.GageReading) {
					//	alert.CheckImmediateAlerts(&r, db)
					//}(readings)

					readings := gage.GetEnabledGageReadings(staleGages, db)

					go func(re []model.Reading) {
						CheckImmediateAlerts(&re, db)
					}(readings)
				}
			}
			//
			//notify.Send(r, db)
		}
	}
}

// setTimezone
// Used to set the time package time zone to
// that of the user to check notification delivery times
func setTimezone(input string) {
	loc, err := time.LoadLocation(input)
	// handle err
	common.CheckError(err)
	time.Local = loc // -> this is setting the global timezone
}

func inTimeSpan(start, end, check time.Time) bool {
	if start.Before(end) {
		return !check.Before(start) && !check.After(end)
	}
	if start.Equal(end) {
		return check.Equal(start)
	}
	return !start.After(check) || !end.Before(check)
}

func GetAll(c *gin.Context) {

	var a []model.Alert

	db := common.GetDB(c)

	res := db.Model(model.Alert{}).Find(&a)

	common.CheckError(res.Error)

	c.JSON(http.StatusOK, a)

}

func Create(c *gin.Context) {
	var a model.Alert

	if c.ShouldBind(&a) == nil {

		if !createUpdateInputValid(a) {
			c.JSON(http.StatusBadRequest, "Bad request")
			return
		}

		db := common.GetDB(c)

		// this is v ugly
		res := db.Model(model.Alert{}).Clauses(clause.Returning{}).Create(&model.Alert{
			Name:       a.Name,
			Maximum:    a.Maximum,
			Minimum:    a.Minimum,
			Value:      a.Value,
			NotifyTime: a.NotifyTime,
			Metric:     a.Metric,
			Channel:    a.Channel,
			Interval:   a.Interval,
			Criteria:   a.Criteria,
			UserID:     a.UserID,
			GageID:     a.GageID,
			LastSent:   time.Now().Add(-1 * (time.Hour * 48)),
		})

		common.CheckError(res.Error)

		c.JSON(http.StatusOK, a)

	} else {
		c.JSON(http.StatusBadRequest, "Bad request")
	}
}

func Update(c *gin.Context) {
	var a model.Alert

	if c.ShouldBind(&a) == nil {

		if !createUpdateInputValid(a) {
			c.JSON(http.StatusBadRequest, "Bad request")
			return
		}

		db := common.GetDB(c)

		res := db.Model(model.Alert{}).Where("id = ?", a.ID).Clauses(clause.Returning{}).Updates(a)

		common.CheckError(res.Error)

		c.JSON(http.StatusOK, a)

	} else {
		c.JSON(http.StatusBadRequest, "Bad request")
	}
}

func Delete(c *gin.Context) {
	var a struct {
		ID int `uri:"id"`
	}

	if c.ShouldBindUri(&a) == nil {

		db := common.GetDB(c)

		res := db.Where("id = ?", a.ID).Delete(model.Alert{})

		common.CheckError(res.Error)

		c.JSON(http.StatusOK, "Alert deleted")

	} else {
		c.JSON(http.StatusBadRequest, "Bad request")
	}
}

// createUpdateInputValid
// verifies that the inputs for create and update
// operations are valid
func createUpdateInputValid(a model.Alert) bool {

	if a.Criteria == model.BETWEEN && a.Minimum > a.Maximum {
		return false
	}

	if a.Criteria == model.BETWEEN && (a.Minimum == 0 || a.Maximum == 0) {
		return false
	}

	if a.Interval == model.IMMEDIATE && (a.Criteria == model.ABOVE || a.Criteria == model.BELOW) && a.Value == 0 {
		return false
	}

	return true

}
