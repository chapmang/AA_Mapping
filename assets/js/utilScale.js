/**
 * @author Geoff Chapman @title Cartographic Scale Conversion
 */
//Browser Detect
var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
	    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]

};
BrowserDetect.init();

function resetForm() {
	document.getElementById("sourceScale").value = "";
	document.getElementById("transformValue").value = "";
	document.getElementById("mm2km").value = "";
	document.getElementById("km2mm").value = "";
	document.getElementById("finalScale").value = "";
	document.getElementById("10km").innerHTML = '&nbsp;';
	document.getElementById("5km").innerHTML = '&nbsp;';
	document.getElementById("1km").innerHTML = '&nbsp;';
	document.getElementById("0.5km").innerHTML = '&nbsp;';
	document.getElementById("0.25km").innerHTML = '&nbsp;';
	document.getElementById("10miles").innerHTML = '&nbsp;';
	document.getElementById("5miles").innerHTML = '&nbsp;';
	document.getElementById("1mile").innerHTML = '&nbsp;';
	document.getElementById("0.5mile").innerHTML = '&nbsp;';
	document.getElementById("0.25mile").innerHTML = '&nbsp;';
}

//Convert Scale based upon transformation supplied
function rescale(sourceScale,transformValue) {
	// Get original scale
	var stringVal1 = document.getElementById("sourceScale").value;
	var val1 = (typeof sourceScale === "undefined") ? parseFloat(stringVal1.replace(/[^\d\.-]/g,'')) : sourceScale;

	// Get transformation value
	var stringVal2 = document.getElementById("transformValue").value;
	var val2 = (typeof transformValue === "undefined") ? parseFloat(stringVal2.replace(/[^\d\.-]/g,'')) : transformValue;
	// Calculate and display transformed scale
	ansA = val2 / 100;
	ansB = val1 / ansA;
	var ansC = document.getElementById("finalScale");
	if (val1 > 0) {
		ansC.value = Math.round(ansB * 100) / 100;
	}
	// Send value to help determine scale bar lengths at new scale
	fs = ansB;
	if (fs>0){
		document.getElementById("km2mm").value = (Math.round((fs/1000000)*10000)/10000);
		document.getElementById("mm2km").value = (Math.round((1000000/fs)*10000)/10000) +" mm";
	}
	// Call function to determine scale bar lengths at new scale
	//scaleBars();
}

// Calculate scale form map measurements
function calculate() {
	// Get mm measurement
	if (document.getElementById("mm2km").value) {
		var mm2km = document.getElementById("mm2km").value;
		fs = 1000000 / mm2km;
		rescale(fs, 100);
		document.getElementById("km2mm").value = Math.round((fs/1000000)*10000)/10000;
	} else if (document.getElementById("km2mm").value) {
		var km2mm = document.getElementById("km2mm").value;
		fs = km2mm*1000000;
		rescale(fs, 100);
		document.getElementById("mm2km").value = Math.round((1000000/fs)*10000)/10000;
	} 
}

//Generate distances from sepcific scale without transformation
function generate() {
	// Get Final Scale
	var fs1 = parseInt(document.getElementById("finalScale").value);
	// Send value to help determine scale bar lengths
	fs = fs1;
	// Call function to determine scale bar lengths at new scale
	scaleBars();
}

