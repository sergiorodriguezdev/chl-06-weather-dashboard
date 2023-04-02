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

// This function loads a list of cities previously searched for from localStorage
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
    
    // For every item in the array, create a DIV element
    // Append a child button element and set its text value to the name of the city
    // Add lat and lon values to data-* attributes which will be used in click callback function
    // Append a child "close" button
    // Append DIV to main history DIV element
    for (var i = 0; i < arrHistory.length; i++) {
        var historyItem = $("<div>");
        historyItem.addClass("d-flex align-items-center");

        var historyBtn = $("<button>");
        historyBtn.text(arrHistory[i].city);
        historyBtn.attr("data-lat", arrHistory[i].lat);
        historyBtn.attr("data-lon", arrHistory[i].lon);
        historyBtn.addClass("btn btn-secondary flex-fill");

        var delButton = $("<button>");
        delButton.attr("type", "button");
        delButton.addClass("btn-close");
        
        historyItem.append(historyBtn);
        historyItem.append(delButton);

        historyEl.append(historyItem);

        // Simulate a click for the first button in the history
        if (i === 0) historyBtn.click();
    }
}

// This function adds an item to the list of cities saved to localStorage
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

// This function removes an item from the list of cities saved to localStorage
// If "index" is not provided, the history will be deleted completely from localStorage
//  This option is used by the Clear History button
function clearHistory(index) {

    if (typeof index === "undefined") {
        // Clear History
        historyEl.empty();
        localStorage.setItem("Weather-Dashboard", "[]");
        return;
    }

    // Retrieve JSON array from localStorage
    var arrHistory = JSON.parse(localStorage.getItem("Weather-Dashboard"));

    // Validate index value is within range
    if (index < 0 || index >= arrHistory.length) {
        return;
    }

    // Remove 1 item from array at index
    arrHistory.splice(index, 1);

    // Save to localStorage
    localStorage.setItem("Weather-Dashboard", JSON.stringify(arrHistory));
}

// Add an "on click" handler using jQuery event delegation to history DIV element
historyEl.on("click", ".btn-close", function(event) {

    // Get the X button's parent DIV
    var divParent = $(this).parent();

    // Get the index of the parent from the collection matching selector
    //  Selector - DIV: id=history , DIV children: class=d-flex
    var deletedItemIndex = $("#history .d-flex").index(divParent);

    // Delete individual item using clearHistory function, reload history 
    clearHistory(deletedItemIndex);
    loadHistory();
});

// Add an "on click" handler using jQuery event delegation to history DIV element
historyEl.on("click", ".btn", function(event) {
    
    // If the button that was clicked is the Clear History button, then delete the history
    // Otherwise, load weather data
    if ($(this).attr("id") === "clear") {

        clearHistory();
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
            
            if (data.length > 0) {
                // Right now, I am using the first city returned from OpenWeather (index = 0)
                // Format the city name value to include the state (if state property exists in object) and country code
                var formattedCityName = data[0].name;
                formattedCityName += (typeof data[0].state !== "undefined") ? ", " + data[0].state : "";
                formattedCityName += " (" + data[0].country + ")";

                // Save entry to history and load weather data
                saveHistory(formattedCityName, data[0].lat, data[0].lon);

                loadHistory();
                
                loadCurrentData(data[0].lat, data[0].lon);
                loadForecastData(data[0].lat, data[0].lon);
            }
            else {
                // Show BS Modal - can't use jQuery
                const myModal = new bootstrap.Modal("#error-no-cities");
                myModal.show();
            }
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

            // Create img element, set its src attribute to the corresponding OpenWeather icon URL
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

            // Delete children elements from weather-forecast DIV element
            forecastWeatherEl.empty();
            
            for (var i = 0; i < forecastData.length; i++) {
                // Get the hour in 24 hour format for the 3-hour step specified in the dt field
                var forecastTime = dayjs.unix(forecastData[i].dt).format("H");
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
        
                    // Create img element, set its src attribute to the corresponding OpenWeather icon URL
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

    // Return string created
    return apiUrl;
}

// Helper function to build geocoding API URL
function buildGeocodingApiUrl(baseUrl, city) {
    // Create new string - take the URL provided and replace the cityname and apikey tokens with actual values
    var apiUrl = baseUrl.replace("{cityname}", city);
    apiUrl = apiUrl.replace("{apikey}", apiKey);

    // Return string created
    return apiUrl;
}

// Initialize app
init();