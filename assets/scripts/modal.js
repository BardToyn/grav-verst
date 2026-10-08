// Модальное окно заявки.
// Открывается любой кнопкой с атрибутом data-request="Заголовок".
// Дополнительно: data-request-label — подпись поля комментария, data-request-text — текст, подставляемый в комментарий.

window.Gravis = window.Gravis || {};

(function () {

    let openModalEl = null;
    let lastFocus = null;

    function openModal(el) {
        if (!el) return;

        lastFocus = document.activeElement;
        el.hidden = false;
        openModalEl = el;
        document.body.classList.add('is-locked');

        setTimeout(() => {
            const first = el.querySelector('input, textarea, button:not(.modal__close)');
            if (first) first.focus();
        }, 60);
    }

    function closeModal() {
        if (!openModalEl) return;

        openModalEl.hidden = true;
        openModalEl = null;
        document.body.classList.remove('is-locked');

        if (lastFocus && lastFocus.focus) {
            lastFocus.focus({ preventScroll: true });
        }
    }

    function openRequest(title, commentLabel, commentText) {
        const modal = document.getElementById('requestModal');
        if (!modal) return;

        const titleEl = modal.querySelector('[data-request-title]');
        const labelEl = modal.querySelector('[data-request-comment-label]');
        const comment = modal.querySelector('[name="comment"]');

        if (titleEl) titleEl.textContent = title || 'Заказать консультацию';
        if (labelEl) labelEl.textContent = commentLabel || 'Комментарий';
        if (comment) comment.value = commentText || '';

        openModal(modal);
    }

    window.Gravis.openModal = openModal;
    window.Gravis.closeModal = closeModal;
    window.Gravis.openRequest = openRequest;

    document.addEventListener('DOMContentLoaded', function () {

        // Кнопки, открывающие заявку
        document.querySelectorAll('[data-request]').forEach(btn => {
            btn.addEventListener('click', () => {
                openRequest(btn.dataset.request, btn.dataset.requestLabel, btn.dataset.requestText);
            });
        });

        // Закрытие: крестик, оверлей, Escape
        document.querySelectorAll('[data-modal-close]').forEach(btn => {
            btn.addEventListener('click', closeModal);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && openModalEl) closeModal();
        });

        // Закрываем модалку после успешной отправки формы внутри неё
        document.addEventListener('gravis:formSuccess', function (e) {
            if (e.target.closest && e.target.closest('.modal')) closeModal();
        });

    });

})();
