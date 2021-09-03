//Initialize Map
const tiles = 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg'
const map = L.map('mapid', {
  editable: true, editOptions: {
    color: '#000'
  }
}).setView([54.505, -3.19], 12);
L.tileLayer(tiles, {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
}).addTo(map);
var geocoder = L.Control.geocoder({defaultMarkGeoCode:false}).on('markgeocode', function(e) {
  // console.log(map.editor);
  //Move rectangle to center of view or delete it.
}).addTo(map);
// let marker = L.marker([51.5, -0.09]).addTo(map);

const fourThreeRatio = 1.33

const C = 40075.04; //Circumference of the earth in km
/*
let d; //Point at distance in kilometres.
let latitude = Math.min(Math.max(parseFloat(document.getElementById('c-lat').value),-69),69)
let latFormula = 360*d/C; //degrees
let lonFormula = 360*d/(C*Math.cos(latitude)); //degrees
*/

// At sea level a minute of arc equals exactly 1 nautical mile... (1,852 metres). A second; one sixtieth the amount, is roughly 30 metres.
const arcSecondLongitude = 30.866666667; //metres
// let calculatedMetres = Math.cos(latitude) * (2 * arcSecondLongitude);
function calculatedArcSecond(distance) {
    return distance / arcSecondLongitude;
}

function heightCalculator(width, latlng, e) {
  // let aspectRatio = Math.floor(width).toFixed(2) / Math.floor(height).toFixed(2);
  let newHeight = width / fourThreeRatio;
  let newDistance = 360*newHeight/1000/C;
  if (e) {
    let bounds = e.layer.getBounds();
    let northEast = bounds._northEast;
    if (latlng.lat < northEast.lat) {
      let adjustedLat = latlng.lat + newDistance;
      return {'lat': adjustedLat, 'lng': latlng.lng, 'height': newHeight};
    }
    else if (latlng.lat = northEast.lat) {
      let adjustedLat = latlng.lat - newDistance;
      return {'lat': adjustedLat, 'lng': latlng.lng, 'height': newHeight};
    }
  }
}


let NWlat = document.getElementById('NWlat')
let NWlng = document.getElementById('NWlng')
let widthElVal = document.getElementById('width')
let heightElVal = document.getElementById('height')

L.EditControl = L.Control.extend({
      options: {
          position: 'topleft',
          callback: null,
          kind: '',
          html: ''
      },
      onAdd: function (map) {

          var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
          link = L.DomUtil.create('button', 'btn rect-btn', container);
          link.href = '#';
          link.title = 'Create a new ' + this.options.kind;
          link.innerHTML = this.options.html;
          L.DomEvent.on(link, 'click', L.DomEvent.stop)
                    .on(link, 'click', function () {
                      window.LAYER = this.options.callback.call(map.editTools);
                      link.setAttribute("disabled", "disabled");
                    }, this);
          return container;
      }
});
L.NewRectangleControl = L.EditControl.extend({
        options: {
            position: 'topleft',
            callback: map.editTools.startRectangle,
            kind: 'rectangle',
            html: '⬛'
        }
});
function shapeToPoints(shape) {
  let layer = shape.layer;
  // console.log(layer);
  let bounds = layer.getBounds();
  let southWest = bounds._southWest;
  let northEast = bounds._northEast;
  let southWestPoint = map.latLngToContainerPoint(southWest);
  let northEastPoint = map.latLngToContainerPoint(northEast);
  // console.log(southWestPoint, northEastPoint);
}
map.on('editable:drawing:commit', e => {
  shapeToPoints(e);
});

var deleteShape = function (e) {
  if ((e.originalEvent.ctrlKey || e.originalEvent.metaKey) && this.editEnabled()) this.editor.deleteShapeAt(e.latlng), document.querySelector(".rect-btn").removeAttribute("disabled");
};
map.on('editable:enable', function (e) {
  e.layer.setStyle({color: '#5ba390'});
});

