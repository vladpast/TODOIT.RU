/**
 * Стратегическая диагностика ИТ за 3 минуты
 * Логика: валидация, вопросы, подсчёт, отправка
 */

// === ДАННЫЕ ВОПРОСОВ И РИСКОВ ===
const questions = [
  {
    id: 1,
    text: "Готова ли текущая ИТ-архитектура к масштабированию бизнеса?",
    riskPartial: "Архитектура содержит узкие места, которые могут стать критичными при росте нагрузки в 2-3 раза.",
    riskNo: "ИТ-архитектура не готова к масштабированию. При росте бизнеса потребуется срочная и дорогостоящая перестройка."
  },
  {
    id: 2,
    text: "Есть ли зависимость от устаревшей критической системы?",
    riskPartial: "Зависимость от legacy-системы существует, но есть план миграции. Риск — сроки могут затянуться.",
    riskNo: "Критическая бизнес-система построена на устаревшей технологии. Это главный кандидат на отказ в момент роста нагрузки."
  },
  {
    id: 3,
    text: "Формализованы ли критические знания (низкий Bus Factor)?",
    riskPartial: "Часть знаний задокументирована, но ключевые компетенции остаются у отдельных сотрудников.",
    riskNo: "Критические знания находятся у 1-2 человек. Уход любого из них создаст операционный кризис."
  },
  {
    id: 4,
    text: "Есть ли прозрачные KPI и управляемость ИТ?",
    riskPartial: "Частичная система метрик существует, но не охватывает все критичные процессы.",
    riskNo: "ИТ работает «в чёрном ящике». Нет понимания реальной эффективности и вклада в бизнес."
  },
  {
    id: 5,
    text: "Влияет ли ИТ на рост EBITDA?",
    riskPartial: "ИТ частично влияет на доход, но связь не формализована и не измеряется системно.",
    riskNo: "ИТ воспринимается как центр затрат. Влияние на выручку не доказано и не артикулировано."
  },
  {
    id: 6,
    text: "Управляются ли интеграции систем архитектурно?",
    riskPartial: "Часть интеграций формализована, но есть «точечные» решения без архитектурного контроля.",
    riskNo: "Интеграции хаотичны. Каждый новый обмен — это технический долг и потенциальный инцидент."
  },
  {
    id: 7,
    text: "Контролируется ли реализация стратегических ИТ-проектов?",
    riskPartial: "Проекты отслеживаются, но без системы эскалации и срывы выявляются с задержкой.",
    riskNo: "Стратегические проекты выходят из-под контроля. Сроки и бюджеты регулярно превышаются."
  },
  {
    id: 8,
    text: "Готова ли инфраструктура к масштабированию федеральной сети?",
    riskPartial: "Инфраструктура выдержит рост на 30-50%, но для федерального масштаба потребуется модернизация.",
    riskNo: "Инфраструктура заточена под текущий масштаб. Расширение сети приведёт к деградации сервисов."
  },
  {
    id: 9,
    text: "Есть ли модель передачи ИТ без потери контроля?",
    riskPartial: "Частичная документация процессов существует, но полной модели передачи нет.",
    riskNo: "Нет модели передачи. Смена CIO или собственника приведёт к потере управляемости."
  },
  {
    id: 10,
    text: "Существует ли архитектурный roadmap на 3–5 лет?",
    riskPartial: "Roadmap существует, но не актуализируется и не привязан к бизнес-целям.",
    riskNo: "Нет долгосрочного видения. ИТ работает в режиме «тушения пожаров» без стратегии."
  },
  {
    id: 11,
    text: "Реализована ли системная модель ИБ (ФЗ-152 / ФЗ-187)?",
    riskPartial: "Частичное соответствие требованиям, но без системного подхода и регулярного аудита.",
    riskNo: "ИБ не соответствует регуляторным требованиям. Это риск штрафов, проверок и репутационных потерь."
  }
];

