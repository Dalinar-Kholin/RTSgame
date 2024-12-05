package ActionFrame

func FrameFactory(data []byte) IActionFrame {
	act := Action(data[0])

	switch act {
	case message:
		return MessgeFromUintArr(data)
	case empty:
		return NewNilFrame()
	default:
		return NilFromUintArr()
	}

}
