;(function(Game,undefined) {
    function DonkeyAudio() {
        /*
        var background = new Howl({
            urls: ['https://cycle23.github.io/media/music/shortwet.mp3',
                   'https://cycle23.github.io/media/music/shortwet.ogg'],
            autoplay: false,
            loop: true,
            volume: 0.25,
            onload: function() {
                audioIsReady();
            }
        });
        var effects = new Howl({
            urls: ['https://cycle23.github.io/media/sound/donkeyEffects.mp3',
                   'https://cycle23.github.io/media/sound/donkeyEffects.ogg'],
            sprite: {
                coin: [4450, 6500],
                jump: [10500, 12000],
                gameover: [15500, 2200]
            }
        });
        function audioIsReady() {
            $('#start').show();
            $("#loading").hide();
            //background.play();
        }
        $(document).on("initAudio", function () {
            $('#start').hide();
            $("#loading").show();
            background.play();
            $("#loading").hide();
            //Game.Donkey().startGame();
        });

        return {
            audioIsReady : audioIsReady,
            initAudio : initAudio
        }
    */
    }
    Game.DonkeyAudio = DonkeyAudio;
}(window.Game));
