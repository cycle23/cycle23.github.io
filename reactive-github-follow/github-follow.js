var refreshButton = document.querySelector('.refresh');
var refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click');

var close1Button = document.querySelector('.close1');
var close1ClickStream = Rx.Observable.fromEvent(close1Button, 'click');

var requestStream = refreshClickStream.startWith('startup click')
    .map(function() {
        var randomOffset = Math.floor(Math.random()*500);
        return 'https://api.github.com/users?since=' + randomOffset;
    });

var responseStream = requestStream
    .flatMap(function(requestUrl){
        return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl));
    });

responseStream.subscribe(function(response) {

});

var suggestion1Stream = close1ClickSream.startWith('startup click')
    .combineLatest(responseStream,
      function(click, listUsers) {
        return listUsers[Math.floor(Math.random()*listUsers.length)];
      }
    )
    .merge(
        refreshClickStream.map(function(){ return null; })
    )
    .startWith(null);

suggestion1Stream(function(suggestion) {
    if (suggestion === null) {
        // hide
    }
    else {
        // show/render
    }
});
