const testnum = document.getElementById("testnum");
const locationInput = document.getElementById("location-input");

///////////////////////////////////////////////////////////////
// LOCATION - translate from city, state, country to lat/lon //
///////////////////////////////////////////////////////////////

function getLocation() {
    const userLocation = locationInput.value.trim();
    if (userLocation === "") {
        alert("Please enter a location");
        return;
    }
    omGeocode.city = userLocation;
    omGeocode.request(displayLocation);
}

function testLocation() {
    omGeocode.testRequest(testnum.value, displayLocation);
}

///////////////////////////////////////////////////////////////
// WEATHER - the current weather conditions                  //
///////////////////////////////////////////////////////////////

function getWeather() {
    omWeather.lat = omGeocode.getLat();
    omWeather.lon = omGeocode.getLon();

    omWeather.request(displayWeather);
}

function testWeather() {
    omWeather.testRequest(testnum.value, displayWeather);
}

///////////////////////////////////////////////////////////////
// FORECAST                                                  //
///////////////////////////////////////////////////////////////

function getForecast() {
    omForecast.lat = omGeocode.getLat();
    omForecast.lon = omGeocode.getLon();

    omForecast.request(displayForecast);
}

function testForecast() {
    omForecast.testRequest(testnum.value, displayForecast);
}

///////////////////////////////////////////////////////////////
// POLLUTION - the air quality index (AQI) and contaminants  //
///////////////////////////////////////////////////////////////

function getPollution() {
    omPollution.lat = omGeocode.getLat();
    omPollution.lon = omGeocode.getLon();

    omPollution.request(displayPollution);
}

function testPollution() {
    omPollution.testRequest(testnum.value, displayPollution);
}

// Add Enter key listener for location input
locationInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        getLocation();
    }
});