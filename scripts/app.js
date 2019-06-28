




const UIController = (() => {

    const DOMStrings = {
        searchForm: ".city_search",
        cityInput: ".city_input",
        cityName: ".city_name",
        weatherIcon: ".current_cond_icon",
        weatherConditionText: ".current_condition_text",
        temperature: ".temperature",
        deleteCity_btn: ".delete_city_btn",
        mainContainer: ".main_container",
        forecast_btn: ".forecast_btn",
    }

    return {

        getDOMStrings: function() {
            return DOMStrings;
        },

        displayCurrentCondition: function(city) {

            const main_container = document.querySelector(DOMStrings.mainContainer);

            const html = `
            <div class="current_condition" data-id="${city.cityId}">
                <div class="condition_header">
                <h2 class="city_name">${city.cityName}</h2>
                <button class="delete_city_btn">X</button>
                </div>
                <img class="current_cond_icon" src="./img/${city.currentWeatherIcon}.png" alt="">
                <h3 class="current_condition_text">${city.weatherText}</h3>
                <h3 class="temperature">${city.currentCondition.Metric.Value}&#176;C</h3>
                <button class="forecast_btn">Forecast</button>
            </div>
            `;
            main_container.insertAdjacentHTML("beforeend", html);
        },

        displayForecast: function(forecast) {

            const main_container = document.querySelector(DOMStrings.mainContainer);

            const go_back_btn = `
            <div class="go_back_container">
                <button class="go_back_btn">Go Back</button>
            </div>
            `;
            main_container.insertAdjacentHTML("beforeend", go_back_btn);

            forecast.forecast.forEach(day => {

                let date = new Date(day.EpochDate * 1000);


                html = `
                <div class="current_forecast" data-id="${forecast.id}">
                    
                    <h2 class="forecast_date">${date.toDateString()}</h2>

                    <img class="current_cond_icon" src="./img/${day.Day.Icon}.png" alt="">
                    <h3 class="current_forecast_text_day">Day: ${day.Day.IconPhrase}</h3>

                    <img class="current_cond_icon" src="./img/${day.Night.Icon}.png" alt="">
                    <h3 class="current_forecast_text_night">Night: ${day.Night.IconPhrase}</h3>


                    <h3 class="temperature">Maximum: ${day.Temperature.Maximum.Value}&#176;C</h3>

                    <h3 class="temperature">Minimum: ${day.Temperature.Minimum.Value}&#176;C</h3>
                </div> 
                `;
                main_container.insertAdjacentHTML("beforeend", html);
            });

            
        },

    };


})();

var  key = "U01cebp2Megdz7P8KbN2nG6uYgGaGgDh";

const WeatherController = (() => {

    class City {
        constructor(query) {
            this.query = query;
            this.cityName = "";
            this.cityId = 0;
            this.currentWeatherIcon = "";
            this.weatherText = "";
            this.currentCondition = null;
        }

         async getCity() {
            const request = await fetch(`http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${key}&q=${this.query}`);
            const response = await request.json();
            console.log(response);
            console.log(response[0]);
            this.cityName = response[0].EnglishName;
            this.cityId = response[0].Key;
        }

        async getCurrentCondition() {

            const request = await fetch(`http://dataservice.accuweather.com/currentconditions/v1/${this.cityId}?apikey=${key}`);

            const response = await request.json();
            console.log(response);
            this.weatherText = response[0].WeatherText;
            this.currentWeatherIcon = response[0].WeatherIcon;
            this.currentCondition = response[0].Temperature;

        }


    };

    class Forecast {
        constructor(id) {
            this.id = id;
        }

        async getForecast() {

            const request = await fetch(`http://dataservice.accuweather.com/forecasts/v1/daily/5day/${this.id}?apikey=${key}&metric=true`);

            const response = await request.json();

            this.forecast = response.DailyForecasts;
            console.log(response);
        }

    };

    return {

        createCity: function(query) {
            const newCity = new City(query);
            return newCity;
        },

        createForecast: function(id) {
            const newForecast = new Forecast(id);
            return newForecast;
        },
    };

})();


const controller = ((UICtrl, WCtrl) => {

    const DOM = UICtrl.getDOMStrings();

    const setUpEventListeners = () => {
        
        document.querySelector(DOM.searchForm).addEventListener("submit", (event) => {
            event.preventDefault();

            // get the query from input 
            let input = document.querySelector(DOM.cityInput);
            
            let query = input.value.trim();
            
            let currentCity = WCtrl.createCity(query); 
            // get the city id from the api
            currentCity.getCity()
            .then(() => {
                // get the current condition from the api with the id
                return currentCity.getCurrentCondition();
                
            })
            .then(() => {
                console.log(currentCity);
                // store the new city in the local storage
                storeCity(currentCity);
                 // prepare the ui to display the info
                
                // display info
                UICtrl.displayCurrentCondition(currentCity);
            })
            .catch(err => {
                console.log(err);
            });

            input.value = "";
        });

        document.querySelector(DOM.mainContainer).addEventListener("click", (event) => {
            console.log(event.target);
            if(event.target.classList.contains("delete_city_btn")) {
                // console.log("found delete button");
                let cityId = event.target.parentElement.parentElement.dataset.id;
                // console.log(cityId);
                // console.log(event.target.parentElement.parentElement);
                // console.log(cityId);
                // delete the city from the local storage
                deleteStoredCity(cityId);
                // delete the city from the UI
                event.target.parentElement.parentElement.remove();
            }
        });

        document.querySelector(DOM.mainContainer).addEventListener("click", event => {
            if(event.target.classList.contains("forecast_btn")) {
                // get the city id from the dataset
                let cityId = event.target.parentElement.dataset.id;
                // console.log(cityId);
                // create a new forecast object
                let currentForecast = WCtrl.createForecast(cityId);
                // get the forecast
                currentForecast.getForecast()
                .then( () => {
                    console.log(currentForecast);
                    // clear the ui
                    document.querySelector(DOM.mainContainer).innerHTML = "";
                    // display the forecast info 
                    UICtrl.displayForecast(currentForecast);

                })
                .catch(err => {
                    console.log(err);
                });
            }
        });

        document.querySelector(DOM.mainContainer).addEventListener("click", (event) => {
            console.log(event.target);
            if(event.target.classList.contains("go_back_btn")) {
                // clean the container
                document.querySelector(DOM.mainContainer).innerHTML = "";
                // display stored cities
                displayStoredCities();
            }
        });

    };

    const storeCity = city => {
        if(!localStorage.getItem("cities")) {
            let cities = [];
            cities.push(city);
            localStorage.setItem("cities", JSON.stringify(cities));
        } else {
            let cities = JSON.parse(localStorage.getItem("cities"));
            console.log(cities);
            cities.push(city); 
            localStorage.setItem("cities", JSON.stringify(cities));
        }
        
        
    };

    const deleteStoredCity = id => {

        let cities = JSON.parse(localStorage.getItem("cities"));

        cities.forEach((city, index) => {

            if(city.cityId === id) {
                cities.splice(index, 1);
            }
        })

        localStorage.setItem("cities", JSON.stringify(cities));
    };

    const displayStoredCities = () => {

        let cities = JSON.parse(localStorage.getItem("cities"));

        cities.forEach(city => {

            UICtrl.displayCurrentCondition(city);
        })


    };

    console.log("app started");
    // console.log(DOM);
    setUpEventListeners();
    displayStoredCities();

})(UIController, WeatherController);






















