/**
 * Proj4 definition of British National Grid
 */
proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
          '+x_0=400000 +y_0=-100000 +ellps=airy ' +
          '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
          '+units=m +no_defs');
var proj27700 = ol.proj.get('EPSG:27700');
proj27700.setExtent([0, 0, 700000, 1300000]);


Geoserver = function() {

    var selectedResns = [];
    var selectedSizes = [];
    var selectedLayers = [];
    var resolutionLookup = {
        "openspace:miniscaleR": [200.0, 200],   // Miniscale reduced - shrunk Route Planner
        "openspace:miniscale": [100.0, 200],    // Miniscale - Route Planner
        "openspace:250Kresampled": [50.0, 200],  // Roadbook reduced - shrunk Roadbook with relief
        "openspace:250K": [25.0, 200],   // Roadbook - Roadbook with relief
        "openspace:50Kresampled": [10.0, 200],   // 1:50K reduced - shrunk 1:50K mapping
        "openspace:50K": [5.0, 200],     // 1:50K - 1:50K mapping - zoom = 14
        "openspace:25K": [2.5, 200],    // Vector Map District reduced - shrunk VMD, no relief zoom - 15
        "openspace:openlocalresampled": [2.0, 250],     // Street View reduced - shrunk Street atlas, no relief
        "openspace:openlocal": [1.0, 250]       // Street - Street atlas, no relief
    };

    $.each(resolutionLookup, function (key, value) {
        selectedResns.push(resolutionLookup[key][0]);
        selectedSizes.push(resolutionLookup[key][1]);
        selectedLayers.push(key);
    });

    this.options = {
        url: 'http://aam-msws02:8080/geoserver/openspace/wms',
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
        title: "Ordnance Survey",
        type: 'base',
        source: source,
        opacity: 1.0,
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
Geoserver.prototype.getLayer = function () {
    return this.layer;
};

/**
* get the base layer's source
* @return {ol.source.TileWMS} the source of the layer
*/
Geoserver.prototype.getSource = function () {
    return this.source;
};

/**
* get the base layer's resolutions
* @return {[number]} the resolutions available
*/
Geoserver.prototype.getResolutions = function () {
   return this.source.getTileGrid().getResolutions();
};

/**
* get the layer's max resolution
* @return {number} the max resolution available (lowest zoom)
*/
Geoserver.prototype.getMaxResolution = function () {
    return this.getResolutions()[0];
};

/**
* get the base layer's min resolution
* @return {number} the min resolution available (highest zoom)
*/
Geoserver.prototype.getMinResolution = function () {
    var resns = this.getResolutions();
    return resns[resns.length - 1];
};

/**
* get the base layer's projection
* @return {ol.proj.Projection} the layer's projection
*/
Geoserver.prototype.getProjection = function () {
    return this.source.getProjection();
};