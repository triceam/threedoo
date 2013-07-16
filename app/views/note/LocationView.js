templates.locationView = "app/views/note/LocationView.html";

window.LocationView = Backbone.View.extend({

    title: "Locations",
    backLabel:" ",

    MAXIMUM_GEO_AGE: 30000,
    GEO_TIMEOUT: 5000,
    FOURSQUARE_TIMEOUT: 20000,
    FOURSQUARE_APP_ID: "0XOM4FJPV4O2GIEU25KBB3CG4ATRQXQCWIPCCKUPZN1UVXTA",
    FOURSQUARE_SECRET: "CYBA5WAM40JCG3GP0H3KWYU0UXTWINCAMXVQVRQIFXYIHO5W",
    FOURSQUARE_API_URL: "https://api.foursquare.com/v2/venues/search?ll={lat},{lon}&client_id={app_id}&client_secret={secret}&v=20130101&limit=15",


    initialize: function(options) {

        if ( options.model ) {
            this.model = options.model;
        }
        this.model.foursuare_locations = [];

        //if default values go ahead and search for location
        if (this.model.LOCATION_DETAIL == "" || this.model.LOCATION_DETAIL == undefined || this.model.LOCATION_DETAIL.length == 0) {
            this.model.location_state = "SEARCHING";
            this.getLocation();
        }
        else {
            this.model.location_state = "COMPLETE";
        }

        var self = this;
        this.headerActions = $("<a class='locationButton' style='display:none'> </a>");
        this.headerActions.bind("click", function(){
            self.model.location_state = "SEARCHING";
            self.render();
            self.getLocation();
        });

        this.render();
        this.view = this.$el;

        this.hideViewCallback = function() {
            delete self.model.foursuare_locations;
        }
    },

    events:{
        "click li": "onListItemClick",
        "click #mapIt": "onMapItClick",
        "click #callNow": "onCallNowClick",
        "click #twitter": "onTwitterClick",
        "click #foursquare": "onFoursquareClick"
    },


    render:function (eventName) {
        console.log("render")
        var template = templates.locationView;
        this.$el.html(template(this.model));

        if ( this.model.location_state != "SEARCHING") {
            this.headerActions.css("display", "inline-block");
        }
        else {

            this.headerActions.css("display", "none");
        }

        setTimeout(function(){
            window.viewNavigator.resetScroller();
        }, 100);

    },

    getLocation: function(event) {
        var self = this;
        var geoSuccess = function(position){
            self.geolocationSuccess(position);
        }
        var geoError = function(error){
            self.geolocationError(error);
        }
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError, { maximumAge: this.MAXIMUM_GEO_AGE, timeout: this.GEO_TIMEOUT, enableHighAccuracy: true });
    },

    geolocationSuccess: function(position) {
        console.log('Latitude: '          + position.coords.latitude          + '\n' +
            'Longitude: '         + position.coords.longitude         + '\n' +
            'Altitude: '          + position.coords.altitude          + '\n' +
            'Accuracy: '          + position.coords.accuracy          + '\n' +
            'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
            'Heading: '           + position.coords.heading           + '\n' +
            'Speed: '             + position.coords.speed             + '\n' +
            'Timestamp: '         + position.timestamp                + '\n');

        var url = this.getFoursquareURL(position);
        console.log(url);

        this.model.LATITUDE = position.coords.latitude;
        this.model.LONGITUDE = position.coords.longitude;

        var self = this;
        $.ajax( url )
            .done(function(data, textStatus, jqXHR) {
                self.onFoursquareResult(data, textStatus, jqXHR);
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                self.onFoursquareError(jqXHR, textStatus, errorThrown);
            });
    },

    geolocationError: function (error) {
        alert('code: '    + error.code    + '\n' +
            'message: ' + error.message + '\n');
    },

    getFoursquareURL:function(position) {
        var url = this.FOURSQUARE_API_URL.replace("{app_id}", this.FOURSQUARE_APP_ID);
        url = url.replace("{secret}", this.FOURSQUARE_SECRET);
        url = url.replace("{lat}", position.coords.latitude );
        url = url.replace("{lon}", position.coords.longitude );
        return url;
    },

    //jqXHR.done(function(data, textStatus, jqXHR) {});
    onFoursquareResult:function (data, textStatus, jqXHR) {
        //console.log(data);
        try {
            this.model.foursuare_locations = data.response.venues;
            this.model.location_state = "RESULTS";
            this.render();
        }
        catch (e) {
            this.model.foursuare_locations = [];
        }

    },

    //jqXHR.fail(function(jqXHR, textStatus, errorThrown) {});
    onFoursquareError:function (jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
        this.model.location_state = "ERROR";
        this.model.location_error = errorThrown;
        this.model.foursuare_locations = [];
        this.render();
    },


    onListItemClick: function(event) {
        var target = $(event.target);

        while ( !target.is("li") ){
            target = target.parent();
        }

        target.addClass("selected");

        var id = target.attr("id");
        var targetData;
        for (var x=0; x< this.model.foursuare_locations.length; x++) {
            if ( this.model.foursuare_locations[x].id == id ) {
                targetData = this.model.foursuare_locations[x];
                break;
            }
        }

        if ( targetData ) {
            this.model.LOCATION_DETAIL = JSON.stringify(targetData);
            this.model.location_data = targetData;
        }

        var self = this;
        window.DatabaseManager.instance.saveNote(this.model, function(){
            self.model.location_state = "COMPLETE";
            window.viewNavigator.replaceView( new LocationView({ model:self.model }) );
        });
    },

    onMapItClick: function(event) {
       NativeUtil.getDirections( this.model.location_data.location.lat, this.model.location_data.location.lng );
    },

    onCallNowClick: function(event) {
        NativeUtil.openExternalURLNoConfirm( "tel:" + this.model.location_data.contact.phone );
    },

    onTwitterClick: function(event) {
        NativeUtil.openExternalURL( "http://twitter.com/" + this.model.location_data.contact.twitter );
    },

    onFoursquareClick: function(event) {
        NativeUtil.openExternalURL( this.model.location_data.canonicalUrl );
    }



});