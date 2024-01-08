// TODO: Current Weather background change depending on weather only on default mode, Light mode and Dark mode background doesn't change
// TODO: Slider for Modes: Light, Default, Dark
// TODO: Developer Mode for OpenWeatherMap API Key
// TODO: 

// TODO: Change before commit
const apiKey = 'e9a0824a1e90c45f262aa4a15de73a21';
const mapboxToken = 'pk.eyJ1IjoiczI3Mjg4IiwiYSI6ImNscjI2cGZveTA5eGsyam1wd20zb2dodjAifQ.e3K5AHnJvxXHclYQCIcnmg';

// const apiKey = process.env.REACT_APP_OPENWEATHERMAPAPI;
// const mapboxToken = process.env.REACT_APP_MAPBOXTOKEN;

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const modeSlider = document.getElementById('modeSlider');
const modeText = document.getElementById('modeText');
const MODE_KEY = 'websiteMode';

function updateMode(mode) {
  switch (mode) {
    case 'Light':
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      document.body.classList.remove('default-mode');
      break;
    case 'Default':
      document.body.classList.remove('dark-mode', 'light-mode');
      document.body.classList.add('default-mode');
      break;
    case 'Dark':
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
      document.body.classList.remove('default-mode');
      break;
    default:
      break;
  }
  modeText.textContent = mode;
  localStorage.setItem(MODE_KEY, mode);
}

if (localStorage.getItem(MODE_KEY)) {
  const savedMode = localStorage.getItem(MODE_KEY);
  modeSlider.value = savedMode === 'Light' ? '1' : savedMode === 'Dark' ? '3' : '2';
  updateMode(savedMode);
} else {
  updateMode('Default'); // Set default mode if no saved mode is found
}

