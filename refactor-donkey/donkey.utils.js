/**
 * Created by Cody on 2/15/2015.
 */
;(function(Game,undefined) {
    var levelActive = false;
    function DonkeyUtils(audio,startGame) {
        // these were explained as inefficient but simple storage copiers to keep items immutable
        //console.log("utils init");
        function extend(target, src) {
            for (var prop in src) {
                if (src.hasOwnProperty(prop)) {
                    target[prop] = src[prop];
                }
            }
        }

        function setActive() {
            audio.background.play();
            levelActive = true;
        }

        function isActive(node) {
            return levelActive;
        }

        function levelEnd(pinkieDied) {
            if (pinkieDied) {
                console.log("poor pinkie");
                setTimeout(function () {
                    console.log("set inactive");
                    audio.background.stop();
                    levelActive = false;
                    setTimeout(function () {
                        console.log("reload");
                        //startGame();
                        location.reload(true);
                    }, 2000);
                }, 7000);
            }
            else {
                console.log("alright, next level shit!");
            }
        }

        function assoc() {
            var out = {};
            for (var i = 0; i < arguments.length; i++) {
                extend(out, arguments[i]);
            }
            return out;
        }

        function gameOver() {
            levelEnd(true);
        }

        // (final | 0 will drop any decimal portion)
        function coordBI(c, baseC) {
            return (c + (baseC || 0) | 0);
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

        // just a quick helper to detect if an item is in the view
        function onscreen(node) {
            if (node.x < -300 || node.y < -1000 || node.y > 1000) {
                console.log("node: " + node.x + ", " + node.y);
            }
            return !(node.x < -300 || node.y < -1000 || node.y > 1000);
        }

        return {
            intersects : intersects,
            onscreen : onscreen,
            velocity : velocity,
            gameOver: gameOver,
            setActive: setActive,
            isActive: isActive
        }
    }

    Game.DonkeyUtils = DonkeyUtils;
}(window.Game));
