
window.ImageModalHelper = function( note, callback ){

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

    this.imageCaptureSuccess = function(imageURI) {

        if ( self.modal ) {
            self.modal.close();
            self.modal = undefined;
        }


        if (self.note.ID == undefined && self.note.DETAIL == "") {
            self.note.DETAIL = "Image Capture";
        }
        self.note.images.push( new AssetRef(undefined, imageURI) );


        window.DatabaseManager.instance.saveNote( self.note, function(){
            self.callback( self.note );
        });
    }

    this.imageCaptureError = function(message) {
        defer(function(){
            navigator.notification.alert(
                'Unable to access image, or cancelled by user.  Message: ' + message,  // message
                null,         // callback
                'Warning',            // title
                'OK'                  // buttonName
            );
        });
        self.onModalClick(event);
    }




    var modalContent = $('<div class="footerOptions">' +
        '<button id="cameraCaptureButton" class="defaultButton"><img src="assets/images/buttons/button_camera_icon.png" />CAMERA</button> <br/> ' +
        '<button id="photoGalleryButton" class="defaultButton"><img src="assets/images/buttons/button_gallery_icon.png" />PHOTO GALLERY</button> <br/>' +
        '<button id="cancelButton" class="warningButton">CANCEL</button> ' +
        '</div>');


    modalContent.find("#cameraCaptureButton").bind("click", function(event) {

        window.ImageCapture.capturePhoto(self.imageCaptureSuccess, self.imageCaptureError);

        event.stopPropagation();
        event.preventDefault();
        return false;
    });

    modalContent.find("#photoGalleryButton").bind("click", function(event) {

        window.ImageCapture.captureExistingMedia(self.imageCaptureSuccess, self.imageCaptureError);

        event.stopPropagation();
        event.preventDefault();
        return false;
    });

    self.modal = new ModalView( {
        parent: $("body"),
        child: modalContent
    });

    self.modal.$el.bind("click", function(event) {
        self.onModalClick(event);
    });

    modalContent.find("#cancelButton").bind("click", function(event) {
        self.onModalClick(event);
    });





}