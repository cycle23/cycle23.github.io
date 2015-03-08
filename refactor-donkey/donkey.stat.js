/**
 * donkey.stat.js
 *
 * Adapted from https://www.youtube.com/watch?v=FLSNm7AIBoM
 *
 * Bodil Stokke's Reactive Game Development for the Discerning Hipster talk at jQuery conference, September 2014.
 * And merged with the other versions (boogalo and purescript-is-magic from her github) as well as my own custom code.
 *
 * Using RxJS elements throughout.
 */
;(function(Game,undefined) {
    var statStream;
    // The stat stream is used to modify the score based on the coin behavior
    var initialStat = {
        id: "stat",
        x: 0, y: 0,
        points: 0,
        text: "Init.."
    };

    function DonkeyStat(coin,setScore) {

        // this value is kept out of the observable band to avoid circular references.
        // TODO: Setup a more formal event tracker for this that itself may be based on a Subject?

        totalScore = 0;

        var _statStream = coin.scan(initialStat, function (s, coin) {
            if (coin.vy === -1) {
                s.points += coin.points;
            }
            s.text = "Points: " + s.points;
            setScore(s.points);
            return s;
        })
            .doOnError(function () {
                this.log('stat error');
            }, console)
            .doOnCompleted(function () {
                this.log('stat completed');
            }, console)
            .doOnNext(function () {
                //this.log('stat');
            }, console);

        statStream = _statStream.publish();

        console.log('stat init');

        return {
            statStream: statStream,
            totalScore: totalScore
        }
    }
    Game.DonkeyStat = DonkeyStat;
}(window.Game));

