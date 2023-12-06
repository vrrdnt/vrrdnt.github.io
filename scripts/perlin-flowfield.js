let ctx = canvas.getContext("2d");
let cw = (canvas.width = window.innerWidth);
let ch = (canvas.height = window.innerHeight);
let rid = null; // request animation id

class Particle {
  constructor() {
    this.pos = { x: Math.random() * cw, y: Math.random() * ch };
    this.vel = { x: 0, y: 0 };
    this.base = (1 + Math.random()) * -3;
    this.life = randomIntFromInterval(25, 50);
    this.history = [];
  }

  update() {
    this.history.push({ x: this.pos.x, y: this.pos.y });
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }

  show() {
    this.life--;
    ctx.beginPath();
    let last = this.history.length - 1;
    ctx.moveTo(this.history[last].x, this.history[last].y);
    for (let i = last; i > 0; i--) {
      ctx.lineTo(this.history[i].x, this.history[i].y);
    }

    ctx.strokeStyle = `hsl(116,58%,${this.life * 2}%)`;
    ctx.stroke();

    if (this.history.length > this.life) {
      this.history.splice(0, 1);
    }
  }

  edges() {
    if (
      this.pos.x > cw ||
      this.pos.x < 0 ||
      this.pos.y > ch ||
      this.pos.y < 0
    ) {
      this.pos.y = Math.random() * ch;
      this.pos.x = Math.random() * cw;
      this.history.length = 0;
    }
    if (this.life <= 0) {
      this.pos.y = Math.random() * ch;
      this.pos.x = Math.random() * cw;
      this.life = randomIntFromInterval(25, 50);
      this.history.length = 0;
    }
  }

  follow() {
    let x = ~~(this.pos.x / size);
    let y = ~~(this.pos.y / size);
    let index = x + y * cols;

    let angle = flowField[index];

    this.vel.x = this.base * Math.cos(angle);
    this.vel.y = this.base * Math.sin(angle);
  }
}

let particles = [];

let increment = 0.06;
let size = 15;
let rows = ~~(ch / size) + 2;
let cols = ~~(cw / size) + 2;
let flowField = new Array(rows * cols);

let start = 0;

let time = 0;
let octaves = 2;
let falloff = 0.5;
noiseDetail(octaves, falloff);

for (let i = 0; i < 1500; i++) {
  particles.push(new Particle());
}

function frame() {
 
  ctx.clearRect(0, 0, cw, ch);
  rid = requestAnimationFrame(frame);

  time += 0.005;

  let yoff = 0;

  for (y = 0; y <= rows; y++) {
    let xoff = 0;
    for (x = 0; x <= cols; x++) {
      let angle = noise(xoff, yoff, time) * Math.PI * 2;
      let _x = x * size + size * Math.cos(angle);
      let _y = y * size + size * Math.sin(angle);
      let index = x + y * cols;

      flowField[index] = angle;
      xoff += increment;
    }
    yoff += increment;
  }

  particles.map(p => {
    p.follow();
    p.update();
    p.show();
    p.edges();
  });

}

function Init() {
  cw = canvas.width = window.innerWidth;
  ch = canvas.height = window.innerHeight;

  ctx.fillStyle = "hsla(0, 5%, 5%, .025)";

  rows = ~~(ch / size) + 2;
  cols = ~~(cw / size) + 2;

  //flowField = new Array(rows * cols);
  //getFlowField(rows, cols);

  if (rid) {
    window.cancelAnimationFrame(rid);
    rid = null;
  }
  frame();
}

window.setTimeout(function() {
  Init();

  window.addEventListener("resize", Init, false);
}, 15);

function randomIntFromInterval(mn, mx) {
  return Math.floor(Math.random() * (mx - mn + 1) + mn);
}
