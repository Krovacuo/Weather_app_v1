




const UIController = (() => {

    const DOMStrings = {
        searchForm: ".city_search",
        cityInput: ".city_input",
        cityName: ".city_name",
        weatherIcon: ".current_cond_icon",
        weatherConditionText: ".current_condition_text",
        temperature: ".temperature",
        deleteCity: ".delete_city",
        mainContainer: ".main_container",
    }

    return {

        getDOMStrings: function() {
            return DOMStrings;
        },

        displayCurrentCondition: function(city) {

            const main_container = document.querySelector(DOMStrings.mainContainer);

            const html = `
            <div class="current_condition">
                <div class="condition_header">
                <h2 class="city_name" data-id="${city.cityId}">${city.cityName}</h2>
                <button class="delete_city">X</button>
                </div>
                <img class="current_cond_icon" src="./img/${city.currentWeatherIcon}.png" alt="">
                <h3 class="current_condition_text">${city.weatherText}</h3>
                <h3 class="temperature">${city.currentCondition.Metric.Value}&#176;C</h3>
            </div>
            `;
            main_container.insertAdjacentHTML("beforeend", html);
        }

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


    }

    return {

        createCity: function(query) {
            const newCity = new City(query);
            return newCity;
        }
    }

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
            if(event.target.classList.contains("delete_city")) {
                // console.log("found delete button");
                let cityId = event.target.previousElementSibling.dataset.id;
                // console.log(cityId);
                // delete the city from the local storage
                deleteStoredCity(cityId);
                // delete the city from the UI
                event.target.parentElement.parentElement.remove();
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
    }

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






















