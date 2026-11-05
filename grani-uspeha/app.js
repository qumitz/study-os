/**
 * ============================================================================
 * ДЕНЬ ПРОФМАСТЕРСТВА: ГРАНИ УСПЕХА (ОГРАНКА)
 * Интерактивное веб-приложение для мультиборда (4K / 1080p)
 * ДИНАМИЧЕСКИЙ 3D ПРОЦЕСС ОГРАНКИ: РЕАЛЬНЫЕ 3D ИНСТРУМЕНТЫ И ПОЭТАПНЫЙ РАСКОЛ КАМНЯ!
 * ============================================================================
 */

let SPLINE_SCENE_URL = "";

/* ----------------------------------------------------------------------------
 * ДАННЫЕ СЦЕНАРИЯ И 6 ФАЗ ОГРАНКИ
 * ---------------------------------------------------------------------------- */
const PHASES_DATA = [
  {
    id: 0,
    name: "ПРОЛОГ",
    tool: "СЫРОЙ МОНОЛИТ",
    heading: "Необработанный камень",
    philosophy: "Сырой минерал | Исходный потенциал",
    quote: "Вот он. Лежит. Думает, что он просто камень. А он — алмаз. Только не знает об этом.",
    hint: "Нажмите «УДАР ИНСТРУМЕНТОМ» или коснитесь экрана, чтобы нанести первый удар молотом",
    ambientColor: "#1e1b4b",
    lightColor: "#818cf8",
    numbers: [],
    dialogue: [
      { speaker: "Мастер", text: "Вот он. Лежит. Думает, что он просто камень. (Пауза.) А он — алмаз. Только не знает об этом." },
      { speaker: "Подмастерье", text: "Я готов! Я всё умею! Я всё могу! Где камень? Ого! Какой большой! И тяжёлый! И... необработанный!" },
      { speaker: "Мастер", text: "Не трогай. Он ещё не готов. Когда пройдёт через пять граней — каждая грань это инструмент, каждый инструмент это урок." },
      { speaker: "Голос", text: "И началась огранка. Пять граней. Пять инструментов. Пять уроков." }
    ]
  },
  {
    id: 1,
    name: "ГРАНЬ 1",
    tool: "МОЛОТОК",
    heading: "Грань 1: Знакомство",
    philosophy: "Разбиваем страх • Рождение первых плоскостей",
    quote: "Первый инструмент — молоток. Им не гранят. Им разбивают страх.",
    hint: "Смотрите: 3D-молоток с размаха раскалывает корку породы, откалывая куски камня!",
    ambientColor: "#2e1065",
    lightColor: "#c084fc",
    numbers: [
      { id: 1, num: "Номер 1", title: "Гитара «Румба»", type: "Инструментальная композиция", light: "Тёплый жёлтый", lightColor: "#facc15", desc: "Первокурсники постепенно оживают под ритмы румбы. Первая грань открыта." },
      { id: 2, num: "Номер 2", title: "Визитка отделения «АВТО»", type: "Визитка группы", light: "Яркий белый, вспышки", lightColor: "#ffffff", desc: "Будущие автомобилисты заявляют о себе громко, мощно и слаженно." },
      { id: 3, num: "Номер 3", title: "Выставка-презентация «Моделирование»", type: "Выставка проектов", light: "Мягкий тёплый", lightColor: "#fed7aa", desc: "Первые реальные осязаемые плоды труда студентов первого курса." }
    ],
    dialogue: [
      { speaker: "Мастер", text: "Первый инструмент — молоток. Им не гранят. Им разбивают. Но иногда, чтобы что-то создать, нужно сначала разбить старое. Например, страх." },
      { speaker: "Голос", text: "Молоток разбил страх. И появилась первая грань — знакомство." },
      { speaker: "Подмастерье", text: "Получилось! Я разбил страх!" },
      { speaker: "Мастер", text: "Ты разбил молоток. Но это тоже результат. Вы пришли. Вы уже камни, которые что-то умеют." }
    ]
  },
  {
    id: 2,
    name: "ГРАНЬ 2",
    tool: "НАПИЛЬНИК",
    heading: "Грань 2: Профессия",
    philosophy: "Отсекаем лишнее • Лень, сомнения, неуверенность",
    quote: "Напильник честный. Он не делает красиво сразу. Он делает правильно.",
    hint: "3D-напильник стесывает неровности и ребра, высекая потоки искр!",
    ambientColor: "#083344",
    lightColor: "#38bdf8",
    numbers: [
      { id: 4, num: "Номер 4", title: "Саксофон «Малиновка»", type: "Инструментальная композиция", light: "Синий, холодный", lightColor: "#60a5fa", desc: "Лирическая мелодия саксофона раскрывает глубину и осознанность пути." },
      { id: 5, num: "Номер 5", title: "Баян «Полифония»", type: "Инструментальная композиция", light: "Яркий тёплый", lightColor: "#fbbf24", desc: "Многоголосая мощь народной традиции и профессионального исполнительства." },
      { id: 6, num: "Номер 6", title: "Стихотворение «Белорусская женщина»", type: "Литературное чтение", light: "Мягкий тёплый", lightColor: "#fde68a", desc: "Связь с корнями, образ матери и верность своему призванию." }
    ],
    dialogue: [
      { speaker: "Мастер", text: "Второй инструмент — напильник. Им снимают лишнее. В профессии тоже так: нужно отсечь всё, что мешает. Лень, сомнения, страх." },
      { speaker: "Подмастерье", text: "Он какой-то... шершавый." },
      { speaker: "Мастер", text: "Он честный. Он не делает красиво. Он делает правильно. Напильник не терпит суеты, он любит терпение." },
      { speaker: "Голос", text: "Напильник снял лишнее. И появилась вторая грань — профессия." }
    ]
  },
  {
    id: 3,
    name: "ГРАНЬ 3",
    tool: "ШЛИФОВКА",
    heading: "Грань 3: Творчество",
    philosophy: "Терпение и индивидуальность • Дисперсия таланта",
    quote: "Творчество — это не всегда фейерверк. Иногда это кропотливая работа.",
    hint: "Шлифовальный диск полирует поверхность камня до чистейшей зеркальной прозрачности",
    ambientColor: "#3b0764",
    lightColor: "#e879f9",
    numbers: [
      { id: 7, num: "Номер 7", title: "Песня «Тысячи дорог»", type: "Вокальное исполнение", light: "Яркий цветной", lightColor: "#ec4899", desc: "Жизнеутверждающий гимн поиску своего призвания и смелости идти вперед." },
      { id: 8, num: "Номер 8", title: "Танец «Цвет твоих мыслей»", type: "Хореографическая постановка", light: "Цветной, меняющийся", lightColor: "#a855f7", desc: "Современная пластика, отражающая спектр эмоций и рождение идей." },
      { id: 9, num: "Номер 9", title: "Выставка творческих работ", type: "Презентация изделий", light: "Мягкий тёплый", lightColor: "#fef08a", desc: "Материальное воплощение фантазии: графика, керамика, дизайн." }
    ],
    dialogue: [
      { speaker: "Мастер", text: "Третий инструмент — шлифовка. Она делает камень гладким. Творчество — это не всегда фейерверк. Иногда это кропотливая работа." },
      { speaker: "Подмастерье", text: "Это же скучно! Тереть и тереть!" },
      { speaker: "Мастер", text: "Шлифовка может всё. Даже из камня сделать звезду. Люди могут всё, если их отшлифовать и если они сами захотят." },
      { speaker: "Голос", text: "Шлифовка сделала камень гладким. И появилась третья грань — творчество." }
    ]
  },
  {
    id: 4,
    name: "ГРАНЬ 4",
    tool: "ЛУПА",
    heading: "Грань 4: Дружба",
    philosophy: "Увидеть суть и единство • Сила студенческого братства",
    quote: "Это не трещинки. Это грани. Каждая трещинка — чья-то история.",
    hint: "Большая лупа приближается к граням, открывая скрытые сокровища студенческой жизни",
    ambientColor: "#022c22",
    lightColor: "#2dd4bf",
    numbers: [
      { id: 10, num: "Номер 10", title: "Визитка дошкольного отделения (ДО)", type: "Визитка группы", light: "Яркий тёплый", lightColor: "#fde047", desc: "Сердечное тепло, педагогическое вдохновение и любовь к детям." },
      { id: 11, num: "Номер 11", title: "Песня «Рэчанька»", type: "Вокальное исполнение", light: "Тёплый мягкий", lightColor: "#6ee7b7", desc: "Проникновенный народный вокал, объединяющий поколения в один круг." },
      { id: 12, num: "Номер 12", title: "Танец «Номер 1»", type: "Синтез искусств", light: "Яркий динамичный", lightColor: "#38bdf8", desc: "Синтез людей, синтез музыки, хореографии и вокала в едином ритме." }
    ],
    dialogue: [
      { speaker: "Мастер", text: "Четвёртый инструмент — лупа. Она помогает увидеть то, что не видно сразу. В людях тоже так: нужно всмотреться, чтобы увидеть главное." },
      { speaker: "Подмастерье", text: "Я вижу... трещинки." },
      { speaker: "Мастер", text: "Это не трещинки. Это грани. Каждая трещинка — это чья-то история. Чья-то дружба. Лупа показывает то, что есть." },
      { speaker: "Подмастерье", text: "Я понял: когда вместе — не страшно и не скучно!" }
    ]
  },
  {
    id: 5,
    name: "ГРАНЬ 5",
    tool: "РУКА МАСТЕРА",
    heading: "Грань 5: Успех и Финал",
    philosophy: "Творец своего будущего • Каждый студент — алмаз!",
    quote: "Пятый инструмент — это ты сам. Твои руки, твоя голова, твоё сердце.",
    hint: "Золотая рука мастера завершает огранку: остался чистый сверкающий бриллиант!",
    ambientColor: "#451a03",
    lightColor: "#fbbf24",
    numbers: [
      { id: 13, num: "Номер 13", title: "Театральная миниатюра «Строим город»", type: "Театральная миниатюра", light: "Яркий праздничный", lightColor: "#fbbf24", desc: "Город мечты, возведенный на сцене совместным упорством и единством." },
      { id: 14, num: "Номер 14", title: "Чтение «Людей не интересных в мире нет»", type: "Литературное чтение", light: "Мягкий тёплый", lightColor: "#fef08a", desc: "Манифест уникальности каждой личности и каждого будущего мастера." },
      { id: 15, num: "Номер 15", title: "Визитка «Строитель»", type: "Визитка группы", light: "Яркий праздничный", lightColor: "#ffffff", desc: "Строитель своей жизни, своей страны и своего профессионального успеха." },
      { id: 16, num: "Слово", title: "Слово директора колледжа", type: "Официальное обращение", light: "Торжественный белый", lightColor: "#ffffff", desc: "«Вы — не просто камни. Вы — будущие мастера. Вы — алмазы!»" },
      { id: 17, num: "Церемония", title: "Торжественное награждение", type: "Дипломы и благодарности", light: "Золотой триумф", lightColor: "#f59e0b", desc: "Вручение дипломов студентам, благодарностей педагогам и партнёрам." }
    ],
    dialogue: [
      { speaker: "Подмастерье", text: "А где инструмент на пятом столе? Тут пусто!" },
      { speaker: "Мастер", text: "Вот он. (Поднимает руку). Рука мастера. Пятый инструмент — это ты сам. Твои руки, твоя голова, твоё сердце." },
      { speaker: "Подмастерье", text: "Я? Но я же... пока не мастер!" },
      { speaker: "Мастер", text: "Пока нет. Но ты прошёл четыре грани. Осталась пятая — стать мастером. Алмаз стал бриллиантом!" },
      { speaker: "Голос", text: "Алмаз не знает, что он алмаз. Пока его не огранят. Но теперь — знает. И сияет!" }
    ]
  }
];

