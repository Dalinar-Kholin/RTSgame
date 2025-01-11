package ActionFrame

type AttackRequest struct {
	FrameType     Action
	damage        uint8
	attackerCords [2]uint8
}

func AttackFromUintArr(data []uint8) IActionRequest {
	return &AttackRequest{
		FrameType:     Attack,
		damage:        data[1],
		attackerCords: [2]uint8{data[2], data[3]},
	}
}

func (a *AttackRequest) ToUint8Arr() []uint8 {
	res := make([]uint8, 4)
	res[0] = uint8(Attack)
	res[1] = a.damage
	res[2] = a.attackerCords[0]
	res[3] = a.attackerCords[1]
	return res
}

func (a *AttackRequest) GetAction() Action {
	return Attack
}

func (a *AttackRequest) GetData() []uint8 {
	//TODO implement me
	panic("implement me")
}
