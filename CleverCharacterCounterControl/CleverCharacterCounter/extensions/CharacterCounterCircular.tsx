import * as React from "react";
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Stack } from 'office-ui-fabric-react';
import {
    Callout,
    DirectionalHint,
    DelayedRender,
    DefaultButton,
    Text,
    getTheme, 
    FontWeights,
    mergeStyleSets
} from 'office-ui-fabric-react';
import {
    CircularProgressbar,
    buildStyles
} from "react-circular-progressbar";

export interface IProgressBarProps {
    textValue?: string;
    isRequired?: boolean;
    isDisabled?: boolean;
    errorMessage?: string;
    maximumChars?: number;
    currentChars?: number;
    numberOfLines?: number;

    relayNewData?: (newValue: string) => void;
}

export interface IProgressBarState extends React.ComponentState {
}

const theme = getTheme();
const styles = mergeStyleSets({
    callout: {
        maxWidth: 300,
    },
    subtext: [
        theme.fonts.small,
        {
            margin: 0,
            display: 'block',
            height: '100%',
            padding: '24px 20px',
            fontWeight: FontWeights.semilight,
        },
    ],
    inner: {
      height: '100%',
      padding: '0 24px 20px',
    },
});

export class CharacterCounterCircular extends React.Component<IProgressBarProps, IProgressBarState> {

    constructor(props: IProgressBarProps) {
        super(props);

        this.state = {
            textValue: props.textValue || "",
            isRequired: props.isRequired || false,
            errorMessage: props.errorMessage || "",
            maximumChars: props.maximumChars || 100,
            currentChars: props.currentChars || 0,
            percentage: props.maximumChars != undefined && props.currentChars != undefined ? (props.currentChars / props.maximumChars) * 100 : 0,
            numberOfLines: props.numberOfLines || 1,
            isDisabled: props.isDisabled || false,
            isCalloutVisible: false,
            isUserDismissed: false,

            relayNewData: props.relayNewData,
        };
    }

    public componentWillReceiveProps(newProps: IProgressBarProps): void {
        this.setState(newProps);
    }

    public render(): JSX.Element {
        let pbPathColor: string = "#1597ed";
        let textBoxRow: any

        if (this.state.percentage > 90) {
            pbPathColor = "#d41e1e";
        }
        else if (this.state.percentage > 70) {
            pbPathColor = "#edb015";
        }
        
        if (this.state.percentage > 100 && !this.state.isCalloutVisible && !this.state.isUserDismissed) {
            this.setState(
                () => {
                    return { 
                        isCalloutVisible: true
                    }
                }
            );
        }
        else if(this.state.percentage <= 100 && this.state.isCalloutVisible)
        {
            this.setState(
                () => {
                    return { 
                        isCalloutVisible: false
                    }
                }
            );
        }

        if (this.state.isRequired) {
            textBoxRow =  <TextField
                                required
                                errorMessage={this.state.errorMessage}
                                defaultValue={this.state.textValue}
                                rows={this.state.numberOfLines}
                                onChange={ (e,v) => this.OnChange(e,v)}
                                disabled={this.state.isDisabled}
                            />;
        }
        else {
            textBoxRow =  <TextField
                                errorMessage={this.state.errorMessage}
                                defaultValue={this.state.textValue}
                                rows={this.state.numberOfLines}
                                onChange={ (e,v) => this.OnChange(e,v)}
                                disabled={this.state.isDisabled}
                            />;
        }

        return (
            <Stack className="mainStack">
                {textBoxRow}
                <>
                    {this.state.isCalloutVisible && (
                        <Callout
                            className={styles.callout}
                            target={".cpbWrapperDiv"}
                            role="status"
                            aria-live="assertive"
                            directionalHint={DirectionalHint.leftCenter}
                        >
                        <DelayedRender>
                            <>
                            <div>
                                <Text className={styles.subtext}>Character limit has reached. Please make sure you enter text within the limits.</Text>
                            </div>
                            <div className={styles.inner}>
                                    <DefaultButton onClick={() => {
                                        this.setState(
                                            () => {
                                                return {
                                                    isCalloutVisible: false,
                                                    isUserDismissed: true
                                                }
                                            }
                                        );
                                    }}
                                    text="Dismiss" />
                            </div>
                            </>
                        </DelayedRender>
                        </Callout>
                    )}
                    <div className="cpbWrapperDiv">
                        <div className="cpbMainDiv">
                            <CircularProgressbar 
                                value={this.state.percentage} 
                                styles={buildStyles({
                                    pathColor: pbPathColor,
                                })}
                                text={`${(this.state.maximumChars - this.state.currentChars)}`} />
                        </div>
                    </div>
                </>
            </Stack>
        );
    }

    private OnChange(ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newText: string | undefined): void {
        this.setState(
            () => {
                return { 
                    percentage: newText != undefined ? (newText.length / this.state.maximumChars) * 100 : 0,
                    currentChars: newText != undefined ? newText.length : 0
                }
            }
        );

        this.state.relayNewData(newText != undefined ? newText : "");
    }
}