/* ----------------------------------------------------------------------------
 * ЗВУКОВОЙ ДВИЖОК (WEB AUDIO API)
 * ---------------------------------------------------------------------------- */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem("grani_muted") === "true";
    this.volume = 0.85;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem("grani_muted", this.isMuted);
    return this.isMuted;
  }

  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(350, t + 0.04);
    gain.gain.setValueAtTime(0.3 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.045);
  }

  playHammer() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(140, t);
    subOsc.frequency.exponentialRampToValueAtTime(22, t + 0.45);
    subGain.gain.setValueAtTime(0.95 * this.volume, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.46);

    const clang = this.ctx.createOscillator();
    const clangGain = this.ctx.createGain();
    clang.type = "triangle";
    clang.frequency.setValueAtTime(780, t);
    clang.frequency.exponentialRampToValueAtTime(220, t + 0.2);
    clangGain.gain.setValueAtTime(0.5 * this.volume, t);
    clangGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    clang.connect(clangGain);
    clangGain.connect(this.ctx.destination);
    clang.start(t);
    clang.stop(t + 0.21);

    this.playNoiseCrack(t, 0.35, 0.5);
  }

  playFile() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.linearRampToValueAtTime(170, t + 0.3);
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2400, t);
    filter.Q.value = 5.0;
    gain.gain.setValueAtTime(0.4 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.31);
    this.playNoiseCrack(t, 0.35, 0.3);
  }

  playPolish() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.5];
    chords.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);
      gain.gain.setValueAtTime(0.001, t + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.3 * this.volume, t + idx * 0.05 + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.95);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.96);
    });
  }

  playMagnifier() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.6);
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.42 * this.volume, t + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.72);
  }

  playDiamond() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880, 1174.66, 1479.98, 1760];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t + i * 0.07);
      gain.gain.setValueAtTime(0.001, t + i * 0.07);
      gain.gain.linearRampToValueAtTime(0.35 * this.volume, t + i * 0.07 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 1.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 1.45);
    });
  }

  playWhoosh() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(580, t + 0.35);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(220, t);
    filter.frequency.linearRampToValueAtTime(2500, t + 0.35);
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.4 * this.volume, t + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.42);
  }

  playNoiseCrack(t, duration, amp) {
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1400, t);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(amp * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + duration);
  }
}

/* ----------------------------------------------------------------------------
 * 2D ЭФФЕКТЫ (УДАРНЫЕ ВОЛНЫ, ИСКРЫ, САЛЮТ)
 * ---------------------------------------------------------------------------- */
class EffectsLayer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.shockwaves = [];
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  spawnShockwave(x, y, color = "#38bdf8", maxR = 280) {
    this.shockwaves.push({
      x: x || window.innerWidth / 2,
      y: y || window.innerHeight / 2,
      r: 10,
      maxR: maxR,
      color: color,
      alpha: 1,
      speed: 15
    });
  }

  spawnSparks(x, y, count = 35, colors = ["#38bdf8", "#c084fc", "#ffffff"]) {
    const cx = x || window.innerWidth / 2;
    const cy = y || window.innerHeight / 2;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 9;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0.94 + Math.random() * 0.04,
        gravity: 0.16
      });
    }
  }

  spawnCrustChunks(x, y, count = 30) {
    const cx = x || window.innerWidth / 2;
    const cy = y || window.innerHeight / 2;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 12;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 6 + Math.random() * 10,
        color: Math.random() > 0.4 ? "#334155" : "#a855f7",
        alpha: 1,
        life: 0.92,
        gravity: 0.28,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.3
      });
    }
  }

  spawnConfetti(count = 90) {
    const colors = ["#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#fef08a", "#ffffff"];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 450,
        y: window.innerHeight * 0.5 + (Math.random() - 0.5) * 200,
        vx: (Math.random() - 0.5) * 18,
        vy: -5 - Math.random() * 14,
        size: 7 + Math.random() * 9,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0.97,
        gravity: 0.22,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.35
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.r += sw.speed;
      sw.alpha = 1 - sw.r / sw.maxR;
      if (sw.alpha <= 0 || sw.r >= sw.maxR) {
        this.shockwaves.splice(i, 1);
        continue;
      }
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      this.ctx.strokeStyle = sw.color;
      this.ctx.globalAlpha = sw.alpha;
      this.ctx.lineWidth = Math.max(1, 4 * sw.alpha);
      this.ctx.shadowColor = sw.color;
      this.ctx.shadowBlur = 18;
      this.ctx.stroke();
      this.ctx.restore();
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha *= p.life;
      if (p.rotation !== undefined) p.rotation += p.vRot;
      if (p.alpha <= 0.01) {
        this.particles.splice(i, 1);
        continue;
      }
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 10;
      if (p.rotation !== undefined) {
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }
    requestAnimationFrame(() => this.animate());
  }
}

