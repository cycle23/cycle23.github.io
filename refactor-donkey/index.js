/**
 * Created by Cody on 2/15/2015.
 */
;(function (Game, undefined) {

    function resizeCanvas() {
        var canvas = document.getElementById("canvas");
        var scale = window.innerHeight / canvas.clientHeight;
        canvas.style.mozTransform = "scale(" + scale + ")";
        canvas.style.webkitTransform = "scale(" + scale + ")";
        canvas.style.transform = "scale(" + scale + ")";
        canvas.style.width = (window.innerWidth / scale) + "px";
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    Rx.DOM.ready().subscribe(function() {
        // game kicks off by user triggering event listened for within DonkeyAudio
        var audio = Game.DonkeyAudio();
        var react = Game.DonkeyReact();
        var utils = Game.DonkeyUtils();
        // DonkeyAudio will call gameStart from main Donkey class
        //var donkey = Game.Donkey();
    });
}(window.Game));