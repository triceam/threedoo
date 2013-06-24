
window.ImageCapture = {
    quality: 25,

    capturePhoto: function(success,error) {
        var self = this;

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
        navigator.camera.getPicture( complete,error, { quality: this.quality,
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

