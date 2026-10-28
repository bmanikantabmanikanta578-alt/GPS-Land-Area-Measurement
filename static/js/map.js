/* =========================================
   PROFESSIONAL GPS LAND SURVEY SYSTEM
========================================= */


/* =========================================
   MAP INITIALIZATION
========================================= */

var map = L.map('map', {

    zoomControl: true,
    preferCanvas: true

}).setView([12.9716, 77.5946], 18);


/* =========================================
   HD SATELLITE MAP
========================================= */

L.tileLayer(

    'https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',

    {

        maxZoom: 22,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']

    }

).addTo(map);


/* =========================================
   SEARCH BAR
========================================= */

L.Control.geocoder({

    defaultMarkGeocode: true,

    placeholder:
    'Search villages, roads, lands, hotels...'

}).addTo(map);


/* =========================================
   DRAW LAYER
========================================= */

var drawnItems = new L.FeatureGroup();

map.addLayer(drawnItems);


/* =========================================
   CUSTOM SURVEY ICON
========================================= */

var surveyIcon = L.icon({

    iconUrl:
    'https://cdn-icons-png.flaticon.com/512/854/854878.png',

    iconSize: [40, 40],

    iconAnchor: [20, 40],

    popupAnchor: [0, -35]

});


/* =========================================
   DRAW CONTROLS
========================================= */

var drawControl = new L.Control.Draw({

    position: 'topleft',

    draw: {

        polygon: {

            allowIntersection: false,

            showArea: true,

            shapeOptions: {

                color: '#00ff88',
                fillColor: '#00ff88',
                fillOpacity: 0.3,
                weight: 4

            }

        },

        rectangle: {

            shapeOptions: {

                color: '#ff9900',
                fillOpacity: 0.2,
                weight: 4

            }

        },

        polyline: {

            shapeOptions: {

                color: '#007bff',
                weight: 4

            }

        },

        marker: {

            icon: surveyIcon

        },

        circle: false,
        circlemarker: false

    },

    edit: {

        featureGroup: drawnItems

    }

});

map.addControl(drawControl);


/* =========================================
   WALKING SURVEY
========================================= */

var walkingMode = false;

var walkingPoints = [];

var walkingPolyline = null;

var gpsMarker = null;


/* =========================================
   START WALKING SURVEY
========================================= */

function startWalkingSurvey() {

    walkingMode = true;

    walkingPoints = [];

    document.getElementById(
        'walking_status'
    ).value =
    'Walking Survey Running';

    alert(
        '🚶 Walking Survey Started'
    );

}


/* =========================================
   STOP WALKING SURVEY
========================================= */

function stopWalkingSurvey() {

    walkingMode = false;

    document.getElementById(
        'walking_status'
    ).value =
    'Walking Survey Stopped';

    alert(
        '✅ Walking Survey Stopped'
    );

}


/* =========================================
   GPS TRACKING
========================================= */

navigator.geolocation.watchPosition(

    function(position) {

        var lat =
        position.coords.latitude;

        var lng =
        position.coords.longitude;

        var current =
        [lat, lng];


        document.getElementById(
            'gps_status'
        ).value =
        'GPS Connected';


        /* REMOVE OLD GPS MARKER */

        if (gpsMarker) {

            map.removeLayer(gpsMarker);

        }


        /* LIVE GPS POINTER */

        gpsMarker = L.marker(current, {

            icon: L.divIcon({

                className: '',

                html:

                '<div style="' +

                'width:28px;' +
                'height:28px;' +
                'background:#007bff;' +
                'border-radius:50%;' +
                'border:4px solid white;' +
                'box-shadow:0 0 25px #007bff;' +

                '">' +

                '</div>',

                iconSize: [28, 28]

            })

        }).addTo(map);


        /* WALKING MODE */

        if (walkingMode) {

            walkingPoints.push(current);


            if (walkingPolyline) {

                map.removeLayer(
                    walkingPolyline
                );

            }


            walkingPolyline =
            L.polyline(

                walkingPoints,

                {

                    color: 'red',
                    weight: 5

                }

            ).addTo(map);

        }

    },

    function(error) {

        console.log(error);

    },

    {

        enableHighAccuracy: true

    }

);


/* =========================================
   DRAW CREATED
========================================= */

