package main

import (
	"encoding/binary"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"sync/atomic"
	"time"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

/*ICOM teoretycznie fajnie by było mieć jedne wątek słuchający na sokecie */

type Chuj struct {
	Len  int    `json:"length"`
	Id   int    `json:"id"`
	Name string `json:"chuj"`
}

func (chuj *Chuj) toUint8() (res []uint8) {
	res = make([]uint8, 4+4+len(chuj.Name))
	binary.BigEndian.PutUint32(res, uint32(chuj.Len))
	binary.BigEndian.PutUint32(res[4:], uint32(chuj.Id))
	for i, c := range chuj.Name {
		res[8+i] = uint8(c)
	}
	return
}

func main() {

	r := gin.Default()

	r.Static("/assets", "./front/dist/assets")

	// Obsługa głównego pliku index.html
	r.StaticFile("/", "./front/dist/index.html")

	// Obsługa aplikacji typu SPA - przekierowanie wszystkich nieznalezionych ścieżek do index.html
	r.NoRoute(func(c *gin.Context) {
		c.File("./front/dist/index.html")
	})

	var socketPool atomic.Int32
	socketPool.Add(0)

	r.GET("/socketOne", func(c *gin.Context) {
		i := 0
		socketPool.Add(1)
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			return
		}
		defer func() {
			socketPool.Add(-1)
			conn.Close()
		}()
		for {

			err = conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("essa %d", i)))
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
					fmt.Printf("connection is Closed")
					return
				}
				fmt.Printf("error := %v\n", err.Error())
				return
			}
			i += 1
			time.Sleep(time.Second)
		}
	})
	r.GET("/socketTwo", func(c *gin.Context) {
		socketPool.Add(1)
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			return
		}
		defer func() {
			conn.Close()
			socketPool.Add(-1)
		}()

		propData := Chuj{Id: 1069, Len: 5, Name: "essa"}
		_ = propData
		conn.WriteMessage(websocket.BinaryMessage, propData.toUint8())
		resType, data, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				fmt.Printf("connection is Closed")
				return
			}
			fmt.Printf("error := %v\n", err.Error())
			return
		}
		if resType != websocket.TextMessage {
			panic(fmt.Sprintf("chuj %v", resType))
		}
		fmt.Printf("data := %s", data)
	})

	api := r.Group("/api")
	{
		api.GET("/socketPool", func(context *gin.Context) {
			context.JSON(200, gin.H{
				"socketPool": socketPool.Load(),
			})
		})
		api.GET("/essa", func(context *gin.Context) {
			context.JSON(200, gin.H{
				"essa": "pogger",
			})
		})
	}

	r.Run("127.0.0.1:80")
}
