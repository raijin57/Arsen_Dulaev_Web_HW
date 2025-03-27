const API_KEY = '52bf40626d4b4b55bba123359252002';
let abortController = null;

async function fetchWithTimeout(url, timeout = 8000) {
    abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);
    
    try {
        const response = await fetch(url, { 
            signal: abortController.signal 
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error.message);
        }
        return response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Запрос превысил время ожидания или был отменен');
        }
        throw error;
    }
}

async function loadWeather() {
    try {
        // Очистка предыдущих данных
        document.getElementById('error').textContent = '';
        document.getElementById('weatherSpace').innerHTML = '<div class="loading"></div>';
        document.getElementById('forecastSpace').innerHTML = '';

        const inputVar = document.getElementById("text").value.trim();
        if (!inputVar) throw new Error('Пожалуйста, введите город');
        
        // Запросы
        const currentWeather = await fetchWithTimeout(
            `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${inputVar}&lang=ru`
        );
        
        const forecast = await fetchWithTimeout(
            // По непонятным причинам, больше 3 не приходит, кажется ограничение в ключе.
            `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${inputVar}&days=7&lang=ru&aqi=no&alerts=no`
        );

        // Отображение данных
        displayWeather(currentWeather);
        displayForecast(forecast);
    } catch (error) {
        document.getElementById('error').textContent = error.message;
        document.getElementById('weatherSpace').innerHTML = '';
        document.getElementById('forecastSpace').innerHTML = '';
    } finally {
        abortController = null;
    }
}

function cancelRequest() {
    if (abortController) {
        abortController.abort();
    }
}

// Отображение текущей погоды
function displayWeather(data) {
    const content = `
        <div class="weather-card">
            <p>${data.location.name}, ${data.location.country}</p>
            <p>Температура: ${data.current.temp_c}°C</p>
            <p>Влажность: ${data.current.humidity}%</p>
            <img src="${data.current.condition.icon}" alt="${data.current.condition.text}">
            <p>${data.current.condition.text}</p>
        </div>
    `;
    document.getElementById('weatherSpace').innerHTML = content;
}

// Отображение прогноза на неделю
function displayForecast(data) {
    const forecastDays = data.forecast.forecastday;
    let content = '<h2>Прогноз на неделю</h2>'; // Добавляем заголовок динамически
    content += '<div class="forecast-container">';
    forecastDays.forEach(day => {
        content += `
            <div class="forecast-day">
                <p>${new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'long' })}</p>
                <img src="${day.day.condition.icon}" alt="${day.day.condition.text}">
                <p>${day.day.condition.text}</p>
                <p>Макс.: ${day.day.maxtemp_c}°C</p>
                <p>Мин.: ${day.day.mintemp_c}°C</p>
            </div>
        `;
    });
    content += '</div>';
    document.getElementById('forecastSpace').innerHTML = content;
}