/**
 * donkey.keys.js
 *
 * Adapted from https://www.youtube.com/watch?v=FLSNm7AIBoM
 *
 * Bodil Stokke's Reactive Game Development for the Discerning Hipster talk at jQuery conference, September 2014.
 * And merged with the other versions (boogalo and purescript-is-magic from her github) as well as my own custom code.
 *
 * Using RxJS elements throughout.
 */
;(function(Game,undefined) {
    var tick;
    var obs = Rx.Observable;

    function DonkeyKeys() {
        // mousetrap binding, using reactive subject
        // TODO: This may not be completely necessary given use of Rx.DOM anyhow for touch detect
        // It was originally using an ecma6 style lambda, but I watered it down.
        function bindKey(key) {
            console.log("bind key");
            var sub = new Rx.Subject();
            Mousetrap.bind(key, function () {
                sub.onNext(key);
            });
            return sub;
        }

        if (tick === undefined) {

            // - tick is the observable interval at 33ms
            // - buffer will create an array of the number of
            //   merged events during the interval
            // - TODO: Add observable for mouse clicks, and make sure touch delivers coordinates
            //   Want to use this to allow object interaction. For instance, to destroy hater.
            var _tick = obs.merge(bindKey("space"),
                bindKey("up"),
                Rx.DOM.fromEvent(Game.canvas, "touchstart"))
                .buffer(obs.interval(33))
                // these are useful for debugging, but of course noisy
                // TODO: make a debug v. release logic instead of manual commenting
                .doOnError(function () {
                    this.log('tick error');
                }, console)
                .doOnCompleted(function () {
                    this.log('tick completed');
                }, console)
                .doOnNext(function () {
                    //this.log('tick');
                }, console);

            // This publish pattern is setup and triggered later by the connect calls for startGame
            // in order to avoid duplicating side effects due to the many observable streams being established per tick.
            // TODO: Create a specialized class for this pattern
            tick = _tick.publish();

            console.log('tick init');
            if (tick === undefined) {
                console.log("but yet...");
            }
        }

        return {
            tick: tick
        }
    }
    Game.DonkeyKeys = DonkeyKeys;
}(window.Game));

