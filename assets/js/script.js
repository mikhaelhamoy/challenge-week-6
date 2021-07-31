var userFormEl = document.querySelector("#user-form");
var cityInputEl = document.querySelector("#city");
var currentCityEl = document.querySelector("#currentCity");
var currentIconEl = document.querySelector("#currentIcon");
var currentTempEl = document.querySelector("#currentTemp");
var currentWindEl = document.querySelector("#currentWind");
var currentHumidityEl = document.querySelector("#currentHumidity");
var currentUVIndexEl = document.querySelector("#currentUVIndex");

var getCityForecast = function(city) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q="+ city +"&units=metric&APPID=538681b1e89e9be05aae483d03e2774a";

    fetch(apiUrl).then(function(response){
        // request was successful
        if (response.ok) {
            response.json().then(function(data) {
                displayForecast(data);
            });
        } else {
            alert('Error: OpenWeatherMap City Not Found');
        }
        })
        .catch(function(error) {
        // Notice this `.catch()` getting chained onto the end of the `.then()` method
        alert("Unable to connect to OpenWeatherMap");
    });
};

var getUVIndex = function(latitude, longitude, day) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&units=metric&appid=538681b1e89e9be05aae483d03e2774a";
    
    fetch(apiUrl).then(function(response){
        response.json().then(function(data) {
            currentUVIndexEl.textContent = data.daily[day].uvi;

            if (data.daily[day].uvi < 3 && data.daily[day].uvi >= 0) {
                currentUVIndexEl.classList.add("low");
            } else if (data.daily[day].uvi < 6 && data.daily[day].uvi >= 3) {
                currentUVIndexEl.classList.add("moderate");
            } else if (data.daily[day].uvi < 8 && data.daily[day].uvi >= 6) {
                currentUVIndexEl.classList.add("high");
            } else if (data.daily[day].uvi < 11 && data.daily[day].uvi >= 8) {
                currentUVIndexEl.classList.add("very-high");
            } else if (data.daily[day].uvi >= 11) {
                currentUVIndexEl.classList.add("extreme");
            }
        });
    });
}

var formSubmitHandler = function(event) {
    event.preventDefault();
    
    // get value from input element
    var city = cityInputEl.value.trim();

    if (city) {
        getCityForecast(city);
        cityInputEl.value = "";
    } else {
        alert("Please enter a City");
    }
};

var displayForecast = function(forecast) {
    // check if api returned any forecast
    if (forecast.length === 0) {
        currentCityEl.textContent = "No repositories found.";
        currentIconEl.setAttribute("src", "");
        currentTempEl.textContent = "";
        currentWindEl.textContent = "";
        currentHumidityEl.textContent = "";
        currentUVIndexEl.textContent = "";
        return;
    }

    var currentDate = new Date();

    // display forecast
    currentCityEl.textContent = forecast.name + " (" + (currentDate.getMonth() + 1) + "/" + currentDate.getDate() + "/" + currentDate.getFullYear() + ")";
    currentIconEl.setAttribute("src", "");
    currentTempEl.textContent = (forecast.main.temp) + " °C";
    currentWindEl.textContent = forecast.wind.speed + " mps";
    currentHumidityEl.textContent = forecast.main.humidity + "%";
    getUVIndex(forecast.coord.lat, forecast.coord.lon, 0);
};

userFormEl.addEventListener("submit", formSubmitHandler);