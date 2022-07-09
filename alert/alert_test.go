package alert

import (
	"testing"
	"time"
	"wh2o-go/model"
)

func TestReadingMeetsCriteria(t *testing.T) {

	specs := []struct {
		description  string
		inputReading model.Reading
		inputAlert   model.Alert
		exp          bool
	}{
		{
			description: "reading meets criteria if reading value below alert value when alert criteria is BELOW",
			inputAlert: model.Alert{
				ID:         1,
				Name:       "foo",
				Active:     true,
				Minimum:    0,
				Maximum:    0,
				Criteria:   "BELOW",
				Channel:    "",
				Interval:   "",
				Metric:     "CFS",
				Value:      500,
				GageID:     0,
				UserID:     0,
				LastSent:   time.Time{},
				NotifyTime: "",
				CreatedAt:  time.Time{},
				UpdatedAt:  time.Time{},
			},
			inputReading: model.Reading{
				ID:        1,
				SiteId:    "12345",
				Value:     100,
				Metric:    "CFS",
				GageID:    0,
				CreatedAt: time.Time{},
				UpdatedAt: time.Time{},
			},
			exp: true,
		},
		{
			description: "reading does not meet criteria if reading value above alert value when alert criteria BELOW",
			inputAlert: model.Alert{
				ID:         1,
				Name:       "foo",
				Active:     true,
				Minimum:    0,
				Maximum:    0,
				Criteria:   "BELOW",
				Channel:    "",
				Interval:   "",
				Metric:     "CFS",
				Value:      500,
				GageID:     0,
				UserID:     0,
				LastSent:   time.Time{},
				NotifyTime: "",
				CreatedAt:  time.Time{},
				UpdatedAt:  time.Time{},
			},
			inputReading: model.Reading{
				ID:        1,
				SiteId:    "12345",
				Value:     600,
				Metric:    "CFS",
				GageID:    0,
				CreatedAt: time.Time{},
				UpdatedAt: time.Time{},
			},
			exp: false,
		},
		{
			description: "reading meets criteria if reading value above alert value when alert criteria ABOVE",
			inputAlert: model.Alert{
				ID:         1,
				Name:       "foo",
				Active:     true,
				Minimum:    0,
				Maximum:    0,
				Criteria:   "ABOVE",
				Channel:    "",
				Interval:   "",
				Metric:     "CFS",
				Value:      500,
				GageID:     0,
				UserID:     0,
				LastSent:   time.Time{},
				NotifyTime: "",
				CreatedAt:  time.Time{},
				UpdatedAt:  time.Time{},
			},
			inputReading: model.Reading{
				ID:        1,
				SiteId:    "12345",
				Value:     600,
				Metric:    "CFS",
				GageID:    0,
				CreatedAt: time.Time{},
				UpdatedAt: time.Time{},
			},
			exp: true,
		},
		{
			description: "reading does not meet criteria if reading value below alert value when alert criteria ABOVE",
			inputAlert: model.Alert{
				ID:         1,
				Name:       "foo",
				Active:     true,
				Minimum:    0,
				Maximum:    0,
				Criteria:   "ABOVE",
				Channel:    "",
				Interval:   "",
				Metric:     "CFS",
				Value:      500,
				GageID:     0,
				UserID:     0,
				LastSent:   time.Time{},
				NotifyTime: "",
				CreatedAt:  time.Time{},
				UpdatedAt:  time.Time{},
			},
			inputReading: model.Reading{
				ID:        1,
				SiteId:    "12345",
				Value:     400,
				Metric:    "CFS",
				GageID:    0,
				CreatedAt: time.Time{},
				UpdatedAt: time.Time{},
			},
			exp: false,
		},
		{
			description: "readings does not meet criteria if reading metric does not equal alert metric",
			inputAlert: model.Alert{
				ID:         1,
				Name:       "foo",
				Active:     true,
				Minimum:    0,
				Maximum:    0,
				Criteria:   "ABOVE",
				Channel:    "",
				Interval:   "",
				Metric:     "FT",
				Value:      500,
				GageID:     0,
				UserID:     0,
				LastSent:   time.Time{},
				NotifyTime: "",
				CreatedAt:  time.Time{},
				UpdatedAt:  time.Time{},
			},
			inputReading: model.Reading{
				ID:        1,
				SiteId:    "12345",
				Value:     400,
				Metric:    "CFS",
				GageID:    0,
				CreatedAt: time.Time{},
				UpdatedAt: time.Time{},
			},
			exp: false,
		},
		{
			description: "reading does not meet criteria if reading value not between alert min and max when alert criteria BETWEEN",
			inputAlert: model.Alert{
				ID:         1,
				Name:       "foo",
				Active:     true,
				Minimum:    100,
				Maximum:    500,
				Criteria:   "BETWEEN",
				Channel:    "",
				Interval:   "",
				Metric:     "FT",
				Value:      0,
				GageID:     0,
				UserID:     0,
				LastSent:   time.Time{},
				NotifyTime: "",
				CreatedAt:  time.Time{},
				UpdatedAt:  time.Time{},
			},
			inputReading: model.Reading{
				ID:        1,
				SiteId:    "12345",
				Value:     600,
				Metric:    "CFS",
				GageID:    0,
				CreatedAt: time.Time{},
				UpdatedAt: time.Time{},
			},
			exp: false,
		},
		{
			description: "reading meets criteria if reading value between alert min and max when alert criteria BETWEEN",
			inputAlert: model.Alert{
				ID:         1,
				Name:       "foo",
				Active:     true,
				Minimum:    100,
				Maximum:    500,
				Criteria:   "BETWEEN",
				Channel:    "",
				Interval:   "",
				Metric:     "FT",
				Value:      0,
				GageID:     0,
				UserID:     0,
				LastSent:   time.Time{},
				NotifyTime: "",
				CreatedAt:  time.Time{},
				UpdatedAt:  time.Time{},
			},
			inputReading: model.Reading{
				ID:        1,
				SiteId:    "12345",
				Value:     400,
				Metric:    "FT",
				GageID:    0,
				CreatedAt: time.Time{},
				UpdatedAt: time.Time{},
			},
			exp: true,
		},
	}

	for specIndex, spec := range specs {

		if got := spec.inputAlert.ReadingMeetsCriteria(spec.inputReading); got != spec.exp {
			t.Errorf("[spec %d: %s] expected to get %t; got %t", specIndex, spec.description, spec.exp, got)
		}

	}

}

func TestCreateUpdateInputsValid(t *testing.T) {
	specs := []struct {
		desc  string
		input model.Alert
		exp   bool
	}{
		{
			desc: "missing between values",
			input: model.Alert{
				Criteria: model.BETWEEN,
				Minimum:  0,
				Maximum:  100,
			},
			exp: false,
		},
		{
			desc: "missing between values",
			input: model.Alert{
				Criteria: model.BETWEEN,
				Minimum:  100,
				Maximum:  10,
			},
			exp: false,
		},
		{
			desc: "missing between values",
			input: model.Alert{
				Criteria: model.BETWEEN,
				Minimum:  100,
				Maximum:  10000,
			},
			exp: true,
		},
	}

	for specIdx, spec := range specs {
		if got := createUpdateInputValid(spec.input); got != spec.exp {
			t.Errorf("[spec %d: %s] expected to get %t; got %t", specIdx, spec.desc, spec.exp, got)
		}
	}
}
