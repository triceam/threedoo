templates.noteView = "app/views/note/NoteView.html";

window.NoteView = Backbone.View.extend({

    title: "Add Note",
    backLabel:" ",
    dirty: false,
    audioPlayer: undefined,

    initialize: function(options) {

        if ( options.model ) {
            this.model = options.model;
        }

        if ( this.model.LOCATION_DETAIL != undefined && this.model.LOCATION_DETAIL.length > 0 ) {

            try {
                this.model.location_data = JSON.parse( this.model.LOCATION_DETAIL );
            }
            catch (e) {
                console.log(e);
            }
        }

        if ( this.model.location_data == undefined ) {
            this.model.location_data = {
                name:"No Location Added"
            };
        }

        this.render();
        this.view = this.$el;


        var self = this;
        this.showViewCallback = function() {
            this.purgeModel();
            self.render();
        }

        this.hideViewCallback = function() {
            self.onViewHidden();
        }

        this.shouldChangeView = function() {

            return self.onShouldChangeView();
        }
    },

    events:{
        "keyup textarea":"onTextInputChange",
        "change textarea":"onTextInputChange",
        "click #addLocationButton": "onLocationButtonClick",
        "click #addPhotoButton": "onPicButtonClick",
        "click #addAudioButton": "onAudioButtonClick",
        "click img": "onPhotoClick",
        "click #playButton": "onAudioPlayClick",
        "click #deleteButton": "onAudioDeleteClick",
        "click #toggleKeyboard": "toggleKeyboard",
        "focus #noteContent": "noteContentFocusChange",
        "blur #noteContent": "noteContentFocusChange"
    },

    render:function (eventName) {

        var template = templates.noteView;
        this.$el.html(template(this.model));
        if (device.platform != "Android") {
            this.$el.find("#toggleKeyboard").removeClass("hidden");
        }
        this.$el.find("#noteContent").css("width", ($(window).width()-96)+"px"  );
    },

    purgeModel:function() {
        for (var x=0; x< this.model.images.length; x++) {
            var image = this.model.images[x];
            if ( image.ID == undefined && image.REF == undefined ){
                this.model.images = _.without(this.model.images, image);
            }
        }
        for (var x=0; x< this.model.soundclips.length; x++) {
            var clip = this.model.soundclips[x];
            if ( clip.ID == undefined && clip.REF == undefined ){
                this.model.soundclips = _.without(this.model.soundclips, clip);
            }
        }
    },

    toggleKeyboard: function (event) {

        var textarea = this.$el.find("#noteContent");

        var button = this.$el.find("#toggleKeyboard");
        if ( button.hasClass( "closeKeyboard" ) ) {

            textarea.blur();
        }
        else {

            textarea.focus();
        }

    },

    noteContentFocusChange: function(event) {

        var button = this.$el.find("#toggleKeyboard");
        if ( event.type == "focusin" ) {
            button.addClass( "closeKeyboard" );
        }
        else {
            button.removeClass( "closeKeyboard" );
        }
    },

    onTextInputChange: function(event) {
        this.dirty = true;
    },

    onShouldChangeView: function() {

        this.stopAudio();


        if ( this.dirty ) { //||attachmentsDirty ) {

            var self = this;

            var textarea = this.$el.find("textarea");
            var value = textarea.val();

            var model = this.model;
            model.DETAIL = value;

            //wait until data is saved before popping the view
            window.DatabaseManager.instance.saveNote( model, function(){
                self.dirty = false;
                if ( self.pendingView ){
                    window.viewNavigator.pushView( self.pendingView );
                    self.pendingView = undefined;
                }
                else {
                    window.viewNavigator.popView();
                    self.pendingView = undefined;
                }
            });
        }
        return !this.dirty;
    },

    onViewHidden: function() {

    },



    onPicButtonClick: function(event) {

        var self = this;
        var textarea = this.$el.find("textarea");
        var value = textarea.val();
        this.model.DETAIL = value;

        new ImageModalHelper( this.model, function(note) {
            self.mediaCaptureSuccess(note);
        } );

    },

    onAudioButtonClick: function(event) {

        var self = this;
        var textarea = this.$el.find("textarea");
        var value = textarea.val();
        this.model.DETAIL = value;

        new AudioModalHelper( this.model, function(note) {
            self.mediaCaptureSuccess(note);
        } );
    },


    mediaCaptureSuccess : function( note ) {

        this.render();
        setTimeout(function(){
            window.viewNavigator.resetScroller();
        }, 500);
    },

    onPhotoClick: function (event) {

        var index = parseInt( $(event.target).attr("index") );
        var model;
        if (! isNaN(index)) {
            model = this.model.images[ index ];
            this.pendingView = new PhotoDetailView({model:model});
            window.viewNavigator.pushView(  this.pendingView );
        }
    },

    onLocationButtonClick: function(event) {

        var view = new LocationView({model:this.model});
        if ( this.dirty ) {
            this.pendingView = view;
        }
        window.viewNavigator.pushView( view );

    },

    stopAudio: function() {
        if (this.audioPlayer != undefined){
            this.audioPlayer.stop();
            this.audioPlayer.release();
        }
        clearInterval(this.audioInterval);
        var progress = this.$el.find("#progress");
        progress.css("width", "0%");

        this.$el.find("#playButton").removeClass("pauseButton");

    },

    onAudioPlayClick: function(event) {

        var self = this;
        this.stopAudio();

        var target = $(event.target);

        while ( !target.is("li") ){
            target = target.parent();
        }

        var src = target.attr("src");
        var progress = target.find("#progress");
        this.audioId = target.attr("id");
        target.find("#playButton").addClass("pauseButton");

        this.audioPlayer = new Media(src, function(success){
            console.log(success);
            self.stopAudio();
        }, function(error){
            console.log(error);
            self.stopAudio();
        });
        this.audioPlayer.play();

        this.audioInterval = setInterval( function(){

            console.log( "interval" );


            self.audioPlayer.getCurrentPosition( function(position) {
                var percent = 0;
                if (position > -1) {
                    percent = (position/self.audioPlayer.getDuration())*100;
                }

                //console.log( percent+"%" );

                progress.width( percent+"%");

            } );

        }, 500);
    },


    onAudioDeleteClick: function(event) {

        var self = this;
        this.stopAudio();

        var target = $(event.target);

        while ( !target.is("li") ){
            target = target.parent();
        }

        this.deleteModal = new DeleteItemModalView({
            type:"audio"
        })
        this.deleteModal.bind("deleted", function(event){

            var src =target.attr("src");
            var asset = undefined;
            for (var x=0; x< self.model.soundclips.length; x++){
                if(self.model.soundclips[x].REF == src) {
                    asset = self.model.soundclips[x];
                }
            }
            window.DatabaseManager.instance.deleteAudio(asset, function(){

                self.purgeModel();
                target.remove();
                window.viewNavigator.refreshScroller();
            });
        });
        this.deleteModal.bind("cancel", function(event){

        });
        return killEvent(event);
    }

});