// === СОСТОЯНИЕ ПРИЛОЖЕНИЯ ===
let currentQuestionIndex = 0;
let answers = [];
let contactData = null;

// === АНАЛИТИКА ===
const YANDEX_METRIKA_ID = 106909561;

function trackEvent(eventName, params = {}) {
  console.log('[Analytics]', eventName, params);
  if (typeof ym !== 'undefined') {
    ym(YANDEX_METRIKA_ID, 'reachGoal', eventName, params);
  }
}

// === ВАЛИДАЦИЯ ФОРМЫ КОНТАКТОВ ===
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateContactForm() {
  const name = document.getElementById('name');
  const company = document.getElementById('company');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  
  let isValid = true;
  
  [name, company, email, phone].forEach(field => {
    field.classList.remove('error');
    field.parentElement.classList.remove('has-error');
  });
  
  if (!name.value.trim()) {
    name.classList.add('error');
    name.parentElement.classList.add('has-error');
    isValid = false;
  }
  
  if (!company.value.trim()) {
    company.classList.add('error');
    company.parentElement.classList.add('has-error');
    isValid = false;
  }
  
  if (!email.value.trim() || !validateEmail(email.value)) {
    email.classList.add('error');
    email.parentElement.classList.add('has-error');
    isValid = false;
  }
  
  if (!phone.value.trim()) {
    phone.classList.add('error');
    phone.parentElement.classList.add('has-error');
    isValid = false;
  }
  
  return isValid;
}

// === СТАРТ ДИАГНОСТИКИ (после формы на hero) ===
function startChecklist(e) {
  e.preventDefault();
  
  // Скрываем hero, показываем чек-лист
  document.getElementById('hero').style.display = 'none';
  document.getElementById('checklist').style.display = 'block';
  
  // Инициализируем первый вопрос
  currentQuestionIndex = 0;
  answers = new Array(questions.length).fill(null);
  
  renderQuestion();
  
  // Отправка события аналитики
  trackEvent('checklist_started');
}

// === ОТРИСОВКА ВОПРОСА ===
function renderQuestion() {
  const question = questions[currentQuestionIndex];
  
  // Обновляем прогресс
  const progress = ((currentQuestionIndex) / questions.length) * 100;
  document.getElementById('progress-fill').style.width = progress + '%';
  document.getElementById('progress-text').textContent = `Вопрос ${currentQuestionIndex + 1} из ${questions.length}`;
  document.getElementById('question-number').textContent = `Вопрос ${currentQuestionIndex + 1}`;
  document.getElementById('question-text').textContent = question.text;
  
  // Сбрасываем выделение кнопок
  document.querySelectorAll('.answer-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Скрываем предупреждение о риске
  document.getElementById('risk-warning').style.display = 'none';
  
  // Показываем/скрываем кнопку "Назад"
  const prevBtn = document.getElementById('prev-btn');
  prevBtn.style.visibility = currentQuestionIndex > 0 ? 'visible' : 'hidden';
  
  // Анимация появления
  const card = document.querySelector('.question-card');
  card.style.opacity = '0';
  card.style.transform = 'translateY(10px)';
  
  setTimeout(() => {
    card.style.transition = 'opacity 0.3s, transform 0.3s';
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  }, 50);
}

// === ВЫБОР ОТВЕТА ===
function selectAnswer(answer) {
  const question = questions[currentQuestionIndex];
  
  // Сохраняем ответ
  answers[currentQuestionIndex] = answer;
  
  // Выделяем кнопку
  document.querySelectorAll('.answer-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  document.querySelector(`[data-answer="${answer}"]`).classList.add('selected');
  
  // Отправляем событие аналитики
  trackEvent('question_answered', {
    question_id: question.id,
    answer: answer
  });
  
  // Мгновенный переход к следующему вопросу
  setTimeout(() => {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      renderQuestion();
    } else {
      // Все вопросы отвечены - сразу показываем результаты
      showResults();
    }
  }, 300);
}

// === ПОКАЗ ФОРМЫ КОНТАКТОВ ПОСЛЕ ОПРОСА ===
function showContactFormForResults() {
  // Скрываем чек-лист, показываем форму контактов
  document.getElementById('checklist').style.display = 'none';
  document.getElementById('contact-form').style.display = 'block';
  
  // Прокрутка к форме
  document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' });
  
  // Аналитика
  trackEvent('checklist_questions_completed');
}

// === ОТПРАВКА КОНТАКТОВ И ПОКАЗ РЕЗУЛЬТАТОВ ===
function submitContactAndShowResults(e) {
  e.preventDefault();
  
  if (!validateContactForm()) {
    trackEvent('contact_form_validation_failed');
    return;
  }
  
  // Сохраняем контактные данные
  contactData = {
    name: document.getElementById('name').value.trim(),
    company: document.getElementById('company').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim()
  };
  
  // Сохраняем в localStorage
  localStorage.setItem('checklist_contact', JSON.stringify(contactData));
  
  // Показываем результаты
  showResults();
  
  // Отправка события аналитики
  trackEvent('contact_submitted', { 
    company: contactData.company
  });
}

// === ПРЕДЫДУЩИЙ ВОПРОС ===
function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
    
    // Восстанавливаем предыдущий ответ
    const prevAnswer = answers[currentQuestionIndex];
    if (prevAnswer) {
      const question = questions[currentQuestionIndex];
      document.querySelector(`[data-answer="${prevAnswer}"]`).classList.add('selected');
      
      const riskWarning = document.getElementById('risk-warning');
      const riskText = document.getElementById('risk-text');
      
      if (prevAnswer === 'partial') {
        riskWarning.style.display = 'flex';
        riskText.textContent = question.riskPartial;
      } else if (prevAnswer === 'no') {
        riskWarning.style.display = 'flex';
        riskText.textContent = question.riskNo;
      }
    }
  }
}

