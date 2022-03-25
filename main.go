package main

import (
	"log"
	"net/http"

	cron "wh2o-next/core/cron"
	gages "wh2o-next/core/gages"
	database "wh2o-next/database"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func Database(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	}
}

func main() {

	err := godotenv.Load(".env")

	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	cron.InitializeCronJobs()

	router := gin.Default()
	db := database.InitializeDatabase()
	// add db to gin context
	router.Use(Database(db))

	router.Use(static.Serve("/", static.LocalFile("./client/build", true)))
	// must be a better way to handle direct navigation to react router routes
	// wildcard?
	router.Use(static.Serve("/settings", static.LocalFile("./client/build", true)))

	api := router.Group("/api")
	{

		api.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"result": "yo",
			})
		})

		api.GET("/gages", gages.HandleGetGages)
		api.POST("/gages", gages.HandleCreateGage)
		api.PUT("/gages", gages.HandleUpdateGage)
		api.DELETE("/gages/:id", gages.HandleDeleteGage)

	}

	router.Run(":3000")

}
