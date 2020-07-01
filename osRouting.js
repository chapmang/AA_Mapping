/**
 * AA Media's demo of routing page utilising OS API's
 * Initial version uses a local tile server hosted in Mapping Services
 * on DKT939551. CRS used thorought is British National Grid (BNG).
 * Code by Geoff Chapman - Feb 2016
 */

var OSR = OSR || {};
OSR.Events = OSR.Events || {};
OSR.Utils = OSR.Utils || {};
OSR.StartLocation = [456245, 146500];
OSR.Map = OSR.Map || {};
OSR.Layers = [];


        var menu = document.querySelector("#context-menu");
        var menuState = 0;
        var menuPosition;
        var menuPositionX;
        var menuPositionY;


/**
 * Proj4 definition of British National Grid
 */
proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
          '+x_0=400000 +y_0=-100000 +ellps=airy ' +
          '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
          '+units=m +no_defs');
var proj27700 = ol.proj.get('EPSG:27700');
proj27700.setExtent([0, 0, 700000, 1300000]);


OpenSpace = function() {
    
    var selectedResns = [];
    var selectedSizes = [];
    var selectedLayers = [];
    var resolutionLookup = {
        "openspace:MSR": [200.0, 200],   // Miniscale reduced - shrunk Route Planner
        "openspace:MS": [100.0, 200],    // Miniscale - Route Planner
        "openspace:250KR": [50.0, 200],  // Roadbook reduced - shrunk Roadbook with relief 
        "openspace:250K": [25.0, 200],   // Roadbook - Roadbook with relief 
        "openspace:50KR": [10.0, 200],   // 1:50K reduced - shrunk 1:50K mapping
        "openspace:50K": [5.0, 200],     // 1:50K - 1:50K mapping - zoom = 14
        "openspace:25K": [2.5, 200],    // Vector Map District reduced - shrunk VMD, no relief zoom - 15
        "openspace:SVR": [2.0, 250],     // Street View reduced - shrunk Street atlas, no relief
        "openspace:SV": [1.0, 250]       // Street - Street atlas, no relief
    };

    $.each(resolutionLookup, function (key, value) {
        selectedResns.push(resolutionLookup[key][0]);
        selectedSizes.push(resolutionLookup[key][1]);
        selectedLayers.push(key);
    });
    
    this.options = {
        url: 'http://dkt939551:8085/geoserver/openspace/wms',
        params: {
            'FORMAT': 'image/jpeg',
            'VERSION': '1.1.1',
            'LAYERS': selectedResns[0],
            tiled: true,
            STYLES: '',
        },
        extent: [0, 0, 800000, 1300000],
        projection: 'EPSG:27700',
        tileGrid: new ol.tilegrid.TileGrid({
            tileSizes: selectedSizes,
            resolutions: selectedResns,
            origin: [0, 0]
        })
    };
    
    var source = new ol.source.TileWMS(this.options);
    this.source = source;
        
    this.layer = new ol.layer.Tile({
        source: source,
        opacity: 0.5,
        minResolution: selectedResns[selectedResns.length],
        maxResolution: selectedResns[0] + 0.001
    });
        
    // Sort of override the URL generation function to set the LAYERS parameter from the resolution.
    // The map's resolution change event can not be used os ol3 may pre-fetch tiles at adjacent zoom levels.
    var originalTileUrlFunc = source.getTileUrlFunction();
    this.source.setTileUrlFunction(function (tileCoord, pixelRatio, projection) {

        // for 'free' OS OpenSpace the LAYERS param needs to be equal to the resolution
        var z = tileCoord[0];
        var res = selectedLayers[z];
        source.updateParams({ LAYERS: res });

        // call superclass
        return originalTileUrlFunc(tileCoord, pixelRatio, projection);
    });
};


/**
* get the base layer
* @return {ol.layer.Tile} the layer for adding to a map
*/
OpenSpace.prototype.getLayer = function () {
    return this.layer;
};

/**
* get the base layer's source
* @return {ol.source.TileWMS} the source of the layer
*/
OpenSpace.prototype.getSource = function () {
    return this.source;
};

/**
* get the base layer's resolutions
* @return {[number]} the resolutions available
*/
OpenSpace.prototype.getResolutions = function () {
   return this.source.getTileGrid().getResolutions();
};

/**
* get the layer's max resolution
* @return {number} the max resolution available (lowest zoom)
*/
OpenSpace.prototype.getMaxResolution = function () {
    return this.getResolutions()[0];
};

