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

    // Update bubble text
    const textEl = this.bubbleEl.querySelector('.mascot-text');
    if (textEl) {
      textEl.textContent = text;
    }

    // Show
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
  }

  _hide() {
    this.mascotEl.classList.remove('mascot--visible');
    this.bubbleEl.style.display = 'none';
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
