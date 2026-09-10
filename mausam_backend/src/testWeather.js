const { getWeatherData, getAQIData, getSunData, getMarineData } = require("./services/externalApiService");

const { processWeatherData, processAQIData, processSunData, processMarineData } = require("./utils/dataProcessor");
const test = async () => {
    try {
        // Get weather data
        const rawWeatherData = await getWeatherData(22.5726, 88.3639);

        // Process weather data
        const weatherData = processWeatherData(rawWeatherData);

        console.log("Processed Weather Data:");
        console.log(weatherData);

        // Get AQI data
        const rawAQIData = await getAQIData();

        // Process AQI data
        const aqiData = processAQIData(rawAQIData);

        console.log("Processed AQI Data:");
        console.log(aqiData);

        // Get Sun data
        const rawSunData = getSunData(22.5726, 88.3639);

        const sunData = processSunData(rawSunData);

        console.log("Processed Sun Data:");
        console.log(sunData);

        const marineData = await getMarineData(22.5726, 88.3639);

        console.log("Raw Marine Data:");
        console.log(marineData);

        const processedMarineData = processMarineData(marineData);

        console.log("Processed Marine Data:");
        console.log(processedMarineData);

    } catch (error) {
        console.log("Test failed:", error.message);
    }
};

test();