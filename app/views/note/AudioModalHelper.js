
window.AudioModalHelper = function( note, callback ){

    var self = this;
    this.callback = callback;
    this.note = note;

    if ( this.note == undefined ) {
        this.note = new Note();
    }

    this.onModalClick = function(event) {
        if ( self.modal ) {
            self.modal.close();
            self.modal = undefined;
            self.callback = undefined;
        }
    }

    this.audioCaptureSuccess = function(fileURI) {

        if ( self.modal ) {
            self.modal.close();
            self.modal = undefined;
        }

        if (self.note.ID == undefined && self.note.DETAIL == "") {
            self.note.DETAIL = "Audio Capture";
        }

        console.log( fileURI );
        self.note.soundclips.push( new AssetRef(undefined, fileURI) );
        //self.callback( note );

        window.DatabaseManager.instance.saveNote( self.note, function(){
            self.callback( self.note );
        });
    }

    this.audioCaptureError = function(message) {
        defer(function(){
            navigator.notification.alert(
                'Unable to record audio, or operation cancelled by user.  Please ensure that your device supports audio capture. Message: ' + message,  // message
                null,         // callback
                'Warning',            // title
                'OK'                  // buttonName
            );
        });
        self.onModalClick(event);
    }


    window.AudioCapture.capture(self.audioCaptureSuccess, self.audioCaptureError);
}