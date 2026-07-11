// --- 1. Navigation System & Switch Tabs ---
function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.nav-btn');
    
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (tabId === 'home') {
        document.getElementById('home-tab').classList.add('active');
        document.getElementById('nav-home-btn').classList.add('active');
    } else if (tabId === 'agent') {
        document.getElementById('agent-tab').classList.add('active');
        document.getElementById('nav-agent-btn').classList.add('active');
        // Scroll chat thread to bottom upon opening tab
        const chatMessagesWrapper = document.getElementById('chat-messages-wrapper');
        if (chatMessagesWrapper) {
            chatMessagesWrapper.scrollTop = chatMessagesWrapper.scrollHeight;
        }
    }
}


// --- 2. Interactive 3D Card Tilt Effect ---
// Dynamically track active console card and apply tilt
const container = document.querySelector('.viewport-container');

if (container) {
    container.addEventListener('mousemove', (e) => {
        const activeCard = document.querySelector('.console-card.active');
        if (!activeCard) return;

        const rect = activeCard.getBoundingClientRect();
        const cardWidth = rect.width;
        const cardHeight = rect.height;
        
        // Calculate cursor position relative to card center
        const centerX = rect.left + cardWidth / 2;
        const centerY = rect.top + cardHeight / 2;
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        // Compute tilt angles
        const maxTilt = 4; // Lower tilt for larger dashboard card to feel realistic
        const tiltX = -(mouseY / (cardHeight / 2)) * maxTilt;
        const tiltY = (mouseX / (cardWidth / 2)) * maxTilt;
        
        // Apply 3D rotation
        activeCard.style.transform = `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(10px)`;
    });
    
    container.addEventListener('mouseleave', () => {
        const activeCard = document.querySelector('.console-card.active');
        if (activeCard) {
            activeCard.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)';
        }
    });
}


// --- 3. Interactive 3D Canvas Particle Network Background ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let pulses = [];
const maxParticles = 65;
const connectionDistance = 140;
let mouse = { x: null, y: null, radius: 150 };

// Resize Canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Monitor mouse position
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

// Particle Definition
class Particle {
    constructor() {
        this.reset();
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 1.2 + 0.4; // 3D depth layer scale
        this.vx = (Math.random() - 0.5) * 0.6 / this.z;
        this.vy = (Math.random() - 0.5) * 0.6 / this.z;
        this.radius = (Math.random() * 2 + 1) * this.z;
        // Dynamically assign color based on active theme
        const isLight = document.body.classList.contains('light-theme');
        if (isLight) {
            this.color = this.z > 1.2 ? '#6200ea' : (this.z < 0.7 ? '#0088cc' : '#7000ff');
        } else {
            this.color = this.z > 1.2 ? '#00f2fe' : (this.z < 0.7 ? '#7000ff' : '#00d2ff');
        }
        this.alpha = Math.min(this.z * 0.45, 0.8);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = this.z > 1.1 ? 6 : 0;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
    }
}

class Pulse {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.maxRadius = 240;
        this.speed = 4;
        this.alpha = 1.0;
    }
    update() {
        this.radius += this.speed;
        this.alpha = 1 - (this.radius / this.maxRadius);
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 242, 254, ' + this.alpha * 0.4 + ')';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Instantiate particles
for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
}

window.addEventListener('click', (e) => {
    // Only spawn pulses when clicking outside active console cards
    const activeCard = document.querySelector('.console-card.active');
    if (activeCard) {
        const rect = activeCard.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
            pulses.push(new Pulse(e.clientX, e.clientY));
        }
    }
});

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCyberGrid();

    pulses = pulses.filter(p => {
        p.update();
        p.draw();
        return p.radius < p.maxRadius;
    });

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    ctx.globalAlpha = 1.0;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDistance) {
                let opacity = (1 - (dist / connectionDistance)) * 0.22;
                const avgDepth = (p1.z + p2.z) / 2;
                opacity *= avgDepth;

                pulses.forEach(pulse => {
                    const distToPulse = Math.sqrt((p1.x - pulse.x)**2 + (p1.y - pulse.y)**2);
                    if (Math.abs(distToPulse - pulse.radius) < 30) {
                        opacity += 0.45 * pulse.alpha;
                    }
                });

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                const isLight = document.body.classList.contains('light-theme');
                if (isLight) {
                    ctx.strokeStyle = p1.z > p2.z ? 'rgba(98, 0, 234, ' + opacity + ')' : 'rgba(0, 136, 204, ' + opacity + ')';
                } else {
                    ctx.strokeStyle = p1.z > p2.z ? 'rgba(0, 210, 255, ' + opacity + ')' : 'rgba(112, 0, 255, ' + opacity + ')';
                }
                ctx.lineWidth = avgDepth * 0.8;
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateCanvas);
}