// Function to fetch location suggestions from MapBox API
async function getLocationSuggestions(query) {
  const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxToken}`);
  const data = await response.json();
  return data.features.map(feature => {
    return {
      place_name: feature.place_name,
      coordinates: feature.center
    };
  });
}

// Function to display location suggestions
function displayLocationSuggestions(suggestions) {
  const suggestionsList = document.getElementById('suggestions-list');
  suggestionsList.style.display = 'block';
  suggestionsList.innerHTML = '';

  suggestions.forEach(suggestion => {
    const listItem = document.createElement('li');
    listItem.textContent = suggestion.place_name;
    listItem.onclick = () => selectLocation(suggestion.coordinates, suggestion.place_name);
    suggestionsList.appendChild(listItem);
  });
}

// Function to handle the selection of a location from suggestions
async function selectLocation(coordinates, place_name) {
  const [longitude, latitude] = coordinates; // Correctly extract latitude and longitude

  try {
    const weatherData = await getWeatherData(latitude, longitude);
    const forecastHourlyData = await getForecastHourlyData(latitude, longitude);
  
    displayCurrentWeather(weatherData, place_name);
    displayForecastHourlyData(forecastHourlyData);

    // Set selected suggestion to the input box
    const locationInput = document.getElementById('location-input-field');
    locationInput.value = `${place_name}`;

    // Clear suggestions list from the DOM
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '';
    
    // Hide the suggestions list
    suggestionsList.style.display = 'none';

    // Move cursor out of the input field
    locationInput.blur(); 

  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Handle error - for example, display an error message to the user
  }
}

// Function to handle user input for location autocomplete
async function handleInput() {
  const locationInput = document.getElementById('location-input-field').value;
  if (locationInput.length > 0) {
    const suggestions = await getLocationSuggestions(locationInput);
    displayLocationSuggestions(suggestions);
  } else {
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '';
  }
}

// Function to fetch weather data from OpenWeatherMap API
async function getWeatherData(latitude, longitude) {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
  const data = await response.json();
  return data;
}

async function getForecastHourlyData(latitude, longitude) {
  const response = await fetch(`https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&cnt=24`);
  const data = await response.json();
  return data.list;
}

// Function to display current weather and secrets
function displayCurrentWeather(weather, place_name) {
  const currentWeatherTitle = document.getElementById('current-weather-title');
  currentWeatherTitle.innerHTML = `<h2>Current Weather in ${place_name}</h2>`;

  const currentWeatherElement = document.getElementById('current-weather');
  currentWeatherElement.innerHTML = `
    <p>Weather: ${capitalizeFirstLetter(weather.weather[0].description)}</p>
    <p>Temperature: ${Math.round(weather.main.temp)}°C</p>
    <p>Feels Like: ${Math.round(weather.main.feels_like)}°C</p>
    <p>Humidity: ${Math.round(weather.main.humidity)}%</p>
    <p>Wind Speed: ${Math.round(weather.wind.speed)} m/s</p>
    <p>Sunrise: ${new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}</p>
    <p>Sunset: ${new Date(weather.sys.sunset * 1000).toLocaleTimeString()}</p>
  `;

  const currentWeatherIcon = document.getElementById('current-weather-icon');
  const weatherIconID = weather.weather[0].icon;

  if (weatherIconID === '01d') {
    currentWeatherIcon.innerHTML = `<img src="images/002-clear-sky-day.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#ffe96e');
  } else if (weatherIconID === '01n') {
    currentWeatherIcon.innerHTML = `<img src="images/003-clear-sky-night.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#a0a0a0');
  } else if (weatherIconID === '02d') {
    currentWeatherIcon.innerHTML = `<img src="images/004-few-clouds-day.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#ffe96e');
  } else if (weatherIconID === '02n') {
    currentWeatherIcon.innerHTML = `<img src="images/005-few-clouds-night.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#a0a0a0');
  } else if (weatherIconID === '03d') {
    currentWeatherIcon.innerHTML = `<img src="images/006-scattered-clouds.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#ffe96e');
  } else if (weatherIconID === '03n') {
    currentWeatherIcon.innerHTML = `<img src="images/006-scattered-clouds.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#a0a0a0');
  } else if (weatherIconID === '04d') {
    currentWeatherIcon.innerHTML = `<img src="images/007-broken-clouds.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#a0a0a0');
  } else if (weatherIconID === '04n') {
    currentWeatherIcon.innerHTML = `<img src="images/007-broken-clouds.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#a0a0a0');
  } else if (weatherIconID === '09d') {
    currentWeatherIcon.innerHTML = `<img src="images/008-shower-rain.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#5cc3ff');
  } else if (weatherIconID === '09n') {
    currentWeatherIcon.innerHTML = `<img src="images/008-shower-rain.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#5cc3ff');
  } else if (weatherIconID === '10d') {
    currentWeatherIcon.innerHTML = `<img src="images/009-rain-day.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#6a74ff');
  } else if (weatherIconID === '10n') {
    currentWeatherIcon.innerHTML = `<img src="images/010-rain-night.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#6a74ff');
  } else if (weatherIconID === '11d') {
    currentWeatherIcon.innerHTML = `<img src="images/011-thunderstorm.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#363d9e');
  } else if (weatherIconID === '11n') {
    currentWeatherIcon.innerHTML = `<img src="images/011-thunderstorm.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#363d9e');
  } else if (weatherIconID === '13d') {
    currentWeatherIcon.innerHTML = `<img src="images/012-snow.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#f0f0f0');
  } else if (weatherIconID === '13n') {
    currentWeatherIcon.innerHTML = `<img src="images/012-snow.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#f0f0f0');
  } else if (weatherIconID === '50d') {
    currentWeatherIcon.innerHTML = `<img src="images/013-mist.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#a0a0a0');
  } else if (weatherIconID === '50n') {
    currentWeatherIcon.innerHTML = `<img src="images/013-mist.png" alt="Current Weather Icon">`;
    document.documentElement.style.setProperty('--default-background-color', '#a0a0a0');
  } else {
    currentWeatherIcon.innerHTML = `<img src="images/001-meteorology.png" alt="Current Weather Icon">`;
  }
  // TODO: Unknown weatherID icon

  // Memes
  const memeBoxElement = document.getElementById('meme-box');
  if (Math.round(weather.main.temp) < -10) {
    memeBoxElement.innerHTML = `<img src="images/memes/Jack-Nicholson-The-Shining-Snow.jpg" alt="Meme">`;
  } else if (Math.round(weather.main.temp) >= -9 && weather.main.temp < 19) {
    if (weather.weather[0].main === 'Rain' || weather.weather[0].main === 'Drizzle' || weather.weather[0].main === 'Thunderstorm') {
      memeBoxElement.innerHTML = `<img src="images/memes/8d37f35ff717b6691ab1acf90dce6c83.jpg" alt="Meme">`;
    } else if (weather.weather[0].main === 'Snow') {
      memeBoxElement.innerHTML = `<img src="images/memes/Snowing.jpg" alt="Meme">`;
    } else if (weather.weather[0].main === 'Clouds') {
      memeBoxElement.innerHTML = `<img src="images/004-few-clouds-day.png" alt="Meme">`; // TODO: Change meme for clouds
    } else if (weatherIconID === '50d') {
      memeBoxElement.innerHTML = `<img src="images/memes/Mist.jpg" alt="Meme">`;
    } else { // Clear weather
      memeBoxElement.innerHTML = `<img src="images/002-clear-sky-day.png" alt="Meme">`; // TODO: Change meme for clear weather
    }
  } else if (Math.round(weather.main.temp) >= 20 && weather.main.temp <= 30) {
    memeBoxElement.innerHTML = `<img src="images/memes/0_ZjYSm_q36J4KChdn.jpg" alt="Meme">`;
  } else if (Math.round(weather.main.temp) > 30) { 
    memeBoxElement.innerHTML = `<img src="images/memes/5d018c085cf9819634dee6572fb5dd79.jpg" alt="Meme">`;
  } else {
    memeBoxElement.innerHTML = `<img src="images/002-clear-sky-day.png" alt="Meme">`; // TODO: Change meme for clear weather
  }


  // Display the current weather container
  const currentWeatherContainer = document.getElementById('current-weather-container');
  currentWeatherContainer.style.display = 'grid';
  
}

