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
	"github.com/twilio/twilio-go"
	openapi "github.com/twilio/twilio-go/rest/api/v2010"
	"gorm.io/gorm"
)

// https://www.twilio.com/docs/libraries/go
func SendSMS(alert alerts.Alert, db *gorm.DB) {
	var user user.User
	db.First(&user)

	var gage gages.Gage
	db.Find(&gage, alert.GageID)

	var reading gages.GageReading
	db.Where("metric = ? AND gage_id =?", alert.Metric, alert.GageID).Find(&reading)

	body := fmt.Sprintf(`%s --- %g %s`, gage.Name, reading.Value, reading.Metric)

	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: user.TwilioAccountSID,
		Password: user.TwilioAuthToken,
	})

	params := &openapi.CreateMessageParams{}
	params.SetTo(user.TwilioPhoneNumberTo)
	params.SetFrom(user.TwilioPhoneNumberFrom)
	params.SetBody(body)

	resp, err := client.ApiV2010.CreateMessage(params)
	if err != nil {
		fmt.Println(err.Error())
		err = nil
	} else {
		fmt.Println("Message Sid: " + *resp.Sid)
	}

}

// @todo add interval check: immediate vs daily
// https://github.com/mailgun/mailgun-go
func SendEmail(alert alerts.Alert, db *gorm.DB) {

	var user user.User
	db.First(&user)

	var gages []gages.Gage
	db.Find(&gages)

	mg := mailgun.NewMailgun(user.MailgunDomain, user.MailgunKey)
	sender := "no-reply@wh2o.us"
	subject := alert.Name
	body := BuildHTML(alert, gages)
	recipient := user.Email

	// The message object allows you to add attachments and Bcc recipients
	message := mg.NewMessage(sender, subject, "", recipient)

	message.SetHtml(body)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	// Send the message with a 10 second timeout
	resp, id, err := mg.Send(ctx, message)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("ID: %s Resp: %s\n", id, resp)

}

