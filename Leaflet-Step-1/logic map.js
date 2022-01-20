
// Create the tile layer for the map's background.
let streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php">USGS</a> contributors'
});

// Create a second tile layer for the topographic view of maps' background.
let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Create a base layer to hold the maps.
let baseMaps = {
  "Streets": streets,
  "Satellite": topo
};
// // Create an overlay object to hold our overlay.
// var overlayMaps = {
//   Earthquakes: quakes
// };

// Center the map object and zoom level and default layer.
let map = L.map('map', {
	center: [37.09, -95.71],
	zoom: 5,
	layers: [streets]
});

// // Add the layer control to the map.
// L.control.layers(baseMaps, overlayMaps, {
//   collapsed: false
// }).addTo(myMap);

//Add a map control to make the layers visible
L.control.layers(baseMaps).addTo(map);

// Retrieve the earthquake GeoJSON data.
var earthquakes = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
d3.json(earthquakes).then(function(data) {

  // Create a function that returns the style data for each plotted earthquakes we plot. 
  // The depth of the earth is represented by the fillColor of the circle marker and the magnitude of the earthquake 
  // is represented by the radius of each circle marker.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Create function to determine the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    if (depth > 80) {
      return "#762a83";
    }
    else if (depth > 60) {
      return "#af8dc3";
    }
    else if (depth > 40) {
      return "#e7d4e8";
    }
    else if (depth > 20) {
      return "#d9f0d3";
    }
    else if (depth > 10) {
      return "#7fbf7b";
    }
    else{
      return "#1b7837";
    }
    
  }

  // Create function to determine the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }

  // Create a GeoJSON layer with the retrieved data.
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      console.log(data);
      return L.circleMarker(latlng);
    },
      // Set the style for each circlemarker using our styleInfo function.
    style: styleInfo,
     // Create an onEachFeature popup for each circlemarker to display the magnitude of the earthquake
     // and the depth of the Earth.
     onEachFeature: function(feature, layer) {
      layer.bindPopup("Location: " + feature.properties.place + "<br>Magnitude: " + feature.properties.mag + "<br>Depth: " + feature.geometry.coordinates[2] + "<br>Date: " + new Date(feature.properties.time));
    }
  }).addTo(map);

  // Create a legend control object.
  var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend');
      var grades = [-10,10,20,40,60,80];
      var labels = ['<b>'+'Earthquake Depth'+'</b>'];
      var from, to;

      for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
          '<i style="background:' + getColor(from + 1) + '"></i> ' +
          from + (to ? '&ndash;' + to : '+'));
      }

      div.innerHTML = labels.join('<br>');
      return div;
    };

    legend.addTo(map);
});
