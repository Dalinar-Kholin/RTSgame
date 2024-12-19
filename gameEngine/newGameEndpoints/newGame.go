package newGameEndpoints

import (
	"context"
	"fmt"
	"gameEngine/connectionHub"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
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
	FirstPlayerId  int32 `dynamodbav:"firstPlayerI"`
	SecondPlayerId int32 `dynamodbav:"secondPlayerId"`
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
	game := NewGame{GameId: int32(gameId.ID()), FirstPlayerId: int32(playerId), SecondPlayerId: 0}
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
	playerIdInt, err := strconv.Atoi(c.Request.URL.Query().Get("playerId")) // to jest ID Gry
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
	firstPlayerChan := connectionHub.Hub.GetChan(result.FirstPlayerId) // channel pierwszego gracza
	secondPlayerChan := connectionHub.Hub.GetChan(playerId)
	connectionHub.Hub.SetChan(result.FirstPlayerId, secondPlayerChan)
	connectionHub.Hub.SetChan(playerId, firstPlayerChan)
	c.JSON(200, gin.H{
		"result": "successfully connected players",
	})

}
