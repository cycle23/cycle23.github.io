/**
 * Created by Cody on 2/15/2015.
 */
;(function (Game, undefined) {
    Rx.DOM.ready().subscribe(function() {
        var audio = Game.DonkeyAudio();
        var donkey = Game.Donkey();
    });
}(window.Game));