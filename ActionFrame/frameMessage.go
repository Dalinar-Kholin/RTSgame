package ActionFrame

import "encoding/binary"

type MessageFrame struct {
	frameType Action // pierwszy bajt
	sender    uint32 // 1 - 5 bajt
	receiver  uint32 // 6 - 9 bajt
	message   string // 9 - do końca
} // nie jest to zgodne z ABI assemblera, ciekawe czy mnie to kopnie

func (n *MessageFrame) ToUint8Arr() (res []uint8) {
	return make([]uint8, 0)
}

func MessgeFromUintArr(data []uint8) IActionFrame {
	return &MessageFrame{
		frameType: message,
		sender:    binary.BigEndian.Uint32(data[1:]),
		receiver:  binary.BigEndian.Uint32(data[5:]),
		message:   string(data[9:]),
	}
}

func (m *MessageFrame) GetAction() Action {
	//TODO implement me
	panic("implement me")
}

func (m *MessageFrame) GetUserId() string {
	//TODO implement me
	panic("implement me")
}

func (m *MessageFrame) GetData() []uint8 {
	//TODO implement me
	panic("implement me")
}
