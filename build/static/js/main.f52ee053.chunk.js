(this["webpackJsonpweather-app"]=this["webpackJsonpweather-app"]||[]).push([[0],[function(t,e){let n=!1;window.onload=function(){"true"===localStorage.getItem("darkMode")&&(document.body.classList.toggle("dark-mode"),n=!n,localStorage.setItem("darkMode",n))};const o=Object({NODE_ENV:"production",PUBLIC_URL:"",WDS_SOCKET_HOST:void 0,WDS_SOCKET_PATH:void 0,WDS_SOCKET_PORT:void 0,FAST_REFRESH:!0}).REACT_APP_OPENWEATHERMAPAPI,a=Object({NODE_ENV:"production",PUBLIC_URL:"",WDS_SOCKET_HOST:void 0,WDS_SOCKET_PATH:void 0,WDS_SOCKET_PORT:void 0,FAST_REFRESH:!0}).REACT_APP_MAPBOXTOKEN;async function c(t){const e=await fetch("https://api.mapbox.com/geocoding/v5/mapbox.places/".concat(t,".json?access_token=").concat(a));return(await e.json()).features.map((t=>({place_name:t.place_name,coordinates:t.center})))}async function i(t,e){const[n,o]=t;try{const t=await r(o,n),a=await s(o,n);d(t),l(a);document.getElementById("location-input").value="".concat(e);document.getElementById("suggestions-list").innerHTML=""}catch(a){console.error("Error fetching weather data:",a)}}async function r(t,e){const n=await fetch("https://api.openweathermap.org/data/2.5/weather?lat=".concat(t,"&lon=").concat(e,"&appid=").concat(o,"&units=metric"));return await n.json()}async function s(t,e){const n=await fetch("https://api.openweathermap.org/data/2.5/forecast?lat=".concat(t,"&lon=").concat(e,"&appid=").concat(o,"&units=metric"));return await n.json()}function d(t){document.getElementById("current-weather").innerHTML="\n    <p>Temperature: ".concat(t.main.temp,"\xb0C</p>\n    <p>Feels Like: ").concat(t.main.feels_like,"\xb0C</p>\n    <p>Pressure: ").concat(t.main.pressure," hPa</p>\n    <p>Humidity: ").concat(t.main.humidity,"%</p>\n  ");document.getElementById("current-weather-title").style.display="block"}function l(t){const e=document.getElementById("forecast-data");e.innerHTML="",t.list.forEach((t=>{const n=new Date(1e3*t.dt),o=n.getDate().toString().padStart(2,"0"),a=(n.getMonth()+1).toString().padStart(2,"0"),c=n.getFullYear(),i=n.getHours().toString().padStart(2,"0"),r=n.getMinutes().toString().padStart(2,"0"),s="".concat(o,"/").concat(a,"/").concat(c),d="".concat(i,":").concat(r),l="\n      <tr>\n        <td>".concat(s," ").concat(d,"</td>\n        <td>").concat(t.main.temp,"\xb0C</td>\n        <td>").concat(t.main.feels_like,"\xb0C</td>\n        <td>").concat(t.main.pressure," hPa</td>\n        <td>").concat(t.main.humidity,"%</td>\n      </tr>\n    ");e.innerHTML+=l}));const n=document.getElementById("forecast-title"),o=document.getElementById("forecast-table");n.style.display="block",o.style.display="table"}function u(){const t=document.getElementById("location-input").value;t.length>0&&c(t).then((t=>{if(t.length>0){i(t[0].coordinates,t[0].place_name)}})).catch((t=>{console.error("Error fetching location suggestions:",t)}))}setTimeout((function(){if(!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)){document.getElementById("popup").style.display="block"}}),5e3);const p=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];let m=0;const g=document.getElementById("location-input");g.addEventListener("input",(async function(){const t=document.getElementById("location-input").value;if(t.length>0){!function(t){const e=document.getElementById("suggestions-list");e.innerHTML="",t.forEach((t=>{const n=document.createElement("li");n.textContent=t.place_name,n.onclick=()=>i(t.coordinates,t.place_name),e.appendChild(n)}))}(await c(t))}else{document.getElementById("suggestions-list").innerHTML=""}}));document.querySelector("button").addEventListener("click",u),g.addEventListener("keypress",(function(t){"Enter"===t.key&&u()})),document.addEventListener("keydown",(function(t){"Escape"===t.key?m=0:function(t){t.key===p[m]?(m++,m===p.length&&(alert("Konami code activated! \ud83c\udf89"),m=0)):m=0}(t)}))}],[[0,1]]]);
//# sourceMappingURL=main.f52ee053.chunk.js.map