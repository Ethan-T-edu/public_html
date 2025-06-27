class OMForecast {
    constructor(units) {
        this.units = units;
        this.lat = 42.2626;  // Default Worcester, MA
        this.lon = -71.8019;
        this.cnt = 5; // Number of forecast periods
        this.json = null;
    }

    request(callback) {
        var xhttp = new XMLHttpRequest();
        let self = this;

        xhttp.onreadystatechange = function() {
            if (this.readyState != 4) return;
            if (this.status != 200) {
                alert(`Payload bad (code ${this.status})`);
                return;
            }
            let data = JSON.parse(this.responseText);
            // Convert Open-Meteo format to OWM-like format for compatibility
            self.json = self.convertToOWMFormat(data);
            if (callback !== undefined) {
                callback();
            }
        }
        
        let tempUnit = this.units === "imperial" ? "fahrenheit" : "celsius";
        let windSpeedUnit = this.units === "imperial" ? "mph" : "kmh";
        
        let URL = `https://api.open-meteo.com/v1/forecast?latitude=${this.lat}&longitude=${this.lon}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&temperature_unit=${tempUnit}&wind_speed_unit=${windSpeedUnit}&precipitation_unit=inch&timezone=auto&forecast_days=3`;
        
        xhttp.open("GET", URL, true);
        xhttp.send();
    }

    testRequest(num, callback) {
        let self = this;
        fetch(`./testjson/forecast${num}.json`)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                self.json = data; // Keep OWM format for testing
                callback();
            });
    }

    convertToOWMFormat(omData) {
        // Weather code mapping (same as OMWeather)
        const weatherCodeMap = {
            0: { main: "Clear", description: "clear sky", icon: "01d" },
            1: { main: "Clear", description: "mainly clear", icon: "01d" },
            2: { main: "Clouds", description: "partly cloudy", icon: "02d" },
            3: { main: "Clouds", description: "overcast", icon: "03d" },
            45: { main: "Mist", description: "fog", icon: "50d" },
            48: { main: "Mist", description: "depositing rime fog", icon: "50d" },
            51: { main: "Drizzle", description: "light drizzle", icon: "09d" },
            53: { main: "Drizzle", description: "moderate drizzle", icon: "09d" },
            55: { main: "Drizzle", description: "dense drizzle", icon: "09d" },
            61: { main: "Rain", description: "slight rain", icon: "10d" },
            63: { main: "Rain", description: "moderate rain", icon: "10d" },
            65: { main: "Rain", description: "heavy rain", icon: "10d" },
            80: { main: "Rain", description: "slight rain showers", icon: "09d" },
            81: { main: "Rain", description: "moderate rain showers", icon: "09d" },
            82: { main: "Rain", description: "violent rain showers", icon: "09d" },
            95: { main: "Thunderstorm", description: "thunderstorm", icon: "11d" }
        };

        const hourly = omData.hourly;
        const list = [];

        // Take every 3rd hour to get ~8 forecasts (similar to OWM 5-day forecast)
        for (let i = 0; i < Math.min(hourly.time.length, this.cnt * 8); i += 3) {
            const weatherCode = hourly.weather_code[i] || 0;
            const weather = weatherCodeMap[weatherCode] || weatherCodeMap[0];
            
            // Determine if it's day or night based on hour
            const hour = new Date(hourly.time[i]).getHours();
            const isDay = hour >= 6 && hour <= 18;
            let icon = weather.icon;
            if (!isDay && icon.includes("d")) {
                icon = icon.replace("d", "n");
            }

            list.push({
                dt: Math.floor(new Date(hourly.time[i]).getTime() / 1000),
                main: {
                    temp: hourly.temperature_2m[i],
                    feels_like: hourly.apparent_temperature[i],
                    temp_min: hourly.temperature_2m[i],
                    temp_max: hourly.temperature_2m[i],
                    pressure: hourly.pressure_msl[i],
                    humidity: hourly.relative_humidity_2m[i]
                },
                weather: [{
                    id: weatherCode,
                    main: weather.main,
                    description: weather.description,
                    icon: icon
                }],
                clouds: {
                    all: hourly.cloud_cover[i]
                },
                wind: {
                    speed: hourly.wind_speed_10m[i],
                    deg: hourly.wind_direction_10m[i],
                    gust: hourly.wind_gusts_10m[i]
                },
                pop: hourly.precipitation_probability[i] / 100 || 0, // Convert % to decimal
                rain: hourly.precipitation[i] ? { "3h": hourly.precipitation[i] } : undefined
            });
        }

        return {
            cod: "200",
            message: 0,
            cnt: list.length,
            list: list,
            city: {
                name: "Current Location",
                coord: {
                    lat: this.lat,
                    lon: this.lon
                },
                country: "Unknown"
            }
        };
    }

    convertTimecode(unix) {
        unix *= 1000; // CONVERT TO MILLISECONDS --> good for JavaScript
        let date = new Date(unix); // pass in ms
        let hours = date.getHours();
        let minutes = date.getMinutes();

        return `${hours}:${minutes.toString().padStart(2, "0")}`;
    }
}
