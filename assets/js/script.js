// Base URLs that will be used to build API URLs with actual param values
const currentDataUrl = "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={apikey}&units=imperial";
const forecastDataUrl = "https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={apikey}&units=imperial";
const geocodingDataUrl = "http://api.openweathermap.org/geo/1.0/direct?q={cityname}&appid={apikey}";

// API Key registered under my account
const apiKey = "2ce42c2263577b2c42cd002a3868e925";

// DOM HTML Elements
var historyEl = $("#history");
var currentWeatherEl = $("#weather-today");

// This function will initialize the app once it loads
function init() {
    loadHistory();

    // loadSampleData();
}

function loadSampleData() {
    loadCurrentData("39.66173777978936", "-104.74240323970344");
    loadForecastData("39.66173777978936", "-104.74240323970344");
}


// This function loads list of cities previously searched for from localStorage
function loadHistory() {
    // Retrieve JSON array from localStorage
    var arrHistory = JSON.parse(localStorage.getItem("Weather-Dashboard"));

    // If the localStorage item doesn't exit (null) then save an empty array to localStorage, exit function
    // If the array is empty, exit function
    if (arrHistory === null) {
        arrHistory = [];
        localStorage.setItem("Weather-Dashboard", JSON.stringify(arrHistory));
        return;
    } else if (arrHistory.length === 0) {
        return;
    }

    // Delete children elements from history DIV element
    historyEl.empty();
    
    // For every item in the array, create a button element
    // Set its text value to the name of the city
    // Add lat and lon values to data-* attributes which will be used in click callback function
    for (var i = 0; i < arrHistory.length; i++) {
        var historyItem = $("<button>");
        historyItem.text(arrHistory[i].city);
        historyItem.attr("data-lat", arrHistory[i].lat);
        historyItem.attr("data-lon", arrHistory[i].lon);

        historyEl.append(historyItem);
    }
}

// Add an "on click" handler using jQuery event delegation
historyEl.on("click", "button", function(event) {
    event.preventDefault();

    // Retrieve lat and lon data-* attributes
    var lat = $(this).attr("data-lat");
    var lon = $(this).attr("data-lon");

    // Load data for specified lat and lon values
    loadCurrentData(lat, lon);
    loadForecastData(lat, lon);
});


// This function will load the current weather data (big card) for the lat and lon values specified
// It receives 2 parameters: latitude and longitude
function loadCurrentData(lat, lon) {
    // Use helper function to get the properly formatted URL
    var apiUrl = buildWeatherApiUrl(currentDataUrl, lat, lon);

    // Fetch the data
    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) { // If the response is OK, then return JSON object
                return response.json();
            }
        }).then(function (data) {
            // Retrieve values from JSON object
            var cityName = data.name; // City name
            var currentDate = dayjs.unix(data.dt).format("MM/DD/YYYY"); // Convert dt property from Unix to specified format
            var tempData = data.main.temp; // Temperature
            var windData = data.wind.speed; // Wind speed
            var humidityData = data.main.humidity; // Humidity

            // Create a h2 element and set its text value to the name of the city + date + weather condition icon
            var weatherHeader = $("<h2>");
            weatherHeader.text(cityName + " (" + currentDate + ") - icon: ");

            // Add the icon img
            // https://openweathermap.org/img/wn/{icon}.png
            var weatherIcon = $("<i>");
            weatherIcon.text(data.weather[0].icon);
            weatherHeader.append(weatherIcon);

            // Create p element and set its text value to the temperature
            var temperatureText = $("<p>");
            temperatureText.text("Temp: " + tempData + "°F");

            // Create p element and set its text value to the wind speed
            var windText = $("<p>");
            windText.text("Wind: " + windData + "MPH");

            // Create p element and set its text value to the humidity
            var humidityText = $("<p>");
            humidityText.text("Humidity: " + humidityData + "%");

            // Delete children elements from weather-today DIV element
            currentWeatherEl.empty();
            // Append new children elements to weather-today DIV element
            currentWeatherEl.append(weatherHeader);
            currentWeatherEl.append(temperatureText);
            currentWeatherEl.append(windText);
            currentWeatherEl.append(humidityText);
            
        });
}

// This function will load the 5-day forecast data (small cards) for the lat and lon values specified
// It receives 2 parameters: latitude and longitude
function loadForecastData(lat, lon) {
    // Use helper function to get the properly formatted URL
    var apiUrl = buildWeatherApiUrl(forecastDataUrl, lat, lon);
}

// Helper function to build weather/forecast API URL
function buildWeatherApiUrl(baseUrl, lat, lon) {
    // Create new string - take the URL provided and replace the lat, lon, and apikey tokens with actual values
    var apiUrl = baseUrl.replace("{lat}", lat);
    apiUrl = apiUrl.replace("{lon}", lon);
    apiUrl = apiUrl.replace("{apikey}", apiKey);

    // console.log(apiUrl);
    // Return string created
    return apiUrl;
}

// Helper function to build geocoding API URL
function buildGeocodingApiUrl(baseUrl, city) {
    // Create new string - take the URL provided and replace the cityname and apikey tokens with actual values
    var apiUrl = baseUrl.replace("{cityname}", city);
    apiUrl = apiUrl.replace("{apikey}", apiKey);

    // console.log(apiUrl);
    // Return string created
    return apiUrl;
}

// Initialize app
init();