package ActionFrame

import (
	"gameEngine/connectionHub/field"
)

type SpawnAllay struct {
	FrameType Action // pierwszy bajt
	AllayType field.FieldType
	Cord      [2]int32
}

func (s *SpawnAllay) ToUint8Arr() []uint8 {
	//TODO implement me
	panic("implement me")
}

func (s *SpawnAllay) GetAction() Action {
	//TODO implement me
	panic("implement me")
}

func (s *SpawnAllay) GetUserId() string {
	//TODO implement me
	panic("implement me")
}

func (s *SpawnAllay) GetData() []uint8 {
	//TODO implement me
	panic("implement me")
}
