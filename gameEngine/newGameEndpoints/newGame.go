package newGameEndpoints

import (
	"context"
	"fmt"
	"gameEngine/ActionFrame"
	"gameEngine/connectionHub"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"log"
	"strconv"
)

type GameEndpoints struct {
	Svc   *dynamodb.Client
	Games []NewGame
}

type NewGame struct {
	GameId         int32 `dynamodbav:"_id"`
	FirstPlayerId  int32 `dynamodbav:"firstPlayerId"`
	SecondPlayerId int32 `dynamodbav:"secondPlayerId"`
	PlayersInGame  int32 `dynamodbav:"playersInGame"`
}

// GamesToJoin pokaż dostępne gry do których można dołączyć
func (g *GameEndpoints) GamesToJoin(c *gin.Context) {
	var games []NewGame
	var err error
	input := &dynamodb.ScanInput{
		TableName:        aws.String(gameDb),
		FilterExpression: aws.String("secondPlayerId = :value"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":value": &types.AttributeValueMemberN{Value: "0"},
		},
	}

	// Wykonanie skanowania
	resp, err := g.Svc.Scan(context.TODO(), input)
	if err != nil {
		panic(err)
	}
	var game NewGame
	for _, x := range resp.Items {
		attributevalue.UnmarshalMap(x, &game)
		games = append(games, game)
	}
	c.JSON(200, gin.H{
		"results": games,
	})
}

// NewGame endpoint tworzący nową grę
func (g *GameEndpoints) NewGame(c *gin.Context) {
	playerId, err := strconv.Atoi(c.Request.URL.Query().Get("playerId"))
	gameId, _ := uuid.NewUUID()
	game := NewGame{GameId: int32(gameId.ID()), FirstPlayerId: int32(playerId), SecondPlayerId: 0, PlayersInGame: 1}
	item, err := attributevalue.MarshalMap(game)

	_, err = g.Svc.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String(gameDb), Item: item,
	})
	if err != nil {
		panic(err)
	}
	fmt.Printf("game data := %v\n", game)
	c.JSON(200, gin.H{
		"gameId":   game.GameId,
		"playerId": playerId,
	})
}

/*
to zawsze wykonuje gracz2
w tym momencie gracz1 ma ustawione połączneie ale nie ma celu tego połączenia
*/
func (g *GameEndpoints) JoinGame(c *gin.Context) {
	gameId, err := strconv.Atoi(c.Request.URL.Query().Get("gameId"))        // to jest ID Gry
	playerIdInt, err := strconv.Atoi(c.Request.URL.Query().Get("playerId")) // to jest ID gracza
	playerId := int32(playerIdInt)
	if err != nil {
		c.JSON(400, gin.H{
			"result": "bad Request",
		})
		return
	}
	// zestawienie połączeń tak by player
	// playerOne --> playerTwo oraz
	// playerTwo --> playerOne

	res, err := g.Svc.GetItem(
		context.Background(),
		&dynamodb.GetItemInput{
			TableName: aws.String(gameDb),
			Key: map[string]types.AttributeValue{
				"_id": &types.AttributeValueMemberN{Value: strconv.Itoa(gameId)},
			}})

	if err != nil {
		panic("dynamo się jebie" + err.Error())
	}
	var result NewGame
	if err := attributevalue.UnmarshalMap(res.Item, &result); err != nil {
		log.Fatalf("failed to unmarshal Dynamodb item, %v", err)
	}
	result.SecondPlayerId = playerId
	firstPlayerChan := connectionHub.Hub.GetChan(result.FirstPlayerId) // channel pierwszego gracza
	secondPlayerChan := connectionHub.Hub.GetChan(playerId)
	connectionHub.Hub.SetChan(result.FirstPlayerId, secondPlayerChan)
	connectionHub.Hub.SetChan(playerId, firstPlayerChan)

	update := expression.Set(expression.Name("secondPlayerId"), expression.Value(playerId))
	update.Set(expression.Name("playersInGame"), expression.Value(result.PlayersInGame+1))
	expr, err := expression.NewBuilder().WithUpdate(update).Build()
	if err != nil {
		fmt.Printf("%v\n", err)
		c.JSON(501, gin.H{
			"error": "cant build builder",
		})
		return
	}
	_, err = g.Svc.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String(gameDb),
		Key: map[string]types.AttributeValue{
			"_id": &types.AttributeValueMemberN{Value: strconv.Itoa(gameId)},
		},
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		UpdateExpression:          expr.Update(),
		ReturnValues:              types.ReturnValueUpdatedNew,
	})
	firstPlayerChan <- &ActionFrame.ServerMessageRequest{FrameType: ActionFrame.ServerMessage, Message: "player join to chat"}
	c.JSON(200, gin.H{
		"result": "successfully connected players",
	})

}

