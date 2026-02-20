// Skyline Image
const skyline = new Image();
skyline.src = './skyline-silhouette.svg';
skylineWidth = 750;
skylineHeight = 250;

// Backdrop Image
const greydropLowRes = new Image();
const greydrop = new Image();
const backdropLowRes = new Image();
const backdrop = new Image();
greydropLowRes.src = './brick-town-greyscale-lowres.png';
greydrop.src = './brick-town-greyscale.svg';
backdropLowRes.src = './brick-town-8bit-color-midres.png';
backdrop.src = './brick-town-flattened.svg';
const backdropWidth = 12611;
const backdropHeight = 1439;
const backdropHorizon = 545;

// Keep track of generated images
const brickImages = [backdrop, backdropLowRes, greydrop, greydropLowRes];

const svgVariants = [
    `<?xml version="1.0" encoding="UTF-8"?><svg id="a" opacity="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80"><rect x="-3046" y="5" width="2600" height="1600" fill="#5b2317"/><path d="M3.65,3.13c53.9-1.12,105.35-.68,159.56-2.63,14.41-1.31,28.25.01,33.17,3.53,3.13,2.24-1.19,4.46.77,22.52-.43,3.34-.88,8.59-.46,14.95,1.24,12.57,3.76,19.6,3.25,34.51-47.77,1.34-109.76,4.78-151,3.83-27.83-1.11-39.39-3.67-44.73-15.18C-3.39,44.09,1.14,19.6,3.65,3.13Z" fill="#b34f34"/></svg>`,
    `<?xml version="1.0" encoding="UTF-8"?><svg id="a" opacity="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80"><path d="M0,28.82c0,16.84.06,33.54.19,50.1,38.41-.2,77.64-.74,116.05-1.61,29.54-2.38,83.61,14.61,82.32-15.25-1-23.31,8.65-59.29-11.62-61.79C126.1,1.25,62.54-2,.08,2.26.03,11.07,0,19.93,0,28.82Z" fill="#a94b30"/><path d="M11.2,64.27c7.18,7.52,16.79,4.96,35.07,3.32,12.21-1.1,30.19-1.95,52.68-.16.6-4.62,3.89-32.37-9.82-48.2-7.38-8.52-17.33-10.86-29.35-13.69-7.95-1.87-13.63-1.96-22.17-2.1-16.95-.27-26.26-.26-30.68,7.21-2.44,4.12-2.58,9.15-2.34,12.65-1.39,10.56-2.88,31.04,6.6,40.97Z" fill="#ca5a3f" opacity=".5"/></svg>`,
    `<?xml version="1.0" encoding="UTF-8"?><svg id="a" opacity="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80"><path d="M1.77,1.34c-2.44,27.62.09,47.64-1.77,76.73,42.74.18,110.12,1.57,140.62,1.18,33.59,1.63,49.53,1.18,58.37-7.08,2.04-1.91.46-3.99-.07-16.18C196.29,16.64,206.45.5,186.49.06,124.92.52,63.32-.98,1.77,1.34Z" fill="#af4f36"/><path d="M145.04,70.8H21.23c-5.84,0-10.61-7.34-10.61-16.32V21.84c0-4.49,1.19-8.57,3.12-11.53,2.34-3.59,5.39-4.45,7.5-4.79,6.98-1.15,28.48-.81,57.48,1.36,10.49.3,19.23,1.53,25.65,2.72,15.05,2.79,23.74,4.52,33.61,12.24,7.35,5.75,12.61,12.68,15.92,17.68,6.78,10.43,13.56,20.85,20.34,31.28-3.76.72-7.9,1.23-12.38,1.36-6.23.18-11.87-.42-16.8-1.36Z" fill="#ca5a3f" opacity=".5"/></svg>`,
    `<?xml version="1.0" encoding="UTF-8"?><svg id="a" opacity="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80"><path d="M.34,29.03c-.07,15.88-.18,31.67-.34,47.38,36.69,2.8,79.34,3.34,116.14,1.46,25.48-1.46,81.95,12.24,82.01-15.36.05-22.47,8.62-59.73-11.57-62.23C125.96,1.26,62.65-2.01.42,2.27c-.01,8.89-.04,17.81-.08,26.76Z" fill="#ab4d34"/><path d="M5.23,45.03c.81,5.63,2.79,14.17,8.27,19.93,5.02,5.27,10.05,5.15,21.25,5.75,31.82,1.68,35.14,4.95,48.74,1.05,6.74-1.93,12.11-4.51,15.64-6.41.35-10.09,0-33.64-12.11-47.24-8.4-9.44-19.37-9.81-40.98-10.16-16.47-.27-29.98,1.66-39.1,3.42-.37,4.05-.75,8.09-1.12,12.14-.2,7.18-.4,14.35-.6,21.53Z" fill="#ca5a3f" opacity=".5"/></svg>`,
    `<?xml version="1.0" encoding="UTF-8"?><svg id="a" opacity="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80"><rect x="-2826" y="-95" width="2600" height="1600" fill="#5b2317"/><path d="M.08,27.56c.21,14.85.87,28.95,1.84,42.23,37.78,8.3,70.57,9.14,109.15,7.21,22.31-1.11,80.39,14.97,87.16-17.66-.13-19.18,8.63-56.69-11.6-59.07C125.91,1.2,62.49-1.91.15,2.16-.01,10.35-.05,18.82.08,27.56Z" fill="#a94b32"/></svg>`,
    `<?xml version="1.0" encoding="UTF-8"?><svg id="a" opacity="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80"><rect x="-3046" y="-95" width="2600" height="1600" fill="#5b2317"/><path d="M1.24,14.13C2.6,9.42,3.96,4.71,5.32,0c54.35,1.48,106.12,1.28,160.85,1.06,24.51-.18,26.69-.8,29.4,2.13,5.72-1.52,1.93,49.89,4.43,74.64-30.04-4.93-187.27,13.65-196.41-10.78C-1.74,56.15.14,30.21,1.24,14.13Z" fill="#b34f34"/></svg>`,
    `<?xml version="1.0" encoding="UTF-8"?><svg id="a" opacity="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80"><path d="M.62,29.13c-.81,16.49-1.26,32.87,1.51,47.65,74.18.27,133.35,6.32,197.87,1.12-1.72-24.1-1.63-40.56-.88-52.43.32-5.1,1.18-15.92-3.92-21.36C133.09-3.54,65.47,1.57.7,2.97c.26,10.96.11,19.92-.08,26.16Z" fill="#c24b32"/><path d="M12.68,68.97c5.03,4.43,7.78,1.09,30.45,1.06,20.13-.03,26.33,2.6,40.11-1.14,6.92-1.88,12.39-4.45,15.84-6.27-2.87-11.42-5.48-16.32-7.64-19.08-1.91-2.44-3.48-4.16-4.43-5.07C58.58,11.43,38.48,6.1,38.48,6.1c-7.53-2-27.29-7.24-32.84,3.75-1.88,3.73-1.62,8.33-1.02,11.87-3.4,34.45,4.61,44.22,8.05,47.26Z" fill="#ca5a3f" opacity=".5"/></svg>`,
    `<?xml version="1.0" encoding="UTF-8"?><svg id="a" opacity="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80"><path d="M.03,29.12c.1,17.03.49,33.56,1.13,49.57,73.56-3.66,130.26,5.4,198.46-1.12-1.82-24.74,4.57-62.9-5.29-73.46C132.23-3.52,64.81,1.55.1,2.96,0,11.54-.03,20.26.03,29.12Z" fill="#a94b30"/><path d="M6.42,69.76c13.1,1.35,26.88,2.29,41.3,2.69,20.89.57,40.55-.1,58.81-1.57-3.04-5.04-7.58-12.69-12.98-22.28-4.01-7.12-4.07-7.44-5.24-9.35-8.77-14.27-20.69-20.83-24.8-23.03-11.16-5.96-20.42-6.29-31.61-6.69-10.6-.38-19.39.94-25.47,2.23-.55,4.57-1.1,9.13-1.65,13.7.55,14.77,1.1,29.54,1.65,44.31Z" fill="#ca5a3f" opacity=".5"/></svg>`,
    `<?xml version="1.0" encoding="UTF-8"?><svg id="a" opacity="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80"><path d="M199.96,29.58c-.15,17.45-.66,34.24-1.46,50.33-13.14.08-65.51.35-115.19-.58-23.73-.44-47.4-1.15-47.4-1.15-14.33-.43-26.15-.86-34.13-1.16C.17,59.4-.09,44.74.02,33.99.2,17.65,1.27,8.46,6.31,3.5,8.47,1.39,10.77.61,12.36.29c61.06,1,124.84-2.34,187.53,2.03.12,8.89.15,17.98.08,27.26Z" fill="#ab5336"/><path d="M186.44,54.92c-10.74,17.2-29.49,16.75-57.76,16.28-19.21-.32-49.33-.77-94.52-1.16,8.44-6.92,21.06-18.22,35.01-34.88,8.63-10.31,8.48-11.57,12.93-15.7,12.07-11.22,25.39-13.28,57.26-12.82,15.13.22,33.37.99,54.1,2.95,1.28,12.38,1.64,31.51-7,45.34Z" fill="#ca5a3f" opacity=".5"/></svg>`,
];
brickColors = [
    '#a94b32',
    '#b34f34',
    '#c24b32',
    '#ab5336',
    '#b34f34',
    '#ca5a3f',
    '#a94b30',
    '#c24b32',
    '#5b2317',
    '#b34f34',
    '#a94b30',
    '#af4f36',
    '#ab4d34',
];
const randomSvg = () => {
    const min = 0;
    const max = svgVariants.length-1;
    const random = Math.floor(Math.random() * (max - min)) + min;
    return svgVariants[random];
};

