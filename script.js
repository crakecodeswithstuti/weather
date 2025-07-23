const input = document.querySelector('#cityinput');
const btn = document.querySelector('#add');
const city = document.querySelector('#cityoutput span');
const description = document.querySelector('#description span');
const temp = document.querySelector('#temp span');
const wind = document.querySelector('#wind span');
const aqi = document.querySelector('#aqi span');
const healthTip = document.querySelector('#healthTip span');
const loader = document.querySelector('#loader');
const weatherDisplay = document.querySelector('#weatherDisplay');
const forecastSection = document.querySelector('#forecastSection');
const forecastCards = document.querySelector('#forecastCards');
const background = document.querySelector('#background');
const langToggle = document.querySelector('#langToggle');
const themeToggle = document.querySelector('#themeToggle');
const weatherAnim = document.querySelector('#weatherAnim');

const apiKey = "1d470d45d0c8bf4941e3e28a40ec642c";
let currentLang = "en";

const translations = {
  en: {
    weather: "Weather of",
    sky: "Sky Conditions",
    temp: "Temperature",
    wind: "Wind Speed",
    aqi: "Air Quality",
    health: "Health Tip",
    submit: "Submit"
  },
  hi: {
    weather: "मौसम",
    sky: "आकाश की स्थिति",
    temp: "तापमान",
    wind: "हवा की गति",
    aqi: "वायु गुणवत्ता",
    health: "स्वास्थ्य सुझाव",
    submit: "जमा करें"
  }
};

function convertToCelsius(kelvin) {
  return (kelvin - 273.15).toFixed(1);
}

function getWeather(cityName) {
  loader.style.display = 'block';
  weatherDisplay.style.display = 'none';
  forecastSection.style.display = 'none';

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      updateMainWeather(data);
      fetchForecast(data.coord.lat, data.coord.lon);
      fetchAQI(data.coord.lat, data.coord.lon);
    })
    .catch(() => {
      loader.style.display = 'none';
      alert("Please enter a valid city name.");
    });
}

function updateMainWeather(data) {
  const name = data.name;
  const desc = data.weather[0].description;
  const tempVal = data.main.temp;
  const windVal = data.wind.speed;
  const mainCondition = data.weather[0].main.toLowerCase();

  city.innerText = `${translations[currentLang].weather} ${name}`;
  temp.innerText = `${convertToCelsius(tempVal)} °C`;
  description.innerText = `${desc}`;
  wind.innerText = `${windVal} km/h`;

  weatherDisplay.style.display = 'block';
  updateBackground(mainCondition);
  applyWeatherAnimation(mainCondition);
}

function updateBackground(condition) {
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 18;
  const backgrounds = {
    clear: "#fceabb, #f8b500",
    clouds: "#bdc3c7, #2c3e50",
    rain: "#4e54c8, #8f94fb",
    drizzle: "#4e54c8, #8f94fb",
    thunderstorm: "#373b44, #4286f4",
    snow: "#83a4d4, #b6fbff",
    mist: "#636363, #a2ab58",
    fog: "#636363, #a2ab58",
    haze: "#636363, #a2ab58"
  };
  background.style.background = `linear-gradient(to right, ${backgrounds[condition] || (isDay ? "#83a4d4, #b6fbff" : "#0f2027, #203a43, #2c5364")})`;
}

function applyWeatherAnimation(condition) {
  weatherAnim.className = "";
  if (["rain", "drizzle", "thunderstorm"].includes(condition)) {
    weatherAnim.classList.add("rain");
  } else if (condition === "snow") {
    weatherAnim.classList.add("snow");
  } else if (["mist", "fog", "haze"].includes(condition)) {
    weatherAnim.classList.add("fog");
  }
}

function fetchForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      loader.style.display = 'none';
      forecastCards.innerHTML = "";
      data.daily.slice(0, 7).forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString(currentLang === "hi" ? "hi-IN" : "en-IN", { weekday: "short" });
        const icon = day.weather[0].icon;
        const min = convertToCelsius(day.temp.min);
        const max = convertToCelsius(day.temp.max);
        forecastCards.innerHTML += `
          <div class="card">
            <h4>${dayName}</h4>
            <img src="http://openweathermap.org/img/wn/${icon}.png" alt="icon">
            <p>${min}° / ${max}°</p>
          </div>`;
      });
      forecastSection.style.display = 'block';
    });
}

function fetchAQI(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      const index = data.list[0].main.aqi;
      const labels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
      const tips = [
        "Enjoy outdoor activities.",
        "Normal outdoor activity is fine.",
        "Limit prolonged outdoor exertion.",
        "Avoid outdoor exercise.",
        "Stay indoors with windows closed."
      ];
      const hindiLabels = ["अच्छा", "ठीक", "मध्यम", "खराब", "बहुत खराब"];
      const hindiTips = [
        "बाहर घूम सकते हैं।",
        "सामान्य गतिविधियाँ ठीक हैं।",
        "बहुत देर बाहर न रहें।",
        "व्यायाम से बचें।",
        "घर में रहें, खिड़कियाँ बंद रखें।"
      ];

      aqi.innerText = currentLang === "hi" ? hindiLabels[index - 1] : labels[index - 1];
      healthTip.innerText = currentLang === "hi" ? hindiTips[index - 1] : tips[index - 1];
    });
}

langToggle.addEventListener("click", () => {
  currentLang = currentLang === "en" ? "hi" : "en";
  langToggle.innerText = currentLang === "en" ? "🌐 हिन्दी" : "🌐 English";
  btn.value = translations[currentLang].submit;
  getWeather(input.value.trim() || "Delhi");
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const mode = document.body.classList.contains("dark") ? "🌞" : "🌙";
  themeToggle.innerText = mode;
  localStorage.setItem("theme", mode);
});

window.onload = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      loader.style.display = 'block';
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then(res => res.json())
        .then(data => {
          updateMainWeather(data);
          fetchForecast(lat, lon);
          fetchAQI(lat, lon);
        });
    });
  }

  if (localStorage.getItem("theme") === "🌞") {
    document.body.classList.add("dark");
    themeToggle.innerText = "🌞";
  }
};

btn.addEventListener("click", () => {
  const cityName = input.value.trim();
  if (cityName) getWeather(cityName);
  else alert("Please enter a city name.");
});
