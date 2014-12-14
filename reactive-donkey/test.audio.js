$.mbAudio.sounds = {
    backgroundSprite: {
        id    : "backgroundSprite",
        ogg   : "http://cycle23.github.io/media/music/coldwet.ogg",
        mp3   : "http://cycle23.github.io/media/music/coldwet.mp3",
        sprite: {
            level1    : {id: "level1", start: 0, end: 232, loop: true}
        }
    },
    effectSprite: {
        id    : "effectSprite",
        ogg   : "http://cycle23.github.io/media/sound/donkeyEffects.ogg",
        mp3   : "http://cycle23.github.io/media/sound/donkeyEffects.mp3",
        sprite: {
            coin      : {id: "coin", start: 4.45, end: 6.5, loop: false},
            jump      : {id: "jump", start: 10.5, end: 12, loop: false},
            gameover  : {id: "gameover", start: 15.5, end: 22, loop: false}
        }
    },
    effectSprite2: {
        id    : "effectSprite2",
        mp3   : "http://cycle23.github.io/media/sound/donkeyEffects2.mp3",
        sprite: {
            coin      : {id: "coin", start: 4.45, end: 6.5, loop: false},
            jump      : {id: "jump", start: 10.5, end: 12, loop: false},
            gameover  : {id: "gameover", start: 15.5, end: 22, loop: false}
        }
    }
};

function audioIsReady() {
    $("#loading").hide();
    if(isStandAlone || !isDevice) {
        alert("background");
        $.mbAudio.play('backgroundSprite', 'level1');
    }
    startGame();
}

$(document).on("initAudio", function () {
    $.mbAudio.pause('effectSprite', audioIsReady);
    $.mbAudio.pause('effectSprite2', audioIsReady);
    $('#start').hide();
    $("#loading").show();
});

$(document).on("initAudioNoPause", function () {
    $('#start').hide();
    startGame();
});


function testWebAudioAPI() {
    // create WebAudio API context
    var context = new AudioContext();

    // Create lineOut
    var lineOut = new WebAudiox.LineOut(context);

    // load a sound and play it immediately
    WebAudiox.loadBuffer(context, 'http://cycle23.github.io/media/sound/jump.mp3', function (buffer) {
        // init AudioBufferSourceNode
        var source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(lineOut.destination);

        // start the sound now
        source.start(0);
    });
};

function testWebAudioAPI2() {
    // create WebAudio API context
    var context = new AudioContext();

    // Create lineOut
    var lineOut = new WebAudiox.LineOut(context);

    // load a sound and play it immediately
    WebAudiox.loadBuffer(context, 'http://cycle23.github.io/media/sound/jump2.mp3', function (buffer) {
        // init AudioBufferSourceNode
        var source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(lineOut.destination);

        // start the sound now
        source.start(0);
    });
};


//testWebAudioAPI();
