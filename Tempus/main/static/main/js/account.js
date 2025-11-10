const HOME_URL = "/";

// элементы для ТОСТ-УВЕДОМЛЕНИЯ (добавляем в HTML)
let toastNotification, closeToastBtn, toastProgressBar;

// функции для работы с боковыми меню
const searchBtn = document.getElementById('searchBtn');
const headerSearch = document.getElementById('headerSearch');
const backArrowSearch = document.getElementById('backArrowSearch');
const overlay = document.getElementById('overlay');
const homeLogo = document.getElementById('homeLogo');

// элементы для работы с банковскими картами
const addCardBtn = document.getElementById('addCardBtn');
const addCardForm = document.getElementById('addCardForm');
const cancelAddCard = document.getElementById('cancelAddCard');
const newCardForm = document.getElementById('newCardForm');
const cardNumberInput = document.getElementById('cardNumber');
const cardExpiryInput = document.getElementById('cardExpiry');
const cardCVCInput = document.getElementById('cardCVC');

// элементы для навигации по разделам
const menuLinks = document.querySelectorAll('.account-menu-link[data-section]');
const contentSections = document.querySelectorAll('.content-section');

// элементы переключения языка
const langToggleBtn = document.getElementById('langToggleBtn');
const langDropdown = document.getElementById('langDropdown');
const langItems = langDropdown ? langDropdown.querySelectorAll('.lang-item') : [];

// Переменная для хранения таймера тоста
let toastTimer;

// ------------------------------------------------------------------
// ФУНКЦИИ ТОСТ-УВЕДОМЛЕНИЯ (как в main.js)
// ------------------------------------------------------------------

