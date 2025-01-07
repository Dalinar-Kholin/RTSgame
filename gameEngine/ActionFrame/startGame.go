package ActionFrame

type StartGameRequest struct {
	FrameType Action // pierwszy bajt
}

func (s *StartGameRequest) ToUint8Arr() (res []uint8) {
	res = make([]uint8, 1)
	res[0] = uint8(StartGame)
	return
}

func (s *StartGameRequest) GetAction() Action {
	//TODO implement me
	panic("implement me")
}

func (s *StartGameRequest) GetUserId() string {
	//TODO implement me
	panic("implement me")
}

func (s *StartGameRequest) GetData() []uint8 {
	//TODO implement me
	panic("implement me")
}

func NewStartGameRequest() IActionRequest {
	return &StartGameRequest{
		FrameType: StartGame,
	}
}
