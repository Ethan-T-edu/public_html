// STEP 1: Copy the OM (Open-Meteo) .js files into your website
// STEP 2: No API key needed for Open-Meteo! 🎉
// STEP 3: Uncomment the resources for your website
// STEP 4: Write the load functions to perform each step
// STEP 5: Call the load1() function when the weather should load

// No API key needed for Open-Meteo!
//let units = "imperial";

// RESOURCES (Uncomment for each .js file)
// let omGeocode = new OMGeocode();
// let omWeather = new OMWeather(units);
// let omForecast = new OMForecast(units);
// let omPollution = new OMPollution();


//    load1()  -->  load2()  -->  load3()
//     |             |             |
//     Get location  |             Display weather
//                   Get weather from location

function load1() {
    const locationInput = document.getElementById("location-input");
    const userLocation = locationInput.value.trim();
    
    if (userLocation === "") {
        alert("Please enter a location");
        return;
    }
    
    omGeocode.city = userLocation; // Use the user-entered location
    omGeocode.request(load2); // link to second function
}

function load2() {
    omWeather.lat = omGeocode.getLat();
    omWeather.lon = omGeocode.getLon();
    omWeather.request(load3); // link to third function
}

function load3() {
    const weatherReport = document.getElementById("weather-report");
    // See display.js for more examples
    weatherReport.innerHTML = `Weather report for ${omGeocode.city}: ${omWeather.json.weather[0].description}`;
}