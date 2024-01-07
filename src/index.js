// TODO: Current Weather background change depending on weather only on default mode, Light mode and Dark mode background doesn't change
// TODO: Slider for Modes: Light, Default, Dark
// TODO: Developer Mode for OpenWeatherMap API Key
// TODO: 

// TODO: Change before commit

const apiKey = process.env.REACT_APP_OPENWEATHERMAPAPI;
const mapboxToken = process.env.REACT_APP_MAPBOXTOKEN;

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
    const forecastData = await getForecastData(latitude, longitude);
  
    displayCurrentWeather(weatherData, place_name);
    displayForecastData(forecastData);

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

// Function to fetch forecast data from OpenWeatherMap API
async function getForecastData(latitude, longitude) {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
  const data = await response.json();
  return data;
}

// Function to display current weather
function displayCurrentWeather(weather, place_name) {
  const currentWeatherElement = document.getElementById('current-weather');
  currentWeatherElement.innerHTML = `
    <h3>Current Weather in ${place_name}</h3>
    <p>Temperature: ${weather.main.temp}°C</p>
    <p>Feels Like: ${weather.main.feels_like}°C</p>
    <p>Pressure: ${weather.main.pressure} hPa</p>
    <p>Humidity: ${weather.main.humidity}%</p>
  `;

  // Display the current weather element
  const currentWeather = document.getElementById('current-weather');
  currentWeather.style.display = 'block';
}

// Function to display forecast data in a table
function displayForecastData(forecast) {
  const forecastDataElement = document.getElementById('forecast-data');
  forecastDataElement.innerHTML = '';

  forecast.list.forEach(item => {
    const dateTime = new Date(item.dt * 1000);
    const day = dateTime.getDate().toString().padStart(2, '0'); // Get day (two digits)
    const month = (dateTime.getMonth() + 1).toString().padStart(2, '0'); // Get month (two digits)
    const year = dateTime.getFullYear(); // Get year
    const hours = dateTime.getHours().toString().padStart(2, '0'); // Get hours (24-hour format)
    const minutes = dateTime.getMinutes().toString().padStart(2, '0'); // Get minutes (two digits)
    
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes}`;
    
    const row = `
      <tr>
        <td>${formattedDate} ${formattedTime}</td>
        <td>${item.main.temp}°C</td>
        <td>${item.main.feels_like}°C</td>
        <td>${item.main.pressure} hPa</td>
        <td>${item.main.humidity}%</td>
      </tr>
    `;
    forecastDataElement.innerHTML += row;
  });
  // Display the forecast title and table
  const forecastTitle = document.getElementById('forecast-title');
  const forecastTable = document.getElementById('forecast-table');
  forecastTitle.style.display = 'block';
  forecastTable.style.display = 'none';
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
  const forecastData = await getForecastData(`${latitude},${longitude}`);
  
  displayCurrentWeather(weatherData, mapboxData.features[0].place_name);
  displayForecastData(forecastData);
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
      alert('Konami code activated! 🎉');
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

const forecastTitle = document.getElementById('forecast-title');
forecastTitle.addEventListener('click', toggleForecastTable);

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