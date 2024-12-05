package connectionHub

import (
	"fmt"
	"github.com/gorilla/websocket"
	"sync/atomic"
	"weppoProjec/ActionFrame"
)

var Hub ConnectionHub = ConnectionHub{
	senderChanel:   make(map[string]chan ActionFrame.IActionFrame),
	receiverChanel: make(chan ActionFrame.IActionFrame),
}

type ConnectionHub struct {
	socketPool     atomic.Int32
	senderChanel   map[string]chan ActionFrame.IActionFrame
	receiverChanel chan ActionFrame.IActionFrame
}

func registerClosedConnection(conn *websocket.Conn) {
	fmt.Printf("połączenie z %s zakończone\n", conn.RemoteAddr())
}

func (h *ConnectionHub) RegisterNewConnection(conn *websocket.Conn, id string) {
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
				registerClosedConnection(conn)
				conn.Close()
				return
			}
			if messageType != websocket.BinaryMessage {
				continue
			}
			h.receiverChanel <- ActionFrame.FrameFactory(data)
		}
	}()
	c := make(chan ActionFrame.IActionFrame)
	h.senderChanel[id] = c
	go func() {
		for {
			var frame ActionFrame.IActionFrame
			frame = <-c
			switch frame.(type) {
			case *ActionFrame.MessageFrame:
				conn.WriteMessage(websocket.BinaryMessage, frame.ToUint8Arr())
			}
		}
	}()
}
