require("dotenv").config();
const axios = require("axios");
const SunCalc = require("suncalc");

const getWeatherData = async (latitude, longitude) => {
    try {
        const response = await axios.get(
            "https://api.open-meteo.com/v1/forecast",
            {
                params: {
                    latitude: latitude,
                    longitude: longitude,
                    current: "temperature_2m,soil_moisture_0_to_7cm,wind_speed_10m"
                }
            }
        );
        return response.data;
    } catch (error) {
        console.log("Open-Meteo API Error:", error.message);
        throw error;
    }
};

const getAQIData = async () => {
    try {
        const response = await axios.get(
            "https://api.waqi.info/feed/kolkata/",
            {
                params: {
                    token: process.env.WAQI_TOKEN
                }
            }
        );
        return response.data;
    } catch (error) {
        console.log("WAQI API Error:", error.message);
        throw error;
    }
};

const getSunData = (latitude, longitude) => {
    const times = SunCalc.getTimes(new Date(), latitude, longitude);
    return {
        sunrise: times.sunrise,
        sunset: times.sunset
    };
};

console.log("=== DEBUG BUILD LOADED ===");
const _debugKey = process.env.MAPPLS_LICENSE_KEY || "";
console.log(
    "MAPPLS_LICENSE_KEY loaded:",
    _debugKey ? `${_debugKey.slice(0, 4)}...${_debugKey.slice(-4)} (length ${_debugKey.length})` : "MISSING / EMPTY"
);

const getMarineData = async (latitude, longitude) => {
    try {
        const response = await axios.get(
            "https://marine-api.open-meteo.com/v1/marine",
            {
                params: {
                    latitude: latitude,
                    longitude: longitude,
                    current: "wave_height,wave_direction,wave_period"
                }
            }
        );

        return response.data;
    } catch (error) {
        console.log("Open-Meteo Marine API Error:", error.message);
        throw error;
    }
};

module.exports = {
    getWeatherData,
    getAQIData,
    getSunData,
    getMarineData
};