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

// 2) Мобильное меню

document.addEventListener('DOMContentLoaded', function() {
    // Мобильное меню
    const burgerBtn = document.querySelector('.header-btn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileMenuOverlay = document.querySelector('.mobile-menu__overlay');

    // Открытие мобильного меню
    function openMobileMenu() {
        mobileMenu.classList.add('active');
        burgerBtn.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
    }

    // Закрытие мобильного меню
    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        burgerBtn.classList.remove('active');
        document.body.style.overflow = ''; // Восстанавливаем скролл страницы
    }

    // Обработчики событий
    if (burgerBtn) {
        burgerBtn.addEventListener('click', openMobileMenu);
    }

    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }

    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }

    // Закрытие меню при нажатии Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Закрытие меню при клике на ссылки в мобильном меню
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu__link');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Fixed header after scroll
    const headerTop = document.querySelector('.header__top');
    let isFixed = false;

    function onScroll() {
        if (!headerTop) return;
        if (window.scrollY > 200) {
            if (!isFixed) {
                headerTop.classList.add('header-fixed');
                isFixed = true;
            }
        } else {
            if (isFixed) {
                headerTop.classList.remove('header-fixed');
                isFixed = false;
            }
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Глобальное фиксированное уведомление.
    const fixedModal = document.getElementById('globalFixedModal');
    const fixedModalClose = fixedModal ? fixedModal.querySelector('.fixed-modal__close') : null;

    if (fixedModal && fixedModalClose) {
        fixedModalClose.addEventListener('click', function () {
            fixedModal.classList.add('is-hidden');
        });
    }
});