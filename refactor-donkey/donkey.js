/**
 * donkey.js
 *
 * Adapted from https://www.youtube.com/watch?v=FLSNm7AIBoM
 * Bodil Stokke's Reactive Game Development for the Discerning Hipster talk at jQuery conference, September 2014.
 * And merged with the other versions (boogalo and purescript-is-magic from her github) as well as my own custom code.
 */
;(function(Game,undefined) {
    function Donkey() {
        // mousetrap binding, using emca6/harmony lambda and reactive subject
        function bindKey(key) {
            var sub = new Rx.Subject();
            Mousetrap.bind(key, function () {
                sub.onNext(key);
            });
            return sub;
        }

        // - tick is the observable interval at 33ms
        // - buffer will create an array of the number of
        //   merged events during the interval
        // - but we are only reading the first event,
        //   and only by PinkieStream
        // TODO: don't use merge. I think this triples the events delivered and leads to issues on Chrome on Windows, at least.
        // (buffer + scan(1)?)
        var tick = Rx.Observable.merge(bindKey("space"),
            bindKey("up"),
            Rx.DOM.fromEvent(Game.canvas, "touchstart"))
            .buffer(Rx.Observable.interval(33));

        var groundStream = Rx.Observable.interval(33)
            .map(function (x) {
                return {
                    id: "ground",
                    baseX: 0,
                    y: 320,
                    x: ((x % 280) * -8)
                };
            });


        var initialHater = {
            id: "hater",
            vx: -10, vy: 0,
            x: 1600, y: 300
        };

        var totalScore = 0;

        var haterStream = groundStream.scan(initialHater,
            function (h, g) {
                h = Game.DonkeyUtils().velocity(h);
                h.vx = -8 - (totalScore * 2);
                return Game.DonkeyUtils().onscreen(h) ? h : initialHater;
            });

        // pinkie is the character
        // velocity will be applied and then gravity adjusted each
        // tick scan
        // the keys are mapped here from tick buffer
        var pinkieStream = Rx.Observable.zipArray(tick, haterStream).scan({
            id: "pinkie",
            baseY: 320,
            x: 0, y: 0,
            vx: 0, vy: 0,
            lives: 3,
            gameOver: false
        }, function (p, keysAndHaters) {
            var keys = keysAndHaters[0];
            var hater = keysAndHaters[1];
            p = Game.DonkeyUtils().velocity(p);

            if (Game.DonkeyUtils().intersects(p, hater) && !p.gameOver) {
                // seeing this function hit 3x on Chrome with gameOver not true
                // likely due to the merge before?
                p.gameOver = true;
                // uses react
                p.id = "pinkie gameover";
                p.vy = -20;
                //$.mbAudio.play('effectSprite', 'gameover');
                setTimeout(function () {
                    gameOver();
                }, 10000);
                p.lives -= 1;
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

            if (keys[0] === "space" ||
                keys[0] === "up" ||
                (keys[0] != undefined && keys[0].touches[0] != undefined)) {
                if (p.y === 0) {
                    p.id = "pinkie jumping";
                    p.vy = -22;
                    //$.mbAudio.play('effectSprite', 'jump');
                }
            }
            else if (keys != undefined && keys[0] != undefined) {
                alert("keys: " + keys[0]);
            }

            return p;
        }).takeWhile(Game.DonkeyUtils().onscreen);

        var initialCoin = {
            id: "coin",
            vx: -6, vy: 0,
            x: 1600, y: 40,
            points: 0
        };

        // want to be able to detect coin to pinkie
        var coinStream = pinkieStream
            .scan(initialCoin, function (c, pinkie) {
                c = Game.DonkeyUtils().velocity(c);
                // will be changing this if she touched, so otherwise..
                if (c.vy < 0) {
                    c.vy = c.vy * 2;
                }
                if (c.vy === 0 && !pinkie.gameOver && Game.DonkeyUtils().intersects(c, pinkie)) {
                    //$.mbAudio.play('effectSprite', 'coin');
                    c.vx = 0;
                    c.vy = -1;
                    c.points += 1;
                }
                if (c.x < -300) {
                    return initialCoin;
                }
                if (c.y < -1000) {
                    v = Game.DonkeyUtils().velocity(initialCoin);
                    v.vx = v.vx * (c.points + 1);
                    v.points = c.points;
                    return v;
                }
                return c;
            });

        var initialStat = {
            id: "stat",
            x: 0, y: 0,
            points: 0,
            text: "Init.."
        };

        var statStream = coinStream
            .scan(initialStat, function (s, coin) {
                if (coin.vy === -1) {
                    s.points += coin.points;
                }
                s.text = "Points: " + s.points;
                totalScore = s.points;
                return s;
            });
        function startGame() {
            Rx.Observable
                .zipArray(groundStream, haterStream, pinkieStream, coinStream, statStream)
                .subscribe(Game.DonkeyReact().renderScene);
        }

        function gameOver() {
            location.reload(true);
        }

        return {
            startGame: startGame
        }
    }
    Game.Donkey = Donkey;
}(window.Game));

