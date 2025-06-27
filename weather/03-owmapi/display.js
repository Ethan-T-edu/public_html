// No API key needed for Open-Meteo!
let units = "imperial";
let units_temp = `&deg;F`;
let units_humid = `%`;
let units_speed = "mph";

let omGeocode = new OMGeocode();
let omWeather = new OMWeather(units);
let omForecast = new OMForecast(units);
let omPollution = new OMPollution();

///////////////////////////////////////////////////////////////
// LOCATION - translate from city, state, country to lat/lon //
///////////////////////////////////////////////////////////////

function displayLocation() {
    const loc = document.getElementById("location");
    loc.innerHTML = `${omGeocode.getName()}`;
    if (omGeocode.getState()) {
        loc.innerHTML += `, ${omGeocode.getState()}`;
    }
    loc.innerHTML += `, ${omGeocode.getCountry()}`;
}

///////////////////////////////////////////////////////////////
// WEATHER - the current weather conditions                  //
///////////////////////////////////////////////////////////////

function displayWeather() {
    const weatherReport = document.getElementById("weather-report");

    // Weather Condition Strings
    let cond = omWeather.json.weather[0].main;
    cond = cond.toLowerCase();
    let condLong = omWeather.json.weather[0].description;
    condLong = condLong.toLowerCase();
    let condReport = `The current weather condition is "${condLong}" or "${cond}".`;

    // Weather Condition ID
    const condIdURL = "https://open-meteo.com/en/docs#weather-codes";
    let condId = omWeather.json.weather[0].id;
    let condIdReport = `The condition ID is ${condId} which can <a href=${condIdURL} target="_blank">help sort by possible conditions</a>.`;

    // Temperature and Feels-Like
    let temp = omWeather.json.main.temp;
    let tempFeel = omWeather.json.main.feels_like;
    temp = temp.toFixed(1);
    tempFeel = tempFeel.toFixed(1);
    let tempReport = `The temperature is ${temp}${units_temp} and it feels like ${tempFeel}${units_temp}.`;

    // Note: Open-Meteo doesn't provide weather icons, so we'll use a simple text representation
    let img = `<div style="font-size: 48px; margin: 10px 0;">${getWeatherEmoji(omWeather.json.weather[0].main)}</div>`;

    weatherReport.innerHTML = `${condReport}<br>${condIdReport}<br>${tempReport}<br>${img}`;
}

// Helper function to get weather emoji based on condition
function getWeatherEmoji(condition) {
    const emojiMap = {
        "Clear": "☀️",
        "Clouds": "☁️",
        "Rain": "🌧️",
        "Drizzle": "🌦️",
        "Thunderstorm": "⛈️",
        "Snow": "❄️",
        "Mist": "🌫️",
        "Fog": "🌫️"
    };
    return emojiMap[condition] || "🌤️";
}

///////////////////////////////////////////////////////////////
// FORECAST                                                  //
///////////////////////////////////////////////////////////////

// See https://openweathermap.org/forecast5#5days

function displayForecast() {
    var table = document.getElementById('forecast-table');
    table.innerHTML = '';

    const headerColText = ["Time", "Temperature", "Condition", "Humidity", "Icon"];
    var header = document.createElement('tr');
    for (var j = 0; j < headerColText.length; j++) { // number of columns
        var cell = document.createElement('th');
        cell.textContent = headerColText[j];
        header.appendChild(cell);
    }
    table.appendChild(header);

    // Add the current weather if available
    if (omWeather.json !== undefined) {
        var row = createRow(omWeather.json);
        table.appendChild(row);
    }

    for (let i = 0; i < omForecast.json.list.length; i++) { // up to 40
        var row = createRow(omForecast.json.list[i]);
        table.appendChild(row);
    }
}

function createRow(json) {
    var row = document.createElement('tr');
    var cell;

    cell = document.createElement('td');
    cell.innerHTML = omForecast.convertTimecode(json.dt);
    row.appendChild(cell);

    cell = document.createElement('td');
    cell.innerHTML = `${json.main.temp.toFixed(1)}${units_temp}`;
    row.appendChild(cell);

    cell = document.createElement('td');
    cell.innerHTML = json.weather[0].main;
    row.appendChild(cell);

    cell = document.createElement('td');
    cell.innerHTML = `${json.main.humidity}${units_humid}`;
    row.appendChild(cell);

    cell = document.createElement('td');
    // Use weather emoji instead of external images
    cell.innerHTML = getWeatherEmoji(json.weather[0].main);
    row.appendChild(cell);

    return row;
}

///////////////////////////////////////////////////////////////
// POLLUTION - the air quality index (AQI) and contaminants  //
///////////////////////////////////////////////////////////////

function displayPollution() {
    const pollutionReport = document.getElementById("pollution-report");

    // Weather Condition Strings
    let aqi = parseInt(omPollution.json.list[0].main.aqi);
    let aqiReport = `The current Air Quality Index (AQI) is ${aqi}.`;

    pollutionReport.innerHTML = `${aqiReport}<br>Components: ${JSON.stringify(omPollution.json.list[0].components)}`;
}