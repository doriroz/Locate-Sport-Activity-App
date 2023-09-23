'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const formInputType = document.querySelector('.form__input--type');

let map, mapEvent;
navigator.geolocation.getCurrentPosition(
  position => {
    console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    console.log(latitude);
    console.log(longitude);
    console.log(
      `https://www.google.com/maps/@${latitude},${longitude}?entry=ttu`
    );

    const cord = [latitude, longitude];

    map = L.map('map').setView(cord, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      //   minZoom: 13,
      //   maxZoom: 18,
      //   zoomOffset: 1.5,
    }).addTo(map);

    const icon = L.icon({
      iconUrl: 'myIcon.png',
      iconSize: [38, 50],
      iconAnchor: [22, 94],
      popupAnchor: [-3, -76],
    });

    const mrkrOpt = {
      icon: icon,
      draggable: false,
      opacity: 0.6,
    };

    const popupOpt = L.popup({
      maxWidth: 300,
      minWidth: 50,
      //   keepInView: true,
      //   offset: Point(0, 7),
      autoClose: false,
      closeOnClick: false,
      className: 'runningPopup',
    });

    L.marker(cord, mrkrOpt)
      .addTo(map)
      //   .bindTooltip(`coordinate is ${latitude},${longitude}`)
      //   .openTooltip()
      .bindPopup('A pretty CSS3 popup.<br> Easily customizable.', { popupOpt })
      .openPopup();

    map.on('click', e => {
      console.log(e.latlng);
      mapEvent = e;
      form.classList.remove('hidden');
      inputDistance.focus();
      form.addEventListener('submit', e => {
        e.preventDefault();
        L.marker(mapEvent.latlng, mrkrOpt)
          .addTo(map)
          .bindPopup('A pretty CSS3 popup.<br> Easily customizable.', {
            popupOpt,
          })
          .openPopup();
        clearInputs();
      });

      formInputType.addEventListener('change', () => {
        inputCadence
          .closest('.form__row')
          .classList.toggle('form__row--hidden');
        inputElevation
          .closest('.form__row')
          .classList.toggle('form__row--hidden');
      });
      //   var popup = L.popup()
      //     .setLatLng(e.latlng)
      //     .setContent('createCustomPopupContent')
      //     .openOn(map);

      //   .bindTooltip(`coordinate is ${latitude},${longitude}`)
      //   .openTooltip();
    });
  },
  () => {
    console.log('Can not find your position');
  }
);

const clearInputs = () => {
  inputDistance.value = '';
  inputDuration.value = '';
  inputCadence.value = '';
  inputElevation.value = '';
};
