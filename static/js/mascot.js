/**
 * Mascot.js - 妖精森本 character controller
 * Manages speech bubble animations and dialogue triggers
 */

class MascotController {
  constructor(mascotEl, bubbleEl, config) {
    this.mascotEl = mascotEl;
    this.bubbleEl = bubbleEl;
    this.config = config;

    this.queue = [];
    this.busy = false;
    this.idleTimer = null;
    this.movementInterval = null;
    this.currentPosition = 'bottom-right'; // Initial position
    this.isMovementActive = true; // Can move unless showing message

    // Position definitions
    this.positions = {
      'bottom-right': { bottom: '16px', right: '16px', left: 'auto' },
      'top-left': { bottom: 'auto', right: 'auto', left: '16px', top: '16px' },
      'top-right': { bottom: 'auto', right: '16px', left: 'auto', top: '16px' },
      'bottom-left': { bottom: '16px', right: 'auto', left: '16px', top: 'auto' }
    };

    this.MESSAGES = {
      page_load: 'やあ！森本だよ！\n一緒にビンゴを楽しもうね！🎉',
      center_tap: config?.center_message || 'ここから始めようね！',
      first_mark: 'よーし！いいスタートだ！\nその調子で頑張ろう！💪',
      reach_first: 'おお！リーチだ！\nあと1つだよ！あと1つ！！🚀',
      reach_double: 'わわわ！ダブルリーチ！\nすごいすごい！チャンスだ！⭐',
      bingo: '前の幹事団に大きく主張してね！！\nおめでとう！🎉\n森本の出世をお待ちしております',
      name_on_card: '[name]さんが呼ばれたよ！\nチャンス！チャンス！',
      idle_3min: 'おーい！寝ちゃダメだ！\n頑張れ！応援してるぞ！📢',
      encouragement_5: 'いいね！あと少しだよ！\nもうすぐリーチになっちゃうぞ！👀'
    };

    this.setupStyles();
    this.initIdleTimer();
  }

