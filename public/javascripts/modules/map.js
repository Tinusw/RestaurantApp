import axios from "axios";
import { $ } from "./bling";

const mapOptions = {
  center: {
    lat: 43.2,
    lng: -79.8
  },
  zoom: 14
};

function loadPlaces(map, lat = 43.2, lng = -79.8) {
  axios.get(`/api/v1/stores/near?lat=${lat}&lng=${lng}`).then(res => {
    const places = res.data;
    if (!places.length) {
      alert("no places found!");
      return;
    }

    // create bounds to center map on all markers
    const bounds = new google.maps.LatLngBounds();
    const infoWindow = new google.maps.InfoWindow();

    const markers = places.map(place => {
      const [placeLng, placeLat] = place.location.coordinates;
      const position = { lat: placeLat, lng: placeLng };
      bounds.extend(position);
      const marker = new google.maps.Marker({
        map: map,
        position: position
      });
      marker.place = place;
      return marker;
    });

    // onClick evens on marker to open Window
    markers.forEach(marker => marker.addListener('click', function(){
      const html = `
        <div class="popup">
          <a href="/store/${this.place.slug}">
            <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}" />
            <p>${this.place.name} - ${this.place.location.address}</p>
          </a>
        </div>
      `
      infoWindow.setContent(html)
      infoWindow.open(map, this);
    }))

    // center map to show all markers based on bounds
    map.setCenter(bounds.getCenter());
    // Auto zooms map to fit all markers
    map.fitBounds(bounds);

  });
}

function makeMap(mapDiv) {
  if (!mapDiv) return;
  const map = new google.maps.Map(mapDiv, mapOptions);
  loadPlaces(map);

  // Autocomplete stuff
  const input = $('[name="geolocate"]');
  const autoComplete = new google.maps.places.Autocomplete(input);
}

export default makeMap;
