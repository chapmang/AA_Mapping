
/* This code by Bill Chadwick with some inspiration from Peter Robins - Feb 2015 */
/* Use it for what you like */


proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
          '+x_0=400000 +y_0=-100000 +ellps=airy ' +
          '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
          '+units=m +no_defs');
var proj27700 = ol.proj.get('EPSG:27700');
proj27700.setExtent([0, 0, 700000, 1300000]);


/**
* @constructor
* @extends {ol.control.Control}
* @param {string} key API key.
* @param {string} url API url registered for key.
* @param {[string] | null} set of layers to be used, in zoom order 
*/


function OpenSpaceOl3(key, url, selectedLayers) {

    this.key = encodeURI(key);
    this.url = encodeURI(url);
    this.nameKey = encodeURI('7RMiHYWnIYnLioRBeDJYGIZrMAs6xfEF');

    var resolutionLookup = {
        "OV0": [2500.0, 200],  // OverView 0 - very small UK image, no text
        "OV1": [1000.0, 200],  // OverView 1 - UK image with some names
        "OV2": [500.0, 200],   // Overview 2 - larger UK image with some names
        "MSR": [200.0, 200],   // Miniscale reduced - shrunk Route Planner
        "MS": [100.0, 200],    // Miniscale - Route Planner
        "250KR": [50.0, 200],  // Roadbook reduced - shrunk Roadbook with relief 
        "250K": [25.0, 200],   // Roadbook - Roadbook with relief 
        "50KR": [10.0, 200],   // 1:50K reduced - shrunk 1:50K mapping
        "50K": [5.0, 200],     // 1:50K - 1:50K mapping
        "VMDR": [4.0, 250],    // Vector Map District reduced - shrunk VMD, no relief
        "VMD": [2.5, 200],     // Vector Map District - VMD, no relief
        "SVR": [2.0, 250],     // Street View reduced - shrunk Street atlas, no relief
        "SV": [1.0, 250]       // Street - Street atlas, no relief
    };

    var layers = selectedLayers || OpenSpaceOl3.DEFAULT_LAYERS;

    if (!$.isArray(layers)) {
        layers = OpenSpaceOl3.DEFAULT_LAYERS;
    }

    var selectedResns = [];
    var selectedSizes = [];

    $.each(layers, function (i, item) { selectedResns.push(resolutionLookup[item][0]); selectedSizes.push(resolutionLookup[item][1]); });

    this.options = {
        url: 'http://openspace.ordnancesurvey.co.uk/osmapapi/ts',
        params: {
            'VERSION': '1.1.1',
            'LAYERS': selectedResns[0], // initial value, this needs to change to match the resolution of tiles being fetched
            'KEY': this.key,
            'URL': this.url // registered URL should match the API key
        },
        attributions: [new ol.Attribution({
            html: '&copy; Crown copyright [and database rights] 2015 OS EUL100056657. Use of this data is subject to <a class="terms" href="#">terms and conditions.</a><br/>'+
                '&copy; Local Government Information House Limited copyright and database rights 2015 EUL100056657<br/>'+
                'Topo maps &copy; Crown copyright and database rights ' +
                new Date().getFullYear() +
                ' <span style="white-space: nowrap;">Ordnance Survey.</span>' +
                '&nbsp;&nbsp;<span style="white-space: nowrap;">' +
                '<a href="http://openspace.ordnancesurvey.co.uk/openspace/developeragreement.html#enduserlicense"' +
                'target="_blank">End User License Agreement</a></span>'
        })],
        //logo: 'http://openspace.ordnancesurvey.co.uk/osmapapi/img_versions/img_4.0.0/OS/poweredby_free.png',
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
        minResolution: selectedResns[selectedResns.length],
        maxResolution: selectedResns[0] + 0.001
    });

    // Sort of override the URL generation function to set the LAYERS parameter from the resolution.
    // The map's resolution change event can not be used os ol3 may pre-fetch tiles at adjacent zoom levels.
    var originalTileUrlFunc = source.getTileUrlFunction();
    this.source.setTileUrlFunction(function (tileCoord, pixelRatio, projection) {

        // for 'free' OS OpenSpace the LAYERS param needs to be equal to the resolution
        var z = tileCoord[0];
        var res = selectedResns[z];
        source.updateParams({ LAYERS: res });

        // call superclass
        return originalTileUrlFunc(tileCoord, pixelRatio, projection);
    });

    /**
    * @constructor The terms of use of the OS OpenSpace API require that the OpenSpace logo is displayed
    * @extends {ol.control.Control}
    * @param {Object=} opt_options Control options.
    */
    OpenSpaceOl3.OpenSpaceLogoControl = function (opt_options) {

        var options = opt_options || {};

        var image = document.createElement('img');
        image.src = 'http://openspace.ordnancesurvey.co.uk/osmapapi/img_versions/img_4.0.0/OS/poweredby_free.png';

        var element = document.createElement('div');
        // by default, the logo's position on the map is set by the openspaceol3-openspace-logo css in your .html/.css file
        element.className = options.className || 'openspaceol3-openspace-logo';
        element.className += ' ol-unselectable ol-control';
        element.appendChild(image);

        ol.control.Control.call(this, {
            element: element,
            target: options.target
        });

    };

    OpenSpaceOl3.CustomZoom = function(opt_options) {
        
        var options = opt_options || {};

        var myButton = document.createElement('div');
        myButton.innerHTML = '+';

        var element = document.createElement('div');
        element.className = options.className || 'custom-zoom ';
        element.className += ' ol-unselectable ol-control';
        element.appendChild(myButton);

        ol.control.Control.call(this,{
            element: element,
            target: options.target
        });
    };
    ol.inherits(OpenSpaceOl3.CustomZoom, ol.control.Control);
    // OpenSpaceOl3.LayerSwitcher = function (opt_options) {

    //     var options = opt_options || {};

    //     var button = document.createElement('button');
    //     button.innerHTML = 'Layers';

    //     var this_ = this;
    //     var handleLayerSwitcher = function(e) {
    //         e.preventDefault();
    //         $("#wrapper").toggleClass("toggled");
    //     };

    //     button.addEventListener('click', handleLayerSwitcher, false);
    //     button.addEventListener('touchstart', handleLayerSwitcher, false);

    //     var element = document.createElement('div');
    //     // by default, the logo's position on the map is set by the openspaceol3-openspace-logo css in your .html/.css file
    //     element.className = options.className || 'openspaceol3-layerSwitcher';
    //     element.className += ' ol-unselectable ol-control';
    //     element.appendChild(button);

    //     ol.control.Control.call(this, {
    //         element: element,
    //         target: options.target
    //     });

    // };
    ol.inherits(OpenSpaceOl3.OpenSpaceLogoControl, ol.control.Control);
    ol.inherits(OpenSpaceOl3.CustomZoom, ol.control.Control);
    // ol.inherits(OpenSpaceOl3.LayerSwitcher, ol.control.Control);
}