  setupStyles() {
    // Add mascot CSS if not already there
    if (!document.getElementById('mascot-styles')) {
      const style = document.createElement('style');
      style.id = 'mascot-styles';
      style.textContent = `
        #mascot {
          position: fixed;
          bottom: 16px;
          right: 16px;
          transform: translateY(180px);
          transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
                      bottom 0.6s ease-in-out,
                      right 0.6s ease-in-out,
                      left 0.6s ease-in-out,
                      top 0.6s ease-in-out;
          z-index: 300;
        }

        #mascot.mascot--visible {
          transform: translateY(0);
        }

        #mascot svg {
          filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3));
        }

        #mascot-bubble {
          position: absolute;
          bottom: 85px;
          right: 0;
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.95), rgba(59, 130, 246, 0.9));
          border: 2px solid rgba(96, 165, 250, 1);
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          max-width: 160px;
          text-align: center;
          white-space: normal;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
          animation: bubbleIn 0.3s ease-out;
        }

        #mascot-bubble::after {
          content: '';
          position: absolute;
          bottom: -8px;
          right: 20px;
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 0 solid transparent;
          border-top: 10px solid rgba(59, 130, 246, 0.9);
        }

        .mascot-text {
          word-break: break-word;
          line-height: 1.4;
        }

        @keyframes bubbleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Start movement
    this.startMovement();
  }

  startMovement() {
    const positionKeys = Object.keys(this.positions);

    this.movementInterval = setInterval(() => {
      if (!this.isMovementActive) return; // Don't move if message is showing

      // Pick random position (not current)
      let nextPos = this.currentPosition;
      while (nextPos === this.currentPosition) {
        nextPos = positionKeys[Math.floor(Math.random() * positionKeys.length)];
      }

      this.currentPosition = nextPos;
      const pos = this.positions[nextPos];

      // Apply position
      Object.keys(pos).forEach(key => {
        this.mascotEl.style[key] = pos[key];
      });
    }, 10000 + Math.random() * 10000); // 10～20秒のランダム間隔
  }

  stopMovement() {
    this.isMovementActive = false;
  }

  resumeMovement() {
    this.isMovementActive = true;
  }

  show(triggerId, overrideText = null) {
    let text = overrideText || this.MESSAGES[triggerId];
    if (!text) return;

    this.queue.push({text, triggerId});
    if (!this.busy) {
      this._flush();
    }
    this._resetIdleTimer();
  }

  _flush() {
    if (this.queue.length === 0) {
      this._hide();
      return;
    }

    this.busy = true;
    const {text, triggerId} = this.queue.shift();

    // Stop movement during message
    this.stopMovement();

    // Set expression and animation based on trigger
    this._applyExpressionAndAnimation(triggerId);

    // Move to bottom-right before showing message (for readability)
    const pos = this.positions['bottom-right'];
    Object.keys(pos).forEach(key => {
      this.mascotEl.style[key] = pos[key];
    });
    this.currentPosition = 'bottom-right';

    // Update bubble text
    const textEl = this.bubbleEl.querySelector('.mascot-text');
    if (textEl) {
      textEl.textContent = text;
    }

    // Wait for position transition to complete (0.6s) before showing
    setTimeout(() => {
      // Show bubble and mascot
      this.bubbleEl.style.display = 'block';
      this.mascotEl.classList.add('mascot--visible');

      // Determine display time based on trigger
      const displayTime = triggerId === 'bingo' ? 8000 : 3500; // Bingo: 8s, others: 3.5s

      // Hide after duration
      setTimeout(() => {
        this.busy = false;
        this.mascotEl.classList.remove('mascot--visible');
        this.bubbleEl.style.display = 'none';

        // Resume movement
        this.resumeMovement();

        // Next message after gap
        setTimeout(() => {
          this._flush();
        }, 300);
      }, displayTime);
    }, 600); // Wait for position transition
  }

  _hide() {
    this.mascotEl.classList.remove('mascot--visible');
    this.bubbleEl.style.display = 'none';
    // Reset to normal expression when hiding
    this.setExpression('normal');
  }

  _applyExpressionAndAnimation(triggerId) {
    // メッセージ表示時は妖精を右下に固定
    this.stopMovement();
    const pos = this.positions['bottom-right'];
    Object.keys(pos).forEach(key => {
      this.mascotEl.style[key] = pos[key];
    });
    this.currentPosition = 'bottom-right';

    switch(triggerId) {
      case 'first_mark':
      case 'reach_first':
      case 'reach_double':
        this.setExpression('happy');
        this.setAnimation('jump');
        break;
      case 'bingo':
        this.setExpression('bingo');
        this.setAnimation('jump');
        break;
      case 'random_encouragement':
        this.setExpression('wink');
        this.setAnimation('flutter');
        break;
      default:
        this.setExpression('normal');
    }
  }

  setExpression(type) {
    const svg = this.mascotEl.querySelector('svg');
    if (!svg) return;

    const leftEye = svg.getElementById('mascot-left-eye');
    const rightEye = svg.getElementById('mascot-right-eye');
    const mouth = svg.getElementById('mascot-mouth');
    const gradientStops = svg.querySelectorAll('#fairy-grad stop');

    switch(type) {
      case 'normal':
        // 口：笑顔、グラデーション：青系
        if (mouth) mouth.setAttribute('d', 'M 44 38 Q 50 41 56 38');
        if (gradientStops.length >= 2) {
          gradientStops[0].setAttribute('style', 'stop-color:#60a5fa;stop-opacity:1');
          gradientStops[1].setAttribute('style', 'stop-color:#3b82f6;stop-opacity:1');
        }
        break;

      case 'happy':
        // 口：大きな笑顔
        if (mouth) mouth.setAttribute('d', 'M 42 38 Q 50 43 58 38');
        if (gradientStops.length >= 2) {
          gradientStops[0].setAttribute('style', 'stop-color:#60a5fa;stop-opacity:1');
          gradientStops[1].setAttribute('style', 'stop-color:#3b82f6;stop-opacity:1');
        }
        break;

      case 'surprised':
        // 口：O字
        if (mouth) {
          mouth.setAttribute('d', '');
          mouth.setAttribute('cx', '50');
          mouth.setAttribute('cy', '40');
          mouth.setAttribute('r', '3');
          mouth.setAttribute('stroke', 'none');
          mouth.setAttribute('fill', '#0f172a');
        }
        if (gradientStops.length >= 2) {
          gradientStops[0].setAttribute('style', 'stop-color:#60a5fa;stop-opacity:1');
          gradientStops[1].setAttribute('style', 'stop-color:#3b82f6;stop-opacity:1');
        }
        break;

      case 'wink':
        // 口：軽い笑顔
        if (mouth) mouth.setAttribute('d', 'M 44 39 Q 50 42 56 39');
        if (gradientStops.length >= 2) {
          gradientStops[0].setAttribute('style', 'stop-color:#60a5fa;stop-opacity:1');
          gradientStops[1].setAttribute('style', 'stop-color:#3b82f6;stop-opacity:1');
        }
        break;

      case 'bingo':
        // 口：大きな笑顔、グラデーション：金色
        if (mouth) mouth.setAttribute('d', 'M 42 38 Q 50 43 58 38');
        if (gradientStops.length >= 2) {
          gradientStops[0].setAttribute('style', 'stop-color:#fbbf24;stop-opacity:1');
          gradientStops[1].setAttribute('style', 'stop-color:#f59e0b;stop-opacity:1');
        }
        break;
    }
  }

  setAnimation(type) {
    const svg = this.mascotEl.querySelector('svg');
    if (!svg) return;

    switch(type) {
      case 'jump':
        svg.style.animation = 'jump 0.8s ease-in-out';
        break;
      case 'spin':
        svg.style.animation = 'spin 1.2s linear';
        break;
      case 'flutter':
        // flutter はSVG全体ではなく羽に適用するため、mascotEl自体にアニメーション
        const wings = svg.querySelectorAll('ellipse');
        if (wings.length >= 2) {
          wings[0].style.animation = 'flutter 0.6s ease-in-out infinite';
          wings[1].style.animation = 'flutter 0.6s ease-in-out infinite';
        }
        break;
      default:
        svg.style.animation = 'fairyBounce 0.6s ease-in-out infinite';
    }
  }

  _adjustBubblePosition() {
    // メッセージ表示時は常に右下に妖精がいるため、バブルは右側に表示
    // ただしレスポンシブで左側に表示する必要があるかもしれないので調整可能に
    const isMobile = window.innerWidth < 600;

    if (isMobile) {
      // モバイルでは上に配置
      this.bubbleEl.style.top = '-80px';
      this.bubbleEl.style.bottom = 'auto';
      this.bubbleEl.style.right = '-20px';
      this.bubbleEl.style.left = 'auto';
    } else {
      // デスクトップでは右上に配置
      this.bubbleEl.style.bottom = '100px';
      this.bubbleEl.style.top = 'auto';
      this.bubbleEl.style.right = '-20px';
      this.bubbleEl.style.left = 'auto';
    }
  }

  initIdleTimer() {
    this._resetIdleTimer();
  }

  _resetIdleTimer() {
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      this.show('idle_3min');
      this._resetIdleTimer(); // Reset again for next idle
    }, 180000); // 3 minutes
  }
}
