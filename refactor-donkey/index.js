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

        // react library used to paint the event streams (which carry CSS info) to the screen
        var react = Game.DonkeyReact();

        // audio preloads and enables control for initAudio callback
        var audio = Game.DonkeyAudio();

        // game state, collision and object copying (to maintain a functionally immutable state)
        var utils = Game.DonkeyUtils(audio,startGame);

        $(document).on("initAudio", function () {
            $('#start').hide();
            startGame();
        });

        function startGame() {
            var totalScore = 0;

            utils.setActive();

            // the keys (using Mousetrap and RxJS.DOM) and time tick definition
            var keys = Game.DonkeyKeys(utils);

            // moving background (should correlate to tick time)
            // TODO: use a global value for the timeslice
            var ground = Game.DonkeyGround(utils);

            // hater stream currently uses the ground stream
            var hater = Game.DonkeyHater(ground.groundStream, utils);

            // pinkie is the protagonist, responds to the keys/tick and hater streams
            // also triggers the main Donkey class gameOver function
            var pinkie = Game.DonkeyPinkie(keys.tick, hater.haterStream, audio, utils);

            // coin is the goal, responds to pinkie stream
            var coin = Game.DonkeyCoin(pinkie.pinkieStream, audio, utils, hater);

            // stat keeps track of coin stream changes
            var stat = Game.DonkeyStat(coin.coinStream, function (points) {
                    totalScore = points;
                }
            );

            var ticked = keys.tick.connect();
            var groundStreamed = ground.groundStream.connect();
            var haterStreamed = hater.haterStream.connect();
            var pinkieStreamed = pinkie.pinkieStream.connect();
            var coinStreamed = coin.coinStream.connect();
            var statStreamed = stat.statStream.connect();

            Rx.Observable
                .zipArray(keys.tick, ground.groundStream, hater.haterStream, pinkie.pinkieStream, coin.coinStream, stat.statStream)
                .subscribe(react.renderScene);

            console.log("subscribed");
        }

    });
}(window.Game));


