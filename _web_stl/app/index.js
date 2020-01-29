import "./prepareJquery";
import "./prepareTabulator";
import "./prepareSprintf";
import "./prepareThree";
import "three/examples/js/controls/TrackballControls.js";
import "three/examples/js/loaders/STLLoader.js";
import "./prepareThreeAnnotator";
import slider from "bootstrap-slider";

import "../css/construction.css"
import "@fortawesome/fontawesome-free/css/all.css";
import "bootstrap-slider/dist/css/bootstrap-slider.css";
import "bootstrap/dist/css/bootstrap.css";

console.log(slider);


$(async () => {
    await import("../js/init")
    // Prohibit file drag & drop.
    window.addEventListener('dragover', function(ev){
        ev.preventDefault();
    }, false);
    window.addEventListener('drop', function(ev){
        ev.preventDefault();
        ev.stopPropagation();
    }, false);
    const setMode = mode => {
        $(`[data-mode=${mode}]`).addClass("active");
        $(`[data-mode]:not([data-mode=${mode}])`).removeClass("active");
        $(`[data-mode-show=${mode}]`).show();
        $(`[data-mode-show]:not([data-mode-show=${mode}])`).hide();

        window.MarkerOffOn(mode === "point");
        window.switchAnnotation(mode === "paint");
    }
    $('[data-mode]').click(e => {
        const mode = e.target.getAttribute("data-mode");
        setMode(mode);
    })
    setMode("view")

    $("input.slider").slider();
});

