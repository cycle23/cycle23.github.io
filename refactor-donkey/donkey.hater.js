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
    var haterStream;
    var haterFactor = 0;
    var initialHater = {
        // see game.css
        id: "hater",
        vx: -10, vy: 0,
        x: 1600, y: 300
    };
    function DonkeyHater(ground, utils, getFactor, setFactor) {
        function getFactor() {
            return haterFactor;
        }
        function setFactor(f) {
            haterFactor = f;
        }
        if (ground !== undefined && haterStream === undefined) {
                var _haterStream = ground.scan(initialHater,
                    function (h, g) {
                        h = utils.velocity(h);
                        h.vx = -8 - (getFactor() * 2);
                        if (utils.onscreen(h)) {
                            return h;
                        }
                        else {
                            setFactor(getFactor()+1);
                            return initialHater;
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
        }
        return {
            haterStream: haterStream,
            getFactor: getFactor,
            setFactor: setFactor
        }
    }
    Game.DonkeyHater = DonkeyHater;
}(window.Game));

