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
