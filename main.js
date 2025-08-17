(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function setTheme(theme) {
    const root = document.documentElement;
    if (theme === 'light') root.classList.add('light'); else root.classList.remove('light');
    localStorage.setItem('writer_theme', theme);
    const btn = $('#themeToggle');
    if (btn) btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Theme
    const saved = localStorage.getItem('writer_theme');
    if (saved) setTheme(saved);
    const themeBtn = $('#themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const isLight = document.documentElement.classList.contains('light');
        setTheme(isLight ? 'dark' : 'light');
      });
    }

    // Prompt generator
    const promptPieces = {
      hooks: [
        'В обычный день герой замечает то, чего раньше не существовало',
        'Случайная ошибка запускает цепочку событий',
        'Послание из прошлого ломает планы',
        'Секретный союзник предлагает невозможное',
        'Катастрофа обнажает слабое место мира'
      ],
      conflicts: [
        'герою придётся выбирать между долгом и близкими',
        'каждый успех приближает к провалу друзей',
        'истина разрушит привычную жизнь',
        'цена победы — отказ от мечты',
        'время на исходе, а союзники не доверяют друг другу'
      ],
      twists: [
        'антагонист на самом деле пытается предотвратить большее зло',
        'герой — часть эксперимента',
        'прошлое переписано и кто-то это помнит',
        'наставник скрывает ключ к разгадке',
        'мир построен на лжи, но ложь спасает людей'
      ]
    };

    function randomOf(array) { return array[Math.floor(Math.random() * array.length)]; }

    const generatePromptBtn = $('#generatePrompt');
    const copyPromptBtn = $('#copyPrompt');
    const promptOutput = $('#promptOutput');
    if (generatePromptBtn && promptOutput) {
      generatePromptBtn.addEventListener('click', () => {
        const genre = $('#promptGenre').value;
        const tone = $('#promptTone').value;
        const setting = $('#promptSetting').value;
        const hook = randomOf(promptPieces.hooks);
        const conflict = randomOf(promptPieces.conflicts);
        const twist = randomOf(promptPieces.twists);
        const text = `Жанр: ${genre}. Тон: ${tone}. Сеттинг: ${setting}.
Завязка: ${hook}; конфликт: ${conflict}; поворот: ${twist}.`;
        promptOutput.textContent = text;
      });
    }
    if (copyPromptBtn && promptOutput) {
      copyPromptBtn.addEventListener('click', () => copyText(promptOutput.textContent));
    }

    // Logline builder
    const llOut = $('#loglineOutput');
    $('#buildLogline')?.addEventListener('click', () => {
      const hero = ($('#llHero').value || '').trim();
      const goal = ($('#llGoal').value || '').trim();
      const ant = ($('#llAntagonist').value || '').trim();
      const stakes = ($('#llStakes').value || '').trim();
      const uniq = ($('#llUnique').value || '').trim();
      const parts = [];
      if (hero) parts.push(hero);
      if (goal) parts.push(`должен(на) ${goal}`);
      if (ant) parts.push(`несмотря на противодействие: ${ant}`);
      if (stakes) parts.push(`иначе ${stakes}`);
      if (uniq) parts.push(`фишка: ${uniq}`);
      const sentence = parts.length ? parts.join(', ') + '.' : 'Заполните поля выше.';
      llOut.textContent = sentence;
    });
    $('#copyLogline')?.addEventListener('click', () => copyText(llOut.textContent));

    // Outline builder (3 acts)
    const outlineOut = $('#outlineOutput');
    $('#buildOutline')?.addEventListener('click', () => {
      const premise = ($('#outlinePremise').value || '').trim();
      if (!premise) {
        outlineOut.textContent = 'Сформулируйте премису одним предложением.';
        return;
      }
      const outline = `АКТ I — Завязка
1) Крючок: ${premise}
2) Инцидент: событие нарушает привычный порядок
3) Решение героя: принять вызов или отказаться
4) Переход в акт II: обратной дороги нет

АКТ II — Конфронтация
5) Новые правила мира, набор союзников/противников
6) Ложная победа, затем нарастание препятствий
7) Середина: поворот, меняющий ставки
8) Потери: самый тяжёлый удар
9) Точка отчаяния: герой почти сдаётся

АКТ III — Развязка
10) Сбор воли, план финальной попытки
11) Кульминация: конфликт в самой сути темы
12) Исход: последствия выбора героя, новое равновесие`;
      outlineOut.textContent = outline;
    });
    $('#copyOutline')?.addEventListener('click', () => copyText(outlineOut.textContent));

    // Analyzer
    $('#analyzeBtn')?.addEventListener('click', analyzeText);
    $('#clearAnalyze')?.addEventListener('click', () => {
      $('#analyzeInput').value = '';
      $('#analyzeStats').textContent = '';
      $('#analyzeTips').innerHTML = '';
      $('#weakWords').textContent = '';
    });

    function analyzeText() {
      const text = ($('#analyzeInput').value || '').trim();
      const statsEl = $('#analyzeStats');
      const tipsEl = $('#analyzeTips');
      const weakEl = $('#weakWords');
      const words = getWords(text);
      const sentences = splitSentences(text);
      const paragraphs = text ? text.split(/\n+/).filter(Boolean) : [];
      const avgSentenceLen = sentences.length ? (words.length / sentences.length) : 0;
      const longWords = words.filter((w) => w.length >= 7);
      statsEl.innerHTML = `Слов: ${words.length}\nПредложений: ${sentences.length}\nПараграфов: ${paragraphs.length}\nСредняя длина предложения: ${avgSentenceLen.toFixed(1)}\nДоля длинных слов (≥7): ${words.length ? Math.round((longWords.length / words.length) * 100) : 0}%`;

      const tips = [];
      if (avgSentenceLen > 22) tips.push('Разбейте длинные предложения для лучшей читаемости.');
      if (longWords.length / Math.max(1, words.length) > 0.25) tips.push('Снизьте долю тяжёлых слов: упростите формулировки.');
      if (/\b(были|является|осуществлять|производится|в рамках|в целях)\b/iu.test(text)) tips.push('Уберите канцелярит: «в рамках», «осуществлять», «является» и т. п.');
      if (/\b(очень|просто|немного|как бы|в общем|кажется)\b/iu.test(text)) tips.push('Замените слова-паразиты: «очень», «просто», «как бы», «кажется».');
      tipsEl.innerHTML = tips.map((t) => `<li>${escapeHtml(t)}</li>`).join('') || '<li>Текст выглядит аккуратно. Отличная работа!</li>';

      const weakList = ['очень','просто','кажется','как бы','в общем','немного','в целом','буквально','типа','реально','именно','собственно'];
      const found = countOccurrences(text, weakList);
      weakEl.innerHTML = Object.keys(found).length
        ? `<ul>${Object.entries(found).map(([w,c])=>`<li>«${escapeHtml(w)}»: ${c}</li>`).join('')}</ul>`
        : 'Подозрительных слов не найдено.';
    }

    // Pomodoro
    let timerId = null;
    let remainingSec = 25 * 60;
    const display = $('#timerDisplay');
    const minutesInput = $('#timerMinutes');

    function updateTimerDisplay() {
      const m = Math.floor(remainingSec / 60).toString().padStart(2, '0');
      const s = Math.floor(remainingSec % 60).toString().padStart(2, '0');
      display.textContent = `${m}:${s}`;
    }

    $('#timerStart')?.addEventListener('click', () => {
      if (timerId) return;
      timerId = setInterval(() => {
        remainingSec = Math.max(0, remainingSec - 1);
        updateTimerDisplay();
        if (remainingSec === 0) {
          clearInterval(timerId); timerId = null;
          if (typeof Notification !== 'undefined') {
            if (Notification.permission === 'granted') new Notification('Время истекло');
            else Notification.requestPermission();
          }
        }
      }, 1000);
    });
    $('#timerPause')?.addEventListener('click', () => { if (timerId) { clearInterval(timerId); timerId = null; } });
    $('#timerReset')?.addEventListener('click', () => {
      if (timerId) { clearInterval(timerId); timerId = null; }
      const mins = parseInt(minutesInput.value, 10) || 25;
      remainingSec = Math.min(120, Math.max(1, mins)) * 60;
      updateTimerDisplay();
    });
    minutesInput?.addEventListener('change', () => {
      const mins = parseInt(minutesInput.value, 10) || 25;
      remainingSec = Math.min(120, Math.max(1, mins)) * 60;
      updateTimerDisplay();
    });
    updateTimerDisplay();

    // Name generator
    const names = {
      ru: {
        first: ['Алексей','Мария','Иван','Екатерина','Никита','Дарья','Павел','Анна','Михаил','Ольга','Сергей','Наталья','Кирилл','Софья','Дмитрий','Полина','Фёдор','Вера','Ярослав','Алина'],
        last: ['Иванов','Петрова','Смирнов','Кузнецова','Васильев','Новикова','Соколов','Морозова','Волков','Егорова','Соловьёв','Романова','Виноградов','Фёдорова','Ковалёв','Лебедева']
      },
      en: {
        first: ['Alex','Maria','John','Kate','Nick','Daria','Paul','Anna','Michael','Olivia','Luke','Grace','Daniel','Sophie','Peter','Emma','Victor','Chloe','Ethan','Isabella'],
        last: ['Smith','Johnson','Brown','Taylor','Anderson','Harris','Clark','Lewis','Walker','Young','King','Wright','Hill','Scott','Green','Baker']
      },
      fantasy: {
        first: ['Аэрон','Лирия','Торн','Мэйрин','Кассил','Дракс','Элара','Феникс','Кайран','Нимра','Орон','Селеста','Гвейн','Илара','Роан','Таэль'],
        last: ['Шторморождённый','Тихолесье','Неборез','Серебряный Пепел','Камнесерд','Ветра Хранитель','Осколок Ночи','Златоклин','Лунный Шаг','Железный Корень']
      }
    };

    $('#generateNames')?.addEventListener('click', () => {
      const type = $('#nameType').value;
      const count = Math.min(50, Math.max(1, parseInt($('#nameCount').value, 10) || 10));
      const pool = names[type];
      const result = [];
      for (let i = 0; i < count; i++) {
        const first = randomOf(pool.first);
        const last = randomOf(pool.last);
        result.push(`${first} ${last}`);
      }
      $('#namesOutput').textContent = result.join('\n');
    });
    $('#copyNames')?.addEventListener('click', () => copyText($('#namesOutput').textContent));
  });

  // Helpers
  function copyText(text) {
    if (!text) return;
    navigator.clipboard?.writeText(text).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } finally { document.body.removeChild(ta); }
    });
  }

  function getWords(text) {
    const m = text.match(/[A-Za-zА-Яа-яЁё\-']+/g);
    return m ? m.map((w) => w.replace(/^[-']+|[-']+$/g, '')).filter(Boolean) : [];
  }

  function splitSentences(text) {
    const raw = text.split(/[.!?…]+\s+/g).map((s) => s.trim()).filter(Boolean);
    return raw;
  }

  function countOccurrences(text, words) {
    const map = {};
    words.forEach((w) => {
      const re = new RegExp(`(^|[^А-Яа-яA-Za-z])${escapeRegExp(w)}([^А-Яа-яA-Za-z]|$)`, 'giu');
      const matches = text.match(re);
      if (matches && matches.length) map[w] = matches.length;
    });
    return map;
  }

  function escapeHtml(s) { return s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
  function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
})();