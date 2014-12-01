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

function updateElement(node) {
    $(node.id)
        .attr("class", node.classes || "")
        .css({
            // (final | 0 will drop any decimal portion)
            left: (node.x + (node.baseX || 0)) | 0 + "px",
            top: (node.y + (node.baseY || 0)) | 0 + "px"
        });
}

function renderScene(nodes) {
    nodes.forEach(updateElement);
}

const canvas = $("#canvas");
$("<div id='ground'></div>").appendTo(canvas);
$("<div id='pinkie'></div>").appendTo(canvas);
$("<div id='coin'></div>").appendTo(canvas);

// - tick is the observable interval at 33ms
// - buffer will create an array of the number of
//   space events during the interval
let tick = bindKey("space")
    .buffer(Rx.Observable.interval(33));

let groundStream = Rx.Observable.interval(33)
.map((x) => ({
        id: "#ground",
        baseX: -128,
        y: 320,
        x: ((x % 320) * -8)
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
            new Audio("../purescript-magic/sfx/jump.ogg").play();
        }
    }

    return p;
}).takeWhile(onscreen);

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
        if (c.vy === 0 && false/*&& intersects(c, pinkie)*/) {
            new Audio("../purescript-magic/sfx/coin.ogg").play();
            c.vx = 0;
            c.vy = -1;
        }
        if (c.vy < 0) {
            c.vy = c.vy * 2;
        }
        return onscreen(c) ? c : initialCoin;
    });


function velocity(node) {
    // assoc is used like underscore's extend...
    return assoc(node, {
        x: node.x + node.vx,
        y: node.y + node.vy
    });
}

Rx.Observable
    .zipArray(groundStream, pinkieStream, coinStream)
    .subscribe(renderScene);