map.on('layeradd', function (e) {
    if (e.layer instanceof L.Path) e.layer.on('click', L.DomEvent.stop).on('click', deleteShape, e.layer);
    // if (e.layer instanceof L.Path) e.layer.on('dblclick', L.DomEvent.stop).on('dblclick', e.layer.toggleEdit);
});
map.addControl(new L.NewRectangleControl())
// map.on('mousemove', function(e) {
//   console.log(e.latlng);
// })
map.on('editable:vertex:drag', function(e) {

  let index = e.vertex.getIndex(),
      next = e.vertex.getNext(),
      previous = e.vertex.getPrevious(),
      oppositeIndex = (index + 2) % 4,
      opposite = e.vertex.latlngs[oppositeIndex];

  let distanceToMouseWidth = Math.floor(map.distance(previous.latlng, e.latlng).toFixed(2));
  let distanceToMouseHeight = Math.floor(map.distance(next.latlng, e.latlng).toFixed(2));

  if (distanceToMouseWidth/distanceToMouseHeight != fourThreeRatio) {
    let height = heightCalculator(distanceToMouseWidth, next.latlng, e);
    e.latlng.update([height.lat, e.latlng.lng]);
    previous.latlng.update([height.lat, opposite.lng]);

    widthElVal.setAttribute('value', distanceToMouseWidth);
    heightElVal.setAttribute('value', distanceToMouseHeight);
    widthElVal.value = height.height.toFixed(2);
    heightElVal.value = distanceToMouseHeight.toFixed(2);
  }
  else {

  }
  e.layer.editor.refreshVertexMarkers();
  // document.getElementById('lat').innerHTML = 'Latitude: ' + e.latlng.lat.toFixed(3);
  // document.getElementById('lng').innerHTML = 'Longitude: ' + e.latlng.lng.toFixed(3);
});
map.on('editable:dragend', function(e) {
  shapeToPoints(e);
  let bounds = e.layer.getBounds();
  let northwest = {'lat': bounds._northEast.lat, 'lng': bounds._southWest.lng};
  NWlat.setAttribute('value', northwest.lat);
  NWlng.setAttribute('value', northwest.lng);
  NWlat.value = northwest.lat;
  NWlng.value = northwest.lng;
});

map.on('editable:vertex:dragend', function(e) {
  let nw = e.vertex.latlngs[0],
      ne = e.vertex.latlngs[1],
      se = e.vertex.latlngs[2],
      sw = e.vertex.latlngs[3];

   // Get the distances in here, as there is no change. Calculate the distance between the vertices.
   let distanceWidth = Math.floor(map.distance(sw, se).toFixed(2));
   let distanceHeight = Math.floor(map.distance(sw, nw).toFixed(2));
   widthElVal.setAttribute('value', distanceWidth);
   heightElVal.setAttribute('value', distanceHeight);
   widthElVal.value = calculatedArcSecond(distanceWidth)/3;
   heightElVal.value = calculatedArcSecond(distanceHeight)/3;
   // console.log(calculatedArcSecond(distanceWidth)/3);
   // console.log(calculatedArcSecond(distanceHeight)/3);

   currentBounds = e.layer.getBounds();
   let northwest = {'lat': currentBounds._northEast.lat, 'lng': currentBounds._southWest.lng};

   NWlat.setAttribute('value', northwest.lat);
   NWlng.setAttribute('value', northwest.lng);
   NWlat.value = northwest.lat;
   NWlng.value = northwest.lng;

})
// ---------------------- XMLHttpRequest -------------------------

  const button = document.getElementById("genButton");
  const form = document.getElementById("paramForm");
  let downloadButton = document.getElementById("downloadbtn");
  downloadButton.style = "visibility:hidden";
  // const url = form.action;
  // form.addEventListener('submit', (event) => {
  //   event.preventDefault();
  //   const xhr = new XMLHttpRequest();
  //   let data = new FormData(form);
  //   xhr.open('POST', url, true);
  //   xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  //   xhr.send(event);
  //
  //   xhr.onload = () => {
  //     console.log(xhr.responseText);
  // }
  //   document.querySelector("#genButton").classList.add("disabled");
  //   document.querySelector("#genButton").innerHTML = "<i>Generating...</i>";
  // })

// Form handling code, posting with FormData and fetch courtesy of https://simonplend.com/how-to-use-fetch-to-post-form-data-as-json-to-your-api/
form.addEventListener('submit', handlerFormSubmit);

async function handlerFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const url = form.action;
  document.querySelector("#genButton").classList.add("disabled");
  document.querySelector("#genButton").innerHTML = "<i>Generating...</i>";



  try {
    const formData = new FormData(form);
    const responseData = await postFormDataAsJson({url, formData});

  } catch (error) {
    console.error(error);
  }
}
async function postFormDataAsJson({url, formData}) {
  const plainFormData = Object.fromEntries(formData.entries());
  const formDataJsonString = JSON.stringify(plainFormData);

  const fetchOptions = {
    method: 'POST',
    headers: {'Content-Type': 'application/json',
              'Accept': 'application/json'},
    body: formDataJsonString,
  };
  const response = await fetch(url, fetchOptions)
  // fetch(url, fetchOptions);

  if (!response.ok) {
    const errorMessage = response.text();
    throw new Error(errorMessage);
  }

  document.querySelector("#genButton").classList.remove("disabled");
  document.querySelector("#genButton").innerHTML = "Generate Model";
  // let modelNumber = response.text();
  downloadButton.style = "visibility:visible";
  return response.text().then(function(text) {
    let modelName   = "stls/terrain-"+text+".zip";
    downloadButton.href = text;
    console.log(modelName);

  });
}
