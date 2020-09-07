import * as React from "react";
import { useState, useEffect, useRef } from 'react';
import useKeypress from "../hooks/KeyPress";
import useOnClickOutside from "../hooks/OnClickOutside";
//import dompurify = require('dompurify');

export interface IInlineEditProps {
    text: string;
    onSetText: (text: string) => void;
}

const InlineEdit = (props: IInlineEditProps): JSX.Element => {
    const [isInputActive, setIsInputActive] = useState(false);
    let [inputValue, setInputValue] = useState(props.text);

    const wrapperRef: any = useRef(null);
    const textRef: any = useRef(null);
    const inputRef: any = useRef(null);

    const enter = useKeypress("Enter");
    const esc = useKeypress("Escape");

    const { onSetText } = props;

    // check to see if the user clicked outside of this component
    useOnClickOutside(wrapperRef, () => {
        if (isInputActive) {
            onSetText(inputValue);
            setIsInputActive(false);
        }
    });

    const onEnter = React.useCallback(() => {
        if (enter) {
            onSetText(inputValue);
            setIsInputActive(false);
        }
    }, [enter, inputValue, onSetText]);

    const onEsc = React.useCallback(() => {
        if (esc) {
            setInputValue(props.text);
            setIsInputActive(false);
        }
    }, [esc, props.text]);

    // focus the cursor in the input field on edit start
    useEffect(() => {
        if (isInputActive) {
            inputRef.current.focus();
        }
    }, [isInputActive]);

    useEffect(() => {
        if (isInputActive) {
            // if Enter is pressed, save the text and close the editor
            onEnter();
            // if Escape is pressed, revert the text and close the editor
            onEsc();
        }
    }, [onEnter, onEsc, isInputActive]); // watch the Enter and Escape key presses

    const handleInputChange = React.useCallback(
        event => {
            // sanitize the input a little
            //setInputValue(dompurify.sanitize(event.target.value));
            setInputValue(event.target.value);
        },
        [setInputValue]
    );

    const handleSpanClick = React.useCallback(() => 
        {
            setIsInputActive(true);
            setInputValue("");
        }, 
        [setIsInputActive]
    );

    return (
        <span className="inline-text" ref={wrapperRef}>
            <span
                ref={textRef}
                onClick={handleSpanClick}
                className={`inline-text_copy inline-text_copy--${
                    !isInputActive ? "active" : "hidden"
                    }`}
            >
                {props.text}
            </span>
            <input
                ref={inputRef}
                // set the width to the input length multiplied by the x height
                // it's not quite right but gets it close
                style={{ minWidth: Math.ceil(inputValue.length) + "ch" }}
                value={inputValue}
                onChange={handleInputChange}
                className={`inline-text_input inline-text_input--${
                    isInputActive ? "active" : "hidden"
                    }`}
            />
        </span>
    );
}

export default InlineEdit;