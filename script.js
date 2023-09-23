'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const days = [
  'Sunday',
  'Monday',
  'Thersday',
  'Wednesday',
  'Thursday',
  'Friday',
];
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const formInputType = document.querySelector('.form__input--type');
const reset = document.querySelector('.reset');
const select = document.querySelector('.select');
const selectContianer = document.querySelector('.select-container');

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
  autoClose: false,
  closeOnClick: false,
  className: 'runningPopup',
});

const validateValues = (...args) => {
  // console.log(...args);
  // return
  // console.log(args.every(arg => Number.isFinite(arg)));
  return args.every(arg => Number.isFinite(arg));
};

const validatePositive = (...args) => {
  return args.every(arg => arg > 0);
};

class App {
  #map;
  #mapEvent;
  #workOuts = [];
  #wrkoutsLclStrg;

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    formInputType.addEventListener('change', this._toggleElevation);
    containerWorkouts.addEventListener('click', this._flyToPosition.bind(this));
    reset.addEventListener('click', this._removeFromLocalStorage.bind(this));
    select.addEventListener('change', value => this._sortWorkouts(value));
  }

  _sortWorkouts(val) {
    console.log(val);
    val.target.value == '1'
      ? this._sortWorkoutsByDistance()
      : this._sortWorkoutsByDuration();
  }

  _sortWorkoutsByDistance() {
    this._resetWorkoutsList();
    this.#workOuts.map(val => console.log(val));
    this.#workOuts.sort((a, b) => b.distance - a.distance);
    this._renderWorkoutSorted(this.#workOuts);
  }

  _sortWorkoutsByDuration() {
    this._resetWorkoutsList();
    this.#workOuts.map(val => console.log(val));
    this.#workOuts.sort((a, b) => b.duration - a.duration);
    this._renderWorkoutSorted(this.#workOuts);
  }

  _renderWorkoutSorted(arr) {
    arr.forEach(val => {
      console.log(val);
      this._renderList(val);
    });
  }

  _resetWorkoutsList() {
    const listArr = document.querySelectorAll('li');
    console.log(listArr);
    listArr.forEach(v => (v.parentElement.innerHTML = ''));
  }

  _getPosition() {
    navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
      console.log('Can not find your position');
    });
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const cord = [latitude, longitude];
    this.#map = L.map('map').setView(cord, 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#workOuts = this._getRenderFromLocalStorage();

    // L.marker(cord, mrkrOpt)
    //   .addTo(this.#map)
    //   .bindPopup('A pretty CSS3 popup.<br> Easily customizable.', { popupOpt })
    //   .openPopup();

    this.#map.on('click', e => {
      console.log(e.latlng);
      this.#mapEvent = e;
      this._showForm();
    });
  }

  _showForm() {
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    form.classList.add('hidden');
  }

  _toggleElevation() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _clearInputs = () => {
    inputDistance.value = '';
    inputDuration.value = '';
    inputCadence.value = '';
    inputElevation.value = '';
  };

  _renderWorkOut(workout) {
    console.log(this.#mapEvent.latlng);
    const mkr = L.marker(this.#mapEvent.latlng, mrkrOpt)
      .addTo(this.#map)
      .bindPopup(workout.description, {
        maxWidth: 300,
        minWidth: 50,
        autoClose: false,
        closeOnClick: false,
        className: `${workout.type}-popup`,
      })
      .openPopup();

    this._clearInputs();
  }

  _renderWorkOutStorage(workout) {
    const [lat, lng] = workout.cords;
    L.marker({ lat, lng }, mrkrOpt)
      .addTo(this.#map)
      .bindPopup(workout.description, {
        maxWidth: 300,
        minWidth: 50,
        autoClose: false,
        closeOnClick: false,
        className: `${workout.type}-popup`,
      })
      .openPopup();
    // this._clearInputs();
  }

  _flyToPosition(ev) {
    // point to workout render;
    const workoutRender = ev.target.closest('.workout');
    //find the workut item in array for geting access to its cord property
    if (workoutRender) {
      const workout = this.#workOuts.find(
        v => v.id == workoutRender.dataset.id
      );
      workout &&
        this.#map.setView(workout.cords, this.#map.getZoom(), {
          animate: true,
          duration: 1,
          easeLinearity: 0.25,
        });
    }
  }

  _moveToPosition(e) {
    console.log(e.target);
    const workout = e.target.closest('workout');
    console.log(workout);
    //find the cloest li element in order to find the id element and locate the workout in the array workouts
    //when find the workout id in the array, attach the cordinate to setView leatlet method
  }

  _renderList(wrkout) {
    let html = `<li class="workout workout--${wrkout.type}" data-id=${
      wrkout.id
    }>
        <h2 class="workout__title">${wrkout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            wrkout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${wrkout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${wrkout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${wrkout.pace}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${wrkout.candence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>`;

    const wrkoutsBlock = document.createElement('div');
    wrkoutsBlock.innerHTML = html;
    form.insertAdjacentElement('afterend', wrkoutsBlock);

    if (this.#workOuts) {
      reset.classList.remove('hidden');
      console.log(selectContianer);
      selectContianer.classList.remove('hidden');
    }
  }

  // _renderWorkoutsList(){
  //   wrkoutArr = JSON.parse(this.#wrkoutsLclStrg);
  //   // console.log('wrkoutArr   :  ' + wrkoutArr);
  //   wrkoutArr.map(wrkout => {
  //     console.log(wrkout);
  //     this._renderList(wrkout);
  //     this._renderWorkOutStorage(wrkout);
  // }

  _getRenderFromLocalStorage() {
    // localStorage.removeItem('workouts');
    let wrkoutArr = [];
    // const wrkoutsLclStrg = localStorage.getItem('workouts');
    this.#wrkoutsLclStrg = localStorage.getItem('workouts');
    console.log(this.#wrkoutsLclStrg);
    if (this.#wrkoutsLclStrg !== null) {
      wrkoutArr = JSON.parse(this.#wrkoutsLclStrg);
      // console.log('wrkoutArr   :  ' + wrkoutArr);
      wrkoutArr.map(wrkout => {
        console.log(wrkout);
        this._renderList(wrkout);
        this._renderWorkOutStorage(wrkout);
      });
      reset.classList.remove('hidden');
    } else {
      // reset.classList.remove('hidden');
      console.log('No localStorage workouts found');
    }

    return wrkoutArr;
  }

  _removeFromLocalStorage() {
    reset.addEventListener('click', localStorage.removeItem('workouts'));
    location.reload();
  }

  _newWorkout(e) {
    e.preventDefault();

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        validateValues(distance, duration, cadence) === false ||
        validatePositive(distance, duration, cadence) === false
      ) {
        alert('Input value must be typed Number');
        return;
      }

      //create Running Object
      const run = new Running(
        [this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng],
        distance,
        duration,
        cadence
      );

      //Remove localstorage
      this.#workOuts && localStorage.removeItem('workouts');
      //Add the object to the list array
      this.#workOuts.push(run);

      //Render the WorkOut Object on the map
      this._renderWorkOut(run);
      // this._renderList1();

      //Render the WorkOut Object on the list form
      this._renderList(run);

      //Clear and hide the form
      this._hideForm();

      //Set localstorage
      localStorage.setItem('workouts', JSON.stringify(this.#workOuts));
    }

    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        validateValues(distance, duration, elevation) === false ||
        validatePositive(distance, duration) === false
      ) {
        alert('Input value must be typed Number');
        return;
      }

      //create Cycling Object
      const cycle = new Cycling(
        [this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng],
        distance,
        duration,
        elevation
      );

      //Remove localstorage
      this.#workOuts && localStorage.removeItem('workouts');

      //Add the object to the list array
      this.#workOuts.push(cycle);

      //Render the WorkOut Object on the map
      this._renderWorkOut(cycle);

      //Render the WorkOut Object on the list form
      this._renderList(cycle);

      //Clear and hide the form
      this._hideForm();

      //Set localstorage
      localStorage.setItem('workouts', JSON.stringify(this.#workOuts));
    }
    const optionSelected = select.options[select.selectedIndex].value;
    optionSelected === 1
      ? this._sortWorkoutsByDistance()
      : this._sortWorkoutsByDuration();
  }
}

class WorkOut {
  date = new Date();
  // id = (Date.now + '').slice(-10);
  id = Math.random().toString(16).slice(2);

  constructor(cords, distance, duration) {
    this.cords = cords;
    this.distance = distance;
    this.duration = duration;
  }

  _setDescription() {
    console.log('THIS : ' + this.date.getDate());
    //the this keyword in the type neaning connected to the object execute the method
    //the object execute the method is Running or Cycling object
    return `${
      this.type[0].toUpperCase() + this.type.slice(1)
    } on ${this.date.getDate()}
    in ${months[this.date.getMonth()]} ${this.date.getFullYear()}`;
  }
}

class Running extends WorkOut {
  type = 'running';
  constructor(cords, distance, duration, candence) {
    super(cords, distance, duration);
    this.candence = candence;
    this.pace = this._calcPace();
    this.description = this._setDescription();
  }

  _calcPace() {
    return (+this.duration / +this.distance).toFixed(2);
  }
}

class Cycling extends WorkOut {
  type = 'cycling';
  constructor(cords, distance, duration, elevationGain) {
    super(cords, distance, duration);
    this.elevationGain = elevationGain;
    this.speed = this._calcSpeed();
    this.description = this._setDescription();
  }

  _calcSpeed() {
    return this.elevationGain / this.speed;
  }
}

//Get detail from the form

const myMap = new App();

// _renderList1() {
//   document.getElementById('workoutsList') &&
//     document.getElementById('workoutsList').remove();
//   const wrkoutsBlock = document.createElement('div');
//   wrkoutsBlock.id = 'workoutsList';
//   let workoutsList = [];
//   if (this.#workOuts) {
//     workoutsList = this.#workOuts.map(wrkout => {
//       console.log(wrkout);
//       if (wrkout.type === 'running') {
//         return `<li class="workout workout--running" data-id="1234567890">
//       <h2 class="workout__title">Running on April 14</h2>
//       <div class="workout__details">
//         <span class="workout__icon">${
//           wrkout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
//         }</span>
//         <span class="workout__value">${wrkout.distance}</span>
//         <span class="workout__unit">km</span>
//       </div>
//       <div class="workout__details">
//         <span class="workout__icon">⏱</span>
//         <span class="workout__value">${wrkout.duration}</span>
//         <span class="workout__unit">min</span>
//       </div>
//       <div class="workout__details">
//         <span class="workout__icon">⚡️</span>
//         <span class="workout__value">${wrkout.pace}</span>
//         <span class="workout__unit">min/km</span>
//       </div>
//       <div class="workout__details">
//         <span class="workout__icon">🦶🏼</span>
//         <span class="workout__value">${wrkout.candence}</span>
//         <span class="workout__unit">spm</span>
//       </div>
//     </li>`;
//       }
//     });
//   }
//   console.log(wrkoutsBlock);
//   wrkoutsBlock.innerHTML = workoutsList.join('');
//   containerWorkouts.append(wrkoutsBlock);
// }
