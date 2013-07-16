

window.Note = function() {
    this.ID = undefined;
    this.LIST_ID = undefined;
    this.DETAIL = "";
    this.LATITUDE = 0;
    this.LONGITUDE = 0;
    this.LIST_ID = 0;
    this.LOCATION_DETAIL = "";
    this.soundclips = [];
    this.images = [];
}


window.AssetRef = function(id, ref) {
    this.ID = id;
    this.REF = ref;
}