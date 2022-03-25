package email

import (
	"fmt"
	"os"
)

func SendEmail() {

	mailgunKey := os.Getenv("MAILGUN_KEY")

	fmt.Println("Mailgun Key: ", mailgunKey)

}
