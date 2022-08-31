import { TextField } from "@fluentui/react/lib/TextField";
import React, { useState, useEffect } from "react";

export enum DisplayOption {
    PrefixOnly,
    SuffixOnly,
    Both,
}

export interface ICustomTextFieldProps {
    currentValue?: string;
    prefix?: string;
    suffix?: string;
    displayOptions: DisplayOption;
    relayUpdates: (newText: string) => void;
}

const CustomTextField = (props: ICustomTextFieldProps): JSX.Element => {
    const [textfieldValue, setTextfieldValue] = useState<string>("");
    const [textfieldPrefix, setTextfieldPrefix] = useState<string>("");
    const [textfieldSuffix, setTextfieldSuffix] = useState<string>("");

    useEffect(() => {
        setTextfieldValue(props.currentValue!);
        setTextfieldPrefix(props.prefix!);
        setTextfieldSuffix(props.suffix!);
    }, [props.currentValue, props.prefix, props.suffix]);

    const onChangeTextFieldValue = React.useCallback((event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setTextfieldValue(newValue || "");
        props.relayUpdates(newValue || "");
    }, []);

    if (props.displayOptions === DisplayOption.PrefixOnly) {
        return (
            <div>
                <TextField prefix={textfieldPrefix} value={textfieldValue} onChange={onChangeTextFieldValue} />
            </div>
        );
    } else if (props.displayOptions === DisplayOption.SuffixOnly) {
        return (
            <div>
                <TextField suffix={textfieldSuffix} value={textfieldValue} onChange={onChangeTextFieldValue} />
            </div>
        );
    } else if (props.displayOptions === DisplayOption.Both) {
        return (
            <div>
                <TextField prefix={textfieldPrefix} suffix={textfieldSuffix} value={textfieldValue} onChange={onChangeTextFieldValue} />
            </div>
        );
    } else {
        return (
            <div>
                <TextField value={textfieldValue} onChange={onChangeTextFieldValue} />
            </div>
        );
    }
};

export default CustomTextField;