function drawCyberGrid() {
    const isLight = document.body.classList.contains('light-theme');
    ctx.strokeStyle = isLight ? 'rgba(98, 0, 234, 0.02)' : 'rgba(0, 210, 255, 0.015)';
    ctx.lineWidth = 1;
    const gridSpacing = 80;
    for (let x = 0; x < canvas.width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}
animateCanvas();


// --- 4. Chat Conversational & Multi-Agent Logic ---
let chatHistory = []; // Stores user and assistant turns in simple alternating List[str] schema

const askBtn = document.getElementById('ask-btn');
const queryInput = document.getElementById('user-query');
const systemPromptInput = document.getElementById('system-prompt');
const modelSelector = document.getElementById('model-selector');
const searchToggle = document.getElementById('web-search-toggle');
const toggleStateText = document.getElementById('toggle-state-text');

const terminalSection = document.getElementById('chat-thread-box');
const messagesWrapper = document.getElementById('chat-messages-wrapper');
const terminalTitle = document.getElementById('terminal-title');
const terminalLatency = document.getElementById('terminal-latency');
const systemStatus = document.getElementById('system-status');
const avatarElement = document.getElementById('avatar-element');

// Web search toggle text update
if (searchToggle && toggleStateText) {
    updateToggleText();
    searchToggle.addEventListener('change', updateToggleText);
}

function updateToggleText() {
    if (searchToggle.checked) {
        toggleStateText.textContent = "ON";
        toggleStateText.classList.add('active');
    } else {
        toggleStateText.textContent = "OFF";
        toggleStateText.classList.remove('active');
    }
}

// Reset Conversation Thread
function resetChatHistory() {
    chatHistory = [];
    messagesWrapper.innerHTML = `
        <!-- Welcome bubble -->
        <div class="chat-bubble-container agent">
            <div class="bubble-avatar-wrapper">
                <svg class="mini-avatar-svg" viewBox="0 0 24 24" width="22" height="22">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="#8224ff" stroke-width="1.5" stroke-dasharray="2 1"/>
                    <circle cx="12" cy="12" r="3.5" fill="#8224ff" stroke="#fff" stroke-width="0.5"/>
                </svg>
            </div>
            <div class="chat-bubble">
                <p>Welcome to the <strong>Operations Core Console</strong>. The multi-agent orchestrator is fully synchronized. I can remember conversation history, utilize web intelligence nodes, compile source structures, and process quantitative data.</p>
                <p>Initialize the loop by submitting a query below.</p>
            </div>
        </div>
    `;
    terminalTitle.textContent = "COGNITIVE SESSION LOGS";
    terminalLatency.textContent = "LATENCY: 0ms";
    if (systemStatus) {
        systemStatus.textContent = "SYSTEM STATE: STANDBY";
        const dot = systemStatus.parentNode.querySelector('.pulse-dot');
        if (dot) {
            dot.style.backgroundColor = '#00f2fe';
            dot.style.boxShadow = '0 0 8px #00f2fe';
        }
    }
}

// Submit Listener
if (askBtn && queryInput) {
    askBtn.addEventListener('click', executeAgentQuery);
    queryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            executeAgentQuery();
        }
    });
}

function logErrorToTerminal(errorMessage) {
    const errDiv = document.createElement('div');
    errDiv.className = 'log-message';
    errDiv.innerHTML = `⚠️ <b>System Error:</b> ${errorMessage}`;
    messagesWrapper.appendChild(errDiv);
    messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
}

// Render dynamic user bubbles immediately
function renderUserBubble(text) {
    const container = document.createElement('div');
    container.className = 'chat-bubble-container user';
    container.innerHTML = `
        <div class="bubble-avatar-wrapper">
            <svg class="mini-avatar-svg" viewBox="0 0 24 24" width="22" height="22">
                <circle cx="12" cy="12" r="9" fill="none" stroke="#00f2fe" stroke-width="1.5" stroke-dasharray="2 1"/>
                <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#00f2fe"/>
            </svg>
        </div>
        <div class="chat-bubble">
            <p>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>')}</p>
        </div>
    `;
    messagesWrapper.appendChild(container);
    messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
}

