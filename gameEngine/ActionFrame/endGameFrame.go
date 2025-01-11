package ActionFrame

type EndGameRequest struct {
	winner uint8
}

func EndGameFromUintArr(data []uint8) IActionRequest {
	return &EndGameRequest{
		winner: data[1],
	}
}

func (e *EndGameRequest) ToUint8Arr() []uint8 {
	res := make([]uint8, 2)
	res[0] = uint8(EndGame)
	res[1] = e.winner
	return res
}
func (e *EndGameRequest) GetAction() Action {
	return EndGame
}

func (e *EndGameRequest) GetData() []uint8 {
	//TODO implement me
	panic("implement me")
}
