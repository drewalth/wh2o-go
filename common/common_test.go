package common

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestCheckError(t *testing.T) {
	err := fmt.Errorf("some error")

	assert.Panics(t, func() {
		CheckError(err)
	})

}
