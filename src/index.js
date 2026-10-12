import './styling/main.scss'


const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

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