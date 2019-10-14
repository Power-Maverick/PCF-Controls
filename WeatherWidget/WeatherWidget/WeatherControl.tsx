import * as React from "react";
import weatherData = require('./common/weatherApi');
import { string } from "prop-types";

export interface IWeatherControlProps {
    cityName?: string;
    currentTemprature?: string;
    currentWeatherDescription?: string;
    currentWindSpeed?: number;
    currentWindDescription?: string;
    currentWeatherIcon?: string;

    positionCityName?: string;
    positionTemprature?: string;
    positionShow?: boolean;

    forecast?: IForecastData[];
}

export interface IForecastData {
    day?: string;
    date?: string;
    time?: string;
    weatherIcon?: string;
    tempratureMax?: string;
    tempratureMin?: string;
}

export interface IWeatherControlState extends React.ComponentState {

}

export class WeatherControl extends React.Component<IWeatherControlProps, IWeatherControlState> {

    constructor(props: IWeatherControlProps) {
        super(props);

        this.state = {
            cityName: props.cityName,
            currentTemprature: props.currentTemprature,
            currentWeatherDescription: props.currentWeatherDescription,
            currentWindSpeed: props.currentWindSpeed,
            currentWindDescription: props.currentWindDescription,
            currentWeatherIcon: props.currentWeatherIcon,
            forecast: props.forecast,
            positionCityName: props.positionCityName,
            positionTemprature: props.positionTemprature,
            positionShow: props.positionShow
        };
    }

    public componentWillReceiveProps(newProps: IWeatherControlProps): void {
        this.setState(newProps);
    }

    public render(): JSX.Element {
        
        let forecastRow: any[] = [];
        let currentLocation: any;

        if (this.state.forecast) {
            this.state.forecast.map((value: IForecastData, index: number) => {
                let data: any = <li className={"calendar-item"}>
                                    {value.day}
                                    <br></br>
                                    {value.date}
                                    <br></br>
                                    {value.time}
                                    <img src={value.weatherIcon}></img>
                                    {"Min.: "}{value.tempratureMin}{" °F"}
                                    <br></br>
                                    {"Max.: "}{value.tempratureMax}{" °F"}
                                </li>
                
                forecastRow.push(data);
            });
        }

        if (this.state.positionShow) {
            currentLocation =   <div className={"widgetHead"}>
                                    {"Current Location: "}{this.state.positionCityName}{" | "}{this.state.positionTemprature}{" °F"}
                                </div>
        }
        else {
            currentLocation =   <div className={"widgetHead"}>
                                    {"Current Location Not Available"}
                                </div>
        }

        return (
            <div>
                <div className={"widgetHead"}>
                    {currentLocation}
                </div>
                <div className={"widgetBody"}>
                    <div className={"todayCard"}>
                        <div className={"todayCard-top"}>
                            {this.state.cityName}
                        </div>
                        <div className={"todayCard-middle"}>
                            <img src={this.state.currentWeatherIcon} ></img>
                            <p className={"todayCard-middle-number"}>
                                {this.state.currentTemprature}
                                <span className={"todayCard-middle-degree"}> °F</span>
                            </p>
                        </div>
                        <div className={"todayCard-bottom"}>
                            <p className={"todayCard-bottom-means"}>{this.state.currentWeatherDescription}</p>
                            <p className={"todayCard-bottom-wind"}>Wind: {this.state.currentWindSpeed} m/h {this.state.currentWindDescription}</p>
                        </div>
                    </div>
                    <div className={"calendarCard"}>
                        <ul className={"calendar"}>
                            {forecastRow}
                        </ul>
                        <div className={"calendarTempratureCard"}>

                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /********** PRIVATE FUNCTIONS **********/
    
}