/**
* get the base layer's min resolution
* @return {number} the min resolution available (highest zoom)
*/
OpenSpace.prototype.getMinResolution = function () {
    var resns = this.getResolutions();
    return resns[resns.length - 1];
};

/**
* get the base layer's projection
* @return {ol.proj.Projection} the layer's projection
*/
OpenSpace.prototype.getProjection = function () {
    return this.source.getProjection();
};


/**
 * BaseMapModel.
 * The Model makes use of the OpenLayers3 Library
 * to load base mapping from local geoserver instance
 */ 
OSR.MapModel = function(target) {
    
    this._target = target;
    
    this.addBase = function () {
        var openspace = new OpenSpace();
        
        var routeLayer = new ol.layer.Vector("Route");
        var startMarkerLayer = new ol.layer.Vector("StartMarker");
        var finishMarkerLayer = new ol.layer.Vector("FinishMarker");

        OSR.Map = new ol.Map({
            layers: [
                openspace.getLayer(),
                routeLayer,
                startMarkerLayer,
                finishMarkerLayer
            ],
            target: this._target,
            view: new ol.View({
                projection:  'EPSG:27700',
                center: OSR.StartLocation,
                resolutions: openspace.getResolutions(),
                zoom: 14,
                maxZoom: 17,
                minZoom: 9
            })
        });
        var contextmenu = new ContextMenu();
        OSR.Map.addControl(contextmenu);
    };
};


OSR.RouteModel = function() {
    
    
    
    this.getRoute = function (points, params) {
        
        this._startPoint = points.startPoint;
        this._finishPoint = points.finishPoint;

        this._params = params;
        
        var request = new XMLHttpRequest();
        var start = "point="+this._startPoint.x+","+this._startPoint.y;
        var finish = "point="+this._finishPoint.x+","+this._finishPoint.y;
        
        var routeApiKey = OSR.routeApiKey;
        var routeUrl = "https://api.ordnancesurvey.co.uk/routing_api/route?";
        var paramsEncoded = [];
        for (var key in params) {
            our.push(key += encodeURIComponent(params[key]));
        }
        paramsEncoded.join('&');
        request.open("GET", url+paramsEncoded, true);
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                var localArray = JSON.parse(request.responseText);
                // Do something with result
            }
        };
        request.send();
    };
};


/**
 * BaseMapView.
 * The View is attached to the model and provides
 * the onLoad event.
 * @param {object} model - BaseMapModel for loading tiles
 * @param {[string] | null} elements - target page element for the mapping
 */
OSR.MapView = function (model, elements) {
    
    this._model = model;
    this._elements = elements;
    
    var _this = this;
};

OSR.MapView.prototype = {
  
    loadBaseMap: function() {
        this._model.addBase();
    },
    
};


OSR.MapController = function(model, view) {
        
    this._model = model;
    this._view = view;
    
    var _this = this;

};



OSR.RouteView = function(model, elements) {
    
    this._model = model;
    this._elements = elements;
    
    this.mapClicked = new Event(this);
    
    var _this = this;
    
    this._elements.map.addEventListener("contextmenu", function(e) {
        console.log(OSR.Map.getEventCoordinate(e));
       _this.mapClicked.notify({}); 
    });
    this._elements.startPoint.click(function(e) {
    });
    
};

OSR.RouteController = function(model, view) {
        
    this._model = model;
    this._view = view;
    
    var _this = this;

};


OSR.Event = function(sender) {
    
    this._sender = sender;
    this._listeners = [];
};

OSR.Event.prototype = {
    attach : function (listener) {
        this._listeners.push(listener);
    },
    notify : function (args) {
        var index;
        for (index = 0; index < this._listeners.length; index += 1) {
            this._listeners[index](this._sender, args);
        }
    }
};


OSR.App = (function () {
    "use strict";
    
    var osMap = {};
    
    var init = function () {
        var mapModel = new OSR.MapModel('map'),
            mapView = new OSR.MapView(mapModel, { }),
            mapCcontroller = new OSR.MapController(mapModel,  mapView);
        
        mapView.loadBaseMap();
        
        var routeModel = new OSR.RouteModel(),
            routeView = new OSR.RouteView(routeModel, {
                map: document.getElementById('map'),
                startPoint: $('#startLocation'),
                finishPoint: $('#finishLocation')
            }),
            routeController = new OSR.RouteController(routeModel, routeView);
     
    };
    
    return {
        init: init
    };
}());


(function(){
   OSR.App.init();

})();




OSR.Utils = (function () {
    
    // Logging back to server
    var log = function () {
        
    };
    
    return  {
        log: log
    };
}());