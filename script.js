const CHAKRAS = [
    { n: "COROA", f: 963, c: "#a366ff", s: ["Confusão", "Ego"], t: "Diamante" },
    { n: "3º OLHO", f: 852, c: "#6666ff", s: ["Ilusão", "Fadiga"], t: "Ametista" },
    { n: "GARGANTA", f: 741, c: "#66ffff", s: ["Inibição", "Medo"], t: "Turquesa" },
    { n: "CORAÇÃO", f: 639, c: "#66ff66", s: ["Ódio", "Isolamento"], t: "Quartzo Rosa" },
    { n: "PLEXO", f: 528, c: "#ffff66", s: ["Falta de Foco", "Poder"], t: "Citrino" },
    { n: "SACRAL", f: 417, c: "#ffa366", s: ["Bloqueio", "Culpa"], t: "Cornalina" },
    { n: "RAIZ", f: 396, c: "#ff4d4d", s: ["Insegurança", "Medo"], t: "Rubi" }
];

class MasterApp {
    constructor() {
        this.ctx = null; this.osc = null; this.gain = null; this.active = null; this.muted = false;
        this.init();
    }

    init() {
        document.getElementById('menuBtn').onclick = () => document.getElementById('sidebar').classList.toggle('show');
        this.drawVitruviano();
        
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
        document.getElementById('volRange').oninput = (e) => { if(this.gain) this.gain.gain.value = e.target.value; };
    }

    drawVitruviano() {
        const n = document.getElementById('nadisGroup');
        for(let i=0; i<12; i++) {
            const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
            l.setAttribute("x1", "200"); l.setAttribute("y1", "400");
            l.setAttribute("x2", 200 + Math.cos(i) * 150);
            l.setAttribute("y2", 400 + Math.sin(i) * 300);
            l.classList.add("nadi-line");
            n.appendChild(l);
        }
    }

    calibrate() {
        if (!this.active) return;
        
        const tuner = document.getElementById('tuner');
        const targetHz = this.active.f;
        const startHz = parseFloat(tuner.value);
        
        // Efeito de "Search & Lock" do Século XXII
        let startTime = null;
        const duration = 2000; // 2 segundos de viagem sonora para ajuste real

        const sync = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Curva de aceleração suave (Ease-in-out)
            const ease = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const currentHz = startHz + (targetHz - startHz) * ease;
            
            tuner.value = currentHz;
            this.update(currentHz);

            if (progress < 1) {
                requestAnimationFrame(sync);
            } else {
                // MOMENTO DO LOCK: Feedback de sucesso quântico
                this.triggerQuantumLock();
            }
        };
        requestAnimationFrame(sync);
    }

    triggerQuantumLock() {
        const aura = document.getElementById('auraGlow');
        const svg = document.querySelector('.human-svg');
        
        // Flash de Sincronização (Feedback visual de que "está feito")
        aura.style.transition = "0.2s";
        aura.style.opacity = "1";
        svg.style.filter = `drop-shadow(0 0 40px ${this.active.c})`;
        
        setTimeout(() => {
            aura.style.transition = "2s";
            aura.style.opacity = "0.6";
            svg.style.filter = `drop-shadow(0 0 20px ${this.active.c})`;
        }, 300);
    }

    toggleMute() {
        this.muted = !this.muted;
        this.gain.gain.setTargetAtTime(this.muted ? 0 : document.getElementById('volRange').value, this.ctx.currentTime, 0.1);
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
        this.startAudio();
        this.calibrate();
    }

    startAudio() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.osc = this.ctx.createOscillator();
            this.gain = this.ctx.createGain();
            this.gain.gain.value = 0.05;
            this.osc.connect(this.gain); this.gain.connect(this.ctx.destination);
            this.osc.start();
        }
    }

    update(val) {
        document.getElementById('hzText').innerText = val.toFixed(1);
        if (!this.active) return;
        const diff = Math.abs(val - this.active.f);
        const lock = Math.max(0, 1 - diff/100);
        document.getElementById('resFill').style.width = (lock * 100) + "%";
        document.getElementById('auraGlow').style.opacity = lock * 0.8;
        if (this.osc) this.osc.frequency.setTargetAtTime(val, this.ctx.currentTime, 0.1);
    }
}
window.onload = () => new MasterApp();