;(function(Game,undefined) {
    function DonkeyAudio() {
        var background = new Howl({
            urls: ['https://cycle23.github.io/media/music/coldwet.mp3',
                   'https://cycle23.github.io/media/music/coldwet.ogg'],
            autoplay: false,
            loop: true,
            volume: 0.25
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
            $("#loading").hide();
            //if (isStandAlone || !isDevice) {
                //$.mbAudio.play('backgroundSprite', 'level1');
            //}
            background.play();
            Game.Donkey().startGame();
        }

        $(document).on("initAudio", function () {
            //$.mbAudio.pause('effectSprite', audioIsReady);
            $('#start').hide();
            $("#loading").show();
            audioIsReady();
        });

        return {
            audioIsReady : audioIsReady
        }
    }
    Game.DonkeyAudio = DonkeyAudio;
}(window.Game));
