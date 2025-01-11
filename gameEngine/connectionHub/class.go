package connectionHub

import (
	"fmt"
	"gameEngine/ActionFrame"
	"gameEngine/connectionHub/field"
	"github.com/gorilla/websocket"
	"sync"
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
	// Svc            *dynamodb.Client
	socketPool     atomic.Int32
	senderChanel   map[int32]chan ActionFrame.IActionRequest
	receiverChanel chan CommunicationFrame
}

type Game struct {
	lock           sync.Mutex
	fields         [256][256]*field.Field
	playersUnitMap [2][][2]int8 // każdy z graczy ma swoją tablicę jednostek dla kordynatów x, y
	players        [2]int32
}

var IdToGameId = make(map[int32]int32)
var GamesHub = make(map[int32]*Game)
var GameHubLock sync.Mutex

func InitGame(firstPlayerId int32, gameId int32) {
	game := Game{
		players: [2]int32{firstPlayerId, 0},
	}
	GamesHub[gameId] = &game
}

func (G *Game) AddSecondPlayer(playerId int32) {
	G.players[1] = playerId
}

func (h *ConnectionHub) IterpretConnections() {
	fmt.Printf("Interpreter start working\n")

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
				GameHubLock.Lock()
				GamesHub[IdToGameId[frame.Receiver]].fields[allay.Cord[0]][allay.Cord[1]].Data = allay.AllayType
				GameHubLock.Unlock()
			case *ActionFrame.NewBoardFrame:
				newBoard := data.(*ActionFrame.NewBoardFrame)
				GameHubLock.Lock()
				game := GamesHub[IdToGameId[frame.Receiver]]
				GameHubLock.Unlock()
				if game == nil {
					return
				}
				playerNumber := 0
				if game.players[0] != frame.Receiver {
					playerNumber = 1
				}
				tab := make([][2]int8, len(newBoard.Board))
				filter := func(type1, type2 field.FieldType, x, y int8) bool {
					return game.fields[x][y].Data == field.P1Melee || game.fields[x][y].Data == field.P1Range
				}

				// chcemy wyczyścić jednostki ze starej mapy, nowe jednostki mogą się poruszać
				for _, accField := range game.playersUnitMap[playerNumber] {
					x := accField[0]
					y := accField[1]
					if playerNumber == 0 {
						if filter(field.P1Melee, field.P1Range, x, y) {
							game.fields[x][y] = field.EmptyFieldObject
						}
					} else {
						if filter(field.P2Melee, field.P2Range, x, y) {
							game.fields[x][y] = field.EmptyFieldObject
						}
					}

				}
				game.lock.Lock()
				for i, accField := range newBoard.Board {
					game.fields[accField.Cords[0]][accField.Cords[1]] = &field.Field{Data: accField.Type, Health: accField.Heath}
					// zaczynam tworzyć mapę do wysłania
					tab[i][0] = int8(accField.Cords[0])
					tab[i][1] = int8(accField.Cords[1])
				}

				newBoardForFrontend := make([]ActionFrame.BoardFrameField, len(game.playersUnitMap[1-playerNumber])) // dodajemy jednostki przeciwnika i złączymy oba graamy
				for iter, i := range game.playersUnitMap[1-playerNumber] {
					newBoardForFrontend[iter] = ActionFrame.BoardFrameField{
						Type:  game.fields[i[0]][i[1]].Data,
						Cords: [2]uint8{uint8(i[0]), uint8(i[1])},
						Heath: game.fields[i[0]][i[1]].Health,
					}
				}
				newBoardForFrontend = append(newBoardForFrontend, newBoard.Board...) // nowa mapa zawierająca wszystkie jednostki

				game.playersUnitMap[playerNumber] = tab
				game.lock.Unlock()
				// dodaje jednostki przeciwnika

				// mam skompletowaną mapę do wysłania
				newMapForFronted := &ActionFrame.NewBoardFrame{FrameType: ActionFrame.NewBoard, Board: newBoardForFrontend}

				Hub.senderChanel[game.players[0]] <- newMapForFronted
				Hub.senderChanel[game.players[1]] <- newMapForFronted
			case *ActionFrame.AttackRequest:
				attack := data.(*ActionFrame.AttackRequest)
				receiverChannel <- attack
			case *ActionFrame.EndGameRequest: // enumeracja końca gry
				endGame := data.(*ActionFrame.EndGameRequest)
				gameId := IdToGameId[frame.Receiver]
				game := GamesHub[gameId]
				if game == nil {
					fmt.Printf("why error?\n")
					return
				}
				game.lock.Lock()
				Hub.senderChanel[game.players[0]] <- endGame
				Hub.senderChanel[game.players[1]] <- endGame
				game.lock.Unlock()
				GameHubLock.Lock()
				delete(GamesHub, IdToGameId[frame.Receiver])
				GameHubLock.Unlock()
				/*h.Svc.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
					TableName: aws.String(newGameEndpoints.GameDb),
					Key: map[string]types.AttributeValue{
						"_id": &types.AttributeValueMemberN{Value: strconv.Itoa(int(gameId))},
					},
				})*/

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
