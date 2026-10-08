// Секция «Портфолио»: фильтрация работ по материалу, типу и году.
// Группа фильтров — [data-filter="material|type|year"], значения кнопок — data-value,
// у карточек .work-item одноимённые data-атрибуты.

document.addEventListener('DOMContentLoaded', function () {

    const list = document.querySelector('[data-portfolio]');
    if (!list) return;

    const works = Array.from(list.querySelectorAll('.work-item'));
    const empty = document.querySelector('[data-portfolio-empty]');
    const filters = { material: 'all', type: 'all', year: 'all' };

    function applyFilters() {
        let visible = 0;

        works.forEach(work => {
            const show = Object.entries(filters).every(([key, value]) => value === 'all' || work.dataset[key] === value);
            work.hidden = !show;
            if (show) visible++;
        });

        if (empty) empty.hidden = visible > 0;
    }

    document.querySelectorAll('[data-filter]').forEach(group => {
        group.addEventListener('click', function (e) {
            const chip = e.target.closest('.chip');
            if (!chip) return;

            group.querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c === chip));
            filters[group.dataset.filter] = chip.dataset.value;

            applyFilters();
        });
    });

});
