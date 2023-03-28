const sampleCurrentDataUrl = "https://api.openweathermap.org/data/2.5/weather?lat=39.66173777978936&lon=-104.74240323970344&appid=2ce42c2263577b2c42cd002a3868e925&units=imperial";
const sampleForecastDataUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=39.66173777978936&lon=-104.74240323970344&appid=2ce42c2263577b2c42cd002a3868e925&units=imperial";

const apiKey = "2ce42c2263577b2c42cd002a3868e925";

var historyEl = $("#history");

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

}

function loadForecastData(lat, lon) {
    
}

init();