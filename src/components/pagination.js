export function renderPagination(container, total, page, perPage, onPageChange) {
  const totalPages = Math.ceil(total / perPage);

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push(
      `<button class="page-btn ${i === page ? 'active' : ''}" data-page="${i}" 
        ${i === page ? 'disabled' : ''}>${i}</button>`
    );
  }

  container.innerHTML = /*html*/`
    <div class="pagination">
      <button class="page-btn" id="pag-prev" ${page === 1 ? 'disabled' : ''}>‹</button>
      ${pages.join('')}
      <button class="page-btn" id="pag-next" ${page === totalPages ? 'disabled' : ''}>›</button>
    </div>
  `;

  container.querySelectorAll('.page-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => onPageChange(Number(btn.dataset.page)));
  });

  container.querySelector('#pag-prev')?.addEventListener('click', () => {
    if (page > 1) onPageChange(page - 1);
  });
  container.querySelector('#pag-next')?.addEventListener('click', () => {
    if (page < totalPages) onPageChange(page + 1);
  });
}