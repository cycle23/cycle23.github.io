/**
 * donkey.js
 *
 * Adapted from https://www.youtube.com/watch?v=FLSNm7AIBoM
 * Bodil Stokke's Reactive Game Development for the Discerning Hipster talk at jQuery conference, September 2014.
 * And merged with the other versions (boogalo and purescript-is-magic from her github) as well as my own custom code.
 */
;(function(Game,undefined) {
    function Donkey() {

        function resizeCanvas() {
            var canvas = document.getElementById("canvas");
            var scale = window.innerHeight / canvas.clientHeight;
            canvas.style.mozTransform = "scale(" + scale + ")";
            canvas.style.webkitTransform = "scale(" + scale + ")";
            canvas.style.transform = "scale(" + scale + ")";
            canvas.style.width = (window.innerWidth / scale) + "px";
        }

        const canvas = document.getElementById("canvas");
        if (isAndroid && isChrome) {
            document.getElementById('android-chrome-note').setAttribute('style', 'visibility:visible');
        }

        // these were explained as inefficient but simple storage copiers to keep items immutable
        function extend(target, src) {
            for (var prop in src) {
                if (src.hasOwnProperty(prop)) {
                    target[prop] = src[prop];
                }
            }
        }

        function assoc() {
            var out = {};
            for (var i = 0; i < arguments.length; i++) {
                extend(out, arguments[i]);
            }
            return out;
        }

        // (final | 0 will drop any decimal portion)
        function coordBI(c, baseC) {
            return (c + (baseC || 0) | 0);
        }

        // just a quick helper to detect if an item is in the view
        function onscreen(node) {
            return !(node.x < -300 || node.y < -1000 || node.y > 1000);
        }

        function velocity(node) {
            // assoc is used like underscore's extend...
            return assoc(node, {
                x: node.x + node.vx,
                y: node.y + node.vy
            });
        }

        function intersects(c, p) {
            var px = coordBI(p.x, p.baseX);
            var cx = coordBI(c.x, c.baseX);
            var py = coordBI(p.y, p.baseY);
            var cy = coordBI(c.y, c.baseY);

            return (Math.abs(cx - px) < 100 && Math.abs(cy - py) < 100);
        }

        function makeElement(node) {
            return React.DOM.div({
                className: node.id,
                style: {
                    left: (node.x + (node.baseX || 0)) | 0 + "px",
                    top: (node.y + (node.baseY || 0)) | 0 + "px"
                }
            }, node.text);
        }

        function renderScene(nodes) {
            return React.renderComponent(
                React.DOM.div(null, nodes.map(makeElement)),
                canvas
            );
        }

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
            Rx.DOM.fromEvent(canvas, "touchstart"))
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


        //var scoreStream = Rx.
        //var haterStream = Rx.Observable.zipArray(groundStream, scoreStream).scan(initialHater,
        //    (h, [g,s]) => {

        // TODO: COME ON1!!?!?!?!?
        var totalScore = 0;

        var haterStream = groundStream.scan(initialHater,
            function (h, g) {
                h = velocity(h);
                h.vx = -8 - (totalScore * 2);
                return onscreen(h) ? h : initialHater;
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
            p = velocity(p);

            if (intersects(p, hater) && !p.gameOver) {
                // seeing this function hit 3x on Chrome with gameOver not true
                // likely due to the merge before?
                p.gameOver = true;
                // uses react
                p.id = "pinkie gameover";
                p.vy = -20;
                $.mbAudio.play('effectSprite', 'gameover');
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
                    $.mbAudio.play('effectSprite', 'jump');
                }
            }
            else if (keys != undefined && keys[0] != undefined) {
                alert("keys: " + keys[0]);
            }

            return p;
        }).takeWhile(onscreen);

        var initialCoin = {
            id: "coin",
            vx: -6, vy: 0,
            x: 1600, y: 40,
            points: 0
        };

        // want to be able to detect coin to pinkie
        var coinStream = pinkieStream
            .scan(initialCoin, function (c, pinkie) {
                c = velocity(c);
                // will be changing this if she touched, so otherwise..
                if (c.vy < 0) {
                    c.vy = c.vy * 2;
                }
                if (c.vy === 0 && !pinkie.gameOver && intersects(c, pinkie)) {
                    $.mbAudio.play('effectSprite', 'coin');
                    c.vx = 0;
                    c.vy = -1;
                    c.points += 1;
                }
                if (c.x < -300) {
                    return initialCoin;
                }
                if (c.y < -1000) {
                    v = velocity(initialCoin);
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
                .subscribe(renderScene);
        }

        function gameOver() {
            location.reload(true);
        }

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        return {
            startGame: startGame
        }
    }
    Game.Donkey = Donkey;
}(window.Game));

