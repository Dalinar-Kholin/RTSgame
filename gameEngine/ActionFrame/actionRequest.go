package ActionFrame

import "fmt"

func RequestFactory(data []byte) IActionRequest {
	act := Action(data[0])

	switch act {
	case Message:
		return MessgeFromUintArr(data)
	case Empty:
		return NewNilFrame()
	case StartGame:
		fmt.Printf("StartGame package made\n")
		return NewStartGameRequest()
	default:
		return NilFromUintArr()
	}

}
