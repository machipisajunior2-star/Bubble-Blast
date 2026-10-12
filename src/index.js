import './styling/main.scss'
import './animation.js'
import gsap from 'gsap'
import utils, { randomIntFromRange } from './utils'


const canvas = document.querySelector('#canvas')
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

// pellets
class Pellet {
  constructor(x, y, radius, color) {
    this.x = x
    this.velocity = 10
    this.y = y
    this.radius = radius
    this.color = color
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.closePath()
  }

  update() {
    this.draw()
    this.x += this.velocity
  }
}

let velocity = 1;
//Bubble
class Bubble {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.lineWidth = 1
    c.stroke()
    c.closePath()
  }

  update() {
    this.draw()
    this.x -= velocity
    if (velocity < 6) {
      velocity += 0.0001
    }
  }
}

const gravity = 0.2;

const friction = 0.99

class Debris {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }

  draw() {
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.stroke()
    c.closePath()
    c.restore()
  }

  update() {
    this.draw()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.velocity.y += gravity
    this.x += this.velocity.x
    this.y += this.velocity.y
    this.alpha -= 0.005
  }
}

// Implementation
let player
let pellets
let bubbles
let debris
const playerRadius = 40
const projRadius = 3
const playerX = 0 - playerRadius / 3;
const playerY = canvas.height / 2
const projX = playerRadius / 3 + 30

function init() {
  player = []
  pellets = []
  bubbles = []
  debris = []

  player = new Player(playerX, playerY, playerRadius, '#7c7e83')
  pellets.push(new Pellet(projX, posY, projRadius, 'red'))
}

function trigger() {
    const length = pellets.length - 1;
    if (pellets.length == 0 || pellets[length].x - projX > 30) {
    pellets.push(new Pellet(projX, posY, projRadius, 'white'))
    }
}

let progress = 1000;
function makeBubbles() {
  setInterval(() =>{
    const radius = randomIntFromRange(10, 55)
    const x = randomIntFromRange(canvas.width, canvas.width * 2)
    const y = randomIntFromRange((playerRadius * 2), canvas.height -
                                (playerRadius * 2))
    bubbles.push(new Bubble(x, y, radius, `hsl(${Math.random() * 255}, 50%, 50%)`))
  }, progress)
} 

// Animation Loop
let posY = undefined;

function animate() {
  const animationId = requestAnimationFrame(animate)
  c.fillStyle = "#3D3D3D"
  c.fillRect(0, 0, canvas.width, canvas.height)
    if (progress > 100) {
      progress -= 0.1
    }

  player.update()
  posY = player.y

  if (shoot) {
    trigger()
  }
  
  pellets.forEach((pellet, i) => {
      if (pellet.x >= canvas.width) {
        pellets.splice(i, 1);
      }
        pellet.update()
  })

  bubbles.forEach((bubble, i) => {
    if (bubble.x - bubble.radius <= 0) {
      cancelAnimationFrame(animationId);
    }
    pellets.forEach((pellet, j) => {
      const dist = Math.hypot(bubble.x - pellet.x, bubble.y - pellet.y)
          const debrisCount = bubble.radius * 4;
          const angleIncrement = Math.PI * 2 / debrisCount
          const power = 8

      if (dist - bubble.radius - pellet.radius < 1) {
        if (bubble.radius < 30) {
          for(let i = 0; i < debrisCount; i++) {
            debris.push(new Debris(bubble.x, bubble.y, bubble.radius / 8,
               bubble.color, {
                x: Math.cos(angleIncrement * i) * Math.random() * power,
                y: Math.sin(angleIncrement * i) * Math.random() * power
          }))
          }
        setTimeout(() => {
        bubbles.splice(i, 1)
        pellets.splice(j, 1)
        }, 0)
        } else {
          setTimeout(() => {
            pellets.splice(j, 1)
          }, 0)
          gsap.to(bubble, {
            radius: bubble.radius - 10
          })
        }
      }
    })
    bubble.update()
  })

  debris.forEach((d, i) => {
    if(d.alpha < 0) {
      debris.splice(i, 1)
    }
          d.update()
  })

}

init()
animate()
makeBubbles()

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