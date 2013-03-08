
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

        if (self.note.ID == undefined) {
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
        //alert(message);
        this.onModalClick(event);
    }


    window.AudioCapture.capture(self.audioCaptureSuccess, self.audioCaptureError);
}