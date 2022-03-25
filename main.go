package main

import (
	"log"
	"net/http"

	alerts "wh2o-next/server/alerts"
	"wh2o-next/server/cron"
	database "wh2o-next/server/database"
	"wh2o-next/server/email"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Load(".env")

	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	// todo share db in context
	database.InitializeDatabase()

	cron.InitializeCronJobs()

	router := gin.Default()

	router.Use(static.Serve("/", static.LocalFile("./client/build", true)))
	// must be a better way to handle direct navigation to react router routes
	// wildcard?
	router.Use(static.Serve("/settings", static.LocalFile("./client/build", true)))

	api := router.Group("/api")
	{

		api.GET("/", func(c *gin.Context) {

			email.SendEmail()

			c.JSON(http.StatusOK, gin.H{
				"result": alerts.AlertFindOne(2),
			})

		})

	}

	router.Run(":3000")

}