const initializeToast = () => {
    // Создаем тост если его нет в HTML
    if (!document.getElementById('toastNotification')) {
        const toastHTML = `
            <div id="toastNotification" class="toast-notification">
                <div class="toast-content">
                    <i class="bi bi-check-circle-fill success-icon"></i>
                    <span class="toast-message">Сообщение</span>
                    <button id="closeToastBtn" class="toast-close-btn">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
                <div id="toastProgressBar" class="toast-progress-bar"></div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', toastHTML);
    }

    toastNotification = document.getElementById('toastNotification');
    closeToastBtn = document.getElementById('closeToastBtn');
    toastProgressBar = document.getElementById('toastProgressBar');

    if (closeToastBtn) {
        closeToastBtn.addEventListener('click', hideToastNotification);
    }
};

const hideToastNotification = () => {
    if (!toastNotification || !toastProgressBar) return;
    clearTimeout(toastTimer);
    toastNotification.classList.remove('show');
    toastProgressBar.classList.remove('animate');
};

const showToastNotification = (message = 'Операция выполнена успешно!', type = 'success') => {
    if (!toastNotification || !toastProgressBar) return;

    // Обновляем сообщение
    const toastMessage = toastNotification.querySelector('.toast-message');
    if (toastMessage) {
        toastMessage.textContent = message;
    }

    // Полностью пересоздаем иконку
    const iconContainer = toastNotification.querySelector('.toast-content');
    const existingIcon = toastNotification.querySelector('.success-icon, .error-icon');

    if (existingIcon) {
        existingIcon.remove();
    }

    let newIcon;
    if (type === 'error') {
        newIcon = document.createElement('i');
        newIcon.className = 'bi bi-x-circle-fill error-icon';
        newIcon.style.color = '#dc3545';
    } else {
        newIcon = document.createElement('i');
        newIcon.className = 'bi bi-check-circle-fill success-icon';
        newIcon.style.color = '#06520D';
    }

    // Вставляем иконку перед сообщением
    if (toastMessage && toastMessage.parentNode) {
        toastMessage.parentNode.insertBefore(newIcon, toastMessage);
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
};

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

// Функция для создания элемента из HTML строки
function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

// Функция для показа уведомления (ОБНОВЛЕНА - используем тост)
function showAlert(message, type = 'success') {
    showToastNotification(message, type);
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

const openMenu = (menuElement) => {
    closeAllMenus(false);
    if (menuElement) {
        menuElement.classList.add('activeMenu');
    }
    if (overlay) overlay.classList.add('activeOverlay');
    document.body.classList.add('no-scroll');
};

const closeAllMenus = (shouldCloseOverlay = true) => {
    if (headerSearch) headerSearch.classList.remove('activeMenu');
    if (shouldCloseOverlay) {
        if (overlay) {
            overlay.classList.remove('activeOverlay');
            document.body.classList.remove('no-scroll');
        }
    }
};

// навигация по разделам
const switchSection = (sectionId) => {
    contentSections.forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    menuLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
};

// функции для работы с банковскими картами
const showAddCardForm = () => {
    if (addCardForm) addCardForm.style.display = 'block';
    if (addCardBtn) addCardBtn.style.display = 'none';
};

const hideAddCardForm = () => {
    if (addCardForm) addCardForm.style.display = 'none';
    if (addCardBtn) addCardBtn.style.display = 'flex';
    if (newCardForm) newCardForm.reset();

    // Сбрасываем стили ошибок
    const inputs = newCardForm?.querySelectorAll('input');
    inputs?.forEach(input => {
        input.classList.remove('error');
    });
};

const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : value;
};

const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
        return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return value;
};

// Валидация формы карты на клиенте
const validateCardForm = () => {
    let isValid = true;

    if (cardNumberInput) {
        const cardNumber = cardNumberInput.value.replace(/\s/g, '');
        if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
            cardNumberInput.classList.add('error');
            isValid = false;
        } else {
            cardNumberInput.classList.remove('error');
        }
    }

    if (cardExpiryInput) {
        if (!/^\d{2}\/\d{2}$/.test(cardExpiryInput.value)) {
            cardExpiryInput.classList.add('error');
            isValid = false;
        } else {
            cardExpiryInput.classList.remove('error');
        }
    }

    if (cardCVCInput) {
        if (!/^\d{3}$/.test(cardCVCInput.value)) {
            cardCVCInput.classList.add('error');
            isValid = false;
        } else {
            cardCVCInput.classList.remove('error');
        }
    }

    const cardHolder = document.getElementById('cardHolder');
    if (cardHolder && (!cardHolder.value || cardHolder.value.trim().length < 2)) {
        cardHolder.classList.add('error');
        isValid = false;
    } else if (cardHolder) {
        cardHolder.classList.remove('error');
    }

    return isValid;
};

// Обработчик отправки формы карты с интеграцией Django
const handleCardSubmit = async (e) => {
    e.preventDefault();

    if (!validateCardForm()) {
        showToastNotification('Пожалуйста, исправьте ошибки в форме', 'error');
        return;
    }

    const cardData = {
        card_number: cardNumberInput.value,
        expiry_date: cardExpiryInput.value,
        cvc: cardCVCInput.value,
        card_holder: document.getElementById('cardHolder').value.toUpperCase()
    };

    try {
        const response = await fetch('/account/add-card/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify(cardData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            showToastNotification('Карта успешно добавлена!', 'success');
            addCardToDOM(data.card);
            hideAddCardForm();
        } else {
            const errorMessage = data.errors ? Object.values(data.errors).flat().join(', ') : 'Ошибка при добавлении карты';
            showToastNotification(errorMessage, 'error');
        }
    } catch (error) {
        handleApiError(error);
    }
};

// Функция для добавления карты в DOM
const addCardToDOM = (cardData) => {
    const cardsContainer = document.querySelector('.cards-container');
    const addCardBtn = document.getElementById('addCardBtn');

    if (!cardsContainer) return;

    const cardHTML = `
        <div class="bank-card ${cardData.is_primary ? 'active' : ''}" data-card-id="${cardData.id}">
            <div class="card-header">
                <span class="card-type">${cardData.type}</span>
                <div class="card-status-container">
                    <span class="card-status ${cardData.is_primary ? '' : 'inactive'}">${cardData.is_primary ? 'Основная' : 'Неактивна'}</span>
                    <button class="card-remove-btn" title="Удалить карту">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            </div>
            <div class="card-number">${cardData.number}</div>
            <div class="card-footer">
                <span class="card-holder">${cardData.holder}</span>
                <span class="card-expiry">${cardData.expiry}</span>
            </div>
        </div>
    `;

    const cardElement = createElementFromHTML(cardHTML);
    if (addCardBtn) {
        cardsContainer.insertBefore(cardElement, addCardBtn);
    } else {
        cardsContainer.appendChild(cardElement);
    }

    // Добавляем обработчик для кнопки удаления
    const removeBtn = cardElement.querySelector('.card-remove-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => removeCard(cardElement));
    }
};

// Удаление карты с интеграцией Django
const removeCard = async (cardElement) => {
    if (!confirm('Вы уверены, что хотите удалить эту карту?')) return;

    const cardId = cardElement.getAttribute('data-card-id');

    try {
        const response = await fetch(`/account/delete-card/${cardId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            cardElement.remove();
            showToastNotification('Карта удалена', 'success');
        } else {
            showToastNotification(data.error || 'Ошибка при удалении карты', 'error');
        }
    } catch (error) {
        handleApiError(error);
    }
};

