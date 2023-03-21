import L from 'leaflet';
import './styles/map.css';

var map;
var areaParisSquareKilometers =
  105.4 // https://fr.wikipedia.org/wiki/Paris#Topographie
    - 23.94  // Area of parks and garden, see https://fr.wikipedia.org/wiki/Liste_des_espaces_verts_de_Paris
    - 1.38 // Area of the Boulevard Péripérique https://fr.wikipedia.org/wiki/Boulevard_p%C3%A9riph%C3%A9rique_de_Paris#Voies_de_circulation
    - 1.7  // Estimated area of the Seine river in Paris, rounded to the nearest 0.1km2
    - 0.9567 ; // Area of graveyards https://fr.wikipedia.org/wiki/Cimeti%C3%A8res_parisiens
var areaZonesApaisees = 0 ;
var totalTheory = 0; 
var lengthLanesDone = { 'corona': 0.0, 'semipersistent': 0.0, 'persistent': 0.0, 'novel': 0.0};
var mapRealisationColumn = {
       "Plots jaunes": "corona",
       "Semi-pérennisation légère": "semipersistent", 
       "Pérennisation en dur": "persistent",
       "Nouveau linéaire": "novel"};
var layersLoaded = 0 ;
var markers = [] ;
var mapLayers = {};
var zoomLevelToMarkerSize = { 11: 24, 12: 24, 13: 24, 14: 24, 15: 32, 16: 32, 17: 48, 18: 48, 19: 64 } ;
var planVeloPratiqueLayer ;
var hueReferences = [ [0, "#ff0000"], [0.33333, "#228b22"], [0.10784, "#ffa500"] ] ; // Red, green, orange

function isPlan2022(feature) {
  var horsPlan2022 = ['Réalisé Pré-2021', 'Hors Plan Vélo (Embellir)', "Annoncé réalisé"];
  return ! horsPlan2022.includes(feature.properties['Etat']);
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
  $(layer._path).addClass("path-selected");

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
  $(layer._path).removeClass("path-selected");
  // if ( layer.feature.geometry.type != "Point" )
  // {
  //   //layer.setStyle(styleFeature(layer.feature)) ;
  // }

  info.update() ;
}


function updateInfo(feature)
{
  var content = '' ;
  if ( typeof feature != "undefined" && feature.geometry.type == "Polygon")
  {
    var areaFeature = turf.area(feature) / 1000000.0 ;
    areaFeature = Math.round( 1000 * areaFeature ) / 1000 ;

    if (feature.properties && feature.properties.name)
      content += "<b>"+feature.properties.name+"</b><br/>" ;
    if (feature.properties && feature.properties.description)
      content += feature.properties.description+"<br/>" ;

    content += "Surface : "+areaFeature+"km²";
  }
  else if ( typeof feature != "undefined" && feature.geometry.type == "LineString" )
  {
    var lengthFeature = Math.round( 100 * turf.lineDistance(feature) ) / 100 ;

    if (feature.properties && feature.properties['Rue ou axe'])
      content += "<b>"+feature.properties['Rue ou axe']+"</b><br/>" ;
    if (feature.properties && feature.properties['Etat'])
      content += feature.properties['Etat'] + "<br/>";
    if (feature.properties && feature.properties['Statut'])
      content += feature.properties['Statut'] + "<br/>";
    if (feature.properties && feature.properties.description)
      content += feature.properties.description+"<br/>" ;

    content += "Longueur : "+lengthFeature+"km";
  }
  else if ( typeof feature != "undefined" && feature.geometry.type == "Point" )
  {
    if (feature.properties && feature.properties.name)
      content += "<b>"+feature.properties.name+"</b><br/>" ;
    if (feature.properties && feature.properties.description)
      content += feature.properties.description+"<br/>" ;
  }
  else
    content = "Placez le curseur sur un segment pour plus d'informations" ;

  this._div.innerHTML = '<h4>Informations</h4>' + content ;
}

function bindFeatureEvents(feature, layer)
{
  console.log(feature);
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
        if (feature.properties['Niveau'] === "Primaire")
            finalClassName += " primary";
        else 
            finalClassName += " secondary";
        return {"className": finalClassName};
    }
    return applyStyle;
}

