export interface Forecast {
    // cod: string;
    // message: number;
    // cnt: number;
    list: List[];
    //city: City;
}

export interface Current {
    //coord:      Coord | undefined;
    weather: Weather[];
    //base:       string;
    main: Main;
    //visibility: number;
    wind: Wind;
    // clouds:     Clouds | undefined;
    // dt:         number;
    // sys:        Sys | undefined;
    // timezone:   number;
    // id:         number;
    name: string;
    // cod:        number;
}

export interface City {
    name: string;
    //coord: Coord;
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
}

export interface Coord {
    lat: number;
    lon: number;
}

export interface List {
    dt: number;
    main: Main;
    weather: Weather[];
    //clouds: Clouds;
    wind: Wind;
    //sys: Sys;
    dt_txt: string;
}

export interface Sys {
    pod: string;
}

export interface Wind {
    speed: number;
    deg: number;
}

export interface Clouds {
    all: number;
}

export interface Weather {
    //id: number;
    //main: string;
    description: string;
    icon: string;
}

export interface Main {
    temp: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    //sea_level: number;
    //grnd_level: number;
    humidity: number;
    //temp_kf: number;
}