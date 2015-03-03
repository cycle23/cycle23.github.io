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
    function Donkey() {

        function startGame() {
            var ticked = Game.DonkeyKeys().tick.connect();
            var groundStreamed = Game.DonkeyGround().groundStream.connect();
            var haterStreamed = Game.DonkeyHater().haterStream.connect();
            var pinkieStreamed = Game.DonkeyPinkie().pinkieStream.connect();
            var coinStreamed = Game.DonkeyCoin().coinStream.connect();
            var statStreamed = Game.DonkeyStat().statStream.connect();
            Rx.Observable
                .zipArray(Game.DonkeyGround().groundStream,
                          Game.DonkeyHater().haterStream,
                          Game.DonkeyPinkie().pinkieStream,
                          Game.DonkeyCoin().coinStream,
                          Game.DonkeyStat().statStream)
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

