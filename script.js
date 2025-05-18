const apiKey = 'fdc44348-e37b-4983-95e3-964701a1540b';

const fromInput = document.getElementById('fromStation');
const toInput = document.getElementById('toStation');

const fromDropdown = document.createElement('ul');
fromDropdown.id = 'fromDropdown';
fromDropdown.className = 'dropdown';
fromInput.parentElement.appendChild(fromDropdown);

const toDropdown = document.createElement('ul');
toDropdown.id = 'toDropdown';
toDropdown.className = 'dropdown';
toInput.parentElement.appendChild(toDropdown);

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

function fetchStations(query, dropdown) {
  if (query.trim().length < 3) {
    dropdown.innerHTML = '';
    return;
  }
  const url = `https://api.resrobot.se/v2.1/location.name?input=${encodeURIComponent(query)}&format=json&accessId=${apiKey}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      dropdown.innerHTML = '';
      if (data.stopLocationOrCoordLocation && data.stopLocationOrCoordLocation.length > 0) {
        data.stopLocationOrCoordLocation.forEach(item => {
          if (item.StopLocation) {
            const station = item.StopLocation;
            const li = document.createElement('li');
            li.textContent = station.name;
            li.dataset.stationId = station.id;

            li.addEventListener('click', () => {
              if (dropdown.id === 'fromDropdown') {
                fromInput.value = station.name;
                fromInput.dataset.stationId = station.id;
              } else {
                toInput.value = station.name;
                toInput.dataset.stationId = station.id;
              }
              dropdown.innerHTML = '';
            });

            dropdown.appendChild(li);
          }
        });
      } else {
        const li = document.createElement('li');
        li.textContent = 'Inga stationer hittades.';
        dropdown.appendChild(li);
      }
    })
    .catch(error => {
      console.error('Fel vid hämtning:', error);
      dropdown.innerHTML = '<li>Ett fel uppstod vid hämtning.</li>';
    });
}

const debouncedFromFetch = debounce((e) => {
  fetchStations(e.target.value, fromDropdown);
}, 300);

const debouncedToFetch = debounce((e) => {
  fetchStations(e.target.value, toDropdown);
}, 300);

fromInput.addEventListener('input', debouncedFromFetch);
toInput.addEventListener('input', debouncedToFetch);

document.addEventListener('click', (e) => {
  if (!fromInput.contains(e.target)) {
    fromDropdown.innerHTML = '';
  }
  if (!toInput.contains(e.target)) {
    toDropdown.innerHTML = '';
  }
});

document.getElementById('searchBtn').addEventListener('click', function () {
  const fromStationId = fromInput.dataset.stationId;
  const toStationId = toInput.dataset.stationId;

  if (!fromStationId || !toStationId) {
    alert('Vänligen välj både en start- och en slutstation.');
    return;
  }

  const travelTimeType = document.querySelector('input[name="när"]:checked')?.id || 'åka';
  let date = '';
  let time = '';

  if (travelTimeType !== 'åka') {
    date = document.querySelector('input[type="date"]').value;
    time = document.querySelector('input[type="time"]').value;
  }

  const baseUrl = 'https://api.resrobot.se/v2.1/trip';
  const params = new URLSearchParams({
    originId: fromStationId,
    destId: toStationId,
    date: date,
    time: time,
    format: 'json',
    accessId: apiKey,
  });

  const url = `${baseUrl}?${params.toString()}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`API-anropet misslyckades: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      const resultsContainer = document.getElementById('searchResults');
      resultsContainer.innerHTML = '';

      if (data.Trip && data.Trip.length > 0) {
        data.Trip.forEach(trip => {
          const tripElement = document.createElement('div');
          tripElement.className = 'trip';

          if (trip.LegList && trip.LegList.Leg && trip.LegList.Leg.length > 0) {
            const legs = trip.LegList.Leg;
            const firstLeg = legs[0];
            const lastLeg = legs[legs.length - 1];

            const departureTime = firstLeg.Origin.time.slice(0, 5);
            const arrivalTime = lastLeg.Destination.time.slice(0, 5);
            const originName = firstLeg.Origin.name;
            const destinationName = lastLeg.Destination.name;

            const transportIcons = legs.map(leg => transportIkon(leg.type)).join(' ');

            tripElement.innerHTML = `
              <div class="summary">
                <span class="time">${departureTime} → ${arrivalTime}</span><br>
                <span class="stations">${originName} → ${destinationName}</span><br>
                <span class="icons">${transportIcons}</span>
              </div>
            `;
          } else {
            tripElement.innerHTML = '<p>Ingen giltig resa.</p>';
          }

          resultsContainer.appendChild(tripElement);
        });
      } else {
        resultsContainer.innerHTML = '<p>Inga resor hittades.</p>';
      }
    })
    .catch(error => {
      console.error('Fel vid hämtning:', error);
      document.getElementById('searchResults').innerHTML = `<p>Ett fel uppstod: ${error.message}</p>`;
    });
});

function transportIkon(transportTyp) {
  const transportMapping = {
    'JNY': 'train',
    'BUS': 'bus',
    'TRM': 'tram',
    'MET': 'subway',
    'WALK': 'walking',
  };

  const iconType = transportMapping[transportTyp] || 'question';
  return `<i class="fas fa-${iconType}"></i>`;
}