//Function to determine scale bar lengths at set scale
function scaleBars() {
	// Only process is Final Scale has a value
	if (fs > 0) {
		// Metric scale bar lengths
		// 10km
		tenKm = document.getElementById("10km");
		tenKm1 = fs / 10;
		tenKm2 = 1000000 / tenKm1;
		tenKm.value = Math.round(tenKm2 * 100) / 100;
		tenKm = tenKm.value;
		if (isNaN(tenKm)) {
			document.getElementById("10km").innerHTML = "";
		} else {
			document.getElementById("10km").innerHTML = tenKm;
		}

		// 5km
		fiveKm = document.getElementById("5km");
		fiveKm1 = tenKm2 / 2;
		fiveKm.value = Math.round(fiveKm1 * 100) / 100;
		fiveKm = fiveKm.value;
		if (isNaN(fiveKm)) {
			document.getElementById("5km").innerHTML = "";
		} else {
			document.getElementById("5km").innerHTML = fiveKm;
		}

		// 1km
		oneKm = document.getElementById("1km");
		oneKm1 = 1000000 / fs;
		oneKm.value = Math.round(oneKm1 * 100) / 100;
		oneKm = oneKm.value;
		if (isNaN(oneKm)) {
			document.getElementById("1km").innerHTML = "";
		} else {
			document.getElementById("1km").innerHTML = oneKm;
		}

		// 0.5km
		halfKm = document.getElementById("0.5km");
		halfKm1 = oneKm1 * 0.5;
		halfKm.value = Math.round(halfKm1 * 100) / 100;
		halfKm = halfKm.value;
		if (isNaN(halfKm)) {
			document.getElementById("0.5km").innerHTML = "";
		} else {
			document.getElementById("0.5km").innerHTML = halfKm;
		}

		// 0.25km
		quarterKm = document.getElementById("0.25km");
		quarterKm1 = oneKm1 * 0.25;
		quarterKm.value = Math.round(quarterKm1 * 100) / 100;
		quarterKm = quarterKm.value;
		if (isNaN(quarterKm)) {
			document.getElementById("0.25km").innerHTML = "";
		} else {
			document.getElementById("0.25km").innerHTML = quarterKm;
		}

		// Imperial scale bar lengths
		// 10 miles
		tenMiles = document.getElementById("10miles");
		tenMiles1 = fs / 10;
		tenMiles2 = 1609344 / tenMiles1;
		tenMiles.value = Math.round(tenMiles2 * 100) / 100;
		tenMiles = tenMiles.value;
		if (isNaN(tenMiles)) {
			document.getElementById("10miles").innerHTML = "";
		} else {
			document.getElementById("10miles").innerHTML = tenMiles;
		}

		// 5 miles
		fiveMiles = document.getElementById("5miles");
		fiveMiles1 = tenMiles2 / 2;
		fiveMiles.value = Math.round(fiveMiles1 * 100) / 100;
		fiveMiles = fiveMiles.value;
		if (isNaN(fiveMiles)) {
			document.getElementById("5miles").innerHTML = "";
		} else {
			document.getElementById("5miles").innerHTML = fiveMiles;
		}

		// 1 mile
		oneMile = document.getElementById("1mile");
		oneMile1 = 1609344 / fs;
		oneMile.value = Math.round(oneMile1 * 100) / 100;
		oneMile = oneMile.value;
		if (isNaN(oneMile)) {
			document.getElementById("1mile").innerHTML = "";
		} else {
			document.getElementById("1mile").innerHTML = oneMile;
		}

		// 0.5 mile
		halfMile = document.getElementById("0.5mile");
		halfMile1 = oneMile1 * 0.5;
		halfMile.value = Math.round(halfMile1 * 100) / 100;
		halfMile = halfMile.value;
		if (isNaN(halfMile)) {
			document.getElementById("0.5mile").innerHTML = "";
		} else {
			document.getElementById("0.5mile").innerHTML = halfMile;
		}

		// 0.25 mile
		quarterMile = document.getElementById("0.25mile");
		quarterMile1 = oneMile1 * 0.25;
		quarterMile.value = Math.round(quarterMile1 * 100) / 100;
		quarterMile = quarterMile.value;
		if (isNaN(quarterMile)) {
			document.getElementById("0.25mile").innerHTML = "";
		} else {
			document.getElementById("0.25mile").innerHTML = quarterMile;
		}
		// Call function to draw SVG scale bars (Metric and Imperial)
		if (BrowserDetect.browser == 'Explorer')
			{
			document.getElementById("svgScaleBars").innerHTML ='<p class="accent">You\'re using ' + BrowserDetect.browser + ' ' + BrowserDetect.version + ' on ' + BrowserDetect.OS + ' which doesn\'t support SVG. Try a different browser to get a downloadable copy of this scale bar!</p>';
			}
		else{
		drawScales();
		}
	}
}

