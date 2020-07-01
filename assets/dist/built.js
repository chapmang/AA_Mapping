// Utility function to convert degrees to radians
Math.deg2Rad = function(degrees) {
	return degrees * Math.PI / 180;
};

// Utility function to convert radians to degrees
Math.rad2Deg = function(radians) {
	return radians * 180 / Math.PI;
};

function jsCoordinateConverter () {}

jsCoordinateConverter.Utility = {

	invertSign : function(number) {

		if (!isNaN(parseFloat(number)) && isFinite(number)) {
			var invertedNumber = number * -1;
			return invertedNumber;
		} else {
			return number;
		}	
	},

	recursiveLoop : function (object, method) {
		for (var property in object) {
			if (object.hasOwnProperty(property)) {

				if (typeof object[property] == 'object') {
						this.recursiveLoop(object[property], method);
				} else {
					object[property] = jsCoordinateConverter.Utility[method](object[property]);
				}
			}
		}

		return object;
	}
};
// Coordinate Abstract Class
var Coordinates = function() {

	var xAxis = 0;
	var yAxis = 0;
	var zAxis = 0;

	if (this.constructor === Coordinates) {
		throw new Error("Cannot create and instance of an abstract class");
	}

	this.setCoordinates = function(x, y, z) {
	
		this.isNumeric = function(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		};

		if (this.isNumeric(x)) {
			xAxis = x;
		} else {
			throw new Error("x-Axis must be numeric");
		}

		if (this.isNumeric(y)) {
			yAxis = y;
		} else {
			throw new Error("y-Axis must be numeric");
		}

		if (this.isNumeric(z)) {
			zAxis = z;
		} else {
			throw new Error("z-Axis must be numeric");
		}

		return;
	};

	this.getXAxis = function() {
		return xAxis;
	};
	this.getYAxis = function() {
		return yAxis;
	};
	this.getZAxis = function() {
		return zAxis;
	};

	
};


var eastNorthValues = function(easting, northing, height) {

	Coordinates.apply(this, arguments);
	this.setCoordinates(easting, northing, height);
};

eastNorthValues.prototype = Object.create(Coordinates.prototype);
eastNorthValues.prototype.constructor = eastNorthValues;

var lonLatValues = function(longitude, latitude, height) {

	Coordinates.apply(this, arguments);
	this.setCoordinates(longitude, latitude, height);
};

lonLatValues.prototype = Object.create(Coordinates.prototype);
lonLatValues.prototype.constructor = lonLatValues;

var xyzValues = function(x, y, z) {

	Coordinates.apply(this, arguments);
	this.setCoordinates(x, y, z);
};

xyzValues.prototype = Object.create(Coordinates.prototype);
xyzValues.prototype.constructor = xyzValues;
var projectionConstants = {
	OSNG : {
			F0 : 0.9996012717,	// NatGrid scale factor on central meridian
			lat0 : 49.0,		// NatGrid true origin - Latitude
			lon0 : -2.0,		// NatGrid true origin - Longitude
			N0 : -100000,		// Northing of true origin (metres)		
			E0 : 400000,		// Easting of true origin (meters)
		}
};

var ellipsoidConstants = {
	AIRY_1830 : {
		a : 6377563.396,	// Semi-major axis (metres)
		b : 6356256.909,	// Semi-minor axis (metres)
	},
	GRS80 : {
		a: 6378137.0,		// Semi-major axis (metres)
		b: 6356752.3141		// Semi-minor axis (metres)
	},
	WGS_84 : {
		a: 6378137.0,		// Semi-major axis (metres)
		b: 6356752.3141		// Semi-minor axis (metres)
	}
};

var datumConstants = {
    OSGB36: {
        name : "Ordnance Survey - Great Britain (1936)",
        synonyms : "OSGB",
        epsg_id : "4277",
        esri_name : "D_OSGB_1936",
        defaultRegion : "GB_Great_Britain",
        referenceEllipsoid : "AIRY_1830",
        regions : {
            GB_Great_Britain : {
                translationVectors : {
                    x : -446.448,
                    y : +125.157,
                    z : -542.06,
                },
                translationVectorsUOM : "meters",
                rotationMatrix : {
                    x : -0.1502,
                    y : -0.247,
                    z : -0.8421,
                },
                rotationMatrixUOM : "ARCSECONDS",
                scaleFactor : 20.4894    //  ppm
            },
        },
    },

	WGS84 : {//    Global GPS
        name : "WGS 1984",
        epsg_id : "4326",
        esri_name : "D_WGS_1984",
        defaultRegion : "Global_Definition",
        referenceEllipsoid : "WGS_84",
        regions :  {
             Global_Definition : {
                translationVectors : {
                    x : 0.0,
                    y : 0.0,
                    z : 0.0,
                },
                translationVectorsUOM : "meters",
                rotationMatrix : {
                    x : 0.0,
                    y : 0.0,
                    z : 0.0,
                },
                rotationMatrixUOM : "ARCSECONDS",
                scaleFactor : 0.0    //  ppm
            },
        },
    }
};
jsCoordinateConverter.TranMerConversion = function () {};


