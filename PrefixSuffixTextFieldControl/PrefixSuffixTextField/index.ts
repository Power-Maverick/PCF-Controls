import React = require("react");
import ReactDOM = require("react-dom");
import CustomTextField, { DisplayOption, ICustomTextFieldProps } from "./components/CustomTextField";
import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class PrefixSuffixTextField implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    /**
     * Global Variables
     */
    private theContainer: HTMLDivElement;
    private theNotifyOutputChanged: () => void;
    private newValue: string;

    /**
     * React properties
     */
    private props: ICustomTextFieldProps = {
        displayOptions: DisplayOption.Both,
        relayUpdates: this.getChangedDataFromReactComponent.bind(this),
    };

    /**
     * Empty constructor.
     */
    constructor() {}

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        this.theNotifyOutputChanged = notifyOutputChanged;
        this.theContainer = container;
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this.props.currentValue = context.parameters.textField.raw!;
        this.props.prefix = context.parameters.prefixValue.raw!;
        this.props.suffix = context.parameters.suffixValue.raw!;

        switch (context.parameters.displayOption.raw) {
            case "0":
                this.props.displayOptions = DisplayOption.PrefixOnly;
                break;
            case "1":
                this.props.displayOptions = DisplayOption.SuffixOnly;
                break;
            case "2":
                this.props.displayOptions = DisplayOption.Both;
                break;
            default:
                break;
        }

        this.renderReactDOM();
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        return {
            textField: this.newValue,
        };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }

    //#region Private Methods

    private getChangedDataFromReactComponent(newText: string): void {
        this.newValue = newText;
        this.theNotifyOutputChanged();
    }

    private renderReactDOM(): void {
        ReactDOM.render(
            // Create the React component
            React.createElement(CustomTextField, this.props),
            this.theContainer,
        );
    }

    //#endregion
}
