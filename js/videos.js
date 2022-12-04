// Event Listener (ranking type)
var selectVideo = d3.select("#videos").on("change", updateVideos);

// Render visualization
function updateVideos() {

    var populateVideo = selectVideo.property('value');
    console.log ('populateVideo')
}