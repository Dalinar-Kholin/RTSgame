package ActionFrame

import "gameEngine/connectionHub/field"

type BoardFrameField struct {
	Type  field.FieldType
	Cords [2]uint8
	Heath uint16 // liczone big endian
}

type NewBoardFrame struct {
	FrameType Action            // pierwszy bajt
	Board     []BoardFrameField // 9 - do końca
}

func NewBoardFromUintArr(data []uint8) IActionRequest {

	length := len(data) / 5
	board := make([]BoardFrameField, length)

	dataIndex := 1 // index w tablicy danych

	for tabIndex /*index tablicy rezultatów*/ := 0; tabIndex < length; tabIndex += 1 {
		board[tabIndex] = BoardFrameField{
			Type:  field.FieldType(data[dataIndex]),
			Cords: [2]uint8{data[dataIndex+1], data[dataIndex+2]},
			Heath: uint16(data[dataIndex+3])<<8 | uint16(data[dataIndex+4]),
		}
		dataIndex += 5
	}

	return &NewBoardFrame{
		FrameType: NewBoard,
		Board:     board,
	}
}

func (n *NewBoardFrame) ToUint8Arr() []uint8 {
	tab := make([]uint8, (len(n.Board)*5)+1)
	tab[0] = uint8(NewBoard)
	for i, frameField := range n.Board {
		tab[(i*5)+1] = uint8(frameField.Type)
		tab[(i*5)+2] = frameField.Cords[0]
		tab[(i*5)+3] = frameField.Cords[1]
		tab[(i*5)+4] = uint8(frameField.Heath >> 8)
		tab[(i*5)+5] = uint8(frameField.Heath)
	}
	return tab
}

func (n *NewBoardFrame) GetAction() Action {
	return NewBoard
}

func (n *NewBoardFrame) GetData() []uint8 {
	//TODO implement me
	panic("implement me")
}
