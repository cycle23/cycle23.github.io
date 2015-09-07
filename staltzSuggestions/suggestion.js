/**
 * Created by Cody on 9/6/2015.
 *
 * From: https://gist.github.com/staltz/868e7e9bc2a7b8c1f754
 */

var refreshButton = document.querySelector('.refresh');
var refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click');

/* Originally, we just query the users list but later we add the refresh stream
var requestStream = Rx.Observable.just('https://api.github.com/users');
*/

// first pass at this forgot to start with the original users query
/*
var requestStream = refreshClickStream
    .map(function() {
        var randomOffset = Math.floor(Math.random()*500);
        return 'https://api.github.com/users?since=' + randomOffset;
    });
*/

// we can construct two streams, like the one above and the earlier one "just",
// and then we can make a new stream by merging them together, or, skipping
// the middleman.. we can merge together, or even change to use startWith
// for a string, or, even do like this and first trigger an event.

var requestStream = refreshClickStream.startWith('startup click')
    .map(function() {
        var randomOffset = Math.floor(Math.random()*500);
        return 'https://api.github.com/users?since=' + randomOffset;
    });


/*
    Can simplify with fromPromise.
    Can also avoid this embedded situation of subscribe within subscribe via
    map..
 */
/*
requestStream.subscribe(function(requestUrl) {
    var responseStream = Rx.Observable.create(function (observer) {
        jQuery.getJSON(requestUrl)
        .done(function(response) {
            observer.onNext(response);
        })
        .fail(function(jqXHR, status, error) {
            observer.onError(error);
        })
        .always(function() {
            observer.onCompleted();
        });
    });

    responseStream.subscribe(function(response) {

    });
});
*/

/*
    This would create a stream -> stream structure (albeit a stream with a single
     promise value and then completed, but still not what we want..
    Enter the flatMap
 */
/*
var responseMetastream = requestStream
    .map(function(requestUrl) {
        return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl));
    });
*/

// request Stream
//  ----O--------------------|->
//      |
//      flatMap( O  -> ----X-|-> )
//               |
// --------------X-----------|->

var responseStream = requestStream
    .flatMap(function(requestUrl) {
        return Rx.Observable.fromPromise(jQuery.getJSON(requestUrl));
    })
    .publish().refCount();

/* we could try to make a separate subscription to refreshStream
   for suggestions to clear items on refresh vs. response, but
   it'd be updating the same dom... instead, we are going to be merging.
 */
/*
responseStream.subscribe(function(response) {
   // render 'response' to DOM
});
*/

var close1Button = document.querySelector('.close1');
var close1ClickStream = Rx.Observable.fromEvent(close1Button, 'click');
var close2Button = document.querySelector('.close2');
var close2ClickStream = Rx.Observable.fromEvent(close2Button, 'click');
var close3Button = document.querySelector('.close3');
var close3ClickStream = Rx.Observable.fromEvent(close3Button, 'click');

function createSuggestionStream(closeClickStream) {
    return closeClickStream.startWith('startup click')
        .combineLatest(responseStream,
        function(click, listUsers) {
            return listUsers[Math.floor(Math.random()*listUsers.length)];
        }
    )
        .merge(
        refreshClickStream.map(function(){
            return null;
        })
    )
        .startWith(null);
}

var suggestion1Stream = createSuggestionStream(close1ClickStream);
var suggestion2Stream = createSuggestionStream(close2ClickStream);
var suggestion3Stream = createSuggestionStream(close3ClickStream);


// Rendering ---------------------------------------------------
function renderSuggestion(suggestedUser, selector) {
    var suggestionEl = document.querySelector(selector);
    if (suggestedUser === null) {
        suggestionEl.style.visibility = 'hidden';
    } else {
        suggestionEl.style.visibility = 'visible';
        var usernameEl = suggestionEl.querySelector('.username');
        usernameEl.href = suggestedUser.html_url;
        usernameEl.textContent = suggestedUser.login;
        var imgEl = suggestionEl.querySelector('img');
        imgEl.src = "";
        imgEl.src = suggestedUser.avatar_url;
    }
}

suggestion1Stream.subscribe(function (suggestedUser) {
    renderSuggestion(suggestedUser, '.suggestion1');
});

suggestion2Stream.subscribe(function (suggestedUser) {
    renderSuggestion(suggestedUser, '.suggestion2');
});

suggestion3Stream.subscribe(function (suggestedUser) {
    renderSuggestion(suggestedUser, '.suggestion3');
});
