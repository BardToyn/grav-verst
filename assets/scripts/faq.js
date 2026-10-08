// Секция «Вопросы и ответы»: в аккордеоне открыт только один пункт.

document.addEventListener('DOMContentLoaded', function () {

    const items = Array.from(document.querySelectorAll('.accordion-item'));
    if (!items.length) return;

    items.forEach(item => {
        item.addEventListener('toggle', () => {
            if (!item.open) return;

            items.forEach(other => {
                if (other !== item) other.open = false;
            });
        });
    });

});
