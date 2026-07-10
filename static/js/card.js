/**
 * Card.js - Main game logic for player bingo card
 * Handles:
 * - Mark/unmark cells on tap
 * - Bingo & reach detection
 * - localStorage persistence
 * - Polling for admin draws
 * - Mascot integration
 */

const WINNING_LINES = [
  [0, 1, 2],    // row 0
  [3, 4, 5],    // row 1
  [6, 7, 8],    // row 2
  [0, 3, 6],    // col 0
  [1, 4, 7],    // col 1
  [2, 5, 8],    // col 2
  [0, 4, 8],    // diagonal ↘
  [2, 4, 6]     // diagonal ↙
];

class BingoCard {
  constructor(seed, cells) {
    this.seed = seed;
    this.cells = cells;
    this.storageKey = `bingo_state_${seed}`;

    // Load or init state
    const saved = this.loadState();
    if (saved) {
      this.marked = saved.marked;
      console.log('🔄 Loaded from localStorage:', this.marked);
    } else {
      // First time: all cells unmarked (center is now random)
      this.marked = new Array(9).fill(false);
      console.log('✨ New card, initialized marked:', this.marked);
    }

    this.pollingInterval = null;
    this.pollUrl = null;

    // Initialize previous state AFTER marked is set
    this.previousState = this.checkState();
    console.log('📊 Initial state:', this.previousState);

    this.init();
  }

  init() {
    this.renderCells();
    this.attachEventListeners();
    this.startPolling();
    this.startRandomEncouragement();

    // Mascot greeting on first visit
    const seen = this.loadMascotSeen();
    if (!seen.includes('page_load')) {
      window.mascot.show('page_load');
      seen.push('page_load');
      this.saveMascotSeen(seen);
    }
  }

  renderCells() {
    const grid = document.getElementById('bingo-grid');
    const cells = grid.querySelectorAll('.bingo-cell');

    cells.forEach((el, idx) => {
      if (this.marked[idx]) {
        el.classList.add('cell--marked');
      } else {
        el.classList.remove('cell--marked');
      }
    });

    // Don't show bingo lines on initial render
    // (only update when state changes after a tap)
  }

  attachEventListeners() {
    const grid = document.getElementById('bingo-grid');
    grid.addEventListener('click', (e) => {
      const cell = e.target.closest('.bingo-cell');
      if (cell) {
        this.onCellTap(cell);
      }
    });
  }

  onCellTap(cellEl) {
    const idx = parseInt(cellEl.getAttribute('data-index'));

    // Toggle cell (including center)
    const seen = this.loadMascotSeen();
    const isFirstMark = !this.marked.some((m, i) => m);

    this.marked[idx] = !this.marked[idx];
    this.saveState();

    if (this.marked[idx] && isFirstMark && !seen.includes('first_mark')) {
      window.mascot.show('first_mark');
      seen.push('first_mark');
      this.saveMascotSeen(seen);
    }

    this.updateCellUI(idx);
    this.updateBingoLines();  // Update lines after state change
    this.checkStateAndTriggers();
  }

  updateCellUI(idx) {
    const cells = document.querySelectorAll('.bingo-cell');
    const cell = cells[idx];

    if (this.marked[idx]) {
      cell.classList.add('cell--marked');
    } else {
      cell.classList.remove('cell--marked');
    }
  }

  checkState() {
    const bingoLines = [];
    const reachLines = [];

    for (const line of WINNING_LINES) {
      const count = line.filter(i => this.marked[i]).length;
      if (count === 3) {
        bingoLines.push(line);
      } else if (count === 2) {
        reachLines.push(line);
      }
    }

    return {
      bingo: bingoLines.length > 0,
      bingoLines,
      reach: reachLines.length > 0,
      reachCount: reachLines.length,
      reachLines
    };
  }

  checkStateAndTriggers() {
    const current = this.checkState();
    const seen = this.loadMascotSeen();

    // Reach transition
    if (!this.previousState.reach && current.reach && !seen.includes('reach_first')) {
      window.mascot.show('reach_first');
      seen.push('reach_first');
      this.showReachBanner();
    }

    // Double reach transition
    if (
      this.previousState.reach &&
      current.reach &&
      this.previousState.reachCount < current.reachCount &&
      !seen.includes('reach_double')
    ) {
      window.mascot.show('reach_double');
      seen.push('reach_double');
    }

    // Bingo transition
    if (!this.previousState.bingo && current.bingo && !seen.includes('bingo')) {
      window.mascot.show('bingo');
      this.showBingoOverlay();
      this.triggerConfetti();
      seen.push('bingo');
    }

    // Encouragement when 5+ marked but no reach
    const markedCount = this.marked.filter(m => m).length;
    if (markedCount >= 5 && !current.reach && !seen.includes('encouragement_5')) {
      window.mascot.show('encouragement_5');
      seen.push('encouragement_5');
    }

    this.saveMascotSeen(seen);
    this.previousState = current;
  }

  updateBingoLines() {
    const cells = document.querySelectorAll('.bingo-cell');
    const current = this.checkState();

    // Clear all line classes
    cells.forEach(c => {
      c.classList.remove('cell--bingo-line');
      c.classList.remove('cell--reach-line');
    });

    // Add for bingo lines (both elements get highlight)
    for (const line of current.bingoLines) {
      for (const idx of line) {
        cells[idx].classList.add('cell--bingo-line');
      }
    }

    // Add for reach lines only (exclusive)
    for (const line of current.reachLines) {
      for (const idx of line) {
        if (!cells[idx].classList.contains('cell--bingo-line')) {
          cells[idx].classList.add('cell--reach-line');
        }
      }
    }
  }