jsCoordinateConverter.TranMerConversion.prototype.meridionalArc = function (b, F0, n, lat, lat0) {
	
	var Ma = (1 + n + ((5 / 4) * Math.pow(n, 2)) + ((5 / 4) * Math.pow(n, 3))) * (lat - lat0);
  	var Mb = ((3 * n) + (3 * Math.pow(n, 2)) + ((21 / 8) * Math.pow(n, 3))) * Math.sin(lat - lat0) * Math.cos(lat + lat0);
  	var Mc = ((15 / 8) * Math.pow(n, 2) + (15 / 8) * Math.pow(n, 3)) * Math.sin(2 * (lat - lat0)) * Math.cos(2 * (lat + lat0));
  	var Md = (35 / 24) * Math.pow(n, 3) * Math.sin(3 * (lat - lat0)) * Math.cos(3 * (lat + lat0));
  	var M = b * F0 * (Ma - Mb + Mc - Md);

  	return M;
};

jsCoordinateConverter.TranMerConversion.prototype.eccentricitySquared = function(a,b) {

	var e2 = 1 - Math.pow(b, 2) / Math.pow(a, 2);
	return e2;
};

jsCoordinateConverter.TranMerConversion.prototype.latLonToEN = function(coordinates, projectionCode, ellipsoidCode) {

	var projection = projectionConstants[projectionCode];
	var ellipoid = ellipsoidConstants[ellipsoidCode];

	var lon = Math.deg2Rad(coordinates.getXAxis());
	var lat = Math.deg2Rad(coordinates.getYAxis());

	var F0 = projection.F0;
	var lon0 = Math.deg2Rad(projection.lon0);
	var lat0 = Math.deg2Rad(projection.lat0);
	var N0 = projection.N0;
	var E0 = projection.E0;
	var a = ellipoid.a;
	var b = ellipoid.b;
	var e2 = this.eccentricitySquared(a,b);
	var n = (a - b) / (a + b);


	var cosLat = Math.cos(lat);
	var sinLat = Math.sin(lat);
	var tanLat = Math.tan(lat);
	var nu = a * F0 * (Math.pow(1 - e2 * Math.pow(sinLat, 2), -0.5));
	var rho = a * F0 * (1 - e2) * Math.pow(1 - e2 * Math.pow(sinLat, 2), -1.5);
	var eta2 = (nu / rho) - 1;

	var M = this.meridionalArc(b, F0, n, lat, lat0);	

	var I = M + N0;
	var II = (nu / 2) * sinLat * cosLat;
	var III = (nu / 24) * sinLat * Math.pow(cosLat, 3) * (5 - Math.pow(tanLat, 2) + 9 * eta2);
	var IIIA = (nu / 720) * sinLat * Math.pow(cosLat, 5) * (61 - 58 * Math.pow(tanLat, 2) + Math.pow(tanLat, 4));
	var IV = nu * cosLat;
	var V = (nu / 6) * Math.pow(cosLat, 3) * (nu / rho - Math.pow(tanLat, 2));
	var VI = (nu / 120) * Math.pow(cosLat, 5) * (5 - 18 * Math.pow(tanLat, 2) + Math.pow(tanLat, 4) + 14 * eta2 - 58 * Math.pow(tanLat, 2) * eta2);

	var dLon = lon - lon0;

	var N = I + II * Math.pow(dLon, 2) + III * Math.pow(dLon, 4) + IIIA * Math.pow(dLon, 6);
	var E = E0 + IV * dLon + V * Math.pow(dLon, 3) + VI * Math.pow(dLon, 5);

	return new eastNorthValues(E, N, 0);
};

