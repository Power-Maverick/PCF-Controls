export const WEATHER_URL = "https://api.openweathermap.org/data/2.5/";
export const CURRENT_WEATHER_PATH = "/data/2.5/weather";
export const WEATHER_FORECAST_PATH = "/data/2.5/forecast";
export const WEATHER_ICON_URL = "https://openweathermap.org/img/wn/";
 
export const WEATHER_ICONS = {
  day: {
    'clear': 0xf00d,
    'clouds': 0xf002,
    'drizzle': 0xf009,
    'rain': 0xf008,
    'thunderstorm': 0x010,
    'snow': 0xf00a,
    'mist': 0xf0b6
  },
  night: {
    'clear': 0xf02e,
    'clouds': 0xf086,
    'drizzle': 0xf029,
    'rain': 0xf028,
    'thunderstorm': 0xf02d,
    'snow': 0xf02a,
    'mist': 0xf04a
  },
  neutral: {
    'temperature': 0xf055,
    'wind': 0xf050,
    'cloud': 0xf041,
    'pressure': 0xf079,
    'humidity': 0xf07a,
    'rain': 0xf019,
    'sunrise': 0xf046,
    'sunset': 0xf052
  }
};
 
export const WIND_DIRECTIONS = [
  "North", "North-northeast", "Northeast",
  "East-northeast", "East", "East-southeast", "Southeast",
  "South-southeast", "South", "South-southwest", "Southwest",
  "West-southwest", "West", "West-northwest", "Northwest", "North-northwest"
];

export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];