// instantiate the scrollama
const scroller = scrollama();

function handleStepEnter(response) {
    response.element.style.opacity = 1;
}
function handleStepExit(response) {
    if (response.direction === 'up') {
        response.element.style.opacity = 0;
    }
}
// setup the instance, pass callback functions
scroller
    .setup({
        step: ".step",
        debug: true,
        offset: 0.55
    })
    .onStepEnter((handleStepEnter))
   .onStepExit((handleStepExit));