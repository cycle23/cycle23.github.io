/**
 * donkey.js
 *
 * Adapted from https://www.youtube.com/watch?v=FLSNm7AIBoM
 * Bodil Stokke's Reactive Game Development for the Discerning Hipster talk at jQuery conference, September 2014.
 */

const canvas = document.getElementById("canvas");


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

// (final | 0 will drop any decimal portion)
function coordBI(c, baseC) {
    return (c + (baseC || 0) | 0);
}

// just a quick helper to detect if an item is in the view
function onscreen(node) {
    return !(node.x < -300 || node.y < -1000 || node.y > 1000);
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

function makeElement(node) {
    return React.DOM.div({
        className: node.id,
        style: {
            left: (node.x + (node.baseX || 0)) | 0 + "px",
            top: (node.y + (node.baseY || 0)) | 0 + "px"
        }
}, node.text);
}

function renderScene(nodes) {
    return React.renderComponent(
        React.DOM.div(null, nodes.map(makeElement)),
        canvas
    );
}

// mousetrap binding, using emca6/harmony lambda and reactive subject
function bindKey(key) {
    let sub = new Rx.Subject();
    Mousetrap.bind(key, () => {
        sub.onNext(key);
    });
    return sub;
}

// - tick is the observable interval at 33ms
// - buffer will create an array of the number of
//   space events during the interval
let tick = bindKey("space")
.buffer(Rx.Observable.interval(33));

let groundStream = Rx.Observable.interval(33)
.map((x) => ({
        id: "ground",
        baseX: 0,
        y: 320,
        x: ((x % 280) * -8)
    }));


let initialHater = {
    id: "hater",
    vx: -8, vy: 0,
    x: 1600, y: 300
};

let haterStream= tick.scan(initialHater, (c, nope) => {
    c = velocity(c);
    return onscreen(c) ? c: initialHater;
});

// pinkie is the character
// velocity will be applied and then gravity adjusted each
// tick scan
// the keys are mapped here from tick buffer
let pinkieStream = Rx.Observable.zipArray(tick, haterStream).scan({
    id: "pinkie",
    baseY: 320,
    x: 0, y: 0,
    vx: 0, vy: 0,
    points: 0,
    gameOver: false
}, (p, [keys, hater]) => {
    p = velocity(p);

    if (intersects(p, hater)) {
        p.gameOver = true;
        // uses react
        p.id = "pinkie gameover";
        p.points = 0;
        p.vy = -20;
        new Audio("../../media/sound/gameover.mp3").play();
    }
    // just drop out.. takeWhile ensures we start over
    if (p.gameOver) {
        p.vy += 0.5;
        p.points += 1;
        return p;
    }
    p.vy += 0.98;

    // keep from going under
    if (p.y >= 0 && p.vy > 0) {
        p.id = "pinkie";
        p.y = 0;
        p.vy = 0;
    }

    if (keys[0] === "space") {
        if (p.y === 0) {
            p.id = "pinkie jumping";
            p.vy = -20;
            new Audio("../../media/sound/jump.mp3").play();
        }
    }

    return p;
}).takeWhile(onscreen);


let initialCoin = {
    id: "coin",
    vx: -6, vy: 0,
    x: 1600, y: 40
};

// want to be able to detect coin to pinkie
let coinStream = pinkieStream
    .scan(initialCoin, (c, pinkie) => {
        c = velocity(c);
        // will be changing this if she touched, so otherwise..
        if (c.vy < 0) {
            c.vy = c.vy * 2;
        }
        if (c.vy === 0 && intersects(c, pinkie)) {
            new Audio("../../media/sound/coin.mp3").play();
            c.vx = 0;
            c.vy = -1;
        }
        return onscreen(c) ? c : initialCoin;
    });

let initialStat = {
    id: "stat",
    x: 0, y: 0,
    points: 0,
    text: "Init.."
};

let statStream = coinStream
    .scan(initialStat, (s, coin) => {
        if (coin.vy === -1) {
            s.points += 1;
        }
        s.text = "Points: " + s.points;
        return s;
    });

new Audio("../../media/music/coldwet.mp3").play();

Rx.Observable
    .zipArray(groundStream, pinkieStream, coinStream, statStream, haterStream)
    .subscribe(renderScene);