map.on(L.Draw.Event.CREATED, function(event) {

    var layer = event.layer;

    drawnItems.addLayer(layer);


    /* =====================================
       POLYGON / RECTANGLE
    ===================================== */

    if (
        event.layerType === 'polygon' ||
        event.layerType === 'rectangle'
    ) {

        processPolygon(layer);

    }


    /* =====================================
       DISTANCE LINE
    ===================================== */

    if (event.layerType === 'polyline') {

        var latlngs =
        layer.getLatLngs();

        var distance = 0;


        for (
            var i = 0;
            i < latlngs.length - 1;
            i++
        ) {

            distance +=
            latlngs[i].distanceTo(
                latlngs[i + 1]
            );

        }


        layer.bindPopup(

            '<b>📏 Distance:</b> ' +

            distance.toFixed(2) +

            ' meters'

        ).openPopup();

    }


    /* =====================================
       SURVEY POINT
    ===================================== */

    if (event.layerType === 'marker') {

        var latlng =
        layer.getLatLng();


        var marker =
        L.marker(latlng, {

            icon: surveyIcon

        }).addTo(map);


        marker.bindPopup(

            '<div style="font-size:14px;">' +

            '<b>📍 Survey Point</b><br>' +

            latlng.lat.toFixed(6) +

            ', ' +

            latlng.lng.toFixed(6) +

            '</div>'

        ).openPopup();

    }

});


/* =========================================
   PROCESS POLYGON
========================================= */

function processPolygon(layer) {

    var latlngs =
    layer.getLatLngs()[0];

    var coordinates = [];


    latlngs.forEach(function(point) {

        coordinates.push({

            lat: point.lat,
            lng: point.lng

        });

    });


    document.getElementById(
        'coordinates'
    ).value =
    JSON.stringify(
        coordinates,
        null,
        2
    );


    /* AREA */

    var areaSqMeter =
    L.GeometryUtil.geodesicArea(latlngs);

    var sqFeet =
    areaSqMeter * 10.7639;

    var acres =
    areaSqMeter / 4046.86;


    document.getElementById(
        'area'
    ).value =
    areaSqMeter.toFixed(2) +
    ' sq.m';


    document.getElementById(
        'sqfeet'
    ).value =
    sqFeet.toFixed(2) +
    ' sq.ft';


    document.getElementById(
        'acres'
    ).value =
    acres.toFixed(3) +
    ' Acres';


    /* PERIMETER */

    var perimeter = 0;


    for (var i = 0; i < latlngs.length; i++) {

        var next =
        (i + 1) % latlngs.length;

        perimeter +=
        latlngs[i].distanceTo(
            latlngs[next]
        );

    }


    document.getElementById(
        'perimeter'
    ).value =
    perimeter.toFixed(2) +
    ' meters';


    /* FORM DETAILS */

    var surveyName =
    document.getElementById(
        'measurement_name'
    ).value || 'Land Survey';


    var ownerName =
    document.getElementById(
        'owner_name'
    ).value || 'Unknown Owner';


    var note =
    document.getElementById(
        'survey_note'
    ).value || 'No Notes';


    /* POPUP */

    layer.bindPopup(

        '<div style="' +

        'font-family:Segoe UI;' +
        'font-size:14px;' +

        '">' +

        '<h3 style="color:#28a745;">🌍 Land Survey</h3>' +

        '<b>📍 Survey:</b> ' +
        surveyName +

        '<br><b>👤 Owner:</b> ' +
        ownerName +

        '<br><b>📐 Area:</b> ' +
        areaSqMeter.toFixed(2) +
        ' sq.m' +

        '<br><b>🏠 Sq.ft:</b> ' +
        sqFeet.toFixed(2) +

        '<br><b>🌾 Acres:</b> ' +
        acres.toFixed(3) +

        '<br><b>📏 Perimeter:</b> ' +
        perimeter.toFixed(2) +

        '<br><b>📝 Note:</b> ' +
        note +

        '</div>'

    ).openPopup();


    /* CENTER LABEL */

    var center =
    layer.getBounds().getCenter();


    L.marker(center, {

        icon: L.divIcon({

            className:
            'custom-survey-marker',

            html:

            '<div style="' +

            'background:rgba(0,0,0,0.8);' +
            'padding:12px 18px;' +
            'border-radius:16px;' +
            'color:white;' +
            'font-weight:bold;' +
            'font-size:14px;' +
            'border:2px solid white;' +
            'box-shadow:0 0 20px rgba(0,0,0,0.5);' +

            '">' +

            '🌾 ' +
            acres.toFixed(2) +
            ' Acres' +

            '<br>' +

            ownerName +

            '</div>',

            iconSize: [160, 60]

        })

    }).addTo(map);


    alert(
        '✅ Survey Completed Successfully'
    );

}