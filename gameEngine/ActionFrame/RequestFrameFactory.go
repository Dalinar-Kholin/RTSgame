package ActionFrame

func RequestFactory(data []byte) IActionRequest {
	act := Action(data[0])

	switch act {
	case Message:
		return MessgeFromUintArr(data)
	case Empty:
		return NewNilFrame()
	case StartGame:
		return NewStartGameRequest()
	case NewBoard:
		return NewBoardFromUintArr(data)
	case Attack:
		return AttackFromUintArr(data)
	case EndGame:
		return EndGameFromUintArr(data)
	default:
		return NilFromUintArr()
	}

}
