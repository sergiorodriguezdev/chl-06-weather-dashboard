// Base URLs that will be used to build API URLs with actual param values
const currentDataUrl = "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={apikey}&units=imperial";
const forecastDataUrl = "https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={apikey}&units=imperial";
const geocodingDataUrl = "https://api.openweathermap.org/geo/1.0/direct?q={cityname}&limit=10&appid={apikey}";

// API Key registered under my account
const apiKey = "2ce42c2263577b2c42cd002a3868e925";

// DOM HTML Elements
var cityNameEl = $("#city-name");
var searchButtonEl = $("#search");
var historyEl = $("#history");
var currentWeatherEl = $("#weather-today");
var forecastWeatherEl = $("#weather-forecast");

// This function will initialize the app once it loads
function init() {

    loadHistory();
}

// This function loads list of cities previously searched for from localStorage
function loadHistory() {
    // Retrieve JSON array from localStorage
    var arrHistory = JSON.parse(localStorage.getItem("Weather-Dashboard"));

    // Delete children elements from history DIV element
    historyEl.empty();

    // Add Clear History button
    var clearHistory = $("<button>");
    clearHistory.attr("id", "clear");
    clearHistory.text("Clear History");
    clearHistory.addClass("btn btn-primary");
    clearHistory.attr("disabled", "");

    historyEl.append(clearHistory);

    // If the localStorage item doesn't exit (null) then save an empty array to localStorage, exit function
    // If the array is empty, exit function
    if (arrHistory === null) {
        arrHistory = [];
        localStorage.setItem("Weather-Dashboard", JSON.stringify(arrHistory));
        return;
    } else if (arrHistory.length === 0) {
        return;
    }
    else {
        // If array is not empty, enable Clear History button
        clearHistory.removeAttr("disabled");
    }
    
    // For every item in the array, create a button element
    // Set its text value to the name of the city
    // Add lat and lon values to data-* attributes which will be used in click callback function
    // I would like to add a way for the user to remove the individual history items
    for (var i = 0; i < arrHistory.length; i++) {
        var historyItem = $("<button>");
        historyItem.text(arrHistory[i].city);
        historyItem.attr("data-lat", arrHistory[i].lat);
        historyItem.attr("data-lon", arrHistory[i].lon);
        historyItem.addClass("btn btn-secondary");

        historyEl.append(historyItem);
    }
}

// This function adds an item to the list of cities saves to localStorage
function saveHistory(cityName, lat, lon) {
    // Create new object to be inserted to history
    var historyItem = {
        city: cityName,
        lat: lat,
        lon: lon
    };

    // Retrieve JSON array from localStorage
    var arrHistory = JSON.parse(localStorage.getItem("Weather-Dashboard"));

    // If the localStorage item doesn't exit (null) then create an empty array
    if (arrHistory === null) {
        arrHistory = [];
    }

    // Insert array element to the beginning of the array
    arrHistory.unshift(historyItem);

    // Save to localStorage
    localStorage.setItem("Weather-Dashboard", JSON.stringify(arrHistory));
}

// Add an "on click" handler using jQuery event delegation to history DIV element
historyEl.on("click", "button", function(event) {
    event.preventDefault();

    // If the button that was clicked is the Clear History button, then delete the history
    if ($(this).attr("id") === "clear") {
        historyEl.empty();
        localStorage.setItem("Weather-Dashboard", "[]");
        loadHistory();
    }
    else {
        // Retrieve lat and lon data-* attributes
        var lat = $(this).attr("data-lat");
        var lon = $(this).attr("data-lon");

        // Load data for specified lat and lon values
        loadCurrentData(lat, lon);
        loadForecastData(lat, lon);
    }

});

