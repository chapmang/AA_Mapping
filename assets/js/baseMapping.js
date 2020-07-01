
/* Simple example of OS Map + Gazetteer and Postcode lookup, all coordinates in EPSG:27700 */

/* to restrict the set of layers avalable use e.g. ["50KR", "50K", "SVR", "SV"] as the final constructor parameter */
/* See the OpenSpaceOl3 source code for a list of available layers */
//
//


var openSpaceOl3 = new OpenSpaceOl3('928472B021EA53D0E0405F0ACA603CF9', document.URL, OpenSpaceOl3.ALL_LAYERS);

var getFeatureText = function (feature) {
    return feature.get("Name");
};
// 
var container = document.getElementById('popup');

var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
}));

var map = new ol.Map({
    layers: [
        openSpaceOl3.getLayer(),
        new ol.layer.Tile({
            source: new ol.source.OSM(),
            title: "OpenStreetMap",
            visible: false
        }),
    ],
    overlays: [
        overlay
    ],
    logo: false,
    target: 'map',
    controls: ol.control.defaults({
        attributionOptions: ({
            collapsible: true
        })
    }).extend([
    new OpenSpaceOl3.OpenSpaceLogoControl({ className: 'openspaceol3-openspace-logo' }),
    ]),
    view: new ol.View({
        projection: 'EPSG:27700',
        center: [456245, 146500], // OS coords
        // resolutions: openSpaceOl3.getResolutions(),
        resolution: 5.0,
        maxZoom: 13,
        minZoom: 2,
        extent: [0, 0, 700000, 1300000]
    })
});


var getCoords = function(feature) {
    var geometry = feature.getGeometry();
    var geometryType = geometry.getType();
    if ( geometryType === 'Point') {
        return geometry.getCoordinates();
        // feature = feature.get('features');
    } else if(geometryType === 'Line' || geometryType === 'Polygon'){
        var a = geometry.getExtent();
        return ol.extent.getCenter(a);
    }
};


$('#sidebar-icon').on('click', function(e){
    e.preventDefault();
    $('body').toggleClass("toggled");

});

$('#sidebar-wrapper ul li').on('click', function(e){
    e.preventDefault();
    $('#sidebar-wrapper ul li').toggleClass("toggled");
    $('#sidebar-content form').toggleClass("toggled");
});

var layers = map.getLayers().getArray();
for (var i = 0 ; i < layers.length; i++) {
    var title = layers[i].get('title');
    if ( title === undefined) { continue; }
    var visibility = layers[i].get('visible');
    if (visibility === true) {
        var status = 'eye-open';
    } else {
        var status = 'eye-close';
    }
    var legend = title.replace(/\s+/g, '');
    $('.sidebar-nav').append("<tr class='layerName' data-title='"+title+"'><td>"+title+"</td>"+
        "<td><span class='glyphicon glyphicon-"+status+"' aria-hidden='true'></span></td></tr>");
}

function findBy(layer, key, value) {

    if (layer.get(key) === value) {
        return layer;
    }

    // Find recursively if it is a group
    if (layer.getLayers) {
        var layers = layer.getLayers().getArray(),
            len = layers.length,
            result;
        for (var i = 0; i < len; i++) {
            result = findBy(layers[i], key, value);
            if (result) {
                return result;
            }
        }
    }

    return null;
}

$('.layerName').on('click', function(){
    var layerName =  $(this).data('title');
    var layer = findBy(map.getLayerGroup(), 'title', layerName);
    var visibility = !layer.getVisible();
    layer.setVisible(!layer.getVisible());
    if (visibility) {
            $(this).find('span').removeClass('glyphicon-eye-close')
                .addClass('glyphicon-eye-open');
        } else {
            // Else the layer is not visible.
            $(this).find('span').removeClass('glyphicon-eye-open')
                .addClass('glyphicon-eye-close');
        }
});

