/**
 * donkey.pinkie.js
 *
 * Adapted from https://www.youtube.com/watch?v=FLSNm7AIBoM
 *
 * Bodil Stokke's Reactive Game Development for the Discerning Hipster talk at jQuery conference, September 2014.
 * And merged with the other versions (boogalo and purescript-is-magic from her github) as well as my own custom code.
 *
 * Using RxJS elements throughout.
 */
;(function(Game,undefined) {
    function DonkeyPinkie(tick,hater,audio,utils) {
        var pinkieStream;
        var pinkieObs = Rx.Observable;
        // pinkie is the character
        // - velocity will be applied and then gravity adjusted each
        //   tick scan
        // - the keys are mapped here from tick buffer
        var _pinkieStream = pinkieObs.zipArray(tick, hater)
            .scan({
                id: "pinkie",
                baseY: 320,
                x: 0, y: 0,
                vx: 0, vy: 0,
                lives: utils.getLives(),
                frames: 0,
                seconds: 0,
                text: "0",
                gameOver: false
            }, function (p, keysAndHaters) {
                var keys = keysAndHaters[0];
                var hater = keysAndHaters[1];
                p = utils.velocity(p);
                p.frames += 1;

                if (!p.gameOver) {
                    if (!(p.frames%30)) {
                        console.log("tock");
                        p.seconds += 1;
                        p.text = p.seconds;
                    }
                    if (p.seconds === 7) {
                        p.id = "pinkie jumping";
                        p.vy = -22;
                        //console.log('jumping');
                        audio.effects.play('jump');
                        console.log("next level");
                        utils.setLives(p.lives - 1);
                        setTimeout(function () {
                            utils.nextLevel();
                        }, 0);
                    }
                    else {
                        if (utils.intersects(p, hater)) {
                            p.gameOver = true;
                            // uses react
                            p.id = "pinkie gameover";
                            p.vy = -20;
                            //console.log('game is over');
                            audio.effects.play('gameover');
                            utils.setLives(p.lives - 1);
                            setTimeout(function () {
                                utils.gameOver();
                            }, 33);
                        }
                    }
                }
                // just drop out.. takeWhile ensures we start over
                if (p.gameOver) {
                    p.vy += 0.5;
                    return p;
                }
                p.vy += 0.88;

                // keep from going under
                if (p.y >= 0 && p.vy > 0) {
                    p.id = "pinkie";
                    p.y = 0;
                    p.vy = 0;
                }
                // see donkey.keys.js
                // 'touches' is provided by react.js
                // TODO: Provide this conditional as a function
                if (keys[0] === "space" ||
                    keys[0] === "up" ||
                    (keys[0] != undefined && keys[0].touches[0] != undefined)) {
                    if (p.y === 0) {
                        p.id = "pinkie jumping";
                        p.vy = -22;
                        //console.log('jumping');
                        audio.effects.play('jump');
                    }
                }
                else if (keys != undefined && keys[0] != undefined) {
                    alert("undefined keys detected: " + keys[0]);
                }

                return p;
            }).takeWhile(utils.onscreen)
        .doOnError(function () {
            this.log('pinkie error');
        }, console)
        .doOnCompleted(function () {
            this.log('pinkie completed');
        }, console)
        .doOnNext(function () {
            //this.log('pinkie');
        }, console);

        pinkieStream = _pinkieStream.publish();

        console.log('pinkie init');

        return {
            pinkieStream: pinkieStream
        }
    }
    Game.DonkeyPinkie = DonkeyPinkie;
}(window.Game));

