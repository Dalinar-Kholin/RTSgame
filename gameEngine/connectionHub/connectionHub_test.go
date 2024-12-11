package connectionHub

import (
	"errors"
	"testing"
)

func nonExistingId() (err error) {
	ch := Hub.GetChan(69)
	if ch != nil {
		return errors.New("bad id return existing channel")
	}
	return
}

func TestConnectionHub_GetChan(t *testing.T) {
	if nonExistingId() != nil {
		t.Error("bad Id returns existing channel")
	}
}
