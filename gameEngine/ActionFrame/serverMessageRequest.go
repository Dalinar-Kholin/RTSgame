package ActionFrame

type ServerMessageRequest struct {
	FrameType Action // pierwszy bajt
	Message   string // 9 - do końca
} // nie jest to zgodne z ABI assemblera, ciekawe czy mnie to kopnie

func (n *ServerMessageRequest) ToUint8Arr() (res []uint8) {
	res = make([]uint8, len(n.Message)+1)
	res[0] = uint8(ServerMessage)
	for x, y := range n.Message {
		res[x+1] = uint8(y)
	}
	return
}

func (m *ServerMessageRequest) GetAction() Action {
	return Message
}

func (m *ServerMessageRequest) GetUserId() string {
	//TODO implement me
	panic("implement me")
}

func (m *ServerMessageRequest) GetData() []uint8 {
	return []uint8(m.Message)
}
