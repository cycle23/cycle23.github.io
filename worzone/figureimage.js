/**
 * Created by Cody on 2/14/2015.
 */
;(function(Game) {
    function FigureImage(imgPrefix, animCount, animCycle) {
        imgPrefix = imgPath + imgPrefix;
        function flip(img, f) {
            var x = img.attrs.x,
                y = img.attrs.y;
            img.scale(f, 1);
            img.attr({x:x,y:y});
        }
        function rotate(img, absoluteRotation) {
            img.rotate(absoluteRotation,
                       img.attrs.x + img.attrs.width/2,
                       img.attrs.y + img.attrs.height/2);
        }
        return {
            create : function(startPos, radius, r) {
                return r.image(imgPrefix + "-left-1.png",
                               startPos.x - radius,
                               startPos.y - radius,
                               radius * 2,
                               radius * 2)
            },
            /**
             * animate
             *
             * TODO: ??
             *
             * @param figure
             * @param {Rx.Observable} status
             */
            animate : function(figure, status) {
               /*
                * For each status in the input observable sequence,
                * buffer into animCycle lengths scanned through 1
                * at a time as the status events occur
                */
                var animationSequence = status
                    .bufferWithCount(animCycle)
                    .scan(1, function (prev) {
                        return prev % animCount + 1;
                    });
                /*
                 * Uses the current status and the animation sequence
                 * to generate an image including use of appropriate direction
                 */
                var animation = status.combineLatest(animationSequence,
                    function (status, index) {
                        return {
                            image: imgPrefix + "-left-" + index + ".png",
                            dir: status.dir
                        }
                    });
                // each tick will set current anim.image and use direction
                // to determine direction and rotation of image
                animation.subscribe(function (anim) {
                    if (figure.removed) { return; }
                    figure.attr({src : anim.image});
                    if (anim.dir == left) {
                        flip(figure, 1);
                        rotate(figure, 0);
                    } else {
                        flip(figure, -1);
                        rotate(figure, anim.dir.getAngleDeg());
                    }
                });
            }
        }
    }

    Game.FigureImage = FigureImage;
}(window.Game));