function displayForecastHourlyData(forecastHourly) {
  const forecastHourlyDataElement = document.getElementById('forecast-hourly-box');
  forecastHourlyDataElement.innerHTML = '';
  
  forecastHourly.forEach(hour => {
    const date = new Date(hour.dt * 1000); // Convert Unix timestamp to JavaScript date object
    const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    const weather = hour.weather[0];
    const temperature = Math.round(hour.main.temp);
    const feelsLike = Math.round(hour.main.feels_like);
    const humidity = Math.round(hour.main.humidity);
    const description = capitalizeFirstLetter(weather.description);
    const iconUrl = `http://openweathermap.org/img/wn/${weather.icon}.png`;

    const forecastItem = `
      <div class="forecast-hourly-item">
        <div class="forecast-hourly-time"><p>${time}</p></div>
        <div class="forecast-hourly-icon"><img src="${iconUrl}" alt="${description}"></div>
        <div class="forecast-hourly-temperature"><p>${temperature}/${feelsLike}°C</p></div>
        <div class="forecast-hourly-humidity"><p>${humidity}%</p></div>
        <div class="forecast-hourly-description"><p>${description}</p></div>
      </div>
    `;
    forecastHourlyDataElement.innerHTML += forecastItem;
  });
  // Display the forecast title and table
  const forecastHourlyContainer = document.getElementById('forecast-hourly-container');
  forecastHourlyContainer.style.display = 'grid';
}

