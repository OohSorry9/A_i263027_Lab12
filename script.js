/* -------------------------------------------------------------
   POST-SESSIONAL PARTY INVITATION SCRIPT
   Host: Syed Kashan Shah (26i-3027)
   Features: Particle Engine, Countdown, Web Audio Synth, VIP Ticket Engine
------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. NAVIGATION & PAGE SWITCHING ---
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.page-section');

    function switchTab(targetId) {
        sections.forEach(sec => sec.classList.remove('active'));
        navItems.forEach(nav => nav.classList.remove('active'));

        const activeSec = document.querySelector(targetId);
        if (activeSec) activeSec.classList.add('active');

        const activeNav = document.querySelector(`.nav-item[href="${targetId}"]`);
        if (activeNav) activeNav.classList.add('active');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href');
            switchTab(targetId);
        });
    });

    // Support inner page buttons with href
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            switchTab(target);
        });
    });

    // --- 2. PARTICLES CANVAS ENGINE ---
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = (Math.random() - 0.5) * 0.8;
            this.speedY = (Math.random() - 0.5) * 0.8;
            this.color = Math.random() > 0.5 ? '#00f2fe' : '#ff3b5c';
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const count = Math.floor((canvas.width * canvas.height) / 15000);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }
    initParticles();

    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / 120 * 0.8})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connectParticles();
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // --- 3. REAL-TIME COUNTDOWN TIMER ---
    const partyDate = new Date('November 4, 2026 14:00:00 PST').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = partyDate - now;

        if (distance < 0) {
            document.getElementById('countdown').innerHTML = "<h3 style='grid-column: 1/-1; color: var(--gold-accent);'>THE PARTY IS LIVE! SEE YOU AT CENTAURUS!</h3>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = String(days).padStart(2, '0');
        document.getElementById('hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // --- 4. WEB AUDIO AMBIENT SYNTHESIZER ---
    const audioBtn = document.getElementById('audio-toggle');
    const audioIcon = document.getElementById('audio-icon');
    let audioCtx = null;
    let isPlaying = false;
    let osc1, osc2, gainNode;

    function toggleAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }

        if (isPlaying) {
            if (gainNode) gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
            isPlaying = false;
            audioBtn.classList.remove('playing');
            audioIcon.className = 'fa-solid fa-volume-xmark';
        } else {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            osc1 = audioCtx.createOscillator();
            osc2 = audioCtx.createOscillator();
            gainNode = audioCtx.createGain();

            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(220, audioCtx.currentTime); // A3 note
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(329.63, audioCtx.currentTime); // E4 chord synth

            gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
            gainNode.gain.setTargetAtTime(0.08, audioCtx.currentTime, 0.5);

            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            osc1.start();
            osc2.start();

            isPlaying = true;
            audioBtn.classList.add('playing');
            audioIcon.className = 'fa-solid fa-volume-high';
        }
    }

    audioBtn.addEventListener('click', toggleAudio);

    // --- 5. RSVP FORM & CONFETTI VIP TICKET ENGINE ---
    const rsvpForm = document.getElementById('rsvp-form');
    const ticketResult = document.getElementById('ticket-result');
    const passName = document.getElementById('pass-name');
    const passStatus = document.getElementById('pass-status');
    const ticketCode = document.getElementById('ticket-code');
    const resetRsvpBtn = document.getElementById('reset-rsvp-btn');

    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('guest-name').value.trim();
        const attendance = document.querySelector('input[name="attendance"]:checked').value;

        if (!name) return;

        passName.innerText = name.toUpperCase();
        ticketCode.innerText = 'POST-2026-' + Math.floor(1000 + Math.random() * 9000);

        if (attendance === 'YES') {
            passStatus.innerText = 'CONFIRMED VIP';
            passStatus.style.color = '#00ff88';
        } else if (attendance === 'MAYBE') {
            passStatus.innerText = 'TENTATIVE';
            passStatus.style.color = '#ffb703';
        } else {
            passStatus.innerText = 'DECLINED';
            passStatus.style.color = '#ff3b5c';
        }

        rsvpForm.classList.add('hidden');
        ticketResult.classList.remove('hidden');

        // Launch Celebration Confetti
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    });

    resetRsvpBtn.addEventListener('click', () => {
        ticketResult.classList.add('hidden');
        rsvpForm.classList.remove('hidden');
    });
});
