const processWeatherData = (rawData) => {
    const current = rawData.current;

    return {
        temp: current.temperature_2m,
        soilMoisture: current.soil_moisture_0_to_7cm,
        windSpeed: current.wind_speed_10m
    };
};

const processAQIData = (rawData) => {
    return {
        aqi: rawData.data.aqi
    };
};

const processSunData = (rawData) => {
    return {
        sunrise: rawData.sunrise.toISOString(),
        sunset: rawData.sunset.toISOString()
    };
};

const processMarineData = (rawData) => {
    const current = rawData.current;

    return {
        waveHeight: current.wave_height,
        waveDirection: current.wave_direction,
        wavePeriod: current.wave_period
    };
};

module.exports = {
    processWeatherData,
    processAQIData,
    processSunData,
    processMarineData
};