// Function to handle the toggle of forecast table visibility
function toggleForecastTable() {
  const forecastTable = document.getElementById('forecast-table');
  if (forecastTable.style.display === 'none') {
    forecastTable.style.display = 'table';
  } else {
    forecastTable.style.display = 'none';
  }
}

// Function to handle the search and retrieve weather data
async function searchWeather() {
  const locationInput = document.getElementById('location-input-field').value;
  
  // Fetch coordinates using MapBox geocoding API
  const mapboxResponse = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${locationInput}.json?access_token=${mapboxToken}`);
  const mapboxData = await mapboxResponse.json();
  const coordinates = mapboxData.features[0].center;

  const latitude = coordinates[1];
  const longitude = coordinates[0];
  
  const weatherData = await getWeatherData(`${latitude},${longitude}`);
  const forecastHourlyData = await getForecastHourlyData(`${latitude},${longitude}`);
  
  displayCurrentWeather(weatherData, mapboxData.features[0].place_name);
  displayForecastHourlyData(forecastHourlyData);
}

// Function to handle search when button is clicked or Enter is pressed
function searchWeatherOnClick() {
  const locationInput = document.getElementById('location-input-field').value;

  if (locationInput.length > 0) {
    // Fetch suggestions from MapBox API
    getLocationSuggestions(locationInput)
      .then(suggestions => {
        if (suggestions.length > 0) {
          const coordinates = suggestions[0].coordinates;
          const place_name = suggestions[0].place_name;
          selectLocation(coordinates, place_name);
        }
      })
      .catch(error => {
        console.error('Error fetching location suggestions:', error);
        // Handle error - for example, display an error message to the user
      });
  }
  else {
    alert('Please enter a location to search for weather data.');
  }
}

function clearInputField() {
  const locationInput = document.getElementById('location-input-field');
  locationInput.value = ''; // Clear the input field value
}

function displayPopupOnDesktop() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) {
    const popup = document.getElementById('popup');
    popup.style.display = 'block';
  }
}

// Function to close the popup
function closePopup() {
  const popup = document.getElementById('popup');
  popup.style.display = 'none';
}

// Set timeout to display the popup after 20 seconds for desktop devices
setTimeout(displayPopupOnDesktop, 20000); // 20 seconds in milliseconds 

const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiCodeIndex = 0;

function checkKonamiCode(event) {
  const key = event.key;
  const requiredKey = konamiCode[konamiCodeIndex];

  if (key === requiredKey) {
    konamiCodeIndex++;

    if (konamiCodeIndex === konamiCode.length) {
      // Konami code successfully entered, perform action (e.g., show an Easter egg)
      
      // Display the meme container
      const memeContainer = document.getElementById('meme-container');
      memeContainer.style.display = 'grid';
      
      konamiCodeIndex = 0; // Reset index for next entry
    }
  } else {
    konamiCodeIndex = 0; // Reset index if wrong key is pressed
  }
}

// Attach an event listener to the input field for real-time suggestions
const inputField = document.getElementById('location-input-field');
inputField.addEventListener('input', handleInput);

const searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', searchWeatherOnClick);

const locationInput = document.getElementById('location-input-field');
locationInput.addEventListener('click', clearInputField);

const weatherAppIcon = document.getElementById('weather-app-icon');
weatherAppIcon.addEventListener('click', () => {
  location.reload();
});

// Handle Enter key press
inputField.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    searchWeatherOnClick();
  }
});

// Event listener for key presses
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    konamiCodeIndex = 0; // Reset index if Escape key is pressed
  } else {
    checkKonamiCode(event);
  }
});

// Event listener for mode slider change
modeSlider.addEventListener('input', () => {
  let mode = 'Default';

  switch (parseInt(modeSlider.value)) {
    case 1:
      mode = 'Light';
      break;
    case 2:
      mode = 'Default';
      break;
    case 3:
      mode = 'Dark';
      break;
    default:
      break;
  }

  updateMode(mode);
});