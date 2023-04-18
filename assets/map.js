import L from 'leaflet';
import 'leaflet-ajax';
import './styles/map.css';
import * as turf from '@turf/turf'

var map;
var totalTheory = 0; 
var mapRealisationColumn = {
       "Plots jaunes": "wait",
       "Semi-pérennisation légère": "etude", 
       "Pérennisation en dur": "travaux",
       "Nouveau linéaire": "done"};
var layersLoaded = 0 ;
var markers = [] ;
var mapLayers = {};
var zoomLevelToMarkerSize = { 11: 24, 12: 24, 13: 24, 14: 24, 15: 32, 16: 32, 17: 48, 18: 48, 19: 64 } ;
var planVeloPratiqueLayer ;

function isPlan2022(feature) {
  var plan2022 = ['wait', 'etude', 'travaux', 'done'];
  return plan2022.includes(feature.properties['etat']);
}

function isComplete(feature) {
  var plan2022 = ['existant2020', 'done'];
  return plan2022.includes(feature.properties['etat']);
}


function toggleLegend(e)
{
  if (e.name == "Zones apaisées")
  {
    if ( e.type == "overlayadd")
    {
      $("#zonesApaiseesLegend").css('visibility','visible').hide().slideDown("fast");
      e.layer.bringToBack() ;
    }
    else
    {
      $("#zonesApaiseesLegend").slideUp("fast", function(){$("#zonesApaiseesLegend").css('visibility','hidden').css("display", "block")});
    }
  }

  if ( e.name == "Plan Vélo" )
  {
    if ( e.type == "overlayadd")
    {
      map.addLayer(planVeloPratiqueLayer) ;
      e.layer.bringToBack() ;
    }
    else
      map.removeLayer(planVeloPratiqueLayer) ;
  }
}

function areaFeature(feature, layer)
{
  areaZonesApaisees += Math.round( 10 * turf.area(feature) ) / 10 ;

  layer.on(
  {
    mouseover: highlightFeature,
    mouseout: resetStyleFeature,
    click: function (e) { info.update(e.target.feature) ; }
  });
}

function highlightFeature(e)
{
  var layer = e.target;

  //layer.className += " selected";
  //layer.setStyle({class: 'my-class', weight: 10});
  // $(layer._path).addClass("path-selected");
  layer.className += " selected";

  layer.setStyle({class: "selected"});

  // Nothing to highlight for a point, so don't change its style
  //if ( layer.feature.geometry.type != "Point" )
  //{
  //  var newStyle = styleFeature(layer.feature) ;

  //  if ( layer.feature.geometry.type == "Polygon")
  //    newStyle.fillOpacity += 0.2 ;
  //  else
  //    newStyle.weight += 2 ;

  //  layer.setStyle(newStyle) ;
  //}

  info.update(layer.feature) ;
}

function resetStyleFeature(e)
{
  var layer = e.target;
  // $(layer._path).removeClass("path-selected");
  // if ( layer.feature.geometry.type != "Point" )
  // {
  //   //layer.setStyle(styleFeature(layer.feature)) ;
  // }

  info.update() ;
}


function updateInfo(feature)
{
  var content = '' ;
  if ( typeof feature != "undefined" && feature.geometry.type == "Polygon") {
    var areaFeature = turf.area(feature) / 1000000.0 ;
    areaFeature = Math.round( 1000 * areaFeature ) / 1000 ;
    if (feature.properties && feature.properties.name) {
      content += "<b>"+feature.properties.name+"</b><br/>" ;
    }
    if (feature.properties && feature.properties.description) {
      content += feature.properties.description+"<br/>" ;
    }
    if (feature.properties && feature.properties.gid) {
      content += "Id : " + feature.properties.gid+"<br/>" ;
    }
    if (feature.properties && feature.properties.numReve) {
      content += "ReVE n°" + feature.properties.numReve+"<br/>" ;
    }
    content += "Surface : "+areaFeature+"km²<br/>";
    if (feature.properties && feature.properties.etat) {
      content += "État : " + feature.properties.etat;
    }
  } else if ( typeof feature != "undefined" && feature.geometry.type == "LineString" ) {
    var lengthFeature = Math.round( 100 * turf.lineDistance(feature) ) / 100 ;

    if (feature.properties && feature.properties['Rue ou axe']) {
      content += "<b>"+feature.properties['Rue ou axe']+"</b><br/>" ;
    }
    if (feature.properties && feature.properties['Etat']) {
      content += feature.properties['Etat'] + "<br/>";
    }
    if (feature.properties && feature.properties['Statut']) {
      content += feature.properties['Statut'] + "<br/>";
    }
    if (feature.properties && feature.properties.description) {
      content += feature.properties.description+"<br/>" ;
    }
    content += "Longueur : "+lengthFeature+"km";
  } else if ( typeof feature != "undefined" && feature.geometry.type == "Point" ) {
    if (feature.properties && feature.properties.name) {
      content += "<b>"+feature.properties.name+"</b><br/>" ;
    }
    if (feature.properties && feature.properties.description) {
      content += feature.properties.description+"<br/>" ;
    }
  } else {
    content = "Placez le curseur sur un segment pour plus d'informations" ;
  }

  this._div.innerHTML = '<h4>Informations</h4>' + content ;
}

