package connectionHub

import (
	"fmt"
	"gameEngine/ActionFrame"
	"github.com/gorilla/websocket"
	"sync/atomic"
)

type CommunicationFrame struct {
	Request  ActionFrame.IActionRequest
	Receiver uint32
}

var Hub ConnectionHub = ConnectionHub{
	senderChanel:   make(map[uint32]chan ActionFrame.IActionRequest),
	receiverChanel: make(chan CommunicationFrame),
}

type ConnectionHubTest struct {
	socketPool         atomic.Int32
	fromClient         map[uint32]<-chan ActionFrame.IActionRequest
	toClient           map[uint32]chan<- ActionFrame.IActionRequest
	interpreterChannel chan<- ActionFrame.IActionRequest
}

type ConnectionHub struct {
	socketPool     atomic.Int32
	senderChanel   map[uint32]chan ActionFrame.IActionRequest
	receiverChanel chan CommunicationFrame
}

func (h *ConnectionHub) IterpretConnections() {
	fmt.Printf("Interpreter start working\n")
	for {
		frame := <-h.receiverChanel
		fmt.Printf("\nreceived data %v\n", frame)
		receiverChannel := h.senderChanel[frame.Receiver]
		data := frame.Request
		switch data.(type) {
		case *ActionFrame.MessageRequest:
			fmt.Printf("as Message Frame\n")
			messAck := data.(*ActionFrame.MessageRequest)
			receiverChannel <- messAck
			// h.senderChanel[messAck.Receiver]
		default:
			panic("nierozpoznany typ ramki")
		}
	}
}

func (h *ConnectionHub) RegisterNewConnection(conn *websocket.Conn, id uint32) {
	h.socketPool.Add(1)
	go func() { // obsługa odebrania wiadomości
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
	c := make(chan ActionFrame.IActionRequest)
	h.senderChanel[id] = c
	go func() {
		for {
			frame := <-c
			switch frame.(type) {
			case *ActionFrame.MessageRequest:
				conn.WriteMessage(websocket.BinaryMessage, frame.ToUint8Arr())
			}
		}
	}()
}

func registerClosedConnection(conn *websocket.Conn, err error) {
	fmt.Printf("połączenie z %s zakończone by %v\n", conn.RemoteAddr(), err)
}

func (h *ConnectionHub) GetChan(id uint32) chan ActionFrame.IActionRequest {
	return h.senderChanel[id]
}

func (h *ConnectionHub) SetChan(id uint32, channel chan ActionFrame.IActionRequest) {
	h.senderChanel[id] = channel
}