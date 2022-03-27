package notify

import (
	"context"
	"fmt"
	"log"
	"time"
	"wh2o-next/core/alerts"
	"wh2o-next/core/gages"
	"wh2o-next/core/user"

	"github.com/mailgun/mailgun-go/v4"
	"gorm.io/gorm"
)

// https://www.twilio.com/docs/libraries/go

func SendSMS(alert alerts.Alert) {

	fmt.Println(alert)

}

// https://github.com/mailgun/mailgun-go

func SendEmail(alert alerts.Alert, db *gorm.DB) {

	var user user.User
	db.First(&user)

	fmt.Println("user", user)

	mg := mailgun.NewMailgun(user.MailgunDomain, user.MailgunKey)
	sender := "sender@example.com"
	subject := "Fancy subject!"
	body := "Hello from Mailgun Go!"
	recipient := user.Email

	// The message object allows you to add attachments and Bcc recipients
	message := mg.NewMessage(sender, subject, body, recipient)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	// Send the message with a 10 second timeout
	resp, id, err := mg.Send(ctx, message)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("ID: %s Resp: %s\n", id, resp)

}

func FilterGageReadings(readings []gages.GageReading, gageId int) []gages.GageReading {

	val := make([]gages.GageReading, 0)

	for _, reading := range readings {

		if int(reading.GageID) == gageId {
			val = append(val, reading)
		}

	}

	return val

}

func ReadingMeetsCriteria(reading gages.GageReading, alert alerts.Alert) bool {

	return (alert.Criteria == "above" && reading.Value > float64(alert.Value)) ||
		(alert.Criteria == "below" && reading.Value < float64(alert.Value)) ||
		(alert.Criteria == "between" && (reading.Value > float64(alert.Minimum) &&
			reading.Value < float64(alert.Maximum)))

}

func CheckLatestReadings(readings []gages.GageReading, alerts []alerts.Alert, db *gorm.DB) {

	for _, alert := range alerts {

		filteredReadings := FilterGageReadings(readings, int(alert.GageID))

		for _, reading := range filteredReadings {

			meetsCriteria := ReadingMeetsCriteria(reading, alert)

			if meetsCriteria {

				if alert.Channel == "email" {
					SendEmail(alert, db)
				}

				if alert.Channel == "sms" {
					SendSMS(alert)
				}

			}

		}

	}

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

// this should be reorganized
func UpdateAlertLastSent(db *gorm.DB, alert alerts.Alert) {

	db.Model(alert).Update("LastSent", time.Now())

}

// @see https://stackoverflow.com/questions/55093676/checking-if-current-time-is-in-a-given-interval-golang
func CheckDailyReports(reports []alerts.Alert, db *gorm.DB) {
	newLayout := "15:04"

	for _, r := range reports {
		notifyTime, _ := time.Parse("2006-01-02T15:04:05", r.NotifyTime)

		hoursDiff := time.Since(r.LastSent)

		now := time.Now()

		formattedNow := now.Format(newLayout)
		notifyTimeEnd := notifyTime.Add(time.Minute * 15) // add five minute window
		formattedTimeEnd := notifyTimeEnd.Format(newLayout)
		formattedNotifyTimeStart := notifyTime.Format(newLayout)

		// then parse again
		check, _ := time.Parse(newLayout, formattedNow)
		start, _ := time.Parse(newLayout, formattedNotifyTimeStart)
		end, _ := time.Parse(newLayout, formattedTimeEnd)

		isWithinTimeSpan := inTimeSpan(start, end, check)

		if isWithinTimeSpan && hoursDiff.Hours() >= 24 {

			SendEmail(r, db)

			var alert alerts.Alert = r
			db.Model(&alert).Update("LastSent", time.Now())
		}
	}
}
