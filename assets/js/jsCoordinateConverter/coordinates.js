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