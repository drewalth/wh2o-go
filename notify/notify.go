package notify

import (
	"fmt"
	"github.com/twilio/twilio-go"
	openapi "github.com/twilio/twilio-go/rest/api/v2010"
	"os"
	"wh2o-go/common"
)

type SMSDto struct {
	Name      string
	Criteria  string
	Value     float64
	Metric    string
	Telephone string
}

func SMS(dto SMSDto) {
	TwilioAccountSid := os.Getenv("TWILIO_ACCOUNT_SID")
	TwilioAuthToken := os.Getenv("TWILIO_AUTH_TOKEN")
	TwilioPhoneNumber := os.Getenv("TWILIO_PHONE_NUMBER")

	body := fmt.Sprintf(`%s is %s %g --- %s`, dto.Name, dto.Criteria, dto.Value, dto.Metric)

	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: TwilioAccountSid,
		Password: TwilioAuthToken,
	})

	params := &openapi.CreateMessageParams{}
	// phone number will need validation
	params.SetTo(dto.Telephone)
	params.SetFrom(TwilioPhoneNumber)
	params.SetBody(body)

	resp, err := client.Api.CreateMessage(params)
	if err != nil {
		common.CheckError(err)
		err = nil
	} else {

		fmt.Println("Message Sid: " + *resp.Sid)
	}

}
