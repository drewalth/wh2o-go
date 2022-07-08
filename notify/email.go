package notify

import (
	"bytes"
	"context"
	"embed"
	"fmt"
	"github.com/mailgun/mailgun-go/v4"
	"html/template"
	"log"
	"os"
	"time"
	"wh2o-go/common"
	"wh2o-go/model"
)

type EmailDto struct {
	Subject   string
	Body      string
	Recipient string
}

// FormattedGage
// used for rendering only pertinent info in flow-report email
type FormattedGage struct {
	ID        int
	Name      string
	State     string
	Metric    model.Metric
	Reading   float64
	Disabled  bool
	UpdatedAt string
}

//go:embed templates/*
var f embed.FS

func Email(dto EmailDto) {
	MailgunDomain := os.Getenv("MAILGUN_DOMAIN")
	MailgunKey := os.Getenv("MAILGUN_KEY")

	if MailgunKey == "" || MailgunDomain == "" {
		log.Fatal("No Mailgun credentials provided")
	}

	mg := mailgun.NewMailgun(MailgunDomain, MailgunKey)
	sender := "no-reply@my-domain.com"
	subject := dto.Subject
	body := dto.Body
	recipient := dto.Recipient

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

func BuildHTML(gages []model.Gage, userTimezone string) string {
	formattedGages := make([]FormattedGage, 0)

	loc, locErr := time.LoadLocation(userTimezone)

	common.CheckError(locErr)

	for _, g := range gages {

		formattedGages = append(formattedGages, FormattedGage{
			ID:        g.ID,
			Name:      g.Name,
			State:     g.State,
			Metric:    g.Metric,
			Reading:   g.Reading,
			Disabled:  g.Disabled,
			UpdatedAt: g.UpdatedAt.In(loc).Format("01/02 @ 03:04 pm"),
		})

	}

	content := struct {
		Gages []FormattedGage
	}{
		Gages: formattedGages,
	}

	parsedTemplate, parseErr := template.ParseFS(f, "templates/flow-report.html")

	common.CheckError(parseErr)

	buf := new(bytes.Buffer)

	err := parsedTemplate.Execute(buf, content)

	common.CheckError(err)

	val := buf.String()

	return val
}
