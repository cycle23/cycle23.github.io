/**
 * Created by Cody on 2/14/2015.
 */
;(function (Game) {
    var Observable = Rx.Observable;

    function Keyboard() {
        // haven't been able to get intelli-J to recognize this method
        var allKeyUps = dom.keyup(document),
            allKeyDowns = dom.keydown(document);

        function keyCodeIs(keyCode) {
            return function(event) { return event.keyCode === keyCode; };
        }

        function keyCodeIsOneOf(keyCodes) {
            return function(event) { return keyCodes.indexOf(event.keyCode) >= 0; };
        }

        function keyUps (keyCode) {
            return allKeyUps.filter(keyCodeIs(keyCode));
        }

        function keyDowns(keyCodes) {
            return allKeyDowns.filter(keyCodeIsOneOf(toArray(keyCodes)))
        }

        /** keyState
         *
         * Use rx.dom.lite keyup and keydown events on the document
         * to map keys to states by the given value.
         *
         * Return a shared, distinct observable sequence, starting with [],
         * and followed by [value],[],[value],[],... for each unique
         * pair of down/up states and their respective assigned values, as they
         * occur.
         *
         * @param keyCode: int
         * @param value: int
         * @returns {Observable}
         */
        function keyState(keyCode, value) {
            return   keyDowns(keyCode).map([value])
                .merge(keyUps(keyCode).map([]))
                .shareValue([])
                .distinctUntilChanged();
        }

        function multiKeyState(keyMap) {
            var streams = keyMap.map(
                function(pair) {
                    return keyState(pair[0], pair[1])
                });
            return Observable.zipArray(streams);
        }

        return {
            multiKeyState : multiKeyState,
            keyDowns : keyDowns,
            anyKey : allKeyDowns
        };
    }

    Game.Keyboard = Keyboard;
}(window.Game));