package database

import (
	"log"
	"time"
	gages "wh2o-next/core/gages"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const databaseFile = "db.sqlite"

func Database() gin.HandlerFunc {

	db, err := gorm.Open(sqlite.Open(databaseFile), &gorm.Config{})

	if err != nil {
		panic("failed to connect database")
	}

	return func(c *gin.Context) {

		t := time.Now()

		c.Set("Database", db)

		c.Next()

		latency := time.Since(t)
		log.Print(latency)

	}
}

func InitializeDatabase() *gorm.DB {

	db, err := gorm.Open(sqlite.Open(databaseFile), &gorm.Config{})

	if err != nil {
		panic("failed to connect database")
	}

	db.AutoMigrate(&gages.Gage{})
	return db
}
