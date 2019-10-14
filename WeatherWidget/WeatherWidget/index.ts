import { IInputs, IOutputs } from "./generated/ManifestTypes";
import constants = require("./common/constants");
import utilities = require('./common/utilities');
import weatherData = require('./common/weatherApi');
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { WeatherControl, IWeatherControlProps, IForecastData } from './WeatherControl';

export class WeatherWidget implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	/**
	 * Global Component Variables
	 */
	private notifyOutputChanged: () => void;
	private theContainer: HTMLDivElement;

	/**
	 * Local variable to captures changes
	 */
	private localZipCode: string;
	private localCountryCode: string;
	private localApiKey: string;

	// Reference to the React props, prepopulated with a bound event handler
	private props: IWeatherControlProps = {

	}

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
		this.theContainer = container;
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		this.localZipCode = context.parameters.ZipCode.raw || "";
		this.localCountryCode = context.parameters.CountryCode.raw || "";
		this.localApiKey = context.parameters.ApiKey.raw || "";

		let lat: number = 0;
		let lon: number = 0;

		if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
				lat = position.coords.latitude;
				lon = position.coords.longitude;
            }, function () {
				// handle error
            });
        }

		let parentObj: any = this;
		this.getCurrentWeatherData(this.localApiKey, this.localZipCode, this.localCountryCode)
			.then(
				function (parentvalue: weatherData.Current) {
					parentObj.getForecastData(parentObj.localApiKey, parentObj.localZipCode, parentObj.localCountryCode)
						.then(
							function (value: weatherData.Forecast) {
								parentObj.getCurrentWeatherDataByPosition(parentObj.localApiKey, lat, lon)
									.then(
										function (positionvalue: weatherData.Current) {
											// @ts-ignore
											parentObj.props.cityName = parentvalue.name;
											// @ts-ignore
											parentObj.props.currentTemprature = utilities.convertKelvinToFahrenheit(parentvalue.main.temp).toFixed(2);
											// @ts-ignore
											parentObj.props.currentWeatherDescription = parentvalue.weather[0].description;
											// @ts-ignore
											parentObj.props.currentWindSpeed = utilities.convertMeterPerSecondsToMilePerHour(parentvalue.wind.speed);
											// @ts-ignore
											parentObj.props.currentWindDescription = utilities.describeWindSpeed(parentvalue.wind.speed);
											// @ts-ignore
											parentObj.props.currentWeatherIcon = constants.WEATHER_ICON_URL + parentvalue.weather[0].icon + "@2x.png";

											// @ts-ignore
											parentObj.props.positionCityName = positionvalue.name;
											// @ts-ignore
											parentObj.props.positionTemprature = utilities.convertKelvinToFahrenheit(positionvalue.main.temp).toFixed(2);
											// @ts-ignore
											parentObj.props.positionShow = (lat === 0 && lon === 0) ? false : true;

											let forecast: IForecastData[] = [];
											value.list.map((item: weatherData.List, i: number) => {
												let convertedDate: Date = new Date(item.dt_txt);
												let f: IForecastData = {
													day: constants.DAY_NAMES[convertedDate.getDay()],
													date: convertedDate.getDate() + " " + constants.MONTH_NAMES[convertedDate.getMonth()],
													time: convertedDate.getHours() + ":00",
													weatherIcon: constants.WEATHER_ICON_URL + item.weather[0].icon + "@2x.png",
													tempratureMax: utilities.convertKelvinToFahrenheit(item.main.temp_max).toFixed(2),
													tempratureMin: utilities.convertKelvinToFahrenheit(item.main.temp_min).toFixed(2)
												};
												forecast.push(f);
											});
											// @ts-ignore
											parentObj.props.forecast = forecast;

											parentObj.renderReactDOM(parentObj);
										},
										function (error: any) {

										}
									);
								
							},
							function (reason: any) {

							}
						);
				},
				function (reason: any) {

				}
			);
		
		
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs {
		return {
			CountryCode: this.localCountryCode,
			ZipCode: this.localZipCode
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
	private renderReactDOM(parent: any): void {
		ReactDOM.render(
			// Create the React component
			React.createElement(
				WeatherControl,
				parent.props
			),
			parent.theContainer
		);
	}

	/**
	 * Gets current weather data for specified zipcode and countrycode
	 * @param apiKey Open Weather Data API Key
	 * @param zip ZipCode
	 * @param countrycode Country Code 
	 */
	private async getCurrentWeatherData(apiKey: string, zip: string, countrycode: string): Promise<weatherData.Current> {
		const apiUrl: string = constants.WEATHER_URL + "weather?zip=" + zip + "," + countrycode + "&appid=" + apiKey;
		const responseData: weatherData.Current = await this.callHttps(apiUrl);
		return responseData;
	}

	/**
	 * Gets current weather data for specified lat and loong
	 * @param apiKey Open Weather Data API Key
	 * @param lat Latitude
	 * @param long Longitude 
	 */
	private async getCurrentWeatherDataByPosition(apiKey: string, lat: string, long: string): Promise<weatherData.Current> {
		const apiUrl: string = constants.WEATHER_URL + "weather?lat=" + lat + "&lon=" + long + "&appid=" + apiKey;
		const responseData: weatherData.Current = await this.callHttps(apiUrl);
		return responseData;
	}

	/**
	 * Gets 5 day - 3 hour forecast data for specified zipcode and countrycode
	 * @param apiKey Open Weather Data API Key
	 * @param zip ZipCode
	 * @param countrycode Country Code 
	 */
	private async getForecastData(apiKey: string, zip: string, countrycode: string): Promise<weatherData.Forecast> {
		const apiUrl: string = constants.WEATHER_URL + "forecast?zip=" + zip + "," + countrycode + "&appid=" + apiKey;
		const responseData: weatherData.Forecast = await this.callHttps(apiUrl);

		return responseData;
	}

	private callHttps(url: string): Promise<any> {
		const https = require("https");

		return new Promise<string>(resolve => {
			https.get(url, (res: any) => {
				res.setEncoding("utf8");
				let body = "";
				res.on("data", (data: any) => {
					body += data;
				});
				res.on("end", () => {
					let respBody: any = JSON.parse(body);
					resolve(respBody);
				});
			});
		});
	}
}