// przed join game kanały ustawione są tak że map[playerOneId] = chan playerOne
// po join game ustawione są map[playerOneId] = chan playerTwo

func (g *GameEndpoints) LeaveGame(c *gin.Context) {
	gameId, err := strconv.Atoi(c.Request.URL.Query().Get("gameId"))     // to jest ID gry
	playerId, err := strconv.Atoi(c.Request.URL.Query().Get("playerId")) // to jest ID playera
	res, err := g.Svc.GetItem(
		context.Background(),
		&dynamodb.GetItemInput{
			TableName: aws.String(gameDb),
			Key: map[string]types.AttributeValue{
				"_id": &types.AttributeValueMemberN{Value: strconv.Itoa(gameId)},
			}})
	// tutaj mamy kanały tak że map[playerOne] = chan playerTwo
	// chcemy to odwrócić na map[playerTwo] = chan playerTwo
	if err != nil {
		panic("dynamo się jebie" + err.Error())
	}
	var result NewGame
	if err := attributevalue.UnmarshalMap(res.Item, &result); err != nil {
		log.Fatalf("failed to unmarshal Dynamodb item, %v", err)
		return
	}

	if result.PlayersInGame == 1 { //w grze jest tylko jeden gracz który chce opóścić grę, czyli grę należało by usunąć
		_, err = g.Svc.DeleteItem(context.TODO(), &dynamodb.DeleteItemInput{
			TableName: aws.String(gameDb),
			Key: map[string]types.AttributeValue{
				"_id": &types.AttributeValueMemberN{Value: strconv.Itoa(gameId)},
			},
		})
		if err != nil {
			fmt.Printf("error while deleting game := %v\n", err)
			c.JSON(501, gin.H{
				"error": "server error",
			})
		}
		return
	}

	update := expression.Set(expression.Name("secondPlayerId"), expression.Value(0))

	if result.FirstPlayerId == int32(playerId) { // jeżeli pierwszy gracz uciekł to musimy ustawić 2 gacza jako pierwszego gracza
		update.Set(expression.Name("firstPlayerId"), expression.Value(result.SecondPlayerId))
	}

	update.Set(expression.Name("playersInGame"), expression.Value(result.PlayersInGame-1))

	expr, err := expression.NewBuilder().WithUpdate(update).Build()
	if err != nil {
		fmt.Printf("%v\n", err)
		c.JSON(501, gin.H{
			"error": "cant build builder",
		})
		return
	}
	_, err = g.Svc.UpdateItem(context.TODO(), &dynamodb.UpdateItemInput{
		TableName: aws.String(gameDb),
		Key: map[string]types.AttributeValue{
			"_id": &types.AttributeValueMemberN{Value: strconv.Itoa(gameId)},
		},
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		UpdateExpression:          expr.Update(),
		ReturnValues:              types.ReturnValueUpdatedNew,
	})

	//jeżeli nie ma użytkowników w pokoju, usuń pokój z DB
	firstPlayerChan := connectionHub.Hub.GetChan(result.FirstPlayerId) // channel pierwszego gracza
	secondPlayerChan := connectionHub.Hub.GetChan(result.SecondPlayerId)
	connectionHub.Hub.SetChan(result.FirstPlayerId, secondPlayerChan)
	connectionHub.Hub.SetChan(result.SecondPlayerId, firstPlayerChan)
	// zamieniliśmy je kolejnością, powinno być dobrze

	playerLeftRoom := &ActionFrame.ServerMessageRequest{FrameType: ActionFrame.ServerMessage, Message: "player left rooom"}
	if result.FirstPlayerId == int32(playerId) { // jeżeli pierwszy gracz uciekł to musimy ustawić 2 gacza jako pierwszego gracza
		firstPlayerChan <- playerLeftRoom
	} else {
		secondPlayerChan <- playerLeftRoom
	}

	c.JSON(200, gin.H{
		"result": "successfully connected players",
	})

}
