import * as React from "react";
import { useState, useEffect, useRef } from 'react';
import InlineEdit from "./InlineEdit"

export interface IControlProps {
    text: string;
    slugs: ISlug[];
    fontSize: number;
    relayUpdates: (keyToReplace: string, newText: string) => void;
}

export interface ISlug {
    id: number,
    key: string,
    value: string
}

const Control = (props: IControlProps): JSX.Element => {
    const [slugsState, setSlugs] = useState(props.slugs);
    let rows: React.ReactElement[] = [], indexOf: number = 0;

    rows.push(<>
        {slugsState.map((s, ind) => {
            if (props.text.indexOf(s.key) === -1) {
                return <></>;
            }
            let part: string = props.text.substring(indexOf, props.text.indexOf(s.key));
            indexOf = props.text.indexOf(s.key) + s.key.length;

            return  <>
                        <div dangerouslySetInnerHTML={renderMarkup(part)} />
                        <InlineEdit key={s.key} text={s.value} onSetText={text => {
                                if (text !== "") {
                                    setSlugs(state => {
                                        const list = state.map((item, j) => {
                                            if (j === ind) {
                                                //return { id: item.id, key: item.key, value: text };
                                                return { id: item.id, key: text, value: text };
                                            } else {
                                                return item;
                                            }
                                        });

                                        return list;
                                    });
                                    props.relayUpdates(s.key, text);
                                }
                            }} />
                    </>
        })}
    </>);

    if (indexOf < props.text.length) {
        let finalpart: string = props.text.substring(indexOf);
        rows.push(
            <div dangerouslySetInnerHTML={renderMarkup(finalpart)} />
        );
    }

    return (
        <div style={{fontSize: props.fontSize}}>
            {
                rows.map((ele: React.ReactElement) => (
                    ele
                ))
            }
        </div>
    );
}

function renderMarkup(htmlMarkup: string) {
    return { __html: htmlMarkup };
}

export default Control;