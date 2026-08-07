const themeBtn =
    document.getElementById("themeBtn");

const unitBtn =
    document.getElementById("unitBtn");

const cityInput =
    document.getElementById("cityInput");

const searchBtn =
    document.getElementById("searchBtn");

const locationBtn =
    document.getElementById("locationBtn");

const errorMessage =
    document.getElementById("errorMessage");

const cityName =
    document.getElementById("cityName");

const dateElement =
    document.getElementById("date");

const temperature =
    document.getElementById("temperature");

const condition =
    document.getElementById("condition");

const weatherIcon =
    document.getElementById("weatherIcon");

const highTemp =
    document.getElementById("highTemp");

const lowTemp =
    document.getElementById("lowTemp");

const humidity =
    document.getElementById("humidity");

const wind =
    document.getElementById("wind");

const pressure =
    document.getElementById("pressure");

const visibility =
    document.getElementById("visibility");


// ==========================================
// VARIABLES
// ==========================================

let isCelsius = true;

let currentWeather = null;


// ==========================================
// UPDATE DATE
// ==========================================

function updateDate() {

    const today = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    dateElement.textContent =
        today.toLocaleDateString(
            "en-US",
            options
        );
}

updateDate();


// ==========================================
// WEATHER CODE → WEATHER DESCRIPTION
// ==========================================

function getWeatherInfo(code) {

    if (code === 0) {

        return {
            condition: "Clear Sky",
            icon: "☀️"
        };

    }

    if (code === 1 || code === 2) {

        return {
            condition: "Partly Cloudy",
            icon: "🌤️"
        };

    }

    if (code === 3) {

        return {
            condition: "Cloudy",
            icon: "☁️"
        };

    }

    if (
        code === 45 ||
        code === 48
    ) {

        return {
            condition: "Foggy",
            icon: "🌫️"
        };

    }

    if (
        code >= 51 &&
        code <= 57
    ) {

        return {
            condition: "Drizzle",
            icon: "🌦️"
        };

    }

    if (
        code >= 61 &&
        code <= 67
    ) {

        return {
            condition: "Rainy",
            icon: "🌧️"
        };

    }

    if (
        code >= 71 &&
        code <= 77
    ) {

        return {
            condition: "Snow",
            icon: "❄️"
        };

    }

    if (
        code >= 80 &&
        code <= 82
    ) {

        return {
            condition: "Rain Showers",
            icon: "🌦️"
        };

    }

    if (
        code >= 85 &&
        code <= 86
    ) {

        return {
            condition: "Snow Showers",
            icon: "🌨️"
        };

    }

    if (
        code === 95 ||
        code === 96 ||
        code === 99
    ) {

        return {
            condition: "Thunderstorm",
            icon: "⛈️"
        };

    }

    return {

        condition: "Unknown",

        icon: "🌤️"

    };

}



function celsiusToFahrenheit(celsius) {

    return Math.round(
        (celsius * 9 / 5) + 32
    );

}



function formatTemperature(temp) {

    if (temp === null || temp === undefined) {

        return "--";

    }


    if (isCelsius) {

        return `${Math.round(temp)}°C`;

    }


    return `${celsiusToFahrenheit(temp)}°F`;

}




async function searchCity() {

    const city =
        cityInput.value.trim();


    if (city === "") {

        showError(
            "Please enter a city name."
        );

        return;

    }


    hideError();

    setLoading(true);


    try {


        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;


        const geoResponse =
            await fetch(geoURL);


        if (!geoResponse.ok) {

            throw new Error(
                "Unable to search for city."
            );

        }


        const geoData =
            await geoResponse.json();


        if (
            !geoData.results ||
            geoData.results.length === 0
        ) {

            throw new Error(
                "City not found."
            );

        }


        const location =
            geoData.results[0];


        const latitude =
            location.latitude;

        const longitude =
            location.longitude;


        await getWeather(
            latitude,
            longitude,
            location
        );


    } catch (error) {

        console.error(error);

        showError(
            error.message ||
            "Something went wrong."
        );

    } finally {

        setLoading(false);

    }

}



