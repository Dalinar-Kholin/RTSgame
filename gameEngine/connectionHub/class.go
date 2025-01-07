package connectionHub

import (
	"fmt"
	"gameEngine/ActionFrame"
	"gameEngine/connectionHub/field"
	"github.com/gorilla/websocket"
	"sync/atomic"
)

type CommunicationFrame struct {
	Request  ActionFrame.IActionRequest
	Receiver int32
	//Sender int32 // czasami chcemy aby ramka nie dotrała do 2 gracza tylko do serwera i została nam zwrócona odpowiedź
}

var Hub = ConnectionHub{
	senderChanel:   make(map[int32]chan ActionFrame.IActionRequest),
	receiverChanel: make(chan CommunicationFrame),
}

type ConnectionHub struct {
	socketPool     atomic.Int32
	senderChanel   map[int32]chan ActionFrame.IActionRequest
	receiverChanel chan CommunicationFrame
}

type Game struct {
	fields  [256][256]field.Field
	players [2]int32
}

var IdToGameId = make(map[int32]int32)

func (h *ConnectionHub) IterpretConnections() {
	fmt.Printf("Interpreter start working\n")

	var GamesHub = make(map[int32]*Game)
	// może tutaj wysyłać ramkę register to game i łączyć graczy na tej podstawie
	// potem w każdej ramce wysyłać ID gry i swoje i na tej podstawie interpretować zachowania graczy

	for {
		frame := <-h.receiverChanel // otrzymaliśmy ramkę od gracza
		fmt.Printf("\nreceived data %v\n", frame)
		receiverChannel := h.senderChanel[frame.Receiver]
		data := frame.Request
		go func() { // obsługa ramki może sporo zająć nie chcemy blokować odbierania nowych ramek
			switch data.(type) {
			case *ActionFrame.MessageRequest:
				messAck := data.(*ActionFrame.MessageRequest)
				receiverChannel <- messAck
				// h.senderChanel[messAck.Receiver]
			case *ActionFrame.NilFrame:
				break
			case *ActionFrame.StartGameRequest:
				messAck := data.(*ActionFrame.StartGameRequest)
				receiverChannel <- messAck
				break
			case *ActionFrame.SpawnAllay:
				allay := data.(*ActionFrame.SpawnAllay)
				GamesHub[IdToGameId[frame.Receiver]].fields[allay.Cord[0]][allay.Cord[1]].Data = allay.AllayType

			default:
				panic("nierozpoznany typ ramki")
			}
		}()
	}
}

func (h *ConnectionHub) RegisterNewConnection(conn *websocket.Conn, id int32) {
	h.socketPool.Add(1)
	c := make(chan ActionFrame.IActionRequest)
	h.senderChanel[id] = c // ustawiamy nasz kanał pod naszym ID, jednak po połączeniu do gry zostanie on podminiony
	go func() {            // obsługa odebrania wiadomości
		defer func() {
			delete(h.senderChanel, id)
			conn.Close()
			h.socketPool.Add(-1)
		}()
		for {
			messageType, data, err := conn.ReadMessage()
			if err != nil {
				h.socketPool.Add(-1)
				registerClosedConnection(conn, err)
				conn.Close()
				return
			}
			if messageType != websocket.BinaryMessage {
				continue
			}
			fmt.Printf("raw data := %v\n", data)
			h.receiverChanel <- CommunicationFrame{
				Request:  ActionFrame.RequestFactory(data),
				Receiver: id}
		}
	}()

	go func() {
		for {
			frame := <-c
			err := conn.WriteMessage(websocket.BinaryMessage, frame.ToUint8Arr())
			if err != nil {
				panic(err.Error())
			}
			/*switch frame.(type) {
			case *ActionFrame.MessageRequest:
				conn.WriteMessage(websocket.BinaryMessage, frame.ToUint8Arr())
			case *ActionFrame.ServerMessageRequest:
				conn.WriteMessage(websocket.BinaryMessage, frame.ToUint8Arr())
			case *ActionFrame.StartGameRequest:
				conn.WriteMessage(websocket.BinaryMessage, frame.ToUint8Arr())
			}*/
		}
	}()
}

func registerClosedConnection(conn *websocket.Conn, err error) {
	// TODO: mniej więcej tutaj dodać wychodzenie z wszystkich gier w których połączenie było zarejestrowane
	fmt.Printf("połączenie z %s zakończone by %v\n", conn.RemoteAddr(), err)
}

func (h *ConnectionHub) GetChan(id int32) chan ActionFrame.IActionRequest {
	return h.senderChanel[id]
}

func (h *ConnectionHub) SetChan(id int32, channel chan ActionFrame.IActionRequest) {
	h.senderChanel[id] = channel
}
