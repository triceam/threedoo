window.FileUtil = {

    fileSystem: undefined,
    appFolder: "threedoo",

    initialize: function() {
        var self = this;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {

                self.fileSystem = fileSystem;
                console.log(fileSystem.name);
                console.log(fileSystem.root.name);
                console.log(fileSystem.root.fullPath);
            },
            function(event){
                console.log( evt.target.error.code );
            });
    },

    moveToPermanentStorage: function ( tmpURI, callback ) {

        var emulated = window.tinyHippos != undefined;
        if ( emulated ){
            callback( { fullPath: tmpURI } );
            return;
        }

        var prefix = "file://localhost"
        if (tmpURI.indexOf(prefix) == 0) {
            tmpURI = tmpURI.substr( prefix.length );
        }

        if (tmpURI.indexOf("/" == 0)) {

            tmpURI = "file://" + tmpURI;
        }

        console.log ("tmpURI:" + tmpURI)

        var self = this;
        window.resolveLocalFileSystemURI( tmpURI, function(entry){
            var fileEntry = entry;

            self.fileSystem.root.getDirectory( self.appFolder,
                {create:true},
                function(directory) {

                    var fileName = new Date().getTime().toString() + "_" + fileEntry.name;

                    fileEntry.moveTo(directory, fileName,
                        function(movedEntry){
                            console.log( movedEntry.fullPath )
                            callback( movedEntry );
                        },
                    function(error){
                        self.writeError(error);
                    });
                },
                function(error){
                    self.writeError(error);
                });

        }, function(error){
            self.writeError(error);
        } );

    },

    delete: function( uri ) {

        var self = this;
        window.resolveLocalFileSystemURI( uri, function(entry){

            function success(entry) {
                console.log("Removal succeeded for: " + uri);
            }

            function fail(error) {
                alert('Error removing file: ' + error.code);
            }

            // remove the file
            entry.remove(success, fail);

        }, function(error){
            console.log(error.code)
        } );
    },

    writeError:function(error) {
        console.log("ERROR");
        switch (error.code) {
            case FileError.NOT_FOUND_ERR:
                console.log("FileError.NOT_FOUND_ERR");
                break;
            case FileError.SECURITY_ERR:
                console.log("FileError.SECURITY_ERR");
                break;
            case FileError.ABORT_ERR:
                console.log("FileError.ABORT_ERR");
                break;
            case FileError.NOT_READABLE_ERR:
                console.log("FileError.NOT_READABLE_ERR");
                break;
            case FileError.ENCODING_ERR:
                console.log("FileError.ENCODING_ERR");
                break;
            case FileError.NO_MODIFICATION_ALLOWED_ERR:
                console.log("FileError.NO_MODIFICATION_ALLOWED_ERR");
                break;
            case FileError.INVALID_STATE_ERR:
                console.log("FileError.INVALID_STATE_ERR");
                break;
            case FileError.SYNTAX_ERR:
                console.log("FileError.SYNTAX_ERR");
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                console.log("FileError.INVALID_MODIFICATION_ERR");
                break;
            case FileError.QUOTA_EXCEEDED_ERR:
                console.log("FileError.QUOTA_EXCEEDED_ERR");
                break;
            case FileError.TYPE_MISMATCH_ERR:
                console.log("FileError.TYPE_MISMATCH_ERR");
                break;
            case FileError.PATH_EXISTS_ERR:
                console.log("FileError.PATH_EXISTS_ERR");
                break;
            default:
                console.log("UNKOWN ERROR");
                break;
        }
        console.log(error);
    }

}