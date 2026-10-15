import './styling/animation.scss'
import themeSong from './assets/theme-song.mp3'
import muteIcon from './assets/mute.png'
import soundOnIcon from './assets/volume.png'
import homeIcon from './assets/home.png'

const animationCanvas = document.querySelector('#animation')
const playBtn = document.getElementById('play-btn')
const homeBtn = document.getElementById('home-btn')
const homeUi = document.getElementById('home-ui')
const gameUx = document.getElementById('game-ux')
const endGameUi = document.getElementById('end-game-ui')
const themeTrack = document.getElementById('theme-audio')
const audioButton = document.getElementById('audio-btn')
const volumeIconElement = document.getElementById('volume-icon')
const homeIconElement = document.getElementById('home-icon')
const aC = animationCanvas.getContext('2d')

volumeIconElement.src = muteIcon
homeIconElement.src = homeIcon

animationCanvas.width = innerWidth
animationCanvas.height = innerHeight

animationCanvas.style.backgroundColor = '#373F51';

let circles = [];
const colors = ['#7D9C65', '#B93636', '#FF9C4C', '#FFF2A0', '#291606'];

function Circulate() {
    this.radius = Math.floor(Math.random() * 20) + 2;
    this.x = Math.floor(Math.random() * (animationCanvas.width - (this.radius * 2) + 1) + this.radius);
    this.dx = (Math.random() - 0.7) * 2;
    this.y = Math.floor(Math.random() * (animationCanvas.height - (this.radius * 2) + 1) + this.radius);
    this.dy = (Math.random() - 0.7) * 2;
    this.color = colors[Math.floor(Math.random() * colors.length)];

    this.update = function() {
        if (this.x + this.radius > animationCanvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > animationCanvas.height || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }

        this.x += this.dx;
        this.y += this.dy;
        this.draw();
    };

    this.draw = function() {
        aC.beginPath();
        aC.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        aC.fillStyle = this.color;
        aC.fill();
        aC.lineWidth = 1
        aC.stroke()
        aC.closePath()
    };
}

function set() {
    circles = [];
    for (let i = 0; i < 100; i++) {
        circles.push(new Circulate());
    }
}

function animate() {
    const animationId = requestAnimationFrame(animate);
    aC.clearRect(0, 0, animationCanvas.width, animationCanvas.height);

    playBtn.addEventListener('click', () => {
        cancelAnimationFrame(animationId)
        homeUi.style.display = 'none'
        gameUx.style.display = 'grid'
        themeTrack.muted = true
    })

    circles.forEach((circle) => {
        circle.update();
    });
}

set();
animate();

function playSound(soundFile, audioElement) {
    audioElement.src = soundFile
    try {
        audioElement.currentTime = 0;
        audioElement.play().catch(err => {
            console.warn("Audio play blocked:", err);
        });
    } catch (e) {
        console.error("Audio error:", e);
    }
}

audioButton.addEventListener('click', () => {
    audioButton.blur();
    if (themeTrack.muted == true && homeUi.style.display != 'none') {
        themeTrack.muted = false;
        playSound(themeSong, themeTrack)
        audioButton.style.backgroundColor = 'rgb(76, 187, 23)'
        volumeIconElement.src = soundOnIcon
    } else if (themeTrack.muted == false && homeUi.style.display != 'none') {
        themeTrack.muted = true;
        audioButton.style.backgroundColor = 'rgb(255, 8, 0)'
        volumeIconElement.src = muteIcon
    }
})

homeBtn.addEventListener('click', () => {
    endGameUi.style.display = 'none'
    gameUx.style.display = 'none'
    homeUi.style.display = 'grid'
    set();
    animate();
})

addEventListener('resize', function () {
    animationCanvas.width = window.innerWidth;
    animationCanvas.height = window.innerHeight;
    return set();
});

addEventListener("orientationchange", function () {
    animationCanvas.width = window.innerWidth;
    animationCanvas.height = window.innerHeight;
    return set();
});
