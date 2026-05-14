(() => {
  const ENDING_HINT = '您已收集结局';
  const ROOT_ID = 'wg-back-menu';
  const BTN_ID = 'wg-back-menu-btn';

  function ensureDom() {
    let root = document.getElementById(ROOT_ID);
    if (root) return root;

    root = document.createElement('div');
    root.id = ROOT_ID;

    const btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.type = 'button';
    btn.textContent = '返回主菜单';
    btn.addEventListener('click', () => {
      try {
        window.location.reload();
      } catch {
        window.location.href = window.location.href.split('#')[0];
      }
    });

    root.appendChild(btn);
    document.body.appendChild(root);
    return root;
  }

  function getLatestVisibleDialogueText() {
    const nodes = document.querySelectorAll(
      '.TextBox_textElement_start, .TextBox_textElement_Settled',
    );
    for (let i = nodes.length - 1; i >= 0; i--) {
      const el = nodes[i];
      if (!el) continue;
      const t = (el.textContent || '').trim();
      if (t) return t;
    }
    return '';
  }

  function update() {
    const root = ensureDom();
    const latest = getLatestVisibleDialogueText();
    root.classList.toggle('wg-show', latest.includes(ENDING_HINT));
  }

  function start() {
    ensureDom();
    update();

    const mo = new MutationObserver(() => update());
    mo.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener('hashchange', update);
    window.addEventListener('visibilitychange', update);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
(() => {
  const originalPlay = HTMLMediaElement.prototype.play;
  const originalPause = HTMLMediaElement.prototype.pause;
  const lastPlayAt = new WeakMap();

  HTMLMediaElement.prototype.play = function (...args) {
    try {
      lastPlayAt.set(this, Date.now());
    } catch {}
    return originalPlay.apply(this, args);
  };

  HTMLMediaElement.prototype.pause = function (...args) {
    const src = (this.currentSrc || this.src || "").toString();
    if (src.includes("/game/vocal/")) {
      const t = lastPlayAt.get(this) || 0;
      const dt = Date.now() - t;
      if (dt >= 0 && dt < 800 && (this.currentTime || 0) === 0) {
        return;
      }
    }
    return originalPause.apply(this, args);
  };

  document.addEventListener(
    "click",
    () => {
      document.querySelectorAll("audio").forEach((a) => {
        const src = (a.currentSrc || a.src || "").toString();
        if (src.includes("/game/vocal/")) {
          a.muted = false;
          if (!a.volume || a.volume <= 0) a.volume = 1;
        }
      });
    },
    { capture: true, once: true }
  );
})();
