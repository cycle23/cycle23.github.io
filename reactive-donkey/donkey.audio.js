$.mbAudio.sounds = {
    backgroundSprite: {
        id    : "backgroundSprite",
        ogg   : "../../media/music/coldwet.ogg",
        mp3   : "../../media/music/coldwet.mp3",
        sprite: {
            level1    : {id: "level1", start: 0, end: 232, loop: true}
        }
    },
    effectSprite: {
        id    : "effectSprite",
        ogg   : "../media/sound/donkeyEffects.ogg",
        mp3   : "../media/sound/donkeyEffects.mp3",
        sprite: {
            coin      : {id: "coin", start: 0, end: 0.5, loop: false},
            jump      : {id: "jump", start: 0.99, end: 1.49, loop: false},
            gameover  : {id: "gameover", start: 1.9, end: 7.4, loop: false}
        }
    }
};

function audioIsReady() {
    setTimeout(function () {
        $("#loading").hide();
        if(isStandAlone || !isDevice)
            $.mbAudio.play('backgroundSprite', 'level1');
        startGame();
    }, 3000);
}

$(document).on("initAudio", function () {
    $.mbAudio.pause('effectSprite', audioIsReady);
    $('#start').hide();
    $("#loading").show();
});
