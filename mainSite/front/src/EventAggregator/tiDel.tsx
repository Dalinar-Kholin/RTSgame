/*
interface TextInputProps {
    type: 'text'
    value: string;
    onChange: (value: string) => void;
}

interface SwitchProps {
    type: 'switch';
    lolz: boolean;
    onChangeXDDD: (value: boolean) => void;
}

type InputProps = TextInputProps | SwitchProps;

const Input = (props: InputProps) => {
    if (props.type === 'text') {
        return <input type="text" value={props.value} onChange={(e) => props.onChange(e.target.value)} />;
    } else {
        return <input type="checkbox" checked={props.lolz} onChange={(e) => props.onChangeXDDD(e.target.checked)} />;
    }
};

const App = () => {
    const [value, setValue] = useState('');
    const [lolz, setLolz] = useState(false);

    return (
        <div>
            <Input type="text" value={value} onChange={setValue} />
            <Input type="text" lolz={lolz} onChangeXDDD={setLolz} />
        </div>
    );
};

interface GenericProps<TProp> {
    prop: TProp;
    onChange: (value: TProp) => void;
}

const Generic = <TProp extends string | boolean>(props: GenericProps<TProp>) => {
    return <input type="text" value={props.prop} onChange={(e) => props.onChange(e.target.value as TProp)} />;
};

const App2 = () => {
    const [value, setValue] = useState('');
    const [lolz, setLolz] = useState(false);

    return (
        <div>
            <Generic prop={value} onChange={setValue} />
            <Generic prop={lolz} onChange={setLolz} />
        </div>
    );
};*/