// ------------------------------------------------------------------
// КЛАСС ДЛЯ РЕДАКТИРОВАНИЯ ПРОФИЛЯ (ИСПРАВЛЕННЫЙ)
// ------------------------------------------------------------------

class ProfileEditor {
    constructor() {
        this.isEditing = false;
        this.originalData = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.saveOriginalData();
    }

    bindEvents() {
        const editBtn = document.getElementById('editProfileBtn');
        const saveBtn = document.getElementById('saveProfileBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');

        if (editBtn) editBtn.addEventListener('click', () => this.toggleEditMode());
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveChanges());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.cancelEdit());
    }

    saveOriginalData() {
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');

        if (emailInput && phoneInput) {
            this.originalData = {
                email: emailInput.value,
                phone: phoneInput.value
            };
        }
    }

    toggleEditMode() {
        this.isEditing = !this.isEditing;

        const userInfoView = document.getElementById('userInfoView');
        const userInfoEdit = document.getElementById('userInfoEdit');
        const editProfileBtn = document.getElementById('editProfileBtn');
        const editActions = document.getElementById('editActions');
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                // Блокируем кириллицу
                e.target.value = e.target.value.replace(/[а-яА-ЯёЁ]/g, '');
            });
        }

        if (this.isEditing) {
            // Включаем режим редактирования
            if (userInfoView) userInfoView.style.display = 'none';
            if (userInfoEdit) userInfoEdit.style.display = 'block';
            if (editProfileBtn) editProfileBtn.style.display = 'none';
            if (editActions) editActions.style.display = 'flex';
            if (emailInput) emailInput.removeAttribute('readonly');
        } else {
            // Выключаем режим редактирования
            if (userInfoView) userInfoView.style.display = 'block';
            if (userInfoEdit) userInfoEdit.style.display = 'none';
            if (editProfileBtn) editProfileBtn.style.display = 'block';
            if (editActions) editActions.style.display = 'none';
            if (emailInput) emailInput.setAttribute('readonly', 'true');
        }
    }

    saveChanges() {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                // Блокируем кириллицу
                e.target.value = e.target.value.replace(/[а-яА-ЯёЁ]/g, '');
            });
        }
        const phoneInput = document.getElementById('phone');

        if (!emailInput || !phoneInput) return;

        const newEmail = emailInput.value;
        const newPhone = phoneInput.value;

        // Валидация email
        if (!this.validateEmail(newEmail)) {
            showToastNotification('Пожалуйста, введите корректный email (латинские буквы)', 'error');
            return;
        }

        // Валидация телефона
        const cleanPhone = newPhone.replace(/\D/g, '');
        if (!/^7\d{10}$/.test(cleanPhone)) {
            showToastNotification('Пожалуйста, введите корректный номер телефона (11 цифр, начинается с 7)', 'error');
            return;
        }

        // AJAX запрос к серверу
        this.updateProfileData(newEmail, newPhone);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Дополнительная проверка на кириллицу
        const hasCyrillic = /[а-яА-ЯёЁ]/.test(email);
        if (hasCyrillic) {
            return false;
        }

        return emailRegex.test(email);
    }

    updateProfileData(email, phone) {
        // Показываем индикатор загрузки
        this.showLoading(true);

        // AJAX запрос к Django
        fetch('/api/update-profile/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                email: email,
                phone: phone
            })
        })
        .then(response => response.json())
        .then(data => {
            this.showLoading(false);

            if (data.success) {
                // Обновляем отображаемые данные
                const displayEmail = document.getElementById('displayEmail');
                const displayPhone = document.getElementById('displayPhone');

                if (displayEmail) displayEmail.textContent = email;
                if (displayPhone) displayPhone.textContent = phone;

                // Сохраняем новые оригинальные данные
                this.originalData = { email, phone };

                // Выходим из режима редактирования
                this.toggleEditMode();

                showToastNotification(data.message || 'Данные успешно обновлены', 'success');
            } else {
                // Обрабатываем ошибки валидации
                if (data.errors) {
                    // Показываем первую ошибку
                    const firstError = Object.values(data.errors)[0][0];
                    showToastNotification(firstError, 'error');
                } else {
                    showToastNotification(data.error || 'Ошибка при обновлении данных', 'error');
                }
            }
        })
        .catch(error => {
            this.showLoading(false);
            console.error('Error:', error);
            showToastNotification('Ошибка соединения с сервером', 'error');
        });
    }

    cancelEdit() {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                // Блокируем кириллицу
                e.target.value = e.target.value.replace(/[а-яА-ЯёЁ]/g, '');
            });
        }
        const phoneInput = document.getElementById('phone');

        // Восстанавливаем оригинальные значения
        if (emailInput) emailInput.value = this.originalData.email;
        if (phoneInput) phoneInput.value = this.originalData.phone;

        // Выходим из режима редактирования
        this.toggleEditMode();
    }

    showLoading(show) {
        const saveBtn = document.getElementById('saveProfileBtn');
        if (saveBtn) {
            if (show) {
                saveBtn.innerHTML = '<span class="loading-spinner"></span> Сохранение...';
                saveBtn.disabled = true;
            } else {
                saveBtn.innerHTML = 'Сохранить';
                saveBtn.disabled = false;
            }
        }
    }
}

