const swiper = new Swiper('.popular-swiper', {
    loop: true,
    simulateTouch: true,
    grabCursor: true,
    slidesPerView: 4,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});

// Получение всех необходимых элементов
const searchBtn = document.getElementById('searchBtn');
const heartBtn = document.getElementById('heartBtn');
const loginBtn = document.getElementById('loginBtn')

const headerSearch = document.getElementById('headerSearch');
const headerHeart = document.getElementById('headerHeart');
const headerLogin = document.getElementById('headerLogin')
const headerRegister = document.getElementById('headerRegister');

const backArrowSearch = document.getElementById('backArrowSearch');
const backArrowHeart = document.getElementById('backArrowHeart');
const backArrowLogin = document.getElementById('backArrowLogin');
const backArrowRegister = document.getElementById('backArrowRegister');
const accountBtn = document.getElementById('accountBtn');
const overlay = document.getElementById('overlay');

// Элементы для переключения между формами
const goToRegister = document.getElementById('goToRegister');
const goToLogin = document.getElementById('goToLogin');

// Формы
const loginForm = headerLogin ? headerLogin.querySelector('.login-form') : null;
const registerForm = headerRegister ? headerRegister.querySelector('.login-form') : null;

// Элементы регистрации для валидации и индикатора
const registerEmailInput = document.getElementById('registerEmail');
const registerPasswordInput = document.getElementById('registerPassword');
const repeatPasswordInput = document.getElementById('repeatPassword');
const passwordStrengthIndicator = document.getElementById('passwordStrengthIndicator');
const registerSubmitBtn = document.getElementById('registerSubmitBtn');

// Элементы для сообщений об ошибках
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const repeatPasswordError = document.getElementById('repeatPasswordError');

// Элементы модального окна успеха регистрации
const successModal = document.getElementById('successModal');
const closeSuccessModalBtn = document.getElementById('closeSuccessModal');
const modalLoginBtn = document.getElementById('confirmSuccessModal');
const registeredEmailDisplay = document.getElementById('registeredEmailDisplay');

// Элементы для ТОСТ-УВЕДОМЛЕНИЯ
const toastNotification = document.getElementById('toastNotification');
const closeToastBtn = document.getElementById('closeToastBtn');
const toastProgressBar = document.getElementById('toastProgressBar');

// Элементы переключения языка
const langToggleBtn = document.getElementById('langToggleBtn');
const langDropdown = document.getElementById('langDropdown');
const langItems = langDropdown ? langDropdown.querySelectorAll('.lang-item') : [];

// Элементы дополнительных полей регистрации
const registerFirstNameInput = document.getElementById('registerFirstName');
const registerLastNameInput = document.getElementById('registerLastName');
const registerPhoneInput = document.getElementById('registerPhone');

const firstNameError = document.getElementById('firstNameError');
const lastNameError = document.getElementById('lastNameError');
const phoneError = document.getElementById('phoneError');

// Переменная для хранения таймера тоста
let toastTimer;

// ------------------------------------------------------------------
// ФУНКЦИИ ДЛЯ РАБОТЫ С DJANGO
// ------------------------------------------------------------------

// Функция для получения CSRF токена
function getCSRFToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Функция для обработки ошибок API
function handleApiError(error) {
    console.error('API Error:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        showToastNotification('Ошибка соединения с сервером', 'error');
    } else {
        showToastNotification('Произошла непредвиденная ошибка', 'error');
    }
}

// Функция для отображения ошибок формы
function displayFormErrors(errors) {
    resetValidationErrors();

    for (const field in errors) {
        const errorMessages = errors[field];
        let errorElement;

        switch (field) {
            case 'email':
                errorElement = emailError;
                break;
            case 'password1':
                errorElement = passwordError;
                break;
            case 'password2':
                errorElement = repeatPasswordError;
                break;
            case 'first_name':
                errorElement = firstNameError;
                break;
            case 'last_name':
                errorElement = lastNameError;
                break;
            case 'phone':
                errorElement = phoneError;
                break;
            case '__all__':
                // Общие ошибки
                showToastNotification(errorMessages[0] || 'Произошла ошибка', 'error');
                return;
            default:
                continue;
        }

        if (errorElement && errorMessages.length > 0) {
            errorElement.textContent = errorMessages[0];
            errorElement.classList.add('visible');
        }
    }
}

// Функция для создания элемента из HTML строки
function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

