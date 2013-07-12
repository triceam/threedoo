
window.DeleteItemModalView = Backbone.View.extend({


    initialize: function(options) {

        var type = "";
        var contents = "";
        switch (options.type){
            case "list":
                type = "list";
                contents = "notes";
                break;
            case "note":
                type = "note";
                contents = "contents";
                break;
            case "audio":
                type = "recording";
                contents = "";
                break;
            case "photo":
                type = "photo";
                contents = "";
                break;
        }

        var modalContent = $('<div class="footerOptions">' +
            '<h4>Are you sure you want to delete this ' + type + '?</h4>' +
            (contents != "" ? '<p>Once you delete this ' + type + ', it, and all of its ' + contents + ' will be gone forever.</p>' : "") +
            '<button id="deleteListConfirm" class="warningButton">DELETE ' + type.toUpperCase() + '</button> ' +
            '<button id="keepList" class="defaultButton">KEEP ' + type.toUpperCase() + '</button> ' +
            '</div>');

        var self = this;
        modalContent.find("#deleteListConfirm").bind("click", function(event) {
            self.onDeleteConfirmClick(event);
        });
        modalContent.find("#keepList").bind("click", function(event) {
            self.onKeepListClick(event);
        });

        this.modal = new ModalView( {
            parent: $("body"),
            child: modalContent
        });

        this.modal.$el.bind("click", function(event) {
            self.onKeepListClick(event);
        });
    },

    onDeleteConfirmClick: function(event) {

        if ( this.modal ) {
            this.modal.close();
            this.modal = undefined;
        }

        this.trigger("deleted");

        return killEvent(event);
    },

    onKeepListClick: function(event) {
        if ( this.modal ) {
            this.modal.close();
            this.modal = undefined;
        }

        this.trigger("cancel");
        return killEvent(event);
    },

});


