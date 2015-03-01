var map, featureList, POISearch = [];

$('#sidebar').hide();

$(document).on("click", ".feature-row", function(e) {
  sidebarClick(parseInt($(this).attr("id"), 10));
});

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
	map.fitBounds([
	               [46.6492409, -92.301192],
	               [46.8807361, -91.9212545]
	           ]);
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  $('#sidebar').toggle();
  map.invalidateSize();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  $("#sidebar").toggle();
  map.invalidateSize();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  $('#sidebar').hide();
  map.invalidateSize();
});

function sidebarClick(id) {
  map.addLayer(POILayer);
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

function highlightFeature(e) {
    var layer = e.target;    
    layer.setStyle({
        weight: 4,
        color: '#333',
        dashArray: '' 
    });
    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}

//Removes the style when not hovering over the County
function resetHighlightCounty(e) { 		
	district8.resetStyle(e.target);
}

/* Basemap Layers */
var mbAttr = 	'Map data &copy; <a target="_blank" href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a target="_blank" href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery &copy; <a target="_blank" href="http://mapbox.com">Mapbox</a>',
	mbUrl = 	'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png';

var grayscale = L.tileLayer(mbUrl, {id: 'examples.map-20v6611k', 	attribution: mbAttr}),
	streets = 	L.tileLayer(mbUrl, {id: 'examples.map-i875mjb7',	attribution: mbAttr});
	satellite = L.tileLayer(mbUrl, {id: 'examples.map-igb471ik',	attribution: mbAttr});
	
	/*Accessible Basemaps*/
	grayscale.on('tileload', function (tileEvent) {
	    tileEvent.tile.setAttribute('alt', 'Map tile image');
	});
	
	streets.on('tileload', function (tileEvent) {
		tileEvent.tile.setAttribute('alt', 'Map tile image');
	});
	
	satellite.on('tileload', function (tileEvent) {
		tileEvent.tile.setAttribute('alt', 'Map tile image');		    
	});    

/* Overlay Layers */
var highlight = L.geoJson(null);

//Set the fill color for the Precinct based on the Precinct number
function getFillColor(PrecinctID) {
	return 	PrecinctID > 271370315 ?  '#000' :
			PrecinctID > 271370272  ? '#662506' :
			PrecinctID > 271370230  ? '#CC4C02' :
			PrecinctID > 271370187  ? '#FE9929' :
			PrecinctID > 271370145  ? '#FEE391' :
								 	  '#FFF';
}

/* Congressional District */
var district8 = L.geoJson(null, {
	  style: function (feature) {
	    return {
	      color: "#FFF",
	      weight: 1.5,
	      fillColor: getFillColor(feature.properties.PrecinctID),
	      opacity: 1,
	      fillOpacity: 0.75,
	      dashArray: '3',
	      clickable: true
	    };
	  },
	  onEachFeature: function (feature, layer) {
		  layer.on({
			  mouseover: highlightFeature,
			  mouseout: resetHighlightCounty
		  });				  		
		    if (feature.properties) {
		    	var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Precinct</th><td>" + feature.properties.Precinct + "</td></tr>" + "<tr><th>Precinct ID</th><td>" + feature.properties.PrecinctID + "</td></tr>"  + "<table>";    	layer.on({
		        click: function (e) {
		          $("#feature-title").html(feature.properties.Precinct);
		          $("#feature-info").html(content);
		          $("#featureModal").modal("show");
		        }
		      });
		    }
		  }
	});
	$.getJSON("data/CDistrict8.json", function (data) {
	  district8.addData(data);
	});


var POIMarker = L.AwesomeMarkers.icon({ // POI Symbology
	icon: 'star', 
	prefix: 'fa', 
	markerColor: 'cadetblue', 
	});


var markerClusters = new L.MarkerClusterGroup({ //Single marker cluster layer to hold all clusters
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});

