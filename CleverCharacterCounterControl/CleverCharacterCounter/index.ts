import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CharacterCounterCircular, IProgressBarProps } from './extensions/CharacterCounterCircular';

export class CleverCharacterCounter implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private theContainer: HTMLDivElement;
	private theNotifyOutputChanged: () => void;

	private props: IProgressBarProps = {};
	private inputText: string;

	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		this.theContainer = container;
		this.theNotifyOutputChanged = notifyOutputChanged;

		let rowspan: number = (context.mode as any).rowSpan;

		this.props.textValue = context.parameters.BoundControlInput.raw || "";
		this.props.maximumChars = context.parameters.MaximumCharacterLimit.raw || 100;
		this.props.currentChars = context.parameters.BoundControlInput.raw?.length || 0;
		this.props.isRequired = context.parameters.BoundControlInput.attributes?.RequiredLevel === 1 ? true : false;
		this.props.errorMessage = context.parameters.BoundControlInput.errorMessage;
		this.props.numberOfLines = rowspan;
		this.props.isDisabled = context.mode.isControlDisabled;

		this.props.relayNewData = this.getChangedDataFromReactComponent.bind(this);

		this.renderReactDOM(this);
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		this.props.textValue = context.parameters.BoundControlInput.raw || "";
		this.props.currentChars = context.parameters.BoundControlInput.raw?.length || 0;
		this.props.isRequired = context.parameters.BoundControlInput.attributes?.RequiredLevel === 1 ? true : false;
		this.props.errorMessage = context.parameters.BoundControlInput.errorMessage;
		this.props.isDisabled = context.mode.isControlDisabled;
		this.renderReactDOM(this);
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			BoundControlInput: this.inputText
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		ReactDOM.unmountComponentAtNode(this.theContainer);
	}

	/********** Private Functions **********/

	private getChangedDataFromReactComponent(newText: string): void {
		debugger;
		this.inputText = newText;
		this.theNotifyOutputChanged();
	}

	private renderReactDOM(parent: any): void {
		ReactDOM.render(
			// Create the React component
			React.createElement(
				CharacterCounterCircular,
				parent.props
			),
			parent.theContainer
		);
	}
}