function bindFeatureEvents(feature, layer)
{
  layer.on(
  {
    mouseover: highlightFeature,
    mouseout: resetStyleFeature,
    click: function (e) { info.update(e.target.feature) ; }
  });
}
// Compute the total length of bike lanes
function bindFeatureEventsAndComputeTheoryLanesLength(feature, layer)
{
  if (!(typeof feature != "undefined") && (feature.geometry.type == "LineString")) return;
  bindFeatureEvents(feature, layer) ;
}

// Function to convert a color in RGB color space to HSV color space
function rgbToHsl(r, g, b)
{
  r /= 255.0, g /= 255.0, b /= 255.0;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2.0;

  if(max == min)
  {
    h = s = 0; // achromatic
  }
  else
  {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max)
    {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6.0;
  }

  return [h, s, l];
}

// Function to get the style to apply to a feature
function styleFeature(className) {

    function applyStyle(feature)
    {
        var finalClassName = className;
        let colorCss;
        switch (feature.properties['etat']) {
          case "wait":
            colorCss = 'wait';
            break;
          case "etude":
            colorCss = 'etude';
            break;
          case "travaux":
            colorCss = 'travaux';
            break;
          case "done":
            colorCss = 'done';
            break;
          case "existant2020":
            colorCss = 'done';
            break;
          default:
            colorCss = 'no-info'
            break;
        }

        finalClassName += " " + colorCss;
        return {"className": finalClassName};
    }
    return applyStyle;
}

let lengthByState = {};
function calculateLengths(features)
{
  var length, realisation;
  for (const feature of features) {
    length = turf.area(feature, {units: "kilometers"});
    // length = parseFloat(feature.properties.calculated_length) / 1000;
    if (length) {
      totalTheory +=  length;

      if (typeof lengthByState[feature.properties.etat] == 'undefined') {
        lengthByState[feature.properties.etat] = 0;
      }
      lengthByState[feature.properties.etat] += length;
    }
  }
  console.log("totalTheory = ", totalTheory);
  console.log("done = ", lengthByState);
}


function toggleLayer(name) {
  var layer = mapLayers[name];
  if (map.hasLayer(layer)) {
    map.removeLayer(layer);
  } else {
    map.addLayer(layer);
  }
}

function diffTwoDate(date1, date2) 
{
   // différence des heures
  var time_diff = date2.getTime() - date1.getTime();
   // différence de jours
  return time_diff / (1000 * 3600 * 24);
}

// Function to display set the width of the progress bar
function displayProgressBars()
{
  for (const [state, length] of Object.entries(lengthByState)) {
    if (state == 'undefined') {
      continue;
    }
    let totalDonePercent = Math.round((length / totalTheory) * 100);
    let div = document.getElementById("state--" + state);
    if (div) {
      div.style.width = totalDonePercent + "%";
      let elements = div.getElementsByClassName('value');
      if (elements[0]) {
        elements[0].textContent = totalDonePercent + "%";
      }
    }
  }

  var dateDebutMandat = new Date("2020-07-03");
  var dateFinMandat = new Date("2026-07-03");
  let nbJourMandat = diffTwoDate(dateDebutMandat, dateFinMandat);
  let nbJourRestantMandat = diffTwoDate(new Date(), dateFinMandat);
  let ratioMandat = Math.ceil((nbJourMandat - nbJourRestantMandat) / nbJourMandat * 100);
  document.getElementById('progress-mandat').style.width = ratioMandat + "%";
  document.getElementById('progress-mandat').textContent = ratioMandat + "%";
  let dateDebutMandat2020 = new Date("2020-07-03");
  let dateFin2030 = new Date("2030-01-01");
  let nbJourMandat2030 = diffTwoDate(dateDebutMandat2020, dateFin2030);
  let nbJourRestantMandat2030 = diffTwoDate(new Date(), dateFin2030);
  let ratioMandat2030 = Math.ceil((nbJourMandat2030 - nbJourRestantMandat2030) / nbJourMandat2030 * 100);
  document.getElementById('progress-full-time-reve').style.width = ratioMandat2030 + "%";
  document.getElementById('progress-full-time-reve').textContent = ratioMandat2030 + "%";
}