/* Empty layer placeholder to add to layer control for listening when to add/remove things to the markerClusters layer */
var POILayer = L.geoJson(null);
var POI = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
    	icon: POIMarker,
    	title: feature.properties.NAME,
    	riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
    	var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.NAME + "</td></tr>" + "<tr><th>Address</th><td>" + feature.properties.ADDRESS + "</td></tr>"  + "<table>";    	layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.NAME);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            stroke: false,
            fillColor: "#00FFFF",
            fillOpacity: 0.7,
            radius: 10
          }));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="'+L.stamp(layer)+'"><td style="vertical-align: middle;"><span class="fa-stack"><i class="fa fa-square fa-stack-2x" style="color: #406573;"></i><i class="fa fa-star fa-stack-1x" style="color: white;"></i></span></td><td class="feature-name">'+layer.feature.properties.NAME+'</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      POISearch.push({
        name: layer.feature.properties.NAME,
        address: layer.feature.properties.ADDRESS,
        source: "POI",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/POI.geojson", function (data) {
  POI.addData(data);
  map.addLayer(POILayer);
});

//Define the map bounds constraint
var southWest = L.latLng(43.05, -97.77),
	northEast = L.latLng(49.61, -89.35),
	bounds = L.latLngBounds(southWest, northEast);

map = L.map("map", {
  zoom: 11,
  center: [46.7830,-92.1005],
  layers: [grayscale, district8, markerClusters, highlight],
  maxBounds: bounds,
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === POILayer) {
	    markerClusters.addLayer(POI);
	  }
});

map.on("overlayremove", function(e) {
  if (e.layer === POILayer) {
	    markerClusters.removeLayer(POI);
	  }
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "icon-direction",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Gray": grayscale,
  "Street Map": streets,
  "Aerial Imagery": satellite
};

var groupedOverlays = {
	"": {
		"Congressional District": district8
  },
  "Places of Interest": {
	  	"<span class='fa-stack fa-lg'><i class='fa fa-square fa-stack-2x' style='color: #406573;'></i><i class='fa fa-star fa-stack-1x' style='color: white;'></i></span>&nbsp;Points Of Interest": POILayer,
  }
};

var options = { exclusiveGroups: [""],
		collapsed: isCollapsed 
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, options, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

//TODO: Results are cleared when the text is cleared
//Clear Search with clicking close
$("#searchclear").on("click", function(e){
    e.preventDefault();
    $("#sidebar-search").val("");
    sidebarSearch();
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});
  
  var POIBH = new Bloodhound({
	    name: "POI",
	    datumTokenizer: function (d) {
	      return Bloodhound.tokenizers.whitespace(d.name);
	    },
	    queryTokenizer: Bloodhound.tokenizers.whitespace,
	    local: POISearch,
	    limit: 10
	  });

  var geonamesBH = new Bloodhound({
    name: "GeoNames",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: "http://api.geonames.org/searchJSON?username=mnhealth&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
      filter: function (data) {
        return $.map(data.geonames, function (result) {
          return {
            name: result.name + ", " + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: "GeoNames"
          };
        });
      },
      ajax: {
        beforeSend: function (jqXhr, settings) {
            settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
          $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
        },
        complete: function (jqXHR, status) {
          $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
        }
      }
    },
    limit: 10
  });
  POIBH.initialize();
  geonamesBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
	    name: "POI",
	    displayKey: "name",
	    source: POIBH.ttAdapter(),
	    templates: {
	      header: "<h4 class='typeahead-header'><span class='fa-stack'><i class='fa fa-square fa-stack-2x' style='color: #406573;'></i><i class='fa fa-star fa-stack-1x' style='color: white;'></i></span>&nbsp;POI</h4>",
	      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
	    }
	  }, {
    name: "GeoNames",
    displayKey: "name",
    source: geonamesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
    }
  }).on("typeahead:selected", function (obj, datum) {
	  if (datum.source === "POI") {
	  if (!map.hasLayer(POILayer)) {
	  	map.addLayer(POILayer);
	  }
	  map.setView([datum.lat, datum.lng], 17);
	  if (map._layers[datum.id]) {
		  map._layers[datum.id].fire("click");
	  }
	}
    if (datum.source === "GeoNames") {
      map.setView([datum.lat, datum.lng], 14);
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});