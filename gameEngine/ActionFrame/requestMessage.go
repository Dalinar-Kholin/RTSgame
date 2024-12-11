package ActionFrame

type MessageRequest struct {
	FrameType Action // pierwszy bajt
	Message   string // 9 - do końca
} // nie jest to zgodne z ABI assemblera, ciekawe czy mnie to kopnie

func (n *MessageRequest) ToUint8Arr() (res []uint8) {
	res = make([]uint8, len(n.Message)+1)
	res[0] = uint8(Message)
	for x, y := range n.Message {
		res[x+1] = uint8(y)
	}
	return
}

func MessgeFromUintArr(data []uint8) IActionRequest {
	return &MessageRequest{
		FrameType: Message,
		Message:   string(data[1:]),
	}
}

func (m *MessageRequest) GetAction() Action {
	return Message
}

func (m *MessageRequest) GetUserId() string {
	//TODO implement me
	panic("implement me")
}

func (m *MessageRequest) GetData() []uint8 {
	return []uint8(m.Message)
}
