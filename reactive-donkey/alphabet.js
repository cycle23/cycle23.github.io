// first, namespace entire thing in anonymous function()
(function() {

    // Non-standard custom operator
    // note: for purposes of this example, we are only using static interval, but could use random with this
    Rx.Observable.random = function (low, high, intervalLow, intervalHigh, howMany, scheduler) {
        scheduler || (scheduler = Rx.Scheduler.timeout);
        if (howMany == null) {
            howMany = -1;
        }
        if (intervalLow == null) {
            intervalLow = 1;
        }
        if (intervalHigh == null) {
            intervalHigh = 1;
        }
        return Rx.Observable.create(function (observer) {
           var delta = high - low,
               intervalDelta = intervalHigh - intervalLow,
               ticks = 0,
               iFunc = (intervalDelta === 0)
                            ? function () { return intervalLow; }
                            : function () { return Math.floor((Math.random() * intervalDelta) + intervalLow); };
            // iFunc() initially sets dueTime for first action
            // The observable itself is then used recursively for next scheduled event
            // Proceeds for number of ticks set then completes
            //
            return scheduler.scheduleRecursiveWithRelative(iFunc(), function(self) {
                if (++ticks <= howMany) {
                    observer.onNext(Math.floor((Math.random() * delta) + low));
                    self(iFunc());
                } else {
                    observer.onCompleted();
                }
            });
        });
    };

    var GameState = {
        playing: 'playing',
        paused: 'paused',
        stopped: 'stopped'
    };

    var AlphabetInvasion = (function() {
        function AlphabetInvasion() {
            this.enemies = [];

            // dom elements
            this.modalBox = document.querySelector('#modalmessages');
            this.message = document.querySelector('#message');
            this.score = document.querySelector('#score');
            this.playfield = document.querySelector('#playfield');
            this.level = document.querySelector('#level');
            this.remainingEnemies = document.querySelector('#remaining');
            this.highScore = document.querySelector('#highscore');
        }

        var CURRENT_SPEED = 0;
        var LAUNCH_RATE = 1;
        var HIGH_SCORE_STORAGE_KEY = "_alphabet_attack_high_score_";

        var playfieldheight = 0;
        var lookup = "abcdefghijklmnopqrstuvwxyz";
        var levels = {
            "Level 1 - Rookies": [60, 1300],
            "Level 2 - Tenderfoots": [55, 1200],
            "Level 3 - Militia": [50, 1100],
            "Level 4 - Privates": [50, 1000],
            "Level 5 - Corporals": [45, 800],
            "Level 6 - Sergeants": [40, 650],
            "Level 7 - Master Sergeants": [35, 500],
            "Level 8 - Lieutenants": [30, 450],
            "Level 9 - Captains": [25, 400],
            "Level 10 - Majors": [20, 400],
            "Level 11 - Colonels": [15, 350],
            "Level 12 - Generals": [11, 350],
            "Level 13 - Special Forces": [9, 350],
            "Level 14 - Black Ops": [7, 350],
            "Level 15 - Ninjas": [5, 350]
        };

        AlphabetInvasion.prototype.run = function() {
            this.resetGame();
            this.keyboardObservable = Rx.Observable.fromEvent(document, 'keyup');

            // if paused, will start
            var _this = this;
            this.keyboardObservable.subscribe(function () {
                if (_this.gameState === GameState.paused) {
                    _this.hideMessage();
                    _this.playLevel();
                }
            });

            if (window.localStorage) {
                var hs = window.localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
                hs && (this.highScore.innerText = hs);
            }
        };

        AlphabetInvasion.prototype.playLevel = function() {
            if (this.generator) {
              this.generator.dispose();
            }
            var title, found = false;
            for (var level in levels) {
                if (levels.hasOwnProperty(level)) {
                    if (level.indexOf(this.currentLevel.toString()) !== -1) {
                        found = true;
                    }
                    if (found) {
                        title = level;
                        break;
                    }
                }
            }

            var config = levels[level];

            this.gameState = GameState.playing;
            this.level.innerText = this.currentLevel;
            this.showMessage(title);

            // gameplay loop nested anonymous function
            var self = this;
            var play = function() {
                self.hideMessage();
                var enemiesThisLevel = self.currentLevel * 2 + 13;
                self.remainingEnemies.innerText = enemiesThisLevel;

                var capitalLetterProbability = 1 - ((self.currentLevel * 2.5)/100);
                var killed = 0;
                var allEnemiesLaunched = false;

                // start loop, update enemies
                self.gameloop = Rx.Observable.interval(config[CURRENT_SPEED]).subscribe(function() {
                    self.updatePlayField();
                });

                // another subscriber for keyboardObservable per level
                self.keyboard = self.keyboardObservable.subscribe(function(e) {
                    if (self.enemies.length === 0 && !allEnemiesLaunched) {
                        return;
                    }
                    if (self.enemies.length === 0 && allEnemiesLaunched) {
                        self.nextLevel();
                        return;
                    }
                    var key = e.shiftKey
                                ? String.fromCharCode(e.keyCode)
                                : String.fromCharCode(e.keyCode).toLowerCase();
                    console.log('key pressed: ' + key + ' enemy text: ' + self.enemies[0].innerText);
                    if (key === self.enemies[0].innerText) {
                        var enemy = self.enemies.shift();
                        self.killEnemy(enemy);
                        self.remainingEnemies.innerText = enemiesThisLevel - ++killed;

                        if (self.enemies.length === 0 && allEnemiesLaunched) {
                            self.nextLevel();
                        }
                    }
                });

                // generate enemies for this level, 10% chance uppah
                self.generator = Rx.Observable
                    .random(0, 25, config[LAUNCH_RATE], config[LAUNCH_RATE], enemiesThisLevel)
                    .select(function(v) {
                        return Math.random() <= capitalLetterProbability
                            ? lookup.charAt(v)
                            : lookup.charAt(v).toUpperCase();
                    })
                    .subscribe(function(v) {
                        self.launchNewEnemy(v);
                    },
                    function(e) {
                        throw e;
                    },
                    function () {
                        allEnemiesLaunched = true;
                });
            };
            // delay for title, and then play for level
            Rx.Observable.timer(2500).subscribe(function(){play();});
        };

        AlphabetInvasion.prototype.nextLevel = function() {
            if (this.currentLevel === 15) {
                this.youWin();
            }
            this.gameState = GameState.stopped;
            this.disposeObservables();

            this.showMessage('Level ' + this.currentLevel + ' Complete');
            this.currentLevel++;

            var self = this;
            Rx.Observable.timer(4000).subscribe(function() {self.playLevel(); });
        };

        AlphabetInvasion.prototype.disposeObservables = function() {
            this.gameloop && this.gameloop.dispose();
            this.generator && this.generator.dispose();
            this.keyboard && this.keyboard.dispose();
        };

        AlphabetInvasion.prototype.youWin = function() {
            if (this.gameState === GameState.stopped) {
                return;
            }

            // change state and dispose observables
            this.gameState = GameState.stopped;
            this.disposeObservables();
            this.showMessage("You win!");

            // reset
            var self = this;
            Rx.Observable.timer(5500).subscribe(function () {
                self.resetGame();
            });
        };

        AlphabetInvasion.prototype.youLose = function() {
            if (this.gameState === GameState.stopped) {
                return;
            }

            // change state and dispose observables
            this.gameState = GameState.stopped;
            this.disposeObservables();

            // taunt
            for (var i=0, len=this.enemies.length; i < len; i++) {
                var enemy = this.enemies[i];
                if (enemy !== this.enemies[0]) {
                    enemy.innerText = ':P';
                    enemy.className += ' rotate';
                    enemy.style.fontSize = '72px';
                }
            }

            this.showMessage("You lose");
            var self = this;
            Rx.Observable.timer(5500).subscribe(function () {
                self.resetGame();
            });
        };

        AlphabetInvasion.prototype.killEnemy = function(enemy) {
            enemy.style.color = 'red';
            enemy.style.fontSize = '48px';
            enemy.innerText = '@';

            var v = enemy.offsetTop;
            this.addToScore((this.playfield.clientHeight - v) * this.currentLevel);

            var self = this;
            Rx.Observable.timer(750).subscribe(function() {
                self.playfield.removeChild(enemy);
            });
        };

        // update and check for landing
        AlphabetInvasion.prototype.updatePlayField = function() {
            // adjust enemy speed

            playfieldheight = this.playfield.clientTop + this.playfield.clientHeight;
            var factor = playfieldheight / 200;

            var self = this;
            Rx.Observable.fromArray(this.enemies).subscribe(function(enemy) {
                var newPos = enemy.offsetTop + factor;
                enemy.style.top = newPos + 'px';
                if (newPos >= playfieldheight + 44) {
                    self.youLose();
                }
            });
        };

        AlphabetInvasion.prototype.launchNewEnemy = function(v) {
            // random color, not too dark
            var r = Math.floor(Math.random() * 100+155),
                g = Math.floor(Math.random() * 100+155),
                b = Math.floor(Math.random() * 100+155);

            // enemy init position
            var enemy = document.createElement('div');
            enemy.style.color= 'rgb(' + r + ',' + g + ',' + b + ')';
            enemy.style.position = 'absolute';
            enemy.style.top = this.playfield.offsetTop + 'px';
            enemy.style.left = (Math.random() * (this.playfield.clientWidth - 25)) + 'px';
            enemy.className = 'enemy';
            enemy.innerText = v;

            // update tracking queue and add to DOM
            this.enemies.push(enemy);
            this.playfield.appendChild(enemy);
        };

        AlphabetInvasion.prototype.addToScore = function(amount) {
            var newScore = parseInt(this.score.innerText) + amount;
            this.score.innerText = newScore;

            if (newScore > parseInt(this.highScore.innerText)) {
                this.highScore.innerText = newScore;
                if (window.localStorage) {
                    window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, newScore);
                }
            }
        };

        AlphabetInvasion.prototype.resetGame = function() {
            this.gameState = GameState.paused;
            this.showMessage('');
            this.currentLevel = 1;
            this.score.innerText = '0';
            this.level.innerText = '1';
            this.remainingEnemies.innerText = '-';
            this.clearPlayField();
            this.disposeObservables();
            this.showMessage("PRESS KEY");
        };

        AlphabetInvasion.prototype.clearPlayField = function() {
            for (var i = 0, len = this.enemies.length; i < len; i++) {
                this.playfield.removeChild(this.enemies[i]);
            }
            this.enemies = [];
        };

        // modal message one letter at time
        AlphabetInvasion.prototype.showMessage = function(msg) {
            if (msg && msg.length === 0) {
                this.message.text = '';
                return;
            }

            this.modalBox.style.opacity = 1;

            var self=this;
            for (var i=0, len = msg.length; i < len; i++) {
                (function (i) {
                    Rx.Observable.returnValue(i).delay(30*i).subscribe(function(x) {
                        self.message.innerText = msg.substring(0, x+1);
                    });
                })(i);
            }
        };

        AlphabetInvasion.prototype.hideMessage = function() {
            this.modalBox.style.opacity = 0;
        };

        return AlphabetInvasion;
    })();

    // could use Object.create instead to avoid any use of new...
    var game = new AlphabetInvasion();
    game.run();

// close encasing anonymous function and invoke
})();