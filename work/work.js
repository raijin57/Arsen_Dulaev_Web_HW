const API_KEY = '52bf40626d4b4b55bba123359252002';

// Функция для получения текущей погоды
function fetchWeather() {
    return new Promise((resolve, reject) => {
        const inputVar = document.getElementById("text").value.trim();
        if (!inputVar) {
            reject(new Error('Пожалуйста, введите город или координаты.'));
            return;
        }

        // Проверяем корректность координат или города
        const coordRegex = /^-?\d{1,3}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$/;
        if (!coordRegex.test(inputVar) && !/^[a-zA-Zа-яА-Я\s]+$/.test(inputVar)) {
            reject(new Error('Некорректный формат города или координат.'));
            return;
        }

        const xhr = new XMLHttpRequest();
        const API_URL = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${inputVar}&aqi=no&lang=ru`;
        xhr.open('GET', API_URL, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (error) {
                    reject(new Error('Ошибка при обработке данных от API.'));
                }
            } else {
                let errorMessage = 'Произошла ошибка при запросе к API.';
                switch (xhr.status) {
                    case 400:
                        errorMessage = 'Город или координаты не найдены. Проверьте введенные данные.';
                        break;
                    case 401:
                        errorMessage = 'Ошибка авторизации API. Проверьте ключ.';
                        break;
                    case 403:
                        errorMessage = 'Доступ к API запрещен. Проверьте ключ или права доступа.';
                        break;
                    case 404:
                        errorMessage = 'API не найден. Проверьте URL запроса.';
                        break;
                    case 429:
                        errorMessage = 'Слишком много запросов. Попробуйте позже.';
                        break;
                    case 500:
                        errorMessage = 'Ошибка на стороне сервера. Попробуйте позже.';
                        break;
                    case 503:
                        errorMessage = 'Сервис временно недоступен. Попробуйте позже.';
                        break;
                    default:
                        try {
                            const errorData = JSON.parse(xhr.responseText);
                            if (errorData.error && errorData.error.message) {
                                errorMessage = errorData.error.message;
                            }
                        } catch (e) {
                            // Если не удалось распарсить ответ, оставляем общее сообщение
                        }
                        break;
                }
                reject(new Error(errorMessage));
            }
        };
        xhr.onerror = function () {
            reject(new Error('Ошибка сети. Проверьте подключение к интернету.'));
        };
        xhr.send();
    });
}

// Функция для получения прогноза на неделю
function fetchForecast() {
    return new Promise((resolve, reject) => {
        const inputVar = document.getElementById("text").value.trim();
        if (!inputVar) {
            reject(new Error('Пожалуйста, введите город или координаты.'));
            return;
        }

        const xhr = new XMLHttpRequest();
        const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${inputVar}&days=7&lang=ru`;
        xhr.open('GET', API_URL, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (error) {
                    reject(new Error('Ошибка при обработке данных от API.'));
                }
            } else {
                let errorMessage = 'Произошла ошибка при запросе к API.';
                switch (xhr.status) {
                    case 400:
                        errorMessage = 'Город или координаты не найдены. Проверьте введенные данные.';
                        break;
                    case 401:
                        errorMessage = 'Ошибка авторизации API. Проверьте ключ.';
                        break;
                    case 403:
                        errorMessage = 'Доступ к API запрещен. Проверьте ключ или права доступа.';
                        break;
                    case 404:
                        errorMessage = 'API не найден. Проверьте URL запроса.';
                        break;
                    case 429:
                        errorMessage = 'Слишком много запросов. Попробуйте позже.';
                        break;
                    case 500:
                        errorMessage = 'Ошибка на стороне сервера. Попробуйте позже.';
                        break;
                    case 503:
                        errorMessage = 'Сервис временно недоступен. Попробуйте позже.';
                        break;
                    default:
                        try {
                            const errorData = JSON.parse(xhr.responseText);
                            if (errorData.error && errorData.error.message) {
                                errorMessage = errorData.error.message;
                            }
                        } catch (e) {
                            // Если не удалось распарсить ответ, оставляем общее сообщение
                        }
                        break;
                }
                reject(new Error(errorMessage));
            }
        };
        xhr.onerror = function () {
            reject(new Error('Ошибка сети. Проверьте подключение к интернету.'));
        };
        xhr.send();
    });
}

// Основная функция
async function loadWeather() {
    try {
        // Очистка предыдущих данных
        document.getElementById('error').textContent = '';
        document.getElementById('weatherSpace').innerHTML = '<p class="loading">Загрузка...</p>';
        document.getElementById('forecastSpace').innerHTML = '';

        // Получение данных
        const weatherData = await fetchWeather();
        const forecastData = await fetchForecast();

        // Отображение данных
        displayWeather(weatherData);
        displayForecast(forecastData);
    } catch (error) {
        document.getElementById('error').textContent = error.message;
        document.getElementById('weatherSpace').innerHTML = '';
        document.getElementById('forecastSpace').innerHTML = '';
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