  showReachBanner() {
    const banner = document.getElementById('reach-banner');
    banner.hidden = false;
    setTimeout(() => {
      banner.hidden = true;
    }, 3000);
  }

  showBingoOverlay() {
    const overlay = document.getElementById('bingo-overlay');
    if (!overlay) return;
    overlay.hidden = false;
    overlay.style.display = '';
    setTimeout(() => {
      overlay.hidden = true;
      overlay.style.display = 'none !important';
    }, 8000);  // 8秒表示
  }

  triggerConfetti() {
    if (typeof confetti !== 'undefined') {
      confetti({
        particleCount: 200,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#3b82f6', '#60a5fa', '#93c5fd']
      });
    }
  }

  startPolling() {
    // Poll every 2 seconds for admin draws
    this.pollingInterval = setInterval(() => {
      this.pollGameState();
    }, 2000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  startRandomEncouragement() {
    const encouragements = [
      'その調子だよ！',
      '頑張ってるね！',
      'いけいけ！',
      'もう少しだ！',
      'ナイス！',
      'いい感じだね！',
      '応援してるよ！',
      'ファイト！',
      'やればできる！',
      '最高だ！'
    ];

    this.encouragementInterval = setInterval(() => {
      // ゲーム中だけ表示（ビンゴ前）
      if (!this.previousState.bingo) {
        const randomMsg = encouragements[Math.floor(Math.random() * encouragements.length)];
        window.mascot.show('random_encouragement', randomMsg);
      }
    }, 30000 + Math.random() * 30000); // 30～60秒のランダム間隔
  }

  async pollGameState() {
    try {
      const response = await fetch('/api/state');
      const state = await response.json();

      if (!state.drawn || !Array.isArray(state.drawn)) return;

      const drawn = state.drawn;

      // Check if any drawn name is on this card
      for (const cellData of this.cells) {
        if (drawn.includes(cellData.name)) {
          const cells = document.querySelectorAll('.bingo-cell');
          const cell = cells[cellData.index];

          // Add called effect
          if (!cell.classList.contains('cell--called')) {
            cell.classList.add('cell--called');

            // Mascot comment disabled - no need to announce called names
            // const seen = this.loadMascotSeen();
            // const triggerKey = `name_on_card_${cellData.name}`;
            // if (!seen.includes(triggerKey)) {
            //   window.mascot.show('name_on_card', `${cellData.name}さんが呼ばれたよ！チャンス！`);
            //   seen.push(triggerKey);
            //   this.saveMascotSeen(seen);
            // }
          }
        }
      }
    } catch (e) {
      console.error('Poll error:', e);
    }
  }

  saveState() {
    const data = {
      seed: this.seed,
      marked: this.marked,
      mascot_seen: this.loadMascotSeen()
    };
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  loadState() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  saveMascotSeen(arr) {
    const data = this.loadState() || {};
    data.mascot_seen = arr;
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  loadMascotSeen() {
    const data = this.loadState();
    return data?.mascot_seen || [];
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  const seed = window.CARD_SEED;

  // Get player name from localStorage
  const playerName = localStorage.getItem('bingo_player_name') || 'プレイヤー';

  // Display player name in title
  const titleEl = document.getElementById('player-name-title');
  if (titleEl) {
    titleEl.textContent = `${playerName}さんのBingoカード`;
  }

  // Special card for Iwamasu - guaranteed bingo on 8th draw (Morimoto)
  if (['岩松', 'いわまつ', 'イワマツ'].includes(playerName)) {
    const cells = document.querySelectorAll('.bingo-cell');

    // Layout: diagonal to guarantee bingo only on 8th turn (Morimoto)
    // Diagonal [0, 4, 8]: 松尾, 保田, 森本
    // Other cells: 標, 坂本, 藤田, 黒須, 寺山, ランダム
    const allNames = JSON.parse(document.querySelector('script[data-names]')?.dataset.names || '[]');
    const otherNames = allNames.filter(n => !['松尾', '標', '坂本', '保田', '藤田', '黒須', '寺山', '森本'].includes(n));
    const randomName = otherNames[Math.floor(Math.random() * otherNames.length)] || 'その他';

    const cardLayout = {
      0: '松尾',
      1: '標',
      2: randomName,
      3: '坂本',
      4: '保田',
      5: '藤田',
      6: '黒須',
      7: '寺山',
      8: '森本'
    };

    cells.forEach((cell, idx) => {
      cell.textContent = cardLayout[idx] + 'さん';
    });
  }

  // Fetch cell data
  const response = await fetch('/api/names');
  const namesData = await response.json();

  // Generate cells (server already did, but we need them client-side)
  // Actually, cells are already in the HTML from Jinja2
  const cells = Array.from(document.querySelectorAll('.bingo-cell')).map((el, idx) => ({
    index: idx,
    name: el.textContent.trim(),
    is_center: el.getAttribute('data-center') === 'true',
    row: parseInt(el.getAttribute('data-row')),
    col: parseInt(el.getAttribute('data-col'))
  }));

  // Initialize mascot
  window.mascot = new MascotController(
    document.getElementById('mascot'),
    document.getElementById('mascot-bubble'),
    namesData
  );

  // Initialize card
  window.card = new BingoCard(seed, cells);
});
