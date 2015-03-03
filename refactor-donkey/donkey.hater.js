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
    function DonkeyHater(ground) {
        var initialHater = {
            // see game.css
            id: "hater",
            vx: -10, vy: 0,
            x: 1600, y: 300
        };

        if (ground !== undefined && haterStream === undefined) {
                var _haterStream = ground.scan(initialHater,
                    function (h, g) {
                        h = Game.DonkeyUtils().velocity(h);
                        h.vx = -8 - (Game.DonkeyStat().totalScore * 2);
                        return Game.DonkeyUtils().onscreen(h) ? h : initialHater;
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
            haterStream: haterStream
        }
    }
    Game.DonkeyHater = DonkeyHater;
}(window.Game));

