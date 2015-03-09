/**
 * donkey.hater.js
 *
 * Adapted from https://www.youtube.com/watch?v=FLSNm7AIBoM
 *
 * Bodil Stokke's Reactive Game Development for the Discerning Hipster talk at jQuery conference, September 2014.
 * And merged with the other versions (boogalo and purescript-is-magic from her github) as well as my own custom code.
 *
 * Using RxJS elements throughout.
 */
;(function(Game,undefined) {
    function DonkeyHater(ground, utils) {
        var haterStream;
        var initialHater = {
            // see game.css
            id: "hater",
            vx: -8, vy: 0,
            x: 1600, y: 300,
            text: "0"
        };

        var haterFactor = 0;

        function getFactor() {
            return haterFactor;
        }
        function setFactor(f) {
            //console.log("setting factor from: " + haterFactor + " to " + f);
            haterFactor = f;
        }
        var _haterStream = ground.scan(initialHater,
            function (h, g) {
                var f = getFactor();
                h = utils.velocity(h);
                h.vx = -8 - (f * 2);
                if (h.text != f) {
                    h.text = f;
                }
                if (utils.onscreen(h)) {
                    return h;
                }
                else {
                    //console.log("hater off screen: " + f);
                    setFactor(f+1);
                    var hater = utils.velocity(initialHater);
                    hater.text = f+1;
                    return hater;
                }
            })
            .doOnError(function () {
                this.log('hater error');
            }, console)
            .doOnCompleted(function () {
                this.log('hater completed');
            }, console)
            .doOnNext(function () {
                //this.log('hater');
            }, console);

        haterStream = _haterStream.publish();
        console.log('hater init');

        return {
            haterStream: haterStream,
            getFactor: getFactor,
            setFactor: setFactor
        }
    }
    Game.DonkeyHater = DonkeyHater;
}(window.Game));

