import * as THREE from "//unpkg.com/three/build/three.module.js";

const EARTH_RADIUS_KM = 6371;
const SAT_SIZE = 100;
const TIME_STEP = 3 * 1000;
const SATELLITE_COLOR = "#ff69b4";

const timeLogger = document.getElementById("time-log");
const satelliteInput = document.getElementById("satellite-id");
const addButton = document.getElementById("add-satellite");
const trackedList = document.getElementById("tracked-satellites");
const errorDisplay = document.getElementById("error-display");

const activeSatellites = new Map();

// Creates World
const world = Globe()(document.getElementById("chart"))
  .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
  .objectLat("lat")
  .objectLng("lng")
  .objectAltitude("alt")
  .objectFacesSurface(false)
  .objectLabel("name");

setTimeout(() => world.pointOfView({ altitude: 3.5 }));

const satGeometry = new THREE.OctahedronGeometry(
  (SAT_SIZE * world.getGlobeRadius()) / EARTH_RADIUS_KM / 2,
  0,
);
const satMaterial = new THREE.MeshLambertMaterial({
  color: SATELLITE_COLOR,
  transparent: true,
  opacity: 0.9,
  emissive: SATELLITE_COLOR,
  emissiveIntensity: 0.3,
});

world.objectThreeObject(() => new THREE.Mesh(satGeometry, satMaterial));

// Calls API
async function fetchSatelliteTLE(satelliteId) {
  try {
    const response = await fetch(
      `https://api.keeptrack.space/v1/sat/${satelliteId}`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch satellite data (Status: ${response.status})`,
      );
    }
    const data = await response.json();
    return {
      id: satelliteId,
      name: data.name || `Satellite ${satelliteId}`,
      tle1: data.tle1,
      tle2: data.tle2,
    };
  } catch (error) {
    console.error(`Error fetching satellite ${satelliteId} TLE data:`, error);
    throw error;
  }
}

// Predicts where the satelite is going to go.
function calculateSatellitePosition(tleData, time) {
  const satrec = satellite.twoline2satrec(tleData.tle1, tleData.tle2);
  const positionAndVelocity = satellite.propagate(satrec, time);
  const positionEci = positionAndVelocity.position;

  if (!positionEci) return null;
  const gmst = satellite.gstime(time);
  const positionGd = satellite.eciToGeodetic(positionEci, gmst);
  const latitude = satellite.degreesLat(positionGd.latitude);
  const longitude = satellite.degreesLong(positionGd.longitude);
  const altitude = positionGd.height / 1000;

  return {
    id: tleData.id,
    name: tleData.name,
    lat: latitude,
    lng: longitude,
    alt: altitude / EARTH_RADIUS_KM,
  };
}

// Adds satelite address that is called to the tracking list (so you can remove it)
function addSatelliteToTrackingList(satData) {
  const listItem = document.createElement("div");
  listItem.className = "satellite-item";
  listItem.innerHTML = `
    <span>🛰️ ${satData.name} (${satData.id})</span>
    <button class="remove-btn">×</button>
  `;

  listItem.querySelector(".remove-btn").addEventListener("click", () => {
    activeSatellites.delete(satData.id);
    listItem.remove();
    errorDisplay.textContent = "";
  });

  trackedList.appendChild(listItem);
}

// Gets satelite location from public API
async function addSatellite(satelliteId) {
  try {
    errorDisplay.textContent = "Fetching satellite data...";

    if (activeSatellites.has(satelliteId)) {
      throw new Error("Satellite is already being tracked");
    }

    const tleData = await fetchSatelliteTLE(satelliteId);

    activeSatellites.set(satelliteId, {
      tleData: tleData,
    });

    addSatelliteToTrackingList(tleData);
    errorDisplay.textContent = "";
  } catch (error) {
    errorDisplay.textContent = error.message;
  }
}

addButton.addEventListener("click", () => {
  const satelliteId = satelliteInput.value.trim();
  if (satelliteId) {
    addSatellite(satelliteId);
    satelliteInput.value = "";
  }
});

satelliteInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addButton.click();
  }
});

// Updates with prediction
let time = new Date();
(function frameTicker() {
  requestAnimationFrame(frameTicker);
  time = new Date(+time + TIME_STEP);
  timeLogger.innerText = time.toString();

  const satPositions = Array.from(activeSatellites.values())
    .map((sat) => calculateSatellitePosition(sat.tleData, time))
    .filter((pos) => pos !== null);

  world.objectsData(satPositions);
})();

// Imports ISS (international space station)
addSatellite("25544");