/* ----------------------------------------------------------------------------
 * 3D ДВИЖОК ОГРАНКИ: ЕДИНЫЙ КАМЕНЬ С РАСКАЛЫВАЮЩИМИСЯ ЧАСТЯМИ И 3D-ИНСТРУМЕНТАМИ
 * ---------------------------------------------------------------------------- */
class GemEngine3D {
  constructor(canvas, onStrike) {
    this.canvas = canvas;
    this.onStrike = onStrike;
    this.currentPhase = 0;
    this.targetRotation = { x: 0.25, y: 0 };
    this.rotationVelocity = { x: 0, y: 0.006 };
    this.isDragging = false;
    this.lastPointer = { x: 0, y: 0 };
    this.isThreeActive = false;

    // Составные кусочки внешней породы (Crust Chunks)
    this.crustChunks = [];

    // Анимации инструментов
    this.isHammerSwinging = false;
    this.hammerProgress = 0;
    this.hammerImpactTriggered = false;
    this.onHammerImpact = null;
    this.rockImpactOffset = { x: 0, y: 0 };
    this.isFileGrinding = false;
    this.fileTimer = 0;
    this.isPolishing = false;
    this.polishAngle = 0;

    this.init();
  }

  init() {
    if (window.THREE) {
      this.initThree();
    } else {
      console.warn("Three.js оффлайн, используется fallback");
    }
    this.setupInteractions();
  }

  initThree() {
    this.isThreeActive = true;
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 6.2);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;

    this.generateProceduralEnvMap();

    // Главная группа камня
    this.rockCoreGroup = new THREE.Group();
    this.scene.add(this.rockCoreGroup);

    // Освещение
    this.ambientLight = new THREE.AmbientLight(0x2e1065, 1.4);
    this.scene.add(this.ambientLight);

    this.dirLight1 = new THREE.DirectionalLight(0xc084fc, 2.8);
    this.dirLight1.position.set(6, 9, 6);
    this.scene.add(this.dirLight1);

    this.dirLight2 = new THREE.DirectionalLight(0x38bdf8, 2.2);
    this.dirLight2.position.set(-7, -5, -4);
    this.scene.add(this.dirLight2);

    this.dirLightFront = new THREE.DirectionalLight(0xffffff, 2.0);
    this.dirLightFront.position.set(0, 2, 8);
    this.scene.add(this.dirLightFront);

    this.innerLight = new THREE.PointLight(0xa855f7, 3.5, 12);
    this.rockCoreGroup.add(this.innerLight);

    // 1. Создаем ВНУТРЕННЕЕ ЯДРО АЛМАЗА (оно постепенно обнажается)
    this.createInnerDiamond();

    // 2. Создаем ВНЕШНЮЮ ОБОЛОЧКУ ИЗ 24 СОСТАВНЫХ ЧАСТЕЙ (они откалываются)
    this.createFracturedCrust();

    // 3. Создаем 3D-ИНСТРУМЕНТЫ (Молоток, Напильник, Шлифовальный диск, Лупа, Рука)
    this.create3DTools();

    // 4. Спецэффекты (God rays, золотое кольцо)
    this.createSpecialFX();

    this.animateThree();

    window.addEventListener("resize", () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  generateProceduralEnvMap() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#1e1b4b");
    grad.addColorStop(0.5, "#090d16");
    grad.addColorStop(1, "#020617");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    const drawSoftbox = (x, y, w, h, color) => {
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 30;
      ctx.fillRect(x, y, w, h);
    };

    drawSoftbox(40, 30, 90, 180, "#c084fc");
    drawSoftbox(220, 20, 120, 140, "#ffffff");
    drawSoftbox(380, 50, 90, 160, "#38bdf8");

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.environment = texture;
  }

