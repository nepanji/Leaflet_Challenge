// Add console.log to check to see if our code is working.
console.log("working");

// We create the tile layer that will be the background of our map.
let streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// We create the second tile layer that will be the background of our map.
let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Create a base layer that holds all three maps.
let baseMaps = {
  "Streets": streets,
  "Satellite": topo
};

// Create the map object with center, zoom level and default layer.
let map = L.map('map', {
	center: [37.09, -95.71],
	zoom: 5,
	layers: [streets]
});

// Then we add a control to the map that will allow the user to change which
// layers are visible.
L.control.layers(baseMaps).addTo(map);

// Retrieve the earthquake GeoJSON data.
var earthquakes = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
d3.json(earthquakes).then(function(data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. We pass the magnitude of the earthquake into two separate functions
  // to calculate the color and radius.
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

  // This function determines the color of the marker based on the depth of the earthquake.
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

  // This function determines the radius of the earthquake marker based on its magnitude.
  // Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }

  // Creating a GeoJSON layer with the retrieved data.
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      console.log(data);
      return L.circleMarker(latlng);
    },
      // We set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
     // We create a popup for each circleMarker to display the magnitude and location of the earthquake
     //  after the marker has been created and styled.
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
