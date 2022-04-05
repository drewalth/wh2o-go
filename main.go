package main

import (
	"context"
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"wh2o-next/core/alerts"
	cron "wh2o-next/core/cron"
	"wh2o-next/core/exporter"
	gages "wh2o-next/core/gages"
	"wh2o-next/core/lib"
	"wh2o-next/core/user"
	database "wh2o-next/database"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Database(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	}
}

//go:embed client/build
var reactStatic embed.FS

type embedFileSystem struct {
	http.FileSystem
	indexes bool
}

func (e embedFileSystem) Exists(prefix string, path string) bool {
	f, err := e.Open(path)
	if err != nil {
		return false
	}

	// check if indexing is allowed
	s, _ := f.Stat()
	if s.IsDir() && !e.indexes {
		return false
	}

	return true
}

func EmbedFolder(fsEmbed embed.FS, targetPath string, index bool) static.ServeFileSystem {
	subFS, err := fs.Sub(fsEmbed, targetPath)
	if err != nil {
		panic(err)
	}
	return embedFileSystem{
		FileSystem: http.FS(subFS),
		indexes:    index,
	}
}

func main() {

	// Create context that listens for the interrupt signal from the OS.
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	port := os.Getenv("PORT")

	if port == "" {
		port = "3000"
	}

	router := gin.Default()

	fs := EmbedFolder(reactStatic, "client/build", true)

	router.Use(static.Serve("/", fs))

	// Temp solution for 404 when trying to navigate
	// directly to /settings or /exporter
	// @see https://stackoverflow.com/questions/69462376/serving-react-static-files-in-golang-gin-gonic-using-goembed-giving-404-error-o
	router.NoRoute(func(c *gin.Context) {
		c.Redirect(http.StatusFound, "/")
	})

	db := database.InitializeDatabase()

	cron.InitializeCronJobs(db)
	// add db to gin context
	router.Use(Database(db))

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8080", "*"},
		AllowMethods:     []string{"PUT", "POST", "GET", "DELETE"},
		AllowHeaders:     []string{"Origin"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := router.Group("/api")
	{

		api.GET("/gages", gages.HandleGetGages)
		api.GET("/gage-sources/:state", gages.HandleGetGageSources)
		api.POST("/gages", gages.HandleCreateGage)
		api.PUT("/gages", gages.HandleUpdateGage)
		api.DELETE("/gages/:id", gages.HandleDeleteGage)

		api.GET("/alerts", alerts.HandleGetAlerts)
		api.POST("/alerts", alerts.HandleCreateAlert)
		api.PUT("/alerts", alerts.HandleUpdateAlert)
		api.DELETE("/alerts/:id", alerts.HandleDeleteAlert)

		api.GET("/user/:id", user.HandleGetSettings)
		api.PUT("/user", user.HandleUpdateUserSettings)

		api.GET("/export", exporter.ExportAllData)
		api.POST("/import", exporter.ImportData)

		api.GET("/lib/states", lib.GetUsStates)
		api.GET("/lib/tz", lib.GetTimezones)
	}

	srv := &http.Server{
		Addr:    ":3000",
		Handler: router,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	<-ctx.Done()

	stop()
	log.Println("shutting down gracefully, press Ctrl+C again to force")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown: ", err)
	}

	log.Println("Server exiting")

}
