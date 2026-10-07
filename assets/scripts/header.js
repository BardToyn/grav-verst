// 1) Фиксация шапки

const header = document.querySelector('.header');
let lastY = 0;

window.addEventListener('scroll', () => {

    const y = window.scrollY;

    if (y > 500 && y > lastY) {
        header.classList.add('is-hidden');
    } else {
        header.classList.remove('is-hidden');
    }

    lastY = y;

}, { passive: true });