// Create the map with Mapbox tiles
map = L.map('mapFrame',
  {
    fullscreenControl: true,
    maxBounds: [ [44.944797, -0.766678], [44.749594, -0.500209] ],
    maxBoundsViscosity: 1.0,
    minZoom: 11
  }) ;
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a> | Vélo-Cité Bordeaux Métropole | Mise à jour : 21/03/2023',
  subdomains: 'abcd',
}).addTo(map);
map.fitBounds([ [44.90, -0.766678], [44.749594, -0.500209] ]) ;
map.on('movestart', function(e) { info.update() ; });
map.on('zoomstart', function(e) { info.update() ; });
map.scrollWheelZoom.disable()

// Change the size of the icon for warning points on zoom
map.on('zoomend', function(e)
{
  var iconSize = zoomLevelToMarkerSize[ map.getZoom() ] ;
  var icon = L.icon({ iconUrl: 'assets/images/warning'+iconSize+'.png', iconSize: [iconSize, iconSize], iconAnchor: [iconSize/2, iconSize/2] }) ;
  for ( var iMarker = 0 ; iMarker < markers.length ; iMarker++ )
  {
    markers[iMarker].setIcon(icon) ;
  }
}) ;

// Add a custom control to display information
var info = L.control({position: "bottomleft"});
info.onAdd = function (map)
{
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};
info.update = updateInfo;
info.addTo(map);

//var planVeloUrl = "https://gxis.codeursenliberte.fr/fr/layers/5531d590-7425-4997-aa86-0a0386e48b97/geojson?authkey=Pfoq9bpvPpkjY9j5";
var planVeloUrl = '/map.json';

mapLayers['no-info'] = new L.GeoJSON(
  null,
  {
    style: styleFeature("path-no-info"),
    filter: function (feature, layer) { return (feature.properties['etat'] === 'no-info');},
    onEachFeature: bindFeatureEvents
  }
);
mapLayers['no-info'].addTo(map);

mapLayers['wait'] = new L.GeoJSON(
  null,
  {
    onEachFeature: bindFeatureEvents,
    style: styleFeature("path-wait"),
    filter: function (feature, layer) {
      return (isPlan2022(feature) && feature.properties['etat'] == 'wait') ;
    }
  }
);
mapLayers['wait'].addTo(map);

// add all layers with realised paths
Object.entries(mapRealisationColumn).map(function ([key, value]) {
  mapLayers[value] = new L.GeoJSON(
    null,
    {
      onEachFeature: bindFeatureEventsAndComputeTheoryLanesLength, 
      style: styleFeature("path-" + value),
      filter: function (feature, layer) {
        return (feature.properties.etat === value && isPlan2022(feature));
      }
    }
  );
  mapLayers[value].addTo(map);
});

mapLayers['existing'] = new L.GeoJSON(
  null,
  {
    style: styleFeature("path-existing"),
    filter: function (feature, layer) { return (feature.properties['etat'] === 'existant2020');},
    onEachFeature: bindFeatureEvents
  }
);
mapLayers['existing'].addTo(map);

fetch(planVeloUrl)
.then((response) => response.json())
.then(function (data) {
   calculateLengths(data.features);
   Object.values(mapLayers).map((map) => (map.addData(data)));
 })
.then(() => displayProgressBars());

var barometreFUB2021 = L.geoJson.ajax(
   '/points_noirs_bx-metro_barometre_fub.geojson',
  {style: {className: 'schema-directeur' }} );
barometreFUB2021.addTo(map);
map.removeLayer(barometreFUB2021);

barometreFUB2021.on("data:loaded", function () { barometreFUB2021.bringToFront(); }) ;

// Add control to display or hide layers
var overlayLayers = {
  //"Plan Vélo 2021-26": planVeloTheorieLayer,
  "Réseau réalisé avant 2021": mapLayers['existing'],
  "Point noir baromètre Parlons Vélo 2021": barometreFUB2021,
  //"Schema Directeur 2021-2026": directeurPlanVeloLayer,
};
L.control.layers(null, overlayLayers, {position: "topright", collapsed: false}).addTo(map);

// Add event listeners to display/hide legend items
map.on("overlayremove overlayadd", toggleLegend) ;

map.on('zoom', function() {
  if (map.getZoom() === 12) {
    map.addLayer(barometreFUB2021);
  } else if (map.getZoom() <= 11) {
    map.removeLayer(barometreFUB2021);
  }
});

let allCheckBox = document.querySelectorAll('.checkbox');
allCheckBox.forEach((checkbox) => {
  checkbox.addEventListener('change', (event) => {
    toggleLayer(event.target.dataset.layer);
  })
});