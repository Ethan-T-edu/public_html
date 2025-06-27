const testnum = document.getElementById("testnum");
const locationInput = document.getElementById("location-input");

///////////////////////////////////////////////////////////////
// LOCATION - translate from city, state, country to lat/lon //
///////////////////////////////////////////////////////////////
// Store the original displayLocation function from display.js
const originalDisplayLocation = window.displayLocation;

// Global variables to manage the Promise for getLocation
let resolveLocationPromise = null;
let rejectLocationPromise = null;

// Override the global displayLocation to resolve/reject the promise
// This function will be called by omGeocode.request after it fetches data.
window.displayLocation = (data) => {
    originalDisplayLocation(data); // Call the original display function to update UI

    // Check if omGeocode.lat and omGeocode.lon are now set and valid numbers.
    // This is the crucial part: we need to know if omGeocode.request succeeded.
    if (omGeocode.getLat() !== null && omGeocode.getLon() !== null &&
        !isNaN(omGeocode.getLat()) && !isNaN(omGeocode.getLon())) {
        if (resolveLocationPromise) {
            resolveLocationPromise(); // Resolve the promise, signaling success
            resolveLocationPromise = null; // Clear for next call
            rejectLocationPromise = null;
        }
    } else {
        // If lat/lon are not set or are invalid, it implies geocoding failed
        if (rejectLocationPromise) {
            rejectLocationPromise(new Error("Geocoding failed to retrieve valid coordinates."));
            resolveLocationPromise = null; // Clear for next call
            rejectLocationPromise = null;
        }
    }
};

// Modified getLocation to return a Promise
function getLocation() {
    return new Promise((resolve, reject) => {
        resolveLocationPromise = resolve; // Store resolve function
        rejectLocationPromise = reject;   // Store reject function

        const userLocation = locationInput.value.trim();
        if (userLocation === "") {
            alert("Please enter a location");
            reject(new Error("No location entered")); // Reject the promise immediately
            resolveLocationPromise = null; // Clear immediately
            rejectLocationPromise = null;
            return;
        }
        omGeocode.city = userLocation;
        omGeocode.request(window.displayLocation); // Call with our modified displayLocation

        // Add a timeout to handle cases where omGeocode.request might fail silently
        // or the callback is never called (e.g., network error, API down).
        setTimeout(() => {
            if (resolveLocationPromise || rejectLocationPromise) { // If promise is still pending
                reject(new Error("Geocoding request timed out."));
                resolveLocationPromise = null;
                rejectLocationPromise = null;
            }
        }, 15000); // 15 seconds timeout
    });
}

function testLocation() {
    omGeocode.testRequest(testnum.value, displayLocation);
}

///////////////////////////////////////////////////////////////
// WEATHER - the current weather conditions                  //
///////////////////////////////////////////////////////////////

function getWeather() {
    return new Promise((resolve, reject) => {
        omWeather.lat = omGeocode.getLat();
        omWeather.lon = omGeocode.getLon();

        if (omWeather.lat === null || omWeather.lon === null) {
            return reject(new Error("Cannot get weather without valid coordinates."));
        }

        omWeather.request(() => {
            displayWeather();
            resolve();
        });
    });
}

function testWeather() {
    omWeather.testRequest(testnum.value, displayWeather);
}

///////////////////////////////////////////////////////////////
// FORECAST                                                  //
///////////////////////////////////////////////////////////////

function getForecast() {
    return new Promise((resolve, reject) => {
        omForecast.lat = omGeocode.getLat();
        omForecast.lon = omGeocode.getLon();

        if (omForecast.lat === null || omForecast.lon === null) {
            return reject(new Error("Cannot get forecast without valid coordinates."));
        }

        omForecast.request(() => {
            displayForecast();
            resolve();
        });
    });
}

function testForecast() {
    omForecast.testRequest(testnum.value, displayForecast);
}

///////////////////////////////////////////////////////////////
// POLLUTION - the air quality index (AQI) and contaminants  //
///////////////////////////////////////////////////////////////

function getPollution() {
    return new Promise((resolve, reject) => {
        omPollution.lat = omGeocode.getLat();
        omPollution.lon = omGeocode.getLon();

        if (omPollution.lat === null || omPollution.lon === null) {
            return reject(new Error("Cannot get pollution data without valid coordinates."));
        }

        omPollution.request(() => {
            displayPollution();
            resolve();
        });
    });
}

function testPollution() {
    omPollution.testRequest(testnum.value, displayPollution);
}
/**
 * Orchestrates the loading of location, weather, forecast, and pollution data
 * based on the input city.
 *
 * This function assumes the following:
 * 1. `getLocation()`: An asynchronous function (preferably returning a Promise)
 *    that takes the city name from `location-input`, performs geocoding,
 *    and makes the latitude and longitude globally available (e.g., via `currentLatitude`, `currentLongitude` variables).
 * 2. `getWeather()`, `getForecast()`, `getPollution()`: Asynchronous functions
 *    (preferably returning Promises) that use the globally available latitude
 *    and longitude to fetch and display their respective data.
 *
 * If `getLocation()` or the other `get*()` functions are not asynchronous or
 * do not return Promises, they might need to be refactored for proper chaining.
 */
async function loadAllDataForLocation() {
    const locationInput = document.getElementById('location-input');
    const city = locationInput.value.trim();

    if (!city) {
        console.warn("Location input is empty. Please enter a city name.");
        // Clear previous data and display a message
        document.getElementById('location').textContent = "Please enter a city name.";
        document.getElementById('weather-report').textContent = "WEATHER REPORT";
        document.getElementById('forecast-table').innerHTML = ""; // Clear table content
        document.getElementById('pollution-report').textContent = "POLLUTION REPORT";
        return;
    }

    console.log(`Initiating full data load for: ${city}`);
    try {
        // Step 1: Get location (geocoding)
        await getLocation(); // Wait for location to be resolved and coordinates set
        console.log("Location data loaded.");

        // Step 2: Load weather, forecast, and pollution using the obtained location
        await getWeather();
        await getForecast();
        await getPollution();

        console.log(`All data successfully loaded for ${city}.`);

    } catch (error) {
        console.error(`Failed to load all data for ${city}:`, error);
        document.getElementById('location').textContent = `Error loading data for ${city}. Please try again.`;
        document.getElementById('weather-report').textContent = "Error loading weather.";
        document.getElementById('forecast-table').innerHTML = "<tr><td>Error loading forecast.</td></tr>";
        document.getElementById('pollution-report').textContent = "Error loading pollution.";
    }
}