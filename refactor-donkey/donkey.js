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
        var _tick = Rx.Observable.merge(bindKey("space"),
            bindKey("up"),
            Rx.DOM.fromEvent(Game.canvas, "touchstart"))
            .buffer(Rx.Observable.interval(33))
            .doOnNext( function() {
                    //this.log('tick');
                }, console);

        var tick = _tick.publish();

        var _groundStream = Rx.Observable.interval(33)
            .doOnNext( function() {
                //this.log('ground');
            }, console)
            .map(function (x) {
                return {
                    id: "ground",
                    baseX: 0,
                    y: 320,
                    x: ((x % 280) * -8)
                };
            });

        var groundStream = _groundStream.publish();

        var initialHater = {
            id: "hater",
            vx: -10, vy: 0,
            x: 1600, y: 300
        };

        var totalScore = 0;

        var _haterStream = groundStream.scan(initialHater,
            function (h, g) {
                h = Game.DonkeyUtils().velocity(h);
                h.vx = -8 - (totalScore * 2);
                return Game.DonkeyUtils().onscreen(h) ? h : initialHater;
            })
            .doOnNext( function() {
                //this.log('hater');
            }, console);

        var haterStream = _haterStream.publish();


        // pinkie is the character
        // velocity will be applied and then gravity adjusted each
        // tick scan
        // the keys are mapped here from tick buffer
        var _pinkieStream = Rx.Observable.zipArray(tick, haterStream).scan({
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
                p.gameOver = true;
                // uses react
                p.id = "pinkie gameover";
                p.vy = -20;
                //console.log('game is over');
                Game.DonkeyAudio().effects.play('gameover');
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
                    //console.log('jumping');
                    Game.DonkeyAudio().effects.play('jump');
                }
            }
            else if (keys != undefined && keys[0] != undefined) {
                alert("keys: " + keys[0]);
            }

            return p;
        }).takeWhile(Game.DonkeyUtils().onscreen)
        .doOnNext( function() {
                //this.log('pinkie');
            }, console);

        var pinkieStream = _pinkieStream.publish();

        var initialCoin = {
            id: "coin",
            vx: -6, vy: 0,
            x: 1600, y: 40,
            points: 0
        };

        // want to be able to detect coin to pinkie
        var _coinStream = pinkieStream
            .scan(initialCoin, function (c, pinkie) {
                c = Game.DonkeyUtils().velocity(c);
                // will be changing this if she touched, so otherwise..
                if (c.vy < 0) {
                    c.vy = c.vy * 2;
                }
                if (c.vy === 0 && !pinkie.gameOver && Game.DonkeyUtils().intersects(c, pinkie)) {
                    //console.log('coin is hit');
                    Game.DonkeyAudio().effects.play('coin');
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
            })
            .doOnNext( function() {
                //this.log('coin');
            }, console);

        var coinStream = _coinStream.publish();

        var initialStat = {
            id: "stat",
            x: 0, y: 0,
            points: 0,
            text: "Init.."
        };

        var _statStream = coinStream
            .scan(initialStat, function (s, coin) {
                if (coin.vy === -1) {
                    s.points += coin.points;
                }
                s.text = "Points: " + s.points;
                totalScore = s.points;
                return s;
            })
            .doOnNext( function() {
                //this.log('stat');
            }, console);

        var statStream = _statStream.publish();

        function startGame() {
            var ticked = tick.connect();
            var groundStreamed = groundStream.connect();
            var haterStreamed = haterStream.connect();
            var pinkieStreamed = pinkieStream.connect();
            var coinStreamed = coinStream.connect();
            var statStreamed = statStream.connect();
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

