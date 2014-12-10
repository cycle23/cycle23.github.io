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
            jump      : {id: "jump", start: 1, end: 1.4, loop: false},
            gameover  : {id: "gameover", start: 2, end: 7.4, loop: false}
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
