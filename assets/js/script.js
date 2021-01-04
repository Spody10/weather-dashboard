var cityHist = [];
var appId = "f115d2cb693c1de28bfc424f5b0f778b";
var units = "imperial";
var tempUnitDisplay = "°F";
var speedUnitDisplay = "MPH";
var dateFormat = "MM/DD/YYYY";
var fiveDateFormat = "MM/DD YYYY";

var loadHistory = function() {
    cityHist = localStorage.getItem("cityHist");
    cityHist = JSON.parse(cityHist);
    if (!cityHist) {
        cityHist = [];
        return;
    } 
    else { 
        for (var i = 0; i < cityHist.length; ++i) {
            var historyEl = document.createElement("p");
            historyEl.textContent = cityHist[i];
            historyEl.classList = "search-history list-group-item btn btn-light border border-black-50 col-6 col-md-12 mb-1 overflow-hidden";
            $("#search-container").append(historyEl);
        }
    }    

};
// weather icons
var conditionSet = function(dataSet) {
    switch (dataSet) {
        case "Thunderstorm":
            weather = " <img src='./assets/images/thunderstorm.svg' />";
            break;
        case "Sprinkle": 
            weather = " <img src='./assets/images/sprinkle.svg' />";
            break;
        case "Rain":
            weather = " <img src='./assets/images/rain.svg' />";
            break;
        case "Snow":
            weather = " <img src='./assets/images/snow.svg' />";
            break;
        case "Sunny":
            weather = " <img src='./assets/images/sunny.svg' />";
            break;
        case "Clouds":
            weather = " <img src='./assets/images/cloudy.svg' />";
            break;
        case "Tornado":
            weather = " <img src='./assets/images/tornado.svg' />";
            break;
        default:
            weather = " <img src='./assets/images/sunny-overcast.svg' />";
            break;
    }
};
// current weather data - uv index - 5 day forecast - set location
var getWeatherData = function(city) {fetch("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=" + units + "&appid=" + appId).then(function(response) {
        
        if (response.ok) {
            response.json().then(function(data) {
                conditionSet(data.weather[0].main);
                var lat = data.coord.lat;
                var lon = data.coord.lon;
                var location = data.name;
                var currentDate = moment().format(dateFormat);
                $("#location").html(location + " (" + currentDate + ")" + weather);
                $("#temperature").text("Temperature: " + data.main.temp.toFixed(1) + " " + tempUnitDisplay);
                $("#humidity").text("Humidity: " + data.main.humidity +"%");
                $("#windspeed").text("Wind Speed: " + data.wind.speed + " " + speedUnitDisplay);
                getFiveDay(lat, lon);
                updateHistory(location);
                fetch("https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=" + appId).then(function(response) {
                    if (response.ok) {
                        response.json().then(function(data) {
                            $("#uv").html("UV Index: <span class='text-light py-1 px-2 rounded' id='uv-val'>" + data.value.toFixed(1) + "</span>");
                            $("#uv-val").removeClass("bg-warning", "bg-danger", "bg-success");
                            if (data.value > 2 && data.value < 5) {
                                $("#uv-val").addClass("bg-warning");       
                            }
                            else if (data.value < 2) {
                                $("#uv-val").addClass("bg-success");
                            }    
                            else if (data.value > 5) {
                                $("#uv-val").addClass("bg-danger");
                            }
                        });
                    }
                    else {
                        alert("Error trying display UV Index. Please try again.");
                    }
                });
            });
            
        }
        else {
            alert("Error trying to display city information. Check city spelling.");
        }
    });
};

var getFiveDay = function(lat, lon) {fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&units=" + units + "&appid=" + appId).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                var fiveDay = data.daily;
                fiveDay.splice(6);
                fiveDay.shift();
                var i = 0;
                var x = 1;
                $(".fiveDay").each(function(){
                    $(this).children(".fiveDay-temp").text("Temp: " + Math.round(fiveDay[i].temp.day) + tempUnitDisplay);
                    $(this).children(".fiveDay-hum").text("Hum: " + fiveDay[i].humidity + "%");
                    conditionSet(fiveDay[i].weather[0].main);
                    $(this).children(".fiveDay-condition").html(weather);
                    var forecastDate = moment().add(x, 'days').format(fiveDateFormat);
                    $(this).children(".fiveDay-date").text(forecastDate);
                    ++x;
                    ++i;
                });
            });
        }
        else {
            alert("Error trying to display five day forecast. Please try again");
        }
    });
};

var getPrevious = function(){
    var historySearch = $(this).text().trim();
    getWeatherData(historySearch);
};

var citySubmitHandler = function(event) {
    event.preventDefault();
    var city = $("#searchBar").val().trim();
    if (city) {
        getWeatherData(city);
        $("#searchBar").val("");
    }
    else {
        alert("Please enter a city.");
    }
};

var updateHistory = function(location){
    if (cityHist.includes(location)){
        return;
    }
    else {
        cityHist.push(location);
        
        if (cityHist.length > 8) {
            cityHist.shift();
        }
        localStorage.setItem("cityHist", JSON.stringify(cityHist));
        $(".search-history").each(function(){
            $(this).remove();
        });
        loadHistory();
    }
};

loadHistory();

$("#search-container").on("submit", citySubmitHandler);

$("#search-container").on("click", ".search-history", getPrevious);