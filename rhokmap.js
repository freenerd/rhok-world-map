Locations = new Meteor.Collection("locations");
LastUpdate = new Meteor.Collection("last_update");

UPDATE_INTERVALL = 3600; // in seconds

if (Meteor.is_client) {
  var geocoder;
  var map;
  var locations = {};

  var makeMarker = function(loc) {
    if(!loc.coordinates) return;

    var pinColor = "AF83CC";
    var pinImage = new google.maps.MarkerImage(
      "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
      new google.maps.Size(21, 34),
      new google.maps.Point(0,0),
      new google.maps.Point(10, 34)
    );

    var marker = new google.maps.Marker({
      map: map,
      icon: pinImage,
      position: new google.maps.LatLng(loc.coordinates[0], loc.coordinates[1])
    });

    google.maps.event.addListener(marker, 'click', function() {
      window.open(loc.link);
    });

    // save to avoid duplicates later
    locations[loc._id] = marker;
  }

  var geocodeAddress = function(loc) {
    if (!loc.raw_address) return;

    geocoder.geocode( { 'address': loc.raw_address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK && results[0] && results[0].geometry) {
        var coordinates = [results[0].geometry.location["$a"], results[0].geometry.location["ab"]]
        Locations.update(loc._id,
          {
            $set: {
              coordinates: coordinates,
              formatted_address: results[0].formatted_address
            }
          },
          function(error) {
            if(!error) {
              makeMarker(loc)
            }
          }
        );
      }
    });
  };

  Meteor.autosubscribe(function() {
    // get locations from the backend that have not yet geolocated yet
    Locations.find({coordinates: { $exists : false }}).forEach(function(loc) {
      if(!locations[loc._id]) {
        // this loc is not on the map yet, geocode!
        geocodeAddress(loc);
      }
    })
  });

  Meteor.autosubscribe(function() {
    // get locations from the backend that are geolocated
    // this will also get called each time when the site is opened
    Locations.find({coordinates: { $exists : true }}).forEach(function(loc) {
      if(!locations[loc._id]) {
        // this loc is not on the map yet, draw marker!
        makeMarker(loc);
      }
    })
  });

  Meteor.startup(function() {
    function initializeMap() {
      geocoder = new google.maps.Geocoder();
      var latlng = new google.maps.LatLng(15.973349, 16.875);
      var myOptions = {
        overviewMapControl: false,
        mapTypeControl: false,
        panControl: false,
        rotateControl: false,
        scaleControl: false,
        zoomControl: true,
        zoomControlOptions: { position: google.maps.ControlPosition.LEFT_BOTTOM },
        streetViewControl: false,
        scrollwheel: false,
        maxZoom: 6,
        zoom: 2,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "administrative",
            stylers: [
              { visibility: "off" }
            ]
          },{
            featureType: "landscape",
            stylers: [
              { visibility: "on" }
            ]
          },{
            featureType: "water",
            stylers: [
              { visibility: "simplified" },
              { hue: "#003bff" },
              { saturation: -25 }
            ]
          },{
            featureType: "poi",
            stylers: [
              { visibility: "off" }
            ]
          },{
            featureType: "transit",
            stylers: [
              { visibility: "off" }
            ]
          }
        ]
      }
      map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    }
    initializeMap();

    // scrape feed for new additions
    Meteor.call('getFeed');
  });
};

if (Meteor.is_server) {
  var addresses;

  Meteor.methods({
    getFeed: function() {
      // get the RSS feed of events from the RHOK site
      // this can't be done in the front-end because of cross-origin

      // Throttle RSS calls
      var now = Math.round((new Date()).getTime() / 1000);
      var lu = LastUpdate.findOne();
      if (lu && lu.timestamp > now - UPDATE_INTERVALL) return;
      LastUpdate.remove({})
      LastUpdate.insert({timestamp: now})

      this.unblock()
      var data = Meteor.http.get('http://rhok.secondmuse.net/events.xml');

      if(!data['error']) {
        var xml = data['content'];
        var parser = sax.parser(true);

        var currentRun = {
          next: null,
          content: {
            title: null,
            link:  null
          }
        }

        currentRun.reset = function() {
          this.content.title = false
          this.content.link  = false
        }

        parser.onopentag = function(tag) {
          if (tag.name == "item") {
            currentRun.reset();
          };

          currentRun.next = tag.name
        };

        parser.ontext = function(text) {
          if((currentRun.next == 'title' || currentRun.next == 'link') && text.length > 6) {
            currentRun.content[currentRun.next] = text
          }
        };

        parser.onclosetag = function(tagName) {
          if (tagName == "item") {
            // item content is collected, let's commit it if not in DB already
            if (!Locations.findOne({raw_address: currentRun.content.title})) {
              Locations.insert({
                raw_address: currentRun.content.title,
                link:        currentRun.content.link
              })
            }
          }
        }

        parser.write(xml).close();
      }
    }
  });
};