// ------------------------------------------------------------------
// ОБРАБОТЧИКИ СОБЫТИЙ
// ------------------------------------------------------------------

// Обработчики для бокового меню поиска
if (searchBtn && headerSearch) {
    searchBtn.addEventListener('click', () => openMenu(headerSearch));
}

if (backArrowSearch) {
    backArrowSearch.addEventListener('click', closeAllMenus);
}

if (overlay) {
    overlay.addEventListener('click', closeAllMenus);
}

// Клик по лого
if (homeLogo) {
    homeLogo.addEventListener('click', () => {
        window.location.href = HOME_URL;
    });
}

// Навигация по разделам
menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-section');
        switchSection(sectionId);
    });
});

// Обработчики для банковских карт
if (addCardBtn) {
    addCardBtn.addEventListener('click', showAddCardForm);
}

if (cancelAddCard) {
    cancelAddCard.addEventListener('click', hideAddCardForm);
}

if (newCardForm) {
    newCardForm.addEventListener('submit', handleCardSubmit);
}

// Форматирование ввода карты
if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
        e.target.value = formatCardNumber(e.target.value);
    });
}

if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', (e) => {
        e.target.value = formatExpiry(e.target.value);
    });
}

if (cardCVCInput) {
    cardCVCInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
    });
}

// Валидация поля владельца карты
const cardHolderInput = document.getElementById('cardHolder');
if (cardHolderInput) {
    cardHolderInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ\s\-]/g, '');
    });
}

// Удаление банковских карт
document.addEventListener('click', (e) => {
    if (e.target.closest('.card-remove-btn')) {
        const card = e.target.closest('.bank-card');
        removeCard(card);
    }
});