// ------------------------------------------------------------------
// ФУНКЦИИ ТОСТ-УВЕДОМЛЕНИЯ (обновленные)
// ------------------------------------------------------------------

const hideToastNotification = () => {
    if (!toastNotification || !toastProgressBar) return;
    clearTimeout(toastTimer);
    toastNotification.classList.remove('show');
    toastProgressBar.classList.remove('animate');
};

const showToastNotification = (message = 'Вы успешно вошли в аккаунт!', type = 'success') => {
    if (!toastNotification || !toastProgressBar) return;

    // Обновляем сообщение
    const toastMessage = toastNotification.querySelector('.toast-message');
    if (toastMessage) {
        toastMessage.textContent = message;
    }

    // Меняем иконку в зависимости от типа
    const successIcon = toastNotification.querySelector('.success-icon');
    if (successIcon) {
        if (type === 'error') {
            successIcon.className = 'bi bi-x-circle-fill error-icon';
            successIcon.style.color = '#dc3545';
        } else {
            successIcon.className = 'bi bi-check-circle-fill success-icon';
            successIcon.style.color = '#06520D';
        }
    }

    hideToastNotification();

    setTimeout(() => {
        toastNotification.classList.add('show');
        setTimeout(() => {
            toastProgressBar.classList.add('animate');
        }, 10);
    }, 100);

    toastTimer = setTimeout(() => {
        hideToastNotification();
    }, 4000);

    closeAllMenus(true);
};

// ------------------------------------------------------------------
// ФУНКЦИИ ПЕРЕКЛЮЧЕНИЯ ЯЗЫКА И СОХРАНЕНИЯ
// ------------------------------------------------------------------

const toggleLanguageDropdown = () => {
    if (!langDropdown || !langToggleBtn) return;
    const isExpanded = langToggleBtn.getAttribute('aria-expanded') === 'true' || false;
    langDropdown.classList.toggle('active', !isExpanded);
    langToggleBtn.setAttribute('aria-expanded', !isExpanded);
};

const setActiveLanguage = (langCode) => {
    if (!langItems.length) return;
    localStorage.setItem('userLanguage', langCode);
    langItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-lang') === langCode) {
            item.classList.add('active');
        }
    });
};

const initialLang = localStorage.getItem('userLanguage') || 'ru';
setActiveLanguage(initialLang);

if (langToggleBtn) {
    langToggleBtn.addEventListener('click', toggleLanguageDropdown);
}

if (langItems.length > 0) {
    langItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedLang = item.getAttribute('data-lang');
            setActiveLanguage(selectedLang);
            if (langDropdown && langToggleBtn) {
                langDropdown.classList.remove('active');
                langToggleBtn.setAttribute('aria-expanded', false);
            }
        });
    });
}

document.addEventListener('click', (e) => {
    if (langToggleBtn && langDropdown && langDropdown.classList.contains('active')) {
        if (!langToggleBtn.contains(e.target) && !langDropdown.contains(e.target)) {
            langDropdown.classList.remove('active');
            langToggleBtn.setAttribute('aria-expanded', false);
        }
    }
});

// ------------------------------------------------------------------
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ МЕНЮ И МОДАЛЬНЫХ ОКОН
// ------------------------------------------------------------------

const openMenu = (menuElement) => {
    closeAllMenus(false);
    if (menuElement) {
        menuElement.classList.add('activeMenu');
    }
    if (overlay) overlay.classList.add('activeOverlay');
    document.body.classList.add('no-scroll');
};

const toggleLoginState = (isLoggedIn) => {
    if (!loginBtn || !accountBtn) return;

    if (isLoggedIn) {
        loginBtn.classList.add('account-icon-hidden');
        accountBtn.classList.remove('account-icon-hidden');
    } else {
        loginBtn.classList.remove('account-icon-hidden');
        accountBtn.classList.add('account-icon-hidden');
    }
};

const closeAllMenus = (shouldCloseOverlay = true) => {
    if (headerSearch) headerSearch.classList.remove('activeMenu');
    if (headerHeart) headerHeart.classList.remove('activeMenu');
    if (headerLogin) headerLogin.classList.remove('activeMenu');
    if (headerRegister) headerRegister.classList.remove('activeMenu');

    if (shouldCloseOverlay) {
        const isSuccessModalActive = successModal && successModal.classList.contains('active');
        if (overlay && !isSuccessModalActive) {
            overlay.classList.remove('activeOverlay');
            document.body.classList.remove('no-scroll');
        }
    }
};

