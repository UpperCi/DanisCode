const carousel = document.getElementById('carousel');
const turnSpeed = 0.7;
const bgString = "linear-gradient(355deg, rgba(96, 33, 121, 0.5) 0%, rgba( 96, 33, 121, 0.6 ) 80%, rgba( 96, 33, 121, 0.8 ) 100%)";
const calcOffset = 0.5;

const itemData = [
    {
        "name": "portfolio",
        "bgStart": [139, 0, 139], //bottom
        "bgEnd": [116, 98, 224],
        "glass": [72, 182, 249],
        "content": {}
    },
    {
        "name": "ccc",
        "bgStart": [154,104,27],
        "bgEnd": [59,40,78],
        "glass": [199, 136, 42],
        "content": {}
    },
    {
        "name": "sb",
        "bgStart": [72,16,115],
        "bgEnd": [156,92,194],
        "glass": [182, 80, 191],
        "content": {}
    },
    {
        "name": "unplugged",
        "bgStart": [25,61,63],
        "bgEnd": [65,90,173],
        "glass": [65, 150, 186],
        "content": {}
    },
    {
        "name": "magazine",
        "bgStart": [38,148,63],
        "bgEnd": [3,75,65],
        "glass": [3, 161, 56],
        "content": {}
    }
]

let focused = 0;
let prev = 0;
let held = false;
let downEvent;
let width = 100;
let distance = 0;
let inter = 0;
let secDistance = 700; // distance to interpolate 1 second
let baseOffset = 2;
let items = 5;
let focusing = false;

window.addEventListener('load', () => init());

function clampItemPos(n) {
    n += (1 + Math.floor((n) / -items)) * items;
    return n % items;
}

function init() {
    carousel.addEventListener('mousedown', (e) => onMouseDown(e));
    carousel.addEventListener('touchstart', (e) => {
        e.preventDefault();
        onMouseDown(e.changedTouches[0]);
    });
    document.addEventListener('mouseup', (e) => onMouseUp(e));
    document.addEventListener('touchend', (e) => {
        if (e.id === downEvent.id) {
            e.preventDefault();
            onMouseUp(e.changedTouches[0]);
        }
     });
    document.addEventListener('mousemove', (e) => onMouseMove(e));
    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
        onMouseMove(e.changedTouches[0]);
    });
    generateItems();
    updateCarouselPos(0);
}

function createCardBG(rgb) {
    return `linear-gradient(355deg, rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.5) 0%, 
    rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.6 ) 80%, rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.8 ) 100%)`;
}

function createItem(data) {
    let item = document.createElement('div');
    item.classList.add('glass');
    item.style.background = createCardBG(data['glass']);
    item.dataset['bgStart'] = data['bgStart'];
    item.dataset['bgEnd'] = data['bgEnd'];
    return item;
}

function generateItems(limit = false) {
    carousel.innerHTML = '';
    if (!limit) {
        for (let item of itemData) {
            carousel.appendChild(createItem(item));
        }
    }
}

function onMouseDown(e) {
    if ('preventDefault' in e) {
        e.preventDefault();
    }
    if (!held && !focusing) {
        carousel.style.cursor = 'grabbing';
        downEvent = e;
        held = true;
        width = carousel.getBoundingClientRect().width;
        secDistance = width * 0.5;
    }
}

function onMouseUp(e) {
    if ('preventDefault' in e) {
        e.preventDefault();
    }
    held = false;
    carousel.style.cursor = 'grab';
    interBG();
    requestAnimationFrame((ms) => {
        deltaTimeStamp = ms;
        // cool one-liner to update focused
        focused = (Math.abs(inter) > 0.5) ? focused + Math.round(inter) : focused;
        if (focused === prev) {
            prev += Math.sign(inter);
            inter -= Math.sign(inter);
        }
        focusing = true;
        updateCarouselRelease(ms);
    });
}

function setBG(start, end, diff) {
    let startBG = [start['bgStart'][0], start['bgStart'][1], start['bgStart'][2]];
    let endBG = [start['bgEnd'][0], start['bgEnd'][1], start['bgEnd'][2]];
    let cardBG = [start['glass'][0], start['glass'][1], start['glass'][2]];
    for (let i = 0; i < 3; i++) {
        // 0 -> 100 | 0.8 -> 80
        let startDiff = end['bgStart'][i] - startBG[i];
        let endDiff = end['bgEnd'][i] - endBG[i];
        let cardDiff = end['glass'][i] - cardBG[i];
        startBG[i] += Math.round((startDiff) * diff);
        endBG[i] += Math.round((endDiff) * diff);
        cardBG[i] += Math.round((cardDiff) * diff);
    }

    let cards = document.getElementsByClassName('bg-mutable');
    for (let card of cards) {
        card.style.background = createCardBG(cardBG);
    }

    bubbleDiv.style.background = `linear-gradient(0deg, rgba(${startBG[0]},${startBG[1]},${startBG[2]},1) 0%,
    rgba(${endBG[0]},${endBG[1]},${endBG[2]},1) 100%)`;
}

function interBG() {
    let basePos = -Math.round(baseOffset - 0.5 * Math.sign(inter)) + 2 - Math.sign(inter);
    // console.log(basePos)
    let targetPos = basePos + Math.sign(inter);
    setBG(itemData[clampItemPos(basePos)], itemData[clampItemPos(targetPos)], Math.abs(inter % 1));
}

function onMouseMove(e) {
    if (held) {
        if ('preventDefault' in e) {
            e.preventDefault();
        }
        distance = e.pageX - downEvent.pageX;

        inter = -distance / secDistance;
        if (Math.abs(inter) > 1) {
            // makes it harder to drag *past* adjacent elements
            inter = Math.sign(inter) + (inter - Math.sign(inter)) / 1.7;
        }

        let dec = Math.abs(inter % 1);

        if (dec < 0.06 || dec > 0.94) {
            inter = Math.round(inter);
            inter += 0.0001; // don't want to worry about whole numbers
        }

        updateCarouselPos(inter);
        let tempFocus = Math.round(focused + inter);
        tempFocus += (1 + Math.floor(tempFocus / -items)) * items;
        tempFocus %= items;
        for (let i = 0; i < carousel.childElementCount; i++) {
            if (i === tempFocus) {
                carousel.children[i].classList.add('focus');
                carousel.children[i].style.opacity = '100%';
            } else {
                carousel.children[i].classList.remove('focus');
            }
        }
    }
}

function updateCarouselPos(offset) {
    baseOffset = 2 - focused - offset;
    for (let i = 0; i < carousel.childElementCount; i++) {
        let delay = baseOffset + i;
        // 6 -> 1; -4 -> 1; -3 -> 2;
        delay += (1 + Math.floor((delay) / -items)) * items; // accounts for negatives
        delay = ((delay + calcOffset) % items) - calcOffset;
        interBG();
        carousel.children[i].style.animationDelay = `-${delay}s`;
    }
}

function updateCarouselRelease(ms) {
    let speed = Math.max(Math.abs(focused - prev), Math.abs(inter * 2));

    let diff = focused - prev;
    inter += delta * speed * turnSpeed * Math.sign(diff - inter);
    let delay = -(diff - inter)
    updateCarouselPos(delay);

    if (Math.abs(delay) / 1 <= delta * speed * turnSpeed) {
        inter = 0;
        prev = focused;
        focusing = false;
        updateCarouselPos(0);
    } else {
        requestAnimationFrame((ms) => updateCarouselRelease(ms));
    }
}