// Helper method
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// Standard colors
//const roadBedColor = '#564c45';
const roadBedColor = '#cccccc';

// Standard Brick SVG
const svgBrick = `<?xml version="1.0" encoding="UTF-8"?>
    <svg id="brick" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 119.77 48.64" opacity="1">
    <path id="clay" class="clay" d="M.06,4.7C-.24,2.45,1.37.22,3.1.13c.15-.01.28-.06.4-.13h22.83c2.34.46,4.58,1.7,7.07,1.05,1.91-.49,3.82-.72,5.74-1.05h43.96c.19.21.43.37.75.36,5.75-.04,11.59,1.25,17.32.46,2.7-.37,5.3-.65,7.91-.82h8.19c.9.57,1.55,1.36,2.03,2.31-.36,2.76-.66,5.74-.57,8.51.07,2.54.65,4.92.98,7.42.01.08.05.1.06.17v4.32c-.16.23-.26.51-.27.9-.11,3.36-1.2,6.73-.78,10.11.28,2.24.84,4.35,1.05,6.55v5.85c-1.29.77-2.54,1.61-3.79,2.5h-32.44c-.19-.21-.44-.36-.77-.36-2.24.07-4.12-1.8-6.41-1.46-2.04.31-3.95,1.1-5.93,1.74-.05.02-.07.06-.11.07h-21.77c-.11-.13-.28-.24-.46-.3-3.35-1.02-6.62-.13-9.99-.06-.3,0-.53.16-.71.36h-5.22c-.4-.24-.78-.45-1.22-.53-.49-.08-.86.17-1.12.53H4.67c-1.04-1.16-2.24-2-3.62-2.62-.06-.02-.1,0-.15-.02-.29-2.85-.23-6.22-.34-7.44-.13-1.25-.28-2.53-.56-3.76V5.46c.07-.23.09-.48.06-.76Z" style="fill: #722011;"/>
    <path id="shadow" class="shadow" d="M1.86,31.71c.72.4,1.49.1,1.74-.91.91-3.53,5.32-4.13,3.81,2.99-.21.71-.35,1.47-.41,2.23,0,2.15-.05,2.13.75,3.91.73,1.63,2.62,2.31,3.72,3.33.49.44,1.99,2.76,2.95,3.09,1.29.46,3.77-1.43,4.48-1.69,2.24-.86,4.54-1.42,6.75-2.39.94-.4,1.78-.99,2.54-1.66,1.4.48,2.87.89,4.11.63,3.61-.73,6.26-.41,9.53,1.22,5.41,2.69,10.87.79,16.52,1.26,3.66.3,7.59,1.58,10.71-1.65,4.44-4.62,6.56-.69,10.75,1.49,4.08,2.12,8.5,3.97,12.91,2.63,5.25-1.59,11.25-1.19,16.67-1.54,1.66-.12,5.68.3,6.75-2.03.39-.84,2.13-5.82,1.91-5.67.35-.25.73-.43,1.08-.64.25,1.32.5,2.64.63,3.98v5.85c-1.29.77-2.54,1.61-3.79,2.5h-32.44c-.19-.21-.44-.36-.77-.36-2.24.07-4.12-1.8-6.41-1.46-2.04.31-3.95,1.1-5.93,1.74-.05.02-.07.06-.11.07h-21.77c-.11-.13-.28-.24-.46-.3-3.35-1.02-6.62-.13-9.99-.06-.3,0-.53.16-.71.36h-5.22c-.4-.24-.78-.45-1.22-.53-.49-.08-.86.17-1.12.53H4.67c-1.04-1.16-2.24-2-3.62-2.62-.06-.02-.1,0-.15-.02-.29-2.85-.23-6.22-.34-7.44-.13-1.25-.28-2.53-.56-3.76v-4c.62.3,1.25.57,1.86.91Z" style="opacity: .25;"/>
</svg>`;

