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
	"wh2o-go/alert"
	"wh2o-go/export"
	"wh2o-go/lib"

	"wh2o-go/cron"
	"wh2o-go/database"
	"wh2o-go/gage"
	"wh2o-go/user"

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

	embeddedClient := EmbedFolder(reactStatic, "client/build", true)

	router.Use(static.Serve("/", embeddedClient))

	// Temp solution for 404 when trying to navigate
	// directly to /settings or /exporter
	// @see https://stackoverflow.com/questions/69462376/serving-react-static-files-in-golang-gin-gonic-using-goembed-giving-404-error-o
	router.NoRoute(func(c *gin.Context) {
		c.Redirect(http.StatusFound, "/")
	})

	db := database.Connect()

	cron.RunCronJobs(db)

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

		api.GET("/gages", gage.GetAll)
		api.GET("/gage-sources/:country/:state", gage.GetSources)
		api.POST("/gages", gage.Create)
		api.PUT("/gages", gage.Update)
		api.DELETE("/gages/:id", gage.Delete)

		api.GET("/alerts", alert.GetAll)
		api.POST("/alerts", alert.Create)
		api.PUT("/alerts", alert.Update)
		api.DELETE("/alerts/:id", alert.Delete)

		api.GET("/user/:id", user.GetUser)
		api.PUT("/user", user.Update)

		api.GET("/export", export.DataOut)
		api.POST("/import", export.DataIn)

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
