const CHAKRAS = [
    { n: "COROA", f: 963, c: "#a366ff", s: ["Fragmentação Mental", "Ego"], t: "Diamante Quântico" },
    { n: "3º OLHO", f: 852, c: "#6666ff", s: ["Cegueira Intuitiva", "Fadiga"], t: "Ametista" },
    { n: "GARGANTA", f: 741, c: "#66ffff", s: ["Inibição Expressiva", "Medo"], t: "Turquesa" },
    { n: "CORAÇÃO", f: 639, c: "#66ff66", s: ["Isolamento Emocional", "Ódio"], t: "Quartzo Rosa" },
    { n: "PLEXO", f: 528, c: "#ffff66", s: ["Drenagem de Poder", "Ansiedade"], t: "Citrino" },
    { n: "SACRAL", f: 417, c: "#ffa366", s: ["Bloqueio Criativo", "Culpa"], t: "Cornalina" },
    { n: "RAIZ", f: 396, c: "#ff4d4d", s: ["Insegurança Vital", "Sobrevivência"], t: "Rubi" }
];

class MasterQuantum {
    constructor() {
        this.ctx = null;
        this.nodes = { oscL: null, oscR: null, sub: null, gain: null };
        this.active = null;
        this.muted = false;
        this.init();
    }

    init() {
        document.getElementById('menuBtn').onclick = () => document.getElementById('sidebar').classList.toggle('show');
        this.drawGeometry();
        
        const g = document.getElementById('chakraGroup');
        CHAKRAS.forEach((ch, i) => {
            const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            c.setAttribute("cx", "200"); c.setAttribute("cy", 120 + (i * 90)); c.setAttribute("r", "12");
            c.classList.add("chakra-circle");
            c.onclick = () => this.select(ch, c);
            g.appendChild(c);
        });

        document.getElementById('tuner').oninput = (e) => this.update(parseFloat(e.target.value));
        document.getElementById('calibBtn').onclick = () => this.calibrate();
        document.getElementById('muteBtn').onclick = () => this.toggleMute();
        document.getElementById('volRange').oninput = (e) => { if(this.nodes.gain) this.nodes.gain.gain.value = e.target.value; };
    }

    drawGeometry() {
        const n = document.getElementById('nadisGroup');
        for(let i=0; i<18; i++) {
            const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
            l.setAttribute("x1", "200"); l.setAttribute("y1", "400");
            l.setAttribute("x2", 200 + Math.cos(i) * 160);
            l.setAttribute("y2", 400 + Math.sin(i) * 320);
            l.classList.add("nadi-line");
            n.appendChild(l);
        }
    }

    calibrate() {
        if (!this.active) return;
        const tuner = document.getElementById('tuner');
        const target = this.active.f;
        const start = parseFloat(tuner.value);
        let startTime = null;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / 2500, 1);
            const ease = progress < 0.5 ? 2*progress*progress : 1-Math.pow(-2*progress+2, 2)/2;
            const current = start + (target - start) * ease;
            
            tuner.value = current;
            this.update(current);
            if (progress < 1) requestAnimationFrame(animate);
            else this.triggerLock();
        };
        requestAnimationFrame(animate);
    }

    triggerLock() {
        const vitruvian = document.getElementById('vitruvian');
        vitruvian.style.filter = `drop-shadow(0 0 50px ${this.active.c})`;
        setTimeout(() => vitruvian.style.filter = `drop-shadow(0 0 20px ${this.active.c})`, 500);
    }

    toggleMute() {
        this.muted = !this.muted;
        const v = document.getElementById('volRange').value;
        this.nodes.gain.gain.setTargetAtTime(this.muted ? 0 : v, this.ctx.currentTime, 0.1);
        document.getElementById('muteBtn').innerText = this.muted ? "SOUND" : "MUTE";
    }

    select(data, el) {
        this.active = data;
        document.querySelectorAll('.chakra-circle').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
        document.documentElement.style.setProperty('--active-color', data.c);
        document.getElementById('cName').innerText = data.n;
        document.getElementById('sList').innerHTML = data.s.map(s => `<li>${s}</li>`).join('');
        document.getElementById('cTools').innerText = data.t;
        this.bootAudio();
        this.calibrate();
    }

    bootAudio() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.nodes.gain = this.ctx.createGain();
            this.nodes.gain.gain.value = 0.05;
            this.nodes.gain.connect(this.ctx.destination);

            const merger = this.ctx.createChannelMerger(2);
            merger.connect(this.nodes.gain);

            this.nodes.oscL = this.ctx.createOscillator();
            this.nodes.oscL.connect(merger, 0, 0);
            
            this.nodes.oscR = this.ctx.createOscillator();
            this.nodes.oscR.connect(merger, 0, 1);
            
            this.nodes.sub = this.ctx.createOscillator();
            this.nodes.sub.type = 'triangle';
            this.nodes.sub.connect(this.nodes.gain);

            this.nodes.oscL.start(); this.nodes.oscR.start(); this.nodes.sub.start();
        }
    }

    update(val) {
        document.getElementById('hzText').innerText = val.toFixed(1);
        if (!this.active) return;
        
        const diff = Math.abs(val - this.active.f);
        const lock = Math.max(0, 1 - diff/80);

        if (this.nodes.oscL) {
            const t = this.ctx.currentTime;
            this.nodes.oscL.frequency.setTargetAtTime(val, t, 0.1);
            this.nodes.oscR.frequency.setTargetAtTime(val + 8, t, 0.1); // Binaural Alfa
            this.nodes.sub.frequency.setTargetAtTime(val / 2, t, 0.1); // Veludo
        }

        // Rotação da Geometria Dinâmica
        document.getElementById('nadisGroup').style.transform = `rotate(${val/10}deg)`;
        
        document.getElementById('resFill').style.width = (lock * 100) + "%";
        document.getElementById('auraGlow').style.opacity = lock * 0.7;
    }
}
window.onload = () => new MasterQuantum();