  createInnerDiamond() {
    // Внутренний классический 58-гранный бриллиант
    this.diamondGroup = new THREE.Group();

    const crownGeo = new THREE.CylinderGeometry(1.25, 2.1, 0.75, 16);
    const pavilionGeo = new THREE.ConeGeometry(2.1, 1.9, 16);
    pavilionGeo.rotateX(Math.PI);
    pavilionGeo.translate(0, -1.32, 0);

    // Материал алмаза с высокой прозрачностью и преломлением (IOR 2.42)
    this.diamondMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.15,
      transmission: 0.95,
      roughness: 0.02,
      ior: 2.42,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      flatShading: true
    });

    // Светящиеся ребра чертежа (для фазы напильника)
    this.wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0
    });

    this.diamondCrown = new THREE.Mesh(crownGeo, this.diamondMat);
    this.diamondPavilion = new THREE.Mesh(pavilionGeo, this.diamondMat);
    this.diamondWireCrown = new THREE.Mesh(crownGeo, this.wireframeMat);
    this.diamondWirePavilion = new THREE.Mesh(pavilionGeo, this.wireframeMat);

    this.diamondGroup.add(this.diamondCrown);
    this.diamondGroup.add(this.diamondPavilion);
    this.diamondGroup.add(this.diamondWireCrown);
    this.diamondGroup.add(this.diamondWirePavilion);

    this.rockCoreGroup.add(this.diamondGroup);
  }

  createFracturedCrust() {
    // Создаем 24 составных кусочка внешней породы камня
    this.crustGroup = new THREE.Group();
    this.rockCoreGroup.add(this.crustGroup);

    const basaltMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.94,
      metalness: 0.12,
      flatShading: true
    });

    const crackMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      emissive: 0x9333ea,
      emissiveIntensity: 0.8,
      roughness: 0.6,
      flatShading: true
    });

    // 8 верхних кусков (шапка породы), 8 средних кусков (пояс), 8 нижних кусков
    const count = 24;
    for (let i = 0; i < count; i++) {
      const angle = (i % 8) / 8 * Math.PI * 2;
      const layer = Math.floor(i / 8); // 0: верх, 1: центр, 2: низ
      let y = 0.5 - layer * 0.6;
      let r = layer === 1 ? 2.3 : 1.7;

      // Геометрия кусочка породы со скошенными неровными краями
      const chunkGeo = new THREE.DodecahedronGeometry(0.55 + Math.random() * 0.15, 0);
      const chunkMesh = new THREE.Mesh(chunkGeo, basaltMat.clone());

      const posX = Math.cos(angle) * r;
      const posZ = Math.sin(angle) * r;
      chunkMesh.position.set(posX, y, posZ);
      chunkMesh.rotation.set(Math.random(), Math.random(), Math.random());

      // Сохраняем метаданные кусочка
      const chunkData = {
        mesh: chunkMesh,
        originPos: new THREE.Vector3(posX, y, posZ),
        originRot: chunkMesh.rotation.clone(),
        // Направление отлета при ударе
        flyDir: new THREE.Vector3(posX, y, posZ).normalize(),
        isDetached: false,
        detachedTime: 0,
        // В какой фазе этот кусочек должен отколоться:
        // Фаза 1 (Молоток): откалываются 8 кусков (0..7)
        // Фаза 2 (Напильник): стесываются еще 8 кусков (8..15)
        // Фаза 3 (Шлифовка): шлифуются последние 8 кусков (16..23)
        removeAtPhase: layer === 0 ? 1 : (layer === 1 ? 2 : 3)
      };

      this.crustChunks.push(chunkData);
      this.crustGroup.add(chunkMesh);
    }
  }

  create3DTools() {
    this.toolsContainer = new THREE.Group();
    this.scene.add(this.toolsContainer);

    // ------------------------------------------------------------------------
    // 1. 3D МОЛОТОК (HAMMER) — ДЕТАЛИЗИРОВАННЫЙ МОЛОТ КАМЕНОТЁСА / ОГРАНЩИКА
    // ------------------------------------------------------------------------
    this.toolHammer = new THREE.Group();

    // Рукоять из тёмного ореха (крепкая, с небольшим сужением к оголовью)
    const handleGeo = new THREE.CylinderGeometry(0.075, 0.095, 2.6, 16);
    const handleMat = new THREE.MeshStandardMaterial({ 
      color: 0x854d0e, 
      roughness: 0.55, 
      metalness: 0.05 
    });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = 1.1; // центр рукояти между y = -0.2 и y = 2.4

    // Кожаная обмотка в зоне хвата мастера
    const gripGeo = new THREE.CylinderGeometry(0.102, 0.106, 1.0, 16);
    const gripMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      roughness: 0.85, 
      metalness: 0.0 
    });
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.position.y = 0.4;
    this.toolHammer.add(grip);

    // Фактурные кольца рельефа обмотки
    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.TorusGeometry(0.104, 0.012, 8, 20);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.05 + i * 0.25;
      this.toolHammer.add(ring);
    }

    // Стальное навершие на пятке рукояти
    const metalMat = new THREE.MeshStandardMaterial({ 
      color: 0x94a3b8, 
      metalness: 0.92, 
      roughness: 0.22 
    });
    const pommelGeo = new THREE.CylinderGeometry(0.11, 0.12, 0.16, 16);
    const pommel = new THREE.Mesh(pommelGeo, metalMat);
    pommel.position.y = -0.22;
    this.toolHammer.add(pommel);

    // Латунная муфта у основания бойка
    const collarGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.18, 16);
    const brassMat = new THREE.MeshStandardMaterial({ 
      color: 0xd97706, 
      metalness: 0.88, 
      roughness: 0.25 
    });
    const collar = new THREE.Mesh(collarGeo, brassMat);
    collar.position.y = 2.28;
    this.toolHammer.add(collar);

    // Центральный массивный блок бойка (проушина)
    const headBlockGeo = new THREE.BoxGeometry(0.65, 0.60, 0.65);
    const headBlock = new THREE.Mesh(headBlockGeo, metalMat);
    headBlock.position.y = 2.50;
    this.toolHammer.add(headBlock);

    // Ударный массивный боёк (направлен влево, в сторону камня: -X)
    const faceGeo = new THREE.CylinderGeometry(0.28, 0.34, 0.55, 12);
    const faceMesh = new THREE.Mesh(faceGeo, metalMat);
    faceMesh.rotation.z = Math.PI / 2;
    faceMesh.position.set(-0.52, 2.50, 0);
    this.toolHammer.add(faceMesh);

    // Закаленная ударная площадка (зеркальный полированный торец)
    const strikeCapGeo = new THREE.CylinderGeometry(0.27, 0.28, 0.10, 12);
    const strikeCapMat = new THREE.MeshStandardMaterial({ 
      color: 0xcfd8dc, 
      metalness: 0.96, 
      roughness: 0.12 
    });
    const strikeCap = new THREE.Mesh(strikeCapGeo, strikeCapMat);
    strikeCap.rotation.z = Math.PI / 2;
    strikeCap.position.set(-0.82, 2.50, 0);
    this.toolHammer.add(strikeCap);

    // Заострённый клиновидный зубец для точных сколов (направлен вправо: +X)
    const pickGeo = new THREE.ConeGeometry(0.28, 0.70, 8);
    const pickMesh = new THREE.Mesh(pickGeo, metalMat);
    pickMesh.rotation.z = -Math.PI / 2;
    pickMesh.position.set(0.65, 2.50, 0);
    this.toolHammer.add(pickMesh);

    // Выступающий деревянный клин на макушке бойка
    const wedgeGeo = new THREE.CylinderGeometry(0.065, 0.07, 0.12, 12);
    const wedge = new THREE.Mesh(wedgeGeo, handleMat);
    wedge.position.y = 2.82;
    this.toolHammer.add(wedge);

    this.toolHammer.add(handle);

    // Начальная позиция и наклон молотка (справа от камня наготове)
    this.toolHammer.position.set(2.80, 0.50, 0.80);
    this.toolHammer.rotation.set(0.10, -0.15, 0.40);
    this.toolHammer.visible = false;
    this.toolsContainer.add(this.toolHammer);

    // ------------------------------------------------------------------------
    // 2. 3D НАПИЛЬНИК (FILE / RASP)
    // ------------------------------------------------------------------------
    this.toolFile = new THREE.Group();
    const fileBladeGeo = new THREE.BoxGeometry(0.2, 0.1, 3.0);
    const fileBladeMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.9,
      roughness: 0.3
    });
    const fileBlade = new THREE.Mesh(fileBladeGeo, fileBladeMat);

    const fileHandleGeo = new THREE.CylinderGeometry(0.12, 0.1, 1.1, 10);
    const fileHandleMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
    const fileHandle = new THREE.Mesh(fileHandleGeo, fileHandleMat);
    fileHandle.position.z = -1.8;
    fileHandle.rotation.x = Math.PI / 2;

    this.toolFile.add(fileBlade);
    this.toolFile.add(fileHandle);
    this.toolFile.position.set(1.9, 0.6, 1.2);
    this.toolFile.rotation.set(0.3, 0.5, 0.4);
    this.toolFile.visible = false;
    this.toolsContainer.add(this.toolFile);

    // ------------------------------------------------------------------------
    // 3. 3D ШЛИФОВАЛЬНЫЙ БРУСОК (POLISHER)
    // ------------------------------------------------------------------------
    this.toolPolish = new THREE.Group();
    const polishPadGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 24);
    const polishPadMat = new THREE.MeshStandardMaterial({
      color: 0xe879f9,
      emissive: 0xa855f7,
      emissiveIntensity: 0.4,
      roughness: 0.3
    });
    const polishPad = new THREE.Mesh(polishPadGeo, polishPadMat);
    this.toolPolish.add(polishPad);
    this.toolPolish.position.set(1.8, 0.8, 1.4);
    this.toolPolish.rotation.x = Math.PI / 3;
    this.toolPolish.visible = false;
    this.toolsContainer.add(this.toolPolish);

    // ------------------------------------------------------------------------
    // 4. 3D ЛУПА (MAGNIFYING GLASS)
    // ------------------------------------------------------------------------
    this.toolLoupe = new THREE.Group();
    const rimGeo = new THREE.TorusGeometry(1.2, 0.08, 16, 40);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x2dd4bf, metalness: 0.9, roughness: 0.2 });
    const rim = new THREE.Mesh(rimGeo, rimMat);

    const lensGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.04, 32);
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.98,
      roughness: 0.02,
      ior: 1.52,
      transparent: true,
      opacity: 0.8
    });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.rotation.x = Math.PI / 2;

    const loupeHandleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.8, 12);
    const loupeHandle = new THREE.Mesh(loupeHandleGeo, rimMat);
    loupeHandle.position.y = -1.9;

    this.toolLoupe.add(rim);
    this.toolLoupe.add(lens);
    this.toolLoupe.add(loupeHandle);
    this.toolLoupe.position.set(0, 0, 3.2);
    this.toolLoupe.visible = false;
    this.toolsContainer.add(this.toolLoupe);

    // ------------------------------------------------------------------------
    // 5. 3D РУКА МАСТЕРА (MASTER'S HAND)
    // ------------------------------------------------------------------------
    this.toolHand = new THREE.Group();
    // Стилизованная золотая кисть мастера (сочленения пальцев)
    const palmGeo = new THREE.BoxGeometry(0.9, 0.2, 1.1);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.3
    });
    const palm = new THREE.Mesh(palmGeo, goldMat);
    this.toolHand.add(palm);

    for (let f = 0; f < 4; f++) {
      const fingerGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.9, 8);
      const finger = new THREE.Mesh(fingerGeo, goldMat);
      finger.position.set(-0.35 + f * 0.24, -0.05, 0.85);
      finger.rotation.x = Math.PI / 4;
      this.toolHand.add(finger);
    }
    this.toolHand.position.set(0.6, 2.2, 1.2);
    this.toolHand.rotation.set(-0.4, 0.2, -0.3);
    this.toolHand.visible = false;
    this.toolsContainer.add(this.toolHand);
  }

  createSpecialFX() {
    // Лучи света финала (God Rays)
    const rayGroup = new THREE.Group();
    const rayCount = 16;
    for (let i = 0; i < rayCount; i++) {
      const planeGeo = new THREE.PlaneGeometry(0.4, 14);
      const planeMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.14,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const ray = new THREE.Mesh(planeGeo, planeMat);
      ray.rotation.z = (i / rayCount) * Math.PI * 2;
      ray.position.z = -1.4;
      rayGroup.add(ray);
    }
    this.godRays = rayGroup;
    this.godRays.visible = false;
    this.scene.add(this.godRays);

    // Золотой нимб вокруг бриллианта
    const ringGeo = new THREE.TorusGeometry(2.6, 0.03, 16, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.6,
      metalness: 0.9,
      roughness: 0.2
    });
    this.laurelRing = new THREE.Mesh(ringGeo, ringMat);
    this.laurelRing.rotation.x = Math.PI / 2.5;
    this.laurelRing.visible = false;
    this.rockCoreGroup.add(this.laurelRing);
  }

  // Переключение фазы и обновление видимости кусков породы
  setPhase(phaseIndex) {
    this.currentPhase = phaseIndex;
    if (!this.isThreeActive) return;

    // 1. Показываем нужный 3D-инструмент
    this.toolHammer.visible = phaseIndex === 0 || phaseIndex === 1;
    this.toolFile.visible = phaseIndex === 2;
    this.toolPolish.visible = phaseIndex === 3;
    this.toolLoupe.visible = phaseIndex === 4;
    this.toolHand.visible = phaseIndex === 5;

    // 2. Управляем отколом составных частей камня:
    // Фаза 0: Все 24 куска плотно прижаты (полный булыжник)
    // Фаза 1: 8 кусков откололись и улетели
    // Фаза 2: еще 8 кусков стесались (осталось 8)
    // Фаза 3: стесались последние 8 кусков (камень полностью открыт)
    // Фазы 4, 5: кусков породы больше нет, бриллиант сияет
    this.crustChunks.forEach((chunk) => {
      if (chunk.removeAtPhase <= phaseIndex) {
        chunk.isDetached = true;
      } else {
        chunk.isDetached = false;
        // Возвращаем на место, если вернулись назад
        chunk.mesh.position.copy(chunk.originPos);
        chunk.mesh.rotation.copy(chunk.originRot);
        chunk.mesh.visible = true;
      }
    });

    // 3. Состояние самого кристалла внутри
    if (phaseIndex === 0) {
      // Алмаз спрятан под кусками породы
      this.diamondMat.opacity = 0.2;
      this.diamondMat.roughness = 0.8;
      this.diamondCrown.scale.set(0.9, 0.9, 0.9);
      this.diamondPavilion.scale.set(0.9, 0.9, 0.9);
      this.wireframeMat.opacity = 0;
    } else if (phaseIndex === 1) {
      // Обнажились первые плоскости
      this.diamondMat.opacity = 0.6;
      this.diamondMat.roughness = 0.4;
      this.wireframeMat.opacity = 0.2;
    } else if (phaseIndex === 2) {
      // Включается чертежная сетка напильника (Blueprint)
      this.diamondMat.opacity = 0.85;
      this.diamondMat.roughness = 0.15;
      this.wireframeMat.opacity = 0.85;
    } else if (phaseIndex === 3) {
      // Идеально гладкий, сетка исчезает, включается дисперсия
      this.diamondMat.opacity = 1.0;
      this.diamondMat.roughness = 0.02;
      this.wireframeMat.opacity = 0;
      this.diamondCrown.scale.set(1.0, 1.0, 1.0);
      this.diamondPavilion.scale.set(1.0, 1.0, 1.0);
    }

    if (this.godRays) this.godRays.visible = phaseIndex === 5;
    if (this.laurelRing) this.laurelRing.visible = phaseIndex === 5;

    // Зум камеры
    if (phaseIndex === 4) {
      this.targetCameraZ = 2.8;
      this.innerLight.color.setHex(0x2dd4bf);
    } else if (phaseIndex === 5) {
      this.targetCameraZ = 6.0;
      this.innerLight.color.setHex(0xf59e0b);
    } else {
      this.targetCameraZ = 6.2;
      this.innerLight.color.setHex(0xa855f7);
    }

    // Запускаем действие текущего инструмента при входе в фазу
    this.triggerToolAction();
  }

  // Запуск динамической работы 3D-инструмента
  triggerToolAction(onImpact) {
    if (this.currentPhase === 0 || this.currentPhase === 1) {
      this.swingHammer(onImpact);
    } else if (this.currentPhase === 2) {
      this.startFileGrinding();
      if (onImpact) onImpact();
    } else if (this.currentPhase === 3) {
      this.startPolishing();
      if (onImpact) onImpact();
    } else if (this.currentPhase === 4) {
      this.startLoupeInspection();
      if (onImpact) onImpact();
    } else if (this.currentPhase === 5) {
      this.startMasterTouch();
      if (onImpact) onImpact();
    }
  }

  // Анимация удара молотка с замахом и отдачей
  swingHammer(onImpactCallback) {
    // Если молоток уже бьет, но уже в фазе отскока/возврата — быстрый сброс на новый взмах
    if (this.isHammerSwinging && this.hammerProgress > 0.45) {
      this.hammerProgress = 0.10;
      this.hammerImpactTriggered = false;
      this.onHammerImpact = onImpactCallback || null;
      return;
    }
    this.isHammerSwinging = true;
    this.hammerProgress = 0;
    this.hammerImpactTriggered = false;
    this.onHammerImpact = onImpactCallback || null;
  }

  startFileGrinding() {
    this.isFileGrinding = true;
    this.fileTimer = 0;
  }

  startPolishing() {
    this.isPolishing = true;
    this.polishAngle = 0;
  }

  startLoupeInspection() {
    // Лупа плавно приближается к стеклу
    this.toolLoupe.position.set(0, 0, 2.4);
  }

  startMasterTouch() {
    // Рука касается верхушки алмаза
    this.toolHand.position.set(0.2, 1.4, 0.8);
  }

  animateThree() {
    requestAnimationFrame(() => this.animateThree());

    const time = performance.now() * 0.001;

    // Медленное базовое вращение камня, если пользователь не держит его пальцем
    if (!this.isDragging) {
      this.rockCoreGroup.rotation.y += this.rotationVelocity.y;
      this.rockCoreGroup.rotation.x += (this.targetRotation.x - this.rockCoreGroup.rotation.x) * 0.05;
    }

    // Тактильная амортизация и отдача камня от ударов (Spring Damping)
    if (this.rockImpactOffset) {
      this.rockImpactOffset.x *= 0.82;
      this.rockImpactOffset.y *= 0.82;
      this.rockCoreGroup.position.x = this.rockImpactOffset.x;
      this.rockCoreGroup.position.y = this.rockImpactOffset.y;
    }

    // ------------------------------------------------------------------------
    // ДИНАМИКА ОТКОЛА ЧАСТЕЙ КАМНЯ
    // ------------------------------------------------------------------------
    this.crustChunks.forEach((chunk) => {
      if (chunk.isDetached) {
        // Кусочек летит наружу от центра камня и крутится
        chunk.mesh.position.addScaledVector(chunk.flyDir, 0.08);
        chunk.mesh.rotation.x += 0.04;
        chunk.mesh.rotation.y += 0.05;

        // Если улетел достаточно далеко — скрываем
        if (chunk.mesh.position.length() > 7.0) {
          chunk.mesh.visible = false;
        }
      }
    });

    // ------------------------------------------------------------------------
    // АНИМАЦИЯ 3D-МОЛОТКА: КИНЕМАТИКА УДАРА, ЗАМАХ, РАЗГОН И ОТСКОК
    // ------------------------------------------------------------------------
    if (this.toolHammer && this.toolHammer.visible) {
      if (this.isHammerSwinging) {
        // Скорость цикла взмаха и удара: ~0.60 сек при 60 FPS
        this.hammerProgress += 0.026;
        const p = this.hammerProgress;

        // Функции гладкой интерполяции движения (Easing Functions)
        const lerp = (a, b, t) => a + (b - a) * t;
        const easeOutQuad = (t) => t * (2 - t);
        const easeInCubic = (t) => t * t * t;
        const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        if (p < 0.28) {
          // ==================================================================
          // ЭТАП 1: ЗАМАХ И ПОДЪЁМ (WINDUP / ANTICIPATION)
          // Мастер уверенно поднимает молот вверх и отводит назад
          // ==================================================================
          const t = easeOutQuad(p / 0.28);
          this.toolHammer.position.set(
            lerp(2.80, 3.35, t),
            lerp(0.50, 0.95, t),
            lerp(0.80, 1.10, t)
          );
          this.toolHammer.rotation.set(
            lerp(0.10, -0.18, t),
            lerp(-0.15, -0.32, t),
            lerp(0.40, -0.45, t) // Отвод назад на ~65 градусов
          );
        } else if (p < 0.48) {
          // ==================================================================
          // ЭТАП 2: МОЩНЫЙ УСКОРЯЮЩИЙСЯ УДАР ВПЕРЁД (EXPLOSIVE ACCELERATION)
          // Молоток с разгона обрушивает боёк на каменную породу
          // ==================================================================
          const t = easeInCubic((p - 0.28) / 0.20);
          this.toolHammer.position.set(
            lerp(3.35, 2.70, t),
            lerp(0.95, -0.15, t),
            lerp(1.10, 0.65, t)
          );
          this.toolHammer.rotation.set(
            lerp(-0.18, 0.22, t),
            lerp(-0.32, 0.12, t),
            lerp(-0.45, 1.02, t) // Сокрушительный удар плоским бойком по камню
          );
        } else if (p < 0.64) {
          // ==================================================================
          // ЭТАП 3: ТОЧКА КОНТАКТА И УПРУГИЙ ОТСКОК (IMPACT & RECOIL)
          // В момент касания запускаются искры, звук удара и отдача молота
          // ==================================================================
          if (!this.hammerImpactTriggered) {
            this.hammerImpactTriggered = true;
            if (this.rockImpactOffset) {
              this.rockImpactOffset.x = -0.12; // камень вздрагивает от удара
              this.rockImpactOffset.y = -0.04;
            }
            if (this.onHammerImpact) {
              this.onHammerImpact();
            }
          }

          const t = easeOutQuad((p - 0.48) / 0.16);
          this.toolHammer.position.set(
            lerp(2.70, 2.95, t),
            lerp(-0.15, 0.28, t),
            lerp(0.65, 0.78, t)
          );
          this.toolHammer.rotation.set(
            lerp(0.22, 0.12, t),
            lerp(0.12, -0.05, t),
            lerp(1.02, 0.74, t) // Пружинящий отскок на ~16 градусов
          );
        } else if (p <= 1.0) {
          // ==================================================================
          // ЭТАП 4: ПЛАВНЫЙ ВОЗВРАТ В БОЕВУЮ СТОЙКУ (DAMPED RECOVERY)
          // ==================================================================
          const t = easeInOutQuad((p - 0.64) / 0.36);
          this.toolHammer.position.set(
            lerp(2.95, 2.80, t),
            lerp(0.28, 0.50, t),
            lerp(0.78, 0.80, t)
          );
          this.toolHammer.rotation.set(
            lerp(0.12, 0.10, t),
            lerp(-0.05, -0.15, t),
            lerp(0.74, 0.40, t)
          );
        } else {
          // Завершение цикла удара
          this.toolHammer.position.set(2.80, 0.50, 0.80);
          this.toolHammer.rotation.set(0.10, -0.15, 0.40);
          this.isHammerSwinging = false;
        }
      } else {
        // ====================================================================
        // СОСТОЯНИЕ ОЖИДАНИЯ: ОРГАНИЧЕСКОЕ «ДЫХАНИЕ» (IDLE BREATHING)
        // Молот слегка покачивается в руке мастера наготове
        // ====================================================================
        const breathe = Math.sin(time * 2.2);
        const breatheRot = Math.cos(time * 1.8);
        this.toolHammer.position.set(
          2.80 + breatheRot * 0.035,
          0.50 + breathe * 0.055,
          0.80 + breathe * 0.025
        );
        this.toolHammer.rotation.set(
          0.10 + breathe * 0.015,
          -0.15 + breatheRot * 0.020,
          0.40 + breatheRot * 0.028
        );
      }
    }

    // ------------------------------------------------------------------------
    // АНИМАЦИЯ 3D-НАПИЛЬНИКА (ШЛИФОВКА ТУДА-СЮДА)
    // ------------------------------------------------------------------------
    if (this.toolFile.visible) {
      this.fileTimer += 0.08;
      const stroke = Math.sin(this.fileTimer * 8) * 0.7;
      this.toolFile.position.set(1.9 + stroke * 0.3, 0.6 + stroke * 0.2, 1.2 + stroke * 0.4);
    }

    // ------------------------------------------------------------------------
    // АНИМАЦИЯ 3D-ПОЛИРОВАЛЬНОГО ДИСКА (КРУГОВЫЕ ДВИЖЕНИЯ)
    // ------------------------------------------------------------------------
    if (this.toolPolish.visible) {
      this.polishAngle += 0.06;
      this.toolPolish.position.x = 1.8 + Math.cos(this.polishAngle) * 0.35;
      this.toolPolish.position.y = 0.8 + Math.sin(this.polishAngle) * 0.35;
    }

    // ------------------------------------------------------------------------
    // АНИМАЦИЯ ЛУПЫ И РУКИ МАСТЕРА
    // ------------------------------------------------------------------------
    if (this.toolLoupe.visible) {
      this.toolLoupe.position.x = Math.sin(time * 1.5) * 0.4;
      this.toolLoupe.position.y = Math.cos(time * 1.2) * 0.3;
    }

    if (this.toolHand.visible) {
      this.toolHand.position.y = 2.2 + Math.sin(time * 2.0) * 0.15;
    }

    if (this.godRays && this.godRays.visible) {
      this.godRays.rotation.z += 0.0035;
    }

    if (this.targetCameraZ && this.camera) {
      this.camera.position.z += (this.targetCameraZ - this.camera.position.z) * 0.06;
    }

    this.renderer.render(this.scene, this.camera);
  }

  setupInteractions() {
    const handleStart = (x, y) => {
      this.isDragging = true;
      this.lastPointer = { x, y };
      this.dragDistance = 0;
    };

    const handleMove = (x, y) => {
      if (!this.isDragging) return;
      const dx = x - this.lastPointer.x;
      const dy = y - this.lastPointer.y;
      this.dragDistance += Math.abs(dx) + Math.abs(dy);

      this.rockCoreGroup.rotation.y += dx * 0.008;
      this.rockCoreGroup.rotation.x += dy * 0.008;
      this.lastPointer = { x, y };
    };

    const handleEnd = (x, y) => {
      if (!this.isDragging) return;
      this.isDragging = false;

      // Если клик/тап на месте — наносим удар инструментом!
      if (this.dragDistance < 10) {
        if (this.onStrike) this.onStrike(x, y);
      }
    };

    this.canvas.addEventListener("mousedown", (e) => handleStart(e.clientX, e.clientY));
    window.addEventListener("mousemove", (e) => handleMove(e.clientX, e.clientY));
    window.addEventListener("mouseup", (e) => handleEnd(e.clientX, e.clientY));

    this.canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    window.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    window.addEventListener("touchend", (e) => {
      if (e.changedTouches.length > 0) {
        handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
    });
  }
}