const openSuccessModal = (email) => {
    if (headerRegister) headerRegister.classList.remove('activeMenu');
    if (registeredEmailDisplay) registeredEmailDisplay.textContent = email;
    if (successModal) successModal.classList.add('active');
    if (overlay) overlay.classList.add('activeOverlay');
    document.body.classList.add('no-scroll');
};

const closeSuccessModal = () => {
    if (successModal) successModal.classList.remove('active');
    if (overlay) overlay.classList.remove('activeOverlay');
    document.body.classList.remove('no-scroll');
};

// ------------------------------------------------------------------
// ФУНКЦИЯ ПОКАЗА/СКРЫТИЯ ПАРОЛЯ
// ------------------------------------------------------------------

const togglePasswordVisibility = (e) => {
    const icon = e.target;
    const input = icon.closest('.password-group') ? icon.closest('.password-group').querySelector('input') : null;
    const targetIds = icon.getAttribute('data-targets');

    if (!targetIds && !input) return;

    const inputElements = [];
    if (targetIds) {
        const inputIds = targetIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
        inputIds.forEach(id => {
            const inputElement = document.getElementById(id);
            if (inputElement) inputElements.push(inputElement);
        });
    } else if (input) {
        inputElements.push(input);
    }

    if (inputElements.length === 0) return;

    const isPassword = inputElements[0].type === 'password';

    inputElements.forEach(inputElement => {
        inputElement.type = isPassword ? 'text' : 'password';
    });

    if (isPassword) {
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    } else {
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    }
};

document.querySelectorAll('.password-toggle').forEach(icon => {
    icon.addEventListener('click', togglePasswordVisibility);
});

// ------------------------------------------------------------------
// ФУНКЦИИ ВАЛИДАЦИИ И ИНДИКАТОРА СЛОЖНОСТИ ПАРОЛЯ
// ------------------------------------------------------------------

const validateEmailStrict = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
};

const checkPasswordStrength = (password) => {
    if (password.length < 8) return 'none';
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const numDigits = (password.match(/\d/g) || []).length;

    if (hasUpperCase && numDigits >= 3) {
        return 'strong';
    }
    if (hasLetters && hasNumbers) {
        return 'medium';
    }
    if (hasNumbers && !hasLetters) {
        return 'weak';
    }
    return 'weak';
};

const updatePasswordStrengthIndicator = () => {
    if (!registerPasswordInput || !passwordStrengthIndicator) return;
    const password = registerPasswordInput.value;
    const strength = checkPasswordStrength(password);
    const indicator = passwordStrengthIndicator;

    indicator.className = 'strength-indicator';
    switch (strength) {
        case 'strong':
            indicator.classList.add('strong');
            indicator.style.width = '100%';
            break;
        case 'medium':
            indicator.classList.add('medium');
            indicator.style.width = '66%';
            break;
        case 'weak':
            indicator.classList.add('weak');
            indicator.style.width = '33%';
            break;
        case 'none':
        default:
            indicator.style.width = '0%';
            break;
    }
    validatePasswordInputs();
};

// ИСПРАВЛЕННАЯ ФУНКЦИЯ - теперь показывает сообщения
const toggleError = (inputElement, errorElement, message) => {
    if (!inputElement || !errorElement) return;

    if (message && message.length > 0) {
        inputElement.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('visible'); // ДОБАВЛЕНО - показываем сообщение
    } else {
        inputElement.classList.remove('error');
        errorElement.textContent = '';
        errorElement.classList.remove('visible'); // ДОБАВЛЕНО - скрываем сообщение
    }
};

// ИСПРАВЛЕННАЯ ВАЛИДАЦИЯ EMAIL - теперь показывает ошибки при вводе
const validateEmailInput = () => {
    if (!registerEmailInput || !emailError) return;
    const email = registerEmailInput.value.trim();
    let message = '';

    if (email.length > 0) {
        if (!registerEmailInput.checkValidity()) {
            message = 'Пожалуйста, введите корректный адрес электронной почты.';
        } else if (!validateEmailStrict(email)) {
             message = 'Пожалуйста, введите корректный адрес электронной почты.';
        }
    } else {
        // Показываем ошибку только если поле было в фокусе и его очистили
        if (document.activeElement === registerEmailInput) {
            message = 'Поле "Почта" обязательно для заполнения.';
        }
    }
    toggleError(registerEmailInput, emailError, message);
    validatePasswordInputs();
};

