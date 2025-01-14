const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 200;
const points = [];

// Generate 6 points around a hexagon
for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y });
}

let linesDrawn = [];
let currentPlayer = 'Red';
let selectedPoint = null;
let playerLines = { 'Red': [], 'Blue': [] };
let winningTriangle = null; // Store the winning triangle points

drawPoints();

canvas.addEventListener('click', onCanvasClick);

function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw lines
    for (let line of linesDrawn) {
        // Check if the line is part of the winning triangle
        let isWinningLine = false;
        if (winningTriangle) {
            if (
                winningTriangle.includes(line.start) &&
                winningTriangle.includes(line.end)
            ) {
                isWinningLine = true;
            }
        }
        ctx.strokeStyle = line.color;
        ctx.lineWidth = isWinningLine ? 5 : 2; // Thicker line for winning triangle
        ctx.beginPath();
        ctx.moveTo(points[line.start].x, points[line.start].y);
        ctx.lineTo(points[line.end].x, points[line.end].y);
        ctx.stroke();
    }
    // Draw points
    for (let i = 0; i < points.length; i++) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 10, 0, Math.PI * 2);
        if (i === selectedPoint) {
            ctx.fillStyle = 'yellow'; // Highlight selected point
        } else {
            ctx.fillStyle = 'black';
        }
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }
}

function onCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find the clicked point
    for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const distance = Math.hypot(point.x - x, point.y - y);
        if (distance < 10) {
            if (selectedPoint === null) {
                selectedPoint = i;
                drawPoints();
            } else if (selectedPoint === i) {
                // Toggle off the selected point
                selectedPoint = null;
                drawPoints();
            } else {
                // Check if line already exists
                if (!lineExists(selectedPoint, i)) {
                    linesDrawn.push({
                        start: selectedPoint,
                        end: i,
                        color: currentPlayer,
                        player: currentPlayer
                    });
                    playerLines[currentPlayer].push([selectedPoint, i]);
                    selectedPoint = null;
                    drawPoints();

                    if (checkForTriangle(currentPlayer)) {
                        drawPoints(); // Redraw to highlight the winning triangle
                        setTimeout(() => {
                            alert(currentPlayer + ' wins!');
                            canvas.removeEventListener('click', onCanvasClick);
                        }, 10);
                    } else {
                        currentPlayer = currentPlayer === 'Red' ? 'Blue' : 'Red';
                    }
                } else {
                    alert('Line already drawn!');
                    selectedPoint = null;
                    drawPoints();
                }
            }
            break;
        }
    }
}

function lineExists(a, b) {
    for (let line of linesDrawn) {
        if ((line.start === a && line.end === b) || (line.start === b && line.end === a)) {
            return true;
        }
    }
    return false;
}

function checkForTriangle(player) {
    const playerLinePairs = playerLines[player];
    const connectedPoints = new Set();
    for (let edge of playerLinePairs) {
        connectedPoints.add(edge[0]);
        connectedPoints.add(edge[1]);
    }
    const pointsArray = Array.from(connectedPoints);
    // Check all combinations of three points
    for (let i = 0; i < pointsArray.length; i++) {
        for (let j = i + 1; j < pointsArray.length; j++) {
            for (let k = j + 1; k < pointsArray.length; k++) {
                if (
                    lineExistsBetween(pointsArray[i], pointsArray[j], player) &&
                    lineExistsBetween(pointsArray[j], pointsArray[k], player) &&
                    lineExistsBetween(pointsArray[k], pointsArray[i], player)
                ) {
                    // Store the winning triangle points
                    winningTriangle = [pointsArray[i], pointsArray[j], pointsArray[k]];
                    return true;
                }
            }
        }
    }
    return false;
}

function lineExistsBetween(a, b, player) {
    for (let line of linesDrawn) {
        if (
            ((line.start === a && line.end === b) || (line.start === b && line.end === a)) &&
            line.player === player
        ) {
            return true;
        }
    }
    return false;
}