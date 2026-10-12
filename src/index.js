import './styling/main.scss'


const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

let moveUp = false;
let moveDown = false;
let shoot = false;
let touch = false;
let touchMove = undefined;

class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = 5
  }

  draw() {
    c.save()
    c.beginPath();
    c.moveTo(this.x, this.y);
    c.lineTo(this.x + this.radius + 10,this.y);
    c.lineWidth = 10;
    c.lineCap = "round";
    c.strokeStyle = 'black'
    c.stroke();
    c.restore()
    c.save()
    c.beginPath()
    c.lineWidth = 2
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.stroke()
    c.restore()
    c.closePath()
  }

  update() {
    if (moveUp && this.y - this.radius >= 0) {
      this.y -= this.velocity
    } else if (moveDown && this.y <= canvas.height - this.radius) {
      this.y += this.velocity
    }

    if (touch && this.y - this.radius >= 0 && this.y <= canvas.height - this.radius) {
      this.y = touchMove
    }

    this.draw()
  }
}


let player
const playerRadius = 40
const playerX = 0 - playerRadius / 3;
const playerY = canvas.height / 2

function init() {
  player = []

  player = new Player(playerX, playerY, playerRadius, '#7c7e83')
}

function animate() {
  const animationId = requestAnimationFrame(animate)
  player.update()
}

init()
animate()

// Event Listeners
addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') {
    moveUp = true
  } else if (event.key === 'ArrowDown') {
    moveDown = true
  } else if (event.key === ' ') {
    shoot = true
  }
})

addEventListener('touchmove', (event) => {
  touchMove = event.pageY
})

addEventListener('touchstart', (event) => {
  touch = true
  shoot = true
  touchMove = event.pageY
})

addEventListener('touchend', () => {
  touch = false
  shoot = false
})


addEventListener('keyup', (event) => {
  if (event.key === 'ArrowUp') {
    moveUp = false
  } else if (event.key === 'ArrowDown') {
    moveDown = false
  } else if (event.key === ' ') {
    shoot = false
  }
})

addEventListener('resize', () => {
  canvas.width = innerWidth
  canvas.height = innerHeight
})