// ИСПРАВЛЕННАЯ ВАЛИДАЦИЯ ПАРОЛЕЙ
const validatePasswordInputs = () => {
    if (!registerPasswordInput || !repeatPasswordInput || !passwordError || !repeatPasswordError || !registerSubmitBtn || !registerEmailInput) return;
    const password = registerPasswordInput.value;
    const repeatPassword = repeatPasswordInput.value;
    const strength = checkPasswordStrength(password);

    let passwordMessage = '';
    let repeatPasswordMessage = '';

    if (password.length > 0) {
        if (password.length < 8) {
            passwordMessage = 'Пароль должен содержать минимум 8 символов.';
        } else if (strength === 'weak') {
            passwordMessage = 'Пароль слишком слабый: не допускается только из цифр. Используйте буквы.';
        }
    } else {
        if (document.activeElement === registerPasswordInput) {
            passwordMessage = 'Поле "Пароль" обязательно для заполнения.';
        }
    }

    if (repeatPassword.length > 0) {
        if (password !== repeatPassword) {
            repeatPasswordMessage = 'Пароли не совпадают.';
        }
    } else {
        if (document.activeElement === repeatPasswordInput) {
            repeatPasswordMessage = 'Поле "Повторите пароль" обязательно для заполнения.';
        }
    }

    toggleError(registerPasswordInput, passwordError, passwordMessage);
    toggleError(repeatPasswordInput, repeatPasswordError, repeatPasswordMessage);

    const isEmailValid = registerEmailInput.value.length > 0 && validateEmailStrict(registerEmailInput.value);
    const isFirstNameValid = registerFirstNameInput && registerFirstNameInput.value.length >= 2;
    const isLastNameValid = registerLastNameInput && registerLastNameInput.value.length >= 2;
    const isPhoneValid = registerPhoneInput && registerPhoneInput.value.length > 0;

    const formIsInvalid = !isEmailValid ||
                          !isFirstNameValid ||
                          !isLastNameValid ||
                          !isPhoneValid ||
                          password.length < 8 ||
                          repeatPassword.length === 0 ||
                          password !== repeatPassword ||
                          strength === 'weak';

    if (registerSubmitBtn) {
        registerSubmitBtn.disabled = formIsInvalid;
    }
};

const resetValidationErrors = () => {
    [registerFirstNameInput, registerLastNameInput, registerEmailInput, registerPasswordInput, repeatPasswordInput, registerPhoneInput].forEach(input => {
        if(input) input.classList.remove('error');
    });

    [firstNameError, lastNameError, emailError, passwordError, repeatPasswordError, phoneError].forEach(error => {
        if(error) {
            error.textContent = '';
            error.classList.remove('visible'); // ДОБАВЛЕНО - скрываем при сбросе
        }
    });

    if (passwordStrengthIndicator) {
        passwordStrengthIndicator.className = 'strength-indicator';
        passwordStrengthIndicator.style.width = '0%';
    }

    if (registerSubmitBtn) registerSubmitBtn.disabled = true;
};

// ТОЛЬКО ДЛЯ СООБЩЕНИЯ "TOO COMMON"
document.querySelectorAll('input[type="password"]').forEach(input => {
    input.addEventListener('invalid', function(e) {
        if (this.validationMessage.toLowerCase().includes('too common')) {
            e.preventDefault();
            this.setCustomValidity('Этот пароль слишком простой и распространенный');
        }
    });

    input.addEventListener('input', function() {
        this.setCustomValidity('');
    });
});

// ПЕРЕХВАТ СЕРВЕРНЫХ ОШИБОК
function replaceCommonPasswordError() {
    const errorElements = document.querySelectorAll('.error-message, .alert, .help-block');

    errorElements.forEach(element => {
        if (element.textContent.includes('This password is too common.')) {
            element.textContent = 'Этот пароль слишком простой и распространенный';
        }
    });
}

// Запускаем при загрузке страницы и периодически
document.addEventListener('DOMContentLoaded', replaceCommonPasswordError);
setInterval(replaceCommonPasswordError, 500);

// ------------------------------------------------------------------
// НОВЫЕ ФУНКЦИИ ВАЛИДАЦИИ ДОПОЛНИТЕЛЬНЫХ ПОЛЕЙ
// ------------------------------------------------------------------

