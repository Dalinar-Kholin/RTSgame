package newGameEndpoints_test

import (
	"encoding/json"
	"fmt"
	"gameEngine/ActionFrame"
	"gameEngine/connectionHub"
	"gameEngine/makeRouter"
	"github.com/go-playground/assert/v2"
	"github.com/gorilla/websocket"
	"net/http"
	"sync"
	"testing"
	"time"
)

//control flow tworzenia nowej gry jest taki że
//user0 - zakłada nowy pokój gry - inicjowane jest jego poołączenie z socketem
//user1 - inicjuje swoje połączenie z socketem
//user1 - dołącza do pokoju usera 0
//tworzone jest tunelowanie pomiędzy userem 1 a userem 0
//następuje wymiana hello ramek

var gameId uint32 = 0

var syc int = 0
var synchronizer sync.WaitGroup

var messageFrom9 string = "dziachujla?"
var messageFrom6 string = "jest essa fest"

func user9(t *testing.T) {
	playerId := 9
	c, _, err := websocket.DefaultDialer.Dial(fmt.Sprintf(
		"ws://game.essa.com:81/commSocket?id=%d", playerId), nil)

	assert.Equal(t, err, nil)
	defer func() {
		t.Log("closed by 1")
		c.Close()
	}()

	for gameId == 0 {
	}
	resp, err := http.Get(fmt.Sprintf("http://game.essa.com:81/joinGames?gameId=%d&playerId=%d", gameId, playerId))
	assert.Equal(t, err, nil)
	assert.Equal(t, resp.StatusCode, 200)

	var responseJson struct {
		Result string `json:"result"`
	}
	assert.Equal(t, json.NewDecoder(resp.Body).Decode(&responseJson), nil)
	assert.Equal(t, responseJson.Result, "successfully connected players")
	messageFrame := ActionFrame.MessageRequest{ // problem jest taki że ramka jest wysyłana do samego siebie
		FrameType: ActionFrame.Message,
		Message:   messageFrom9,
	}
	err = c.WriteMessage(websocket.BinaryMessage, messageFrame.ToUint8Arr())
	assert.Equal(t, err, nil)
	for syc != 3 {
	}
	c.SetReadDeadline(time.Now().Add(5 * time.Second))
	_, rawFrame, err := c.ReadMessage()
	assert.Equal(t, err, nil)
	data := ActionFrame.MessgeFromUintArr(rawFrame)
	t.Log(string(data.GetData()))
	assert.Equal(t, string(data.GetData()), messageFrom6)

}

func user6(t *testing.T) {

	res, err := http.Get("http://game.essa.com:81/ping")
	assert.Equal(t, err, nil)
	assert.Equal(t, res.StatusCode, 200)
	c, _, err := websocket.DefaultDialer.Dial(fmt.Sprintf(
		"ws://game.essa.com:81/commSocket?id=6"),
		nil)

	assert.Equal(t, err, nil)
	defer func() {
		t.Log("closed by 0")
		c.Close()
	}()

	var gameResult struct {
		GameId   uint32 `json:"gameId"`
		PlayerId uint32 `json:"playerId"`
	}
	resp, err := http.Get("http://game.essa.com:81/newGame?playerId=6")
	assert.Equal(t, err, nil)
	assert.Equal(t, resp.StatusCode, 200)
	if err = json.NewDecoder(resp.Body).Decode(&gameResult); err != nil {
		panic(err)
	}

	gameId = gameResult.GameId

	for syc != 3 {
	}
	err = c.SetReadDeadline(time.Now().Add(1 * time.Second))
	assert.Equal(t, err, nil)
	_, rawFrame, err := c.ReadMessage()
	assert.Equal(t, err, nil)
	data := ActionFrame.MessgeFromUintArr(rawFrame)
	assert.Equal(t, string(data.GetData()), messageFrom9)

	messageFrame := ActionFrame.MessageRequest{ // problem jest taki że ramka jest wysyłana do samego siebie
		FrameType: ActionFrame.Message,
		Message:   messageFrom6,
	}
	err = c.WriteMessage(websocket.BinaryMessage, messageFrame.ToUint8Arr())

}

func TestNewGame(t *testing.T) {
	var wgRouter sync.WaitGroup
	wgRouter.Add(1)
	synchronizer.Add(2)
	go func(wg *sync.WaitGroup) {
		connectionHub.Hub.IterpretConnections()
	}(&wgRouter) // zarządznie webSocketami
	go func(wg *sync.WaitGroup) {
		r := makeRouter.NewRouter()
		wg.Done()
		r.Run("game.essa.com:81")
	}(&wgRouter)

	wgRouter.Wait()
	time.Sleep(1 * time.Second)
	var wg sync.WaitGroup
	wg.Add(2)
	go func(wg *sync.WaitGroup) {
		defer wg.Done()
		user6(t) // imituje usera 1
	}(&wg)
	go func(wg *sync.WaitGroup) {
		defer wg.Done()
		user9(t) // imituje usera 1
	}(&wg)

	for gameId == 0 {
	}
	/*connectionHub.Hub.DirectSend(1, &ActionFrame.MessageRequest{
		Sender:    uint32(0),
		Receiver:  0,
		FrameType: ActionFrame.Message,
		Message:   "pojebalo",
	})*/
	syc = 3
	wg.Wait()

}
