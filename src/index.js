import './styling/main.scss'
import './animation.js'
import { gsap } from 'gsap';
import utils, { randomIntFromRange } from './utils'
import gameStartFile from './assets/game-start.mp3'
import shootFile from './assets/shoot2.mp3'
import bubbleShrinkFile from './assets/bubble-shrink-2.mp3'
import bubblePopFile from './assets/bubble-popping.mp3'
import gameOverFile from './assets/game-over-sound.mp3'
import muteIcon from './assets/mute.png'
import soundOnIcon from './assets/volume.png'

const canvas = document.getElementById('canvas')
const volumeIcon = document.getElementById('volume-icon')
const endGameUi = document.getElementById('end-game-ui')
const result = document.getElementById('result');
const pauseBtn = document.getElementById('pause-btn')
const controls = document.getElementById('controls')
const scoreDisplay = document.querySelector('.score-div')
const gameUx = document.getElementById('game-ux')
const scoreBoard = document.querySelector('#score')
const audioButton = document.getElementById('audio-btn')
const themeTrack = document.getElementById('theme-audio')
const gameStartAudio = document.getElementById('game-start-audio')
const shootAudio = document.getElementById('shoot-audio')
const bubbleShrinkAudio = document.getElementById('bubble-shrink-audio')
const bubblePopAudio = document.getElementById('bubble-pop-audio')
const endGameAudio = document.getElementById('game-over-audio')
const buttons = document.querySelectorAll('button')
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

  apply() {
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

    this.apply()
  }
}

class Pellet {
  constructor(x, y, radius, color) {
    this.x = x
    this.velocity = 10
    this.y = y
    this.radius = radius
    this.color = color
  }

  apply() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.closePath()
  }

  update() {
    this.apply()
    this.x += this.velocity
  }
}

let velocity = 1;

class Bubble {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

  apply() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.lineWidth = 1
    c.stroke()
    c.closePath()
  }

  update() {
    this.apply()
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

  apply() {
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
    this.apply()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.velocity.y += gravity
    this.x += this.velocity.x
    this.y += this.velocity.y
    this.alpha -= 0.005
  }
}

let score = 0;
scoreBoard.innerHTML = score
let bubbles
let timerId = null;
let player
let pellets
let debris
const playerRadius = 40
const projRadius = 3
const playerX = 0 - playerRadius / 3;
const playerY = canvas.height / 2
const projX = playerRadius / 3 + 30

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

function trigger() {
    const length = pellets.length - 1;
    if (pellets.length == 0 || pellets[length].x - projX > 70) {
      pellets.push(new Pellet(projX, posY, projRadius, 'white'))
      playSound(shootFile, shootAudio)
    }
}

let progress = 1000;
function makeBubbles() {
    if (!timerId) {
        timerId = setInterval(() =>{
            const radius = randomIntFromRange(10, 55)
            const x = randomIntFromRange(canvas.width, canvas.width * 2)
            const y = randomIntFromRange((playerRadius * 2), canvas.height -
                                        (playerRadius * 2))
            bubbles.push(new Bubble(x, y, radius, `hsl(${Math.random() * 255}, 50%, 50%)`))
        }, progress)
    }
}


function set() {
  player = []
  pellets = []
  bubbles = []
  debris = []
  progress = 1000
  velocity = 1

  player = new Player(playerX, playerY, playerRadius, '#7c7e83')
  playSound(gameStartFile, gameStartAudio)
}

// Animation Loop
let animationId
let posY = undefined;
let moveUp = false;
let moveDown = false;
let shoot = false;
let touch = false;
let touchMove = undefined;

function stopAnimation() {
  cancelAnimationFrame(animationId);
  clearInterval(timerId)
  timerId = null
}

function animate() {
  animationId = requestAnimationFrame(animate)

  c.fillStyle = "#373F51"
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
      endGameUi.style.display = 'grid'
      scoreDisplay.style.visibility = "hidden"
      pauseBtn.style.visibility = "hidden"
      result.innerHTML = score
      score = 0
      stopAnimation()
      playSound(gameOverFile, endGameAudio)
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
          score += 2
          scoreBoard.innerHTML = score
          playSound(bubblePopFile, bubblePopAudio)
        } else {
            playSound(bubbleShrinkFile, bubbleShrinkAudio)
            score += 1
            scoreBoard.innerHTML = score
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

function startGame() {
  set()
  animate()
  makeBubbles()
}

function continueGame() {
  makeBubbles()
  animate()
}

// Event Listeners
buttons.forEach(button => {
  switch (button.id) {
    case 'play-btn':
      button.addEventListener('click', () => {
          startGame()
      })
    break;
    case 'pause-btn':
      button.addEventListener('click', () => {
          controls.style.display = 'grid'
          stopAnimation()
      })
    break;
    case 'continue-btn':
      button.addEventListener('click', () => {
          continueGame()
          controls.style.display = 'none'
      })
    break;
    case 'restart-btn':
      button.addEventListener('click', () => {
          startGame()
          controls.style.display = 'none'
          score = 0
          scoreBoard.innerHTML = score
      })
    break;
    case 'quit-btn':
      button.addEventListener('click', () => {
          controls.style.display = 'none'
          endGameUi.style.display = 'grid'
          result.innerHTML = score
          score = 0
          scoreDisplay.style.visibility = "hidden"
          pauseBtn.style.visibility = "hidden"
      })
    break;
    case 'play-again':
      button.addEventListener('click', () => {
          endGameUi.style.display = 'none'
          startGame()
          scoreBoard.innerHTML = score
          scoreDisplay.style.visibility = "visible"
          pauseBtn.style.visibility = "visible"
      })
    break;
    case 'home-btn':
      button.addEventListener('click', () => {
          scoreBoard.innerHTML = score
          scoreDisplay.style.visibility = "visible"
          pauseBtn.style.visibility = "visible"
          if (audioButton.style.backgroundColor == 'rgb(255, 8, 0)') {
            themeTrack.muted = true
          } else {
            themeTrack.muted = false
          }
      })
    break;
    case 'audio-btn':
      button.addEventListener('click', () => {
      const audioElements = document.querySelectorAll('audio')
      audioButton.blur();
      audioElements.forEach(audioElement => {
        if (audioElement.muted == true && audioElement.id != 'theme-audio') {
            audioElement.muted = false
            audioButton.style.backgroundColor = 'rgb(76, 187, 23)'
            volumeIcon.src = soundOnIcon
        } else if (audioElement.muted == false && audioElement.id != 'theme-audio') {
            audioElement.muted = true
            audioButton.style.backgroundColor = 'rgb(255, 8, 0)'
            volumeIcon.src = muteIcon
        }
      })
    })
    break;
  }
})

addEventListener('focus', () => {
  if (!timerId && gameUx.style.display == 'grid' &&
      endGameUi.style.display != 'grid' && controls.style.display != 'grid') {
      continueGame()
  }
})

addEventListener('blur', () => {
  stopAnimation()
})

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
  if (event.cancelable) {
    event.preventDefault()
  }
  touchMove = event.pageY
}, { passive: false })

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
