// --- Динамический вывод услуг ---
const services = [
  {
    id: 1,
    name: "Классический массаж",
    desc: "Расслабляющий массаж всего тела для снятия усталости и стресса.",
    price: 2000
  },
  {
    id: 2,
    name: "Спортивный массаж",
    desc: "Восстановление после тренировок, улучшение тонуса мышц.",
    price: 2500
  },
  {
    id: 3,
    name: "Массаж спины",
    desc: "Снятие напряжения и боли в спине, улучшение осанки.",
    price: 1500
  }
];

function renderServices() {
  const servicesDiv = document.getElementById('services');
  servicesDiv.innerHTML = '';
  services.forEach(service => {
    const serviceCard = document.createElement('label');
    serviceCard.className = 'service-card';
    
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'service';
    radio.value = service.id;
    radio.required = true;
    
    radio.addEventListener('change', function() {
      console.log('Выбрана услуга:', service.name, 'ID:', service.id);
    });
    
    const title = document.createElement('h5');
    title.textContent = service.name;
    
    const desc = document.createElement('p');
    desc.textContent = service.desc;
    
    const price = document.createElement('div');
    price.className = 'price';
    price.textContent = `${service.price}₽`;
    
    serviceCard.appendChild(radio);
    serviceCard.appendChild(title);
    serviceCard.appendChild(desc);
    serviceCard.appendChild(price);
    
    servicesDiv.appendChild(serviceCard);
  });
}

// --- Переключение блока адреса ---
function setupFormatSwitch() {
  const formatRadios = document.querySelectorAll('input[name="format"]');
  const addressBlock = document.getElementById('address-block');
  formatRadios.forEach(el => {
    el.addEventListener('change', function() {
      addressBlock.style.display = this.value === 'home' ? 'block' : 'none';
    });
  });
}

// --- Яндекс.Карта ---
let selectedCoords = null;
function setupMap() {
  if (!window.ymaps) return;
  ymaps.ready(function () {
    const map = new ymaps.Map('map', {
      center: [53.7572, 87.1364],
      zoom: 12
    });
    let placemark;
    map.events.add('click', function (e) {
      const coords = e.get('coords');
      selectedCoords = coords;
      if (placemark) {
        placemark.geometry.setCoordinates(coords);
      } else {
        placemark = new ymaps.Placemark(coords, {}, {draggable: true});
        map.geoObjects.add(placemark);
        placemark.events.add('dragend', function() {
          selectedCoords = placemark.geometry.getCoordinates();
        });
      }
    });
  });
}

// --- Валидация полей формы ---
function validateForm(form) {
  const firstName = form.firstName.value.trim();
  const lastName = form.lastName.value.trim();
  const phone = form.phone.value.trim();

  // Проверка имени
  if (!/^[А-Яа-яЁё]{2,}$/.test(firstName)) {
    alert('Имя должно содержать минимум 2 буквы и только русские буквы');
    form.firstName.focus();
    return false;
  }

  // Проверка фамилии
  if (!/^[А-Яа-яЁё]{2,}$/.test(lastName)) {
    alert('Фамилия должна содержать минимум 2 буквы и только русские буквы');
    form.lastName.focus();
    return false;
  }

  // Проверка телефона
  if (!/^\+7[0-9]{10}$/.test(phone)) {
    alert('Номер телефона должен начинаться с +7 и содержать 11 цифр');
    form.phone.focus();
    return false;
  }

  return true;
}

// --- Отправка формы в Telegram ---
function setupForm() {
  const form = document.getElementById('orderForm');
  if (!form) {
    console.error('Форма не найдена!');
    return;
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Проверка выбора услуги
    const serviceInputs = document.querySelectorAll('input[name="service"]');
    let selectedService = null;
    
    serviceInputs.forEach(input => {
      if (input.checked) {
        selectedService = input;
      }
    });

    if (!selectedService) {
      alert('Пожалуйста, выберите услугу!');
      return;
    }

    const service = services.find(s => s.id == selectedService.value);
    if (!service) {
      alert('Ошибка: выбранная услуга не найдена');
      return;
    }

    // Получаем значения полей формы
    const firstNameInput = document.querySelector('input[name="firstName"]');
    const lastNameInput = document.querySelector('input[name="lastName"]');
    const phoneInput = document.querySelector('input[name="phone"]');
    
    if (!firstNameInput || !lastNameInput || !phoneInput) {
      console.error('Не найдены необходимые поля формы');
      return;
    }

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const phone = phoneInput.value.trim();

    // Проверка имени
    if (!/^[А-Яа-яЁё]{2,}$/.test(firstName)) {
      alert('Имя должно содержать минимум 2 буквы и только русские буквы');
      firstNameInput.focus();
      return;
    }

    // Проверка фамилии
    if (!/^[А-Яа-яЁё]{2,}$/.test(lastName)) {
      alert('Фамилия должна содержать минимум 2 буквы и только русские буквы');
      lastNameInput.focus();
      return;
    }

    // Проверка телефона
    if (!/^\+7[0-9]{10}$/.test(phone)) {
      alert('Номер телефона должен начинаться с +7 и содержать 11 цифр');
      phoneInput.focus();
      return;
    }

    // Проверка формата услуги
    const formatInput = document.querySelector('input[name="format"]:checked');
    if (!formatInput) {
      alert('Пожалуйста, выберите формат услуги!');
      return;
    }
    const format = formatInput.value;
    const address = (format === 'home' && selectedCoords) ? `Координаты: ${selectedCoords[0].toFixed(6)}, ${selectedCoords[1].toFixed(6)}` : 'В студии';

    // Проверка мессенджеров
    const messengers = Array.from(document.querySelectorAll('input[name="messenger"]:checked'))
      .map(input => input.value)
      .join(', ');

    if (messengers.length === 0) {
      alert('Пожалуйста, выберите хотя бы один мессенджер для связи!');
      return;
    }

    // --- Сбор сообщения ---
    const text =
      `Новая заявка!%0A` +
      `Услуга: ${service.name} (${service.price}₽)%0A` +
      `Описание: ${service.desc}%0A` +
      `Формат: ${format === 'home' ? 'На дому' : 'В студии'}%0A` +
      `Адрес: ${address}%0A` +
      `Имя: ${firstName}%0A` +
      `Фамилия: ${lastName}%0A` +
      `Телефон: ${phone}%0A` +
      `Мессенджеры: ${messengers}`;

    // --- Отправка в Telegram ---
    const token = '8025849467:AAFTzPSgCcZt8vpEwoPt5ngP_3jmF1C0oFE';
    const chat_id = '1747577985';
    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${text}`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        alert('Заявка успешно отправлена! Мы свяжемся с вами.');
        form.reset();
        selectedCoords = null;
      } else {
        alert('Ошибка отправки. Попробуйте позже.');
      }
    } catch (err) {
      alert('Ошибка сети. Попробуйте позже.');
    }
  });
}

// --- Инициализация ---
document.addEventListener('DOMContentLoaded', function() {
  renderServices();
  setupFormatSwitch();
  setupForm();
  setTimeout(setupMap, 500); // Даем карте подгрузиться
}); 