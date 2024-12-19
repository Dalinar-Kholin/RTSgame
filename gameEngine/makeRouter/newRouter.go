package makeRouter

import (
	"context"
	"encoding/binary"
	"fmt"
	"gameEngine/connectionHub"
	"gameEngine/newGameEndpoints"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"strconv"
	"sync/atomic"
	"time"
)

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

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func NewRouter() *gin.Engine {
	r := gin.Default()
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "http://essa.com")
	})
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		panic(err)
	}

	cfg.Region = "eu-central-1"
	svc := dynamodb.NewFromConfig(cfg)

	_, err = svc.DescribeTable(context.TODO(), &dynamodb.DescribeTableInput{
		TableName: aws.String("Games"),
	})
	if err != nil {
		panic(err)
		log.Fatalf("unable to connect to DynamoDB or describe table, %v", err)
	}
	gameEndpoint := newGameEndpoints.GameEndpoints{
		Svc: svc,
	}

	var socketPool atomic.Int32
	socketPool.Store(0)

	r.GET("/commSocket", func(c *gin.Context) {
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			fmt.Printf("error in making connection with socket := %v\n", err.Error())
			return
		}
		id, err := strconv.Atoi(c.Request.URL.Query().Get("id"))
		if err != nil {
			conn.Close()
			return
		}
		connectionHub.Hub.RegisterNewConnection(conn, int32(id))
	})

	r.GET("/newGame", gameEndpoint.NewGame)

	r.GET("/gamesToJoin", gameEndpoint.GamesToJoin)

	r.GET("/joinGames", gameEndpoint.JoinGame)

	r.GET("/socketTwo", func(c *gin.Context) {
		socketPool.Add(1)
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			return
		}
		// jeden wątek chce słuchać
		go func() {
			defer func() {
				conn.Close()
				socketPool.Add(-1)
			}()
			for {
				_, _, err := conn.ReadMessage()
				if err != nil {
					if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
						fmt.Printf("connection is Closed")
						return
					}
					fmt.Printf("error := %v\n", err.Error())
					return
				}
				//fmt.Printf("data := %v\n", data)
			}
		}()
		go func() {
			packetNumber := 0
			for {
				propData := Chuj{Id: packetNumber, Len: 5, Name: "essa"}
				conn.WriteMessage(websocket.BinaryMessage, propData.toUint8())
				time.Sleep(time.Second)
			}
		}()

		// drugi wątek chce nadawać
		// dlaczego nie można razem -> słuchanie jest blokujące + wysyłanie jest asynchroniczne

	})

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "gucci",
		})
	})

	return r
}
