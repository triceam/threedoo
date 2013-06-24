templates.listview = "app/views/list/ListView.html";
templates.notesListView = "app/views/list/NotesListView.html";

window.ListView = Backbone.View.extend({

    title: "",
    backLabel: " ",
    destructionPolicy:'never',
    scroll: false,
    rendered: false,

    initialize: function(options) {

        this.model = options.model;
        this.model.notes = [];
        this.model.loading = true;

        this.render();
        this.bindExtraEvents();
        this.view = this.$el;

        var self = this;
        this.showViewCallback = function() {
            setTimeout( function(){
                self.onViewShown();
            },100);
        }

        this.hideViewCallback = function() {

            var buttons = self.$el.find(".footer button");
            var mainButton = self.$el.find("#actionsButton");

            buttons.addClass("hiddenButton");
            mainButton.removeClass("close");
        }

        this.listItemClick = function(event){
            return self.onListItemClick(event);
        };

        this.deleteButtonClick = function(event){
            return self.onLiButtonTap(event);
        };

        this.checkboxTap = function(event) {
            return self.onCheckboxTap(event);
        }


        window.DatabaseManager.instance.getNotes( this.model, function(result){
            self.receiveNotes(result);
        });
    },

    animationComplete: function() {

        var self = this;
        defer(function() {
            self.$el.trigger('scroll');
            console.log("triggering scroll");
        })
    },

    onViewShown: function() {
        if ( this.rendered ) {

            if ( this.pendingNote && this.pendingNote.ID != undefined ){
                this.model.notes.push(this.pendingNote);
            }
            this.pendingNote = undefined;
            this.purgeModel();
            this.render();
        }
    },

    events:{
        "click .modal":"onModalClick",
        /*
        "click #renameList":"onRenameClick",
        "click #deleteList":"onDeleteClick",
        "click #actionsButton":"onActionsButtonClick",
        "click #note": "onNoteButtonClick",
        "click #pic": "onPicButtonClick",
        "click #audio": "onAudioButtonClick"      */
    },

    purgeModel:function() {
        for (var y=0; y< this.model.notes.length; y++) {
            var note = this.model.notes[y];
            if ( note.ID < 0 ){
                this.model.notes = _.without(this.model.notes, note);
            }
            else {
                if ( note.images != undefined ){
                    for (var x=0; x< note.images.length; x++) {
                        var image = note.images[x];
                        if ( image.ID == undefined && image.REF == undefined ){
                            note.images = _.without(note.images, image);
                        }
                    }
                }

                if ( note.soundclips != undefined ){
                    for (var x=0; x< note.soundclips.length; x++) {
                        var clip = note.soundclips[x];
                        if ( clip.ID == undefined && clip.REF == undefined ){
                            note.soundclips = _.without(note.soundclips, clip);
                        }
                    }
                }
            }
        }
    },

    render:function (eventName) {
        var template = templates.listview;
        var model = {};
        var self = this;

        if (!this.rendered) {
            this.$el = $(template(model));

            setTimeout( function() {
                self.scroller = new iScroll( "scrollable", {scrollbarClass:"hiddenScrollbar"} );
            }, 10 );

            this.headerActions = $("<div class='topHeaderActionContent' style='min-width:" + ($(window).width()-130) + "px; '><span id='nameSpan' style='max-width:" + ($(window).width()-150) + "px; overflow:hidden; white-space: nowrap; text-overflow: ellipsis; display:inline-block;'>" + this.model.NAME + "</span><img src='assets/images/disclosure.png' /></div>");

        } else {
            this.headerActions.find("#nameSpan").html( this.model.NAME );
        }

        if ( !this.model.loading ) {

            var scrollContent = this.$el.find("#scrollContent");
            scrollContent.empty();
            scrollContent.html( templates.notesListView( this.model ) );

            if (self.scroller){
                self.scroller.refresh();
            }

            if (this.sliderListItem != undefined) {
                this.sliderListItem.dispose();
            }
            this.sliderListItem = new SliderListItem({
                target:this.$el,
                handler:this.deleteButtonClick
            });

            var imgs = this.$el.find("img");
            imgs.lazyload({
                effect       : "fadeIn"
            });

            self.scroller.options.onScrollEnd = function () {
                self.$el.trigger('scroll');
            }

            var ul = this.$el.find("ul");

            ul.unbind("click", self.listItemClick);
            ul.bind("click", self.listItemClick);

            var checkboxes = scrollContent.find("input");
            checkboxes.unbind("click", self.checkboxTap);
            checkboxes.bind("click", self.checkboxTap);
        }

        this.rendered = true;
    },

    bindExtraEvents: function() {
        var self = this;

        this.headerActions.unbind("click").bind("click", function(event){
            return self.headerActionClick(event);
        } );

        this.$el.find("#actionsButton").unbind("click").click(function(event){
            return self.onActionsButtonClick(event);
        });

        this.$el.find("#note").unbind("click").click(function(event){
            return self.onNoteButtonClick(event);
        });

        this.$el.find("#pic").unbind("click").click(function(event){
            return self.onPicButtonClick(event);
        });

        this.$el.find("#audio").unbind("click").click(function(event){
            return self.onAudioButtonClick(event);
        });


    },



    receiveNotes: function (result) {
        //console.log(result);
        this.model.notes = result.rows;
        this.model.loading = false;
        this.render();
        //self.scroller.refresh();
    },

    headerActionClick: function(event) {
        var self = this;

        var modalContent = $('<div class="options">' +
                '<div id="renameList">Rename List</div>' +
                '<div id="deleteList">Delete List</div>' +
            '</div>');


        modalContent.find("#renameList").click(function(event){
            return self.onRenameClick(event);
        });

        modalContent.find("#deleteList").click(function(event){
            return self.onDeleteClick(event);
        });

        if ( this.modal == undefined ) {
            this.modal = new ModalView( {
                parent: this.$el,
                child: modalContent
            });
        }
        else {
            this.modal.close();
            this.modal = undefined;
        }
        //this.$el.find(".modal").removeClass("hidden");

        return killEvent(event);
    },

    onModalClick: function(event) {
        if ( this.modal ) {
            this.modal.close();
            this.modal = undefined;
        }
        //this.$el.find(".modal").addClass("hidden");
    },

    onRenameClick: function(event) {
        if ( this.modal ) {
            this.modal.close();
            this.modal = undefined;
        }

        var self = this;
        defer( function(){
            window.viewNavigator.pushView( new RenameListView({model:self.model}) );
        })
        return killEvent(event);
    },

    onDeleteClick: function(event) {
        if ( this.modal ) {
            this.modal.close();
            this.modal = undefined;
        }

        var self = this;

        this.deleteModal = new DeleteItemModalView({
            model:this.model,
            type:"list"
        })
        this.deleteModal.bind("deleted", function(event){
            self.onListDeleted(event);
        });
        this.deleteModal.bind("cancel", function(event){
            self.onListDeleteCancelled(event);
        });


        return killEvent(event);
    },

    onListDeleted: function(event) {

        this.deleteModal.unbind("deleted");
        this.deleteModal.unbind("cancel");
        this.deleteModal = undefined;
        var self = this;
        if ( this.model != undefined ) {
            window.DatabaseManager.instance.deleteList( this.model, function(){

                window.viewNavigator.popView();
            });
        }

    },

    onListDeleteCancelled: function(event) {

        this.deleteModal.unbind("deleted");
        this.deleteModal.unbind("cancel");
        this.deleteModal = undefined;
        //alert("cancelled");
    },

    onActionsButtonClick: function(event) {
        var buttons = this.$el.find(".footer button");
        var mainButton = this.$el.find("#actionsButton");

        var hidden = buttons.hasClass("hiddenButton");

        if (hidden) {
            buttons.removeClass("hiddenButton");
            mainButton.addClass("close");
        }
        else {
            buttons.addClass("hiddenButton");
            mainButton.removeClass("close");
        }


        /*
        if ( style == "none" ) {
            this.$el.find("#footerActions").css("display", "block");
        }
        else {
            this.$el.find("#footerActions button").css("display", "none");
        }                  */

        return killEvent(event);
    },

    onNoteButtonClick: function(event) {

        var model = new Note();
        model.LIST_ID = this.model.ID;
        var options = {model:model};
        this.pendingNote = model;

        window.viewNavigator.pushView( new NoteView(options) );
        return killEvent(event);
    },

    onPicButtonClick: function(event) {

        var self = this;
        var note = new Note();
        note.LIST_ID = this.model.ID;
        new ImageModalHelper( note, function(note) {
            self.mediaCaptureSuccess(note);
        } );

        return killEvent(event);
    },

    onAudioButtonClick: function(event) {

        var self = this;
        var note = new Note();
        note.LIST_ID = this.model.ID;
        new AudioModalHelper( note, function(note) {
            self.mediaCaptureSuccess(note);
        } );

        return killEvent(event);
    },


    mediaCaptureSuccess : function( note ) {

        note.LIST_ID = this.model.ID;

        var options = {model:note};
        this.pendingNote = note;

        defer(function(){
            window.viewNavigator.pushView( new NoteView(options) );
        })
    },

    onListItemClick: function(event) {
        var target = $(event.target);

        var loopBlocker = 0;
        while ( !target.is("li") ){
            target = target.parent();
            loopBlocker++;
            if (loopBlocker > 5) return;
        }

        target.addClass("selected");
        var id = target.attr( "id" );
        var note;
        for ( var x=0; x<this.model.notes.length; x++ ) {
            if ( id == this.model.notes[x].ID ){
                note = this.model.notes[x];
                break;
            }
        }
        if( note ) {
            this.pendingNote = undefined;

            var cb = function() {
                window.viewNavigator.pushView( new NoteView({model:note}) );
            }

            window.DatabaseManager.instance.getNote(note, cb);
        }

        return killEvent(event);
    },

    onLiButtonTap: function(event) {
        //console.log("tapped");
        var self = this;
        var target = $(event.target);

        var id = target.attr( "id" );

        var self = this;

        this.deleteModal = new DeleteItemModalView({
            model:this.model,
            type:"note"
        })
        this.deleteModal.bind("deleted", function(event){
            self.onNoteDeleted(event, id);
        });
        this.deleteModal.bind("cancel", function(event){
            self.onNoteDeleteCancelled(event);
        });
        return killEvent(event);
    },

    onNoteDeleted: function(event, id) {

        this.deleteModal.unbind("deleted");
        this.deleteModal.unbind("cancel");
        this.deleteModal = undefined;

        var note;
        for (var i=0; i<this.model.notes.length; i++) {
            if (this.model.notes[i].ID == id){
                note = this.model.notes[i];
                break;
            }
        }

        var self = this;
        if ( note != undefined ) {
            window.DatabaseManager.instance.deleteNote( note, function(){
                //alert("note deleted");
                self.purgeModel();

                var li = self.$el.find("li[id='"+id+"']");
                li.animate({
                    opacity:0,
                    height:0
                }, 250, function() {
                    li.remove();
                    self.scroller.refresh();
                });
            });
        }
    },

    onNoteDeleteCancelled: function(event) {

        this.deleteModal.unbind("deleted");
        this.deleteModal.unbind("cancel");
        this.deleteModal = undefined;
        //alert("cancelled");
    },

    onCheckboxTap: function(event) {
        var target = $(event.target);

        while ( !target.is("li") ){
            target = target.parent();
        }

        var id = target.attr( "id" );

        console.log("checkbox " + id);

        var id = target.attr( "id" );
        var note;
        for ( var x=0; x<this.model.notes.length; x++ ) {
            if ( id == this.model.notes[x].ID ){
                note = this.model.notes[x];
                break;
            }
        }
        if( note ) {
            var cb = target.find("input");
            var selected = cb.is(':checked');
            note.COMPLETE = selected;
            window.DatabaseManager.instance.saveNote( note );
        }

        var timeout = target.data( "listTimeout" );
        clearTimeout(timeout);

        var self = this;
        var timeout = setTimeout( function() {
            self.updateListItem(target, note);
        }, 1000 );
        target.data( "listTimeout", timeout );


        return killEvent(event);
    },

    updateListItem: function ( $li, note ) {

        var parent = $li.parent();
        var parentId = parent.attr( "id" );

        console.log(parentId);

        if ( (note.COMPLETE == true || note.COMPLETE == "TRUE") && parentId == "incompleteList") {
            $li.detach();
            this.$el.find( "#completeList").append( $li );
        }


        else if ( !(note.COMPLETE == true || note.COMPLETE == "TRUE") && parentId == "completeList") {
            $li.detach();
            this.$el.find( "#incompleteList").append( $li );
        }
    }

});