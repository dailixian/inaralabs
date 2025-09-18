// Initialize map
var map = L.map("map").setView([38.5, -88.5], 6);
var baseLayer = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 18,
    attribution: "© OpenStreetMap contributors",
  }
).addTo(map);

// Xweather radar overlay via Aeris tiles (ArcGIS WebTileLayer equivalent)
function addXweatherOverlay() {
  try {
    if (typeof LIGHTNING_API_CONFIG === "undefined") return null;
    const { client_id, client_secret } = LIGHTNING_API_CONFIG;
    if (!client_id || !client_secret) return null;
    const tileUrl = `https://maps{s}.aerisapi.com/${client_id}_${client_secret}/radar-global/{z}/{x}/{y}/current.png`;
    var weatherLayer = L.tileLayer(tileUrl, {
      subdomains: ["1", "2", "3", "4"],
      opacity: 0.6,
      attribution:
        'Weather tiles © <a href="https://www.xweather.com/">Xweather</a>',
    });
    weatherLayer.addTo(map);
    // Layer control to toggle
    L.control
      .layers(
        { OpenStreetMap: baseLayer },
        { "Xweather Radar": weatherLayer },
        { collapsed: true }
      )
      .addTo(map);
    return weatherLayer;
  } catch (e) {
    console.warn("Failed to add Xweather overlay", e);
    return null;
  }
}
addXweatherOverlay();

// Leaflet Draw controls
// Layer group for lightning markers
var lightningMarkers = new L.LayerGroup();
map.addLayer(lightningMarkers);
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);
var drawControl = new L.Control.Draw({
  edit: { featureGroup: drawnItems },
  draw: {
    polygon: false,
    circle: false,
    rectangle: true,
    marker: false,
    polyline: false,
    circlemarker: false,
  },
});
map.addControl(drawControl);

let areaType = null;
let areaValue = null;
let areaRadius = null;
map.on(L.Draw.Event.CREATED, function (e) {
  drawnItems.clearLayers();
  var layer = e.layer;
  drawnItems.addLayer(layer);
  if (layer instanceof L.Rectangle) {
    const bounds = layer.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    // Ensure correct bounding box order: top,left,bottom,right
    const top = Math.max(sw.lat, ne.lat);
    const bottom = Math.min(sw.lat, ne.lat);
    const left = Math.min(sw.lng, ne.lng);
    const right = Math.max(sw.lng, ne.lng);
    // Limit rectangle size (max diagonal 300km)
    const R = 6371; // Earth radius km
    function toRad(x) {
      return (x * Math.PI) / 180;
    }
    const dLat = toRad(top - bottom);
    const dLng = toRad(right - left);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(bottom)) *
        Math.cos(toRad(top)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    if (distance > 300) {
      alert(
        "Rectangle too large! Please select a smaller area (max diagonal 300km)."
      );
      drawnItems.clearLayers();
      areaType = null;
      areaValue = null;
      areaRadius = null;
      return;
    }
    areaType = "rectangle";
    areaValue = `${top},${left},${bottom},${right}`;
    areaRadius = null;
    fetchLightning();
    // drawnItems.clearLayers(); // Keep the rectangle visible
  }
});

// Clear all markers and rectangles when starting a new rectangle draw
map.on("draw:drawstart", function (e) {
  lightningMarkers.clearLayers();
  drawnItems.clearLayers();
});

// Set default dates from config
if (typeof LIGHTNING_API_CONFIG !== "undefined") {
  document.getElementById("from-date").value =
    LIGHTNING_API_CONFIG.default_from;
  document.getElementById("to-date").value = LIGHTNING_API_CONFIG.default_to;
  document.getElementById("limit").value = LIGHTNING_API_CONFIG.default_limit;
}

// Limit date range to max 1 day
function enforceDateRange() {
  const fromInput = document.getElementById("from-date");
  const toInput = document.getElementById("to-date");
  fromInput.addEventListener("change", function () {
    let from = new Date(fromInput.value);
    let to = new Date(toInput.value);
    if (to - from > 86400000) {
      // 1 day in ms
      toInput.value = new Date(from.getTime() + 86400000)
        .toISOString()
        .slice(0, 10);
    }
    toInput.min = fromInput.value;
    toInput.max = new Date(from.getTime() + 86400000)
      .toISOString()
      .slice(0, 10);
  });
  toInput.addEventListener("change", function () {
    let from = new Date(fromInput.value);
    let to = new Date(toInput.value);
    if (to - from > 86400000) {
      fromInput.value = new Date(to.getTime() - 86400000)
        .toISOString()
        .slice(0, 10);
    }
  });
  // Initial setup
  fromInput.dispatchEvent(new Event("change"));
}
enforceDateRange();

// Draw default rectangle on map
function drawDefaultRectangle() {
  const sw = [36.557, -89.6265];
  const ne = [39.3649, -81.6943];
  const bounds = [sw, ne];
  const rect = L.rectangle(bounds, { color: "blue", weight: 2 });
  drawnItems.clearLayers();
  drawnItems.addLayer(rect);
  // Set areaType and areaValue for API
  areaType = "rectangle";
  // top,left,bottom,right
  areaValue = `${ne[0]},${sw[1]},${sw[0]},${ne[1]}`;
  areaRadius = null;
  map.fitBounds(bounds);
}
drawDefaultRectangle();

function buildApiUrl() {
  let p,
    radiusParam = "";
  if (areaType === "circle" && areaValue && areaRadius) {
    p = areaValue;
    radiusParam = `&radius=${areaRadius}`;
  } else if (areaType === "rectangle" && areaValue) {
    p = areaValue;
  } else {
    // fallback rectangle
    p = "39.3649,-89.6265,36.557,-81.6943";
  }
  let from = document.getElementById("from-date").value;
  let to = document.getElementById("to-date").value;
  let limit = document.getElementById("limit").value;
  let { client_id, client_secret } = LIGHTNING_API_CONFIG;
  return `https://data.api.xweather.com/lightning/within?p=${p}${radiusParam}&from=${from}&to=${to}&limit=${limit}&client_id=${client_id}&client_secret=${client_secret}`;
}

function clearMarkers() {
  lightningMarkers.clearLayers();
}

function fetchLightning() {
  clearMarkers();
  fetch(buildApiUrl())
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.response) {
        // Custom lightning SVG icon
        var lightningIcon = L.divIcon({
          className: "lightning-icon",
          html: `<i class="fas fa-bolt" style="color: #FFD600; font-size: 24px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);"></i>`,
          iconSize: [24, 24],
          iconAnchor: [12, 24],
        });
        data.response.forEach((item) => {
          const lat = item.loc.lat;
          const lng = item.loc.long;
          const time = item.ob.dateTimeISO;
          const type = item.ob.pulse.type;
          const amp = item.ob.pulse.peakamp;
          const sensors = item.ob.pulse.numSensors;
          const popup = `
            <b>Lightning Strike</b><br>
            <b>Type:</b> ${type}<br>
            <b>Peak Amplitude:</b> ${amp}<br>
            <b>Sensors:</b> ${sensors}<br>
            <b>Time:</b> ${time}
          `;
          L.marker([lat, lng], { icon: lightningIcon })
            .addTo(lightningMarkers)
            .bindPopup(popup);
        });
      } else {
        alert("No lightning data found.");
      }
    })
    .catch((err) => {
      alert("Error fetching lightning data.");
      console.error(err);
    });
}

// Initial fetch
fetchLightning();
