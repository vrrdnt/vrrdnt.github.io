let ctx = canvas.getContext("2d");
let cw = (canvas.width = window.innerWidth);
let ch = (canvas.height = window.innerHeight);
let rid = null; // request animation id
ctx.fillStyle = "hsla(0, 5%, 5%, .025)";

const gui = new dat.GUI();

let x_mod = {x_mod: randomIntFromInterval(-3, 3) / 100};
let x_modController = gui.add(x_mod, 'x_mod', -0.03, 0.03);

let y_mod = {y_mod: randomIntFromInterval(-3, 3) / 100};
let y_modController = gui.add(y_mod, 'y_mod', -0.03, 0.03);

let auto_flow = {auto_flow: true};
let autoFlowController = gui.add(auto_flow, 'auto_flow')

y_modController.onFinishChange(function () {
    Init();
    y_modController.updateDisplay();
});

x_modController.onFinishChange(function () {
    Init();
    x_modController.updateDisplay();
});

autoFlowController.onFinishChange(function () {
    if (!autoFlowController.getValue()) { return stopAutoFlow(); }
    autoFlow();
});

let intervalID;

function randomizeFlowAndRedraw() {
    x_modController.setValue(randomIntFromInterval(-3, 3) / 100);
    y_modController.setValue(randomIntFromInterval(-3, 3) / 100);
    Init();
};

function autoFlow() {
    if (!intervalID) {
        return intervalID = setInterval(randomizeFlowAndRedraw, 2000);
    }
    stopAutoFlow();
};

function stopAutoFlow() {
    clearInterval(intervalID);
    intervalID = null;
}

$("#canvas").on("click", function () {
    if ($('.bodyText').css('opacity') == 1) {
        $('.bodyText').css('opacity', 0);
    } 
    else {
        $('.bodyText').css('opacity', 1);
    }
    if ($('.dg.main').css('opacity') == 1) {
        $('.dg.main').css('opacity', 0);
    } else {
        $('.dg.main').css('opacity', 1);
    }
});

let pallette = {
    color: '#66d45e'
}

let colorController = gui.addColor(pallette, 'color');
colorController.onChange(function () {
    let color = colorController.getValue()
    pallette.color = color;
    $('.fa-brands').css('color', color);
    $('.dg .c .slider-fg').css('background', `${color} !important`);
    Init()
})

class Particle {
    constructor() {
        this.pos = { x: Math.random() * cw, y: Math.random() * ch };
        this.vel = { x: 0, y: 0 };
        this.base = (1 + Math.random()) * 3;
        this.life = randomIntFromInterval(3, 20);
        this.color = Math.random() < .2 ? colorController.getValue() : "hsla(0,0%,30%,.7)"
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
        ctx.strokeStyle = this.color;
        ctx.stroke();

        if (this.history.length > this.life) this.history.splice(0, 1);
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
            this.life = randomIntFromInterval(5, 20);
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

let size = 15; //flow field cell size
let rows = ~~(ch / size) + 2;
let cols = ~~(cw / size) + 2;

let flowField = [];

function getAngle(x, y, x_mod, y_mod) {
    // console.log(x_mod, y_mod);
    return (Math.cos(x * x_mod) + Math.cos(y * y_mod)) * Math.PI / 2;
}

function getFlowField(rows, cols) {
    for (y = 0; y <= rows; y++) {
        for (x = 0; x < cols; x++) {
            let index = x + y * cols;
            let a = getAngle(x * size, y * size, x_mod.x_mod, y_mod.y_mod);
            flowField[index] = a;
        }
    }
}

getFlowField(rows, cols);

for (let i = 0; i < 1000; i++) {
    particles.push(new Particle());
}

function frame() {
    rid = requestAnimationFrame(frame);

    ctx.fillRect(0, 0, cw, ch);

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

    flowField = new Array(rows * cols);
    getFlowField(rows, cols);

    if (rid) {
        window.cancelAnimationFrame(rid);
        rid = null;
    }

    particles = [];
    for (let i = 0; i < 1000; i++) {
        particles.push(new Particle());
    }

    frame();
}

window.setTimeout(function () {
    Init();
    if (auto_flow.auto_flow) { autoFlow(); }

    window.addEventListener("resize", Init, false);
}, 15);


function randomIntFromInterval(mn, mx) {
    let result = Math.floor(Math.random() * (mx - mn + 1) + mn);
    return result;
}
