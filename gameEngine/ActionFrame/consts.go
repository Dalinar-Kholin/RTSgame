package ActionFrame

type Action uint8

const (
	Empty         = Action(0)
	Message       = Action(1)
	Attack        = Action(2)
	Build         = Action(3)
	ServerMessage = Action(4)
	StartGame     = Action(5)
	NewBoard      = Action(6)
	EndGame       = Action(7)
)

type IActionRequest interface {
	ToUint8Arr() []uint8
	GetAction() Action
	GetData() []uint8
}
