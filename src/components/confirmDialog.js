import { qs } from '../utils/dom.js';

/**
 * Show a confirmation modal.
 * @param {string}   message    — main message
 * @param {string}   subMessage — optional subtitle
 * @param {function} onConfirm  — async callback
 */
export function openConfirmDialog(message, subMessage = '', onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  overlay.innerHTML = /*html*/`
    <div class="modal" style="max-width:420px">
      <div class="modal-header">
        <h2 class="modal-title">Confirm Action</h2>
        <button class="modal-close" id="confirm-close">✕</button>
      </div>
      <div class="modal-body">
        <p class="confirm-text">${message}</p>
        ${subMessage ? `<p class="confirm-sub">${subMessage}</p>` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" id="confirm-cancel">Cancel</button>
        <button class="btn btn-danger" id="confirm-ok">Delete</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  qs('#confirm-close', overlay).addEventListener('click', close);
  qs('#confirm-cancel', overlay).addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  qs('#confirm-ok', overlay).addEventListener('click', async () => {
    const btn = qs('#confirm-ok', overlay);
    btn.disabled = true;
    btn.textContent = 'Deleting...';
    try {
      await onConfirm();
      close();
    } catch {
      btn.disabled = false;
      btn.textContent = 'Delete';
    }
  });
}