let activeModal = null;

export function openModal(content, options = {}) {
  closeModal();
  const { closable = true, size = 'sm' } = options;

  const el = document.createElement('div');
  el.className = 'modal-overlay';
  el.id = 'modal-overlay';
  el.innerHTML = `
    <div class="modal-box modal-${size} anim-scale">
      ${closable ? '<button class="modal-close" id="modal-close">✕</button>' : ''}
      <div class="modal-body">${content}</div>
    </div>
  `;
  document.body.appendChild(el);
  activeModal = el;

  if (closable) {
    el.addEventListener('click', e => { if (e.target === el) closeModal(); });
    document.getElementById('modal-close')?.addEventListener('click', closeModal);
  }
  document.body.style.overflow = 'hidden';

  /* Inject styles once */
  if (!document.getElementById('modal-styles')) {
    const s = document.createElement('style');
    s.id = 'modal-styles';
    s.textContent = `
      .modal-overlay {
        position: fixed; inset: 0; z-index: 200;
        display: flex; align-items: center; justify-content: center;
        padding: var(--sp-4);
        background: rgba(42,27,23,0.5);
        backdrop-filter: blur(4px);
        animation: fadeIn var(--dur-fast) var(--ease);
      }
      .modal-box {
        position: relative;
        background: var(--c-white);
        border-radius: var(--r-xl);
        box-shadow: var(--shadow-xl);
        max-height: 85dvh;
        overflow-y: auto;
      }
      .modal-sm { width: 100%; max-width: 380px; padding: var(--sp-6); }
      .modal-md { width: 100%; max-width: 520px; padding: var(--sp-6); }
      .modal-lg { width: 100%; max-width: 680px; padding: var(--sp-6); }
      .modal-close {
        position: absolute; top: var(--sp-3); right: var(--sp-3);
        width: 32px; height: 32px;
        border-radius: var(--r-full);
        display: flex; align-items: center; justify-content: center;
        color: var(--c-text-muted);
        transition: background var(--dur-fast) var(--ease);
      }
      .modal-close:hover { background: var(--c-bg); }
    `;
    document.head.appendChild(s);
  }
}

export function closeModal() {
  if (activeModal) {
    activeModal.remove();
    activeModal = null;
    document.body.style.overflow = '';
  }
}
