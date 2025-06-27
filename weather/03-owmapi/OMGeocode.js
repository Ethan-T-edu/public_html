class OMGeocode {
    constructor() {
        this.city = "Worcester, MA";
        this.state = null;
        this.country = "US";
        this.limit = 1;
        this.json = null;
    }    request(callback) {
        var xhttp = new XMLHttpRequest();
        let self = this;

        xhttp.onreadystatechange = function() {
            if (this.readyState != 4) return;
            
            if (this.status != 200) {
                console.error(`Geocoding API error: ${this.status} - ${this.statusText}`);
                console.error(`Response: ${this.responseText}`);
                alert(`Unable to find location "${self.city}". Error ${this.status}. Please try a different city name.`);
                return;
            }
            
            try {
                let response = JSON.parse(this.responseText);
                console.log('Geocoding response:', response);
                
                // Check if we got results
                if (!response.results || response.results.length === 0) {
                    alert(`Location "${self.city}" not found. Please try a different location.`);
                    return;
                }
                
                self.json = response;
                if (callback !== undefined) {
                    callback();
                }
            } catch (error) {
                console.error('Error parsing geocoding response:', error);
                alert('Error processing location data. Please try again.');
            }
        }
        
        // Clean up the city name for Open-Meteo API
        let searchQuery = this.city.trim();
        
        // Remove state/country suffixes that might confuse the API
        // But keep the full search if it doesn't have commas
        if (searchQuery.includes(',')) {
            searchQuery = searchQuery.split(',')[0].trim(); // Take only the city part
        }
        
        // Encode for URL
        searchQuery = encodeURIComponent(searchQuery);
        
        let URL = `https://geocoding-api.open-meteo.com/v1/search?name=${searchQuery}&count=${this.limit}&language=en&format=json`;
        
        console.log(`Geocoding request: ${URL}`);
        xhttp.open("GET", URL, true);
        xhttp.send();
    }

    testRequest(num, callback) {
        let self = this;
        fetch(`./testjson/geocode${num}.json`)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                // Convert OWM format to Open-Meteo format for testing
                self.json = {
                    results: [{
                        name: data[0].name,
                        latitude: data[0].lat,
                        longitude: data[0].lon,
                        country: data[0].country,
                        admin1: data[0].state || ""
                    }]
                };
                callback();
            });
    }

    getLat() {
        if (this.json && this.json.results && this.json.results.length > 0) {
            return this.json.results[0].latitude;
        }
        return null;
    }

    getLon() {
        if (this.json && this.json.results && this.json.results.length > 0) {
            return this.json.results[0].longitude;
        }
        return null;
    }

    getName() {
        if (this.json && this.json.results && this.json.results.length > 0) {
            return this.json.results[0].name;
        }
        return null;
    }

    getCountry() {
        if (this.json && this.json.results && this.json.results.length > 0) {
            return this.json.results[0].country;
        }
        return null;
    }

    getState() {
        if (this.json && this.json.results && this.json.results.length > 0) {
            return this.json.results[0].admin1 || null;
        }
        return null;
    }
}