jsCoordinateConverter.TranMerConversion.prototype.enToLonLat = function(coordinates, projectionCode, ellipsoidCode) {

	var E = coordinates.getXAxis();
	var N = coordinates.getYAxis();

	var projection = projectionConstants[projectionCode];
	var ellipoid = ellipsoidConstants[ellipsoidCode];

	var a = ellipoid.a;
	var b = ellipoid.b;
	var F0 = projection.F0;
	var lat0 = Math.deg2Rad(projection.lat0);
	var lon0 = Math.deg2Rad(projection.lon0);
	var N0 = projection.N0;
	var E0 = projection.E0;
	var e2 = this.eccentricitySquared(a,b);
	var n = (a - b) / (a + b);
	var n2 = n*n;
	var n3 = n*n*n;

	var lat1 = lat0;
	var M = this.meridionalArc(b, F0, n, lat1, lat0);

	do {
		lat1 = (N - N0 - M) / (a * F0) + lat1;
		// var Ma = (1 + n + (5/4)*n2 + (5/4)*n3) * (lat1-lat0);
  //       var Mb = (3*n + 3*n*n + (21/8)*n3) * Math.sin(lat1-lat0) * Math.cos(lat1+lat0);
  //       var Mc = ((15/8)*n2 + (15/8)*n3) * Math.sin(2*(lat1-lat0)) * Math.cos(2*(lat1+lat0));
  //       var Md = (35/24)*n3 * Math.sin(3*(lat1-lat0)) * Math.cos(3*(lat1+lat0));
  //       M = b * F0 * (Ma - Mb + Mc - Md);              // meridional arc
		M = this.meridionalArc(b, F0, n, lat1, lat0);
	} while (N - N0 - M >= 0.00001);

	var cosLat1 = Math.cos(lat1);
	var sinLat1 = Math.sin(lat1);
	var tanLat1 = Math.tan(lat1);
	var nu = a * F0 * (Math.pow(1 - e2 * Math.pow(sinLat1, 2), -0.5));
	var rho = a * F0 * (1 - e2) * Math.pow(1 - e2 * Math.pow(sinLat1, 2), -1.5);
	var eta2 = (nu / rho) - 1;

	var VII = tanLat1 / (2 * rho * nu);
	var VIII = tanLat1 / (24 * rho * Math.pow(nu, 3)) * (5 + 3 * Math.pow(tanLat1, 2) + eta2 - 9 * Math.pow(tanLat1, 2) * eta2);
	var IX = tanLat1 / (720 * rho * Math.pow(nu, 5)) * (61 + 90 * Math.pow(tanLat1, 2) + 45 * Math.pow(tanLat1, 4));
	var X = (1 / cosLat1) / nu;
	var XI = (1 / cosLat1) / (6 * Math.pow(nu, 3)) * (nu / rho + 2 * Math.pow(tanLat1, 2));
	var XII = (1 / cosLat1) / (120 * Math.pow(nu, 5)) * (5 + 28 * Math.pow(tanLat1, 2) + 24 * Math.pow(tanLat1, 4));
	var XIIA = (1 / cosLat1) / (5040 * Math.pow(nu,7)) * (61 + 662 * Math.pow(tanLat1, 2) + 1320 * Math.pow(tanLat1, 4) + 720 * Math.pow(tanLat1, 6));

	var lat = lat1 - (VII * Math.pow((E - E0), 2)) + (VIII * Math.pow((E - E0), 4)) - (IX * Math.pow((E - E0), 6));
	var lon = lon0 + X * (E - E0) - XI * Math.pow((E - E0), 3) + XII * Math.pow((E - E0), 5) - XIIA * Math.pow((E - E0), 7);
	
	return new lonLatValues(Math.rad2Deg(lon), Math.rad2Deg(lat), 0);		
};

function ENPoint(location) {

	this.east = location.getXAxis();
	this.north = location.getYAxis();
}

function lonLatPoint(location) {

	this.lon = location.getXAxis();
	this.lat = location.getYAxis();
}


