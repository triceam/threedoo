

window.SliderListItem = function(options) {

    var self = this;
    this.target = options.target;
    this.handler = options.handler;

    //Constants for horizontal swip gesture
    this.MAX_VERTICAL_THRESHOLD = 25;
    this.MAX_HORIZONTAL_DISTANCE = -$(window).width()/2;

    this.dispose = function() {
        var ul = self.target.find("ul");

        ul.unbind("touchstart", self.listItemTouchStart);

        //var delButtons = ul.find("button.listDelete");
        //delButtons.unbind("click", self.deleteButtonClick);
    }

    this.listItemTouchStart = function(event){
        return self.onLiTouchStart(event);
    };

    this.onLiTouchStart = function(event) {
        var target = $(event.target);
        while ( !target.is("li") ){
            if ( target.get(0) == this.target.get(0)){
                return;
            }
            target = target.parent();
        }
        var rawTarget = target.get(0);
        var deleteButton = target.find(".listDelete");

        var id = target.attr( "id" );
        target.stop()

        target = target.find(".listContent");
        target.stop()

        if (event.originalEvent != undefined) {
            event = event.originalEvent;
        }

        var touch = event.targetTouches[0];
        jQuery.data( rawTarget, "startPosition", { x:touch.screenX, y:touch.screenY } );
        jQuery.data( rawTarget, "currentPosition", { x:touch.screenX, y:touch.screenY } );

        target.css("-webkit-transition", "none")
        var cleanup = function() {

            jQuery.removeData(rawTarget, "startPosition");
            jQuery.removeData(rawTarget, "currentPosition");

            $(window).unbind("touchmove", touchMove );
            $(window).unbind("touchend", touchEnd );

            //snap position

            var left = parseInt( target.css("left") );
            var translate = target.css("-webkit-transform");
            //console.log(translate);
            var styles = translate.split(",");
            //console.log(styles[4]);

            var left = parseInt( styles[4] );
            if ( isNaN(left)) {
                left = 0;
            }

            if ( left != self.MAX_HORIZONTAL_DISTANCE && left != 0 ){

                var breakpoint = self.MAX_HORIZONTAL_DISTANCE / 2;
                var opacity = 0;

                if ( left < breakpoint ){
                    left = 4*self.MAX_HORIZONTAL_DISTANCE;
                    opacity = 0;

                    window.swishSound.play();
                    setTimeout(function(){
                        self.handler(event);
                    }, 250);
                }
                else {
                    left = 0;
                }

                if ( opacity == 0){
                    deleteButton.css("display", "none");
                }
                else {
                    deleteButton.css("display", "block");
                    deleteButton.css("opacity", opacity);
                }
                // }


                target.css("-webkit-transition", "all 200ms ease-in-out");
                target.css("-webkit-transform", "translate3d( " + left + "px, 0px, 0px )")
                /*
                 target.animate({
                 left:left,
                 avoidTransforms:false,
                 useTranslate3d: true
                 }, 250, complete);
                 */

                /*
                 deleteButton.animate({
                 avoidTransforms:false,
                 useTranslate3d: true,
                 opacity:opacity
                 }, 250); */
            }


        };

        var touchMove = function(evt){

            target.stop()
            if (evt.originalEvent != undefined) {
                evt = evt.originalEvent;
            }
            var touch = evt.targetTouches[0];

            var startPosition = jQuery.data(rawTarget, "startPosition");
            var currentPosition = jQuery.data(rawTarget, "currentPosition");

            var diff = {
                x: currentPosition.x,
                y: currentPosition.y,
            }

            if ( !isNaN( touch.screenX ) ){
                diff.x -= touch.screenX;
                diff.y -= touch.screenY;
            }

            var translate = target.css("-webkit-transform");
            //console.log(translate);
            var styles = translate.split(",");
            //console.log(styles[4]);

            var left = parseInt( styles[4] );
            if ( isNaN(left)) {
                left = 0;
            }
            var x = left - diff.x;

            if ( Math.abs(diff.y) < self.MAX_VERTICAL_THRESHOLD ) {
                x = Math.min( 0, Math.max( x, self.MAX_HORIZONTAL_DISTANCE) )
                var opacity = Math.abs( x / self.MAX_HORIZONTAL_DISTANCE );

                currentPosition.x = touch.screenX;
                /*target.css({
                 left: Math.round( x ) + "px"
                 });  */

                // window.requestAnimationFrame( function(){

                if (Math.abs(currentPosition.x - startPosition.x) > 30 ) {

                    target.css("-webkit-transform", "translate3d( " + Math.round( x ) + "px, 0px, 0px )")
                    /*target.animate({
                     left: Math.round( x ) + "px",
                     avoidTransforms:true,
                     useTranslate3d: true
                     }, 0 );   */

                    if (opacity <= 0){
                        deleteButton.css("display", "none");
                    }
                    else {
                        deleteButton.css("display", "block");
                        deleteButton.css("opacity", opacity);
                        /*deleteButton.animate({
                         avoidTransforms:false,
                         useTranslate3d: true,
                         opacity:opacity
                         }, 0); */
                    }

                }

                //})

            }
            else {
                cleanup();
            }
        };

        var touchEnd = function(evt){
            cleanup();
        };

        $(window).bind("touchmove", touchMove );
        $(window).bind("touchend", touchEnd );
    };



    var ul = this.target.find("ul");

    ul.unbind("touchstart", self.listItemTouchStart);
    ul.bind("touchstart", self.listItemTouchStart);

    //var delButtons = ul.find("button.listDelete");
    //delButtons.unbind("click", self.handler);
    //delButtons.bind("click", self.handler);
}
