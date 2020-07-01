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


