package main

import (
	"github.com/gin-gonic/gin"
)

func main() {

	r := gin.Default()

	r.Static("/assets", "./front/dist/assets")

	// Obsługa głównego pliku index.html
	r.StaticFile("/", "./front/dist/index.html")

	// Obsługa aplikacji typu SPA - przekierowanie wszystkich nieznalezionych ścieżek do index.html
	r.NoRoute(func(c *gin.Context) {
		c.File("./front/dist/index.html")
	})

	r.Run("essa.com:80")
}