// ИСПРАВЛЕННАЯ ВАЛИДАЦИЯ ИМЕНИ И ФАМИЛИИ
const validateName = (inputElement, errorElement, fieldName) => {
    if (!inputElement || !errorElement) return;
    const value = inputElement.value.trim();
    let message = '';

    if (value.length === 0) {
        if (document.activeElement === inputElement) {
            message = `Поле "${fieldName}" обязательно для заполнения.`;
        }
    } else if (value.length < 2) {
        message = `${fieldName} должна содержать минимум 2 символа.`;
    } else if (!/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/.test(value)) {
        message = `${fieldName} может содержать только буквы, пробелы и дефисы.`;
    }

    toggleError(inputElement, errorElement, message);
    validatePasswordInputs();
};

// ИСПРАВЛЕННАЯ ФОРМАТИРОВКА ТЕЛЕФОНА
const formatPhoneNumber = (value) => {
    // Оставляем только цифры
    const numbers = value.replace(/\D/g, '');

    // Если нет цифр, возвращаем пустую строку
    if (numbers.length === 0) return '';

    // Ограничиваем до 11 цифр
    const limitedNumbers = numbers.slice(0, 11);

    // Форматируем по шаблону
    let formatted = '+7 (';

    if (limitedNumbers.length > 1) {
        formatted += limitedNumbers.slice(1, 4);
    }
    if (limitedNumbers.length > 4) {
        formatted += ') ' + limitedNumbers.slice(4, 7);
    }
    if (limitedNumbers.length > 7) {
        formatted += ' ' + limitedNumbers.slice(7, 9);
    }
    if (limitedNumbers.length > 9) {
        formatted += ' ' + limitedNumbers.slice(9, 11);
    }

    return formatted;
};

const validatePhone = () => {
    if (!registerPhoneInput || !phoneError) return;
    const phone = registerPhoneInput.value.trim();
    let message = '';

    if (phone.length === 0) {
        if (document.activeElement === registerPhoneInput) {
            message = 'Поле "Номер телефона" обязательно для заполнения.';
        }
    } else {
        // Очищаем номер для проверки (только цифры)
        const cleanPhone = phone.replace(/\D/g, '');
        if (!/^\d{11}$/.test(cleanPhone)) {
            message = 'Номер телефона должен содержать 11 цифр';
        } else if (!/^7[0-9]{10}$/.test(cleanPhone)) {
            message = 'Номер должен начинаться с 7';
        }
    }

    toggleError(registerPhoneInput, phoneError, message);
    validatePasswordInputs();
};

// Обработчик ввода для автоматического форматирования
registerPhoneInput.addEventListener('input', function(e) {
    const startPosition = this.selectionStart;
    const oldValue = this.value;
    const formatted = formatPhoneNumber(this.value);

    this.value = formatted;

    // Рассчитываем новую позицию курсора только если есть значение
    if (this.value.length > 0) {
        let newPosition = startPosition;

        // Корректируем позицию курсора
        if (formatted.length !== oldValue.length) {
            // При удалении - двигаем курсор назад, при добавлении - вперед
            newPosition = startPosition + (formatted.length - oldValue.length);
        }

        // Обеспечиваем, чтобы курсор не попадал на фиксированные символы
        if (newPosition <= 3) newPosition = 4;
        else if (newPosition === 8) newPosition = 9;
        else if (newPosition === 9) newPosition = 10;
        else if (newPosition === 13) newPosition = 14;
        else if (newPosition === 14) newPosition = 15;

        newPosition = Math.max(4, Math.min(newPosition, formatted.length));
        this.setSelectionRange(newPosition, newPosition);
    }

    // Валидируем после ввода
    validatePhone();
});