// === ПОДСЧЁТ РЕЗУЛЬТАТОВ ===
function calculateScore() {
  let score = 0;
  answers.forEach(answer => {
    if (answer === 'no') score += 2;
    else if (answer === 'partial') score += 1;
  });
  return score;
}

// === ОПРЕДЕЛЕНИЕ УРОВНЯ РИСКА ===
function getRiskLevel(score) {
  if (score <= 5) {
    return {
      level: 'low',
      text: 'Низкий уровень стратегической уязвимости ИТ',
      description: 'Ваша ИТ-система в хорошем состоянии. Однако рекомендую провести глубокий аудит для выявления скрытых рисков.',
      icon: '✅'
    };
  } else if (score <= 12) {
    return {
      level: 'medium',
      text: 'Средний уровень стратегической уязвимости ИТ',
      description: 'Есть несколько зон, требующих внимания. Рекомендую стратегическую сессию для приоритизации действий.',
      icon: '⚠️'
    };
  } else {
    return {
      level: 'high',
      text: 'Высокий уровень стратегической уязвимости ИТ',
      description: 'Критические риски требуют немедленного внимания. Рекомендую срочную стратегическую сессию.',
      icon: '🚨'
    };
  }
}

// === ПОКАЗ РЕЗУЛЬТАТОВ ===
function showResults() {
  const score = calculateScore();
  const risk = getRiskLevel(score);
  
  // Скрываем форму контактов, показываем результаты
  document.getElementById('checklist').style.display = 'none';
  document.getElementById('contact-form').style.display = 'none';
  document.getElementById('results').style.display = 'block';
  
  // Обновляем UI
  document.getElementById('progress-fill').style.width = '100%';
  document.getElementById('results-icon').textContent = risk.icon;
  document.getElementById('score-value').textContent = score;
  
  const levelEl = document.getElementById('level-text');
  levelEl.textContent = `Ваша диагностика показывает ${risk.text.toLowerCase()}.`;
  
  const levelContainer = document.querySelector('.results-level');
  levelContainer.className = 'results-level ' + risk.level + '-risk';
  
  // Формируем сводку ответов
  const summary = document.getElementById('answers-summary');
  summary.innerHTML = questions.map((q, i) => {
    const answer = answers[i];
    let answerText = '—';
    let answerClass = '';
    
    if (answer === 'yes') {
      answerText = '✓ Да';
      answerClass = 'yes';
    } else if (answer === 'partial') {
      answerText = '~ Частично';
      answerClass = 'partial';
    } else if (answer === 'no') {
      answerText = '✗ Нет';
      answerClass = 'no';
    }
    
    return `
      <div class="answer-item">
        <span class="answer-item-question">${i + 1}. ${q.text}</span>
        <span class="answer-item-result ${answerClass}">${answerText}</span>
      </div>
    `;
  }).join('');
  
  // Прокрутка к результатам
  document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
  
  // Отправка данных на бэкенд
  submitResults(score, risk);
  
  // Аналитика
  trackEvent('checklist_completed', {
    score: score,
    risk_level: risk.level
  });
}

