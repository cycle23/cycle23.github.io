;(function(Game,undefined) {
    function DonkeyAudio() {
        var background = new Howl({
            urls: ['http://cycle23.github.io/media/music/coldwet.mp3',
                   'http://cycle23.github.io/media/music/coldwet.ogg'],
            autoplay: false,
            loop: true,
            volume: 0.25,
            onload: function() {
                audioIsReady("back");
            }
        });
        var effects = new Howl({
            urls: ['http://cycle23.github.io/media/sound/donkeyEffects.mp3',
                   'http://cycle23.github.io/media/sound/donkeyEffects.ogg'],
            sprite: {
                coin: [4850, 2050],
                jump: [10500, 1500],
                gameover: [15500, 6500]
            },
            loop: false,
            onload: function() {
                audioIsReady("effects");
            }
        });
        var backReady = false;
        var effectsReady = false;
        function audioIsReady(spriteLabel) {
            if (spriteLabel === "back") {
                backReady = true;
            }
            if (spriteLabel === "effects") {
                effectsReady = true;
            }
            if (backReady && effectsReady) {
                $('#start').show();
                $("#loading").hide();
            }
        }
        $(document).on("initAudio", function () {
            $('#start').hide();
            background.play();
            Game.Donkey().startGame();
        });

        return {
            audioIsReady : audioIsReady,
            effects : effects,
            background : background
        }
    }
    Game.DonkeyAudio = DonkeyAudio;
}(window.Game));