function calculateLengths(features)
{
  var length, realisation;
  for (const feature of features) {
      //totalTheory += turf.length(feature, {units: "kilometers"});
      length = parseFloat(feature.properties.calculated_length) / 1000;
      if (length) {
          if (isPlan2022(feature)) {
              totalTheory +=  length;
          realisation = feature.properties['Réalisation'];
          if (realisation) {
              lengthLanesDone[mapRealisationColumn[realisation]] += length;
     }
     }
  }
 }
  console.log("totalTheory = ", totalTheory);
  console.log("done = ", lengthLanesDone);
}


function toggleLayer(name) {
   var layer = mapLayers[name];
   var elem = document.getElementById("checkbox-" + name);
    if (map.hasLayer(layer)) {

       elem.innerText = "" ;
       elem.className = name + "-unchecked";
       map.removeLayer(layer);
    }
    else 
    {
       document.getElementById("checkbox-" + name).innerText = "✓" ;
       elem.className = name;
       map.addLayer(layer);
     }
     setToggleDone();
}

function setToggleDone() {
   var arr = ["novel", "persistent", "semipersistent"]; 
   var visible = arr.some((name) => (map.hasLayer(mapLayers[name])));
   var elem = document.getElementById("checkbox-done-layers");
   if (visible) {
        elem.innerText = "✓" ;
   }
   else {
        elem.innerText = "" ;
   };
}

function toggleLayersDone() {
   var arr = ["novel", "persistent", "semipersistent"]; 
   var elem, layer;
   var visible = arr.some((name) => (map.hasLayer(mapLayers[name])));
   for (i=0; i<arr.length; ++i) {
      name = arr[i];
      layer = mapLayers[name];
      elem = document.getElementById("checkbox-" + name);
      if (visible) {
        elem.innerText = "" ;
        elem.className = name + "-unchecked";
        map.removeLayer(layer);
      }
      else 
      {
         elem.innerText = "✓" ;
         elem.className = name;
         map.addLayer(layer);
      }
  }
  setToggleDone();

}

// Function to display set the width of the progress bar
function displayProgressBars()
{
  layersLoaded++ ;

  // If the two layers have been loaded, perform the update of width and log everything in console
var sumLengths = function (obj) { return obj['semipersistent'] + obj['persistent'] + obj['novel']};

if ( layersLoaded > 0 )
  {

    var totalDone = sumLengths(lengthLanesDone);
    var totalDonePercent = Math.round((totalDone / totalTheory) * 100);

    //var primairePercent = (lengthLanesDone[iPlanVeloPri]) / lengthLanesTheory[iPlanVeloPri] * 100 ;
    //var primaireCoronaPercent = (lengthCoronaPiste[iPlanVeloPri]) / lengthLanesTheory[iPlanVeloPri] * 100 ;
    //var primaireDistance = Math.round(lengthLanesDone[iPlanVeloPri]) + 'km';
    //var primaireCoronaDistance = Math.round(lengthCoronaPiste[iPlanVeloPri]) + 'km';
    //var primaireRemainingDistance = Math.round(lengthLanesTheory[iPlanVeloPri] - lengthLanesDone[iPlanVeloPri] - lengthCoronaPiste[iPlanVeloPri]) + 'km';

    //var secondaireDistance = Math.round(lengthLanesDone[iPlanVeloSec]) + 'km';
    //var secondaireCoronaDistance = Math.round(lengthCoronaPiste[iPlanVeloSec]) + 'km';
    //var secondaireRemainingDistance = Math.round(lengthLanesTheory[iPlanVeloSec] - lengthLanesDone[iPlanVeloSec] - lengthCoronaPiste[iPlanVeloSec]) + 'km';

    //var secondairePercent = (lengthLanesDone[iPlanVeloSec]) / lengthLanesTheory[iPlanVeloSec] * 100 ;
    //var secondaireCoronaPercent = (lengthCoronaPiste[iPlanVeloSec]) / lengthLanesTheory[iPlanVeloSec] * 100 ;
    //var allCoronapistePercent =  (lengthCoronaPiste[iPlanVeloPri] + lengthCoronaPiste[iPlanVeloSec]) / (lengthLanesTheory[iPlanVeloPri] + lengthLanesTheory[iPlanVeloSec]) * 100;

    //var allLanesPercent = (lengthLanesDone[iPlanVeloPri] + lengthLanesDone[iPlanVeloSec]) / (lengthLanesTheory[iPlanVeloPri] + lengthLanesTheory[iPlanVeloSec]) * 100;
    //disp( null, "length-corona", Math.round(lengthLanesDone['corona'] * 10)/10 + ' km');
// disp( null, "length-semipersistent", Math.round(lengthLanesDone['semipersistent'] * 10)/10 + ' km');
// disp( null, "length-persistent", Math.round(lengthLanesDone['persistent']*10)/10 + ' km');
// disp( null, "length-novel", Math.round(lengthLanesDone['novel']*10)/10 + ' km');
// disp( totalDonePercent, "cyclepaths-done") ;
// disp( Math.max(0, 100 - totalDonePercent), "cyclepaths-remaining") ;
    //disp( Math.round( primairePercent ), "pistePrimaire", primaireDistance) ;
    //disp( Math.round( primaireCoronaPercent ), "coronapistePrimaire", primaireCoronaDistance) ;
    //disp( Math.round( secondairePercent ), "pisteSecondaire", secondaireDistance) ;
    //disp( Math.round( secondaireCoronaPercent ), "coronapisteSecondaire", secondaireCoronaDistance) ;
    //disp( Math.round( allCoronapistePercent ), "coronapisteAll") ;
    //disp( Math.round( allLanesPercent ), "pisteAll") ;
    //disp( Math.max(0, 100 - Math.round( allLanesPercent ) - Math.round(allCoronapistePercent)), "pisteTheoryAll") ;
  }
}

