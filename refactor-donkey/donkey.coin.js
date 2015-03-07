/**
 * donkey.coin.js
 *
 * Adapted from https://www.youtube.com/watch?v=FLSNm7AIBoM
 *
 * Bodil Stokke's Reactive Game Development for the Discerning Hipster talk at jQuery conference, September 2014.
 * And merged with the other versions (boogalo and purescript-is-magic from her github) as well as my own custom code.
 *
 * Using RxJS elements throughout.
 */
;(function(Game,undefined) {
    var coinStream;
    var initialCoin = {
        // see game.css
        id: "coin",
        vx: -6, vy: 0,
        x: 1600, y: 40,
        points: 0
    };
    function DonkeyCoin(pinkie, audio, utils) {
        if (pinkie !== undefined && coinStream === undefined) {
            // want to be able to detect coin to pinkie
            var _coinStream = pinkie.scan(initialCoin, function (c, pinkie) {
                c = utils.velocity(c);
                // will be changing this if she touched, so otherwise..
                if (c.vy < 0) {
                    c.vy = c.vy * 2;
                }
                if (c.vy === 0 && !pinkie.gameOver && utils.intersects(c, pinkie)) {
                    //console.log('coin is hit');
                    audio.effects.play('coin');
                    c.vx = 0;
                    c.vy = -1;
                    c.points += 1;
                }
                if (c.x < -300) {
                    return initialCoin;
                }
                if (c.y < -1000) {
                    v = utils.velocity(initialCoin);
                    v.vx = v.vx * (c.points + 1);
                    v.points = c.points;
                    return v;
                }
                return c;
            })
            .doOnError( function() {
                this.log('coin error');
            }, console)
            .doOnCompleted( function() {
                this.log('coin completed');
            }, console)
            .doOnNext( function() {
                //this.log('coin');
            }, console);

            coinStream = _coinStream.publish();

            console.log('coin init');
        }

        return {
            coinStream: coinStream
        }
    }
    Game.DonkeyCoin = DonkeyCoin;
}(window.Game));

