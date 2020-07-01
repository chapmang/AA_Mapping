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