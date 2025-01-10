package field

type FieldType uint32

const (
	P1Melee = FieldType(0)
	P1Range = FieldType(1)
	P2Melee = FieldType(2)
	P2Range = FieldType(3)
	Empty   = FieldType(4)
	P1Base  = FieldType(5)
	P2Base  = FieldType(6)
)

var (
	EmptyFieldObject = &Field{Data: Empty, Health: 0}
)

type Field struct {
	Data   FieldType
	Health uint16
}

type Base struct {
	Health uint32
}

type Range struct {
	Health uint32
	/*Attack int32 to nie ma znaczenia, wystarczy pamiętać te dane dla klasy a nie dla instancji
	Range  int32*/
}

type Melee struct {
	Health uint32
	/*Attack int32 to nie ma znaczenia
	Range  int32*/
}
