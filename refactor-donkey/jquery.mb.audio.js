/*
 * ******************************************************************************
 *  jquery.mb.components
 *  file: jquery.mb.audio.js
 *
 *  Copyright (c) 2001-2014. Matteo Bicocchi (Pupunzi);
 *  Open lab srl, Firenze - Italy
 *  email: matteo@open-lab.com
 *  site: 	http://pupunzi.com
 *  blog:	http://pupunzi.open-lab.com
 * 	http://open-lab.com
 *
 *  Licences: MIT, GPL
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 *
 *  last modified: 07/01/14 22.50
 *  *****************************************************************************
 */

/*
 *
 * Works on all modern browsers.
 *
 * */

var ua = navigator.userAgent.toLowerCase();
var isAndroid = /android/.test(ua);
var isiOs = /(iphone|ipod|ipad)/.test(ua);
var isStandAlone = window.navigator.standalone;
var isiPad = ua.match(/ipad/);
var isDevice = 'ontouchstart' in window;
var isChrome = "chrome" in window;
var isMoz = "mozAnimationStartTime" in window;


String.prototype.asId = function () {
    return this.replace(/[^a-zA-Z0-9_]+/g, '');
};

function supportType(audioType) {
    var myAudio = document.createElement('audio');
    var isSupp = myAudio.canPlayType &&  myAudio.canPlayType(audioType);
    if (isSupp === "") {
        isSupp = false;
    } else {
        isSupp = true;
    }
    return isSupp;
}