/* ----------------------------------------------------------------------------
 * ГЛАВНЫЙ АВТОМАТ СОСТОЯНИЙ И КОНТРОЛЛЕР UI
 * ---------------------------------------------------------------------------- */
class AppStateMachine {
  constructor() {
    this.currentPhase = 0;
    this.sound = new SoundEngine();
    this.effects = new EffectsLayer(document.getElementById("effects-canvas"));
    this.gem = new GemEngine3D(document.getElementById("webgl-canvas"), (x, y) => this.handleStrike(x, y));

    this.dom = {
      progressSegments: document.getElementById("progress-segments"),
      phasePill: document.getElementById("phase-pill"),
      phaseHeading: document.getElementById("phase-heading"),
      phaseMeaning: document.getElementById("phase-meaning"),
      toolName: document.getElementById("tool-name"),
      toolIcon: document.getElementById("tool-icon"),
      hintText: document.getElementById("hint-text"),
      sideDrawer: document.getElementById("side-drawer"),
      drawerToggleTab: document.getElementById("drawer-toggle-tab"),
      drawerTitle: document.getElementById("drawer-title"),
      drawerTag: document.getElementById("drawer-tag"),
      numbersList: document.getElementById("numbers-list"),
      dialogueList: document.getElementById("dialogue-list"),
      phase4Overlay: document.getElementById("phase4-media-overlay"),
      phase5Overlay: document.getElementById("phase5-final-overlay"),
      ambientGlow: document.getElementById("bg-ambient-glow"),
      adminModal: document.getElementById("admin-modal"),
      adminTrigger: document.getElementById("admin-trigger-btn"),
      ceremonyModal: document.getElementById("ceremony-modal"),
      btnSound: document.getElementById("btn-sound"),
      btnFullscreen: document.getElementById("btn-fullscreen"),
      btnPrev: document.getElementById("btn-prev-phase"),
      btnNext: document.getElementById("btn-next-phase"),
      btnStrike: document.getElementById("btn-strike"),
      clockDisplay: document.getElementById("clock-display"),
      splineContainer: document.getElementById("spline-container"),
      splineUrlInput: document.getElementById("spline-url-input")
    };

    this.init();
  }

