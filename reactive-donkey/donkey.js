/**
 * donkey.js
 *
 * Adapted from https://www.youtube.com/watch?v=FLSNm7AIBoM
 * Bodil Stokke's Reactive Game Development for the Discerning Hipster talk at jQuery conference, September 2014.
 */

// these were explained as inefficient but simple storage copiers to keep items immutable
// note: let use from javascript 1.7+ for more fine grained block scope than var
function extend(target, src) {
    for (let prop in src) target[prop] = src[prop];
}

function assoc() {
    let out = {};
    for (let i = 0; i < arguments.length; i++) {
        extend(out, arguments[i]);
    }
    return out;
}

// just a quick helper to detect if an item is in the view
function onscreen(node) {
    return !(node.x < -300 || node.y < -1000 || node.y > 1000);
}

// mousetrap binding, using emca6/harmony lambda and reactive subject
function bindKey(key) {
    let sub = new Rx.Subject();
    Mousetrap.bind(key, () => {
        sub.onNext(key);
    });
    return sub;
}

// (final | 0 will drop any decimal portion)
function coordBI(c, baseC) {
    return (c + (baseC || 0) | 0);
}

function updateElement(node) {
    $(node.id)
        .attr("class", node.classes || "")
        .css({
            left: coordBI(node.x, node.baseX) + "px",
            top: coordBI(node.y, node.baseY) + "px"
        })
        .text(node.text);
}

function velocity(node) {
    // assoc is used like underscore's extend...
    return assoc(node, {
        x: node.x + node.vx,
        y: node.y + node.vy
    });
}


function intersects(c, p) {
    let px = coordBI(p.x, p.baseX);
    let cx = coordBI(c.x, c.baseX);
    let py = coordBI(p.y, p.baseY);
    let cy = coordBI(c.y, c.baseY);


    return (Math.abs(cx - px) < 100 && Math.abs(cy - py) < 100);
}

function renderScene(nodes) {
    nodes.forEach(updateElement);
}

const canvas = $("#canvas");
$("<div id='ground'></div>").appendTo(canvas);
$("<div id='pinkie'></div>").appendTo(canvas);
$("<div id='coin'></div>").appendTo(canvas);
$("<div id='stat'></div>").appendTo(canvas);

// - tick is the observable interval at 33ms
// - buffer will create an array of the number of
//   space events during the interval
let tick = bindKey("space")
.buffer(Rx.Observable.interval(33));

let groundStream = Rx.Observable.interval(33)
.map((x) => ({
        id: "#ground",
        baseX: 0,
        y: 320,
        x: ((x % 280) * -8)
    }));


// pinkie is the character
// velocity will be applied and then gravity adjusted each
// tick scan
// the keys are mapped here from tick buffer
let pinkieStream = tick.scan({
    id: "#pinkie",
    baseY: 320,
    x: 0, y: 0,
    vx: 0, vy: 0
}, (p, keys) => {
    p = velocity(p);

    p.vy += 0.98;

    if (p.y >= 0 && p.vy > 0) {
        p.y = 0; p.vy = 0;
    }

    if (keys[0] === "space") {
        if (p.y === 0) {
            p.vy = -20;
            new Audio("../../media/sound/jump.mp3").play();
        }
    }



    return p;
}).takeWhile(onscreen);

let initialStat = {
    id: "#stat",
    baseX: 0, baseY: 0,
    x: 0, y: 0,
    text: "Init.."
};

let statStream = pinkieStream
    .scan(initialStat, (s, pinkie) => {
        s.text = "Donkey y+baseY: " + coordBI(pinkie.y, pinkie.baseY);
        return s;
    });


let initialCoin = {
    id: "#coin",
    vx: -6, vy: 0,
    x: 1600, y: 40
};

// want to be able to detect coin to pinkie
let coinStream = pinkieStream
    .scan(initialCoin, (c, pinkie) => {
        c = velocity(c);
        // will be changing this if she touched, so otherwise..
        if (c.vy === 0 && intersects(c, pinkie)) {
            new Audio("../../media/sound/coin.mp3").play();
            c.vx = 0;
            c.vy = -1;
        }
        if (c.vy < 0) {
            c.vy = c.vy * 2;
        }
        return onscreen(c) ? c : initialCoin;
    });


Rx.Observable
    .zipArray(groundStream, pinkieStream, coinStream, statStream)
    .subscribe(renderScene);

/**
 * @author Peter Kelley
 * @author pgkelley4@gmail.com
 */

/**
 * See if two line segments intersect. This uses the
 * vector cross product approach described below:
 * http://stackoverflow.com/a/565282/786339
 *
 * @param {Object} p point object with x and y coordinates
 *  representing the start of the 1st line.
 * @param {Object} p2 point object with x and y coordinates
 *  representing the end of the 1st line.
 * @param {Object} q point object with x and y coordinates
 *  representing the start of the 2nd line.
 * @param {Object} q2 point object with x and y coordinates
 *  representing the end of the 2nd line.
 */
function doLineSegmentsIntersect(p, p2, q, q2) {
    var r = subtractPoints(p2, p);
    var s = subtractPoints(q2, q);

    var uNumerator = crossProduct(subtractPoints(q, p), r);
    var denominator = crossProduct(r, s);

    if (uNumerator == 0 && denominator == 0) {
        // colinear, so do they overlap?
        return ((q.x - p.x < 0) != (q.x - p2.x < 0) != (q2.x - p.x < 0) != (q2.x - p2.x < 0)) ||
            ((q.y - p.y < 0) != (q.y - p2.y < 0) != (q2.y - p.y < 0) != (q2.y - p2.y < 0));
    }

    if (denominator == 0) {
        // lines are paralell
        return false;
    }

    var u = uNumerator / denominator;
    var t = crossProduct(subtractPoints(q, p), s) / denominator;

    return (t >= 0) && (t <= 1) && (u >= 0) && (u <= 1);
}

/**
 * Calculate the cross product of the two points.
 *
 * @param {Object} point1 point object with x and y coordinates
 * @param {Object} point2 point object with x and y coordinates
 *
 * @return the cross product result as a float
 */
function crossProduct(point1, point2) {
    return point1.x * point2.y - point1.y * point2.x;
}

/**
 * Subtract the second point from the first.
 *
 * @param {Object} point1 point object with x and y coordinates
 * @param {Object} point2 point object with x and y coordinates
 *
 * @return the subtraction result as a point object.
 */
function subtractPoints(point1, point2) {
    var result = {};
    result.x = point1.x - point2.x;
    result.y = point1.y - point2.y;

    return result;
}