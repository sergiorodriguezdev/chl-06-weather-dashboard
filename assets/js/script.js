const currentDataUrl = "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={apikey}&units=imperial";
const forecastDataUrl = "https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={apikey}&units=imperial";
const apiKey = "2ce42c2263577b2c42cd002a3868e925";

var historyEl = $("#history");
var currentWeatherEl = $("#weather-today");

function init() {
    loadHistory();

    loadSampleData();
}

function loadSampleData() {
    loadCurrentData("39.66173777978936", "-104.74240323970344");
    loadForecastData("39.66173777978936", "-104.74240323970344");
}

function loadHistory() {
    var arrHistory = JSON.parse(localStorage.getItem("Weather-Dashboard"));

    if (arrHistory === null) {
        arrHistory = [];
        localStorage.setItem("Weather-Dashboard", JSON.stringify(arrHistory));
        return;
    } else if (arrHistory.length === 0) {
        return;
    }

    historyEl.empty();
    
    for (var i = 0; i < arrHistory.length; i++) {
        var historyItem = $("<button>");
        historyItem.text(arrHistory[i].city);
        historyItem.attr("data-lat", arrHistory[i].lat);
        historyItem.attr("data-lon", arrHistory[i].lon);

        historyEl.append(historyItem);
    }
}

function loadCurrentData(lat, lon) {
    var apiUrl = buildApiUrl(currentDataUrl, lat, lon);

    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
        }).then(function (data) {
            var cityName = data.name;
            var currentDate = dayjs.unix(data.dt).format("MM/DD/YYYY");
            var tempData = data.main.temp;
            var windData = data.wind.speed;
            var humidityData = data.main.humidity;

            var weatherHeader = $("<h2>");
            weatherHeader.text(cityName + " (" + currentDate + ") {icon}");

            var temperatureText = $("<p>");
            temperatureText.text("Temp: " + tempData + "°F");

            var windText = $("<p>");
            windText.text("Wind: " + windData + "MPH");

            var humidityText = $("<p>");
            humidityText.text("Humidity: " + humidityData + "%");

            currentWeatherEl.append(weatherHeader);
            currentWeatherEl.append(temperatureText);
            currentWeatherEl.append(windText);
            currentWeatherEl.append(humidityText);
            
        });
}

function loadForecastData(lat, lon) {
    var apiUrl = buildApiUrl(forecastDataUrl, lat, lon);
}

function buildApiUrl(baseUrl, lat, lon) {
    var apiUrl = baseUrl.replace("{lat}", lat);
    apiUrl = apiUrl.replace("{lon}", lon);
    apiUrl = apiUrl.replace("{apikey}", apiKey);

    console.log(apiUrl);
    return apiUrl;
}

init();