  init() {
    this.setupClock();
    this.setupEventListeners();
    this.setupHotkeys();
    this.setupTouchGestures();
    this.checkSavedSpline();
    this.goToPhase(0, false);
  }

  setupClock() {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      if (this.dom.clockDisplay) {
        this.dom.clockDisplay.textContent = `${h}:${m}:${s}`;
      }
    };
    update();
    setInterval(update, 1000);
  }

  checkSavedSpline() {
    const saved = localStorage.getItem("grani_spline_url");
    if (saved) {
      SPLINE_SCENE_URL = saved;
      if (this.dom.splineUrlInput) this.dom.splineUrlInput.value = saved;
      this.loadSplineScene(saved);
    }
  }

  loadSplineScene(url) {
    if (!url || !url.trim()) {
      if (this.dom.splineContainer) {
        this.dom.splineContainer.innerHTML = "";
        this.dom.splineContainer.classList.remove("active");
      }
      return;
    }

    if (!window.customElements.get("spline-viewer")) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://unpkg.com/@splinetool/viewer@latest/build/spline-viewer.js";
      script.onload = () => this.injectSplineElement(url);
      document.head.appendChild(script);
    } else {
      this.injectSplineElement(url);
    }
  }

  injectSplineElement(url) {
    if (!this.dom.splineContainer) return;
    this.dom.splineContainer.innerHTML = `<spline-viewer url="${url}"></spline-viewer>`;
    this.dom.splineContainer.classList.add("active");
  }

  goToPhase(index, playSound = true) {
    if (index < 0 || index >= PHASES_DATA.length) return;
    this.currentPhase = index;
    const data = PHASES_DATA[index];

    if (playSound) this.sound.playWhoosh();

    // 3D рендер: смена инструментов и откол кусков
    this.gem.setPhase(index);

    // Ударная волна
    this.effects.spawnShockwave(window.innerWidth / 2, window.innerHeight / 2, data.lightColor, 350);

    if (index === 1) this.effects.spawnCrustChunks(window.innerWidth / 2, window.innerHeight / 2, 35);
    if (index === 2) this.effects.spawnSparks(window.innerWidth / 2, window.innerHeight / 2, 45, ["#38bdf8", "#ffffff"]);
    if (index === 5) this.effects.spawnConfetti(95);

    this.updateHUD(data);
    this.updateDrawer(data);

    if (this.dom.phase4Overlay) {
      if (index === 4) this.dom.phase4Overlay.classList.add("active");
      else this.dom.phase4Overlay.classList.remove("active");
    }

    if (this.dom.phase5Overlay) {
      if (index === 5) this.dom.phase5Overlay.classList.add("active");
      else this.dom.phase5Overlay.classList.remove("active");
    }

    if (this.dom.ambientGlow) {
      this.dom.ambientGlow.style.backgroundColor = data.ambientColor;
    }
  }

  nextPhase() {
    if (this.currentPhase < PHASES_DATA.length - 1) {
      this.goToPhase(this.currentPhase + 1);
    }
  }

  prevPhase() {
    if (this.currentPhase > 0) {
      this.goToPhase(this.currentPhase - 1);
    }
  }

  handleStrike(x, y) {
    const cx = x || window.innerWidth / 2;
    const cy = y || window.innerHeight / 2;

    const executeImpactFX = () => {
      switch (this.currentPhase) {
        case 0:
        case 1:
          this.sound.playHammer();
          this.effects.spawnShockwave(cx, cy, "#c084fc", 350);
          this.effects.spawnCrustChunks(cx, cy, 38);
          break;
        case 2:
          this.sound.playFile();
          this.effects.spawnShockwave(cx, cy, "#38bdf8", 260);
          this.effects.spawnSparks(cx, cy, 40, ["#38bdf8", "#67e8f9", "#ffffff"]);
          break;
        case 3:
          this.sound.playPolish();
          this.effects.spawnShockwave(cx, cy, "#e879f9", 290);
          this.effects.spawnSparks(cx, cy, 28, ["#f472b6", "#c084fc", "#ffffff"]);
          break;
        case 4:
          this.sound.playMagnifier();
          this.effects.spawnShockwave(cx, cy, "#2dd4bf", 320);
          this.effects.spawnSparks(cx, cy, 22, ["#2dd4bf", "#5eead4", "#ffffff"]);
          break;
        case 5:
          this.sound.playDiamond();
          this.effects.spawnShockwave(cx, cy, "#f59e0b", 420);
          this.effects.spawnConfetti(50);
          break;
      }
    };

    if (this.currentPhase === 0 || this.currentPhase === 1) {
      // Запускаем взмах молотка: свист замаха сразу, а звук и спецэффекты удара — точно в момент контакта бойка с камнем!
      if (this.sound && this.sound.playWhoosh) {
        this.sound.playWhoosh();
      }
      this.gem.triggerToolAction(executeImpactFX);
    } else {
      this.gem.triggerToolAction();
      executeImpactFX();
    }
  }

  updateHUD(data) {
    if (this.dom.phasePill) this.dom.phasePill.textContent = data.name;
    if (this.dom.phaseHeading) this.dom.phaseHeading.textContent = data.heading;
    if (this.dom.phaseMeaning) this.dom.phaseMeaning.textContent = data.philosophy;
    if (this.dom.toolName) this.dom.toolName.textContent = data.tool;
    if (this.dom.hintText) this.dom.hintText.textContent = data.hint;

    if (this.dom.progressSegments) {
      const segs = this.dom.progressSegments.querySelectorAll(".progress-segment");
      segs.forEach((seg, idx) => {
        seg.classList.remove("active", "completed");
        if (idx === data.id) seg.classList.add("active");
        else if (idx < data.id) seg.classList.add("completed");
      });
    }
  }

  updateDrawer(data) {
    if (this.dom.drawerTitle) this.dom.drawerTitle.textContent = data.heading;
    if (this.dom.drawerTag) this.dom.drawerTag.textContent = data.tool;

    if (this.dom.numbersList) {
      if (data.numbers.length === 0) {
        this.dom.numbersList.innerHTML = `
          <div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
            В прологе происходит вводная беседа Мастера и Подмастерья.<br>Нажмите «УДАР ИНСТРУМЕНТОМ» или перейдите к Грани 1.
          </div>
        `;
      } else {
        this.dom.numbersList.innerHTML = data.numbers.map((num, idx) => `
          <div class="number-card ${idx === 0 ? 'active-performance' : ''}" data-num-id="${num.id}">
            <div class="number-card-top">
              <span class="number-badge">${num.num}</span>
              <span class="lighting-pill">
                <span class="lighting-dot" style="background-color: ${num.lightColor}; box-shadow: 0 0 8px ${num.lightColor};"></span>
                ${num.light}
              </span>
            </div>
            <div class="number-name">${num.title}</div>
            <div class="number-type">${num.type}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.35; margin-top: 0.2rem;">${num.desc}</div>
            <div class="number-status-tag">${idx === 0 ? 'На сцене' : 'В очереди'}</div>
          </div>
        `).join("");

        this.dom.numbersList.querySelectorAll(".number-card").forEach((card) => {
          card.addEventListener("click", () => {
            this.sound.playClick();
            this.dom.numbersList.querySelectorAll(".number-card").forEach(c => {
              c.classList.remove("active-performance");
              c.querySelector(".number-status-tag").textContent = "В очереди";
            });
            card.classList.add("active-performance");
            card.querySelector(".number-status-tag").textContent = "На сцене";
          });
        });
      }
    }

    if (this.dom.dialogueList) {
      this.dom.dialogueList.innerHTML = data.dialogue.map(d => {
        let roleClass = "master";
        if (d.speaker === "Подмастерье") roleClass = "apprentice";
        if (d.speaker === "Голос") roleClass = "voice";

        return `
          <div class="dialogue-item ${roleClass}">
            <div class="dialogue-author">${d.speaker}</div>
            <div>${d.text}</div>
          </div>
        `;
      }).join("");
    }
  }

  setupEventListeners() {
    if (this.dom.progressSegments) {
      this.dom.progressSegments.querySelectorAll(".progress-segment").forEach(seg => {
        seg.addEventListener("click", () => {
          const p = parseInt(seg.getAttribute("data-phase"));
          this.goToPhase(p);
        });
      });
    }

    if (this.dom.btnPrev) this.dom.btnPrev.addEventListener("click", () => this.prevPhase());
    if (this.dom.btnNext) this.dom.btnNext.addEventListener("click", () => this.nextPhase());
    if (this.dom.btnStrike) this.dom.btnStrike.addEventListener("click", () => this.handleStrike());

    if (this.dom.btnSound) {
      this.dom.btnSound.addEventListener("click", () => {
        const muted = this.sound.toggleMute();
        this.dom.btnSound.classList.toggle("active", !muted);
      });
    }

    if (this.dom.btnFullscreen) {
      this.dom.btnFullscreen.addEventListener("click", () => this.toggleFullscreen());
    }

    if (this.dom.drawerToggleTab) {
      this.dom.drawerToggleTab.addEventListener("click", () => {
        this.dom.sideDrawer.classList.toggle("open");
        this.sound.playClick();
      });
    }

    const tabBtns = document.querySelectorAll(".drawer-tab-btn");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        tabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const target = btn.getAttribute("data-tab");

        if (target === "numbers") {
          this.dom.numbersList.style.display = "flex";
          this.dom.dialogueList.style.display = "none";
        } else {
          this.dom.numbersList.style.display = "none";
          this.dom.dialogueList.style.display = "flex";
        }
        this.sound.playClick();
      });
    });

    if (this.dom.adminTrigger) {
      this.dom.adminTrigger.addEventListener("click", () => {
        this.dom.adminModal.classList.toggle("open");
        this.sound.playClick();
      });
    }

    document.getElementById("btn-close-admin")?.addEventListener("click", () => {
      this.dom.adminModal.classList.remove("open");
      this.sound.playClick();
    });

    document.querySelectorAll(".admin-phase-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const p = parseInt(btn.getAttribute("data-phase"));
        this.goToPhase(p);
        this.dom.adminModal.classList.remove("open");
      });
    });

    document.getElementById("btn-open-ceremony")?.addEventListener("click", () => {
      this.dom.ceremonyModal.classList.add("open");
      this.sound.playClick();
    });

    document.getElementById("btn-close-ceremony")?.addEventListener("click", () => {
      this.dom.ceremonyModal.classList.remove("open");
      this.sound.playClick();
    });

    const ceremonyTabs = document.querySelectorAll(".ceremony-tab-btn");
    ceremonyTabs.forEach(btn => {
      btn.addEventListener("click", () => {
        ceremonyTabs.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const tab = btn.getAttribute("data-ceremony-tab");
        document.querySelectorAll(".ceremony-section").forEach(sec => {
          sec.style.display = sec.id === `ceremony-sec-${tab}` ? "block" : "none";
        });
        this.sound.playClick();
      });
    });
  }

  setupHotkeys() {
    window.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      switch (e.code) {
        case "Space":
        case "ArrowRight":
          e.preventDefault();
          this.nextPhase();
          break;
        case "ArrowLeft":
          e.preventDefault();
          this.prevPhase();
          break;
        case "Digit0": case "Numpad0": this.goToPhase(0); break;
        case "Digit1": case "Numpad1": this.goToPhase(1); break;
        case "Digit2": case "Numpad2": this.goToPhase(2); break;
        case "Digit3": case "Numpad3": this.goToPhase(3); break;
        case "Digit4": case "Numpad4": this.goToPhase(4); break;
        case "Digit5": case "Numpad5": this.goToPhase(5); break;
        case "KeyM": this.dom.btnSound?.click(); break;
        case "KeyF": this.toggleFullscreen(); break;
        case "KeyD": this.dom.sideDrawer?.classList.toggle("open"); break;
        case "KeyA": this.dom.adminModal?.classList.toggle("open"); break;
        case "KeyC": this.dom.ceremonyModal?.classList.toggle("open"); break;
        case "KeyS": this.handleStrike(); break;
      }
    });
  }

  setupTouchGestures() {
    let touchStartX = 0;
    let touchStartY = 0;

    window.addEventListener("touchstart", (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        this.nextPhase();
        return;
      }
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: false });

    window.addEventListener("touchend", (e) => {
      if (e.changedTouches.length === 1) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 140 && Math.abs(dy) < 80) {
          if (dx < 0) this.nextPhase();
          else this.prevPhase();
        }
      }
    });
    window.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.app = new AppStateMachine();
});