// Render dynamic agent responses with markdown parser & typing cursor
function renderAgentBubble(fullText) {
    const container = document.createElement('div');
    container.className = 'chat-bubble-container agent';
    
    const avatarWrapper = document.createElement('div');
    avatarWrapper.className = 'bubble-avatar-wrapper';
    avatarWrapper.innerHTML = `
        <svg class="mini-avatar-svg" viewBox="0 0 24 24" width="22" height="22">
            <circle cx="12" cy="12" r="9" fill="none" stroke="#8224ff" stroke-width="1.5" stroke-dasharray="2 1"/>
            <circle cx="12" cy="12" r="3.5" fill="#8224ff" stroke="#fff" stroke-width="0.5"/>
        </svg>
    `;
    
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    
    container.appendChild(avatarWrapper);
    container.appendChild(bubble);
    messagesWrapper.appendChild(container);
    
    let currentIndex = 0;
    const typingSpeed = 6; // snap typing
    const cursor = document.createElement('span');
    cursor.className = 'terminal-cursor';
    bubble.appendChild(cursor);
    
    function parseBasicMarkdown(text) {
        let html = text;
        // Escape HTML
        html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        // Format bold **text**
        html = html.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
        // Format single line code blocks `code`
        html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
        // Format multi-line code blocks
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
        // Format breaks
        html = html.replace(/\n/g, '<br>');
        return html;
    }
    
    function typeNextChar() {
        if (currentIndex < fullText.length) {
            const chunkSize = Math.min(4, fullText.length - currentIndex);
            currentIndex += chunkSize;
            
            const currentSubStr = fullText.substring(0, currentIndex);
            bubble.innerHTML = parseBasicMarkdown(currentSubStr);
            bubble.appendChild(cursor);
            
            messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
            setTimeout(typeNextChar, typingSpeed);
        } else {
            cursor.remove();
            messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
        }
    }
    
    typeNextChar();
}

async function executeAgentQuery() {
    const userQuery = queryInput.value.trim();
    if (!userQuery) return;
    
    // 1. Add User query to history and render user chat bubble
    chatHistory.push(userQuery);
    renderUserBubble(userQuery);
    
    // Clear input field
    queryInput.value = '';
    
    // 2. Set loading states & animate avatar
    terminalSection.classList.add('loading');
    if (avatarElement) avatarElement.classList.add('active');
    
    terminalTitle.textContent = "COGNITIVE SESSION LOGS: PROCESS INVOLVED";
    terminalLatency.textContent = "LATENCY: Calculating...";
    if (systemStatus) {
        systemStatus.textContent = "SYSTEM STATE: ACTIVE LOOP";
        const dot = systemStatus.parentNode.querySelector('.pulse-dot');
        if (dot) {
            dot.style.backgroundColor = '#ffbd2e';
            dot.style.boxShadow = '0 0 8px #ffbd2e';
        }
    }
    
    askBtn.disabled = true;
    askBtn.style.opacity = '0.5';
    
    const startTime = performance.now();
    
    const payload = {
        model_name: modelSelector.value,
        system_prompt: systemPromptInput.value,
        messages: chatHistory, // Send full multi-turn conversation context
        allow_search: searchToggle.checked
    };

    try {
        const chatUrl = (window.location.protocol === 'file:' || window.location.hostname === '') ? 'http://127.0.0.1:9999/chat' : '/chat';
        const response = await fetch(chatUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            const elapsed = performance.now() - startTime;
            const latencySec = (elapsed / 1000).toFixed(2);
            
            terminalLatency.textContent = `LATENCY: ${latencySec}s`;
            terminalTitle.textContent = "AGENT SESSION ACTIVE";
            if (systemStatus) {
                systemStatus.textContent = "AGENT CORE STANDBY";
                const dot = systemStatus.parentNode.querySelector('.pulse-dot');
                if (dot) {
                    dot.style.backgroundColor = '#27c93f';
                    dot.style.boxShadow = '0 0 8px #27c93f';
                }
            }
            
            // 3. Add AI response to history and render agent bubble
            const aiResponseText = data.response || "Transmission error: Null response.";
            chatHistory.push(aiResponseText);
            renderAgentBubble(aiResponseText);
            
        } else {
            const errData = await response.json().catch(() => ({detail: "Cognitive server logic error."}));
            throw new Error(errData.detail || "HTTP error state " + response.status);
        }
    } catch (error) {
        terminalTitle.textContent = "AGENT SESSION: CRITICAL ERROR";
        terminalLatency.textContent = "LATENCY: ERROR";
        if (systemStatus) {
            systemStatus.textContent = "SYSTEM FAULT DETECTED";
            const dot = systemStatus.parentNode.querySelector('.pulse-dot');
            if (dot) {
                dot.style.backgroundColor = '#ff5f56';
                dot.style.boxShadow = '0 0 8px #ff5f56';
            }
        }
        
        logErrorToTerminal(error.message);
        
        // Remove user's last unmatched query so they can re-try
        chatHistory.pop();
    } finally {
        terminalSection.classList.remove('loading');
        if (avatarElement) avatarElement.classList.remove('active');
        askBtn.disabled = false;
        askBtn.style.opacity = '1';
    }
}

// --- Theme Toggle Logic ---
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    // Re-initialize particles with the correct theme colors immediately
    particles.forEach(p => p.reset());
}

// Load Theme preference on startup
(function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
})();