// Standard Brick Dimensions
const brickWidth = 100;
const brickHeight = brickWidth * (2 / 5); // 5:2 ratio
const brickSpacing = 2;
const brickFontSize = 16;
const maxBricks = 600;

function BrickImage(color=null, opacity=1) {
    let svg = randomSvg()
        //.replace(`fill: #722011;`, `fill: ${color};`)
        .replace(`opacity="1"`, `opacity="${opacity}"`);
    if (color !== null) {
        brickColors.forEach(bc => {
            svg = svg.replace(bc, color);
        });
    }
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    brickImages.push(img);
    return img;
}

function WriteBrickText(ctx, {text, x, y, width, height, size, color, zoom, shadow}) {
    const write = (offset, color) => {
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = `${size*zoom}px Itim`;
        ctx.fillStyle = color;
        const lines = text.split('\n');
        lines.forEach((line, lineIndex) => {
            const lineHeight = size * zoom;
            const totalTextHeight = lines.length * lineHeight;
            const startY = offset + y + (height / 2) - (totalTextHeight / 2) + (lineHeight / 2);
            const lineY = startY + lineIndex * lineHeight;
            ctx.fillText(line, offset + x + width / 2, lineY);
        });
    }
    if (shadow === true) {
        write(-1, 'rgba(50, 50, 50, 0.25)');
        write(1, 'rgba(50, 50, 50, 1)');
    }
    write(0, color);
}

