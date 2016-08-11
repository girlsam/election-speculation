$(document).ready(function() {
  // initialize map
  var map = L.map('map').setView([38, -96], 4);
  var mapboxAccessToken = 'pk.eyJ1IjoiZ2lybHNhbSIsImEiOiJjaXIza3hvdnYwMDNiZnBubW4wMWd1dHUyIn0.Py-7RPHcQQ3JCUDL3wdwcg';
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
    attribution: 'Map data &copy; <a href="http://leafletjs.com/examples/choropleth.html">Leaflet</a> contributors, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>'
  }).addTo(map);

  // call for polling data by state
  $.ajax({
    method: 'GET',
    dataType: 'jsonp',
    url: 'https://pollyvote.com/wp-content/plugins/pollyvote/data/index.php?time=current&level=state'
  }).then(function(states) {
    var statesArr = states.data.map(function(stateInfo) {
      return { name: stateInfo.state, party: stateInfo.fcwinner, repubNumbers: stateInfo.fcrepvs, demNumbers: stateInfo.fcdemvs };
    });
    for (var i = 0; i < statesData.features.length; i++) {
      for (var j = 0; j < statesArr.length; j++) {
        if (statesData.features[i].name === statesArr[j].name) {
          statesData.features[i].party = statesArr[j].party;
          statesData.features[i].demNumbers = statesArr[j].demNumbers;
          statesData.features[i].repubNumbers = statesArr[j].repubNumbers;
        }
      }
    }
  geojson = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);

  // event listeners for map interactivity
  var geojson;
  function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
      fillOpacity: 0.5,
    });
    info.update(layer.feature);
  }
  function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
  }
  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
    });
  }
  var info = L.control({position: 'bottomright'});

  // create div with info container
  info.onAdd = function (map) {
    this.__div = L.DomUtil.create('div', 'info');
    this.update();
    return this.__div;
  };

  // add info to dom, on load and update
  info.update = function (props) {
    this.__div.innerHTML = '<h4>Today\'s Polling Numbers</h4>' +  (props ?
      '<b>' + props.fullName + '</b><br/>Democrat: ' + props.demNumbers + ' %' + '<br/>Republican: ' + props.repubNumbers + '%': '<b>Hover over a state!</b>' );
  };

  function onClick(e) {
    var layer = e.target;
    console.log(layer);
    layer.setStyle({
      fillColor: '#E80200'
    });
    info.update();
  }

    map.on('click', onClick);

  // function to total electoral votes based on party
  function totalElectoralVotes(party) {
    var total = 0;
    statesData.features.forEach(function(states) {
      if (states.party === party) {
        total += states.evotes;
      }
    });
    return total;
  }

  var demVotes = totalElectoralVotes('D');
  var repVotes = totalElectoralVotes('R');

  //apply eachFeature to dom
  info.addTo(map);

  // map.on('click', function(e) {
  //   statesData.features.forEach(function(states) {
  //     console.log(states.evotes);
  //   });
  // });

  //add electoral vote count to DOM
  $('#dem-votes').text(demVotes);
  $('#rep-votes').text(repVotes);
  });
});

//FUNCTIONS TO STYLE EACH STATE
// assign color based on party
function assignColor(party) {
  var color = (party === "R") ? "#E80200" : "#3625FF";
  return color;
}
// style GeoJSON layer based on party
function style(feature) {
  return {
    fillColor: assignColor(feature.party),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '2',
    fillOpacity: 0.8
  };
}
