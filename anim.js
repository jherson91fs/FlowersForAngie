// ==========================================
// ANIM.JS INTEGRADO CON SISTEMA INTERACTIVO
// ==========================================

class EnhancedFlowerLyricsPlayer {
  constructor() {
    this.audio = null;
    this.lyrics = null;
    this.currentLineIndex = -1;
    this.animationId = null;
    
    // Datos de letras corregidos
    this.lyricsData = [
      { text: "At the time", time: 15 },
      { text: "The whisper of birds", time: 18 },
      { text: "Lonely before the sun cried", time: 27 },
      { text: "Fell from the sky", time: 32 },
      { text: "Like water drops", time: 33 },
      { text: "Where I'm now? I don't know why", time: 41 },
      { text: "Nice butterflies in my hands", time: 47 },
      { text: "Too much light for twilight", time: 54 },
      { text: "In the mood for the flowers love", time: 59 },
      { text: "That vision", time: 67 },
      { text: "Really strong, blew my mind", time: 72 },
      { text: "Silence Let me see what it was", time: 78 },
      { text: "I only want to live in clouds", time: 83 },
      { text: "Where I'm now? I don't know why", time: 91 },
      { text: "Nice butterflies in my hands", time: 97 },
      { text: "Too much light for twilight", time: 104 },
      { text: "In the mood for the flowers love", time: 108 },
      { text: "Love.", time: 140 },
      { text: "At the time", time: 144 },
      { text: "The whisper of birds", time: 148 },
      { text: "Lonely before the sun cried", time: 153 },
      { text: "Fell from the sky", time: 158 },
      { text: "Like water drops", time: 164 },
      { text: "Where I'm now? I don't know why", time: 169 },
      { text: "Nice butterflies in my hands", time: 176 },
      { text: "Too much light for twilight", time: 183 },
      { text: "In the mood for the flowers", time: 188 }
    ];
    
    this.init();
  }

  init() {
    try {
      this.audio = document.querySelector("audio");
      this.lyrics = document.querySelector("#lyrics");
      
      if (!this.audio) {
        console.warn("Elemento audio no encontrado");
        return;
      }
      
      if (!this.lyrics) {
        console.warn("Elemento lyrics no encontrado");
        return;
      }

      this.setupEventListeners();
      this.createControls();
      this.startLyricsSync();
      this.setupTitleHide();
      
    } catch (error) {
      console.error("Error inicializando EnhancedFlowerLyricsPlayer:", error);
    }
  }

  setupEventListeners() {
    // Eventos de audio con integración háptica
    this.audio.addEventListener('play', () => {
      this.startLyricsSync();
      this.triggerHaptic([100, 50, 100]);
      
      // Notificar al sistema interactivo
      if (window.interactiveGarden) {
        window.interactiveGarden.isPlaying = true;
      }
    });
    
    this.audio.addEventListener('pause', () => {
      this.stopLyricsSync();
      
      if (window.interactiveGarden) {
        window.interactiveGarden.isPlaying = false;
      }
    });
    
    this.audio.addEventListener('ended', () => {
      this.resetLyrics();
      this.triggerHaptic([200, 100, 200]);
    });
    
    // Manejo de errores
    this.audio.addEventListener('error', (e) => {
      console.error("Error cargando audio:", e);
      this.showMessage("Error cargando la música 🎵");
    });

    // Eventos específicos para letras con vibración
    this.audio.addEventListener('timeupdate', () => {
      const currentTime = this.audio.currentTime;
      
      // Vibrar en momentos específicos de la canción
      if (this.shouldVibrateAtTime(currentTime)) {
        this.triggerHaptic([50]);
      }
    });
  }

  shouldVibrateAtTime(time) {
    // Vibrar al inicio de cada verso
    const vibratePoints = [15, 27, 41, 59, 67, 83, 108, 144, 153, 169, 188];
    return vibratePoints.some(point => Math.abs(time - point) < 0.5);
  }