let furthestBrickX = 0;

function BrickRoad(
    elementId,
    donors,
    scrollable=true,
    zoomable=false,
    orientation = 'horizontal',
    offsetY = 0,
    initZoom = 1,
) {
    // Define sections of the brick road
    const sections = [
        { layers: 3, bottom: 496, left: 250, start: 0, limit: 54 },
        { layers: 4, bottom: 540, left: 2755, start: 54, limit: 74 },
        { layers: 6, bottom: 540, left: 5348, start: 128, limit: 110 },
        { layers: 13, bottom: 558, left: 7709, start: 238, limit: 247 },
        { layers: 7, bottom: 558, left: 9889, start: 485, limit: 115 },
    ];


    // Create canvas inside the specified container element
    const container = document.getElementById(elementId);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    // Keep track of zoom and pan position
    let zoom = initZoom;
    let originX = 0;
    let originY = 0;
    let panLeft = 0;
    let panTop = offsetY;

    // Brick dimensions after applying zoom
    const bWidth = () => brickWidth * zoom;
    const bHeight = () => brickHeight * zoom;
    const bSpacing = () => brickSpacing * zoom;
    const spacerWidth = () => bWidth() / 2;

    // Define standard brick images for this widget
    const spacerBrick = () => BrickImage('#59170e', '0.75');
    const blankBrick = () => BrickImage('#ffffff', '0.1');

    // Define a brick for each donor
    const bricks = donors.map((donor, index) => ({
        name: donor[0],
        size: donor[1] || brickFontSize,
        isChained: donor[2]?.toUpperCase() === 'CHAINED',
        img: BrickImage(),
        textColor: '#333',
    }));

    // Keep track of generated bricks and filled positions
    const blankBricks = new Map();

    // Calculate total road length
    const lastSection = sections[sections.length-1];
    const sectionLayerBrickCount = Math.ceil(lastSection.limit / lastSection.layers);
    const lastSectionLength = (sectionLayerBrickCount * (brickWidth + brickSpacing)) + brickSpacing
    const totalRoadLength = lastSection.left + lastSectionLength + brickWidth/2;

    // Draw bricks on the road
    const draw = () => {
        const filled = new Set();

        // Begin with a clean canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Match background color of canvas to container background color
        // ctx.fillStyle = container.style.backgroundColor || '#CCCCCC';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate brick dimensions based on current zoom level
        const width = bWidth();
        const height = bHeight();
        const spacing = bSpacing();
        const fontSize = brickFontSize;
        const half = width / 2;

        // Calculate the x-y coordinates of the road within the canvas
        const layerHeight = height + spacing;
        //const roadHeight = layerHeight * layers + spacing;
        //const roadY = canvas.height - roadHeight;
        //const roadX = panLeft;

        // Draw skyline
        ctx.globalAlpha = 0.5;
        skylineZoom = Math.max(1, zoom * 1.1);
        ctx.drawImage(
            skyline,
            Math.max(0, canvas.width - skylineWidth - skylineWidth * (Math.abs(panLeft) / totalRoadLength)),
            panTop + canvas.height - (backdropHorizon * zoom) - skylineHeight * skylineZoom,
            skylineWidth * skylineZoom,
            skylineHeight * skylineZoom
        );
        ctx.globalAlpha = 1;

        // Draw grey backdrop
        const bgHeight = backdropHeight * zoom;
        const bgGrey = greydrop.complete ? greydrop : greydropLowRes;
        ctx.drawImage(bgGrey, panLeft-1, panTop + canvas.height - bgHeight + 1, backdropWidth * zoom, bgHeight);

        // Measure progress, then figure out how much of backdrop to crop based on progress
        let maskWidth = sections[0].left;
        let clipWidth = 0;
        if (bricks.length >= maxBricks) {
            maskWidth += totalRoadLength;
            clipWidth = canvas.width;
        } else {
            const currentSection = sections.reduce((acc, current) => {
                return bricks.length >= current.start ? current : acc;
            }, sections[0]);
            const currSectionLayerBrickCount = Math.ceil(currentSection.limit / currentSection.layers);
            const currSectionLength = (currSectionLayerBrickCount * (brickWidth + brickSpacing)) + brickSpacing
            const currSectionProgress = (bricks.length - currentSection.start) / currentSection.limit;
            maskWidth = (currentSection.left + currSectionLength * currSectionProgress + width) * zoom;
            clipWidth = maskWidth + panLeft;
        }

        // Draw cropped color background
        const bgColored = backdrop.complete ? backdrop : backdropLowRes;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, clipWidth, canvas.height);
        ctx.clip();
        ctx.drawImage(bgColored, panLeft-1, panTop + canvas.height - bgHeight + 1*zoom, backdropWidth * zoom, bgHeight);
        ctx.restore();

        // Render one section of road at a time
        sections.forEach((section, sectionIndex) => {
            // Count how many brickers per layer in this section
            const bricksPerLayer = Math.ceil(section.limit / section.layers);
            // Define subset of bricks to work with for this section
            const sectionBricks = section.start < bricks.length
                ? bricks.slice(section.start, section.start + section.limit)
                : []
            ;
            // Calculate the x-y coords of section
            const sectionX = panLeft + section.left * zoom;
            const sectionY = panTop + canvas.height - section.bottom * zoom;
            // Keep track of where to place next brick and which positions have been filled
            let nextRow = 0, nextCol = 0, chainStart = null;
            // Draw one brick at a time
            sectionBricks.forEach((currentBrick, index) => {
                const { name, img, size, textColor, isChained } = currentBrick;
                // Calculate x-y coord of first brick in current row
                const oddRow = nextRow % 2 !== 0;
                const rowX = sectionX + (oddRow ? spacing*2 + half : spacing);
                const rowY = sectionY + spacing + layerHeight * nextRow;
                // Calculate the x coord of current brick
                const brickX = rowX + (width + spacing) * nextCol;
                // // If first brick in odd row, draw a spacer brick
                // if (oddRow && nextCol == 0) {
                //     ctx.drawImage(spacers[nextRow], roadX + spacing, rowY, half, height);
                // } else if (!oddRow && nextCol === bricksPerLayer-1) {
                //     ctx.drawImage(spacers[nextRow], brickX + width + spacing, rowY, width, height);
                // }
                // Draw the brick
                ctx.drawImage(img, brickX, rowY, width, height);
                // Write number
                // const indexSize = 7 * zoom;
                // ctx.textBaseline = "top";
                // ctx.textAlign = "left";
                // ctx.font = `${indexSize}px Arial`;
                // ctx.fillStyle = "#999";
                // ctx.fillText(`${index + 1}`, brickX + 3, rowY + 3);
                // Write brick text
                WriteBrickText(ctx, {
                    text: name,
                    x: brickX,
                    y: rowY,
                    width,
                    height,
                    size: size,
                    color: 'rgba(230, 230, 230, 0.8)',
                    zoom,
                    shadow: true,
                });
                // Mark this position as filled
                filled.add(`${sectionIndex}-${nextRow}-${nextCol}`);
                // Decide the row and col of next brick
                do {
                    if (isChained === true) {
                        if (chainStart === null) {
                            chainStart = nextCol;
                        }
                        nextCol += 1;
                    } else {
                        if (chainStart !== null) {
                            nextCol = chainStart;
                            chainStart = null;
                        }
                        if (nextRow < section.layers-1) {
                            nextRow += 1;
                        } else {
                            nextRow = 0;
                            nextCol += 1;
                        }
                    }
                } while (filled.has(`${sectionIndex}-${nextRow}-${nextCol}`));
            });

            // Draw blank bricks row-by-row
            for (let row = 0; row < section.layers; row++) {
                const oddRow = row % 2 !== 0;
                // For each row, calculate the x-y coords of first brick in row
                const rowY = sectionY + spacing + layerHeight * row;
                const rowX = sectionX + (oddRow ? spacing*2 + half : spacing);
                // Draw blank bricks in row
                for (let col = 0; col < bricksPerLayer; col++) {
                    // Skip if brick space already filled
                    if (filled.has(`${sectionIndex}-${row}-${col}`)) {
                        continue;
                    }
                    const x = rowX + (width + spacing) * col;
                    let blank = blankBricks.get(`${sectionIndex}-${row}-${col}`);
                    if (!blank) {
                        blank = blankBrick();
                        blankBricks.set(`${sectionIndex}-${row}-${col}`, blank);
                    }
                    // Draw spacer brick
                    // if (oddRow && col === 0) {
                    //     ctx.drawImage(spacers[row], roadX + spacing, rowY, half, height);
                    // } else if (!oddRow && col === bricksPerLayer-1) {
                    //     ctx.drawImage(spacers[row], x + width + spacing, rowY, half, height);
                    // }
                    ctx.drawImage(blank, x, rowY, width, height);
                    WriteBrickText(ctx, {
                        text: '$20/month',
                        x,
                        y: rowY,
                        width,
                        height,
                        size: fontSize,
                        color: 'rgba(255, 255, 255, 0.3)',
                        zoom,
                        shadow: false
                    });
                }
            }
        });
    }

    draw();
    // After running draw for the first time, attach load listener to generated images
    brickImages.forEach(img => img.onload = () => draw());

    const panRoad = delta => {
        // originX -= delta;
        // ctx.translate(delta, originY);

        const change = panLeft + delta;
        const maxPan = Math.max(totalRoadLength * zoom - canvas.width, 0);
        panLeft = clamp(
            maxPan * -1,
            change,
            0
        );
        draw();
    };

    function zoomIn() {
        zoom += 0.1;
        panLeft += panLeft * 0.1;
        draw();
    }

    function zoomOut() {
        zoom -= 0.1;
        panLeft += panLeft * 0.1;
        draw();
    }

    window.zoomIn = zoomIn;
    window.zoomOut = zoomOut;


    if (scrollable || zoomable) {
        canvas.onwheel = (event) => {
            if (event.ctrlKey) {
                event.preventDefault();
                const targetZoom = zoom + event.deltaY * -0.0001;
                const finalZoom = Math.max(
                    targetZoom,
                    canvas.width / (totalRoadLength)
                );
                const preLength = backdropWidth * zoom;
                const postLength = backdropWidth * finalZoom;
                const deltaLength = postLength - preLength;
                const panTarget = Math.abs(panLeft) + canvas.width/2;
                const canvasToRoadRatio = totalRoadLength / panTarget;
                const baseAdjustment = (deltaLength / canvasToRoadRatio) * -1;
                const adjustment = baseAdjustment;

                // const delta = (zoom - finalZoom) / -0.0001;
                zoom = finalZoom;
                panRoad(adjustment);
                //console.log(panLeft, panDelta);
                //panRoad(deltaLength/2);
                //panRoad(panDelta);
                //panRoad(deltaRoadLength);
            } else {
                const scrolledToBottom = (window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight;
                if (scrolledToBottom) {
                    if (
                        event.deltaY > 0 ||
                        (event.deltaY < 0 && panLeft < 0)
                    ) {
                        event.preventDefault();
                        panRoad(event.deltaY * -1);
                    }
                }
            }
        };
    }

    let isDragging = false;
    let lastX, lastY;
    const handleDragStart = (x, y) => {
        isDragging = true;
        lastX = x;
        lastY = y;
    };
    const handleDragMove = (x, y) => {
        if (isDragging) {
            const deltaX = x - lastX;
            panRoad(deltaX * 1.5);
            lastX = x;
            draw();
        }
    };
    const handleDragEnd = (event) => {
        if (isDragging) {
            event.preventDefault();
            isDragging = false;
        }
    };
    canvas.addEventListener('mousedown', (event) => {
        event.preventDefault();
        handleDragStart(event.clientX, event.clientY);
    });
    canvas.addEventListener('touchstart', (event) => {
        event.preventDefault();
        handleDragStart(event.touches.item(0).clientX, event.touches.item(0).clientY);
    });
    canvas.addEventListener('mousemove', (event) => {
        event.preventDefault();
        handleDragMove(event.clientX, event.clientY);
    });
    canvas.addEventListener('touchmove', event => {
        event.preventDefault();
        handleDragMove(event.touches.item(0).clientX, event.touches.item(0).clientY);
    });
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('touchcancel', handleDragEnd);

    // Ensure the canvas always fills its container
    const handleResize = () => {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
        draw();
    }
    window.addEventListener('resize', handleResize);
    handleResize();
}