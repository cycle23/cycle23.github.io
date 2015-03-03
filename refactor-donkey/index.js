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

        // react library used to paint the event streams (which carry CSS info) to the screen
        var react = Game.DonkeyReact();

        // collision and object copying (to maintain a functionally immutable state)
        var utils = Game.DonkeyUtils();

        // the keys (using Mousetrap and RxJS.DOM) and time tick definition
        var keys = Game.DonkeyKeys();

        // moving background (should correlate to tick time)
        // TODO: use a global value for the timeslice
        var ground = Game.DonkeyGround();

        // hater stream currently uses the ground stream
        var hater = Game.DonkeyHater(Game.DonkeyGround().groundStream);

        // pinkie is the protagonist, responds to the keys/tick and hater streams
        // also triggers the main Donkey class gameOver function
        var pinkie = Game.DonkeyPinkie(Game.DonkeyKeys().tick,Game.DonkeyHater().haterStream);

        // coin is the goal, responds to pinkie stream
        var coin = Game.DonkeyCoin(Game.DonkeyPinkie().pinkieStream);

        // stat keeps track of coin stream changes
        var stat = Game.DonkeyStat(Game.DonkeyCoin().coinStream);

        // DonkeyAudio will call gameStart from this main Donkey class which also provides gameOver logic
        var donkey = Game.Donkey();
    });
}(window.Game));


