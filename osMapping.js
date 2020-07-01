/**
 * AA-OS Mapping
 * Internal web application for the viewing of
 * Ordanace Survey Mapping
 * 
 * @author Geoff Chapman <geoff.chapman@theaa.com>
 * @version 2
 */

const NAMES_API_KEY = "1LjvRzpKwhw7HsYEtwMjSub8YrHaIMGE";
var StartLocation = [463755, 152345],
    Layers = [];


/**
 * Event Listener - An internal event listener for informing other objects that 
 * methods have completed etc via observer pattern
 * @constructor
 * @param {string} sender - Source class of the event
 */
var Event = function (sender) {

	this._sender = sender;
	this._listeners = [];
};

/**
 * Attach a listener to an event
 * @param  {function} listener - function attacted to the event
 */
Event.prototype.attach = function(listener) {
	this._listeners.push(listener);
};

/**
 * Notify the listener an event has happend
 * @param  {Object} args - Information generated by the event
 */
Event.prototype.notify = function(args) {
	for (var index = 0; index < this._listeners.length; index += 1) {
        this._listeners[index](this._sender, args);
    }
};



/* --------------------------------------------------
 * Model-Controller style pattern
 * -------------------------------------------------- */
 
/**
 * BaseMapModel.
 * This Model makes use of the OpenLayers3 Library
 * to load base mapping from local geoserver instance
 */ 
MapModel = function(target) {
    
    this._target = target;
    
    this.addBase = function (easting, northing) {
        var openspace = new OpenSpace(),
            iconLayer = new ol.layer.Vector(),
            iconSource;
        
        if (easting && northing) {
            StartLocation = [easting, northing];
            
            var iconFeature = new ol.Feature({
                geometry: new ol.geom.Point([easting, northing])  
            });
        
            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 1],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    src: 'img/oWaypointAA.png',
                }))
            });

            iconFeature.setStyle(iconStyle);
        
            iconSource = new ol.source.Vector({
                features: [iconFeature]
            });
        }
        
        iconLayer.setSource(iconSource);
                
        Map = new ol.Map({
            layers: [
                openspace.getLayer(),
                iconLayer
            ],
            target: this._target,
            view: new ol.View({
                projection:  'EPSG:27700',
                center: StartLocation,
                resolutions: openspace.getResolutions(),
                zoom: 14,
                maxZoom: 17,
                minZoom: 9
            })
        });
        

     };
};


/**
 * SearchModel.
 * This Model fetches queries the server for locations
 * and notifies observers about any responses.
 */ 
SearchModel = function() {
    
    this.results = [];
    
    this.searchResponse = new Event(this);
    
    var _this = this;
    
    this.ajaxSearch = function(searchString) {

        $.ajax({
            cache: false,
            url: 'fetchLocation.php',
            dataType: 'json',
            contentType: 'charset=utf-8',
            data: {
                location: searchString
            }
        }).done(function(response) {
           _this.results = response.results;
           _this.searchResponse.notify();
        }).fail(function(errorMsg) {
            console.log(errorMsg);

        });
    };
    
    this.getSearchResults = function() {
        return _this.results;
    };

};


/**
 * BaseMapView.
 * The View is attached to the model and provides
 * the onLoad event.
 * @param {object} model - BaseMapModel for loading tiles
 * @param {[string] | null} elements - target page element for the mapping
 */
MapView = function (model, elements) {
    
    this._model = model;
    this._elements = elements;
    
    var _this = this;
    
};

MapView.prototype = {
  
    loadBaseMap: function() {
        var easting = this.getUrl('east');
        var northing = this.getUrl('north');
        
        this._model.addBase(easting, northing);
    },
    getUrl:function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    }    
};


/**
 * BaseMapController
 * This controller responds to user interaction and
 * invokes changes on th model
 * 
 */
BaseMapController = function(model, view) {
        
    this._model = model;
    this._view = view;
    
    var _this = this;
};


/**
 * SearchView.
 * This View is presents the search model and provides
 * the UI events. The SearchController is attahced to these
 * events to handle the user interaction.
 * @param {object} model - SearchModel for querying the server
 * @param {[string] | null} elements - html objects interacted with during search
 */
SearchView = function(model, elements) {
    
    this._model = model;
    this._elements = elements;
    
    this.searchButtonClicked = new Event(this);
    this.locationSelectionClicked = new Event(this);
    
    var _this = this;
    
    // attach model listeners
    this._model.searchResponse.attach(function() {
        _this.displayResults();
    });
    
    // attach listeners to HTML controls
    this._elements.searchButton.click(function(e) {
        e.preventDefault();
        _this.searchButtonClicked.notify();
    });
    
    this._elements.mask.click(function(event) {
        
        var target = event.target || event.srcElement;
        if (target.className === 'geoName') {
            _this.locationSelectionClicked.notify({
                easting: target.dataset.easting,
                northing: target.dataset.northing
            });
            $("#mask").hide();
            $('.window').detach();
        }
        
    });
};

SearchView.prototype = {
    
    displayResults: function () {
        var results,
            singleResult;
        
        results = this._model.getSearchResults();
        
        if (results.hasOwnProperty("error")) {
            this.showError(res.error_msg);
        } else if (results.length > 1) {
            var numResults = results.length; // Number of results returned
            var dialog = {
                dialogID: "reviewSearchResults",
                dialogClass: "reviewSearchResults",
                dialogHeader: numResults+" Search Results",
                dialogContent: "<br/>",
                dialogContentID: 'resultList',
                dialogContentClass: 'resultList'
            };
            Modal.renderDialog(dialog); // Build Modal show results
            // Append the cleaned up results
            $.each(results, function(i, result) {
                $('#resultList').append("<p class='geoName' data-easting='"+result.easting+"' data-northing='"+result.northing+"'>"+result.name+", " +
                result.county+"</p>");
            });
            $('#resultList').scrollTop(0);
            $('#ajaxPreloader').remove();
            Modal.modal(); // Display Modal box
        } else {

            $("#mask").hide();
            $('.window').detach();
            Map.getView().setCenter([results[0].easting, results[0].northing]);
        }
    },
    showError: function(){
        alert('test');
    }
};

SearchController = function(model, view) {
    
    this._model = model;
    this._view = view;
    
    var _this = this;
    
    this._view.searchButtonClicked.attach(function() {
       _this.search(); 
    });
    
    this._view.locationSelectionClicked.attach(function(sender, args) {
       _this.centerMap(args);
    });
};

SearchController.prototype = {
    search: function() {
        var searchString = $("#searchString").val();
        if (searchString) {
            this._model.ajaxSearch(searchString);
        }
    },
    centerMap: function(args) {
         Map.getView().setCenter([args.easting, args.northing]);
    }
};

(function(){
   var mapModel = new MapModel('map'),
            mapView = new MapView(mapModel, {

             }),
            mapCcontroller = new BaseMapController(mapModel,  mapView);
            
        mapView.loadBaseMap();
        
        var searchModel = new SearchModel(),
            searchView = new SearchView(searchModel, {
                'searchButton' : $('#searchButton'),
                'mask': $('#mask')                
            }),
            searchController = new SearchController(searchModel, searchView);

})();
