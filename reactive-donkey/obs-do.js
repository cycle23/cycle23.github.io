Rx.config.longStackSupport = true;

var seq1 = Rx.Observable.interval(1000)
    .do(function(x) {console.log(x);})
    .bufferWithCount(5)
    .do(function(x) {console.log('buffer is full');})
    .subscribe(
        function(x) {
            console.log('Sum of the buffer is ' + x.reduce(
                function (acc,x) {
                    return acc + x;
                },
                0));
        });

console.log('Current time: ' + Date.now());


var source = Rx.Observable.timer(2000, 1000)
    .timestamp()
    .map(function(x) {
        if (x.value > 1) throw new Error();
        console.log(x.value + ': ' + x.timestamp);
        return x;
    });

source.subscribeOnError(
    function(err) {
        console.log("Hey...");
        console.log(err.stack);
    });

