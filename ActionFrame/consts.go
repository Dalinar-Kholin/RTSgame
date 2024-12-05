package ActionFrame

type Action uint8

const (
	empty   = Action(0)
	message = Action(1)
	attack  = Action(2)
	build   = Action(4)
)

type IActionFrame interface {
	ToUint8Arr() []uint8
	GetAction() Action
	GetUserId() string
	GetData() []uint8
}