// Обработчик для удаления (чтобы можно было удалять символы)
registerPhoneInput.addEventListener('keydown', function(e) {
    if (e.key === 'Backspace') {
        const startPosition = this.selectionStart;
        const endPosition = this.selectionEnd;

        // Если выделен весь текст - очищаем полностью
        if (startPosition === 0 && endPosition === this.value.length) {
            e.preventDefault();
            this.value = '';
            validatePhone();
            return;
        }

        // Если курсор находится после скобки ") " - перепрыгиваем через нее
        if (startPosition === 9 && endPosition === 9) {
            e.preventDefault();
            this.setSelectionRange(7, 7); // Перемещаем курсор перед скобкой
            return;
        }

        // Если курсор находится после пробелов - перепрыгиваем через них
        if (startPosition === 13 && endPosition === 13) {
            e.preventDefault();
            this.setSelectionRange(12, 12);
            return;
        }
        if (startPosition === 16 && endPosition === 16) {
            e.preventDefault();
            this.setSelectionRange(15, 15);
            return;
        }

        // Если курсор в начале и нажимаем Backspace - очищаем полностью
        if (startPosition === 0) {
            e.preventDefault();
            this.value = '';
            validatePhone();
            return;
        }

        // Если остался только шаблон "+7 (" - очищаем полностью
        if (this.value === '+7 (' && startPosition === 4) {
            e.preventDefault();
            this.value = '';
            validatePhone();
            return;
        }

        // Если все цифры удалены - очищаем полностью
        const digitsOnly = this.value.replace(/\D/g, '');
        if (digitsOnly.length === 0) {
            e.preventDefault();
            this.value = '';
            validatePhone();
            return;
        }

        // Если пытаемся удалить фиксированную часть, перемещаем курсор назад
        if (startPosition <= 4) {
            e.preventDefault();
            this.setSelectionRange(4, 4);
        }
    }
});

// Обработчик для Delete
registerPhoneInput.addEventListener('keydown', function(e) {
    if (e.key === 'Delete') {
        const startPosition = this.selectionStart;
        const endPosition = this.selectionEnd;

        // Если курсор перед скобкой ")" - перепрыгиваем через нее
        if (startPosition === 7 && endPosition === 7) {
            e.preventDefault();
            this.setSelectionRange(9, 9);
            return;
        }

        // Если курсор перед пробелами - перепрыгиваем через них
        if (startPosition === 12 && endPosition === 12) {
            e.preventDefault();
            this.setSelectionRange(13, 13);
            return;
        }
        if (startPosition === 15 && endPosition === 15) {
            e.preventDefault();
            this.setSelectionRange(16, 16);
            return;
        }

        // Если все цифры удалены - очищаем полностью
        const digitsOnly = this.value.replace(/\D/g, '');
        if (digitsOnly.length === 0) {
            e.preventDefault();
            this.value = '';
            validatePhone();
            return;
        }
    }
});

// Обработчик для клика - если поле пустое, ставим курсор в начало
registerPhoneInput.addEventListener('click', function() {
    if (this.value === '') {
        this.value = '+7 (';
        this.setSelectionRange(4, 4);
    }
});

// Обработчик для фокуса - если поле пустое, ставим начальное значение
registerPhoneInput.addEventListener('focus', function() {
    if (this.value === '') {
        this.value = '+7 (';
        this.setSelectionRange(4, 4);
    }
});

// Инициализация при загрузке - ставим начальное значение
registerPhoneInput.value = '+7 (';
registerPhoneInput.setSelectionRange(4, 4);

// Обновленная функция валидации всех полей
const validateAllInputs = () => {
    // Принудительно валидируем все поля при отправке
    validateName(registerFirstNameInput, firstNameError, 'Имя');
    validateName(registerLastNameInput, lastNameError, 'Фамилия');
    validateEmailInput();
    validatePhone();
    validatePasswordInputs();
};

// ------------------------------------------------------------------
// ОБРАБОТЧИКИ СОБЫТИЙ - ДОБАВЛЕНЫ BLUR ДЛЯ ВСЕХ ПОЛЕЙ
// ------------------------------------------------------------------

// Live-валидация и индикатор
if (registerEmailInput) {
    registerEmailInput.addEventListener('input', validateEmailInput);
    registerEmailInput.addEventListener('blur', () => {
        // При уходе с поля всегда показываем ошибку если поле пустое
        const email = registerEmailInput.value.trim();
        if (email.length === 0) {
            toggleError(registerEmailInput, emailError, 'Поле "Почта" обязательно для заполнения.');
        } else {
            validateEmailInput();
        }
    });
}

if (registerPasswordInput) {
    registerPasswordInput.addEventListener('input', updatePasswordStrengthIndicator);
    registerPasswordInput.addEventListener('blur', () => {
        const password = registerPasswordInput.value;
        if (password.length === 0) {
            toggleError(registerPasswordInput, passwordError, 'Поле "Пароль" обязательно для заполнения.');
        } else {
            updatePasswordStrengthIndicator();
        }
    });
}

