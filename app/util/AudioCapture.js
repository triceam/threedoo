
window.AudioCapture = {
    limit: 1,
    duration:120,

    capture: function(success,error) {
    

        var self = this;
        var _success = function(mediafiles) {
            self.captureSuccess( mediafiles, success )
        }

        navigator.device.capture.captureAudio(_success,error, {
            limit: this.limit,
            duration: this.duration
        });
    },

    captureSuccess: function(mediaFiles, callback) {
    	
    	console.log("inside of captureSuccess")
    
        //should only be one sound clip at a time
        var fileURI;
        for (var i = 0; i < mediaFiles.length; i++) {
            fileURI = mediaFiles[i].fullPath;
        }

        console.log( "before" );
        console.log( fileURI );
        console.log( "after" );
        var _callback = function(fileEntry) {
            //pass back a single file URL to caller
            callback( fileEntry.fullPath );
        }
        window.FileUtil.moveToPermanentStorage( fileURI, _callback );
    }
}

