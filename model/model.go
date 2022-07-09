package model

import (
	"gorm.io/gorm"
	"net/mail"
	"time"
	"wh2o-go/common"
)

type Metric string
type Source string
type Criteria string
type Interval string
type Channel string

const (
	FT                   Metric   = "FT"
	CFS                  Metric   = "CFS"
	TEMP                 Metric   = "TEMP"
	CMS                  Metric   = "CMS"
	M                    Metric   = "M"
	USGS                 Source   = "USGS"
	ENVIRONMENT_CANADA   Source   = "ENVIRONMENT_CANADA"
	ENVIRONMENT_AUCKLAND Source   = "ENVIRONMENT_AUCKLAND"
	ENVIRONMENT_CHILE    Source   = "ENVIRONMENT_CHILE"
	ABOVE                Criteria = "ABOVE"
	BELOW                Criteria = "BELOW"
	BETWEEN              Criteria = "BETWEEN"
	DAILY                Interval = "DAILY"
	IMMEDIATE            Interval = "IMMEDIATE"
	EMAIL                Channel  = "EMAIL"
	SMS                  Channel  = "SMS"
)

type Gage struct {
	ID        int       `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"required" json:"name" form:"name"`
	SiteId    string    `gorm:"unique" json:"siteId" form:"siteId"`
	State     string    `gorm:"required" json:"state" form:"state"`
	Metric    Metric    `gorm:"required" json:"metric" form:"metric"`
	Disabled  bool      `gorm:"default:false" json:"disabled" form:"form"`
	Source    Source    `gorm:"default:USGS" json:"source" form:"source"`
	Reading   float64   `json:"reading" form:"reading"`
	Country   string    `gorm:"default:US" json:"country"`
	UserID    uint      `json:"userId" form:"userId"`
	Readings  []Reading `json:"readings"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

func (g *Gage) IsStale() bool {
	diff := time.Since(g.UpdatedAt)
	return diff.Minutes() >= 30
}

func (g *Gage) IsUSGSGage() bool {
	return g.Source == USGS
}

// FilterReadings filters gage readings which belong to the gage
func (g *Gage) FilterReadings(readings []Reading) []Reading {
	val := make([]Reading, 0)
	for _, reading := range readings {
		if reading.SiteId == g.SiteId {
			val = append(val, reading)
		}
	}

	return val
}

// ShouldUpdateLatestReading because all of our gages are seeded with the default
// value for metric as CFS, sometimes we miss an update. If the USGS
// does not return a reading that matches the gage metric, check to
// see if a reading for FT was given.
//
// @todo update gage primary metric
func (g *Gage) ShouldUpdateLatestReading(r Reading) bool {
	if r.Metric == g.Metric {
		return true
	}

	diff := time.Since(g.UpdatedAt)

	return diff.Minutes() >= 15 && (r.Metric == FT || r.Metric == M)
}

type Reading struct {
	ID        uint      `gorm:"primaryKey"`
	SiteId    string    `gorm:"required" json:"siteId"`
	Value     float64   `gorm:"required" json:"value"`
	Metric    Metric    `gorm:"required" json:"metric"`
	GageID    int       `gorm:"required" json:"gageId"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

type Alert struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Name       string    `gorm:"unique" json:"name" form:"name"`
	Active     bool      `gorm:"default:true" json:"active" form:"active"`
	Minimum    float64   `json:"minimum" form:"minimum"`
	Maximum    float64   `json:"maximum" form:"maximum"`
	Criteria   Criteria  `json:"criteria" form:"criteria"`
	Channel    Channel   `json:"channel" form:"channel"`
	Interval   Interval  `json:"interval" form:"interval"`
	Metric     Metric    `json:"metric" form:"metric"`
	Value      float64   `json:"value" form:"value"`
	GageID     int       `json:"gageId" form:"gageId"`
	UserID     int       `json:"userId" form:"userId"`
	LastSent   time.Time `json:"lastSent"`
	NotifyTime string    `json:"notifyTime" form:"notifyTime"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

func (alert *Alert) ReadingMeetsCriteria(reading Reading) bool {

	if reading.Metric != alert.Metric {
		return false
	}

	return (alert.Criteria == ABOVE && reading.Value > alert.Value) ||
		(alert.Criteria == BELOW && reading.Value < alert.Value) ||
		(alert.Criteria == BETWEEN && (reading.Value > alert.Minimum &&
			reading.Value < alert.Maximum))
}

func (alert *Alert) IsStale() bool {
	immediateThreshold := 12.0
	dailyThreshold := 24.0
	hoursSinceLastSent := time.Since(alert.LastSent).Hours()

	if alert.Interval == IMMEDIATE {
		return hoursSinceLastSent >= immediateThreshold
	}
	return hoursSinceLastSent >= dailyThreshold
}

type User struct {
	ID                    int       `gorm:"primaryKey" json:"id"`
	MailgunKey            string    `json:"mailgunKey"`
	MailgunDomain         string    `json:"mailgunDomain"`
	Email                 string    `json:"email"`
	Timezone              string    `json:"timezone"`
	Telephone             string    `json:"telephone"`
	TwilioAccountSID      string    `json:"twilioAccountSID"`
	TwilioAuthToken       string    `json:"twilioAuthToken"`
	TwilioPhoneNumberTo   string    `json:"twilioPhoneNumberTo"`
	TwilioPhoneNumberFrom string    `json:"twilioPhoneNumberFrom"`
	Alerts                []Alert   `json:"alerts"`
	Gages                 []Gage    `json:"gages"`
	CreatedAt             time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt             time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

func (u *User) EmailIsValid() bool {
	_, err := mail.ParseAddress(u.Email)

	return err == nil
}

func (u *User) GetUSGSGages(db *gorm.DB) []Gage {
	var gages []Gage

	res := db.Model(&Gage{}).Where("user_id = ? AND source = ?", u.ID, USGS).Find(&gages)

	common.CheckError(res.Error)

	return gages
}
