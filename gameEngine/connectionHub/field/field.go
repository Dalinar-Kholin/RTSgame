package field

type FieldType int32

const (
	P1Melee = FieldType(0)
	P1Range = FieldType(1)
	P2Melee = FieldType(2)
	P2Range = FieldType(3)
	Empty   = FieldType(4)
	P1Base  = FieldType(5)
	P2Base  = FieldType(6)
)

type Field struct {
	Data FieldType
}

type Base struct {
	Health int32
}

type Range struct {
	Health int32
	Attack int32
	Range  int32
}

type Melee struct {
	Health int32
	Attack int32
	Range  int32
}
