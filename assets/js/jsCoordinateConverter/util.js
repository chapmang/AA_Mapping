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