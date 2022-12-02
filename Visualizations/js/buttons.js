

document.getElementById("about1").onclick = () => {
    d3.select("#aboutMap").append('div')
        .attr('class', "hidden")
        .html(`
                         <div class="align-left"
                            style=" padding-top: 2vh ">
                             <h6 class="about">This data was pulled from the GDELT Database. To learn more about GDELT, visit their website here: https://www.gdeltproject.org/<h6>                          
                         </div>`);
}

function aboutData() {
    document.getElementById("about2")
        d3.select("#aboutArea").append('div')
            .attr('class', "visible")
            .html(`
                         <div class="align-left"
                            style=" padding-top: 2vh ">
                             <h6 class="about">This data was pulled from the GDELT Database. To learn more about GDELT, visit their website here: https://www.gdeltproject.org/<h6>                          
                         </div>`);
    }


document.getElementById("about3").onclick = () => {
    d3.select("#aboutTopics").append('div')
        .attr('class', "row dark small justify-content-center")
        .html(`
                         <div class="align-left"
                            style=" padding-top: 2vh ">
                             <h6 class="about">This data was pulled from the GDELT Database. To learn more about GDELT, visit their website here: https://www.gdeltproject.org/<h6>                          
                         </div>`);
}
document.getElementById("about4").onclick = () => {
    d3.select("#aboutChannels").append('div')
        .attr('class', "row dark small justify-content-center")
        .html(`
                         <div class="align-left"
                            style=" padding-top: 2vh ">
                             <h6 class="about">This data was pulled from the GDELT Database. To learn more about GDELT, visit their website here: https://www.gdeltproject.org/<h6>                          
                         </div>`);
}
document.getElementById("about5").onclick = () => {
    d3.select("#aboutTone").append('div')
        .attr('class', "row dark small justify-content-center")
        .html(`
                         <div class="align-left"
                            style=" padding-top: 2vh ">
                             <h6 class="about">This data was pulled from the GDELT Database. To learn more about GDELT, visit their website here: https://www.gdeltproject.org/<h6>                          
                         </div>`);
}
document.getElementById("about6").onclick = () => {
    d3.select("#aboutCasualties").append('div')
        .attr('class', "row dark small justify-content-center")
        .html(`
                         <div class="align-left"
                            style=" padding-top: 2vh ">
                             <h6 class="about">This data was pulled from the GDELT Database. To learn more about GDELT, visit their website here: https://www.gdeltproject.org/<h6>                          
                         </div>`);
}