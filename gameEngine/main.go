package main

import (
	"fmt"
	"gameEngine/ActionFrame"
	"gameEngine/connectionHub"
	"gameEngine/makeRouter"
)

func main() {
	fmt.Printf("%v\n", ActionFrame.MessgeFromUintArr((&ActionFrame.MessageRequest{
		FrameType: ActionFrame.Message,
		Message:   "pojebalo",
	}).ToUint8Arr()))
	return

	r := makeRouter.NewRouter()

	go func() {
		connectionHub.Hub.IterpretConnections()
	}() // zarządznie webSocketami
	r.Run("game.essa.com:81")
}
