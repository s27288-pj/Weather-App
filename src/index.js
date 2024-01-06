let isDarkMode = false;

function toggleMode() {
  const body = document.body;
  body.classList.toggle('dark-mode');
  isDarkMode = !isDarkMode;

  // Save user preference to localStorage
  localStorage.setItem('darkMode', isDarkMode);
}

// Check user preference in localStorage on page load
window.onload = function () {
  const userPrefersDark = localStorage.getItem('darkMode') === 'true';

  if (userPrefersDark) {
    toggleMode();
  }
};

const apiKey = process.env.REACT_APP_OPENWEATHERMAPAPI;
const mapboxToken = process.env.REACT_APP_MAPBOXTOKEN;

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
  suggestionsList.innerHTML = '';

  suggestions.forEach(suggestion => {
    const listItem = document.createElement('li');
    listItem.textContent = suggestion.place_name;
    listItem.onclick = () => selectLocation(suggestion.coordinates, suggestion.place_name);
    suggestionsList.appendChild(listItem);
  });
}

// Function to handle the selection of a location from suggestions
async function selectLocation(coordinates, placeName) {
  const [longitude, latitude] = coordinates; // Correctly extract latitude and longitude

  try {
    const weatherData = await getWeatherData(latitude, longitude);
    const forecastData = await getForecastData(latitude, longitude);
  
    displayCurrentWeather(weatherData);
    displayForecastData(forecastData);

    // Set selected suggestion to the input box
    const locationInput = document.getElementById('location-input');
    locationInput.value = `${placeName}`;

    // Clear suggestions list from the DOM
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '';
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Handle error - for example, display an error message to the user
  }
}

// Function to handle user input for location autocomplete
async function handleInput() {
  const locationInput = document.getElementById('location-input').value;
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
function displayCurrentWeather(weather) {
  const currentWeatherElement = document.getElementById('current-weather');
  currentWeatherElement.innerHTML = `
    <p>Temperature: ${weather.main.temp}°C</p>
    <p>Feels Like: ${weather.main.feels_like}°C</p>
    <p>Pressure: ${weather.main.pressure} hPa</p>
    <p>Humidity: ${weather.main.humidity}%</p>
  `;

  // Display the current weather title
  const currentWeatherTitle = document.getElementById('current-weather-title');
  currentWeatherTitle.style.display = 'block';
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
  forecastTable.style.display = 'table';
}

// Function to handle the search and retrieve weather data
async function searchWeather() {
  const locationInput = document.getElementById('location-input').value;
  
  // Fetch coordinates using MapBox geocoding API
  const mapboxResponse = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${locationInput}.json?access_token=${mapboxToken}`);
  const mapboxData = await mapboxResponse.json();
  const coordinates = mapboxData.features[0].center;

  const latitude = coordinates[1];
  const longitude = coordinates[0];
  
  const weatherData = await getWeatherData(`${latitude},${longitude}`);
  const forecastData = await getForecastData(`${latitude},${longitude}`);
  
  displayCurrentWeather(weatherData);
  displayForecastData(forecastData);
}

// Function to handle search when button is clicked or Enter is pressed
function searchWeatherOnClick() {
  const locationInput = document.getElementById('location-input').value;

  if (locationInput.length > 0) {
    // Fetch suggestions from MapBox API
    getLocationSuggestions(locationInput)
      .then(suggestions => {
        if (suggestions.length > 0) {
          const coordinates = suggestions[0].coordinates;
          const placeName = suggestions[0].place_name;
          selectLocation(coordinates, placeName);
        }
      })
      .catch(error => {
        console.error('Error fetching location suggestions:', error);
        // Handle error - for example, display an error message to the user
      });
  }
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
setTimeout(displayPopupOnDesktop, 5000); // 20 seconds in milliseconds 
// TODO: Change to 20 seconds

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
const inputField = document.getElementById('location-input');
inputField.addEventListener('input', handleInput);

const searchButton = document.querySelector('button');
searchButton.addEventListener('click', searchWeatherOnClick);

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
