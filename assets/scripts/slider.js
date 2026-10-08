// Слайдер на нативном скролле.
// Разметка: контейнер [data-slider="имя"] с дорожкой .slider__track,
// кнопки [data-slider-prev="имя"] и [data-slider-next="имя"] могут лежать в любом месте страницы.
// Используется в секциях «Популярное» и «Отзывы».

document.addEventListener('DOMContentLoaded', function () {

    document.querySelectorAll('[data-slider]').forEach(slider => {
        const name = slider.dataset.slider;
        const track = slider.querySelector('.slider__track');
        const prev = document.querySelector(`[data-slider-prev="${name}"]`);
        const next = document.querySelector(`[data-slider-next="${name}"]`);

        if (!track) return;

        // Шаг прокрутки — ширина одной карточки вместе с отступом
        function stepSize() {
            const item = track.children[0];
            const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            return item ? item.getBoundingClientRect().width + gap : track.clientWidth;
        }

        function update() {
            if (prev) prev.disabled = track.scrollLeft <= 4;
            if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
        }

        if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -stepSize() }));
        if (next) next.addEventListener('click', () => track.scrollBy({ left: stepSize() }));

        track.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
    });

});
