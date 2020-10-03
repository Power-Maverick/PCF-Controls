import * as React from "react";
import {
    ComboBox,
    IComboBoxProps,
    IComboBoxOption,
} from '@fluentui/react/lib/ComboBox';
import {
    initializeIcons,
} from '@fluentui/react/lib/Icons';
import Spacetime from 'spacetime';
import TimezoneIds from "../config/timezones.json";
import { Timezone } from "./Timezone";

initializeIcons();

export interface ITimezoneProps {
    userDate: string;
    defaultTz1: string;
    defaultTz2: string;
    defaultTz3: string;
    hideTz2?: boolean;
    hideTz3?: boolean;
}

const TimezoneDisplayApp = (props: ITimezoneProps): JSX.Element => {
    let s = Spacetime(props.userDate);

    React.useEffect(() => {
        let s = Spacetime(props.userDate);

        //setSelectedKey1(props.defaultTz1);
        let d1 = s.goto(selectedKey1);
        setTz1(d1);
        setDiffDay1(d1.day() - s.day());
        setMinStyle1({ transform: `rotate(${d1.minute() * 6}deg)` });
        setHrStyle1({ transform: `rotate(${d1.hour() * 30}deg)` });

        //setSelectedKey2(props.defaultTz2);
        let d2 = s.goto(selectedKey2);
        setTz2(d2);
        setDiffDay2(d2.day() - s.day());
        setMinStyle2({ transform: `rotate(${d2.minute() * 6}deg)` });
        setHrStyle2({ transform: `rotate(${d2.hour() * 30}deg)` });

        //setSelectedKey3(props.defaultTz3);
        let d3 = s.goto(selectedKey3);
        setTz3(d3);
        setDiffDay3(d3.day() - s.day());
        setMinStyle3({ transform: `rotate(${d3.minute() * 6}deg)` });
        setHrStyle3({ transform: `rotate(${d3.hour() * 30}deg)` });
    }, [props]);

    const today = "today";
    const tomorrow = "tomorrow";

    const [selectedKey1, setSelectedKey1] = React.useState<string>(props.defaultTz1);
    const [tz1, setTz1] = React.useState<any>(s.goto(selectedKey1));
    const [diffDay1, setDiffDay1] = React.useState<number>(tz1.day() - s.day());
    const [minStyle1, setMinStyle1] = React.useState<any>({ transform: `rotate(${tz1.minute() * 6}deg)` });
    const [hrStyle1, setHrStyle1] = React.useState<any>({ transform: `rotate(${tz1.hour() * 30}deg)` });

    const [selectedKey2, setSelectedKey2] = React.useState<string>(props.defaultTz2);
    const [tz2, setTz2] = React.useState<any>(s.goto(selectedKey2));
    const [diffDay2, setDiffDay2] = React.useState<number>(tz2.day() - s.day());
    const [minStyle2, setMinStyle2] = React.useState<any>({ transform: `rotate(${tz2.minute() * 6}deg)` });
    const [hrStyle2, setHrStyle2] = React.useState<any>({ transform: `rotate(${tz2.hour() * 30}deg)` });

    const [selectedKey3, setSelectedKey3] = React.useState<string>(props.defaultTz3);
    const [tz3, setTz3] = React.useState<any>(s.goto(selectedKey3));
    const [diffDay3, setDiffDay3] = React.useState<number>(tz3.day() - s.day());
    const [minStyle3, setMinStyle3] = React.useState<any>({ transform: `rotate(${tz3.minute() * 6}deg)` });
    const [hrStyle3, setHrStyle3] = React.useState<any>({ transform: `rotate(${tz3.hour() * 30}deg)` });

    const cbx1_onChange: IComboBoxProps['onChange'] = (event, option) => {
        let d = s.goto(option!.key as string);
        setSelectedKey1(option!.key as string);
        setTz1(d);
        setDiffDay1(d.day() - s.day());
        setMinStyle1({ transform: `rotate(${d.minute() * 6}deg)` });
        setHrStyle1({ transform: `rotate(${d.hour() * 30}deg)` });
    };
    const cbx2_onChange: IComboBoxProps['onChange'] = (event, option) => {
        let d = s.goto(option!.key as string);
        setSelectedKey2(option!.key as string);
        setTz2(d);
        setDiffDay2(d.day() - s.day());
        setMinStyle2({ transform: `rotate(${d.minute() * 6}deg)` });
        setHrStyle2({ transform: `rotate(${d.hour() * 30}deg)` });
    };
    const cbx3_onChange: IComboBoxProps['onChange'] = (event, option) => {
        let d = s.goto(option!.key as string);
        setSelectedKey3(option!.key as string);
        setTz3(d);
        setDiffDay3(d.day() - s.day());
        setMinStyle3({ transform: `rotate(${d.minute() * 6}deg)` });
        setHrStyle3({ transform: `rotate(${d.hour() * 30}deg)` });
    };


    let timezoneArray: Timezone[] = [];
    let timezoneCodes = Object.assign(timezoneArray, TimezoneIds);
    let timezoneCodesOptions: IComboBoxOption[] = [];

    timezoneCodes.forEach(tmz => {
        timezoneCodesOptions.push({ key: tmz.tz, text: tmz.displayName });
    });

    return (
        <div className="flex">
            {/* <p>Time in Canada/Pacific is: {s.format('time')}</p>
            <p>Time in {(tz1 as any).timezone().name} is: {(tz1 as any).format('time')} {showDay}</p> */}

            <div id="first">
                <div>
                    <ComboBox
                        id="tz1"
                        label="Timezone #1"
                        selectedKey={selectedKey1}
                        allowFreeform
                        autoComplete="on"
                        options={timezoneCodesOptions}
                        onChange={cbx1_onChange}
                    />
                    <div className="analog-clock">
                        <div className="dial minutes" style={minStyle1} />
                        <div className="dial hours" style={hrStyle1} />
                        {/* <div className="digital-clock">{(tz1 as any).format('time')}</div> */}
                    </div>
                    <div className="today-tomorrow">
                        {(tz1 as any).format('time')} {(diffDay1 === 1 ? tomorrow : today)}
                    </div>
                </div>
            </div>
            {
                props.hideTz2 ? "" :
                    <div id="second">
                        <div>
                            <ComboBox
                                id="tz2"
                                label="Timezone #2"
                                selectedKey={selectedKey2}
                                allowFreeform
                                autoComplete="on"
                                options={timezoneCodesOptions}
                                onChange={cbx2_onChange}
                            />
                            <div className="analog-clock">
                                <div className="dial minutes" style={minStyle2} />
                                <div className="dial hours" style={hrStyle2} />
                                {/* <div className="digital-clock">{(tz2 as any).format('time')}</div> */}
                            </div>
                            <div className="today-tomorrow">
                                {(tz2 as any).format('time')} {(diffDay2 === 1 ? tomorrow : today)}
                            </div>
                        </div>
                    </div>
            }
            {
                props.hideTz3 ? "" :
                    <div id="third">
                        <div>
                            <ComboBox
                                id="tz3"
                                label="Timezone #3"
                                selectedKey={selectedKey3}
                                allowFreeform
                                autoComplete="on"
                                options={timezoneCodesOptions}
                                onChange={cbx3_onChange}
                            />
                            <div className="analog-clock">
                                <div className="dial minutes" style={minStyle3} />
                                <div className="dial hours" style={hrStyle3} />
                                {/* <div className="digital-clock">{(tz3 as any).format('time')}</div> */}
                            </div>
                            <div className="today-tomorrow">
                                {(tz3 as any).format('time')} {(diffDay3 === 1 ? tomorrow : today)}
                            </div>
                        </div>
                    </div>
            }
        </div>
    );
}

export default TimezoneDisplayApp;