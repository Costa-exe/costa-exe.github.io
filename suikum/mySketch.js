//Video: https://youtu.be/zTNuMUsO-1g?si=gf3Cc8TarPge0y-K

let timer;
let array;
var Engine = Matter.Engine;
var engine = Engine.create();
var world = engine.world;

let fruitColors = [
    '#f32223',
    '#ac6cff',
    '#f7ba00',
    '#fa080e',
    '#fdef9d',
    '#ffb5ac',
    '#f8ee11',
    '#9fdd0f',
    '#42b307'
]

function setup() {
    createCanvas(500, 600)
    background('#f7f2c8')
    world.gravity.y = 15;

    let walls = []
    walls.push(new Sprite(250, 595, 500, 10, 'static'))
    walls.push(new Sprite(5, 300, 10, 600, 'static'))
    walls.push(new Sprite(495, 300, 10, 600, 'static'))

    walls.forEach(wall => {
        wall.color = color('#f6d581')
        wall.stroke = color('#f6d581')
    })

    curr = new Fruit(0, new Sprite(250, 25, 30, 'd'))
    timer = 0
    array = []
}

function draw() {
    background('#f7f2c8')

    if (curr) {
        curr.sprite.y = 25
        curr.sprite.x = constrain(Number(mouseX), 10 + Number(curr.sprite.d) / 2, 490 - Number(curr.sprite.d) / 2)
        curr.sprite.velocity.y = 0
    } else {
        timer++
    }

    if (mouseIsPressed && curr) {
        array.push(curr)
        curr = null
    }

    if (timer > 50) {
        let newI = int(random(4))
        curr = new Fruit(newI, new Sprite(mouseX, 25, 30 + 30 * newI, 'd'))
        timer = 0
    }

    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array.length; j++) {
            if (i !== j && array[i].i == array[j].i && myCollides(array[i].sprite, array[j].sprite) && !array[i].removed && !array[j].removed) {
                //add new fruit
                let a = array[i].sprite
                let b = array[i].sprite

                let newX = (a.x + b.x) / 2
                let newY = (a.y + b.y) / 2
                let newI = array[i].i + 1
                let newSprite = new Sprite(newX, newY, 30 + 30 * newI, 'd')
                array.push(new Fruit(newI, newSprite))

                //Remove fruits
                array[i].removed = true
                array[j].removed = true

                array[i].sprite.remove()
                array[j].sprite.remove()
            }
        }
    }

    array = array.filter(x => !x.removed)
}

function myCollides(a, b) {
    return dist(a.x, a.y, b.x, b.y) < 2 + a.d
}

class Fruit {
    constructor(i, sprite) {
        this.removed = false
        this.i = i
        this.sprite = sprite
        this.t = random(1000)
        this.sprite.draw = () => {
            push()
            fill(fruitColors[this.i])
            stroke(10)
            ellipse(0, 0, this.sprite.d, this.sprite.d)
            fill(10)
            //eyes
            if (noise(this.t) < 0.35) {
                ellipse(this.sprite.d * 0.3, 0, this.sprite.d * 0.1, this.sprite.d * 0.025)
                ellipse(-this.sprite.d * 0.3, 0, this.sprite.d * 0.1, this.sprite.d * 0.025)
            } else {
                ellipse(this.sprite.d * 0.3, 0, this.sprite.d * 0.1, this.sprite.d * 0.1)
                ellipse(-this.sprite.d * 0.3, 0, this.sprite.d * 0.1, this.sprite.d * 0.1)
            }

            //mouth
            arc(0, 0, this.sprite.d * 0.2, this.sprite.d * 0.3, 0, 180)
            pop()
            this.t += 0.01
        }
    }
}









