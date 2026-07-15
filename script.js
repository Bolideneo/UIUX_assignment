(function () {
  'use strict';

  // Mobile navigation
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu 關閉選單' : 'Open menu 開啟選單');
    });
  }

  // Pricing tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = btn.getAttribute('data-tab');

      tabButtons.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      document.querySelectorAll('.tab-panel').forEach(function (panel) {
        const isTarget = panel.id === targetId;
        panel.classList.toggle('active', isTarget);
        panel.hidden = !isTarget;
      });
    });
  });

  // Booking form validation & price estimate
  const bookingForm = document.getElementById('booking-form');
  const PRICES = {
    weekday: { 1: { adult: 148, senior: 118, child: 98 }, 2: { adult: 168, senior: 128, child: 108 }, 3: { adult: 198, senior: 158, child: 128 } },
    weekend: { 3: { adult: 218, senior: 178, child: 0 } }
  };

  const GRILL_FEE = 50;
  const inputs = {
    adults: document.getElementById('adults'),
    seniors: document.getElementById('seniors'),
    children: document.getElementById('children'),
    duration: document.getElementById('duration'),
    dayType: document.getElementById('day-type'),
    visitDate: document.getElementById('visit-date'),
    visitTime: document.getElementById('visit-time'),
    name: document.getElementById('name'),
    phone: document.getElementById('phone'),
    email: document.getElementById('email'),
    largeGroup: document.getElementById('large-group')
  };

  const summaryEls = {
    guests: document.getElementById('summary-guests'),
    grills: document.getElementById('summary-grills'),
    food: document.getElementById('summary-food'),
    total: document.getElementById('summary-total')
  };

  // Photo gallery filters
  const galleryFilters = document.querySelectorAll('.gallery-filter');
  const galleryCards = document.querySelectorAll('.gallery-card[data-category]');
  galleryFilters.forEach(function (filterBtn) {
    filterBtn.addEventListener('click', function () {
      const filter = filterBtn.getAttribute('data-filter');
      galleryFilters.forEach(function (btn) { btn.classList.remove('active'); });
      filterBtn.classList.add('active');
      galleryCards.forEach(function (card) {
        const shouldShow = filter === 'all' || card.getAttribute('data-category') === filter;
        card.classList.toggle('is-hidden', !shouldShow);
      });
    });
  });

  // Live price calculator on pricing page
  const calcOrderType = document.getElementById('calc-order-type');
  const calcDayType = document.getElementById('calc-day-type');
  const calcDuration = document.getElementById('calc-duration');
  const calcAdults = document.getElementById('calc-adults');
  const calcSeniors = document.getElementById('calc-seniors');
  const calcChildren = document.getElementById('calc-children');
  const takeawayCalculator = document.getElementById('takeaway-calculator');
  const takeawayQtyInputs = document.querySelectorAll('.takeaway-qty');
  const calcGuests = document.getElementById('calc-guests');
  const calcFood = document.getElementById('calc-food');
  const calcGrill = document.getElementById('calc-grill');
  const calcTotal = document.getElementById('calc-total');
  const calcAction = document.getElementById('calc-action');

  function calculateTotals(dayType, duration, adults, seniors, children) {
    const totalGuests = adults + seniors + children;
    const grillCount = Math.max(1, Math.ceil(totalGuests / 5));
    const waivedGrills = Math.floor(totalGuests / 5);
    const grillTotal = Math.max(0, (grillCount - waivedGrills) * GRILL_FEE);
    const rates = PRICES[dayType] && PRICES[dayType][duration];

    if (!rates) {
      return { totalGuests: totalGuests, grillTotal: grillTotal, foodTotal: null, total: null };
    }

    const foodTotal = adults * rates.adult + seniors * rates.senior + children * (rates.child || 0);
    return { totalGuests: totalGuests, grillTotal: grillTotal, foodTotal: foodTotal, total: foodTotal + grillTotal };
  }

  function updateCalculator() {
    if (!calcDayType) return;

    const isTakeaway = calcOrderType && calcOrderType.value === 'takeaway';

    if (calcDayType.value === 'weekend') {
      calcDuration.value = '3';
      Array.from(calcDuration.options).forEach(function (opt) {
        opt.disabled = opt.value !== '3';
      });
    } else {
      Array.from(calcDuration.options).forEach(function (opt) {
        opt.disabled = false;
      });
    }

    if (takeawayCalculator) {
      takeawayCalculator.hidden = !isTakeaway;
    }

    [calcDayType, calcDuration, calcAdults, calcSeniors, calcChildren].forEach(function (el) {
      if (el) el.disabled = isTakeaway;
    });

    if (isTakeaway) {
      let takeawayTotal = 0;
      let takeawayCount = 0;

      takeawayQtyInputs.forEach(function (input) {
        const quantity = Math.max(0, parseInt(input.value, 10) || 0);
        takeawayCount += quantity;
        takeawayTotal += quantity * (parseInt(input.getAttribute('data-price'), 10) || 0);
      });

      calcGuests.textContent = takeawayCount + ' items 件';
      calcGrill.textContent = 'Not needed 不適用';
      calcFood.textContent = '$' + takeawayTotal;
      calcTotal.textContent = '$' + takeawayTotal;

      if (calcAction) {
        calcAction.href = 'contact.html#chat-room';
        calcAction.textContent = 'Order takeaway by chat 用聊天室預訂外賣';
      }
      return;
    }

    const result = calculateTotals(
      calcDayType.value,
      parseInt(calcDuration.value, 10),
      Math.max(0, parseInt(calcAdults.value, 10) || 0),
      Math.max(0, parseInt(calcSeniors.value, 10) || 0),
      Math.max(0, parseInt(calcChildren.value, 10) || 0)
    );

    calcGuests.textContent = String(result.totalGuests);
    calcGrill.textContent = result.grillTotal === 0 ? 'Waived 已豁免' : '$' + result.grillTotal;
    calcFood.textContent = result.foodTotal === null ? '—' : '$' + result.foodTotal;
    calcTotal.textContent = result.total === null ? '—' : '$' + result.total;

    if (calcAction) {
      calcAction.href = 'booking.html';
      calcAction.textContent = 'Book with this estimate 用此估算預訂';
    }
  }

  [calcOrderType, calcDayType, calcDuration, calcAdults, calcSeniors, calcChildren].forEach(function (el) {
    if (el) el.addEventListener('input', updateCalculator);
    if (el) el.addEventListener('change', updateCalculator);
  });
  takeawayQtyInputs.forEach(function (el) {
    el.addEventListener('input', updateCalculator);
    el.addEventListener('change', updateCalculator);
  });
  updateCalculator();

  function createChatMessage(type, title, message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message ' + (type === 'user' ? 'chat-message-user' : 'chat-message-staff');

    const titleEl = document.createElement('strong');
    titleEl.textContent = title;

    const textEl = document.createElement('p');
    message.split('\n').forEach(function (line, index) {
      if (index > 0) textEl.appendChild(document.createElement('br'));
      textEl.appendChild(document.createTextNode(line));
    });

    messageEl.appendChild(titleEl);
    messageEl.appendChild(textEl);
    return messageEl;
  }

  function addChatMessage(chatRoom, type, message) {
    const messages = chatRoom.querySelector('[data-chat-messages]');
    if (!messages) return;

    const title = type === 'user' ? 'You 你' : 'Bahia BBQ 巴希雅客服';
    messages.appendChild(createChatMessage(type, title, message));
    messages.scrollTop = messages.scrollHeight;
  }

  function handleChatSend(chatRoom, message) {
    const cleanMessage = message.trim();
    if (!cleanMessage) return;

    addChatMessage(chatRoom, 'user', cleanMessage);
    window.setTimeout(function () {
      addChatMessage(
        chatRoom,
        'staff',
        'Thanks for your message. Our team will confirm details by phone if WhatsApp is unavailable.\n多謝你的訊息。如 WhatsApp 未能使用，職員會以電話確認詳情。'
      );
    }, 500);
  }

  function initChatRoom(chatRoom) {
    const form = chatRoom.querySelector('[data-chat-form]');
    const input = form ? form.querySelector('input[name="message"]') : null;

    if (form && input) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        handleChatSend(chatRoom, input.value);
        input.value = '';
        input.focus();
      });
    }

    chatRoom.querySelectorAll('[data-chat-preset]').forEach(function (button) {
      button.addEventListener('click', function () {
        handleChatSend(chatRoom, button.getAttribute('data-chat-preset') || '');
      });
    });
  }

  function initFloatingChat() {
    const floatingChat = document.createElement('aside');
    floatingChat.className = 'floating-chat';
    floatingChat.innerHTML = [
      '<button type="button" class="floating-chat-toggle" aria-expanded="false">Chat 客服</button>',
      '<div class="floating-chat-panel" role="dialog" aria-label="Chat room 客服聊天室">',
      '  <div class="floating-chat-header">',
      '    <div><strong>Chat Room 客服聊天室</strong><small>Fallback if WhatsApp fails / WhatsApp 備用查詢</small></div>',
      '    <button type="button" class="floating-chat-close" aria-label="Close chat 關閉聊天室">×</button>',
      '  </div>',
      '  <div class="chat-room" data-chat-room>',
      '    <div class="chat-messages" data-chat-messages aria-live="polite">',
      '      <div class="chat-message chat-message-staff"><strong>Bahia BBQ 巴希雅客服</strong><p>Hello! Please leave your question here.<br>你好！可在此留下查詢。</p></div>',
      '    </div>',
      '    <form class="chat-form" data-chat-form>',
      '      <label for="floating-chat-message">Message 訊息</label>',
      '      <div class="chat-input-row">',
      '        <input id="floating-chat-message" name="message" type="text" placeholder="Type your question... / 輸入你的問題..." required>',
      '        <button type="submit" class="btn btn-primary">Send 傳送</button>',
      '      </div>',
      '    </form>',
      '    <div class="quick-chat-actions">',
      '      <button type="button" data-chat-preset="I want to ask about booking. 我想查詢預訂。">Booking 預訂</button>',
      '      <button type="button" data-chat-preset="I want to ask about price. 我想查詢收費。">Price 收費</button>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    document.body.appendChild(floatingChat);

    const toggle = floatingChat.querySelector('.floating-chat-toggle');
    const close = floatingChat.querySelector('.floating-chat-close');
    const room = floatingChat.querySelector('[data-chat-room]');

    function setOpen(isOpen) {
      floatingChat.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    }

    toggle.addEventListener('click', function () {
      setOpen(!floatingChat.classList.contains('open'));
    });

    close.addEventListener('click', function () {
      setOpen(false);
    });

    if (room) initChatRoom(room);
  }

  document.querySelectorAll('[data-chat-room]').forEach(initChatRoom);
  initFloatingChat();

  if (!bookingForm) return;

  function getGuestCounts() {
    return {
      adults: Math.max(0, parseInt(inputs.adults.value, 10) || 0),
      seniors: Math.max(0, parseInt(inputs.seniors.value, 10) || 0),
      children: Math.max(0, parseInt(inputs.children.value, 10) || 0)
    };
  }

  function updateSummary() {
    const guests = getGuestCounts();
    const totalGuests = guests.adults + guests.seniors + guests.children;
    const duration = parseInt(inputs.duration.value, 10);
    const dayType = inputs.dayType.value;

    summaryEls.guests.textContent = String(totalGuests);

    if (inputs.largeGroup.checked) {
      summaryEls.grills.textContent = 'Custom quote 團體報價';
      summaryEls.food.textContent = 'Custom quote 團體報價';
      summaryEls.total.textContent = 'Contact restaurant 聯絡餐廳';
      return;
    }

    const grillCount = Math.max(1, Math.ceil(totalGuests / 5));
    const waivedGrills = Math.floor(totalGuests / 5);
    const grillTotal = Math.max(0, (grillCount - waivedGrills) * GRILL_FEE);
    summaryEls.grills.textContent = grillTotal === 0 ? 'Waived 已豁免' : '$' + grillTotal;

    if (!duration || !dayType || !PRICES[dayType] || !PRICES[dayType][duration]) {
      summaryEls.food.textContent = '—';
      summaryEls.total.textContent = '—';
      return;
    }

    const rates = PRICES[dayType][duration];
    const foodTotal =
      guests.adults * rates.adult +
      guests.seniors * rates.senior +
      guests.children * (rates.child || 0);

    summaryEls.food.textContent = '$' + foodTotal;
    summaryEls.total.textContent = '$' + (foodTotal + grillTotal);
  }

  function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + '-error');
    if (input) input.classList.add('invalid');
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + '-error');
    if (input) input.classList.remove('invalid');
    if (errorEl) errorEl.textContent = '';
  }

  function validatePhone(phone) {
    return /^[0-9\s\-+]{8,15}$/.test(phone.trim());
  }

  function validateEmail(email) {
    if (!email.trim()) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  bookingForm.addEventListener('input', updateSummary);
  bookingForm.addEventListener('change', updateSummary);

  function updateBookingDurationOptions() {
    if (!inputs.dayType || !inputs.duration) return;

    const isWeekend = inputs.dayType.value === 'weekend';
    Array.from(inputs.duration.options).forEach(function (option) {
      if (!option.value) return;
      option.disabled = isWeekend && option.value !== '3';
    });

    if (isWeekend && inputs.duration.value !== '3') {
      inputs.duration.value = '3';
      clearError('duration');
    }
  }

  inputs.dayType.addEventListener('change', function () {
    updateBookingDurationOptions();
    updateSummary();
  });

  const timeSlotButtons = document.querySelectorAll('.time-slot-btn');
  timeSlotButtons.forEach(function (slotBtn) {
    slotBtn.addEventListener('click', function () {
      timeSlotButtons.forEach(function (btn) { btn.classList.remove('active'); });
      slotBtn.classList.add('active');
      inputs.visitTime.value = slotBtn.getAttribute('data-time');
      clearError('visit-time');
    });
  });

  inputs.visitTime.addEventListener('change', function () {
    timeSlotButtons.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-time') === inputs.visitTime.value);
    });
  });

  bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();

    ['visit-date', 'visit-time', 'duration', 'day-type', 'name', 'phone', 'email'].forEach(clearError);

    let valid = true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!inputs.visitDate.value) {
      showError('visit-date', 'Please select a date 請選擇日期');
      valid = false;
    } else if (new Date(inputs.visitDate.value) < today) {
      showError('visit-date', 'Date must be today or later 日期不可早於今天');
      valid = false;
    }

    if (!inputs.visitTime.value) {
      showError('visit-time', 'Please select a time 請選擇時段');
      valid = false;
    }

    if (!inputs.duration.value) {
      showError('duration', 'Please select duration 請選擇用餐時長');
      valid = false;
    }

    if (!inputs.dayType.value) {
      showError('day-type', 'Please select day type 請選擇日子類型');
      valid = false;
    } else if (inputs.dayType.value === 'weekend' && inputs.duration.value !== '3') {
      showError('duration', 'Weekends offer 3-hour sessions only 假期只提供3小時時段');
      valid = false;
    }

    if (!inputs.name.value.trim()) {
      showError('name', 'Name is required 請填寫姓名');
      valid = false;
    }

    if (!inputs.phone.value.trim()) {
      showError('phone', 'Phone is required 請填寫電話');
      valid = false;
    } else if (!validatePhone(inputs.phone.value)) {
      showError('phone', 'Enter a valid phone number 請輸入有效電話號碼');
      valid = false;
    }

    if (!validateEmail(inputs.email.value)) {
      showError('email', 'Enter a valid email 請輸入有效電郵地址');
      valid = false;
    }

    const guests = getGuestCounts();
    if (guests.adults + guests.seniors + guests.children === 0 && !inputs.largeGroup.checked) {
      alert('Please enter at least one guest or request a group quote.\n請輸入至少一位客人或申請團體報價。');
      valid = false;
    }

    const successEl = document.getElementById('form-success');
    if (valid) {
      successEl.hidden = false;
      successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      successEl.hidden = true;
    }
  });

  bookingForm.addEventListener('reset', function () {
    document.querySelectorAll('.error-msg').forEach(function (el) { el.textContent = ''; });
    document.querySelectorAll('.invalid').forEach(function (el) { el.classList.remove('invalid'); });
    document.getElementById('form-success').hidden = true;
    setTimeout(function () {
      updateBookingDurationOptions();
      updateSummary();
    }, 0);
  });

  // Set min date to today
  if (inputs.visitDate) {
    const todayStr = new Date().toISOString().split('T')[0];
    inputs.visitDate.setAttribute('min', todayStr);
  }

  updateBookingDurationOptions();
  updateSummary();
})();
