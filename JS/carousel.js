const carousel = document.getElementById('carousel');
const turnSpeed = 0.7;
const bgString = "linear-gradient(355deg, rgba(96, 33, 121, 0.5) 0%, rgba( 96, 33, 121, 0.6 ) 80%, rgba( 96, 33, 121, 0.8 ) 100%)";
const calcOffset = 0.5;

const itemData = [
    {
        "name": "portfolio",
        "gradient": "linear-gradient(0deg, rgb(139,0,139) 0%, rgb(116,98,224) 100%)",
        "glass": [72, 182, 249],
        "content": {}
    },
    {
        "name": "ccc",
        "gradient": "linear-gradient(0deg, rgb(154,104,27) 0%, rgb(59,40,78) 100%)",
        "glass": [199, 136, 42],
        "content": {}
    },
    {
        "name": "sb",
        "gradient": "linear-gradient(0deg, rgb(72,16,115) 0%, rgb(156,92,194) 100%)",
        "glass": [182, 80, 191],
        "content": {}
    },
    {
        "name": "unplugged",
        "gradient": "linear-gradient(0deg, rgb(25,61,63) 0%, rgb(65,90,173) 100%)",
        "glass": [65, 150, 186],
        "content": {}
    },
    {
        "name": "magazine",
        "gradient": "linear-gradient(0deg, rgb(38,148,63) 0%, rgb(3,75,65) 100%)",
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
    let cardBG = [start['glass'][0], start['glass'][1], start['glass'][2]];

    for (let i = 0; i < 3; i++) {
        let cardDiff = end['glass'][i] - cardBG[i];
        cardBG[i] += Math.round((cardDiff) * diff);
    }

    let cards = document.getElementsByClassName('bg-mutable');
    for (let card of cards) {
        card.style.background = createCardBG(cardBG);
    }

    bubbleDiv.style.background = start['gradient'];
    bubbleFG.style.background = end['gradient'];
    bubbleFG.style.opacity = `${diff}`;
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
