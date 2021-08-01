var cityArr = [];
const APIKey = "538681b1e89e9be05aae483d03e2774a";

var userFormEl = document.querySelector("#user-form");
var cityInputEl = document.querySelector("#city");
var currentCityEl = document.querySelector("#currentCity");
var currentIconEl = document.querySelector("#currentIcon");
var currentTempEl = document.querySelector("#currentTemp");
var currentWindEl = document.querySelector("#currentWind");
var currentHumidityEl = document.querySelector("#currentHumidity");
var currentUVIndexEl = document.querySelector("#currentUVIndex");
var futureForecastEl = document.querySelector("#futureForecast");
var searchHistoryEl = document.querySelector("#search-history");

// function to get forecast using city name
var getCityForecast = function(city) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q="+ city +"&units=metric&APPID=" + APIKey;

    fetch(apiUrl).then(function(response){
        // request was successful
        if (response.ok) {
            response.json().then(function(data) {
                displayForecast(data);
            });
        } else {
            alert('Error: OpenWeatherMap City Not Found');
        }
    }).catch(function(error) {
        // Notice this `.catch()` getting chained onto the end of the `.then()` method
        alert("Unable to connect to OpenWeatherMap");
    });
};

// function to get and display UV Index
var getUVIndex = function(latitude, longitude) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&units=metric&appid=" + APIKey;
    
    // fetch data using geographical coordinates
    fetch(apiUrl).then(function(response){
        response.json().then(function(data) {
            
            // use day UV Index if current UV Index is not available
            if (data.current.uvi === 0){
                currentUVIndexEl.textContent = data.daily[0].uvi;
            } else {
                currentUVIndexEl.textContent = data.current.uvi;
            }

            // assign class according to UV Index
            if (currentUVIndexEl.textContent < 3 && currentUVIndexEl.textContent > 0) {
                currentUVIndexEl.classList = "favorable";
            } else if (currentUVIndexEl.textContent < 6 && currentUVIndexEl.textContent >= 3) {
                currentUVIndexEl.classList = "moderate";
            } else if (currentUVIndexEl.textContent >= 6) {
                currentUVIndexEl.classList = "severe";
            } 

            // use fetch data which has 8 days forecast
            displayFutureForecast(data);
        });
    });
}

// function to handle submit button
var formSubmitHandler = function(event) {
    event.preventDefault();
    
    // get value from input element
    var city = cityInputEl.value.trim();

    if (city) {
        getCityForecast(city);
        
        // check if city name is in search history
        if (!cityArr.some(
            function(cityName){
                return cityName.toUpperCase() === city.toUpperCase();
            })){
            cityArr.push(city);
            saveSearch();
            loadSearch();
        }
        cityInputEl.value = "";
    } else {
        alert("Please enter a City");
    }
};

// function to display the current forecast
var displayForecast = function(forecast) {
    var currentDate = moment();

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

    // display current forecast
    currentCityEl.textContent = fixCityName(forecast.name) + currentDate.format(" (M/D/YYYY)");
    currentIconEl.setAttribute("src", "http://openweathermap.org/img/wn/"+ forecast.weather[0].icon +"@2x.png");
    currentTempEl.textContent = (forecast.main.temp) + " °C";
    currentWindEl.textContent = forecast.wind.speed + " m/s";
    currentHumidityEl.textContent = forecast.main.humidity + "%";
    getUVIndex(forecast.coord.lat, forecast.coord.lon);
};

// function to display 5-day forecast
var displayFutureForecast = function(futureForecast) {
    var currentDate = moment();

    while (futureForecastEl.lastChild) {
        futureForecastEl.removeChild(futureForecastEl.lastChild);
    }

    // loop through five days
    for (var i = 1; i < 6; i++){
        // create container
        var forecastEl = document.createElement("div");
        forecastEl.classList = "column forecast";

        // create date element
        var dateEl = document.createElement("p");
        dateEl.classList = "forecast-content pb-0";
        dateEl.textContent = currentDate.add(i, 'd').format("(M/D/YYYY)");

        // append date element to container
        forecastEl.appendChild(dateEl);

        // create weather icon element
        var iconEl = document.createElement("img");
        iconEl.classList = "forecast-content pb-0";
        iconEl.setAttribute("src", "http://openweathermap.org/img/wn/"+ futureForecast.daily[i].weather[0].icon +"@2x.png");

        // append weather icon element to container
        forecastEl.appendChild(iconEl);

        // create temperature element
        var tempEl = document.createElement("p");
        tempEl.classList = "forecast-content";
        tempEl.textContent = "Temp: " + futureForecast.daily[i].temp.day;

        // append temperature element to container
        forecastEl.appendChild(tempEl);

        // create wind speed element
        var windEl = document.createElement("p");
        windEl.classList = "forecast-content";
        windEl.textContent = "Wind: " + futureForecast.daily[i].wind_speed;
        
        // append wind speed element to container
        forecastEl.appendChild(windEl);

        // create humidity element
        var humidityEl = document.createElement("p");
        humidityEl.classList = "forecast-content";
        humidityEl.textContent = "Humidity: " + futureForecast.daily[i].humidity;
        
        // append humidity element to container
        forecastEl.appendChild(humidityEl);

        // append container to five-day forecast element
        futureForecastEl.appendChild(forecastEl);
    }
};

// function to save searched city in LocalStorage
var saveSearch = function() {
    localStorage.setItem("citySearch", JSON.stringify(cityArr));
};

// function to create search history button
var createSearchHistory = function(cityName){
    var searchHisBtnEl = document.createElement("button");
    searchHisBtnEl.classList = "button btn-history";
    searchHisBtnEl.textContent = fixCityName(cityName);

    searchHistoryEl.appendChild(searchHisBtnEl);
};

// function to load search history from LocalStorage
var loadSearch = function() {
    var tempSearchArr = JSON.parse(localStorage.getItem("citySearch"));

    if (tempSearchArr) {
        cityArr = tempSearchArr;

        while (searchHistoryEl.lastChild){
            searchHistoryEl.removeChild(searchHistoryEl.lastChild);
        }

        for (var i = 0; i < cityArr.length; i++){
            createSearchHistory(cityArr[i]);
        }
    }
};

// function to handle click event from search history
var searchClickHandler = function(event) {
    var city = event.target.textContent;

    if (city !== currentCityEl){
        getCityForecast(city);
    }
};

// funtion to capitalize every first letter of city names
var fixCityName = function(cityName) {
    var words = cityName.split(" ");

    for (var i = 0; i < words.length; i++){
        words[i] = words[i][0].toUpperCase() + words[i].substr(1).toLowerCase();
    }

    return words.join(" ");
};

loadSearch();
userFormEl.addEventListener("submit", formSubmitHandler);
searchHistoryEl.addEventListener("click", searchClickHandler);