  createControls() {
    // Crear controles mejorados con diseño táctil
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'audio-controls';
    controlsDiv.innerHTML = `
      <button id="playPauseBtn" class="control-btn" aria-label="Reproducir/Pausar">⏸️</button>
      <button id="muteBtn" class="control-btn" aria-label="Silenciar">🔊</button>
      <input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="0.7" aria-label="Volumen">
      <button id="hapticToggle" class="control-btn" aria-label="Toggle Háptico">📳</button>
    `;
    
    // Estilos optimizados para móvil
    controlsDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      gap: 12px;
      align-items: center;
      background: rgba(0,0,0,0.8);
      padding: 15px;
      border-radius: 25px;
      backdrop-filter: blur(15px);
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      
      /* Mejorar táctil */
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    `;
    
    document.body.appendChild(controlsDiv);
    
    // Event listeners con feedback háptico
    const playPauseBtn = document.getElementById('playPauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const hapticToggle = document.getElementById('hapticToggle');
    
    playPauseBtn.addEventListener('click', () => {
      this.togglePlay();
      this.triggerHaptic([80]);
    });
    
    muteBtn.addEventListener('click', () => {
      this.toggleMute();
      this.triggerHaptic([60]);
    });
    
    volumeSlider.addEventListener('input', (e) => {
      this.setVolume(e.target.value);
      this.triggerHaptic([30]);
    });
    
    hapticToggle.addEventListener('click', () => {
      this.toggleHaptic();
      this.triggerHaptic([100, 50, 100]);
    });
    
    // Establecer volumen inicial
    this.audio.volume = 0.7;
    this.hapticEnabled = true;
  }

  togglePlay() {
    const btn = document.getElementById('playPauseBtn');
    if (this.audio.paused) {
      // Manejar autoplay en móviles
      const playPromise = this.audio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          btn.textContent = '⏸️';
        }).catch(error => {
          console.log("Autoplay bloqueado:", error);
          this.showPlayButton();
        });
      }
    } else {
      this.audio.pause();
      btn.textContent = '▶️';
    }
  }

  toggleMute() {
    const btn = document.getElementById('muteBtn');
    if (this.audio.muted) {
      this.audio.muted = false;
      btn.textContent = '🔊';
    } else {
      this.audio.muted = true;
      btn.textContent = '🔇';
    }
  }

  setVolume(value) {
    this.audio.volume = value;
  }

  toggleHaptic() {
    this.hapticEnabled = !this.hapticEnabled;
    const btn = document.getElementById('hapticToggle');
    
    if (this.hapticEnabled) {
      btn.textContent = '📳';
      btn.style.opacity = '1';
    } else {
      btn.textContent = '📴';
      btn.style.opacity = '0.6';
    }
  }

  showPlayButton() {
    // Mostrar botón de inicio cuando autoplay está bloqueado
    const playBtn = document.createElement('button');
    playBtn.innerHTML = '🎵 Tocar para iniciar música';
    playBtn.className = 'start-music-btn';
    playBtn.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1001;
      padding: 20px 40px;
      font-size: 1.2rem;
      background: linear-gradient(45deg, #ff6b6b, #feca57);
      border: none;
      border-radius: 50px;
      color: white;
      cursor: pointer;
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
      font-family: inherit;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      min-height: 60px;
      min-width: 200px;
    `;
    
    playBtn.addEventListener('click', () => {
      this.audio.play();
      playBtn.remove();
      this.triggerHaptic([150, 100, 150]);
    });
    
    playBtn.addEventListener('touchstart', () => {
      playBtn.style.transform = 'translate(-50%, -50%) scale(0.95)';
    });
    
    playBtn.addEventListener('touchend', () => {
      playBtn.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    
    document.body.appendChild(playBtn);
  }

  startLyricsSync() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.updateLyrics();
  }

  stopLyricsSync() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  updateLyrics() {
    const currentTime = this.audio.currentTime;
    
    // Buscar línea actual
    let currentLine = null;
    let lineIndex = -1;
    
    for (let i = 0; i < this.lyricsData.length; i++) {
      const line = this.lyricsData[i];
      const nextLine = this.lyricsData[i + 1];
      const lineEndTime = nextLine ? nextLine.time : line.time + 6;
      
      if (currentTime >= line.time && currentTime < lineEndTime) {
        currentLine = line;
        lineIndex = i;
        break;
      }
    }

    // Solo actualizar si hay cambios
    if (lineIndex !== this.currentLineIndex) {
      this.currentLineIndex = lineIndex;
      
      if (currentLine) {
        this.showLyric(currentLine.text);
        // Vibrar al cambiar letra
        this.triggerHaptic([40]);
      } else {
        this.hideLyric();
      }
    }

    // Continuar sincronización
    if (!this.audio.paused) {
      this.animationId = requestAnimationFrame(() => this.updateLyrics());
    }
  }

  showLyric(text) {
    if (this.lyrics) {
      this.lyrics.style.opacity = '0';
      this.lyrics.innerHTML = text;
      
      // Animación mejorada para móvil
      setTimeout(() => {
        this.lyrics.style.transition = 'all 0.5s ease-in-out';
        this.lyrics.style.opacity = '1';
        this.lyrics.style.transform = 'translateX(-50%) scale(1.05)';
        
        setTimeout(() => {
          this.lyrics.style.transform = 'translateX(-50%) scale(1)';
        }, 200);
      }, 50);
    }
  }

  hideLyric() {
    if (this.lyrics) {
      this.lyrics.style.opacity = '0';
      this.lyrics.style.transform = 'translateX(-50%) scale(0.95)';
      setTimeout(() => {
        this.lyrics.innerHTML = '';
        this.lyrics.style.transform = 'translateX(-50%) scale(1)';
      }, 500);
    }
  }

  resetLyrics() {
    this.currentLineIndex = -1;
    this.hideLyric();
    this.stopLyricsSync();
  }

  showMessage(message) {
    if (this.lyrics) {
      this.lyrics.innerHTML = message;
      this.lyrics.style.opacity = '1';
      this.triggerHaptic([100, 50, 100]);
    }
  }

  setupTitleHide() {
    const titulo = document.querySelector(".titulo");
    if (titulo) {
      // Ocultar título después de 216 segundos con animación mejorada
      setTimeout(() => {
        titulo.style.transition = 'all 3s cubic-bezier(0.4, 0, 0.2, 1)';
        titulo.style.opacity = '0';
        titulo.style.transform = 'translateX(-50%) translateY(-30px) scale(0.9)';
        
        // Vibrar cuando desaparece
        this.triggerHaptic([200, 100, 200, 100, 200]);
        
        setTimeout(() => {
          titulo.style.display = 'none';
        }, 3000);
      }, 216000);
    }
  }

  // Método de utilidad para vibración
  triggerHaptic(pattern) {
    if (this.hapticEnabled && 'vibrate' in navigator && Array.isArray(pattern)) {
      navigator.vibrate(pattern);
    }
  }
}

// Función heredada para ocultación de título
function ocultarTitulo() {
  var titulo = document.querySelector(".titulo");
  if (titulo) {
    titulo.style.animation = "fadeOut 3s ease-in-out forwards";
    setTimeout(function () {
      titulo.style.display = "none";
    }, 3000);
  }
}

// Mantener compatibilidad
setTimeout(ocultarTitulo, 216000);

// Inicialización mejorada
document.addEventListener('DOMContentLoaded', () => {
  window.enhancedLyricsPlayer = new EnhancedFlowerLyricsPlayer();
});

// Compatibilidad con sistemas existentes
if (typeof window !== 'undefined') {
  window.EnhancedFlowerLyricsPlayer = EnhancedFlowerLyricsPlayer;
}