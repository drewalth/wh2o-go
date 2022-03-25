package database

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Product struct {
	gorm.Model
	Code  string
	Price uint
}

type Gage struct {
	gorm.Model
	Name    string
	SiteId  string
	Reading int
}

const databaseFile = "db.sqlite"

func InitializeDatabase() {

	db, err := gorm.Open(sqlite.Open(databaseFile), &gorm.Config{})

	if err != nil {
		panic("failed to connect database")
	}

	db.AutoMigrate(&Gage{})

	db.Create(&Gage{Name: "foo gage", SiteId: "100", Reading: 0})

}

func FindProduct() Product {
	db, err := gorm.Open(sqlite.Open(databaseFile), &gorm.Config{})

	if err != nil {
		panic("failed to connect database")
	}

	var product Product
	db.First(&product)

	return product
}

func FindGages() []Gage {
	db, err := gorm.Open(sqlite.Open(databaseFile), &gorm.Config{})

	if err != nil {
		panic("failed to connect database")
	}

	var gages []Gage
	db.Find(&gages)

	return gages
}