async function getWeather(
    latitude,
    longitude,
    location
) {

    const weatherURL =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m&hourly=visibility&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=celsius&wind_speed_unit=kmh&forecast_days=5&timezone=auto`;


    const response =
        await fetch(weatherURL);


    if (!response.ok) {

        throw new Error(
            "Unable to get weather data."
        );

    }


    const data =
        await response.json();


    updateWeather(
        data,
        location
    );

}


function updateWeather(
    data,
    location
) {

    currentWeather = data;


    cityName.textContent =
        `${location.name}, ${location.country}`;


    const current =
        data.current;


    const weatherInfo =
        getWeatherInfo(
            current.weather_code
        );


    temperature.textContent =
        formatTemperature(
            current.temperature_2m
        );


    condition.textContent =
        weatherInfo.condition;



    weatherIcon.textContent =
        weatherInfo.icon;


    humidity.textContent =
        `${Math.round(
            current.relative_humidity_2m
        )}%`;


    wind.textContent =
        `${Math.round(
            current.wind_speed_10m
        )} km/h`;


    pressure.textContent =
        `${Math.round(
            current.surface_pressure
        )} hPa`;


    highTemp.textContent =
        formatTemperature(
            data.daily.temperature_2m_max[0]
        );


    lowTemp.textContent =
        formatTemperature(
            data.daily.temperature_2m_min[0]
        );


    updateForecast(
        data.daily
    );


    updateVisibility(
        data.hourly
    );

}


function updateForecast(daily) {

    const forecastCards =
        document.querySelectorAll(
            ".forecast-card"
        );


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const card =
            forecastCards[i];


        if (!card) {

            continue;

        }


        const date =
            new Date(
                daily.time[i] + "T12:00:00"
            );


        const dayName =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "long"
                }
            );


        const weatherInfo =
            getWeatherInfo(
                daily.weather_code[i]
            );


        const title =
            card.querySelector("h3");


        const icon =
            card.querySelector(
                ".forecast-icon"
            );


        const temp =
            card.querySelector(
                ".forecast-temp"
            );


        const description =
            card.querySelector(
                "p"
            );


        title.textContent =
            dayName;


        icon.textContent =
            weatherInfo.icon;


        temp.textContent =
            formatTemperature(
                daily.temperature_2m_max[i]
            );


        description.textContent =
            weatherInfo.condition;

    }

}


function updateVisibility(hourly) {

    if (
        !hourly ||
        !hourly.visibility
    ) {

        visibility.textContent =
            "--";

        return;

    }

    const currentHour =
        new Date().getHours();


    const visibilityMeters =
        hourly.visibility[
            Math.min(
                currentHour,
                hourly.visibility.length - 1
            )
        ];


    if (
        visibilityMeters === undefined
    ) {

        visibility.textContent =
            "--";

        return;

    }


    const visibilityKm =
        visibilityMeters / 1000;


    visibility.textContent =
        `${visibilityKm.toFixed(1)} km`;

}



searchBtn.addEventListener(
    "click",
    searchCity
);


cityInput.addEventListener(
    "keypress",
    function(event) {

        if (event.key === "Enter") {

            searchCity();

        }

    }
);



unitBtn.addEventListener(
    "click",
    function() {

        isCelsius =
            !isCelsius;


        if (isCelsius) {

            unitBtn.textContent =
                "°C / °F";

        } else {

            unitBtn.textContent =
                "°F / °C";

        }


        if (currentWeather) {

            const current =
                currentWeather.current;


            const daily =
                currentWeather.daily;


            temperature.textContent =
                formatTemperature(
                    current.temperature_2m
                );


            highTemp.textContent =
                formatTemperature(
                    daily.temperature_2m_max[0]
                );


            lowTemp.textContent =
                formatTemperature(
                    daily.temperature_2m_min[0]
                );


            updateForecast(
                daily
            );

        }

    }
);


themeBtn.addEventListener(
    "click",
    function() {

        document.body.classList.toggle(
            "dark-mode"
        );


        if (
            document.body.classList.contains(
                "dark-mode"
            )
        ) {

            themeBtn.textContent =
                "☀️";

        } else {

            themeBtn.textContent =
                "🌙";

        }

    }
);


locationBtn.addEventListener(
    "click",
    function() {

        if (!navigator.geolocation) {

            showError(
                "Geolocation is not supported by your browser."
            );

            return;

        }


        locationBtn.textContent =
            "📍 Detecting...";


        hideError();


        navigator.geolocation.getCurrentPosition(

            async function(position) {

                const latitude =
                    position.coords.latitude;


                const longitude =
                    position.coords.longitude;


                try {

                    setLoading(true);


                  

                    const weatherURL =
                        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m&hourly=visibility&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=celsius&wind_speed_unit=kmh&forecast_days=5&timezone=auto`;


                    const response =
                        await fetch(
                            weatherURL
                        );


                    if (!response.ok) {

                        throw new Error(
                            "Unable to get weather for your location."
                        );

                    }


                    const data =
                        await response.json();


                    const location = {

                        name: "Your Location",

                        country: ""

                    };


                    updateWeather(
                        data,
                        location
                    );


                } catch (error) {

                    console.error(error);


                    showError(
                        "Unable to get weather for your location."
                    );

                } finally {

                    setLoading(false);

                }


                locationBtn.textContent =
                    "📍 My Location";

            },


            function() {

                locationBtn.textContent =
                    "📍 My Location";


                showError(
                    "Location permission was denied."
                );

            }

        );

    }
);

function setLoading(isLoading) {

    if (isLoading) {

        searchBtn.disabled = true;

        searchBtn.textContent =
            "Loading...";

    } else {

        searchBtn.disabled = false;

        searchBtn.textContent =
            "Search";

    }

}


function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.style.display =
        "block";

}



function hideError() {

    errorMessage.textContent =
        "";

    errorMessage.style.display =
        "none";

}


cityInput.value =
    "Lahore";


searchCity();