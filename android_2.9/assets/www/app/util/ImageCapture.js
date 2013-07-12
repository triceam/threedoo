
window.ImageCapture = {
    quality: 25,

    capturePhoto: function(success,error) {
        var self = this;

        console.log("capturePhoto")
        var complete = function(fileURI) {
            self.captureComplete( fileURI, success );
        }

        navigator.camera.getPicture( complete,error, { quality: this.quality,
            destinationType: navigator.camera.DestinationType.FILE_URI,
            sourceType: navigator.camera.PictureSourceType.CAMERA,
            correctOrientation: true});



    },

    captureExistingMedia: function(success,error) {
        var self = this;

        var complete = function(fileURI) {
            console.log("captured fileURI:")
            console.log(fileURI)
            self.captureComplete( fileURI, success );
        }
        var _error = function(err) {
	        navigator.notification.alert(
			    'Unable to access image.  ' + err.message,  // message
			    null,         // callback
			    'Error',            // title
			    'OK'                  // buttonName
			);
        	error(err);
        }
        navigator.camera.getPicture( complete,_error, { quality: this.quality,
            destinationType: navigator.camera.DestinationType.FILE_URI,
            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY });
    },


    captureComplete: function( fileURI, callback ) {

        console.log( "before" );
        console.log( fileURI );
        console.log( "after" );
        var _callback = function(fileEntry) {
            callback( fileEntry.fullPath );
        }
        window.FileUtil.moveToPermanentStorage( fileURI, _callback );

    }
}