jsCoordinateConverter.DatumReference = function (datum, region) {
	

	var _datumReference;
	var _datumName;
	var _ellipsoidName;
	var _ellipsoid;
	var _helmertParameters;

	function _setHelmertParameters(region) {

		var regionParameters;

		if (typeof region === 'undefined') throw new Error('No region name set');

		var datum = _datumReference;

		if (datumConstants[datum].regions[region]) {
			regionParameters = datumConstants[datum].regions[region];
		} else {
			throw new Error(region + " is not a valid region for this datum");
		}

		_helmertParameters = {
			translationVectors : regionParameters.translationVectors,
			rotationMatrix : regionParameters.rotationMatrix,
			scaleFactor: regionParameters.scaleFactor
		};

		return;

	}

	this.setDatum = function (datum, region) {

		var datumConfig;

		if (typeof datumConstants[datum] !== 'undefined') {
			datumConfig = datumConstants[datum];
		} else {
			throw new Error(datum + " is not a valid datum");
		}

		if (typeof region === 'undefined' || region === null) {
			region = datumConfig.defaultRegion;
		}

		_datumReference = datum;
		_datumName = datumConfig.name;
		_ellipsoidName = datumConfig.referenceEllipsoid;
		_ellipsoid = ellipsoidConstants[_ellipsoidName];
		_setHelmertParameters(region);

		return this;
	};



	this.getDatumReference = function () {

		return _datumReference;
	};

	this.getEllipsoid = function () {

		return _ellipsoid;
	};

	this.getHelmertParameters = function () {

		return _helmertParameters;
	};

	if (typeof datum === 'undefined') {
		this.setDatum("WGS84", null);
	} else {
		this.setDatum(datum, region);
	}
	
};


jsCoordinateConverter.DatumConversion = function (fromDatum) {

	if (typeof fromDatum === 'undefined') {
		return "A source datum must be set";
	}

	this._fromDatum = new jsCoordinateConverter.DatumReference(fromDatum);
	this._fromEllipsoid = this._fromDatum.getEllipsoid();

	this.TranMerConversion = new jsCoordinateConverter.TranMerConversion();
};

jsCoordinateConverter.DatumConversion.prototype.getFromDatum = function(){
	return _fromDatum;
};


jsCoordinateConverter.DatumConversion.prototype.convert = function (coordinates, toDatum) {

	this._toDatum = new jsCoordinateConverter.DatumReference(toDatum);
	this._toEllipsoid = this._toDatum.getEllipsoid();

	var wgs84 = new jsCoordinateConverter.DatumReference("WGS84");

	// From WGS84
	if (this._fromDatum.getDatumReference() == wgs84.getDatumReference()) {
		this._toHelmert = this._toDatum.getHelmertParameters();
	}

	// To WGS84
	if (this._toDatum.getDatumReference() == wgs84.getDatumReference()){
		this._toHelmert = this._fromDatum.getHelmertParameters();
		this._toHelmert = jsCoordinateConverter.Utility.recursiveLoop(this._toHelmert, "invertSign");
	}

	// Neither to or from WGS84 so go via WGS84 as reference point
	if (this._toHelmert === undefined) {
		coordinates = this.convert(coordinates, "WGS84");
		this._toHelmert = this._toDatum.getHelmertParameters();
	}

	var source_xyz = this.toCartesian(coordinates);
	var destination_xyz = this.helmertTransformation(source_xyz.getXAxis(), source_xyz.getYAxis(), source_xyz.getZAxis(), this._toHelmert);
	var destination_latlon = this.fromCartesian(destination_xyz);

	return destination_latlon;

};

jsCoordinateConverter.DatumConversion.prototype.toCartesian = function(coordinates) {
		
	var lon = Math.deg2Rad(coordinates.getXAxis());
	var lat = Math.deg2Rad(coordinates.getYAxis());
	var height = coordinates.getZAxis();

	var semiMajor = this._fromEllipsoid.a;
	var semiMinor = this._fromEllipsoid.b;
	var e2 = this.TranMerConversion.eccentricitySquared(semiMajor,semiMinor);
		
	var sinLat = Math.sin(lat);
	var cosLat = Math.cos(lat);
	var sinLon = Math.sin(lon);
	var cosLon = Math.cos(lon);

	var v = semiMajor / (Math.sqrt(1 - (e2 * Math.pow(sinLat,2))));
		
	var x = (v + height) * cosLat * cosLon;
	var y = (v + height) * cosLat * sinLon;
	var z = (v* (1 - e2) + height) * sinLat;

	return new xyzValues(x,y,z);
};

jsCoordinateConverter.DatumConversion.prototype.fromCartesian = function(coordinates) {

	var x = coordinates.getXAxis();
	var y = coordinates.getYAxis();
	var z = coordinates.getZAxis();

	var semiMajor = this._toEllipsoid.a;
	var semiMinor = this._toEllipsoid.b;
	var e2 = this.TranMerConversion.eccentricitySquared(semiMajor,semiMinor);

	var lon = Math.atan2(y , x);

	var v = semiMajor / (Math.sqrt(1 - (e2 * Math.pow(Math.sin(y),2))));
	var p = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	var lat = Math.atan2(z , p * (1 - e2));

	while (Math.abs(y - lat) > (4 / semiMajor)) {
		y = lat;
		v = semiMajor / (Math.sqrt(1 - (e2 * Math.pow(Math.sin(y),2))));
		lat = Math.atan2((z + e2 * v * Math.sin(y)) , p);
	}

	var height = (p / Math.cos(lat)) - v;

	lon = Math.rad2Deg(lon);
	lat = Math.rad2Deg(lat);

	return new lonLatValues(lon, lat, height);
};

