function createMessage(actual, expected) {
    return 'Expected: [' + expected.toString() + ']\r\nActual: [' + actual.toString() + ']';
}

var collectionAssert = {
    assertEqual: function (expected, actual) {
        var comparer = Rx.internals.isEqual,
            isOk = true;

        if (expected.length !== actual.length) {
            ok(false, 'Not equal length. Expected: ' + expected.length + 'Actual: ' + actual.length);
            return;
        }

        for (var i = 0, len = expected.length;  i < len; i++) {
            isOk = comparer(expected[i], actual[i]);
            if (!isOk) {
                break;
            }
        }

        ok(isOk, createMessage(expected, actual));
    }
};

var onNext = Rx.ReactiveTest.onNext,
    onCompleted = Rx.ReactiveTest.onCompleted,
    subscribe = Rx.ReactiveTest.subscribe;

test('buffer should join strings', function() {
    var scheduler = new Rx.TestScheduler();

    var input = scheduler.createHotObservable(
        onNext(100,'abc'),
        onNext(200,'def'),
        onNext(250,'ghi'),
        onNext(300,'pqr'),
        onNext(450,'xyz'),
        onCompleted(500)
    );

    var results = scheduler.startWithTiming(
        function() {
            return input.buffer(function () {
                return input.debounce(100, scheduler);
            })
            .map(function (b) {
                return b.join(',');
            });
        },
        50,  //created
        150, //subscribed
        600  //disposed
    );

    collectionAssert.assertEqual(results.messages, [
        onNext(400, 'def,ghi,pqr'),
        onNext(500, 'xyz'),
        onCompleted(500)
    ]);

    collectionAssert.assertEqual(input.subscriptions, [
        subscribe(150,500),
        subscribe(150,400),
        subscribe(400,500)
    ]);

});



