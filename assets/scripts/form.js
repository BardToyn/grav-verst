// Формы: маска телефона, валидация, отправка и уведомления.
// Общие утилиты складываются в window.Gravis, чтобы ими могли пользоваться другие скрипты.

window.Gravis = window.Gravis || {};

(function () {

    // 1) Уведомления

    function toast(title, text) {
        const list = document.querySelector('[data-toasts]');
        if (!list) return;

        const el = document.createElement('div');
        el.className = 'toast';

        const titleEl = document.createElement('p');
        titleEl.className = 'toast__title subtitle black';
        titleEl.textContent = title;
        el.appendChild(titleEl);

        if (text) {
            const textEl = document.createElement('p');
            textEl.className = 'toast__text caption gray';
            textEl.textContent = text;
            el.appendChild(textEl);
        }

        list.appendChild(el);

        setTimeout(() => {
            el.classList.add('is-leaving');
            el.addEventListener('animationend', () => el.remove(), { once: true });
        }, 3800);
    }

    // 2) Телефон

    function validPhone(value) {
        return value.replace(/\D/g, '').length === 11;
    }

    function maskPhone(input) {
        input.addEventListener('input', () => {
            let digits = input.value.replace(/\D/g, '');

            if (!digits) {
                input.value = '';
                return;
            }

            if (digits[0] === '8') digits = '7' + digits.slice(1);
            if (digits[0] !== '7') digits = '7' + digits;
            digits = digits.slice(0, 11);

            let out = '+7';
            if (digits.length > 1) out += ' (' + digits.slice(1, 4);
            if (digits.length >= 4) out += ')';
            if (digits.length > 4) out += ' ' + digits.slice(4, 7);
            if (digits.length > 7) out += '-' + digits.slice(7, 9);
            if (digits.length > 9) out += '-' + digits.slice(9, 11);

            input.value = out;

            if (validPhone(out)) {
                const field = input.closest('.field');
                if (field) field.classList.remove('is-invalid');
            }
        });

        input.addEventListener('focus', () => {
            if (!input.value) input.value = '+7 ';
        });

        input.addEventListener('blur', () => {
            if (input.value.trim() === '+7') input.value = '';
        });
    }

    // Проверяет обязательный телефон внутри формы и подсвечивает ошибку
    function checkPhone(form) {
        const phone = form.querySelector('[data-phone]');
        if (!phone) return true;

        const field = phone.closest('.field');

        if (!validPhone(phone.value)) {
            if (field) field.classList.add('is-invalid');
            phone.focus();
            return false;
        }

        if (field) field.classList.remove('is-invalid');
        return true;
    }

    window.Gravis.toast = toast;
    window.Gravis.validPhone = validPhone;
    window.Gravis.maskPhone = maskPhone;
    window.Gravis.checkPhone = checkPhone;

    // 3) Инициализация

    document.addEventListener('DOMContentLoaded', function () {

        document.querySelectorAll('[data-phone]').forEach(maskPhone);

        // Обычные формы заявок: контакты, модальное окно
        document.querySelectorAll('[data-form]').forEach(form => {
            form.addEventListener('submit', function (e) {
                e.preventDefault();

                if (!checkPhone(form)) return;

                const consent = form.querySelector('[name="consent"]');
                if (consent && !consent.checked) {
                    toast('Нужно ваше согласие', 'Отметьте согласие на обработку данных, пожалуйста.');
                    return;
                }

                form.reset();
                toast('Спасибо, заявка отправлена', 'Мы перезвоним вам в ближайшее время.');

                // Сообщаем остальным скриптам (например, модалке), что форма успешно отправлена
                form.dispatchEvent(new CustomEvent('gravis:formSuccess', { bubbles: true }));
            });
        });

    });

})();