function drawScales() {
	if (tenKm > 0) {
		document.getElementById("svgScaleBars").style.height = "100px";
		document.getElementById("scalesDownload").style.display = "block";

		// Compare Scale Bar with Space
		if (tenMiles > 169)// approx. 600px in mm
		{
			if (fiveMiles > 169) {
				// Metric origin shift
				var oneKmShift = oneKm + 10;
				var halfKmShift = halfKm + 10;
				var quarterKmShift = quarterKm + 10;

				// Imperial origin shift
				var oneMileShift = oneMile + 10;
				var halfMileShift = halfMile + 10;
				var quarterMileShift = quarterMile + 10;

				// Metric text offset
				var oneKmOffset = oneKm + 7.8;
				var halfKmOffset = halfKm + 7.8;
				var quarterKmOffset = quarterKm + 7.8;

				// Imperial text offset
				var oneMileOffset = oneMile + 7.8;
				var halfMileOffset = halfMile + 7.8;
				var quarterMileOffset = quarterMile + 7.8;

				// UPTO ONE KM
				// DRAW SCALE BARS FOR DISPLAY
				document.getElementById("svgScaleBars").innerHTML = "<svg version='1.1'  baseProfile='full'  xmlns='http://www.w3.org/2000/svg'  xmlns:xlink='http://www.w3.org/1999/xlink'   xmlns:ev='http://www.w3.org/2001/xml-events' height='100%' width='100%'>"
					+
					// horizontal line
					"<line x1='10mm' y1='10mm' x2='"
					+ oneMileShift
					+ "mm' y2='10mm' style='stroke: black; stroke-width:3pt'/>"
					+
					// Metric Scale Bar
					// zero tick mark
					"<line x1='10mm' y1='8mm' x2='10mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// 0.25 km tick mark
					"<line x1='"
					+ quarterKmShift
					+ "mm' y1='8mm' x2='"
					+ quarterKmShift
					+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// 0.5 km tick mark
					"<line x1='"
					+ halfKmShift
					+ "mm' y1='8mm' x2='"
					+ halfKmShift
					+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// one km tick mark
					"<line x1='"
					+ oneKmShift
					+ "mm' y1='8mm' x2='"
					+ oneKmShift
					+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// Zero text
					"<text x = '9mm' y = '7mm' fill = 'black' font-size = '8pt'>0</text>"
					+
					// 0.25 km text
					"<text x = '"
					+ quarterKmOffset
					+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>0.25</text>"
					+
					// 0.5 km text
					"<text x = '"
					+ halfKmOffset
					+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>0.5</text>"
					+
					// one km text
					"<text x = '"
					+ oneKmOffset
					+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>1km</text>"
					+

					// Imperial Scale Bar
					// zero tick mark
					"<line x1='10mm' y1='10mm' x2='10mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// 0.25 mile tick mark
					"<line x1='"
					+ quarterMileShift
					+ "mm' y1='10mm' x2='"
					+ quarterMileShift
					+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// 0.5 mile tick mark
					"<line x1='"
					+ halfMileShift
					+ "mm' y1='10mm' x2='"
					+ halfMileShift
					+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// one mile tick mark
					"<line x1='"
					+ oneMileShift
					+ "mm' y1='10mm' x2='"
					+ oneMileShift
					+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// Zero text
					"<text x = '9mm' y = '15mm' fill = 'black' font-size = '8pt'>0</text>"
					+
					// 0.25 mile text
					"<text x = '"
					+ quarterMileOffset
					+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>1/4</text>"
					+
					// 0.5 mile text
					"<text x = '"
					+ halfMileOffset
					+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>1/2</text>"
					+
					// one mile text
					"<text x = '"
					+ oneMileOffset
					+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>1 Mile</text>"
					+ "</svg>";

				// DRAW SCALE BARS FOR DOWNLOAD
				document.getElementById("svgFile").innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' version='1.1'>"
					+
					// horizontal line
					"<line x1='10mm' y1='10mm' x2='"
					+ oneMileShift
					+ "mm' y2='10mm' style='stroke: black; stroke-width:3pt'/>"
					+
					// Metric Scale Bar
					// zero tick mark
					"<line x1='10mm' y1='8mm' x2='10mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// 0.25 km tick mark
					"<line x1='"
					+ quarterKmShift
					+ "mm' y1='8mm' x2='"
					+ quarterKmShift
					+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// 0.5 km tick mark
					"<line x1='"
					+ halfKmShift
					+ "mm' y1='8mm' x2='"
					+ halfKmShift
					+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// one km tick mark
					"<line x1='"
					+ oneKmShift
					+ "mm' y1='8mm' x2='"
					+ oneKmShift
					+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// Zero text
					"<text x = '9mm' y = '7mm' fill = 'black' font-size = '8pt'>0</text>"
					+
					// 0.25 km text
					"<text x = '"
					+ quarterKmOffset
					+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>0.25</text>"
					+
					// 0.5 km text
					"<text x = '"
					+ halfKmOffset
					+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>0.5</text>"
					+
					// one km text
					"<text x = '"
					+ oneKmOffset
					+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>1km</text>"
					+

					// Imperial Scale Bar
					// zero tick mark
					"<line x1='10mm' y1='10mm' x2='10mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// 0.25 mile tick mark
					"<line x1='"
					+ quarterMileShift
					+ "mm' y1='10mm' x2='"
					+ quarterMileShift
					+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// 0.5 mile tick mark
					"<line x1='"
					+ halfMileShift
					+ "mm' y1='10mm' x2='"
					+ halfMileShift
					+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// one mile tick mark
					"<line x1='"
					+ oneMileShift
					+ "mm' y1='10mm' x2='"
					+ oneMileShift
					+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// Zero text
					"<text x = '9mm' y = '15mm' fill = 'black' font-size = '8pt'>0</text>"
					+
					// 0.25 mile text
					"<text x = '"
					+ quarterMileOffset
					+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>1/4</text>"
					+
					// 0.5 mile text
					"<text x = '"
					+ halfMileOffset
					+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>1/2</text>"
					+
					// one mile text
					"<text x = '"
					+ oneMileOffset
					+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>1 Mile</text>"
					+ "</svg>";
			} else {
				// Metric origin shift
				var fiveKmShift = fiveKm + 10;
				var oneKmShift = oneKm + 10;
				var halfKmShift = halfKm + 10;

				// Imperial origin shift
				var fiveMilesShift = fiveMiles + 10;
				var oneMileShift = oneMile + 10;
				var halfMileShift = halfMile + 10;

				// Metric text offset
				var fiveKmOffset = fiveKm + 7.8;
				var oneKmOffset = oneKm + 7.8;
				var halfKmOffset = halfKm + 7.8;

				// Imperial text offset
				var fiveMilesOffset = fiveMiles + 7.8;
				var oneMileOffset = oneMile + 7.8;
				var halfMileOffset = halfMile + 7.8;

				// UPTO FIVE KM
				// DRAW SCALE BARS FOR DISPLAY
				document.getElementById("svgScaleBars").innerHTML = "<svg version='1.1'  baseProfile='full'  xmlns='http://www.w3.org/2000/svg'  xmlns:xlink='http://www.w3.org/1999/xlink'   xmlns:ev='http://www.w3.org/2001/xml-events' height='100%' width='100%'>"
					+
					// horizontal line
					"<line x1='10mm' y1='10mm' x2='"
					+ fiveMilesShift
					+ "mm' y2='10mm' style='stroke: black; stroke-width:3pt'/>"
					+
					// Metric Scale Bar
					// zero tick mark
					"<line x1='10mm' y1='8mm' x2='10mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// 0.5 km tick mark
					"<line x1='"
					+ halfKmShift
					+ "mm' y1='8mm' x2='"
					+ halfKmShift
					+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// one km tick mark
					"<line x1='"
					+ oneKmShift
					+ "mm' y1='8mm' x2='"
					+ oneKmShift
					+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// five km tick mark
					"<line x1='"
					+ fiveKmShift
					+ "mm' y1='8mm' x2='"
					+ fiveKmShift
					+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// Zero text
					"<text x = '9mm' y = '7mm' fill = 'black' font-size = '8pt'>0</text>"
					+
					// 0.5 km text
					"<text x = '"
					+ halfKmOffset
					+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>0.5</text>"
					+
					// 1 km text
					"<text x = '"
					+ oneKmOffset
					+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>1</text>"
					+
					// five km text
					"<text x = '"
					+ fiveKmOffset
					+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>5km</text>"
					+

					// Imperial Scale Bar
					// zero tick mark
					"<line x1='10mm' y1='10mm' x2='10mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// 0.5 mile tick mark
					"<line x1='"
					+ halfMileShift
					+ "mm' y1='10mm' x2='"
					+ halfMileShift
					+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// 1 mile tick mark
					"<line x1='"
					+ oneMileShift
					+ "mm' y1='10mm' x2='"
					+ oneMileShift
					+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// five mile tick mark
					"<line x1='"
					+ fiveMilesShift
					+ "mm' y1='10mm' x2='"
					+ fiveMilesShift
					+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// Zero text
					"<text x = '9mm' y = '15mm' fill = 'black' font-size = '8pt'>0</text>"
					+
					// 0.5 mile text
					"<text x = '"
					+ halfMileOffset
					+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>1/2</text>"
					+
					// one mile text
					"<text x = '"
					+ oneMileOffset
					+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>1</text>"
					+
					// five mile text
					"<text x = '"
					+ fiveMilesOffset
					+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>5 Miles</text>"
					+ "</svg>";

				// DRAW SCALE BARS FOR DOWNLOAD
				document.getElementById("svgFile").innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' version='1.1'>"
					+
					// horizontal line
					"<line x1='10mm' y1='10mm' x2='"
					+ fiveMilesShift
					+ "mm' y2='10mm' style='stroke: black; stroke-width:3pt'/>"
					+
					// Metric Scale Bar
					// zero tick mark
					"<line x1='10mm' y1='8mm' x2='10mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// 0.5 km tick mark
					"<line x1='"
					+ halfKmShift
					+ "mm' y1='8mm' x2='"
					+ halfKmShift
					+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// one km tick mark
					"<line x1='"
					+ oneKmShift
					+ "mm' y1='8mm' x2='"
					+ oneKmShift
					+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// five km tick mark
					"<line x1='"
					+ fiveKmShift
					+ "mm' y1='8mm' x2='"
					+ fiveKmShift
					+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// Zero text
					"<text x = '9mm' y = '7mm' fill = 'black' font-size = '8pt'>0</text>"
					+
					// 0.5 km text
					"<text x = '"
					+ halfKmOffset
					+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>0.5</text>"
					+
					// 1 km text
					"<text x = '"
					+ oneKmOffset
					+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>1</text>"
					+
					// five km text
					"<text x = '"
					+ fiveKmOffset
					+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>5km</text>"
					+

					// Imperial Scale Bar
					// zero tick mark
					"<line x1='10mm' y1='10mm' x2='10mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// 0.5 mile tick mark
					"<line x1='"
					+ halfMileShift
					+ "mm' y1='10mm' x2='"
					+ halfMileShift
					+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// 1 mile tick mark
					"<line x1='"
					+ oneMileShift
					+ "mm' y1='10mm' x2='"
					+ oneMileShift
					+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// five mile tick mark
					"<line x1='"
					+ fiveMilesShift
					+ "mm' y1='10mm' x2='"
					+ fiveMilesShift
					+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
					+
					// Zero text
					"<text x = '9mm' y = '15mm' fill = 'black' font-size = '8pt'>0</text>"
					+
					// 0.5 mile text
					"<text x = '"
					+ halfMileOffset
					+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>1/2</text>"
					+
					// one mile text
					"<text x = '"
					+ oneMileOffset
					+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>1</text>"
					+
					// five mile text
					"<text x = '"
					+ fiveMilesOffset
					+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>5 Miles</text>"
					+ "</svg>";
			}
		} else {
			// Metric origin shift
			var tenKmShift = tenKm + 10;
			var fiveKmShift = fiveKm + 10;
			var oneKmShift = oneKm + 10;

			// Imperial origin shift
			var tenMilesShift = tenMiles + 10;
			var fiveMilesShift = fiveMiles + 10;
			var oneMileShift = oneMile + 10;

			// Metric text offset
			var tenKmOffset = tenKm + 9.1;
			var fiveKmOffset = fiveKm + 9.1;
			var oneKmOffset = oneKm + 9.1;

			// Imperial text offset
			var tenMilesOffset = tenMiles + 9.1;
			var fiveMilesOffset = fiveMiles + 9.1;
			var oneMileOffset = oneMile + 9.1;

			// UPTO TEN KM
			// DRAW SCALE BARS FOR DISPLAY
			document.getElementById("svgScaleBars").innerHTML = "<svg version='1.1'  baseProfile='full'  xmlns='http://www.w3.org/2000/svg'  xmlns:xlink='http://www.w3.org/1999/xlink'   xmlns:ev='http://www.w3.org/2001/xml-events' height='100%' width='100%'>"
				+
				// horizontal line
				"<line x1='10mm' y1='10mm' x2='"
				+ tenMilesShift
				+ "mm' y2='10mm' style='stroke: black; stroke-width:3pt'/>"
				+
				// Metric Scale Bar
				// zero tick mark
				"<line x1='10mm' y1='8mm' x2='10mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
				+
				// one km tick mark
				"<line x1='"
				+ oneKmShift
				+ "mm' y1='8mm' x2='"
				+ oneKmShift
				+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
				+
				// five km tick mark
				"<line x1='"
				+ fiveKmShift
				+ "mm' y1='8mm' x2='"
				+ fiveKmShift
				+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
				+
				// ten km tick mark
				"<line x1='"
				+ tenKmShift
				+ "mm' y1='8mm' x2='"
				+ tenKmShift
				+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
				+
				// Zero text
				"<text x = '9mm' y = '7mm' fill = 'black' font-size = '8pt'>0</text>"
				+
				// one km text
				"<text x = '"
				+ oneKmOffset
				+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>1</text>"
				+
				// five km text
				"<text x = '"
				+ fiveKmOffset
				+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>5</text>"
				+
				// ten km text
				"<text x = '"
				+ tenKmOffset
				+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>10km</text>"
				+

				// Imperial Scale Bar
				// zero tick mark
				"<line x1='10mm' y1='10mm' x2='10mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
				+
				// 1 mile tick mark
				"<line x1='"
				+ oneMileShift
				+ "mm' y1='10mm' x2='"
				+ oneMileShift
				+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
				+
				// five mile tick mark
				"<line x1='"
				+ fiveMilesShift
				+ "mm' y1='10mm' x2='"
				+ fiveMilesShift
				+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
				+
				// ten mile tick mark
				"<line x1='"
				+ tenMilesShift
				+ "mm' y1='10mm' x2='"
				+ tenMilesShift
				+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
				+
				// Zero text
				"<text x = '9mm' y = '15mm' fill = 'black' font-size = '8pt'>0</text>"
				+
				// one mile text
				"<text x = '"
				+ oneMileOffset
				+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>1</text>"
				+
				// one mile text
				"<text x = '"
				+ fiveMilesOffset
				+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>5</text>"
				+
				// ten mile text
				"<text x = '"
				+ tenMilesOffset
				+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>10 Miles</text>"
				+ "</svg>";

			// DRAW SCALE BARS FOR DOWNLOAD
			document.getElementById("svgFile").innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' version='1.1'>"
				+
				// horizontal line
				"<line x1='10mm' y1='10mm' x2='"
				+ tenMilesShift
				+ "mm' y2='10mm' style='stroke: black; stroke-width:3pt'/>"
				+
				// Metric Scale Bar
				// zero tick mark
				"<line x1='10mm' y1='8mm' x2='10mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
				+
				// one km tick mark
				"<line x1='"
				+ oneKmShift
				+ "mm' y1='8mm' x2='"
				+ oneKmShift
				+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
				+
				// five km tick mark
				"<line x1='"
				+ fiveKmShift
				+ "mm' y1='8mm' x2='"
				+ fiveKmShift
				+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
				+
				// ten km tick mark
				"<line x1='"
				+ tenKmShift
				+ "mm' y1='8mm' x2='"
				+ tenKmShift
				+ "mm' y2='10mm' style='stroke: black; stroke-width:1pt'/>"
				+
				// Zero text
				"<text x = '9mm' y = '7mm' fill = 'black' font-size = '8pt'>0</text>"
				+
				// one km text
				"<text x = '"
				+ oneKmOffset
				+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>1</text>"
				+
				// five km text
				"<text x = '"
				+ fiveKmOffset
				+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>5</text>"
				+
				// ten km text
				"<text x = '"
				+ tenKmOffset
				+ "mm' y = '7mm' fill = 'black' font-size = '8pt'>10km</text>"
				+

				// Imperial Scale Bar
				// zero tick mark
				"<line x1='10mm' y1='10mm' x2='10mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
				+
				// 1 mile tick mark
				"<line x1='"
				+ oneMileShift
				+ "mm' y1='10mm' x2='"
				+ oneMileShift
				+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
				+
				// five mile tick mark
				"<line x1='"
				+ fiveMilesShift
				+ "mm' y1='10mm' x2='"
				+ fiveMilesShift
				+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
				+
				// ten mile tick mark
				"<line x1='"
				+ tenMilesShift
				+ "mm' y1='10mm' x2='"
				+ tenMilesShift
				+ "mm' y2='12mm' style='stroke: black; stroke-width:1pt'/>"
				+
				// Zero text
				"<text x = '9mm' y = '15mm' fill = 'black' font-size = '8pt'>0</text>"
				+
				// one mile text
				"<text x = '"
				+ oneMileOffset
				+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>1</text>"
				+
				// one mile text
				"<text x = '"
				+ fiveMilesOffset
				+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>5</text>"
				+
				// ten mile text
				"<text x = '"
				+ tenMilesOffset
				+ "mm' y = '15mm' fill = 'black' font-size = '8pt'>10 Miles</text>"
				+ "</svg>";
		}
	}
}
