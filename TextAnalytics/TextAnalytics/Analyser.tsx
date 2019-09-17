import * as React from "react";
import { Rating, RatingSize } from 'office-ui-fabric-react/lib/Rating';
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";

initializeIcons(undefined, { disableWarnings: true });

export interface ITextAnalyserProps {
    sentimentValue?: number;
    languages?:string;
    keyPhrases?:string;
    entities?:any;

    detectLanguage?: boolean;
    identifyKeyPhrases?: boolean;
    identifyEntities?: boolean;
    showError?: boolean;
}

export interface ITextAnalyserState extends React.ComponentState {
}

export class TextAnalyser extends React.Component<ITextAnalyserProps, ITextAnalyserState> {

    constructor(props: ITextAnalyserProps) {
        super(props);

        this.state = {
            sentimentValue: props.sentimentValue || 0,
            languages: props.languages || "N/A",
            keyPhrases: props.keyPhrases || "N/A",
            entities: props.entities || undefined,

            detectLanguage: props.detectLanguage || true,
            identifyKeyPhrases: props.identifyKeyPhrases || true,
            identifyEntities: props.identifyEntities || true,

            showError: props.showError || false,
        };
    }

    public componentWillReceiveProps(newProps: ITextAnalyserProps): void {
        this.setState(newProps);
    }

    createEntities = (entitiesData: any) => {
        let tdChildren: any = [];
        let tdParent: any;
    
        for (let i = 0; i < entitiesData.length; i++) {
            if (entitiesData[i].wikipediaUrl) {
                tdChildren.push(<a href={`${entitiesData[i].wikipediaUrl}`} target={"_blank"}>{`${entitiesData[i].name}`}</a>);
                tdChildren.push(<span>&nbsp;&nbsp;{`(${entitiesData[i].type})`}</span>);
                tdChildren.push(<br></br>);
            }
            else{
                tdChildren.push(<span>{`${entitiesData[i].name}`}</span>);
                tdChildren.push(<span>&nbsp;&nbsp;{`(${entitiesData[i].type})`}</span>);
                tdChildren.push(<br></br>);
            }
        }
        tdParent = <td>{tdChildren}</td>;
        return tdParent;
      }

    public render(): JSX.Element {
        let sentimentRow: any, languageRow: any, keyPhrasesRow: any, entititesRow: any, entityRow: any;

        if (this.state.showError) {
            sentimentRow =  <tr>
                                <td colSpan={2}>
                                    {"Error occured while analysing the text. Check your Subscription Key and Endpoint."}
                                </td>
                            </tr>;
        }
        else {
            sentimentRow =  <tr>
                                <td>
                                    {"SENTIMENT SCORE:"}
                                </td>
                                <td>
                                    <Rating
                                        min={1}
                                        max={10}
                                        size={RatingSize.Large}
                                        rating={(this.state.sentimentValue * 10)}
                                        readOnly={true}
                                        getAriaLabel={this._getRatingComponentAriaLabel}
                                        ariaLabelFormat={'{0} of {1} stars selected'}
                                    />
                                    {(this.state.sentimentValue * 100).toFixed(2) + "%"}
                                </td>
                            </tr>;
        }

        if (this.state.detectLanguage) {
            languageRow =   <tr>
                                <td>
                                    {"LANGUAGES:"}
                                </td>
                                <td>
                                    {this.state.languages}
                                </td>
                            </tr>;
        }
        else {
            languageRow = "";
        }

        if (this.state.identifyKeyPhrases) {
            keyPhrasesRow = <tr>
                                <td>
                                    {"KEY PHRASES:"}
                                </td>
                                <td>
                                    {this.state.keyPhrases}
                                </td>
                            </tr>;
        }
        else {
            keyPhrasesRow = "";
        }

        if (this.state.identifyEntities && this.state.entities) {
            entititesRow = <tr>
                                <td>
                                    {"ENTITIES:"}
                                </td>
                                {this.createEntities(this.state.entities)}
                            </tr>;
        }
        else {
            entititesRow = "";
        }

        return (
            <div className={"mainWrapper"}>
                <table className={"table table-striped table-sm"}>
                    <tbody>
                        {sentimentRow}
                        {languageRow}
                        {keyPhrasesRow}
                        {entititesRow}
                    </tbody>
                </table>


            </div>
        );
    }

    /********** PRIVATE FUNCTIONS **********/
    private _getRatingComponentAriaLabel(rating: number, maxRating: number): string {
        return `Rating value is ${rating} of ${maxRating}`;
    }
}