$(".ol-attribution").on('click', '.terms', function() {
    var dialog = {
        dialogID: "termsModal",
        dialogContentID: "termsConditions",
        dialogContentClass: "termsConditions",
        dialogContent: "<a href='#' class='close'><span class='glyphicon glyphicon-remove-circle' aria-hidden='true'></a><h3>Terms and Conditions</h3><br/>You are granted a non-exclusive, royalty free,"+
        " revocable licence solely to view the Licensed Data for non-commercial purposes for the period during which"+
        " North Waltham Parish Council makes it available. You are not permitted to copy, sub-license, distribute,"+
        " sell or otherwise make available the Licensed Data to third parties in any form."+
        " Third party rights to enforce the terms of this licence shall be reserved to OS."
    };
    UserInterface.renderDialog(dialog);
    UserInterface.modal();
});


$("#search-form").submit(function (e) {

    var search = $("#search-query").val();
    $('#result-select').find('option').remove(); // clear combo

    openSpaceOl3.asyncGazetteerQuery(search, function (data) {
        if (data.length > 0) {
            $("#result-select").append("<option value='select'>Select a result</option>");
            $.each(data, function (i, item) {
                $("#result-select").append("<option value='" + item.loc[0] + " " + item.loc[1] + "'>" + item.desc + "</option>");
            });
        }
        else {
            $("#result-select").append("<option value='select'>Not found</option>");
        }
    });

    return false; // don't submit 

});

$('#conv_convertCoordinates').on('click', function(e) {
    e.preventDefault();
    var finalEasting,
        finalNorthing,
        finalLatitude,
        finalLongitude,
        finalGridRef;
    var TranMerConversion = new jsCoordinateConverter.TranMerConversion();
    var osng = new jsCoordinateConverter.OSNGConversions();

    if ($('#gridRef').val()) {
        var gridRef = $('#gridRef').val();
        var cleanGridRef = gridRef.replace(/\s+/g, '');
        var reg = new RegExp("^((([sS]|[nN])[a-hA-Hj-zJ-Z])|(([tT]|[oO])[abfglmqrvwABFGLMQRVW])|([hH][l-zL-Z])|([jJ][lmqrvwLMQRVW]))([0-9]{2}){3}");
        console.log(cleanGridRef);
        if (reg.exec(cleanGridRef)){
            console.log('good');
        } else {
            console.log('bad');
        }

    } else if ($('#easting').val() && $('#northing').val()) {
        
        finalEasting = Math.round($('#easting').val());
        finalNorthing = Math.round($('#northing').val());
        

        var grid = new eastNorthValues(finalEasting, finalNorthing, 0);
        var loc = new lonLatPoint(TranMerConversion.enToLonLat(grid, "OSNG", "AIRY_1830"));
        var converted = jsCoordinateConverter.transform(loc.lon, loc.lat, 0, "OSGB36", "WGS84");

        finalLatitude = Math.round(converted.getYAxis()*Math.pow(10,6))/Math.pow(10,6);
        finalLongitude = Math.round(converted.getXAxis()*Math.pow(10,6))/Math.pow(10,6);
        finalGridRef = osng.gridrefNumToLet(finalEasting, finalNorthing, 10);

    } else if ($('#latWGS84').val() && $('#lonWGS84').val()) {

        finalLatitude = $('#latWGS84').val();
        finaLongitude = $('#lonWGS84').val();
        var coordinates = new lonLatValues(finaLongitude, finalLatitude, 0);
        var pt = new ENPoint(TranMerConversion.latLonToEN(coordinates, "OSNG", "AIRY_1830"));
        finalEasting = Math.round(pt.east);
        finalNorthing = Math.round(pt.north);
        finalGridRef = osng.gridrefNumToLet(pt.east, pt.north, 10);
        
    }

    $('#gridRef').val("OS Grid Reference: "+finalGridRef);
    $('#easting').val("Easting: "+finalEasting);
    $('#northing').val("Northing: "+finalNorthing);
    $('#latWGS84').val("Latitude: "+finalLatitude);
    $('#lonWGS84').val("Longitude: "+finalLongitude);
    map.getView().setCenter([finalEasting, finalNorthing]);

});