// === ОТПРАВКА РЕЗУЛЬТАТОВ ===
async function submitResults(score, risk) {
  const payload = {
    contact: contactData,
    answers: questions.map((q, i) => ({
      question: q.text,
      answer: answers[i]
    })),
    score: score,
    risk_level: risk.level,
    timestamp: new Date().toISOString()
  };
  
  console.log('[Submit] Данные для отправки:', payload);
  
  // Сохраняем в localStorage как резерв
  localStorage.setItem('checklist_results', JSON.stringify(payload));
  
  // Отправка на PHP бэкенд
  try {
    const response = await fetch('/api/submit-checklist.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('[Submit] Данные успешно отправлены');
    } else {
      console.error('[Submit] Ошибка:', result.error);
    }
  } catch (error) {
    console.error('[Submit] Ошибка:', error);
  }
}

// === НАЧАТЬ ЗАНОВО ===
function restartChecklist() {
  // Очищаем состояние
  currentQuestionIndex = 0;
  answers = [];
  contactData = null;
  
  // Очищаем localStorage
  localStorage.removeItem('checklist_contact');
  localStorage.removeItem('checklist_results');
  
  // Очищаем форму
  document.getElementById('checklist-contact-form').reset();
  
  // Скрываем результаты и форму, показываем hero
  document.getElementById('results').style.display = 'none';
  document.getElementById('contact-form').style.display = 'none';
  document.getElementById('checklist').style.display = 'none';
  document.getElementById('hero').style.display = 'block';
  
  // Прокрутка к началу
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Аналитика
  trackEvent('checklist_restarted');
}

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', () => {
  // Обработчик формы на hero (старт диагностики)
  const startForm = document.getElementById('checklist-start-form');
  if (startForm) {
    startForm.addEventListener('submit', startChecklist);
  }
  
  // Обработчик формы контактов (после опроса)
  const contactForm = document.getElementById('checklist-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', submitContactAndShowResults);
  }
  
  // Восстановление данных из localStorage
  const savedContact = localStorage.getItem('checklist_contact');
  if (savedContact) {
    try {
      const data = JSON.parse(savedContact);
      // Заполняем обе формы (и на hero, и в контактах после опроса)
      const nameFields = document.querySelectorAll('#name');
      const companyFields = document.querySelectorAll('#company');
      const emailFields = document.querySelectorAll('#email');
      const phoneFields = document.querySelectorAll('#phone');
      
      nameFields.forEach(f => f.value = data.name || '');
      companyFields.forEach(f => f.value = data.company || '');
      emailFields.forEach(f => f.value = data.email || '');
      phoneFields.forEach(f => f.value = data.phone || '');
    } catch (e) {
      console.error('[Init] Ошибка восстановления данных:', e);
    }
  }
  
  console.log('[Init] Страница диагностики загружена');
});