if (repeatPasswordInput) {
    repeatPasswordInput.addEventListener('input', validatePasswordInputs);
    repeatPasswordInput.addEventListener('blur', () => {
        const repeatPassword = repeatPasswordInput.value;
        if (repeatPassword.length === 0) {
            toggleError(repeatPasswordInput, repeatPasswordError, 'Поле "Повторите пароль" обязательно для заполнения.');
        } else {
            validatePasswordInputs();
        }
    });
}

// Валидация дополнительных полей
if (registerFirstNameInput) {
    registerFirstNameInput.addEventListener('input', () => validateName(registerFirstNameInput, firstNameError, 'Имя'));
    registerFirstNameInput.addEventListener('blur', () => {
        const firstName = registerFirstNameInput.value.trim();
        if (firstName.length === 0) {
            toggleError(registerFirstNameInput, firstNameError, 'Поле "Имя" обязательно для заполнения.');
        } else {
            validateName(registerFirstNameInput, firstNameError, 'Имя');
        }
    });
}

if (registerLastNameInput) {
    registerLastNameInput.addEventListener('input', () => validateName(registerLastNameInput, lastNameError, 'Фамилия'));
    registerLastNameInput.addEventListener('blur', () => {
        const lastName = registerLastNameInput.value.trim();
        if (lastName.length === 0) {
            toggleError(registerLastNameInput, lastNameError, 'Поле "Фамилия" обязательно для заполнения.');
        } else {
            validateName(registerLastNameInput, lastNameError, 'Фамилия');
        }
    });
}

if (registerPhoneInput) {
    registerPhoneInput.addEventListener('input', validatePhone);
    registerPhoneInput.addEventListener('blur', () => {
        const phone = registerPhoneInput.value.trim();
        if (phone.length === 0) {
            toggleError(registerPhoneInput, phoneError, 'Поле "Номер телефона" обязательно для заполнения.');
        } else {
            validatePhone();
        }
    });
}

// Показ ошибки при наведении
const setupErrorVisibility = (inputElement, errorElement) => {
    if (!inputElement || !errorElement) return;
    inputElement.addEventListener('mouseenter', () => {
        if (inputElement.classList.contains('error') && errorElement.textContent) {
            errorElement.classList.add('visible');
        }
    });
    inputElement.addEventListener('mouseleave', () => {
        errorElement.classList.remove('visible');
    });
};
setupErrorVisibility(registerFirstNameInput, firstNameError);
setupErrorVisibility(registerLastNameInput, lastNameError);
setupErrorVisibility(registerPhoneInput, phoneError);
setupErrorVisibility(registerEmailInput, emailError);
setupErrorVisibility(registerPasswordInput, passwordError);
setupErrorVisibility(repeatPasswordInput, repeatPasswordError);

// Открытие/закрытие боковых меню
if (searchBtn) searchBtn.addEventListener('click', () => { openMenu(headerSearch); });
if (heartBtn) heartBtn.addEventListener('click', () => { openMenu(headerHeart); });
if (loginBtn) loginBtn.addEventListener('click', () => { openMenu(headerLogin); });

if (backArrowSearch) backArrowSearch.addEventListener('click', closeAllMenus);
if (backArrowHeart) backArrowHeart.addEventListener('click', closeAllMenus);
if (backArrowLogin) backArrowLogin.addEventListener('click', closeAllMenus);
if (backArrowRegister) backArrowRegister.addEventListener('click', closeAllMenus);

// Закрытие модального окна успеха регистрации
if (closeSuccessModalBtn) closeSuccessModalBtn.addEventListener('click', closeSuccessModal);
if (modalLoginBtn) modalLoginBtn.addEventListener('click', closeSuccessModal);

// Закрытие тоста по крестику
if (closeToastBtn) closeToastBtn.addEventListener('click', hideToastNotification);

// Обновленный обработчик overlay
if (overlay) overlay.addEventListener('click', () => {
    if (successModal && successModal.classList.contains('active')) {
        closeSuccessModal();
    } else {
        closeAllMenus();
    }
});

// Переход между формами (Вход <-> Регистрация)
if (goToRegister && headerLogin && headerRegister) goToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    headerLogin.classList.remove('activeMenu');
    headerRegister.classList.add('activeMenu');
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();
    resetValidationErrors();
});

if (goToLogin && headerLogin && headerRegister) goToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    headerRegister.classList.remove('activeMenu');
    headerLogin.classList.add('activeMenu');
    if (registerForm) registerForm.reset();
    resetValidationErrors();
});

