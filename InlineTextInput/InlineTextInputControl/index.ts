import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Control, { IControlProps, ISlug } from './extensions/Control'

export class InlineTextInputControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private theContainer: HTMLDivElement;
	private theNotifyOutputChanged: () => void;
	private htmlText: string;

	private props: IControlProps = {
		text: "",
		slugs: 	[],
		fontSize: 14,
		relayUpdates: this.getChangedDataFromReactComponent.bind(this)
	};

	/*
	HTML = <h1 style="background:#5f45cc;">Inline editor</h1><h2>slug1</h2><p>This is a static read-only text</p><p>slug2</p><p>test</p><p>slug3</p><p>slug4</p><p>slug5</p><p>testing</p>
	Config = 
	{
		'slugs': [{
				'slug': 'slug1',
				'replace': 'text to replace slug1'
			},
			{
				'slug': 'slug2',
				'replace': 'text to replace slug2'
			},
			{
				'slug': 'slug3',
				'replace': 'text to replace slug3'
			}
		]
	}
	*/

	/**
	 * Empty constructor.
	 */
	constructor() {

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
		this.theContainer = container;
		this.theNotifyOutputChanged = notifyOutputChanged;
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		this.props.slugs = [];
		let jsonraw = context.parameters.replacementConfig.raw ?? "";
		let jsondata = JSON.parse(jsonraw.replace(/'/gi, "\""));
		let jsonArray = jsondata["slugs"];
		jsonArray.forEach((s: any, indx: number) => {
			let _slug: ISlug = { id: indx, key: s?.slug, value: s?.replace };
			this.props.slugs.push(_slug)
		});

		this.props.text = context.parameters.htmlPreviewText.raw ?? "";
		this.props.fontSize = context.parameters.fontSize.raw ?? 14;
		this.renderReactDOM(this);
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		return {
			htmlPreviewText: this.htmlText
		};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void {
		ReactDOM.unmountComponentAtNode(this.theContainer);
	}

	/********** Private Functions **********/
	
	private getChangedDataFromReactComponent(keyReplace: string, newText: string): void {
		this.htmlText = this.props.text.replace(keyReplace, newText);
		this.theNotifyOutputChanged();
	}

	private renderReactDOM(parent: any): void {
		ReactDOM.render(
			// Create the React component
			React.createElement(
				Control,
				parent.props
			),
			parent.theContainer
		);
	}
}