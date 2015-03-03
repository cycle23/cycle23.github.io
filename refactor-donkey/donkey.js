/**
 * donkey.js
 *
 * Adapted from https://www.youtube.com/watch?v=FLSNm7AIBoM
 *
 * Bodil Stokke's Reactive Game Development for the Discerning Hipster talk at jQuery conference, September 2014.
 * And merged with the other versions (boogalo and purescript-is-magic from her github) as well as my own custom code.
 *
 * Using RxJS elements throughout.
 */
;(function(Game,undefined) {
    function Donkey(keys, ground, hater, pinkie, coin, stat) {

        function startGame() {
            var ticked = keys.tick.connect();
            var groundStreamed = ground.connect();
            var haterStreamed = hater.connect();
            var pinkieStreamed = pinkie.connect();
            var coinStreamed = coin.connect();
            var statStreamed = stat.connect();
            Rx.Observable
                .zipArray(ground, hater, pinkie, coin, stat)
                .subscribe(Game.DonkeyReact().renderScene);
        }

        function gameOver() {
            location.reload(true);
        }

        return {
            startGame: startGame,
            gameOver: gameOver
        }
    }
    Game.Donkey = Donkey;
}(window.Game));

