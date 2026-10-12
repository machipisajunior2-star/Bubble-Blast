import './styling/animation.scss'

const animationCanvas = document.querySelector('#animation')
const aC = animationCanvas.getContext('2d')

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

    circles.forEach((circle) => {
        circle.update();
    });
    console.log('working')
}

set();
animate();


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