// Create the map with Mapbox tiles
map = L.map('mapFrame',
  {
    fullscreenControl: true,
    maxBounds: [ [48.91, 2.49], [48.80, 2.19] ],
    maxBoundsViscosity: 1.0,
    minZoom: 11
  }) ;
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a> | Vélo-Cité Bordeaux Métropole | Mise à jour : 21/03/2023',
  subdomains: 'abcd',
}).addTo(map);
map.fitBounds([ [48.91, 2.49], [48.80, 2.19] ]) ;
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
info.update = updateInfo ;
info.addTo(map);

//var planVeloUrl = "https://gxis.codeursenliberte.fr/fr/layers/5531d590-7425-4997-aa86-0a0386e48b97/geojson?authkey=Pfoq9bpvPpkjY9j5";
var planVeloUrl = '/map.json';
var planDirecteurUrl = "./paris_plan_v_lo_2026.json";

mapLayers['unfinished'] = new L.GeoJSON(
    null,
            {onEachFeature: bindFeatureEventsAndComputeTheoryLanesLength, style: styleFeature("path-unfinished"), filter: function (feature, layer) { return (isPlan2022(feature) && ! feature.properties['Réalisation']) ;} } );
mapLayers['unfinished'].addTo(map);

// add all layers with realised paths
Object.entries(mapRealisationColumn).map(function ([key, value]) {
     mapLayers[value] = new L.GeoJSON(
      null,
      {onEachFeature: bindFeatureEventsAndComputeTheoryLanesLength, 
      style: styleFeature("path-" + value),
      filter: function (feature, layer) { return (isPlan2022(feature) && (feature.properties['Réalisation'] === key)) ;} } );
     mapLayers[value].addTo(map);

});

mapLayers['existing'] = new L.GeoJSON(
    null,
    {style: styleFeature("path-existing"), filter: function (feature, layer) { return (feature.properties['Etat'] === 'Réalisé Pré-2021');},
     onEachFeature: bindFeatureEvents } );
//mapLayers['existing'].addTo(map);

fetch(planVeloUrl)
.then((response) => response.json())
.then(function (data) {
   calculateLengths(data.features);
   Object.values(mapLayers).map((map) => (map.addData(data)));
 })
.then(() => displayProgressBars());

// var directeurPlanVeloLayer = new L.GeoJSON.AJAX(
//    planDirecteurUrl, 
//   {style: {className: 'schema-directeur' }} );
//directeurPlanVeloLayer.addTo(map);
//directeurPlanVeloLayer.on("data:loaded", function () { directeurPlanVeloLayer.bringToFront(); }) ;

// Add control to display or hide layers
var overlayLayers = {
  //"Plan Vélo 2021-26": planVeloTheorieLayer,
  "Réseau réalisé avant 2021": mapLayers['existing'] 
  //"Schema Directeur 2021-2026": directeurPlanVeloLayer,
};
L.control.layers(null, overlayLayers, {position: "topright", collapsed: false}).addTo(map);

// Add event listeners to display/hide legend items
map.on("overlayremove overlayadd", toggleLegend) ;