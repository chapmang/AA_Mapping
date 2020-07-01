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

