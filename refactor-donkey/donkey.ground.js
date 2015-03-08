/**
 * donkey.ground.js
 *
 * Adapted from https://www.youtube.com/watch?v=FLSNm7AIBoM
 *
 * Bodil Stokke's Reactive Game Development for the Discerning Hipster talk at jQuery conference, September 2014.
 * And merged with the other versions (boogalo and purescript-is-magic from her github) as well as my own custom code.
 *
 * Using RxJS elements throughout.
 */
;(function(Game,undefined) {
    var groundStream;
    var groundObs = Rx.Observable;
    function DonkeyGround(utils) {

        var _groundStream = groundObs.interval(33).takeWhile(utils.isActive)
            .doOnError(function () {
                this.log('ground error');
            }, console)
            .doOnCompleted(function () {
                this.log('ground completed');
            }, console)
            .doOnNext(function () {
                //this.log('ground');
            }, console)
            .map(function (x) {
                return {
                    // see game.css
                    id: "ground",
                    baseX: 0,
                    y: 320,
                    x: ((x % 280) * -8)
                };
            });

        groundStream = _groundStream.publish();

        console.log('ground init');

        return {
            groundStream: groundStream
        }
    }
    Game.DonkeyGround = DonkeyGround;
}(window.Game));

