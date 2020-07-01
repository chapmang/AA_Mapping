/**
 * Detect support for drag and drop file upload
 */
var isAdvancedUpload = function() {
  var div = document.createElement('div');
  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();


var form = document.getElementsByClassName('box')[0];

var handleFiles = function(e) {
    
    var loadedFeatures;
    var files;

    // Fetch files from upload
    if (e.dataTransfer) {
        files = e.dataTransfer.files; // drag and drop
    } else {
        files = e.target.files; // standard upload form 
    }

    var filename = files[0].name.toLowerCase(),
        filesize = files[0].size,
        maxsize = 1024 * 1024; // 1mb

    // Crude check on file type and size
    if (filename.length < 5 || filename.substring(filename.length - 4 ) != '.gpx') {
        alert ('Not a GPX file');
        return;
    } else {
        var fileFormat = new ol.format.GPX();
    }

    if (filesize > maxsize) {
        alert('File is too big!');
        return;
    }

    // Read files using FileReader Interface
    for (var i = 0, f; f = files[i]; i++){
         var reader = new FileReader();
         console.log(files[i]);
        reader.readAsText(files[i], "UTF-8");
        reader.onload = function(evt) {
            // reproject to OS BNG (ESPG:27700) requires Proj4 and definition from geoserver-ol2.js
            loadedFeatures = fileFormat.readFeature(evt.target.result, {
                dataProjection:'EPSG:4326',
                featureProjection:'EPSG:27700'
            });


            // Set of generic styles for shoing variuos geometry types
            var defaultStyle = {
                'Point': new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color: 'rgba(255,255,0,0.5)'
                        }),
                        radius: 5,
                        stroke: new ol.style.Stroke({
                            color: '#ff0',
                            width: 1
                        })
                    })
                }),
                'LineString': new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#f00',
                        width: 3
                    })
                }),
                'Polygon': new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(0,255,255,0.5)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#0ff',
                        width: 1
                    })
                }),
                'MultiPoint': new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color: 'rgba(255,0,255,0.5)'
                        }),
                        radius: 5,
                        stroke: new ol.style.Stroke({
                            color: '#f0f',
                            width: 1
                        })
                    })
                }),
                'MultiLineString': new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#0f0',
                        width: 3
                    })
                }),
                'MultiPolygon': new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(0,0,255,0.5)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#00f',
                        width: 1
                    })
                })
            };

            // Apply defualt style based upon feature's geometry type
            loadedFeatures.setStyle(defaultStyle[loadedFeatures.getGeometry().getType()]);

            // Add features to source then apply to layer
            // layer created in aaMapViewer.js
            var loadedFeaturesSource = new ol.source.Vector({
                features: [loadedFeatures],
            });
            routeLayer.setSource(loadedFeaturesSource);

            // Adjust view to take sidebar into account when centering on feature
            var sidebar = document.getElementById('sidebar-wrapper');
            var paddingValues = [];
            if (sidebar.classList.contains("toggled")) {
                paddingValues = [0,0,0,0];
            } else {
                paddingValues = [0,0,0, 425]
            }

            // Pan and scale to loaded feature
            map.getView().fit(loadedFeatures.getGeometry(), {padding: paddingValues});
        }
    }
}

/**
 * Set up event listeners for appropriate file upload methods
 */
if (isAdvancedUpload) {
    form.classList.add("has-advanced-upload");

    ("drag dragstart dragend dragover dragenter dragleave drop".split(" ")).forEach(function(e){
        form.addEventListener(e,function(e){
            e.preventDefault();
            e.stopPropagation();
        })
    });

    ("dragover dragenter".split(" ")).forEach(function(e){
        form.addEventListener(e,function(){
            form.classList.add('is-dragover');
        }, false);
    });
    ("dragleave dragend drop".split(" ")).forEach(function(e){
        form.addEventListener(e,function(){
            form.classList.remove('is-dragover');
        }, false);
    });
    
    form.addEventListener('drop', handleFiles, false);
    form.addEventListener('change', handleFiles, false);
    
} else {
    form.addEventListener('change', handleFiles, false);
}


