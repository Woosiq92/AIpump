
let net;
let video;
let previousFrame = null; // 이전 프레임을 저장하기 위한 변수


async function initialize() {
    video = document.getElementById('webcam');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 'video': true });
        video.srcObject = stream;
    } catch (e) {
        console.error(e);
    }
    
    video.onloadedmetadata = () => {
        video.play();
        detectMovement();
    };
}

function detectMovement() {
    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let dst = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let diff = new cv.Mat(video.height, video.width, cv.CV_8UC4); // 움직임 차이를 저장하기 위한 Mat
    let cap = new cv.VideoCapture(video);
    
    const FPS = 30;
    function processVideo() {
        try {
            cap.read(src);

            // 현재 프레임을 그레이스케일로 변환
            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

            // 이전 프레임이 존재하면 차이 계산
            if (previousFrame) {
                cv.absdiff(dst, previousFrame, diff); // 현재 프레임과 이전 프레임의 차이 계산

                // 움직임 감지의 정확도를 높이기 위해 임계값 설정
                cv.threshold(diff, diff, 25, 255, cv.THRESH_BINARY);
            }
            
            previousFrame = dst.clone(); // 현재 프레임을 이전 프레임으로 저장

            // ... (게임 로직)

        } catch (e) {
            console.error(e);
        }
        setTimeout(processVideo, 1000 / FPS);
    }
    setTimeout(processVideo, 0);
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const arrowSize = 50;
const arrows = [];

// 화살표 생성
function createArrow() {
    const positions = [100, 150, 200, 250];
    const position = positions[Math.floor(Math.random() * positions.length)];

    arrows.push({
        x: position,
        y: 0
    });
}

// 화살표 그리기
function drawArrows() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const arrow of arrows) {
        ctx.fillRect(arrow.x, arrow.y, arrowSize, arrowSize);
        arrow.y += 5;
    }
}

// 화살표와 사용자 입력 처리
document.addEventListener('keydown', (event) => {
    // 예: 화살표키 '왼쪽'을 누르면, x 좌표 100의 화살표를 제거
    if (event.key === 'ArrowLeft') {
        const index = arrows.findIndex(arrow => arrow.x === 100 && arrow.y > canvas.height - arrowSize);
        if (index > -1) {
            arrows.splice(index, 1);
            console.log('Hit!');
        }
    }
    // 비슷한 로직으로 다른 화살표키들도 처리...
});

// 게임 루프
function gameLoop() {
    drawArrows();

    if (Math.random() < 0.02) {
        createArrow();
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();