(function ($) {

    $.mbAudio = {
        name             : "mb.audio",
        author           : "Matteo Bicocchi",
        version          : "1.5",
        defaults         : {
            id    : "",
            ogg   : "",
            mp3   : "",
            loop  : false,
            volume: 10
        },
        sounds           : {},
        players          : {},
        loaded           : {},
        playing          : [],
        ch               : [],
        soundsMutedByHand: false,

        build: function (sound) {

            if (!$.mbAudio.isInit) {
                $(window).on("blur",function () {
                    log("blur, muteall");
                    $.mbAudio.soundsMutedByHand = true;
                    $.mbAudio.muteAllSounds();
                })
                .on("focus", function () {
                    log("focus, unmuteall");
                    $.mbAudio.soundsMutedByHand = false;
                    $.mbAudio.unMuteAllSounds();
                });
                log("isInit");
                $.mbAudio.isInit = true;

            }

            var soundEl = typeof sound === "string" ? $.mbAudio.sounds[sound] : sound;
            var sID = soundEl.id ? soundEl.id : (typeof sound === "string" ? sound : sound.mp3.split(".")[0].asId());

            if ($.mbAudio.loaded[sID] !== 1) {
                log("load " + sID);
                var url = supportType("audio/mpeg") ? soundEl.mp3 : soundEl.ogg;

                $.mbAudio.players[sID] = new Audio(url);
                $.mbAudio.players[sID].addEventListener('error', function() {
                    log(('Audio error: ' + url + '; ' + JSON.stringify($.mbAudio.players[sID].error)), true);
                });

                $.mbAudio.players[sID].addEventListener('play', function() {
                    log(('Starting audio: ' + url + '; MIME-type: ' + $.mbAudio.players[sID].type), false);
                });

                $.mbAudio.players[sID].addEventListener('pause', function() {
                    log(('pause audio: ' + url + '; MIME-type: ' + $.mbAudio.players[sID].type), false);
                });
                $.mbAudio.players[sID].addEventListener('timeupdate', function() {
                    log(('timeupdate audio: ' + url + '; MIME-type: ' + $.mbAudio.players[sID].type), false);
                });
                $.mbAudio.players[sID].addEventListener('loadedmetadata', function() {
                        log(('loaded metadata audio: ' + url + '; MIME-type: ' + $.mbAudio.players[sID].type), false);
                });
                $.mbAudio.players[sID].addEventListener('durationchange', function() {
                    log(('durationchange audio: ' + url + '; MIME-type: ' + $.mbAudio.players[sID].type), false);
                });
                $.mbAudio.players[sID].addEventListener('loadeddata', function() {
                    log(('loaded data audio: ' + url + '; MIME-type: ' + $.mbAudio.players[sID].type), false);
                });
                $.mbAudio.players[sID].addEventListener('startloading', function() {
                    log(('startloading audio: ' + url + '; MIME-type: ' + $.mbAudio.players[sID].type), false);
                });
                $.mbAudio.players[sID].addEventListener('progress', function() {
                    log(('progress audio: ' + url + '; MIME-type: ' + $.mbAudio.players[sID].type), false);
                });

                $.mbAudio.players[sID].addEventListener('ended', function() {
                    log(('Playback ended: ' + url), false);
                });

                $.mbAudio.players[sID].addEventListener('canplay', function() {
                    log('canplay' + url, false);
                    //$.mbAudio.players[sID].play();
                });
                $.mbAudio.players[sID].load();
                $.mbAudio.players[sID].pause();

                $.mbAudio.loaded[sID] = 1;
            }
        },

        getPlayer: function (ID) {
            var el = document.getElementById("mbAudio_" + ID);
            if ($(el).length === 0 || !$.mbAudio.players[ID]) {
                var soundEl = typeof ID === "string" ? $.mbAudio.sounds[ID] : ID;
                var sID = soundEl.id ? soundEl.id : (typeof sound === "string" ? sound : sound.mp3.split(".")[0].asId());
                ID = sID;
            }

            return $.mbAudio.players[ID];
        },

        preload: function () {
            for (var sID in $.mbAudio.sounds) {
                $.mbAudio.build(sID);
            }
            alert("preload triggering soundsLoaded");
            $(document).trigger("soundsLoaded");
        },

        play: function (sound, sprite, callback) {

            var soundEl = typeof sound === "string" ? $.mbAudio.sounds[sound] : sound;

            if (!soundEl)
                return;

            var sID = soundEl.id ? soundEl.id : (typeof sound === "string" ? sound : sound.mp3.split(".")[0].asId());
            var loop = soundEl.loop ? soundEl.loop : $.mbAudio.defaults.loop;
            var volume = typeof soundEl.volume === "number" ? soundEl.volume : $.mbAudio.defaults.volume;
            volume = volume > 10 ? 10 : volume;

            //if ($.mbAudio.loaded[sID] != 1)
            $.mbAudio.build(sound);

            var player = $.mbAudio.getPlayer(sID);
            player.vol = volume;

            if (!$.mbAudio.allMuted)
                player.volume = player.vol / 10;
            else
                player.volume = 0;

            log("volume " + player.volume);

            $(player).off("ended." + sID + ",paused." + sID);

            if (typeof sprite === "undefined")
                sprite = true;

            /*Manage sprite*/

            if (sprite && (typeof sprite === "string" || typeof sprite === "object")) {

                sprite = typeof sprite === "string" ? soundEl.sprite[sprite] : sprite;

                clearTimeout(player.timeOut);

                if (!isAndroid && player.seekable.length === 0) {

                    //	We are not crazy; this is to start loading audio
                    /*
                     player.play();
                     if (!isMoz)
                     */
                    player.pause();
                    log("paused seekable length is 0");

                    var getSeekable = setInterval(function () {

                        if (player.seekable.length > 0 && player.seekable.end(0) >= sprite.end - 1) {

                            clearInterval(getSeekable);
                            log("managing sprite from seekable interval " + sID);
                            log("seekable.length: " + player.seekable.length);
                            log("index 0: " + player.seekable.end(0));
                            log("sprite.end: " + sprite.end);
                            log("sprite.end - 1: " + (sprite.end - 1));
                            $.mbAudio.manageSprite(player, sID, sound, sprite, callback);
                        }
                        else {
                            log("no manage");
                        }
                    }, 1)

                } else {
                    log("manage direct");
                    $.mbAudio.manageSprite(player, sID, sound, sprite, callback);
                }
                return;
            }
            log("not sure how here");
            if (loop) {

                $(player).one("ended." + sID + ",paused." + sID, function () {
                    this.currentTime = 0;

                    if (typeof loop === "number") {
                        if (typeof player.counter === "undefined")
                            player.counter = 0;

                        player.counter++;

                        if (player.counter === loop) {
                            delete player.counter;
                            $.mbAudio.playing.splice(sID, 1);
                            delete player.isPlaying;
                            if (typeof callback === "function")
                                callback(player);
                            return;
                        }
                    }

                    $.mbAudio.play(sound, sprite, callback);
                });

            } else {
                log("ended");
                $(player).on("ended." + sID + ",paused." + sID, function () {

                    $.mbAudio.playing.splice(sID, 1);
                    delete player.isPlaying;

                    if (typeof callback === "function")
                        callback(player);

                });
            }
            log("pausing");
            player.pause();
            if (player.currentTime && sprite) {
                log("time to 0");
                player.currentTime = 0;
            }
            log(".. call to play");
            player.play();

            var idx = jQuery.inArray(sID, $.mbAudio.playing);
            $.mbAudio.playing.splice(idx, 1);
            $.mbAudio.playing.push(sID);
            player.isPlaying = true;
            log("returning");
        },

        manageSprite: function (player, sID, sound, sprite, callback) {
            log("> manage " + sID);
            player.pause();

            function checkStart(player, sID, sound, sprite, callback){
                player.currentTime = sprite.start;
                log("checkStart set: " + player.currentTime + ", " + sprite.start);

                if (Math.round(player.currentTime) != Math.round(sprite.start)){
//                if (player.currentTime !== sprite.start){
                    log("call again " + sID + ", " + player.currentTime + " != " + sprite.start);
                    checkStart(player, sID, sound, sprite, callback);
                }else{
                    log("playerPlay " + sID);
                    playerPlay(player, sID, sound, sprite, callback);
                }
            }

            checkStart(player, sID, sound, sprite, callback);

            function playerPlay(player, sID, sound, sprite, callback) {
                var delay = ((sprite.end - sprite.start) * 1000) + 100;
                log("delay: " + delay);
                var canFireCallback = true;
                player.play();
                player.isPlaying = true;
                player.timeOut = setTimeout(function () {
                    if (sprite.loop) {
                        canFireCallback = false;
                        sprite.loop = sprite.loop === true ? 9999 : sprite.loop;
                        if (!player.counter)
                            player.counter = 1;
                        if (player.counter !== sprite.loop && player.isPlaying) {
                            player.counter++;
                            player.currentTime = sprite.start || 0;
                            $.mbAudio.play(sound, sprite, callback);
                        } else {
                            player.counter = 0;
                            canFireCallback = true;
                            player.pause();
                            delete player.isPlaying;
                        }
                    } else {
                        log("pause timeout");
                        player.pause();
                        delete player.isPlaying;
                    }
                    if (canFireCallback && typeof callback === "function")
                        callback(player);
                    var idx = jQuery.inArray(sID, $.mbAudio.playing);
                    $.mbAudio.playing.splice(idx, 1);
                }, delay);
                $.mbAudio.playing.push(sID);
                player.isPlaying = true;
            }
        },

        stop: function (sound, callback) {
            if (!sound)
                return;

            var soundEl = typeof sound === "string" ? $.mbAudio.sounds[sound] : sound;

            if (!soundEl)
                return;

            var sID = soundEl.id ? soundEl.id : (typeof sound === "string" ? sound : sound.mp3.split(".")[0].asId());

            var player = $.mbAudio.getPlayer(sID);

            if ($.mbAudio.loaded[sID] !== 1)
                $.mbAudio.build(sound);

            player.pause();
            if (player.currentTime)
                player.currentTime = 0;

            $(player).off('ended.' + sID);

            if (typeof callback === "function")
                callback(player);

            var idx = jQuery.inArray(sID, $.mbAudio.playing);
            $.mbAudio.playing.splice(idx, 1);
            delete player.isPlaying;
            delete player.counter;

        },

        pause: function (sound, callback) {
            var soundEl = typeof sound === "string" ? $.mbAudio.sounds[sound] : sound;
            var sID = soundEl.id ? soundEl.id : (typeof sound === "string" ? sound : sound.mp3.split(".")[0].asId());

            if ($.mbAudio.loaded[sID] !== 1) {
                $.mbAudio.build(sound);
            }

            var player = $.mbAudio.getPlayer(sID);
            player.pause();

            $(player).off('ended.' + sID);

            var idx = jQuery.inArray(sID, $.mbAudio.playing);
            if (idx > -1)
                $.mbAudio.playing.splice(idx, 1);

            delete player.isPlaying;
            delete player.counter;

            clearTimeout(player.timeOut);

            if (typeof callback === "function")
                callback();

        },

        destroy: function (sound) {
            var soundEl = typeof sound === "string" ? $.mbAudio.sounds[sound] : sound;
            var sID = soundEl.id ? soundEl.id : (typeof sound === "string" ? sound : sound.mp3.split(".")[0].asId());
            $.mbAudio.loaded[sID] = 0;
            var idx = jQuery.inArray(sID, $.mbAudio.playing);
            $.mbAudio.playing.splice(idx, 1);

            var player = $.mbAudio.getPlayer(sID);

            if (!player)
                return;

            $(player).remove();

        },

        muteAllSounds: function () {
            var sounds = $.mbAudio.loaded;
            if (!sounds)
                return;

            for (var sID in sounds) {
                var player = $.mbAudio.getPlayer(sID);
                player.vol = player.volume * 10;
                player.volume = 0;
            }
            $.mbAudio.allMuted = true;
        },

        unMuteAllSounds: function () {
            var sounds = $.mbAudio.loaded;
            if (!sounds)
                return;

            for (var sID in sounds) {
                var player = $.mbAudio.getPlayer(sID);
                player.volume = player.vol / 10;
            }
            $.mbAudio.allMuted = false;
        },

        stopAllSounds: function () {
            var sounds = $.mbAudio.loaded;
            if (!sounds)
                return;


            for (var i in sounds) {
                $.mbAudio.destroy(i);
            }
            $.mbAudio.allMuted = true;
        },

        setVolume: function (sound, vol) {
            var soundEl = typeof sound === "string" ? $.mbAudio.sounds[sound] : sound;
            var sID = soundEl.id ? soundEl.id : (typeof sound === "string" ? sound : sound.mp3.split(".")[0].asId());

            if ($.mbAudio.loaded[sID] !== 1)
                $.mbAudio.build(sound);

            var player = $.mbAudio.getPlayer(sID);
            vol = vol > 10 ? 10 : vol;
            player.vol = vol;

            player.volume = player.vol;

        },

        fadeIn: function (sound, sprite, duration, callback) {

            if (!duration)
                duration = 3000;

            duration = duration / 4;

            var soundEl = typeof sound === "string" ? $.mbAudio.sounds[sound] : sound;
            var sID = soundEl.id ? soundEl.id : (typeof sound === "string" ? sound : sound.mp3.split(".")[0].asId());

            if ($.mbAudio.loaded[sID] !== 1)
                $.mbAudio.build(sound);

            var player = $.mbAudio.getPlayer(sID);
            var volume = typeof soundEl.volume === "number" ? soundEl.volume : $.mbAudio.defaults.volume;
            volume = volume > 10 ? 10 : volume;

            var step = (volume / 10) / duration;

            clearInterval(player.fade);

            player.play();
            if (player.currentTime)
                player.currentTime = 0;

            player.volume = 0;

            if (!$.mbAudio.allMuted) {
                var v = 0;
                player.fade = setInterval(function () {

                    if (v >= volume / 10) {
                        clearInterval(player.fade);
                        if (typeof (callback) === "function")
                            callback(player);
                        return;
                    }

                    player.volume = v;
                    v += step;

                }, 0);
            }

            $.mbAudio.playing.push(sID);
            player.isPlaying = true;

        },

        fadeOut: function (sound, duration, callback) {

            if (!duration)
                duration = 3000;

            duration = duration / 4;

            var soundEl = typeof sound === "string" ? $.mbAudio.sounds[sound] : sound;
            var sID = soundEl.id ? soundEl.id : (typeof sound === "string" ? sound : sound.mp3.split(".")[0].asId());

            if ($.mbAudio.loaded[sID] !== 1)
                $.mbAudio.build(sound);

            var player = $.mbAudio.getPlayer(sID);
            var volume = player.volume ? player.volume * 10 : (typeof soundEl.volume === "number" ? soundEl.volume : $.mbAudio.defaults.volume);
            volume = volume > 10 ? 10 : volume;

            var step = (volume / 10) / duration;

            clearInterval(player.fade);

            player.volume = volume / 10;
            player.play();

            var v = player.volume;

            player.fade = setInterval(function () {

                if (v <= 0) {
                    v = 0;
                    clearInterval(player.fade);

                    player.volume = 0;
                    player.isPlaying = false;
                    var idx = jQuery.inArray(sID, $.mbAudio.playing);
                    $.mbAudio.playing.splice(idx, 1);

                    player.pause();

                    if (typeof (callback) === "function")
                        callback(player);

                    return;
                }

                player.volume = v;
                v -= step;

            }, 0);
        },

        queue: {
            isStarted: false,

            add: function (soundID, sprite, callback, hasPriority) {

                var channelName = typeof soundID === "string" ? soundID : soundID.mp3.split(".")[0].asId();
                var c = $.mbAudio.queue.get(channelName);
                if (c === null)
                    c = new Channel(soundID);

                var soundEl = typeof soundID === "string" ? $.mbAudio.sounds[soundID] : soundID;

                if (!soundEl.started) {
                    $.mbAudio.pause(soundID);
                    soundEl.started = true;
                }

                sprite = typeof sprite === "string" ? soundEl.sprite[sprite] : sprite;

                var sEL = {};

                sEL.soundID = soundID;
                sEL.sprite = sprite;
                sEL.channel = c;
                sEL.hasPriority = hasPriority;
                sEL.callback = callback;

                if (!$.mbAudio.queue.isStarted)
                    $.mbAudio.queue.startEngine();

                if (!$.mbAudio.soundsMutedByHand) {
                    if (sEL.hasPriority) {
                        sEL.channel.playingSounds.splice(0, 1);
                        sEL.channel.soundInPlay = null;
                        c.playingSounds.unshift(sEL);
                    } else {
                        c.playingSounds.push(sEL);
                    }
                }
            },

            get: function (name) {
                for (var i in $.mbAudio.ch) {
                    if ($.mbAudio.ch[i].name === name)
                        return $.mbAudio.ch[i];
                }
            },

            manage: function () {

                function manageQueue(channel) {

                    if (channel.soundInPlay === null && channel.playingSounds && channel.playingSounds.length > 0 && !$.mbAudio.soundsMutedByHand && !channel.isMuted) {
                        channel.soundInPlay = channel.playingSounds[0];

                        function callback() {
                            if (typeof channel.soundInPlay.callback === "function")
                                channel.soundInPlay.callback();

                            channel.playingSounds.splice(0, 1);
                            channel.soundInPlay = null;


                        }

                        $.mbAudio.play(channel.soundInPlay.soundID, channel.soundInPlay.sprite, callback);

                    } else if (channel.soundInPlay !== null && channel.soundInPlay.soundID && ($.mbAudio.soundsMutedByHand || channel.isMuted)) {
                        $.mbAudio.pause(channel.soundInPlay.soundID);
                        channel.playingSounds = [];
                        channel.playingSounds.unshift(channel.soundInPlay);
                        channel.soundInPlay = null;
                    }
                }

                for (var ci in $.mbAudio.ch) {
                    var channel = $.mbAudio.ch[ci];
                    manageQueue(channel);
                }

            },

            mute: function (channel) {
                if (!channel)
                    $.mbAudio.soundsMutedByHand = true;
                else {
                    var ch = $.mbAudio.queue.get(channel);
                    if (ch)
                        ch.isMuted = true;
                    $.mbAudio.pause(channel)

                }

            },

            unMute: function (channel) {
                if (!channel)
                    $.mbAudio.soundsMutedByHand = false;
                else {
                    var ch = $.mbAudio.queue.get(channel);
                    if (ch)
                        ch.isMuted = false;
                }
            },

            clear: function (name) {
                var channel = $.mbAudio.queue.get(name);
                if (channel) {
                    if (channel.soundInPlay !== null)
                        $.mbAudio.pause(channel.soundInPlay.soundID);
                    channel.soundInPlay = null;
                    channel.playingSounds = [];
                }
            },

            startEngine: function () {
                $.mbAudio.channelsEngine = setInterval($.mbAudio.queue.manage, 1);
                $.mbAudio.queue.isStarted = true;
            },

            stopEngine: function () {
                clearInterval($.mbAudio.channelsEngine);
                $.mbAudio.queue.isStarted = false;
            }
        }
    };

    function Channel(soundID) {
        this.name = typeof soundID === "string" ? soundID : soundID.mp3.split(".")[0].asId();
        this.soundInPlay = null;
        this.playingSounds = [];
        this.isMuted = false;
        $.mbAudio.ch.push(this);
    }

    function log(s, showAlert) {
        var now = new Date();
        var text = makeTwoDigits(now.getHours())
            + ':' + makeTwoDigits(now.getMinutes())
            + ':' + makeTwoDigits(now.getSeconds()) + ' >> ' + s;

        $('#console').append('<p>' + text + '</p>');
        console.log(text);

        if (showAlert) {
            alert(text);
        }
    }

    function clearLog() {
        $('#console').html('<p><strong>Console</strong> <span>[clear]</span></p>');

        $('#console span').click(function() {
            clearLog();
        });
    }

    function makeTwoDigits(x) {
        if (x < 10) {
            return '0' + x;
        }
        else {
            return '' + x;
        }
    }
})(jQuery);