// ------------------------------------------------------------------
// ФУНКЦИИ ПЕРЕКЛЮЧЕНИЯ ЯЗЫКА
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

// Инициализация переключения языка
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
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем тост-уведомления
    initializeToast();

    // Скрываем кнопку логина если пользователь авторизован
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.style.display = 'none';
    }

    // Показываем кнопку аккаунта если пользователь авторизован
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const accountBtn = document.getElementById('accountBtn');

    if (isLoggedIn && accountBtn) {
        accountBtn.classList.remove('account-icon-hidden');
    }

    // Активация раздела профиля по умолчанию
    switchSection('profile');

    // Добавляем обработчики для существующих карт
    document.querySelectorAll('.bank-card').forEach(card => {
        const removeBtn = card.querySelector('.card-remove-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => removeCard(card));
        }
    });

    // Инициализация редактора профиля
    new ProfileEditor();

    // Инициализация языка
    const initialLang = localStorage.getItem('userLanguage') || 'ru';
    setActiveLanguage(initialLang);

    initLogoutModal();
});

// ------------------------------------------------------------------
// ФУНКЦИИ ДЛЯ МОДАЛЬНОГО ОКНА ВЫХОДА (ИСПРАВЛЕННАЯ ВЕРСИЯ)
// ------------------------------------------------------------------

// УБЕРИ эти старые объявления:
// const logoutModal = document.getElementById('logoutModal');
// const logoutCancelBtn = document.getElementById('logoutCancelBtn');
// const logoutConfirmBtn = document.getElementById('logoutConfirmBtn');
// const logoutBtn = document.getElementById('logoutBtnPage');

// ВМЕСТО НИХ ДОБАВЬ ЭТОТ КОД:

const initLogoutModal = () => {
    const logoutBtn = document.getElementById('logoutBtnPage');
    const logoutModal = document.getElementById('logoutModal');
    const logoutCancelBtn = document.getElementById('logoutCancelBtn');
    const logoutConfirmBtn = document.getElementById('logoutConfirmBtn');

    console.log('🔍 Инициализация модального окна выхода:');
    console.log('logoutBtn:', logoutBtn);
    console.log('logoutModal:', logoutModal);
    console.log('logoutCancelBtn:', logoutCancelBtn);
    console.log('logoutConfirmBtn:', logoutConfirmBtn);

    if (!logoutBtn || !logoutModal) {
        console.log('❌ Модальное окно или кнопка не найдены');
        return;
    }

    const showLogoutModal = () => {
        console.log('🟢 Показываем модальное окно');
        logoutModal.style.display = 'flex';
        setTimeout(() => {
            logoutModal.style.opacity = '1';
        }, 10);
        document.body.style.overflow = 'hidden';
    };

    const hideLogoutModal = () => {
        console.log('🔴 Скрываем модальное окно');
        logoutModal.style.opacity = '0';
        setTimeout(() => {
            logoutModal.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';
    };

    const handleLogout = async () => {
        console.log('🚪 Выполняем выход из аккаунта');
        hideLogoutModal();

        try {
            const response = await fetch('/logout/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                }
            });

            if (response.ok) {
                localStorage.removeItem('isLoggedIn');
                window.location.href = HOME_URL;
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error:', error);
            localStorage.removeItem('isLoggedIn');
            window.location.href = HOME_URL;
        }
    };

    // Обработчики событий
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showLogoutModal();
    });

    if (logoutCancelBtn) {
        logoutCancelBtn.addEventListener('click', hideLogoutModal);
    }

    if (logoutConfirmBtn) {
        logoutConfirmBtn.addEventListener('click', handleLogout);
    }

    // Закрытие по клику на фон
    logoutModal.addEventListener('click', (e) => {
        if (e.target === logoutModal) {
            hideLogoutModal();
        }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && logoutModal.style.display === 'flex') {
            hideLogoutModal();
        }
    });

    console.log('✅ Модальное окно выхода инициализировано');
};