// ------------------------------------------------------------------
// ОБРАБОТЧИКИ ФОРМ С ИНТЕГРАЦИЕЙ DJANGO
// ------------------------------------------------------------------

// Отправка формы РЕГИСТРАЦИИ
if (registerForm && registerFirstNameInput && registerLastNameInput && registerEmailInput && registerPasswordInput && repeatPasswordInput && registerPhoneInput && registerSubmitBtn) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        validateAllInputs();

        // Проверяем все ошибки
        const hasFirstNameError = firstNameError && firstNameError.textContent.length > 0;
        const hasLastNameError = lastNameError && lastNameError.textContent.length > 0;
        const hasEmailError = emailError && emailError.textContent.length > 0;
        const hasPhoneError = phoneError && phoneError.textContent.length > 0;
        const hasPasswordError = passwordError && passwordError.textContent.length > 0;
        const hasRepeatError = repeatPasswordError && repeatPasswordError.textContent.length > 0;

        if (registerSubmitBtn.disabled === true || hasFirstNameError || hasLastNameError || hasEmailError || hasPhoneError || hasPasswordError || hasRepeatError) {
            // Показываем ошибки для пустых полей
            if (registerFirstNameInput.value.length === 0) toggleError(registerFirstNameInput, firstNameError, 'Поле "Имя" обязательно для заполнения.');
            if (registerLastNameInput.value.length === 0) toggleError(registerLastNameInput, lastNameError, 'Поле "Фамилия" обязательно для заполнения.');
            if (registerEmailInput.value.length === 0) toggleError(registerEmailInput, emailError, 'Поле "Почта" обязательно для заполнения.');
            if (registerPhoneInput.value.length === 0) toggleError(registerPhoneInput, phoneError, 'Поле "Номер телефона" обязательно для заполнения.');
            if (registerPasswordInput.value.length === 0) toggleError(registerPasswordInput, passwordError, 'Поле "Пароль" обязательно для заполнения.');
            if (repeatPasswordInput.value.length === 0) toggleError(repeatPasswordInput, repeatPasswordError, 'Поле "Повторите пароль" обязательно для заполнения.');

            showToastNotification('Пожалуйста, исправьте ошибки в форме.', 'error');
            return;
        }

        // Отправка данных на сервер
        const formData = new FormData();
        formData.append('first_name', registerFirstNameInput.value);
        formData.append('last_name', registerLastNameInput.value);
        formData.append('email', registerEmailInput.value);
        formData.append('phone', registerPhoneInput.value);
        formData.append('password1', registerPasswordInput.value);
        formData.append('password2', repeatPasswordInput.value);

        try {
            const response = await fetch('/register/', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                showToastNotification(data.message || 'Регистрация прошла успешно!');
                registerForm.reset();
                resetValidationErrors();
                closeAllMenus(true);
                localStorage.setItem('isLoggedIn', 'true');

                setTimeout(() => {
                    window.location.href = data.redirect_url || '/account/';
                }, 1500);
            } else {
                displayFormErrors(data.errors || {});
            }
        } catch (error) {
            handleApiError(error);
        }
    });
}

// Отправка формы ВХОДА
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('username', document.getElementById('loginEmail').value);
        formData.append('password', document.getElementById('loginPassword').value);

        try {
            const response = await fetch('/login/', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                showToastNotification(data.message || 'Вы успешно вошли в аккаунт!');
                localStorage.setItem('isLoggedIn', 'true');
                closeAllMenus(true);
                loginForm.reset();

                setTimeout(() => {
                    window.location.href = data.redirect_url || '/account/';
                }, 1500);
            } else {
                displayFormErrors(data.errors || {});
            }
        } catch (error) {
            handleApiError(error);
        }
    });
}

// ------------------------------------------------------------------
// ПРОВЕРКА СОСТОЯНИЯ ВХОДА ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ------------------------------------------------------------------

const checkLoginState = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!loginBtn || !accountBtn) return;

    if (isLoggedIn) {
        loginBtn.classList.add('account-icon-hidden');
        accountBtn.classList.remove('account-icon-hidden');
    } else {
        loginBtn.classList.remove('account-icon-hidden');
        accountBtn.classList.add('account-icon-hidden');
    }
};

// Запускаем проверку при загрузке страницы
document.addEventListener('DOMContentLoaded', checkLoginState);