// Add a "submit" handler to search button
searchButtonEl.submit(function(event) {
    
    event.preventDefault();

    // Get city name from search box and trim white spaces
    var cityName = cityNameEl.val().trim();

    // Use helper function to get the properly formatted URL
    var apiUrl = buildGeocodingApiUrl(geocodingDataUrl, cityName);

    // fetch data - lat and lon
    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) { // If the response is OK, then return JSON object
                return response.json();
            }
        }).then(function (data) {
            // Right now, I am using the first city returned from OpenWeather (index = 0)
            // Need to add logic to handle multiple/duplicate cities

            // Format the city name value to include the state (if property exists) and country code
            var formattedCityName = data[0].name;
            formattedCityName += (typeof data[0].state !== "undefined") ? ", " + data[0].state : "";
            formattedCityName += " (" + data[0].country + ")";

            // Save entry to history and load wehater data
            saveHistory(formattedCityName, data[0].lat, data[0].lon);
            loadHistory();
            loadCurrentData(data[0].lat, data[0].lon);
            loadForecastData(data[0].lat, data[0].lon);
        });

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
            var currentDate = dayjs.unix(data.dt).format("MMM DD"); // Convert dt property from Unix to specified format
            var tempData = data.main.temp; // Temperature
            var windData = data.wind.speed; // Wind speed
            var humidityData = data.main.humidity; // Humidity

            // Create a h2 element and set its text value to the name of the city + date + weather condition icon
            var weatherHeader = $("<h2>");
            weatherHeader.text(cityName + " (" + currentDate + ") ");

            // Add the icon img
            // https://openweathermap.org/img/wn/{icon}.png
            var weatherIcon = $("<img>");
            weatherIcon.attr("src", "https://openweathermap.org/img/wn/" + data.weather[0].icon + ".png");
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

    // Fetch the data
    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) { // If the response is OK, then return JSON object
                return response.json();
            }
        }).then(function (data) {
            var forecastData = data.list;

            // Get the hour in 24 hour format for the current time
            // Then, round down to the nearest multiple of 3 (divide by 3 then multiply by 3)
            var nowTime = parseInt(dayjs().format("H"));
            nowTime = Math.floor(nowTime / 3) * 3;
            nowTime = 0;

            // Delete children elements from weather-forecast DIV element
            forecastWeatherEl.empty();
            
            for (var i = 0; i < forecastData.length; i++) {
                // Get the hour in 24 hour format for the 3-hour step specified in the dt_txt field
                var forecastTime = dayjs(forecastData[i].dt_txt).format("H");
                forecastTime = parseInt(forecastTime);

                // Only print data for timestamps closest to the current time for the next 5 days
                if(forecastTime === nowTime) {
                    // Retrieve values from JSON object
                    var currentDate = dayjs.unix(forecastData[i].dt).format("MMM DD"); // Convert dt property from Unix to specified format
                    var tempData = forecastData[i].main.temp; // Temperature
                    var windData = forecastData[i].wind.speed; // Wind speed
                    var humidityData = forecastData[i].main.humidity; // Humidity
        
                    // Create a h2 element and set its text value to the name of the city + date + weather condition icon
                    var weatherHeader = $("<h4>");
                    weatherHeader.text(currentDate + " ");
        
                    // Add the icon img
                    // https://openweathermap.org/img/wn/{icon}.png
                    var weatherIcon = $("<img>");
                    weatherIcon.attr("src", "https://openweathermap.org/img/wn/" + forecastData[i].weather[0].icon + ".png");
                    weatherIcon.addClass("col-4");

                    // Create p element and set its text value to the temperature
                    var temperatureText = $("<p>");
                    temperatureText.text("Temp: " + tempData + "°F");
        
                    // Create p element and set its text value to the wind speed
                    var windText = $("<p>");
                    windText.text("Wind: " + windData + "MPH");
        
                    // Create p element and set its text value to the humidity
                    var humidityText = $("<p>");
                    humidityText.text("Humidity: " + humidityData + "%");
        
                    // Create new DIV element (card)
                    var forecastCard = $("<div>");
                    forecastCard.addClass("card p-2 m-2 text-bg-secondary")

                    // Append new children elements to card DIV element
                    forecastCard.append(weatherHeader);
                    forecastCard.append(weatherIcon);
                    forecastCard.append(temperatureText);
                    forecastCard.append(windText);
                    forecastCard.append(humidityText);

                    // Append card DIV element to weather-forecast DIV element
                    forecastWeatherEl.append(forecastCard);
                }
            }

            
        });
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