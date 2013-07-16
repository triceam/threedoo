window.ModalView = Backbone.View.extend({

    title: "Reaname list",
    backLabel:"X",
    parent:undefined,
    child:undefined,

    initialize: function(options) {

        this.parent = options.parent;
        this.child = options.child;

        this.render();
        this.view = this.$el;
    },

    events:{
    },

    render:function (eventName) {
        var html = '<div class="modal" />';
        this.$el = $(html);

        this.$el.append( this.child );
        this.parent.append( this.$el );
    },

    close: function() {
        var self = this;

        //kill extraneous touch events
        this.$el.bind("touchstart", function(event){
            return killEvent(event);
        });

        this.$el.animate({
            opacity:0
        }, 250, function(){
            self.child.remove();
            self.$el.remove();
        })
    }
});