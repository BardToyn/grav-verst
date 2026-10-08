// Секция «Калькулятор»: пошаговая форма и расчёт ориентировочной стоимости.
// Цены берутся из data-price / data-mult на input'ах, поэтому менять их можно прямо в разметке.
// Для телефона и уведомлений используются утилиты из form.js (window.Gravis), если он подключён.

document.addEventListener('DOMContentLoaded', function () {

    const calc = document.getElementById('calc');
    const form = document.getElementById('calcForm');
    if (!calc || !form) return;

    const steps = Array.from(form.querySelectorAll('.calc-step'));
    const progress = Array.from(calc.querySelectorAll('[data-progress]'));
    const btnPrev = form.querySelector('[data-calc-prev]');
    const btnNext = form.querySelector('[data-calc-next]');
    const btnSubmit = form.querySelector('[data-calc-submit]');
    const summary = calc.querySelector('[data-calc-summary]');
    const totalEl = calc.querySelector('[data-calc-total]');
    const rangeEl = calc.querySelector('[data-calc-range]');

    const LAST_INPUT_STEP = 5;
    let step = 1;

    const money = n => new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽';
    const round100 = n => Math.round(n / 100) * 100;

    // 1) Состояние расчёта

    function calcState() {
        const checkedOne = name => form.querySelector(`input[name="${name}"]:checked`);
        const checkedAll = name => Array.from(form.querySelectorAll(`input[name="${name}"]:checked`));
        const sumPrices = list => list.reduce((sum, el) => sum + Number(el.dataset.price), 0);

        const type = checkedOne('type');
        const material = checkedOne('material');
        const size = checkedOne('size');
        const shape = checkedOne('shape');
        const engraving = checkedOne('engraving');
        const decor = checkedAll('decor');
        const extra = checkedAll('extra');

        const stone = Number(type.dataset.price) * Number(material.dataset.mult) * Number(size.dataset.mult) + Number(shape.dataset.price);
        const total = round100(stone + Number(engraving.dataset.price) + sumPrices(decor) + sumPrices(extra));

        return {
            total,
            rows: [
                ['Тип', type.value],
                ['Материал', material.value],
                ['Размер', `${size.value}, ${shape.value.toLowerCase()}`],
                ['Гравировка', engraving.value + (decor.length ? ' + декор' : '')],
                ['Дополнительно', extra.length ? extra.map(e => e.value).join(', ') : 'нет'],
            ],
        };
    }

    // 2) Отрисовка сводки

    function renderCalc() {
        const { total, rows } = calcState();

        if (summary) {
            summary.innerHTML = '';

            rows.slice(0, Math.min(step, LAST_INPUT_STEP)).forEach(([key, value]) => {
                const li = document.createElement('li');
                li.className = 'calc-summary__item';

                const keyEl = document.createElement('span');
                keyEl.className = 'calc-summary__key caption gray';
                keyEl.textContent = key;

                const valueEl = document.createElement('b');
                valueEl.className = 'calc-summary__value caption black';
                valueEl.textContent = value;

                li.append(keyEl, valueEl);
                summary.appendChild(li);
            });
        }

        if (totalEl) totalEl.textContent = 'от ' + money(total);
        if (rangeEl) rangeEl.textContent = `${money(round100(total * 0.95))} – ${money(round100(total * 1.1))}`;
    }

    // 3) Переключение шагов

    function goStep(n) {
        step = Math.max(1, Math.min(n, steps.length));

        steps.forEach(s => s.classList.toggle('is-active', Number(s.dataset.step) === step));

        progress.forEach(p => {
            const i = Number(p.dataset.progress);
            p.classList.toggle('is-active', i === step);
            p.classList.toggle('is-done', i < step);
        });

        if (btnPrev) btnPrev.hidden = step === 1;
        if (btnNext) {
            btnNext.hidden = step > LAST_INPUT_STEP;
            btnNext.textContent = step === LAST_INPUT_STEP ? 'Показать стоимость' : 'Далее';
        }
        if (btnSubmit) btnSubmit.hidden = step <= LAST_INPUT_STEP;

        renderCalc();
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            goStep(step + 1);

            // Если верх калькулятора ушёл за экран — подкручиваем к нему
            if (calc.getBoundingClientRect().top < 0) {
                calc.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => goStep(step - 1));
    }

    form.addEventListener('change', renderCalc);

    // 4) Отправка

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const gravis = window.Gravis || {};

        if (gravis.checkPhone && !gravis.checkPhone(form)) return;

        if (gravis.toast) {
            gravis.toast('Спасибо, заявка принята', 'Специалист перезвонит и подготовит точный расчёт.');
        }

        form.reset();
        goStep(1);
    });

    goStep(1);

});
