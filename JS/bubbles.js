const bubbleDiv = document.getElementById('bubbles');
let rect = bubbleDiv.getBoundingClientRect();

const bubbleSpeed = 80;
const speedVar = 40;
const minSize = 60;
const maxSize = 200;

const maxOffset = 800;

let delta = 0;
let deltaTimestamp = 0;

function genBubble(yOffset = 0) {
    let size = minSize + Math.random() * (maxSize - minSize);
    let bubble = document.createElement('bubble');
    bubble.style.top = `${rect.y + rect.height + yOffset}px`;
    bubble.style.left = `${rect.x + Math.random() * (rect.width - size)}px`;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;

    let speedMod = (Math.random() - 0.5) * speedVar;    

    bubble.dataset.speedMod = `${speedMod}`;

    bubbleDiv.appendChild(bubble);
}

function updateBubbles(ms) {
    delta = (ms - deltaTimestamp) / 1000;
    deltaTimestamp = ms;

    if (delta > 0.1) {
        delta = 0.1;
    }

    let bubbles = bubbleDiv.children;
    for (let bubble of bubbles) {
        let top = parseFloat(bubble.style.top);
        top -= (bubbleSpeed + parseFloat(bubble.dataset.speedMod)) * delta;
        bubble.style.top = `${top}px`;
        let size = parseFloat(bubble.style.width);

        if (top < -size) {
            bubble.remove();
            genBubble();
        }
    }

    requestAnimationFrame((ms) => updateBubbles(ms))
}

let bubbleCount = Math.min(6, Math.round(rect.width / 150));

for (let i = 0; i < bubbleCount; i++) {
    genBubble(Math.random() * maxOffset);
}

window.addEventListener('resize', () => {
    rect = bubbleDiv.getBoundingClientRect();
});

requestAnimationFrame((ms) => updateBubbles(ms))
