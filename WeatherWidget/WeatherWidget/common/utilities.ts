import constants = require('./constants');
 
export function degreeToDirection(num: number) {
  var val= Math.floor((num / 22.5) + .5);
  return constants.WIND_DIRECTIONS[(val % 16)];
}
 
export function describeWindSpeed(speed: number) {
  if(speed < 0.3) {
    return 'calm';
  } else if(speed >= 0.3 && speed < 1.6) {
    return 'light air';
  } else if (speed >= 1.6 && speed < 3.4) {
    return 'light breeze';
  } else if (speed >= 3.4 && speed < 5.5) {
    return 'gentle breeze';
  } else if (speed >= 5.5 && speed < 8) {
    return 'moderate breeze';
  } else if(speed >= 8 && speed < 10.8) {
    return 'fresh breeze';
  } else if(speed >= 10.8 && speed < 13.9) {
    return 'strong breeze';
  } else if(speed >= 13.9 && speed < 17.2) {
    return 'moderate gale';
  } else if (speed >= 17.2 && speed < 20.8) {
    return 'gale';
  } else if (speed >= 20.8 && speed < 24.5) {
    return 'strong gale';
  } else if (speed >= 24.5 && speed < 28.5) {
    return 'storm';
  } else if (speed >= 28.5 && speed < 32.7) {
    return 'violent storm';
  } else if (speed >= 32.7 && speed < 42) {
    return 'hurricane force';
  }
  return 'super typhoon';
}
 
export function describeHumidity(humidity: number) {
  if (humidity >= 0 && humidity <= 40) {
    return 'very dry';
  } else if (humidity >= 40 && humidity <= 70) {
    return 'dry';
  } else if (humidity >= 85 && humidity <= 95) {
    return 'humid';
  }
  return 'very humid';
}
 
export function describeTemperature(temp: number) {
  var celsius = convertKelvinToCelsius(temp);
  if (celsius >= 0 && celsius < 7) {
    return 'very cold';
  } else if (celsius >= 8 && celsius < 13) {
    return 'cold';
  } else if (celsius >= 13 && celsius < 18) {
    return 'cool';
  } else if (celsius >= 18 && celsius < 23) {
    return 'mild';
  } else if (celsius >= 23 && celsius < 28) {
    return 'warm';
  } else if (celsius >= 28 && celsius < 32) {
    return 'hot';
  }
  return 'very hot';
}
 
export function convertKelvinToCelsius(kelvin: number) {
  return kelvin - 273.15;
}

export function convertKelvinToFahrenheit(kelvin: number) {
  return (kelvin - 273.15) * 9 / 5 + 32;
}

export function convertMeterPerSecondsToMilePerHour(mps: number) {
  return (mps * 2.237).toFixed(2);
}
 
export function getTimeOfDay() {
  var hour = (new Date()).getHours();
  var time_of_day = 'night';
  if(hour >= 5 && hour <= 18){
    time_of_day = 'day';
  }
  return time_of_day;
}
 
/*export function getIcons(icon_names: any) {
  var icons = icon_names.map((name: any) => {
    return {
      'name': name,
      'icon': String.fromCharCode(constants.WEATHER_ICONS.neutral[name])
    };
  });
  return icons;
}*/