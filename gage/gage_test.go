package gage

import (
	"testing"
	"wh2o-go/model"
)

func TestFilterGageReadings(t *testing.T) {
	mockReadings := []model.Reading{
		{
			ID:     1,
			SiteId: "123",
		},
		{
			ID:     2,
			SiteId: "123",
		},
		{
			ID:     3,
			SiteId: "345",
		},
	}

	specs := []struct {
		it       string
		readings []model.Reading
		gage     model.Gage
		exp      uint
	}{
		{
			it:       "should return a filtered list of gage readings",
			readings: mockReadings,
			exp:      1,
			gage: model.Gage{
				SiteId: "123",
			},
		},
		{
			it:       "should return a filtered list of gage readings",
			readings: mockReadings,
			exp:      3,
			gage: model.Gage{
				SiteId: "345",
			},
		},
	}

	for specIdx, spec := range specs {
		if got := spec.gage.FilterReadings(mockReadings); got[0].ID != spec.exp {
			t.Errorf("[spec %d: %s] expected to get %d; got %d", specIdx, spec.it, spec.exp, got[0].ID)
		}
	}

}
