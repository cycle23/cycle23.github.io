$.mbAudio.sounds = {
    backgroundSprite: {
        id    : "backgroundSprite",
        ogg   : "https://cycle23.github.io/media/music/coldwet.ogg",
        mp3   : "https://cycle23.github.io/media/music/coldwet.mp3",
        sprite: {
            level1    : {id: "level1", start: 0, end: 232, loop: true}
        }
    },
    effectSprite: {
        id    : "effectSprite",
        ogg   : "https://cycle23.github.io/media/sound/donkeyEffects.ogg",
        mp3   : "https://cycle23.github.io/media/sound/donkeyEffects.mp3",
        sprite: {
            coin      : {id: "coin", start: 5, end: 6, loop: false},
            jump      : {id: "jump", start: 10.5, end: 11.5, loop: false},
            gameover  : {id: "gameover", start: 16.2, end: 22, loop: false}
        }
    }
};

function audioIsReady() {
    setTimeout(function () {
        $("#loading").hide();
        if(isStandAlone || !isDevice) {
            $.mbAudio.play('backgroundSprite', 'level1');
        }
        startGame();
    }, 5000);
}

$(document).on("initAudio", function () {
    $.mbAudio.pause('effectSprite', audioIsReady);
    $('#start').hide();
    $("#loading").show();
});

function testWebAudioAPI() {
    // create WebAudio API context
    var context = new AudioContext();

    // Create lineOut
    var lineOut = new WebAudiox.LineOut(context);

    // load a sound and play it immediately
    WebAudiox.loadBuffer(context, 'https://cycle23.github.io/media/sound/donkeyEffects.ogg', function (buffer) {
        // init AudioBufferSourceNode
        var source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(lineOut.destination);

        // start the sound now
        source.start(0);
    });
    $.mbAudio.play('effectSprite', 'jump');
    $.mbAudio.play('effectSprite', 'jump');
    $.mbAudio.play('effectSprite', 'jump');
}

testWebAudioAPI();
