package ActionFrame

type NilFrame struct {
}

func (n *NilFrame) ToUint8Arr() []uint8 {
	//TODO implement me
	panic("implement me")
}

func (n *NilFrame) ToUintArr() (res []uint8) {
	return
}
func NilFromUintArr() *NilFrame {
	return &NilFrame{}
}

func NewNilFrame() *NilFrame {
	return &NilFrame{}
}

func (n *NilFrame) GetAction() Action {
	//TODO implement me
	panic("implement me")
}

func (n *NilFrame) GetUserId() string {
	//TODO implement me
	panic("implement me")
}

func (n *NilFrame) GetData() []uint8 {
	//TODO implement me
	panic("implement me")
}
