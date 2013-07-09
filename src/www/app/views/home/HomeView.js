templates.homeView = "app/views/home/HomeView.html";

window.HomeView = Backbone.View.extend({

    title: "",
    destructionPolicy:'never',
    model: {
        loading:true
    },
    rendered:false,

    initialize: function(options) {
        var self = this;
        $(window).bind("databaseReady", function(event){
            self.databaseReady(event);
        })


        this.render();
        this.view = this.$el;

        this.showViewCallback = function() {
            self.onViewShown();
        }

        this.listItemTap = function(event){
            return self.listItemClick(event);
        };

        this.deleteButtonClick = function(event){
            return self.onLiButtonTap(event);
        };
    },

    onViewShown: function() {
        if ( this.rendered ) {
            this.purgeModel();
            this.render();
        }
    },

    events:{
        "keypress input":"addNewList"
    },

    /*,
     "tap li":"listItemClick",
     "touchstart li":"onLiTouchStart",
     "tap button.listDelete":"onLiButtonTap"*/


    purgeModel:function() {
        if ( this.model.list != undefined ) {
            for (var x=0; x< this.model.list.length; x++) {
                var list = this.model.list[x];
                if ( list.ID < 0 ){
                    this.model.list = _.without(this.model.list, list);
                }
            }
        }

    },

    render:function (eventName) {
        var template = templates.homeView;


        this.$el.html(template(this.model));


        this.headerActions = $("<div style='text-align:center; color:white; min-width:" + ($(window).width()-260) + "px; margin-right:120px; margin-top:-3px;'><img src='assets/images/threedoo_header_logo.png' /></div></div>");


        if (this.sliderListItem != undefined) {
            this.sliderListItem.dispose();
        }
        this.sliderListItem = new SliderListItem({
            target:this.$el,
            handler:this.deleteButtonClick
        });

        var ul = this.$el.find("ul");

        ul.unbind("click", this.listItemTap);
        ul.bind("click", this.listItemTap);

        this.rendered = true;
    },

    databaseReady: function(event) {
        var self = this;
        window.DatabaseManager.instance.getLists( function(result){
            self.receiveLists(result);
        });
    },

    receiveLists: function (result) {
        console.log(result);
        this.model.loading = false;
        this.model.list = result.rows;
        this.render();
        window.viewNavigator.resetScroller();

        //defer until after render & dom painted
        setTimeout( function() {
            var emulated = window.tinyHippos != undefined;
            if (!emulated) {
                navigator.splashscreen.hide();
            }
        }, 1);
    },

    addNewList: function(event) {
        var self = this;
        //if "enter" key
        if ( event.keyCode == "13" ) {
            $(event.target).blur();
            var listName = _.escape( $(event.target).val() );

            var list = {
                NAME: listName
            }
            window.DatabaseManager.instance.saveList( list, function(result){

                list.ID = result.insertId;
                self.model.list.push( list );
                window.viewNavigator.pushView( new ListView({model:list}) );
            } );

        }
    },

    listItemClick: function (event) {
        var target = $(event.target);

        var loopBlocker = 0;
        while ( !target.is("li") ){
            target = target.parent();
            loopBlocker++;
            if (loopBlocker > 5) return;
        }

        target.addClass("selected");
        var id = target.attr( "id" );
        var list;
        for ( var x=0; x<this.model.list.length; x++ ) {
            if ( id == this.model.list[x].ID ){
                list = this.model.list[x];
                break;
            }
        }
        if( list ) {
            window.viewNavigator.pushView( new ListView({model:list}) );
        }
    },

    onLiButtonTap: function(event) {
        //console.log("tapped");
        var self = this;
        var target = $(event.target);

        var id = target.attr( "id" );

        this.deleteModal = new DeleteItemModalView({
            model:{},
            type:"list"
        })
        this.deleteModal.bind("deleted", function(event){
            self.onListDeleted(event ,id);
        });
        this.deleteModal.bind("cancel", function(event){
            self.onListDeleteCancelled(event);
        });
        return killEvent(event);
    },



    onListDeleted: function(event, id) {

        this.deleteModal.unbind("deleted");
        this.deleteModal.unbind("cancel");
        this.deleteModal = undefined;

        var list;
        for (var i=0; i<this.model.list.length; i++) {
            if (this.model.list[i].ID == id){
                list = this.model.list[i];
                break;
            }
        }

        var self = this;
        if ( list != undefined ) {
            window.DatabaseManager.instance.deleteList( list, function(){
                //alert("list deleted");
                self.purgeModel();

                var li = self.$el.find("li[id='"+id+"']");
                li.animate({
                    opacity:0,
                    height:0
                }, 200, function() {
                    li.remove();

                    if (self.model.list.length <= 0) {
                        self.render();
                    }
                    else {
                        window.viewNavigator.refreshScroller();
                    }
                });


            });
        }
    },

    onListDeleteCancelled: function(event) {

        this.deleteModal.unbind("listDeleted");
        this.deleteModal.unbind("cancel");
        this.deleteModal = undefined;
        //alert("cancelled");
    },
});

window.HomeView.getStyleFor = function(index) {
    var i = index % 12;

    switch (i) {
        case 0:
            return "row0"; break;
        case 1:
        case 11:
            return "row1"; break;
        case 2:
        case 10:
            return "row2"; break;
        case 3:
        case 9:
            return "row3"; break;
        case 4:
        case 8:
            return "row4"; break;
        case 5:
        case 7:
            return "row5"; break;
        case 6:
            return "row6"; break;
    }

    return "row0";
}