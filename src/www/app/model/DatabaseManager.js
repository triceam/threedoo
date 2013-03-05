window.model = {};

window.DatabaseManager = function() {

    this.instance = undefined;
    this.db = undefined;

    this.initialize = function() {
        //initialize to 10 mb
        var defaultSize = 1048576 * 10;
        this.db = window.openDatabase("THREEDOO_DATABASE_1.0", "1.0", "ThreeDoo Data", defaultSize);

        console.log("CREATING TABLES")
        var self= this;
        this.db.transaction(self.createTables, self.errorHandler, function(){
            //alert("success");

            $(window).trigger("databaseReady");
            /*
            console.log("POPULATING SAMPLE DATA")
            self.db.transaction(self.populateSampleData, self.errorHandler, function(){
                alert("success");
                $(window).trigger("databaseReady");
            });
            */
        });

        window.DatabaseManager.instance = this;
    }

    this.createTables = function(tx){

        //cleanup tables

         /*
        tx.executeSql('DROP TABLE IF EXISTS LISTS');
        tx.executeSql('DROP TABLE IF EXISTS NOTES');
        tx.executeSql('DROP TABLE IF EXISTS AUDIO');
        tx.executeSql('DROP TABLE IF EXISTS PHOTOS');
           */

        console.log("dropped existing tables")


        var sql="CREATE TABLE IF NOT EXISTS LISTS ( " +
                    "ID INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    "NAME TEXT, "+
                    "CREATED DEFAULT (datetime('now','localtime')), " +
                    "UPDATED DEFAULT (datetime('now','localtime')) " +
                ")";
        tx.executeSql(sql);
        console.log("created LISTS")

        var sql="CREATE TABLE IF NOT EXISTS NOTES ( " +
            "ID INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "DETAIL TEXT, " +
            "LATITUDE FLOAT, " +
            "LONGITUDE FLOAT, " +
            "LOCATION_DETAIL TEXT, " +
            "LIST_ID INTEGER, "+
            "COMPLETE BOOLEAN DEFAULT FALSE, "+
            "CREATED DEFAULT (datetime('now','localtime')), " +
            "UPDATED DEFAULT (datetime('now','localtime')) " +
            ")";
        tx.executeSql(sql);
        console.log("created NOTES")

        var sql="CREATE TABLE IF NOT EXISTS AUDIO ( " +
            "ID INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "REF TEXT, " +
            "NOTE_ID INTEGER, " +
            "CREATED DEFAULT (datetime('now','localtime'))" +
            ")";
        tx.executeSql(sql);
        console.log("created AUDIO")

        var sql="CREATE TABLE IF NOT EXISTS PHOTOS ( " +
            "ID INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "REF TEXT, " +
            "NOTE_ID INTEGER, " +
            "CREATED DEFAULT (datetime('now','localtime'))" +
            ")";
        tx.executeSql(sql);
        console.log("created PHOTOS")
    }

    this.populateSampleData = function(tx) {

        tx.executeSql('INSERT INTO LISTS (NAME) VALUES ("List 1")');
        tx.executeSql('INSERT INTO LISTS (NAME) VALUES ("List 2")');

        tx.executeSql('INSERT INTO NOTES (DETAIL, LATITUDE, LONGITUDE, LOCATION_DETAIL, LIST_ID) VALUES ("List 1, Note 1", 1.0,1.0, "LOCATION 1", 1)');
        tx.executeSql('INSERT INTO NOTES (DETAIL, LATITUDE, LONGITUDE, LOCATION_DETAIL, LIST_ID) VALUES ("List 1, Note 2", 1.0,1.0, "LOCATION 1", 1)');
        tx.executeSql('INSERT INTO NOTES (DETAIL, LATITUDE, LONGITUDE, LOCATION_DETAIL, LIST_ID) VALUES ("List 2, Note 1", 2.0,2.0, "LOCATION 2", 2)');
        tx.executeSql('INSERT INTO NOTES (DETAIL, LATITUDE, LONGITUDE, LOCATION_DETAIL, LIST_ID) VALUES ("List 2, Note 2", 2.0,2.0, "LOCATION 2", 2)');


    }


    /* LISTS */

    this.getLists = function( callback ) {

        var sql="SELECT ID, NAME, (SELECT Count(ID) FROM NOTES WHERE NOTES.LIST_ID = LISTS.ID) AS NOTES FROM LISTS";
        var cb = this.generateResultCallback(callback);
        this.execute( sql, cb );
    }

    this.saveList = function( list, callback ) {
        var sql = "";

        if ( list.ID == undefined ) {
            sql='INSERT INTO LISTS (NAME) VALUES ("' + list.NAME + '")';
        } else {
            sql='UPDATE LISTS ' +
                "SET NAME='" + list.NAME + "',  UPDATED=datetime('now','localtime')" +
                'WHERE ID= ' + list.ID;
        }

        var cb = this.generateResultCallback(callback);
        this.execute( sql, cb );
    }

    this.errorHandler = function(err) {
        console.log( err );
        alert( err );
    }






    /* NOTES */

    this.getNotes = function( list, callback ) {

        var sql= "SELECT ID, DETAIL, LATITUDE, LONGITUDE, LOCATION_DETAIL, COMPLETE, " +
                 "(select REF from photos where NOTE_ID = notes.id limit 1) as IMAGE, " +
                 "(select count(*) from photos where NOTE_ID = notes.id) as IMAGECOUNT ," +
                 "(select count(*) from audio where NOTE_ID = notes.id) as AUDIO " +
                 "from notes WHERE LIST_ID=" + list.ID;

        var _callback = function(result){
            //unencode location details json strings
            for (var x=0; x<result.rows.length; x++) {
                result.rows[x].LOCATION_DETAIL = decodeURIComponent(result.rows[x].LOCATION_DETAIL)
            }
            callback(result);
        }

        var cb = this.generateResultCallback(_callback);
        this.execute( sql, cb );
    }

    this.getNote = function ( note, callback ) {

        var self = this;
        note.images = [];
        note.soundclips = [];

        var imagesSQL = "select ID, REF from photos where NOTE_ID = " + note.ID;
        var audioSQL = "select ID, REF from audio where NOTE_ID = " + note.ID;

        var getImagesCallback = function (result) {
            note.images = result.rows;
            self.execute( audioSQL, self.generateResultCallback( getAudioCallback ) );
        }

        var getAudioCallback = function (result) {
            note.soundclips = result.rows;
            callback();
        }

        this.execute( imagesSQL, self.generateResultCallback( getImagesCallback ) );

    }

    this.saveNote = function( note, callback ) {
        var sql = "";
        var noteId = note.ID;
        var location_detail = encodeURIComponent(note.LOCATION_DETAIL);

        if ( note.ID == undefined ) {
            sql='INSERT INTO NOTES (DETAIL, LATITUDE, LONGITUDE, LOCATION_DETAIL, COMPLETE, LIST_ID) VALUES ("' +
                note.DETAIL + '", ' +
                note.LATITUDE + ', ' +
                note.LONGITUDE + ', "' +
                location_detail + '", "' +
                ((note.COMPLETE == true) ? "TRUE" : "FALSE") + '", ' +
                note.LIST_ID +
                ')';
        } else {
            sql='UPDATE NOTES SET ' +
                'DETAIL="' + note.DETAIL + '", ' +
                'LATITUDE=' + note.LATITUDE + ', ' +
                'LONGITUDE=' + note.LONGITUDE + ', ' +
                'LOCATION_DETAIL="' + location_detail + '", ' +
                'COMPLETE="' + ((note.COMPLETE == true) ? "TRUE" : "FALSE") + '", ' +
                "UPDATED=datetime('now','localtime') " +
                'WHERE ID= ' + note.ID;
        }

        var self = this;
        var cb = this.generateResultCallback(callback);

        var noteSaveCallback = function (tx, results) {
            if (noteId == undefined) {
                note.ID = results.insertId;
            }

            if ( note.images != undefined && note.images.length > 0 || note.soundclips != undefined && note.soundclips.length > 0 ) {

                self.db.transaction( function(transx) {
                    for (var x=0; x<note.images.length; x++) {
                        if (note.images[x].ID == undefined) {
                            //assign a temp ID just so we know that it is saved
                            note.images[x].ID = -1;
                            sql='INSERT INTO PHOTOS (REF, NOTE_ID) VALUES ("' +
                                note.images[x].REF + '", ' +
                                note.ID +
                                ')';

                            transx.executeSql(sql, [], function(){} );
                        }
                    }
                    for (var x=0; x<note.soundclips.length; x++) {
                        if (note.soundclips[x].ID == undefined) {
                            //assign a temp ID just so we know that it is saved
                            note.soundclips[x].ID = -1;
                            sql='INSERT INTO AUDIO (REF, NOTE_ID) VALUES ("' +
                                note.soundclips[x].REF + '", ' +
                                note.ID +
                                ')';

                            transx.executeSql(sql, [], function(){} );
                        }
                    }
                }, self.errorHandler);
            }
            if ( cb != undefined ) {
                cb(tx, results);
            }



        }

        console.log(sql);

        this.execute( sql, noteSaveCallback );


    }



    this.deleteList = function(list, callback ){

        var self = this;
        this.getNotes( list, function(result){

            var i=-1;
            var notes = result.rows;

            var next = function(){
                i++;
                if (i < notes.length){

                    self.deleteNote( notes[i], next );
                }
                else {

                    var sql= "DELETE FROM LISTS WHERE ID=" + list.ID;
                    var cb = self.generateResultCallback(function(){
                        list.ID = -1;
                        if ( callback ) {
                            callback();
                        }
                    });
                    self.execute( sql, cb );
                }
            }
            next();
        });
    }

    this.deleteNote = function(note, callback) {

        var self = this;
        this.getNote(note, function(){

            var asset, i;
            for (i =0; i<note.images.length; i++){
                asset = note.images[i];
                window.FileUtil.delete( asset.REF );
            }
            for (i =0; i<note.soundclips.length; i++){
                asset = note.soundclips[i];
                window.FileUtil.delete( asset.REF );
            }

            self.db.transaction(function(tx){

                var sql="DELETE FROM PHOTOS WHERE NOTE_ID =" + note.ID;
                tx.executeSql(sql);

                var sql="DELETE FROM AUDIO WHERE NOTE_ID =" + note.ID;
                tx.executeSql(sql);

                var sql="DELETE FROM NOTES WHERE ID =" + note.ID;
                tx.executeSql(sql);

            }, self.errorHandler, function(){

                note.ID = -1;
                if ( callback ) {
                    callback();
                }
            });
        });
    }

    this.deletePhoto = function(asset, callback) {

        window.FileUtil.delete( asset.REF );

        asset.REF = undefined;
        if (asset.ID != undefined) {
            var sql= "DELETE FROM PHOTOS WHERE ID =" + asset.ID;
            var cb = this.generateResultCallback(callback);
            asset.ID = undefined;
            this.execute( sql, cb );
        }
    }

    this.deleteAudio = function() {

        window.FileUtil.delete( asset.REF );

        asset.REF = undefined;
        if (asset.ID != undefined) {
            var sql= "DELETE FROM AUDIO WHERE ID =" + asset.ID;
            var cb = this.generateResultCallback(callback);
            asset.ID = undefined;
            this.execute( sql, cb );
        }
    }





    this.execute = function (sql, cb) {
        var self = this;
        this.db.transaction( function(tx) {
            tx.executeSql(sql, [], cb );
        }, self.errorHandler);
    }

    this.generateResultCallback = function (callback) {
        var cb = function(tx, results){
            var retVal = { rows: [] };
            if ( results.rowsAffected  > 0 ) {
                retVal.rowsAffected = results.rowsAffected;

                try {
                    retVal.insertId = results.insertId;
                }
                catch(e) {/* fail silently if it doesnt exist - it's a websql quirk*/}
            }
            var len = results.rows.length;
            for (var i=0; i<len; i++){
                var obj = {};
                var src = results.rows.item(i);
                for  (var key in src) {
                    obj[key] = src[key];
                }
                retVal.rows.push( obj );
            }
            if (callback) {
                callback( retVal );
            }
        }
        return cb;
    }

    if ( window.DatabaseManager.instance == undefined ){
        this.initialize();
    }
}