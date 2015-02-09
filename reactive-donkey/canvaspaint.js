(function (window,undefined) {
    function getOffset(event) {
        return {
            // these aren't always equivalent
            offsetX: event.offsetX === undefined ? event.layerX : event.offsetX,
            offsetY: event.offsetY === undefined ? event.layerY : event.offsetY
        };
    }

    function main() {
        var canvas = document.getElementById('tutorial');

        if (canvas.getContext) {
            var ctx = canvas.getContext('2d');
            ctx.beginPath();

            var move = 'mousemove', down='mousedown', up = 'mouseup';
            if (window.navigator.pointerEnabled) {
                move = 'pointermove';
                down = 'pointerdown';
                up = 'pointerup';
            }

            var mouseMoves = Rx.Observable.fromEvent(canvas, move);

            var mouseDiffs = mouseMoves.zip(mouseMoves.skip(10), function(fst, snd) {
                return {first: getOffset(fst), second: getOffset(snd) };
            });

            var mouseButton = Rx.Observable.fromEvent(canvas,down).map(function () { return true; })
                .merge(Rx.Observable.fromEvent(canvas, up).map(function () { return false; }));

            var paint = mouseButton.flatMapLatest(function (down) {
                return down ? mouseDiffs : mouseDiffs.take(0) });

            paint.subscribe(function (x) {
                ctx.moveTo(x.first.offsetX, x.first.offsetY);
                ctx.lineTo(x.second.offsetX, x.second.offsetY);
                ctx.stroke();
            });
        }
    }

    main();
}(window));