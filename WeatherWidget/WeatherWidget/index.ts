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

		let parentObj: any = this;
		this.getCurrentWeatherData(this.localApiKey, this.localZipCode, this.localCountryCode)
			.then(
				function (parentvalue: weatherData.Current) {
					parentObj.getForecastData(parentObj.localApiKey, parentObj.localZipCode, parentObj.localCountryCode)
						.then(
							function (value: weatherData.Forecast) {
								debugger;

								// @ts-ignore
								parentObj.props.cityName = parentvalue.name;
								// @ts-ignore
								parentObj.props.currentTemprature = utilities.convertKelvinToFahrenheit(parentvalue.main.temp);
								// @ts-ignore
								parentObj.props.currentWeatherDescription = parentvalue.weather[0].description;
								// @ts-ignore
								parentObj.props.currentWindSpeed = utilities.convertMeterPerSecondsToMilePerHour(parentvalue.wind.speed);
								// @ts-ignore
								parentObj.props.currentWindDescription = utilities.describeWindSpeed(parentvalue.wind.speed);
								// @ts-ignore
								parentObj.props.currentWeatherIcon = constants.WEATHER_ICON_URL + parentvalue.weather[0].icon + "@2x.png";
								
								let forecast: IForecastData[] = [];
								value.list.map((item : weatherData.List, i: number) => {
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
		debugger;
		/*let parsedData: weatherData.Current = {
			weather: [{ description: "", icon: "" }],
			main: { humidity: 0, temp: 0, pressure: 0, temp_max: 0, temp_min: 0 },
			wind: { deg: 0, speed: 0 },
			name: ""
		};*/

		const apiUrl: string = constants.WEATHER_URL + "weather?zip=" + zip + "," + countrycode + "&appid=" + apiKey;
		const responseData: weatherData.Current = await this.callHttps(apiUrl);
		//// @ts-ignore
		//parsedData.weather.pop();

		/*let wea: weatherData.Weather = { description: responseData.weather[0].description, icon: responseData.weather[0].icon };
		
		//// @ts-ignore
		parsedData.weather.push(wea);

		let win: weatherData.Wind = { deg: responseData.wind.deg, speed: responseData.wind.speed };
		parsedData.wind = win;

		let mai: weatherData.Main = { humidity: responseData.main.humidity, pressure: responseData.main.pressure, temp: responseData.main.temp, temp_max: responseData.main.temp_max, temp_min: responseData.main.temp_min };
		parsedData.main = mai;
		parsedData.name = responseData.name;*/

		//parsedData = responseData;

		return responseData;
	}

	/**
	 * Gets 5 day - 3 hour forecast data for specified zipcode and countrycode
	 * @param apiKey Open Weather Data API Key
	 * @param zip ZipCode
	 * @param countrycode Country Code 
	 */
	private async getForecastData(apiKey: string, zip: string, countrycode: string): Promise<weatherData.Forecast> {
		/*let parsedData: weatherData.Forecast = {
			list: [{ 
				dt:0, 
				main: { humidity: 0, temp: 0, pressure: 0, temp_max: 0, temp_min: 0 },
				weather: [{ description: "", icon: "" }],
				wind: { deg: 0, speed: 0 },
				dt_txt: ""
			}]
		};*/

		const apiUrl: string = constants.WEATHER_URL + "forecast?zip=" + zip + "," + countrycode + "&appid=" + apiKey;
		const responseData: weatherData.Forecast = await this.callHttps(apiUrl);
		debugger;

		// parsedData.list.pop();
		// responseData.list.map((item: weatherData.List, i: number) => {
		// 	debugger;
		// 	parsedData.list.push(item);
		// });

		// let wea: weatherData.Weather = { description: responseData.weather[0].description, icon: responseData.weather[0].icon };
		// // @ts-ignore
		// parsedData.weather.pop();
		// // @ts-ignore
		// parsedData.weather.push(wea);

		// let win: weatherData.Wind = { deg: responseData.wind.deg, speed: responseData.wind.speed };
		// parsedData.wind = win;

		// let mai: weatherData.Main = { humidity: responseData.main.humidity, pressure: responseData.main.pressure, temp: responseData.main.temp, temp_max: responseData.main.temp_max, temp_min: responseData.main.temp_min };
		// parsedData.main = mai;
		// parsedData.name = responseData.name;

		return responseData;
		/*
		let responseData: weatherData.Forecast = { cod: "", message: 0, cnt: 0, list: undefined, city: undefined };
		let https = require('https');
		let apiUrl: string = constants.WEATHER_URL + "forecast?zip=" + zip + "," + countrycode + "&appid=" + apiKey;
		let weatherDataPath: string = constants.WEATHER_FORECAST_PATH + "?zip=" + zip + "," + countrycode + "&appid=" + apiKey;

		let requestParams = {
			method: 'GET',
			hostname: (new URL(apiUrl)).hostname,
			path: weatherDataPath,
		};

		let response = function (resp: any) {
			let body = '';
			resp.on('data', function (d: any) {
				body += d;
			});
			resp.on('end', function () {
				try {
					debugger;
					let respBody = JSON.parse(body);


				} catch (error) {
					//responseScore = 0;
				}
				// parent.props.sentimentValue = responseScore;
				// parent.renderReactDOM(parent);
			});
			resp.on('error', function (e: any) {
				console.log('Error: ' + e.message);
			});
		};

		let request = https.request(requestParams, response);
		request.end();

		return responseData;
		*/
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