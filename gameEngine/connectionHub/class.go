package connectionHub

import (
	"fmt"
	"gameEngine/ActionFrame"
	"github.com/gorilla/websocket"
	"sync/atomic"
)

/*


func (basics TableBasics) UpdateMovie(ctx context.Context, movie Movie) (map[string]map[string]interface{}, error) {
	var err error
	var response *dynamodb.UpdateItemOutput
	var attributeMap map[string]map[string]interface{}
	update := expression.Set(expression.Name("info.rating"), expression.Value(movie.Info["rating"]))
	update.Set(expression.Name("info.plot"), expression.Value(movie.Info["plot"]))
	expr, err := expression.NewBuilder().WithUpdate(update).Build()
	if err != nil {
		log.Printf("Couldn't build expression for update. Here's why: %v\n", err)
	} else {
		response, err = basics.DynamoDbClient.UpdateItem(ctx, &dynamodb.UpdateItemInput{
			TableName:                 aws.String(basics.TableName),
			Key:                       movie.GetKey(),
			ExpressionAttributeNames:  expr.Names(),
			ExpressionAttributeValues: expr.Values(),
			UpdateExpression:          expr.Update(),
			ReturnValues:              types.ReturnValueUpdatedNew,
		})
		if err != nil {
			log.Printf("Couldn't update movie %v. Here's why: %v\n", movie.Title, err)
		} else {
			err = attributevalue.UnmarshalMap(response.Attributes, &attributeMap)
			if err != nil {
				log.Printf("Couldn't unmarshall update response. Here's why: %v\n", err)
			}
		}
	}
	return attributeMap, err
}


*/

type CommunicationFrame struct {
	Request  ActionFrame.IActionRequest
	Receiver int32
}

var Hub ConnectionHub = ConnectionHub{
	senderChanel:   make(map[int32]chan ActionFrame.IActionRequest),
	receiverChanel: make(chan CommunicationFrame),
}

type ConnectionHub struct {
	socketPool     atomic.Int32
	senderChanel   map[int32]chan ActionFrame.IActionRequest
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
			messAck := data.(*ActionFrame.MessageRequest)
			receiverChannel <- messAck
			// h.senderChanel[messAck.Receiver]
		default:
			panic("nierozpoznany typ ramki")
		}
	}
}

func (h *ConnectionHub) RegisterNewConnection(conn *websocket.Conn, id int32) {
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

func (h *ConnectionHub) GetChan(id int32) chan ActionFrame.IActionRequest {
	return h.senderChanel[id]
}

func (h *ConnectionHub) SetChan(id int32, channel chan ActionFrame.IActionRequest) {
	h.senderChanel[id] = channel
}
