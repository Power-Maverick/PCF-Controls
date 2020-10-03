import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import TimezoneDisplayApp, { ITimezoneProps } from './extensions/TimezoneDisplayApp'
import { parse } from "path";

export class TimezoneConverter implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private theContainer: HTMLDivElement;
	private theNotifyOutputChanged: () => void;
	private htmlText: string;

	private props: ITimezoneProps = {
		userDate: '2019/05/15 05:00PM',
		defaultTz1: 'America/New_York',
		defaultTz2: 'Europe/London',
		defaultTz3: 'Asia/Shanghai'
	};


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

		var offset = context.userSettings.getTimeZoneOffsetMinutes();
		console.log(offset);

		this.props.defaultTz1 = context.parameters.DefaultTimezone1.raw || "America/New_York";
		this.props.defaultTz2 = context.parameters.DefaultTimezone2.raw || "Europe/London";
		this.props.defaultTz3 = context.parameters.DefaultTimezone3.raw || "Asia/Shanghai";
		let displaySelection = context.parameters.NumberOfTimezoneDisplay.raw || "All";
		switch (displaySelection) {
			case "1":
				this.props.hideTz2 = true;
				this.props.hideTz3 = true;
				break;
			case "2":
				this.props.hideTz2 = false;
				this.props.hideTz3 = true;
				break;
			default:
				this.props.hideTz2 = false;
				this.props.hideTz3 = false;
				break;
		}
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		this.props.userDate = context.parameters.UserDateTime.raw?.toISOString() || "";
		this.renderReactDOM(this);
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {};
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
	
	private renderReactDOM(parent: any): void {
		ReactDOM.render(
			// Create the React component
			React.createElement(
				TimezoneDisplayApp,
				parent.props
			),
			parent.theContainer
		);
	}
}