package main

import (
	"gameEngine/connectionHub"
	"gameEngine/makeRouter"
)

func main() {

	r := makeRouter.NewRouter()

	go func() {
		connectionHub.Hub.IterpretConnections()
	}() // zarządznie webSocketami
	r.Run("game.essa.com:81")
}
