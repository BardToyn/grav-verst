// Секция «Калькулятор»: пошаговая форма и расчёт ориентировочной стоимости.
// Цена вида памятника — за комплект из гранита высотой 1 м.
// Другой материал и размер сдвигают сумму на разницу с этим комплектом.
// Надгробная плита заменяет комплект и масштабируется от цены одиночного памятника.
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
    const kmInput = form.querySelector('[data-km]');

    const LAST_INPUT_STEP = 5;
    let step = 1;

    const money = n => new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽';

    const checkedOne = name => form.querySelector(`input[name="${name}"]:checked`);

    function graniteInput() {
        return form.querySelector('[data-material="granite"]');
    }

    function singlePrice() {
        return Number(form.querySelector('[data-type="single"]').dataset.price);
    }

    function kmValue() {
        const raw = kmInput ? Number(kmInput.value) : 1;
        if (!Number.isFinite(raw) || raw < 1) return 1;
        return Math.min(300, Math.round(raw));
    }

    function isWide(type) {
        return type.dataset.type === 'double' || type.dataset.type === 'family';
    }

    function isActive(el) {
        const panel = el.closest('[data-panel]');
        return !panel || !panel.hidden;
    }

    function syncPanels() {
        const openers = Array.from(form.querySelectorAll('[data-opens]'));

        form.querySelectorAll('[data-panel]').forEach(panel => {
            const id = panel.dataset.panel;
            const open = openers.some(el => el.checked && el.dataset.opens.split(/\s+/).includes(id));
            panel.hidden = !open;
        });
    }

    function priceOf(el) {
        if (el.dataset.perKm) return Number(el.dataset.perKm) * kmValue();

        const size = checkedOne('size');
        if (el.dataset.p08 && size) return Number(el.dataset[size.dataset.key]);

        if (el.dataset.priceSingle) {
            const type = checkedOne('type');
            return Number(isWide(type) ? el.dataset.priceDouble : el.dataset.priceSingle);
        }

        return Number(el.dataset.price) || 0;
    }

    function kitCost(material, size) {
        const granite = graniteInput();
        const key = size.dataset.key;

        if (material.dataset.add) return Number(granite.dataset[key]) + Number(material.dataset.add);
        return Number(material.dataset[key]);
    }

    function signedMoney(n) {
        const rounded = Math.round(n);
        if (rounded === 0) return 'в стартовой цене';
        return (rounded > 0 ? '+ ' : '− ') + money(Math.abs(rounded));
    }

    // 1) Состояние расчёта

    function calcState() {
        syncPanels();

        const type = checkedOne('type');
        const material = checkedOne('material');
        const size = checkedOne('size');
        const shape = checkedOne('shape');
        const engraving = checkedOne('engraving');

        if (!type || !material || !size || !shape || !engraving) {
            return { total: 0, rows: [] };
        }

        let stone;
        if (size.dataset.kind === 'slab') {
            stone = Number(size.dataset.price) * Number(type.dataset.price) / singlePrice();
        } else {
            const ref = Number(graniteInput().dataset.p10);
            stone = Number(type.dataset.price) + kitCost(material, size) - ref;
        }

        const mode = engraving.dataset.mode;
        const decor = Array.from(form.querySelectorAll('input[name="decor"]:checked'))
            .filter(el => el.dataset.for === mode && isActive(el));

        let engravingPrice = Number(engraving.dataset.price) || 0;
        let engravingLabel = engraving.value;

        if (mode === 'composition' && !decor.length) {
            engravingPrice += Number(engraving.dataset.min) || 0;
            engravingLabel = 'Композиция: символы и рисунки';
        } else {
            engravingPrice += decor.reduce((sum, el) => sum + (Number(el.dataset.price) || 0), 0);
            if (decor.length) engravingLabel += ': ' + decor.map(el => el.value).join(', ');
        }

        const extras = Array.from(form.querySelectorAll('[data-sum]:checked'))
            .filter(el => isActive(el) && priceOf(el) > 0);

        const extraPrice = extras.reduce((sum, el) => sum + priceOf(el), 0);
        const extraLabel = extras.length
            ? extras.map(el => {
                if (el.dataset.perKm) return `За городом, ${kmValue()} км`;
                if (el.dataset.priceSingle) return isWide(type) ? 'Швеллер, 5/6 м' : 'Швеллер, 3 м';
                return el.value;
            }).join(', ')
            : 'нет';

        const total = Math.max(0, Math.round(
            stone + (Number(shape.dataset.price) || 0) + engravingPrice + extraPrice
        ));

        return {
            total,
            rows: [
                ['Тип', type.value],
                ['Материал', material.value],
                ['Размер', `${size.value}, ${shape.value.toLowerCase()}`],
                ['Гравировка', engravingLabel],
                ['Дополнительно', extraLabel],
            ],
        };
    }

    function renderLabels() {
        const material = checkedOne('material');
        const type = checkedOne('type');
        const granite = graniteInput();
        if (!material || !type || !granite) return;

        const ref = Number(granite.dataset.p10);

        form.querySelectorAll('[data-kit]').forEach(el => {
            const cost = kitCost(material, { dataset: { key: el.dataset.kit } });
            el.textContent = signedMoney(cost - ref);
        });

        form.querySelectorAll('[data-kind="slab"]').forEach(input => {
            const label = input.parentElement.querySelector('[data-slab-label]');
            if (!label) return;
            label.textContent = money(Number(input.dataset.price) * Number(type.dataset.price) / singlePrice());
        });

        form.querySelectorAll('[data-bind]').forEach(el => {
            const src = form.querySelector(`[data-price-for="${el.dataset.bind}"]`);
            if (src) el.textContent = '+ ' + money(priceOf(src));
        });

        const channelText = form.querySelector('[data-bind-text="channel"]');
        if (channelText) channelText.textContent = isWide(type) ? 'Швеллер, 5/6 м' : 'Швеллер, 3 м';
    }

    // 2) Отрисовка сводки

    function renderCalc() {
        const { total, rows } = calcState();
        renderLabels();

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

        const text = total ? 'от ' + money(total) : '—';
        if (totalEl) totalEl.textContent = text;
        if (rangeEl) rangeEl.textContent = text;
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

            if (calc.getBoundingClientRect().top < 0) {
                calc.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => goStep(step - 1));
    }

    form.addEventListener('input', renderCalc);
    form.addEventListener('change', renderCalc);

    if (kmInput) {
        kmInput.addEventListener('click', e => e.stopPropagation());
        kmInput.addEventListener('focus', () => {
            const radio = form.querySelector('[data-per-km]');
            if (radio && !radio.checked) radio.checked = true;
            renderCalc();
        });
        kmInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') e.preventDefault();
        });
        kmInput.addEventListener('blur', () => {
            kmInput.value = String(kmValue());
            renderCalc();
        });
    }

    // 4) Отправка

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const gravis = window.Gravis || {};

        if (gravis.checkPhone && !gravis.checkPhone(form)) return;

        if (gravis.toast) {
            gravis.toast('Спасибо, заявка принята', 'Специалист перезвонит и подготовит точный расчёт.');
        }

        form.reset();
        if (kmInput) kmInput.value = '1';
        goStep(1);
    });

    goStep(1);

});