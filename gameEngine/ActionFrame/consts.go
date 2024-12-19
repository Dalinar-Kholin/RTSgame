package ActionFrame

type Action uint8

const (
	Empty   = Action(0)
	Message = Action(1)
	Attack  = Action(2)
	Build   = Action(3)
)

type IActionRequest interface {
	ToUint8Arr() []uint8
	GetAction() Action
	GetUserId() string
	GetData() []uint8
}
