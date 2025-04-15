package newGameEndpoints_test

import (
	"encoding/json"
	"fmt"
	"gameEngine/ActionFrame"
	"gameEngine/connectionHub"
	"gameEngine/makeRouter"
	"gameEngine/newGameEndpoints"
	"github.com/go-playground/assert/v2"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"net/http"
	"sync"
	"testing"
	"time"
)

// control flow tworzenia nowej gry jest taki że
// user0 - zakłada nowy pokój gry - inicjowane jest jego poołączenie z socketem
// user1 - inicjuje swoje połączenie z socketem
// user1 - dołącza do pokoju usera 0
// tworzone jest tunelowanie pomiędzy userem 1 a userem 0
// następuje wymiana hello ramek
func userOne(t *testing.T, syc *sync.WaitGroup, messageOne, messageTwo string, gameId *int32) {
	playerId := uuid.New().ID()
	c, _, err := websocket.DefaultDialer.Dial(fmt.Sprintf(
		"ws://game.essa.com:81/commSocket?id=%d", playerId), nil)

	assert.Equal(t, err, nil)
	defer func() {
		t.Log("closed by 1")
		c.Close()
	}()

	for *gameId == 0 {
	}
	resp, err := http.Get(fmt.Sprintf("http://game.essafromkholin.click:80/joinGames?gameId=%d&playerId=%d", *gameId, playerId))
	assert.Equal(t, err, nil)
	assert.Equal(t, resp.StatusCode, 200)

	var responseJson struct {
		Result string `json:"result"`
	}
	assert.Equal(t, json.NewDecoder(resp.Body).Decode(&responseJson), nil)
	assert.Equal(t, responseJson.Result, "successfully connected players")
	messageFrame := ActionFrame.MessageRequest{ // problem jest taki że ramka jest wysyłana do samego siebie
		FrameType: ActionFrame.Message,
		Message:   messageOne,
	}
	err = c.WriteMessage(websocket.BinaryMessage, messageFrame.ToUint8Arr())
	assert.Equal(t, err, nil)
	syc.Wait()
	//c.SetReadDeadline(time.Now().Add(2 * time.Second))
	_, rawFrame, err := c.ReadMessage()
	assert.Equal(t, err, nil)
	data := ActionFrame.MessgeFromUintArr(rawFrame)
	t.Log(string(data.GetData()))
	assert.Equal(t, string(data.GetData()), messageTwo)
}

func userTwo(t *testing.T, syc *sync.WaitGroup, messageOne, messageTwo string, gameId *int32) {
	playerId := uuid.New().ID()
	res, err := http.Get("http://game.essafromkholin.click:80/ping")
	assert.Equal(t, err, nil)
	assert.Equal(t, res.StatusCode, 200)
	c, _, err := websocket.DefaultDialer.Dial(fmt.Sprintf(
		"ws://game.essafromkholin.click:80/commSocket?id=%d", playerId),
		nil)

	assert.Equal(t, err, nil)
	defer func() {
		t.Log("closed by 0")
		c.Close()
	}()

	var gameResult newGameEndpoints.NewGame
	resp, err := http.Get(fmt.Sprintf("http://game.essafromkholin.click:80/newGame?playerId=%d", playerId))
	assert.Equal(t, err, nil)
	assert.Equal(t, resp.StatusCode, 200)
	if err = json.NewDecoder(resp.Body).Decode(&gameResult); err != nil {
		panic(err)
	}

	*gameId = gameResult.GameId

	syc.Wait()
	/*err = c.SetReadDeadline(time.Now().Add(10 * time.Second))
	assert.Equal(t, err, nil)*/
	_, rawFrame, err := c.ReadMessage()
	assert.Equal(t, err, nil)
	data := ActionFrame.MessgeFromUintArr(rawFrame)
	assert.Equal(t, string(data.GetData()), messageOne)

	messageFrame := ActionFrame.MessageRequest{ // problem jest taki że ramka jest wysyłana do samego siebie
		FrameType: ActionFrame.Message,
		Message:   messageTwo,
	}
	err = c.WriteMessage(websocket.BinaryMessage, messageFrame.ToUint8Arr())
	assert.Equal(t, err, nil)
}

func controlFunc(t *testing.T) {
	playerId := 420
	c, _, err := websocket.DefaultDialer.Dial(fmt.Sprintf(
		"ws://game.essafromkholin.click:80/commSocket?id=%d", playerId), nil)
	assert.Equal(t, err, nil)
	/*err = c.SetReadDeadline(time.Now().Add(10 * time.Second))
	assert.Equal(t, err, nil)*/
	_, _, err = c.ReadMessage()
	assert.NotEqual(t, err, nil) // do tego wątku nie powinna dojść żadna wiadomość
}

func TestNewGame(t *testing.T) {
	var syc sync.WaitGroup
	var wgRouter sync.WaitGroup
	var wg sync.WaitGroup
	wg.Add(2)
	syc.Add(1)
	wgRouter.Add(1)

	var gameId int32 = 0

	go func(wg *sync.WaitGroup) {
		connectionHub.Hub.IterpretConnections()
	}(&wgRouter) // zarządznie webSocketami

	go func(wg *sync.WaitGroup) {
		r := makeRouter.NewRouter()
		wg.Done()
		r.Run("game.essa.com:81")
	}(&wgRouter)

	wgRouter.Wait()
	time.Sleep(2 * time.Second) // sekunda na to aby router się odpalił

	go func(wg *sync.WaitGroup) {
		defer wg.Done()
		userOne(t, &syc, "esssa", "hjgasdff", &gameId) // imituje usera 1
	}(&wg)
	go func(wg *sync.WaitGroup) {
		defer wg.Done()
		userTwo(t, &syc, "esssa", "hjgasdff", &gameId) // imituje usera 1
	}(&wg)

	for gameId == 0 {
	}
	syc.Done()
	wg.Wait()

}
