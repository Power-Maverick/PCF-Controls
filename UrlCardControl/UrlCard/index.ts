import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CardHorizontalExample, ICardProps } from './extensions/Card';
import { Config } from "./extensions/config";

const config: Config = require('../maverickconfig.json');

export class UrlCard implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private theContainer: HTMLDivElement;
	private theNotifyOutputChanged: () => void;

	private props: ICardProps = {}
	private currentUrl: string;
	private apiKey: string;

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

		if (context.parameters.Url.raw) {
			this.props.triggerOnChange = this.urlOnChange.bind(this);
			this.props.triggerOnClick = this.openUrl.bind(this);

			let urlToPreview = context.parameters.Url.raw;
			this.apiKey = context.parameters.LinkPreviewApiKey.raw || config.defaultApiKey;
			this.props.label = context.parameters.Url.attributes?.DisplayName;
			this.props.isRequired = context.parameters.Url.attributes?.RequiredLevel === 1 ? true : false;
			this.props.errorMessage = context.parameters.Url.errorMessage;
			this.props.urlText = urlToPreview;

			this.fetchUrlMetadata(urlToPreview, this.apiKey);
		}
	}

	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		// No update view implemented
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		return {
			Url: this.currentUrl
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

	private urlOnChange(event: any, newUrl?: string): void {
		if (this.currentUrl !== newUrl) {
			this.currentUrl = newUrl || "";
			this.fetchUrlMetadata(this.currentUrl, this.apiKey);
			this.theNotifyOutputChanged();
		}
	}

	private openUrl(): void {
		window.open(this.currentUrl, "_blank");
	}

	private fetchUrlMetadata(urlToPreview: string, apiKey: string) {
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		var raw = JSON.stringify({ "q": urlToPreview, "key": apiKey });
		var requestOptions: RequestInit = {
			method: 'POST',
			headers: myHeaders,
			body: raw,
			redirect: 'follow'
		};
		fetch(config.linkPreviewApiUrl, requestOptions)
			.then(response => response.json())
			.then(data => {
				console.log(JSON.stringify(data));
				this.props.title = data.title;
				this.props.description = data.description;
				this.props.image = data.image;
				this.props.domain = data.url;
				this.currentUrl = urlToPreview;

				this.renderReactDOM(this);
			})
			.catch(error => console.log('error', error));
	}

	private renderReactDOM(parent: any): void {
		ReactDOM.render(
			// Create the React component
			React.createElement(
				CardHorizontalExample,
				parent.props
			),
			parent.theContainer
		);
	}
}