jsCoordinateConverter.DatumConversion.prototype.helmertTransformation = function(x, y, z, t) {

	var tx = t.translationVectors.x;
	var ty = t.translationVectors.y;
	var tz = t.translationVectors.z;

	var rx = Math.deg2Rad(t.rotationMatrix.x / 3600);
	var ry = Math.deg2Rad(t.rotationMatrix.y / 3600);
	var rz = Math.deg2Rad(t.rotationMatrix.z / 3600);

	var s = t.scaleFactor / 1e6;

	var xAxis = tx + x * (1 + s) - y * rz + z * ry;
	var yAxis = ty + x * rz + y * (1 + s) - z * rx;
	var zAxis = tz - x * ry + y * rx + z * (1 + s);
		
	return new xyzValues(xAxis, yAxis, zAxis);
};



jsCoordinateConverter.OSNGConversions = function(){};

/* 
 * convert standard grid reference ('SU387148') to fully numeric ref ([438700,114800])
 *   returned co-ordinates are in metres, centred on grid square for conversion to lat/long
 *
 *   note that northern-most grid squares will give 7-digit northings
 *   no error-checking is done on gridref (bad input will give bad results or NaN)
 */
jsCoordinateConverter.OSNGConversions.prototype.gridrefLetToNum = function(gridref) {
    // get numeric values of letter references, mapping A->0, B->1, C->2, etc:
    var l1 = gridref.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    var l2 = gridref.toUpperCase().charCodeAt(1) - 'A'.charCodeAt(0);
    // shuffle down letters after 'I' since 'I' is not used in grid:
    if (l1 > 7) l1--;
    if (l2 > 7) l2--;

    // convert grid letters into 100km-square indexes from false origin (grid square SV):
    var e = ((l1 - 2) % 5) * 5 + (l2 % 5);
    var n = (19 - Math.floor(l1 / 5) * 5) - Math.floor(l2 / 5);

    // skip grid letters to get numeric part of ref, stripping any spaces:
    gridref = gridref.slice(2).replace(/ /g, '');

    // append numeric part of references to grid index:
    e += gridref.slice(0, gridref.length / 2);
    n += gridref.slice(gridref.length / 2);

    // normalise to 1m grid, rounding up to centre of grid square:
    switch (gridref.length) {
        case 6:
            e += '50';
            n += '50';
            break;
        case 8:
            e += '5';
            n += '5';
            break;
            // 10-digit refs are already 1m
    }

    return [parseInt(e), parseInt(n)];
};


/*
 * convert numeric grid reference (in metres) to standard-form grid ref
 */
jsCoordinateConverter.OSNGConversions.prototype.gridrefNumToLet = function(e, n, digits) {
    // get the 100km-grid indices
    var e100k = Math.floor(e / 100000),
        n100k = Math.floor(n / 100000);

    if (e100k < 0 || e100k > 6 || n100k < 0 || n100k > 12) return '';

    // translate those into numeric equivalents of the grid letters
    var l1 = (19 - n100k) - (19 - n100k) % 5 + Math.floor((e100k + 10) / 5);
    var l2 = (19 - n100k) * 5 % 25 + e100k % 5;

    // compensate for skipped 'I' and build grid letter-pairs
    if (l1 > 7) l1++;
    if (l2 > 7) l2++;
    var letPair = String.fromCharCode(l1 + 'A'.charCodeAt(0), l2 + 'A'.charCodeAt(0));

    // strip 100km-grid indices from easting & northing, and reduce precision
    e = Math.floor((e % 100000) / Math.pow(10, 5 - digits / 2));
    n = Math.floor((n % 100000) / Math.pow(10, 5 - digits / 2));
    // note use of floor, as ref is bottom-left of relevant square!

    var gridRef = letPair + ' ' + e.padLZ(digits / 2) + ' ' + n.padLZ(digits / 2);

    return gridRef;
};

/*
 * pad a number with sufficient leading zeros to make it w chars wide
 */
Number.prototype.padLZ = function(width) {
    var num = this.toString(),
        len = num.length;
    for (var i = 0; i < width - len; i++) num = '0' + num;
    return num;
};