/**
* {[string]} DEFAULT_LAYERS the normal set of products for the free OpenSpace service
*/
OpenSpaceOl3.DEFAULT_LAYERS = ["OV0", "OV1", "OV2", "MSR", "MS", "250KR", "250K", "50KR", "50K", "SVR", "SV"];

/**
* {[string]} ALL_LAYERS the full set of products for the free OpenSpace service, 
* adds Vector Map District ontop of the DEFAULT_LAYERS 
*/
OpenSpaceOl3.ALL_LAYERS = ["OV0", "OV1", "OV2", "MSR", "MS", "250KR", "250K", "50KR", "50K", "VMDR", "VMD", "SVR", "SV"];


/**
* get the layer
* @return {ol.layer.Tile} the layer for adding to a map
*/
OpenSpaceOl3.prototype.getLayer = function () {
    return this.layer;
};

/**
* get the layer's source
* @return {ol.source.TileWMS} the source of the layer
*/
OpenSpaceOl3.prototype.getSource = function () {
    return this.source;
};

/**
* get the layer's resolutions
* @return {[number]} the resolutions available
*/
OpenSpaceOl3.prototype.getResolutions = function () {
    return this.source.getTileGrid().getResolutions();
};

/**
* get the layer's max resolution
* @return {number} the max resolution available (lowest zoom)
*/
OpenSpaceOl3.prototype.getMaxResolution = function () {
    return this.getResolutions()[0];
};

/**
* get the layer's min resolution
* @return {number} the min resolution available (highest zoom)
*/
OpenSpaceOl3.prototype.getMinResolution = function () {
    var resns = this.getResolutions();
    return resns[resns.length - 1];
};

/**
* get the layer's projection
* @return {ol.proj.Projection} the layer's projection
*/
OpenSpaceOl3.prototype.getProjection = function () {
    return this.source.getProjection();
};


/**
* get a gazetteer query URL for a json response, 
* none, one or many results may be returned
* @param {string} query the item to search for in the gazetteer
* @return {string} the url for a gazetteer query
*/
OpenSpaceOl3.prototype.getGazetteerQueryUrl = function (query) {
    return "https://api.ordnancesurvey.co.uk/opennames/v1/find?query=" +
        encodeURI(query) +
        "&key=" +
        this.nameKey;
};



/**
* Async gazetteer query, requests are cached
* @param {string} code the postcode to search for
* @param {function} callback passed [] (no results) or [{loc:[east,north],desc:text}] (one or more results)
*/
OpenSpaceOl3.prototype.asyncGazetteerQuery = function (search, callback) {

    $.getJSON(this.getGazetteerQueryUrl(search), function(data){
        console.log(data);
    });
    // $.ajax({
    //     url: this.getGazetteerQueryUrl(search),
    //     dataType: 'jsonp',
    //     cache: true,
    //     error: function () {
    //         callback([]);
    //     },
    //     success: function (data) {

    //         var ret = [];
    //         try {
    //             var pushItem = function (item) {
    //                 var l = item.location;
    //                 var p = l["gml:Point"];
    //                 var g = p["gml:pos"];
    //                 var e = parseInt(g.split(' ')[0], 10);
    //                 var n = parseInt(g.split(' ')[1], 10);
    //                 if ((!isNaN(e)) && (!isNaN(n))) {
    //                     ret.push({ loc: [e, n], desc: item.name + ", " + item.county + ", " + item.type });
    //                 }
    //             };
    //             if (data.GazetteerResult.items.Item) {
    //                 if ($.isArray(data.GazetteerResult.items.Item)) {
    //                     $.each(data.GazetteerResult.items.Item, function (i, item) { pushItem(item); });
    //                 } else {
    //                     pushItem(data.GazetteerResult.items.Item);
    //                 }
    //             }
    //         } catch (ignore) {
    //         }
    //         callback(ret);
    //     }
    // });
};
