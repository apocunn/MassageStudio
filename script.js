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
    servicesDiv.innerHTML += `
      <label class="service-card">
        <input type="radio" name="service" value="${service.id}" required>
        <h5>${service.name}</h5>
        <p>${service.desc}</p>
        <div class="price">${service.price}₽</div>
      </label>
    `;
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
      center: [55.76, 37.64],
      zoom: 10
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

// --- Отправка формы в Telegram ---
function setupForm() {
  const form = document.getElementById('orderForm');
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const serviceId = form.querySelector('input[name="service"]:checked');
    if (!serviceId) {
      alert('Пожалуйста, выберите услугу!');
      return;
    }
    const service = services.find(s => s.id == serviceId.value);
    const format = form.querySelector('input[name="format"]:checked').value;
    const address = (format === 'home' && selectedCoords) ? `Координаты: ${selectedCoords[0].toFixed(6)}, ${selectedCoords[1].toFixed(6)}` : 'В студии';
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const phone = form.phone.value.trim();
    const messenger = form.messenger.value;

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
      `Мессенджер: ${messenger}`;

    // --- Отправка в Telegram ---
    // Вставьте ваш токен и chat_id ниже:
    const token = 'ВАШ_ТОКЕН_БОТА'; // <-- ВСТАВЬТЕ СЮДА
    const chat_id = 'ВАШ_CHAT_ID';  // <-- ВСТАВЬТЕ СЮДА
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