package newGameEndpoints_test

import (
	"gameEngine/connectionHub"
	"gameEngine/makeRouter"
	"sync"
	"testing"
	"time"
)

//control flow tworzenia nowej gry jest taki że
//user0 - zakłada nowy pokój gry - inicjowane jest jego poołączenie z socketem
//user1 - inicjuje swoje połączenie z socketem
//user1 - dołącza do pokoju usera 0
//tworzone jest tunelowanie pomiędzy userem 1 a userem 0
//następuje wymiana hello ramek

func playGame(t *testing.T) {
	var syc sync.WaitGroup
	var wg sync.WaitGroup
	syc.Add(1)
	wg.Add(2)

	var gameId int32 = 0

	go func(wg *sync.WaitGroup) {
		defer wg.Done()
		userOne(t, &syc, "pojebanee", "wchuj", &gameId) // imituje usera 1
	}(&wg)
	go func(wg *sync.WaitGroup) {
		defer wg.Done()
		userTwo(t, &syc, "pojebanee", "wchuj", &gameId) // imituje usera 1
	}(&wg)

	for gameId == 0 {
	}
	syc.Done()
	wg.Wait()
}

func TestNewGameForMultipleGame(t *testing.T) {
	var wg sync.WaitGroup
	var wgRouter sync.WaitGroup
	wgRouter.Add(1)
	go func(wg *sync.WaitGroup) {
		connectionHub.Hub.IterpretConnections()
	}(&wgRouter) // zarządznie webSocketami

	go func(wg *sync.WaitGroup) {
		r := makeRouter.NewRouter()
		wg.Done()
		r.Run("game.essa.com:81")
	}(&wgRouter)

	wgRouter.Wait()
	time.Sleep(1 * time.Second)

	for i := 0; i < 3; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			playGame(t)
		}()
	}
	wg.Wait()

}
