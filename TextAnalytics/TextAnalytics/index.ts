import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { TextAnalyser, ITextAnalyserProps } from './Analyser';

export class TextAnalytics implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	// Reference to the notifyOutputChanged method
	private notifyOutputChanged: () => void;
	// Reference to the container div
	private theContainer: HTMLDivElement;
	// Reference to the React props, prepopulated with a bound event handler
	private props: ITextAnalyserProps = {

	}
	// Local variable to captures changes
	private localTextInput: string;
	private localSubscriptionKey: string;
	private localEndpoint: string;

	private localdetectLanguage: boolean;
	private localidentifyKeyPhrases: boolean;
	private localidentifyEntities: boolean;

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
		this.notifyOutputChanged = notifyOutputChanged;

		this.localTextInput = context.parameters.TextInput.raw || "";
		this.localSubscriptionKey = context.parameters.SubscriptionKey.raw || "";
		this.localEndpoint = context.parameters.Endpoint.raw || "";

		this.localdetectLanguage = context.parameters.DetectLanguage.raw;
		this.localidentifyKeyPhrases = context.parameters.IdentifyKeyPhrase.raw;
		this.localidentifyEntities = context.parameters.IdentifyEntities.raw;
		this.theContainer = container;

		this.getSentimentValue(this, this.localSubscriptionKey, this.localEndpoint, this.localTextInput, this.localdetectLanguage, this.localidentifyKeyPhrases, this.localidentifyEntities);
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		if (this.localTextInput !== context.parameters.TextInput.raw
			|| this.localSubscriptionKey !== context.parameters.SubscriptionKey.raw
			|| this.localEndpoint !== context.parameters.Endpoint.raw
			|| this.localdetectLanguage !== context.parameters.DetectLanguage.raw
			|| this.localidentifyKeyPhrases !== context.parameters.IdentifyKeyPhrase.raw
			|| this.localidentifyEntities !== context.parameters.IdentifyEntities.raw) {

			this.localTextInput = context.parameters.TextInput.raw || "";
			this.localSubscriptionKey = context.parameters.SubscriptionKey.raw || "";
			this.localEndpoint = context.parameters.Endpoint.raw || "";

			this.localdetectLanguage = context.parameters.DetectLanguage.raw;
			this.localidentifyKeyPhrases = context.parameters.IdentifyKeyPhrase.raw;
			this.localidentifyEntities = context.parameters.IdentifyEntities.raw;

			this.getSentimentValue(this, this.localSubscriptionKey, this.localEndpoint, this.localTextInput, this.localdetectLanguage, this.localidentifyKeyPhrases, this.localidentifyEntities);
			this.renderReactDOM(this);
		}
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		return {
			TextInput: this.localTextInput
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

	/**
	 * Calls Text Analytics API to fetch the sentiment score and other details
	 * @param k Subscription Key for Text Analytics API
	 * @param ep Endpoint for Text Analytics API
	 */
	private getSentimentValue(parent: any, k: string, ep: string, textToAnalyse: string, isLang: boolean, isKP: boolean, isEntities: boolean): void {
		let responseScore: number = 0;
		let responseLanguage: string = "";
		let responseKeyPhrases: string = "";
		let responseEntities: any;

		let https = require('https');

		let sentimentPath = '/text/analytics/v2.1/sentiment';
		let languagesPath = '/text/analytics/v2.1/languages';
		let keyPhrasesPath = '/text/analytics/v2.1/keyPhrases';
		let entitiesPath = '/text/analytics/v2.1/entities';

		let inputDocuments = {
			'documents': [
				{ 'id': '1', 'text': textToAnalyse }
			]
		};

		let body = JSON.stringify(inputDocuments);

		/**
		 * Validations
		 */
		// Condition for Testing Only -  || k === "val" || ep === "val" 
		if (k === "" || ep === "" || k === undefined || ep === undefined) {
			parent.props.sentimentValue = 0;
			parent.props.detectLanguage = false;
			parent.props.identifyKeyPhrases = false;
			parent.props.identifyEntities = false;
			parent.props.showError = true;
			parent.renderReactDOM(parent);
			return;
		}
		else {
			parent.props.detectLanguage = true;
			parent.props.identifyKeyPhrases = true;
			parent.props.identifyEntities = true;
			parent.props.showError = false;
		}

		/**
		 * Sentiment Score
		 */
		let sentimentRequestParams = {
			method: 'POST',
			hostname: (new URL(ep)).hostname,
			path: sentimentPath,
			headers: {
				'Ocp-Apim-Subscription-Key': k,
			}
		};

		let sentimentResponse = function (response: any) {
			let body = '';
			response.on('data', function (d: any) {
				body += d;
			});
			response.on('end', function () {
				try {
					let responseBody = JSON.parse(body);
					responseScore = responseBody.documents[0].score;
				} catch (error) {
					responseScore = 0;
				}
				parent.props.sentimentValue = responseScore;
				parent.renderReactDOM(parent);
			});
			response.on('error', function (e: any) {
				console.log('Error: ' + e.message);
			});
		};

		let sentimentRequest = https.request(sentimentRequestParams, sentimentResponse);
		sentimentRequest.write(body);
		sentimentRequest.end();

		if (isLang) {
			/**
			 * Language
			 */
			let languageRequestParams = {
				method: 'POST',
				hostname: (new URL(ep)).hostname,
				path: languagesPath,
				headers: {
					'Ocp-Apim-Subscription-Key': k,
				}
			};

			let languageResponse = function (response: any) {
				let body = '';
				response.on('data', function (d: any) {
					body += d;
				});
				response.on('end', function () {
					try {
						let responseBody = JSON.parse(body);
						responseLanguage = responseBody.documents[0].detectedLanguages[0].name;
					} catch (error) {
						responseLanguage = "N/A";
					}
					parent.props.languages = responseLanguage;
					parent.props.detectLanguage = true;
					parent.renderReactDOM(parent);
				});
				response.on('error', function (e: any) {
					console.log('Error: ' + e.message);
				});
			};

			let languageRequest = https.request(languageRequestParams, languageResponse);
			languageRequest.write(body);
			languageRequest.end();
		}
		else {
			parent.props.detectLanguage = false;
			parent.renderReactDOM(parent);
		}


		if (isKP) {
			/**
			 * Key Phrase
			 */
			let keyPhrasesRequestParams = {
				method: 'POST',
				hostname: (new URL(ep)).hostname,
				path: keyPhrasesPath,
				headers: {
					'Ocp-Apim-Subscription-Key': k,
				}
			};

			let keyPhrasesResponse = function (response: any) {
				let body = '';
				response.on('data', function (d: any) {
					body += d;
				});
				response.on('end', function () {
					try {
						let responseBody = JSON.parse(body);
						responseKeyPhrases = responseBody.documents[0].keyPhrases.join();
					} catch (error) {
						responseKeyPhrases = "N/A";
					}
					parent.props.keyPhrases = responseKeyPhrases;
					parent.props.identifyKeyPhrases = true;
					parent.renderReactDOM(parent);
				});
					response.on('error', function (e: any) {
					console.log('Error: ' + e.message);
				});
			};
			let keyPhraseRequest = https.request(keyPhrasesRequestParams, keyPhrasesResponse);
			keyPhraseRequest.write(body);
			keyPhraseRequest.end();
		}
		else {
			parent.props.identifyKeyPhrases = false;
			parent.renderReactDOM(parent);
		}

		if (isEntities) {
			/**
			 * Entities
			 */
			let entitiesRequestParams = {
				method: 'POST',
				hostname: (new URL(ep)).hostname,
				path: entitiesPath,
				headers: {
					'Ocp-Apim-Subscription-Key': k,
				}
			};

			let entitiesResponse = function (response: any) {
				let body = '';
				response.on('data', function (d: any) {
					body += d;
				});
				response.on('end', function () {
					try {
						let responseBody = JSON.parse(body);
						responseEntities = responseBody.documents[0].entities;
					} catch (error) {
						//responseEntities = "N/A";
					}
					parent.props.entities = responseEntities;
					parent.props.identifyEntities = true;
					parent.renderReactDOM(parent);
				});
				response.on('error', function (e: any) {
					console.log('Error: ' + e.message);
				});
			};

			let entitiesRequest = https.request(entitiesRequestParams, entitiesResponse);
			entitiesRequest.write(body);
			entitiesRequest.end();
		}
		else {
			parent.props.identifyEntities = false;
			parent.renderReactDOM(parent);
		}
	}

	private renderReactDOM(parent: any): void {
		ReactDOM.render(
			// Create the React component
			React.createElement(
				TextAnalyser,
				parent.props
			),
			parent.theContainer
		);
	}
}