jsCoordinateConverter.transform = function (lon, lat, height, fromDatum, toDatum) {
    
    var coordinates = new lonLatValues(lon, lat, height);
    var datumConverter = new jsCoordinateConverter.DatumConversion(fromDatum);

    return datumConverter.convert(coordinates, toDatum);
};




// pan to selected result
$('#result-select').change(function () {
    var strCoords = $(this).find(':selected').val().split(' ');
    if (strCoords.length == 2) {
        map.getView().setCenter([parseInt(strCoords[0],10), parseInt(strCoords[1],10)]);
    }
});






// // MODAL BOX HANDLERS
//     // If close/cancel button is clicked
//     $(document).on('click', '#termsConditions a.close', function (e){
//         e.preventDefault();
//         $('#mask').hide();
//         $('.window').detach();
//     });

//     // If mask is clicked
//     $(document).on('click', '#mask', function () {
//         $(this).hide();
//         $('.window').detach();
//     });

//     // If the browser window is re-sized with Modal open
//     $(window).resize(function () {
//         var box = $('.window');
//         //Get the screen height and width
//         var maskHeight = $(document).height();
//         var maskWidth = $(window).width();
//         //Set height and width to mask to fill up the whole screen
//         $('#mask').css({'width':maskWidth,'height':maskHeight});
//         //Get the window height and width
//         var winH = $(window).height();
//         var winW = $(window).width();
//         //Set the popup window to center
//         box.css('top',  winH/3 - box.height()/2);
//         box.css('left', winW/2 - box.width()/2);
//     });

// /* --------------------------------------------------
//  * Utility for building a modal box
//  * -------------------------------------------------- */
// var UserInterface ={};

// UserInterface.modal = function (e){
//     //Get the A tag
//     var id = $("#mask").prev().attr('id');
//     //Get the screen height and width
//     var maskHeight = $(document).height();
//     var maskWidth = $(window).width();
//     //Set height and width to mask to fill up the whole screen
//     $('#mask').css({'width':maskWidth,'height':maskHeight});
//     //transition effect
//     $('#mask').show();
//     //$('#mask').fadeTo("slow",0.8);
//     //Get the window height and width
//     var winH = $(window).height();
//     var winW = $(window).width();
//     //Set the popup window to center
//     $("#"+id).css('top',  winH/3-$("#"+id).height()/2);
//     $("#"+id).css('left', winW/2-$("#"+id).width()/2);
//     //transition effect
//     $("#"+id).show();
// };
// UserInterface.renderDialog = function (dialog) {
//     var dialogBox = document.createElement("div");
//     dialogBox.setAttribute('id', dialog.dialogID);
//     dialogBox.setAttribute('class', dialog.dialogClass+" window clearfix");

//     if (dialog.dialogClose) {
//         var dialogClose = document.createElement("div");
//         dialogClose.setAttribute('class', ' close');
//         dialogClose.innerHTML = "&times;";
//         dialogBox.appendChild(dialogClose);
//     }

//     if (dialog.dialogHeader) {
//         var dialogHeader = document.createElement("h2");
//         dialogHeader.innerHTML = dialog.dialogHeader;
//         dialogBox.appendChild(dialogHeader);
//     }

//     if (dialog.form) {
//         var dialogForm = document.createElement("div");
//         dialogForm.setAttribute('class', ' fill');
//         dialogForm.innerHTML = dialog.dialogForm;
//         dialogBox.appendChild(dialogForm);
//     }

//     if (dialog.dialogContent) {
//         var dialogContent = document.createElement("div");
//         if (typeof dialog.dialogContentID != 'undefined') {
//             dialogContent.setAttribute('id', dialog.dialogContentID);
//         } else {
//             dialogContent.setAttribute('id','dialogContentID');
//         }
//         if (typeof dialog.dialogContentClass != 'undefined') {
//             dialogContent.setAttribute('class', dialog.dialogContentClass);
//         } else {
//             dialogContent.setAttribute('class','dialogContentClass');
//         }
//         dialogContent.innerHTML = dialog.dialogContent;
//         dialogBox.appendChild(dialogContent);
//     }

//     $("#mask").before(dialogBox);
// };