func FilterGageReadings(readings []gages.GageReading, gageSiteId string) []gages.GageReading {
	val := make([]gages.GageReading, 0)
	for _, reading := range readings {
		if reading.SiteId == gageSiteId {
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

		var gage gages.Gage
		db.Find(&gage, alert.GageID)

		filteredReadings := FilterGageReadings(readings, gage.SiteId)

		for _, reading := range filteredReadings {

			meetsCriteria := ReadingMeetsCriteria(reading, alert)
			hoursSince := time.Since(alert.LastSent)
			timeSinceThreshold := 6.0

			if hoursSince.Hours() >= timeSinceThreshold && meetsCriteria {

				var sent = false

				if alert.Channel == "email" {
					SendEmail(alert, db)
					sent = true
				}

				if alert.Channel == "sms" {
					SendSMS(alert, db)
					sent = true
				}

				if sent {
					db.Model(alert).Update("LastSent", time.Now())
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

func BuildHTMLTableRows(gages []gages.Gage) string {

	rows := ""

	for _, g := range gages {

		timestamp := g.UpdatedAt.Format(time.RFC822)

		rows += fmt.Sprintf(`
		<tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
				<td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; border-top-width: 1px; border-top-color: #eee; border-top-style: solid; margin: 0; padding: 8px 0;"
						valign="top">

						%s

				</td>
				<td class="alignright"
						style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; text-align: right; border-top-width: 1px; border-top-color: #eee; border-top-style: solid; margin: 0; padding: 8px 0;"
						align="right" valign="top">
						<div style="font-weight: bold; margin-bottom: 2px">
						
						%g

						%s
						
						</div>
						<div style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 8px;">
						
						%s

						</div>
				</td>
		</tr>
		`, g.Name, g.Reading, g.Metric, timestamp)

	}

	return rows
}

func BuildHTML(alert alerts.Alert, gages []gages.Gage) string {

	str1 := `
	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
			"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"
		style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
<head>
	<meta name="viewport" content="width=device-width"/>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
	<title>wh2o flow report</title>
	<style type="text/css">
			img {
					max-width: 100%;
			}
			body {
					-webkit-font-smoothing: antialiased;
					-webkit-text-size-adjust: none;
					width: 100% !important;
					height: 100%;
					line-height: 1.6em;
			}
			body {
					background-color: #f6f6f6;
			}
			@media only screen and (max-width: 640px) {
					body {
							padding: 0 !important;
					}
					h1 {
							font-weight: 800 !important;
							margin: 20px 0 5px !important;
					}
					h2 {
							font-weight: 800 !important;
							margin: 20px 0 5px !important;
					}
					h3 {
							font-weight: 800 !important;
							margin: 20px 0 5px !important;
					}
					h4 {
							font-weight: 800 !important;
							margin: 20px 0 5px !important;
					}
					h1 {
							font-size: 22px !important;
					}
					h2 {
							font-size: 18px !important;
					}
					h3 {
							font-size: 16px !important;
					}
					.container {
							padding: 0 !important;
							width: 100% !important;
					}
					.content {
							padding: 0 !important;
					}
					.content-wrap {
							padding: 10px !important;
					}
					.invoice {
							width: 100% !important;
					}
			}
	</style>
</head>
<body itemscope itemtype="http://schema.org/EmailMessage"
		style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em; background-color: #f6f6f6; margin: 0;"
		bgcolor="#f6f6f6">
<table class="body-wrap"
		 style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; background-color: #f6f6f6; margin: 0;"
		 bgcolor="#f6f6f6">
	<tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
			<td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;"
					valign="top"></td>
			<td class="container" width="600"
					style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;"
					valign="top">
					<div class="content"
							 style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;">
							<table class="main" width="100%" cellpadding="0" cellspacing="0"
										 style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;"
										 bgcolor="#fff">
									<tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
											<td class="content-wrap aligncenter"
													style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; text-align: center; margin: 0; padding: 20px;"
													align="center" valign="top">
													<table width="100%" cellpadding="0" cellspacing="0"
																 style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
<!--                                <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">-->
<!--                                    <td class="content-block"-->
<!--                                        style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;"-->
<!--                                        valign="top">-->
<!--                                        <img src="https://wh2o-app.s3.us-west-1.amazonaws.com/wh2o-logo.svg" alt="wh2o logo"/>-->
<!--                                    </td>-->
<!--                                    <td class="content-block"-->
<!--                                        style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;"-->
<!--                                        align="left"-->
<!--                                        valign="top">-->
<!--                                    </td>-->
<!--                                </tr>-->
															<tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
																	<td class="content-block"
																			style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;"
																			valign="top">
																			<h2 class="aligncenter"
																					style="font-family: 'Helvetica Neue',Helvetica,Arial,'Lucida Grande',sans-serif; box-sizing: border-box; font-size: 24px; color: #000; line-height: 1.2em; font-weight: 400; text-align: center; margin: 40px 0 0;"
																					align="center">Flow Report</h2>
																	</td>
															</tr>
															<tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
																	<td class="content-block aligncenter"
																			style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; text-align: center; margin: 0; padding: 0 0 20px;"
																			align="center" valign="top">
																			<table class="invoice"
																						 style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; text-align: left; width: 98%; margin: 40px auto;">
																			<!--		<tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
																							<td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 5px 0;"
																									valign="top">
																									
																									Daily Report

																									<br
																											style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"/>
																											
																											Lorem Ipsum
																											
																											<br
																													style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"/>
																							</td>
																					</tr> -->
																					<tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
																							<td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 5px 0;"
																									valign="top">
																									<table class="invoice-items" cellpadding="0" cellspacing="0"
																												 style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; margin: 0;">`

	str2 := `<tr class="total"
																												 style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
																												 <td class="alignright" width="80%"
																														 style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; text-align: right; border-top-width: 1px; border-top-color: #eee; border-top-style: solid; border-bottom-color: #fff; border-bottom-width: 1px; border-bottom-style: solid; font-weight: 700; margin: 0; padding: 5px 0;"
																														 align="right" valign="top">&nbsp;
																												 </td>
																												 <td class="alignright"
																														 style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; text-align: right; border-top-width: 1px; border-top-color: #eee; border-top-style: solid; border-bottom-color: #fff; border-bottom-width: 1px; border-bottom-style: solid; font-weight: 700; margin: 0; padding: 5px 0;"
																														 align="right" valign="top">&nbsp;
																												 </td>
																										 </tr>
																								 </table>
																						 </td>
																				 </tr>
																		 </table>
																 </td>
														 </tr>
												<!--		 <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">
																 <td class="content-block aligncenter"
																		 style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; text-align: center; margin: 0; padding: 0 0 20px;"
																		 align="center" valign="top">
																 </td>
														 </tr> -->
												 </table>
										 </td>
								 </tr>
						 </table>
<!--                <div class="footer"-->
<!--                     style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; clear: both; color: #999; margin: 0; padding: 20px;">-->
<!--                    <table width="100%"-->
<!--                           style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">-->
<!--                        <tr style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;">-->
<!--                            <td class="aligncenter content-block"-->
<!--                                style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; vertical-align: top; color: #999; text-align: center; margin: 0; padding: 0 0 20px;"-->
<!--                                align="center" valign="top">Questions? Email <a href="mailto:"-->
<!--                                                                                style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; color: #999; text-decoration: underline; margin: 0;">info@wh2o.us</a>-->
<!--                            </td>-->
<!--                        </tr>-->
<!--                    </table>-->
<!--                </div>-->
				 </div>
		 </td>
		 <td style="font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;"
				 valign="top"></td>
 </tr>
</table>
</body>
</html>
 `

	return str1 + BuildHTMLTableRows(gages) + str2

}
