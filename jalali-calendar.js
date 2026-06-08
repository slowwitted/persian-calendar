// jalali-calendar.js

const EventBus = {
  listeners: {},
  getCurrentContext: null,

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  },

  emit(event) {
    if (this.listeners[event]) {
      const context = this.getCurrentContext ? this.getCurrentContext() : {};
      this.listeners[event].forEach((cb) => cb(context));
    }
  },
};

const MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const DAY_NAMES = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

const MILADI_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const HIJRI_MONTHS = [
  "مُحَرَّم",
  "صَفَر",
  "ربیع‌الاول",
  "ربیع‌الثانی",
  "جمادی‌الاول",
  "جمادی‌الثانی",
  "رَجَب",
  "شَعبان",
  "رَمَضان",
  "شَوّال",
  "ذیقَعده",
  "ذیحَجّه",
];

const EVENT_TYPES = {
  // ─── شخصی ───
  birthday: { label: "🎂 تولد", color: "#e91e63" },
  mourning: { label: "🕯️ فوت/ختم", color: "#37474f" },
  travel: { label: "✈️ سفر/رزرو", color: "#00bcd4" },
  sport: { label: "🏃 ورزش/سلامت", color: "#4caf50" },
  personal: { label: "📌 شخصی", color: "#8bc34a" },

  // ─── پزشکی ───
  doctor: { label: "🩺 تایم دکتر", color: "#9c27b0" },
  medicine: { label: "💊 دارو/نوبت", color: "#ce93d8" },

  // ─── آموزشی/کاری ───
  class: { label: "🎓 کلاس/امتحان", color: "#3f51b5" },
  work: { label: "💼 قرار کاری", color: "#2196f3" },
  meeting: { label: "🤝 جلسه", color: "#1565c0" },
  deadline: { label: "⏳ ددلاین/مهلت", color: "#f44336" }, // ← آیکن جدید

  // ─── مالی ───
  bill: { label: "💳 پرداخت/قسط", color: "#ff5722" },
  cheque: { label: "🧾 سررسید چک", color: "#d32f2f" },
  rent: { label: "🏠 اجاره/رهن", color: "#6d4c41" },
  insurance: { label: "🛡️ بیمه", color: "#5d4037" },
  tuition: { label: "📚 شهریه", color: "#607d8b" },
  transfer: { label: "💸 انتقال وجه", color: "#795548" },
  shopping: { label: "🛒 خرید", color: "#009688" },

  // ─── عمومی ───
  reminder: { label: "🔔 یادآوری", color: "#ff9800" },

  // ─── جدید ───
  date_romantic: { label: "💕 قرار عاشقانه", color: "#ff4081" },
  interview: { label: "🎯 مصاحبه فنی", color: "#00695c" },

  // ─── افزودنی‌های پیشنهادی ───
  maintenance: { label: "🛠️ سرویس/تعمیرات", color: "#455a64" },
  delivery: { label: "📦 تحویل/دریافت بسته", color: "#0277bd" },
  party: { label: "🎉 مهمانی/مراسم", color: "#ab47bc" },
  journal: { label: "📝 یادداشت روزانه", color: "#8d6e63" },

  // ─── رویدادهایی سالانه ───
  engagement: { label: "💍 نامزدی", color: "#d81b60" },
  wedding: { label: "👰 ازدواج/عروسی", color: "#f48fb1" },
  anniversary: { label: "🎊 سالگرد/مناسبت", color: "#f06292" },
  holiday: { label: "🎌 تعطیلی/روز ویژه", color: "#ffb300" },
  subscription: { label: "♻️ تمدید اشتراک", color: "#00acc1" },
};

const REACTIONS = [
  { emoji: "👍", label: "عالی بود" },
  { emoji: "😐", label: "معمولی" },
  { emoji: "😢", label: "ناراحت‌کننده" },
  { emoji: "🔥", label: "هیجان‌انگیز" },
  { emoji: "💪", label: "پرتلاش" },
  { emoji: "😴", label: "خسته‌کننده" },
  { emoji: "🎉", label: "جشنی" },
  { emoji: "❤️", label: "عاشقانه" },
];

const ZODIAC_SIGNS = [
  { name: "بُز (جَدی)", symbol: "♑", end: [1, 19] },
  { name: "دَلو (بَهمَن)", symbol: "♒", end: [2, 18] },
  { name: "حوت (اِسفَند)", symbol: "♓", end: [3, 20] },
  { name: "حَمَل (فَروَردین)", symbol: "♈", end: [4, 19] },
  { name: "ثَور (اُردیبِهِشت)", symbol: "♉", end: [5, 20] },
  { name: "جَوزا (خُرداد)", symbol: "♊", end: [6, 20] },
  { name: "سَرَطان (تیر)", symbol: "♋", end: [7, 22] },
  { name: "اَسَد (مُرداد)", symbol: "♌", end: [8, 22] },
  { name: "سُنبُله (شَهریوَر)", symbol: "♍", end: [9, 22] },
  { name: "میزان (مِهر)", symbol: "♎", end: [10, 22] },
  { name: "عَقرَب (آبان)", symbol: "♏", end: [11, 21] },
  { name: "قَوس (آذَر)", symbol: "♐", end: [12, 21] },
];

const ANNUAL_TYPES = new Set([
  "birthday",
  "mourning",
  "anniversary",
  "holiday",
  "engagement",
  "wedding",
  "date_romantic",
  "insurance",
  "subscription",
]);

const BELL_DISPLAY_MODE_KEY = "bellDisplayMode";

const MOON_IN_SCORPIO = (
  id = `half-${Math.random().toString(36).slice(2, 9)}`,
) => `
  <svg width="16.8" height="16.8" viewBox="0 0 24 24" aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="${id}">
        <rect x="0" y="0" width="16.4" height="24" />
      </clipPath>
    </defs>

    <path
      clip-path="url(#${id})"
      fill="#F97316"
      stroke="none"
      fill-rule="evenodd"
      d="M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z
        M14 3.8a8.2 8.2 0 1 1 0 16.4a8.2 8.2 0 1 1 0-16.4z"
    />

    <g
      fill="none"
      stroke="#991B1B"
      stroke-linecap="round"
      stroke-linejoin="round"
      transform="translate(12.0 8.2) scale(1.3225)"
    >
      <path d="M0.2 4l-1.2-0.6 0.7-1 1.2 0.6" stroke-width="1.2" />
      <path d="M6.2 4l1.2-0.6-0.7-1-1.2 0.6" stroke-width="1.2" />
      <path d="M0.9 4.6c1.4 1 3.4 1 4.8 0" stroke-width="1.2" />
      <path d="M2.0 5.6 L0.8 6.4" stroke-width="0.48" />
      <path d="M0.8 6.4 L2.0 7.2" stroke-width="0.24" />
      <path d="M4.2 5.6 L5.4 6.4" stroke-width="0.48" />
      <path d="M5.4 6.4 L4.2 7.2" stroke-width="0.24" />
      <path d="M3 4.2c1-1.1 1.2-2.6 0.2-4" stroke-width="1.2" />
      <path d="M3.2 0.2l1-0.7" stroke-width="1.2" />
    </g>
  </svg>
`;

function getBellDisplayMode() {
  return localStorage.getItem(BELL_DISPLAY_MODE_KEY) || "all";
}

function setBellDisplayMode(mode) {
  localStorage.setItem(BELL_DISPLAY_MODE_KEY, mode);
}

function getSeasonColor(month) {
  if (month <= 3) return "#ff6692";
  if (month <= 6) return "#00ad7c";
  if (month <= 9) return "#ffad1f";
  return "#afd3e2";
}

function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem("jalali_events") || "{}");
  } catch {
    return {};
  }
}

function saveEvents(ev) {
  localStorage.setItem("jalali_events", JSON.stringify(ev));
  EventBus.emit("calendarUpdate");
}

function isLeapJ(jy) {
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(jy % 33);
}

function toJalali(gy, gm, gd) {
  const j_days = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  const dayNum = Date.UTC(gy, gm - 1, gd);
  const g = Math.round((dayNum - Date.UTC(1600, 0, 1)) / 86400000);
  let j = g - 79;
  let np = Math.floor(j / 12053);
  j %= 12053;
  let jy = 979 + 33 * np + 4 * Math.floor(j / 1461);
  j %= 1461;
  if (j >= 366) {
    jy += Math.floor((j - 1) / 365);
    j = (j - 1) % 365;
  }
  let jm = 0;
  for (; jm < 11 && j >= j_days[jm]; jm++) j -= j_days[jm];
  return [jy, jm + 1, j + 1];
}

function jalaliToGregorian(jy, jm, jd) {
  const j_days = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  let np = Math.floor((jy - 979) / 33),
    rem = (jy - 979) % 33;
  let j = 12053 * np + 1461 * Math.floor(rem / 4);
  let remY = rem % 4;
  if (remY > 0) j += 365 * remY + 1;
  for (let i = 0; i < jm - 1; i++) j += j_days[i];
  j += jd - 1;
  const offset = 79;
  return new Date(Date.UTC(1600, 0, 1) + (j + offset) * 86400000);
}

function daysInMonth(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isLeapJ(jy) ? 30 : 29;
}

function jKey(jy, jm, jd) {
  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

function getDayName(jy, jm, jd) {
  const gDate = jalaliToGregorian(jy, jm, jd);
  const dayIndex = (gDate.getUTCDay() + 1) % 7;
  return DAY_NAMES[dayIndex];
}

function getJalaliTimestamp() {
  const now = new Date();
  const [jy, jm, jd] = toJalali(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  );
  let h = now.getHours();
  const min = String(now.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "ب.ظ" : "ق.ظ";
  h = h % 12 || 12;
  const dayName = getDayName(jy, jm, jd);
  return `${dayName}، ${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}، ساعت ${h}:${min} ${ampm}`;
}

function jDaysInMonth(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(jy % 33) ? 30 : 29;
}

function formatJalaliDate() {
  const today = new Date();
  const [jy, jm, jd] = toJalali(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  );
  const dayName = getDayName(jy, jm, jd);
  return `${dayName} ${jd} ${MONTH_NAMES[jm - 1]} ${jy}`;
}

function copyrightYear() {
  const el = document.getElementById("copyrightYear");
  if (!el) return;

  const g = new Date();
  const [jy] = toJalali(g.getFullYear(), g.getMonth() + 1, g.getDate());

  el.textContent = jy;
}

function getMoonInScorpioWindow(jd, jm, jy, tz) {
  function toJulianDayMidnight(year, month, day) {
    if (month <= 2) {
      year -= 1;
      month += 12;
    }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    return (
      Math.floor(365.25 * (year + 4716)) +
      Math.floor(30.6001 * (month + 1)) +
      day +
      B -
      1524.5
    );
  }

  function jdToDate(jd) {
    const Z = Math.floor(jd + 0.5);
    const F = jd + 0.5 - Z;
    let A = Z;
    if (Z >= 2299161) {
      const alpha = Math.floor((Z - 1867216.25) / 36524.25);
      A = Z + 1 + alpha - Math.floor(alpha / 4);
    }
    const B = A + 1524;
    const C = Math.floor((B - 122.1) / 365.25);
    const D = Math.floor(365.25 * C);
    const E = Math.floor((B - D) / 30.6001);
    const day = B - D - Math.floor(30.6001 * E) + F;
    const month = E < 14 ? E - 1 : E - 13;
    const year = month > 2 ? C - 4716 : C - 4715;
    const hours = (day - Math.floor(day)) * 24;
    const minutes = (hours - Math.floor(hours)) * 60;
    const seconds = Math.floor((minutes - Math.floor(minutes)) * 60);
    return {
      year: Math.floor(year),
      month: Math.floor(month),
      day: Math.floor(day),
      hour: Math.floor(hours),
      minute: Math.floor(minutes),
      second: seconds,
    };
  }

  function moonLongitude(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    let L =
      218.3164591 +
      481267.88134236 * T -
      0.0013268 * T * T +
      (T * T * T) / 538841 -
      (T * T * T * T) / 65194000;
    let M =
      134.9634114 +
      477198.8676313 * T -
      0.008997 * T * T +
      (T * T * T) / 69699 -
      (T * T * T * T) / 14712000;
    let D =
      297.8502042 +
      445267.1115168 * T -
      0.00163 * T * T +
      (T * T * T) / 545868 -
      (T * T * T * T) / 113065000;
    let F =
      93.2720993 +
      483202.0175273 * T -
      0.0034029 * T * T -
      (T * T * T) / 3526000 +
      (T * T * T * T) / 863310000;

    L = ((L % 360) + 360) % 360;
    M = ((M % 360) + 360) % 360;
    D = ((D % 360) + 360) % 360;
    F = ((F % 360) + 360) % 360;

    const toRad = Math.PI / 180.0;
    let corr =
      6.288774 * Math.sin(M * toRad) +
      1.274027 * Math.sin((2 * D - M) * toRad) +
      0.658314 * Math.sin(2 * D * toRad) +
      0.213618 * Math.sin(2 * M * toRad) -
      0.185116 * Math.sin(F * toRad) -
      0.114332 * Math.sin(2 * F * toRad) +
      0.058793 * Math.sin((2 * D - 2 * M) * toRad) +
      0.05718 * Math.sin((2 * D - F) * toRad) +
      0.05332 * Math.sin((2 * D + M) * toRad) +
      0.045874 * Math.sin((2 * D - F - M) * toRad);

    let longitude = L + corr;
    longitude = ((longitude % 360) + 360) % 360;
    return longitude;
  }

  function zodiacSign(longitude) {
    const signs = [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ];
    const index = Math.floor(longitude / 30) % 12;
    return signs[index];
  }

  function findSignChange(jdStart, targetSign) {
    const step = 0.5 / 24;
    let prevSign = zodiacSign(moonLongitude(jdStart));
    let t = jdStart;

    for (let i = 0; i < 400; i++) {
      const nextJD = t + step;
      const nextSign = zodiacSign(moonLongitude(nextJD));
      if (nextSign === targetSign && prevSign !== targetSign) {
        let lo = t,
          hi = nextJD;
        for (let j = 0; j < 20; j++) {
          const mid = (lo + hi) / 2.0;
          const signMid = zodiacSign(moonLongitude(mid));
          if (signMid === targetSign) {
            hi = mid;
          } else {
            lo = mid;
          }
        }
        return (lo + hi) / 2.0;
      }
      prevSign = nextSign;
      t = nextJD;
    }
    return null;
  }

  function formatDateTimeLocal(jd, tz) {
    if (jd === null) return null;
    const d = jdToDate(jd - tz / 24.0);
    return (
      `${d.year}/${String(d.month).padStart(2, "0")}/${String(d.day).padStart(2, "0")} ` +
      `${String(d.hour).padStart(2, "0")}:${String(d.minute).padStart(2, "0")}:${String(d.second).padStart(2, "0")}`
    );
  }

  const todayMidnightUTC = toJulianDayMidnight(jy, jm, jd);
  const todayStart = todayMidnightUTC;
  const todayEnd = todayMidnightUTC + 1;

  const searchStart = todayMidnightUTC - 5;

  const entryUTC = findSignChange(searchStart, "Scorpio");
  let exitUTC = null;
  if (entryUTC !== null) {
    exitUTC = findSignChange(entryUTC, "Sagittarius");
  }

  let inScorpio = false;
  let entryToday = false;
  let exitToday = false;
  let fullDay = false;

  if (entryUTC !== null && exitUTC !== null) {
    inScorpio = entryUTC < todayEnd && exitUTC > todayStart;

    entryToday = entryUTC >= todayStart && entryUTC < todayEnd;

    exitToday = exitUTC >= todayStart && exitUTC < todayEnd;

    fullDay = entryUTC <= todayStart && exitUTC >= todayEnd;
  }

  const startLocal = entryUTC ? jdToDate(entryUTC - tz / 24.0) : null;
  const endLocal = exitUTC ? jdToDate(exitUTC - tz / 24.0) : null;

  return {
    inScorpio,
    startUTC: entryUTC,
    endUTC: exitUTC,
    startLocal,
    endLocal,
    startLabel: entryUTC ? formatDateTimeLocal(entryUTC, tz) : null,
    endLabel: exitUTC ? formatDateTimeLocal(exitUTC, tz) : null,
    entryToday,
    exitToday,
    fullDay,
  };
}

function initCustomDropdown(modalRoot) {
  const wrapper = modalRoot
    ? modalRoot.querySelector("#ev-type-dropdown")
    : document.getElementById("ev-type-dropdown");
  if (!wrapper) return;

  const annualLabel = modalRoot
    ? modalRoot.querySelector(".annual-label")
    : document.querySelector(".annual-label");

  function updateAnnualHint(typeKey) {
    if (!annualLabel) return;
    if (ANNUAL_TYPES.has(typeKey)) {
      annualLabel.classList.add("is-suggested");
      annualLabel.classList.remove("flash");
      void annualLabel.offsetWidth;
      annualLabel.classList.add("flash");
    } else {
      annualLabel.classList.remove("is-suggested", "flash");
    }
  }

  const oldSelected = wrapper.querySelector(".dropdown-selected");
  if (!oldSelected) return;
  const selected = oldSelected.cloneNode(true);
  oldSelected.parentNode.replaceChild(selected, oldSelected);

  const list = wrapper.querySelector(".dropdown-list");
  if (!list) return;

  const hiddenInput = modalRoot
    ? modalRoot.querySelector("#ev-type")
    : document.getElementById("ev-type");

  list.innerHTML = Object.entries(EVENT_TYPES)
    .map(
      ([key, val]) =>
        `<div class="dropdown-item" data-value="${key}" style="background-color: ${val.color || "#fff"}; margin: 3px 4px; border-radius: 6px; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
          ${val.label}
        </div>`,
    )
    .join("");

  function toggleList(e) {
    e.stopPropagation();
    e.preventDefault();
    const isOpen = list.classList.contains("open");
    if (isOpen) {
      list.classList.remove("open");
    } else {
      const rect = selected.getBoundingClientRect();
      list.style.position = "fixed";
      list.style.top = rect.bottom + 2 + "px";
      list.style.left = rect.left + "px";
      list.style.right = "auto";
      list.style.width = rect.width + "px";
      list.classList.add("open");
    }
  }

  selected.addEventListener("click", toggleList);
  selected.addEventListener("mousedown", (e) => e.preventDefault());

  list.addEventListener("click", (e) => {
    e.stopPropagation();
    const item = e.target.closest(".dropdown-item");
    if (!item) return;

    list
      .querySelectorAll(".dropdown-item")
      .forEach((x) => x.classList.remove("active"));
    item.classList.add("active");

    selected.textContent = item.textContent.trim();
    selected.dataset.value = item.dataset.value;
    selected.style.backgroundColor = item.style.backgroundColor;
    selected.style.color = "#fff";
    selected.style.textShadow = "0 1px 2px rgba(0,0,0,0.5)";

    if (hiddenInput) hiddenInput.value = item.dataset.value;

    updateAnnualHint(item.dataset.value);

    list.classList.remove("open");
  });

  const clickRoot = modalRoot || document;
  function outsideClick(e) {
    if (!wrapper.contains(e.target)) {
      list.classList.remove("open");
    }
  }
  clickRoot.addEventListener("click", outsideClick);

  if (modalRoot) {
    const observer = new MutationObserver(() => {
      if (!document.body.contains(modalRoot)) {
        clickRoot.removeEventListener("click", outsideClick);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true });
  }
}

function openEventModal(jy, jm, jd, events, onSave) {
  const key = jKey(jy, jm, jd);

  const g = jalaliToGregorian(jy, jm, jd);
  const gy = g.getUTCFullYear();
  const gm = g.getUTCMonth() + 1;
  const gd = g.getUTCDate();
  const moon = getMoonInScorpioWindow(gd, gm, gy, 3.5);

  const overlay = document.createElement("div");
  overlay.className = "cal-overlay";
  const typeOptions = Object.entries(EVENT_TYPES)
    .map(([k, v]) => `<option value="${k}">${v.label}</option>`)
    .join("");
  overlay.innerHTML = `
    <div class="cal-modal">
      <div class="cal-modal-header">
        <span>${getDayName(jy, jm, jd)}، ${jd} ${MONTH_NAMES[jm - 1]} ${jy} ${moon.inScorpio ? `— <span class="mis-icon" style="color:deeppink;"> ${MOON_IN_SCORPIO()}&nbsp;ماه در برج عقرب است </span>` : ""}</span>
        <button class="cal-modal-close">✕</button>
      </div>
      <div class="cal-modal-events" id="modal-events-list"></div>
      <div class="cal-modal-add">
        <div class="cal-modal-checks">
          <label>
            <input type="checkbox" id="ev-ts" checked />
            ثبت تاریخ و ساعت
          </label>
          <label class="priority-label">
            <input type="checkbox" id="ev-priority" />
            <span class="priority-star">⭐</span>
            اولویت بالا
          </label>
          <label class="clock-label">
            <input type="checkbox" id="ev-clock" />
            <span class="clock">⏰</span>
            راس ساعت
          </label>
          <label>
            <input type="checkbox" id="ev-repeat-check" />
            <span class="repeat">🔂</span>
            تکرار رویداد
          </label>
          <label class="annual-label">
            <input type="checkbox" id="ev-annual" />
            <span class="annual-icon">♾️</span>
            هر سال
          </label>
        </div>

        <div class="cal-modal-add-row">
          <div class="custom-dropdown" id="ev-type-dropdown">
            <div class="dropdown-selected">انتخاب نوع رویداد</div>
            <div class="dropdown-list"></div>
          </div>
          <input type="hidden" id="ev-type" />
          <input id="ev-text" placeholder="توضیح (اجباری)" />
          <button id="ev-add-btn">افزودن</button>
        </div>

        <!-- بخش راس ساعت -->
        <div class="cal-clock-section" id="clock-section" style="display:none;">
          <div class="cal-clock-options">
            
            <!-- انتخاب بازه زمانی -->
            <div class="cal-clock-row clock-inline-row">
              <label>بازه زمانی:</label>
              <div class="cal-clock-periods">
                <label class="cal-period-chip">
                  <input type="checkbox" name="clock-period" value="dawn" data-range="0:00-5:59" />
                  <span>🌑 بامداد</span>
                </label>
                <label class="cal-period-chip">
                  <input type="checkbox" name="clock-period" value="morning" data-range="6:00-11:59" />
                  <span>🌅 صبح</span>
                </label>
                <label class="cal-period-chip">
                  <input type="checkbox" name="clock-period" value="noon" data-range="12:00-16:59" />
                  <span>☀️ ظهر</span>
                </label>
                <label class="cal-period-chip">
                  <input type="checkbox" name="clock-period" value="afternoon" data-range="17:00-20:59" />
                  <span>🌤️ عصر</span>
                </label>
                <label class="cal-period-chip">
                  <input type="checkbox" name="clock-period" value="night" data-range="20:00-23:59" />
                  <span>🌙 شب</span>
                </label>

                <span class="cal-clock-range-hint" id="clock-range-hint"></span>
              </div>
            </div>

            <!-- ساعت شروع -->
            <div class="cal-clock-row">
              <label>ساعت شروع:</label>
              <input type="time" id="ev-clock-time" class="cal-time-input" value="00:00" />
              
              <!-- تکرار ساعتی -->
              <div class="cal-clock-repeat-row" id="clock-repeat-row">
                <label class="cal-clock-repeat-toggle">
                  <input type="checkbox" id="ev-clock-repeat" />
                  <span class="cal-toggle-switch"></span>
                  <span class="cal-toggle-label">تکرار هر</span>
                </label>
                <select id="ev-clock-interval" disabled>
                  <option value="1">۱</option>
                  <option value="2">۲</option>
                  <option value="3">۳</option>
                  <option value="4">۴</option>
                  <option value="6" selected>۶</option>
                  <option value="8">۸</option>
                  <option value="12">۱۲</option>
                </select>
                <span class="cal-clock-unit">ساعت یک‌بار</span>
                <button id="ev-add-clock-btn" disabled>ثبت تکرار</button>
              </div>
            </div>

            <!-- پیش‌نمایش ساعت‌ها -->
            <div class="cal-clock-preview" id="clock-preview"></div>

          </div>
        </div>

        <!-- بخش تکرار -->
        <div class="cal-repeat-section">
          <div class="cal-repeat-options" id="repeat-options" style="display:none;">

            <!-- ردیف اول: تکرار با فاصله -->
            <div class="cal-repeat-row">
              <div class="cal-interval-section">
                <label class="cal-interval-toggle">
                  <input type="checkbox" id="ev-interval-check" />
                  <span class="cal-toggle-switch"></span>
                  <span class="cal-toggle-label">تکرار با فاصله</span>
                </label>
                <div class="cal-interval-fields" id="interval-fields" style="display:none;">
                  <span>هر</span>
                  <select id="ev-interval-value">
                    <option value="1">۱</option>
                    <option value="2" selected>۲</option>
                    <option value="3">۳</option>
                    <option value="4">۴</option>
                    <option value="5">۵</option>
                    <option value="6">۶</option>
                    <option value="7">۷</option>
                    <option value="8">۸</option>
                    <option value="9">۹</option>
                    <option value="10">۱۰</option>
                  </select>
                  <select id="ev-interval-unit">
                    <option value="daily">روز</option>
                    <option value="weekly">هفته</option>
                    <option value="monthly">ماه</option>
                  </select>
                  <span>یکبار</span>
                </div>
              </div>
            </div>

            <!-- ردیف دوم: تنظیمات تکرار + تعداد/تاریخ -->
            <div class="cal-repeat-row">
              <label>نوع تکرار:</label>
              <select id="ev-repeat-type">
                <option value="daily">روزانه</option>
                <option value="weekly">هفتگی</option>
                <option value="monthly">ماهانه</option>
              </select>
              <label>پایان تکرار:</label>
              <select id="ev-repeat-end-type">
                <option value="count">تعداد دفعات</option>
                <option value="until">تا تاریخ</option>
              </select>
              <span id="repeat-count-row">
                <label>تعداد:</label>
                <input type="number" id="ev-repeat-count" value="5" min="2" max="365" style="width:80px;" />
              </span>
              <span id="repeat-until-row" style="display:none;">
                <label>تا تاریخ:</label>
                <input type="text" id="ev-repeat-until" placeholder="روز/ماه/سال" readonly style="width:140px;cursor:pointer;" />
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  `;

  const evAnnual = overlay.querySelector("#ev-annual");

  function handleAnnualToggle() {
    const on = evAnnual.checked;

    if (on) {
      clockCheck.checked = false;
      repeatCheck.checked = false;

      if (clockCheck.onchange) clockCheck.onchange();
      if (repeatCheck.onchange) repeatCheck.onchange();

      clockCheck.disabled = true;
      repeatCheck.disabled = true;

      clockCheck.closest("label").classList.add("label-disabled");
      repeatCheck.closest("label").classList.add("label-disabled");
    } else {
      clockCheck.disabled = false;
      repeatCheck.disabled = false;

      clockCheck.closest("label").classList.remove("label-disabled");
      repeatCheck.closest("label").classList.remove("label-disabled");
    }
  }

  evAnnual.addEventListener("change", handleAnnualToggle);

  document.body.appendChild(overlay);

  setTimeout(() => initCustomDropdown(overlay), 0);

  const repeatCheck = overlay.querySelector("#ev-repeat-check");
  const repeatOptions = overlay.querySelector("#repeat-options");
  const repeatEndType = overlay.querySelector("#ev-repeat-end-type");
  const repeatCountRow = overlay.querySelector("#repeat-count-row");
  const repeatUntilRow = overlay.querySelector("#repeat-until-row");

  repeatCheck.onchange = () => {
    repeatOptions.style.display = repeatCheck.checked ? "flex" : "none";
  };
  repeatEndType.onchange = () => {
    repeatCountRow.style.display =
      repeatEndType.value === "count" ? "flex" : "none";
    repeatUntilRow.style.display =
      repeatEndType.value === "until" ? "flex" : "none";
  };

  const intervalCheck = overlay.querySelector("#ev-interval-check");
  const intervalFields = overlay.querySelector("#interval-fields");
  const intervalSection = overlay.querySelector(".cal-interval-section");

  intervalCheck.onchange = () => {
    const on = intervalCheck.checked;
    intervalFields.style.display = on ? "flex" : "none";
    intervalSection.classList.toggle("active", on);

    overlay.querySelector("#ev-repeat-type").disabled = on;
  };

  const periodChecks = overlay.querySelectorAll('input[name="clock-period"]');
  const rangeHint = overlay.querySelector("#clock-range-hint");
  const timeInput = overlay.querySelector("#ev-clock-time");

  const periodLabels = {
    dawn: "بامداد",
    morning: "صبح",
    noon: "ظهر",
    afternoon: "عصر",
    night: "شب",
  };

  const periodHints = {
    dawn: "از ۱۲ بامداد الی ۶ صبح",
    morning: "از ۶ صبح الی ۱۲ ظهر",
    noon: "از ۱۲ ظهر الی ۵ عصر",
    afternoon: "از ۵ عصر الی ۸ شب",
    night: "از ۸ شب الی ۱۲ شب",
  };

  periodChecks.forEach((chk) => {
    chk.onchange = () => {
      periodChecks.forEach((c) => {
        if (c !== chk) c.checked = false;
      });

      if (chk.checked) {
        const range = chk.dataset.range;
        const [start] = range.split("-");
        const [startH] = start.split(":").map(Number);

        rangeHint.textContent = `(${periodHints[chk.value]})`;

        timeInput.value = `${String(startH).padStart(2, "0")}:00`;
        timeInput.min = range.split("-")[0];
        timeInput.max = range.split("-")[1];
      } else {
        rangeHint.textContent = "";
        timeInput.value = "00:00";
        timeInput.removeAttribute("min");
        timeInput.removeAttribute("max");
      }
    };
  });

  const clockRepeatCheck = overlay.querySelector("#ev-clock-repeat");
  const clockIntervalSelect = overlay.querySelector("#ev-clock-interval");
  const clockRepeatRow = overlay.querySelector("#clock-repeat-row");
  const addClockBtn = overlay.querySelector("#ev-add-clock-btn");
  const clockPreview = overlay.querySelector("#clock-preview");

  clockRepeatCheck.onchange = () => {
    const on = clockRepeatCheck.checked;
    clockIntervalSelect.disabled = !on;
    addClockBtn.disabled = !on;
    clockRepeatRow.classList.toggle("active", on);
    if (!on) clockPreview.innerHTML = "";
  };

  function getPeriodLabel(hour) {
    if (hour >= 0 && hour < 6) return "بامداد";
    if (hour >= 6 && hour < 12) return "صبح";
    if (hour >= 12 && hour < 17) return "ظهر";
    if (hour >= 17 && hour < 20) return "عصر";
    return "شب";
  }

  addClockBtn.onclick = () => {
    const timeValue = timeInput.value;
    if (!timeValue) return;

    const [startHour, startMinute] = timeValue.split(":").map(Number);
    const interval = parseInt(clockIntervalSelect.value, 10);
    const count = Math.floor(24 / interval);

    clockPreview.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const totalHour = (startHour + i * interval) % 24;
      const minuteStr = String(startMinute).padStart(2, "0");
      const hourStr = String(totalHour).padStart(2, "0");
      const period = getPeriodLabel(totalHour);

      const chip = document.createElement("label");
      chip.className = "cal-period-chip-box";
      chip.innerHTML = `
        <span class="chip-time">${hourStr}:${minuteStr}</span>
        <span class="chip-period">${period}</span>
        <button class="chip-remove" title="حذف">×</button>
      `;

      chip.querySelector(".chip-remove").onclick = () => {
        chip.style.transform = "scale(0)";
        chip.style.opacity = "0";
        setTimeout(() => chip.remove(), 200);
      };

      clockPreview.appendChild(chip);
    }
  };

  const clockCheck = overlay.querySelector("#ev-clock");
  const clockSection = overlay.querySelector("#clock-section");

  clockCheck.onchange = () => {
    clockSection.style.display = clockCheck.checked ? "block" : "none";

    if (!clockCheck.checked) {
      periodChecks.forEach((c) => (c.checked = false));
      rangeHint.textContent = "";
      timeInput.value = "00:00";
      timeInput.removeAttribute("min");
      timeInput.removeAttribute("max");
      clockRepeatCheck.checked = false;
      clockIntervalSelect.disabled = true;
      addClockBtn.disabled = true;
      clockIntervalSelect.value = "6";
      clockRepeatRow.classList.remove("active");
      clockPreview.innerHTML = "";
    }
  };

  attachRepeatDatePicker(overlay.querySelector("#ev-repeat-until"), overlay);

  function renderList() {
    const todayG = new Date();
    const [todayYear, todayMonth, todayDay] = toJalali(
      todayG.getFullYear(),
      todayG.getMonth() + 1,
      todayG.getDate(),
    );

    const list = overlay.querySelector("#modal-events-list");

    const md = key.slice(5);
    const normal = events[key] || [];
    const annual = (events._annual && events._annual[md]) || [];

    const combined = [
      ...normal.map((ev, i) => ({ ev, src: "normal", idx: i })),
      ...annual.map((ev, i) => ({ ev, src: "annual", idx: i })),
    ];

    if (!combined.length) {
      list.innerHTML = '<p class="no-ev">رویدادی ثبت نشده</p>';
      return;
    }

    list.innerHTML = combined
      .map(
        ({ ev, src, idx }, i) => `
        <div class="ev-item" style="border-right:4px solid ${
          EVENT_TYPES[ev.type]?.color || "#999"
        }">
          <span class="ev-dot" style="background:${
            EVENT_TYPES[ev.type]?.color || "#999"
          }"></span>
          <span class="ev-label">${EVENT_TYPES[ev.type]?.label || ev.type}</span>
          ${ev.priority ? `<span class="ev-priority-badge">⭐</span>` : ""}
          ${
            (jy < todayYear ||
              (jy === todayYear && jm < todayMonth) ||
              (jy === todayYear && jm === todayMonth && jd < todayDay)) &&
            ev.priority
              ? `<span class="cal-signs-expired-label">رد شده</span>`
              : ""
          }
            ${ev.clock ? `<span class="ev-clock-badge">⏰</span>` : ""}
            ${ev.clockTimes ? `<span class="ev-clock-times">${ev.clockTimes}</span>` : ""}
            ${ev.repeatId ? `<span class="ev-repeat-badge">🔁</span>` : ""}
            ${ev.annual ? `<span class="annual-icon">♾️</span>` : ""}
            ${ev.text ? `<span class="ev-text">— ${ev.text}</span>` : ""}
            ${ev.ts ? `<span class="ev-timestamp">${ev.ts}</span>` : ""}
          <button class="ev-del" data-i="${i}" data-src="${src}" data-idx="${idx}">✕</button>
        </div>`,
      )
      .join("");

    list.querySelectorAll(".ev-del").forEach((btn) => {
      btn.onclick = async () => {
        const src = btn.dataset.src;
        const idx = +btn.dataset.idx;
        const ev = src === "annual" ? annual[idx] : normal[idx];

        const calConfirm = (
          message,
          {
            okText = "همه تکرارها",
            cancelText = "فقط همین یکی",
            okValue = "all",
            cancelValue = "single",
          } = {},
        ) =>
          new Promise((resolve) => {
            const overlay = document.createElement("div");
            overlay.className = "cal-confirm-overlay";
            overlay.innerHTML = `
              <div class="cal-confirm-panel">
                <button class="cal-confirm-close" aria-label="بستن">✕</button>
                <div class="cal-confirm-text">${message}</div>
                <div class="cal-confirm-btns">
                  <button class="cal-btn cal-btn-cancel">${cancelText}</button>
                  <button class="cal-btn cal-btn-ok">${okText}</button>
                </div>
              </div>
            `;
            document.body.appendChild(overlay);

            const cleanup = () => overlay.remove();

            overlay.querySelector(".cal-btn-ok").onclick = () => {
              cleanup();
              resolve(okValue);
            };
            overlay.querySelector(".cal-btn-cancel").onclick = () => {
              cleanup();
              resolve(cancelValue);
            };
            overlay.querySelector(".cal-confirm-close").onclick = () => {
              cleanup();
              resolve("cancel");
            };
            overlay.onclick = (e) => {
              if (e.target === overlay) {
                cleanup();
                resolve("cancel");
              }
            };
          });

        if (src === "annual") {
          const choice = await calConfirm(
            `<span style="color:deeppink;">می‌خواهید این رویداد را حذف کنید؟</span><div class="bell-settings-divider"></div>این رویداد ♾️ <span style="color:red;">«${EVENT_TYPES[ev.type]?.label} - ${ev.text}»</span> هر سال تکرار می‌شود و با حذف آن، در همه سال‌ها حذف خواهد شد.`,
            {
              okText: "حذف",
              cancelText: "انصراف",
              okValue: "delete",
              cancelValue: "cancel",
            },
          );
          if (choice !== "delete") return;

          events._annual[md].splice(idx, 1);
          if (!events._annual[md].length) delete events._annual[md];

          saveEvents(events);
          onSave();
          renderList();
          return;
        }

        if (ev.clock && !ev.repeatId) {
          const choice = await calConfirm(
            `<span style="color:deeppink;">می‌خواهید این رویداد را حذف کنید؟</span>` +
              `<div class="bell-settings-divider"></div>این رویداد دارای نشانه راس ساعت ⏰ است.<br /><span style="color:red;">«${EVENT_TYPES[ev.type]?.label} - ${ev.text}»</span>`,
            {
              okText: "حذف",
              cancelText: "انصراف",
              okValue: "delete",
              cancelValue: "cancel",
            },
          );
          if (choice !== "delete") return;

          events[key].splice(idx, 1);
          if (!events[key].length) delete events[key];

          saveEvents(events);
          onSave();
          renderList();
          return;
        }

        if (ev.priority && !ev.clock && !ev.repeatId) {
          const choice = await calConfirm(
            `<span style="color:deeppink;">می‌خواهید این رویداد را حذف کنید؟</span>` +
              `<div class="bell-settings-divider"></div>این رویداد دارای نشانه اولویت بالا ⭐ است.<br /><span style="color:red;">«${EVENT_TYPES[ev.type]?.label} - ${ev.text}»</span>`,
            {
              okText: "حذف",
              cancelText: "انصراف",
              okValue: "delete",
              cancelValue: "cancel",
            },
          );
          if (choice !== "delete") return;

          events[key].splice(idx, 1);
          if (!events[key].length) delete events[key];

          saveEvents(events);
          onSave();
          renderList();
          return;
        }

        if (ev.repeatId) {
          const choice = await calConfirm(
            `<span style="color:deeppink;">آیا همه تکرارهای این رویداد 🔁 حذف شوند؟</span><br /><div class="bell-settings-divider"></div>` +
              `<span style="color:red;">«${EVENT_TYPES[ev.type]?.label} - ${ev.text}»</span>`,
            { okText: "همه تکرارها", cancelText: "فقط همین یکی" },
          );

          if (choice === "all") {
            deleteAllRecurrences(events, ev.repeatId);
          } else if (choice === "single") {
            events[key].splice(idx, 1);
            if (!events[key].length) delete events[key];
          } else {
            return;
          }
        } else {
          events[key].splice(idx, 1);
          if (!events[key].length) delete events[key];
        }

        saveEvents(events);
        onSave();
        renderList();
      };
    });
  }

  renderList();

  overlay.querySelector("#ev-add-btn").onclick = () => {
    const selType = overlay.querySelector(".dropdown-selected");
    if (!selType.dataset.value) {
      selType.classList.add("shake");
      selType.style.border = "2px solid red";
      setTimeout(() => {
        selType.classList.remove("shake");
        selType.style.border = "";
      }, 800);
      return;
    }

    const text0 = overlay.querySelector("#ev-text").value.trim();
    if (!text0) {
      const input = overlay.querySelector("#ev-text");
      input.classList.add("shake");
      input.style.border = "2px solid red";
      setTimeout(() => {
        input.classList.remove("shake");
        input.style.border = "";
      }, 800);
      return;
    }

    const type = overlay.querySelector("#ev-type").value;
    const text = overlay.querySelector("#ev-text").value.trim();
    const addTs = overlay.querySelector("#ev-ts").checked;
    const entry = { type, text };
    if (overlay.querySelector("#ev-priority").checked) entry.priority = true;

    const clockEnabled = overlay.querySelector("#ev-clock").checked;
    if (clockEnabled) {
      entry.clock = true;
      const clockPreview = overlay.querySelector("#clock-preview");
      const chips = clockPreview.querySelectorAll(".cal-period-chip-box");

      if (chips.length > 0) {
        const times = [];
        chips.forEach((chip) => {
          const timeText = chip.querySelector(".chip-time").textContent;
          const periodText = chip.querySelector(".chip-period").textContent;
          times.push(`${timeText} ${periodText}`);
        });
        entry.clockTimes = times.join(" | ");
      } else {
        const startTime = overlay.querySelector("#ev-clock-time").value;
        if (startTime) {
          const [h, m] = startTime.split(":");
          const hour = parseInt(h, 10);
          let period = "صبح";
          if (hour >= 0 && hour < 6) period = "بامداد";
          else if (hour >= 6 && hour < 12) period = "صبح";
          else if (hour >= 12 && hour < 17) period = "ظهر";
          else if (hour >= 17 && hour < 20) period = "عصر";
          else period = "شب";
          entry.clockTimes = `${startTime} ${period}`;
        }
      }
    }

    if (addTs) entry.ts = getJalaliTimestamp();

    const annualEnabled = overlay.querySelector("#ev-annual").checked;

    entry.annual = annualEnabled;

    if (repeatCheck.checked) {
      let rType, rInterval;
      if (intervalCheck.checked) {
        rType = overlay.querySelector("#ev-interval-unit").value;
        rInterval = parseInt(
          overlay.querySelector("#ev-interval-value").value,
          10,
        );
      } else {
        rType = overlay.querySelector("#ev-repeat-type").value;
        rInterval = 1;
      }
      const rEndType = repeatEndType.value;
      const repeatId = generateRepeatId();
      entry.repeatId = repeatId;

      if (rEndType === "count") {
        const count =
          parseInt(overlay.querySelector("#ev-repeat-count").value, 10) || 5;
        createRecurringEvents(
          events,
          jy,
          jm,
          jd,
          entry,
          rType,
          count,
          repeatId,
          rInterval,
        );
      } else {
        const untilVal = overlay.querySelector("#ev-repeat-until").value;
        if (!untilVal) {
          alert("لطفاً تاریخ پایان را انتخاب کنید");
          return;
        }
        const parts = untilVal.split("/");
        const uY = parseInt(parts[0], 10);
        const uM = parseInt(parts[1], 10);
        const uD = parseInt(parts[2], 10);
        createRecurringEventsUntil(
          events,
          jy,
          jm,
          jd,
          entry,
          rType,
          uY,
          uM,
          uD,
          repeatId,
          rInterval,
        );
      }
    } else {
      if (annualEnabled) {
        const mm = String(jm).padStart(2, "0");
        const dd = String(jd).padStart(2, "0");
        const mdKey = `${mm}/${dd}`;

        if (!events._annual) events._annual = {};
        if (!events._annual[mdKey]) events._annual[mdKey] = [];
        events._annual[mdKey].push(entry);
      } else {
        if (!events[key]) events[key] = [];
        events[key].push(entry);
      }
    }

    saveEvents(events);
    onSave();
    overlay.querySelector("#ev-text").value = "";
    overlay.querySelector("#ev-priority").checked = false;
    overlay.querySelector("#ev-clock").checked = false;
    overlay.querySelector("#clock-section").style.display = "none";
    overlay.querySelector("#clock-preview").innerHTML = "";
    overlay.querySelector("#ev-clock-time").value = "00:00";
    overlay.querySelector("#ev-annual").checked = false;

    repeatCheck.checked = false;
    repeatOptions.style.display = "none";

    selType.textContent = "انتخاب نوع رویداد";
    selType.dataset.value = "";
    selType.style.backgroundColor = "";
    selType.style.color = "";
    selType.style.textShadow = "";

    document
      .querySelector(".annual-label")
      .classList.remove("is-suggested", "flash");

    renderList();
  };

  overlay.querySelector(".cal-modal-close").onclick = () => overlay.remove();
}

function generateRepeatId() {
  return "rpt-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
}

function addJalaliDays(jy, jm, jd, n) {
  const g = jalaliToGregorian(jy, jm, jd);
  g.setDate(g.getDate() + n);
  return toJalali(g.getFullYear(), g.getMonth() + 1, g.getDate());
}

function addJalaliMonths(jy, jm, jd, n) {
  let m = jm + n;
  let y = jy;
  while (m > 12) {
    m -= 12;
    y++;
  }
  while (m < 1) {
    m += 12;
    y--;
  }
  const maxD = jDaysInMonth(y, m);
  const d = Math.min(jd, maxD);
  return [y, m, d];
}

function createRecurringEvents(
  events,
  jy,
  jm,
  jd,
  baseEntry,
  rType,
  count,
  repeatId,
  interval = 1,
) {
  for (let i = 0; i < count; i++) {
    let ny, nm, nd;
    if (rType === "daily")
      [ny, nm, nd] = addJalaliDays(jy, jm, jd, i * interval);
    else if (rType === "weekly")
      [ny, nm, nd] = addJalaliDays(jy, jm, jd, i * 7 * interval);
    else [ny, nm, nd] = addJalaliMonths(jy, jm, jd, i * interval);
    const k = jKey(ny, nm, nd);
    if (!events[k]) events[k] = [];
    events[k].push({ ...baseEntry, repeatId });
  }
}

function createRecurringEventsUntil(
  events,
  jy,
  jm,
  jd,
  baseEntry,
  rType,
  uY,
  uM,
  uD,
  repeatId,
  interval = 1,
) {
  const untilG = jalaliToGregorian(uY, uM, uD).getTime();
  let i = 0;
  while (i < 365) {
    let ny, nm, nd;
    if (rType === "daily")
      [ny, nm, nd] = addJalaliDays(jy, jm, jd, i * interval);
    else if (rType === "weekly")
      [ny, nm, nd] = addJalaliDays(jy, jm, jd, i * 7 * interval);
    else [ny, nm, nd] = addJalaliMonths(jy, jm, jd, i * interval);
    const curG = jalaliToGregorian(ny, nm, nd).getTime();
    if (curG > untilG) break;
    const k = jKey(ny, nm, nd);
    if (!events[k]) events[k] = [];
    events[k].push({ ...baseEntry, repeatId });
    i++;
  }
}

function deleteAllRecurrences(events, repeatId) {
  for (const k of Object.keys(events)) {
    if (k === "_annual") continue;
    const arr = events[k];
    if (!Array.isArray(arr)) continue;

    const filtered = arr.filter((e) => e.repeatId !== repeatId);
    if (filtered.length) events[k] = filtered;
    else delete events[k];
  }

  if (events._annual) {
    for (const md of Object.keys(events._annual)) {
      const arr = events._annual[md];
      if (!Array.isArray(arr)) continue;

      const filtered = arr.filter((e) => e.repeatId !== repeatId);
      if (filtered.length) events._annual[md] = filtered;
      else delete events._annual[md];
    }
    if (Object.keys(events._annual).length === 0) delete events._annual;
  }
}

function attachRepeatDatePicker(input, modalOverlay) {
  const box = document.createElement("div");
  box.className = "rdp-box";

  const now = new Date();
  const [ty, tm, td] = toJalali(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  );
  let curY = ty,
    curM = tm;
  let selectedY = null,
    selectedM = null,
    selectedD = null;

  function jalaliToNum(y, m, d) {
    return y * 10000 + m * 100 + d;
  }
  const todayNum = jalaliToNum(ty, tm, td);

  function render() {
    const firstDay = jalaliToGregorian(curY, curM, 1);
    const startOffset = (firstDay.getUTCDay() + 1) % 7;

    const prevDisabled =
      jalaliToNum(curY, curM, jDaysInMonth(curY, curM)) < todayNum;

    let html = `
      <div class="rdp-header">
        <button class="rdp-prev">&lt;</button>
        <span>${MONTH_NAMES[curM - 1]} ${curY}</span>
        <button class="rdp-next">&gt;</button>
      </div>
      <div class="rdp-today-btn"><button class="rdp-today">امروز</button></div>
      <div class="rdp-weekdays">${["ش", "ی", "د", "س", "چ", "پ", "ج"].map((d) => `<span>${d}</span>`).join("")}</div>
      <div class="rdp-grid">
    `;
    for (let i = 0; i < startOffset; i++)
      html += `<div class="rdp-cell rdp-empty"></div>`;
    for (let d = 1; d <= jDaysInMonth(curY, curM); d++) {
      const isToday = d === td && curM === tm && curY === ty;
      const isSelected =
        d === selectedD && curM === selectedM && curY === selectedY;
      const isPast = jalaliToNum(curY, curM, d) < todayNum;
      const col = (startOffset + d - 1) % 7;
      let cls = "rdp-cell";
      if (isToday) cls += " today rdp-today-cell";
      if (isSelected) cls += " selected rdp-selected";
      if (col === 6) cls += " rdp-fri";
      if (isPast) cls += " rdp-disabled";
      html += `<div class="${cls}" data-day="${d}">${d}</div>`;
    }
    html += "</div>";
    box.innerHTML = html;

    box.querySelector(".rdp-prev").onclick = (e) => {
      e.stopPropagation();
      let prevM = curM - 1,
        prevY = curY;
      if (prevM < 1) {
        prevM = 12;
        prevY--;
      }
      if (jalaliToNum(prevY, prevM, jDaysInMonth(prevY, prevM)) >= todayNum) {
        curM = prevM;
        curY = prevY;
        render();
      }
    };
    box.querySelector(".rdp-next").onclick = (e) => {
      e.stopPropagation();
      curM++;
      if (curM > 12) {
        curM = 1;
        curY++;
      }
      render();
    };
    box.querySelector(".rdp-today").onclick = (e) => {
      e.stopPropagation();
      curY = ty;
      curM = tm;
      selectedY = ty;
      selectedM = tm;
      selectedD = td;
      input.value = `${ty}/${tm.toString().padStart(2, "0")}/${td.toString().padStart(2, "0")}`;
      box.style.display = "none";
    };
    box
      .querySelectorAll(".rdp-cell:not(.rdp-empty):not(.rdp-disabled)")
      .forEach((c) => {
        c.onclick = (e) => {
          e.stopPropagation();
          const day = parseInt(c.dataset.day, 10);
          selectedY = curY;
          selectedM = curM;
          selectedD = day;
          input.value = `${curY}/${curM.toString().padStart(2, "0")}/${day.toString().padStart(2, "0")}`;
          box.style.display = "none";
        };
      });
  }

  function positionBox() {
    const rect = input.getBoundingClientRect();
    const boxH = 320;
    const boxW = 270;
    const viewH = window.innerHeight;
    const viewW = window.innerWidth;
    if (rect.bottom + boxH + 4 > viewH) {
      box.style.top = Math.max(4, rect.top - boxH - 4) + "px";
    } else {
      box.style.top = rect.bottom + 4 + "px";
    }
    if (rect.left + boxW > viewW) {
      box.style.left = Math.max(4, viewW - boxW - 4) + "px";
    } else {
      box.style.left = rect.left + "px";
    }
  }

  input.addEventListener("click", (e) => {
    e.stopPropagation();
    positionBox();
    box.style.display = "block";
    render();
  });

  input.addEventListener("focus", () => {
    if (selectedY && selectedM) {
      curY = selectedY;
      curM = selectedM;
    }
    render();
    positionBox();
    box.style.display = "block";
  });

  modalOverlay.addEventListener("click", (e) => {
    if (!box.contains(e.target) && e.target !== input) {
      box.style.display = "none";
    }
  });

  document.body.appendChild(box);
  render();
}

function showToast(msg, duration = 2500) {
  let t = document.querySelector(".cal-toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "cal-toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => {
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), duration);
  });
}

function exportEvents() {
  const eventsData = JSON.parse(localStorage.getItem("jalali_events") || "{}");
  const diaryData = JSON.parse(localStorage.getItem("jalali_diary") || "{}");

  const eventCount = Object.values(eventsData).reduce(
    (s, a) => s + a.length,
    0,
  );
  const diaryCount = Object.keys(diaryData).length;

  if (!eventCount && !diaryCount) {
    showToast("هیچ رویداد یا خاطره‌ای برای خروجی‌گیری وجود ندارد");
    return;
  }

  const combined = {
    events: eventsData,
    diary: diaryData,
  };

  const blob = new Blob([JSON.stringify(combined)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const now = new Date();
  const [jy, jm, jd] = toJalali(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  );
  a.href = url;
  a.download = `calendar-backup-${jy}-${String(jm).padStart(2, "0")}-${String(jd).padStart(2, "0")}.json`;
  a.click();
  URL.revokeObjectURL(url);

  const parts = [];
  if (eventCount) parts.push(`${eventCount} رویداد`);
  if (diaryCount) parts.push(`${diaryCount} خاطره`);
  showToast(`✅ ${parts.join(" و ")} خروجی گرفته شد`);
}

function importEvents(onDone) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let incoming;
      try {
        incoming = JSON.parse(reader.result);
        if (typeof incoming !== "object" || Array.isArray(incoming))
          throw new Error();
      } catch {
        showToast("⚠ فایل نامعتبر است");
        return;
      }

      let incomingEvents, incomingDiary;

      if (incoming.events || incoming.diary) {
        incomingEvents = incoming.events || {};
        incomingDiary = incoming.diary || {};
      } else {
        incomingEvents = incoming;
        incomingDiary = {};
      }

      const incomingEventCount = Object.values(incomingEvents).reduce(
        (s, a) => s + (Array.isArray(a) ? a.length : 0),
        0,
      );
      const incomingDiaryCount = Object.keys(incomingDiary).length;

      if (!incomingEventCount && !incomingDiaryCount) {
        showToast("فایل خالی است — داده‌ای یافت نشد");
        return;
      }

      const existing = loadEvents();
      const existingCount = Object.values(existing).reduce(
        (s, a) => s + a.length,
        0,
      );
      const existingDiary = loadDiary();
      const existingDiaryCount = Object.keys(existingDiary).length;

      if (incomingDiaryCount) {
        for (const key in incomingDiary) {
          if (!existingDiary[key]) {
            existingDiary[key] = incomingDiary[key];
          } else {
            const existingVersions = existingDiary[key].versions || [
              { text: existingDiary[key].text || "", date: "" },
            ];
            const incomingVersions = incomingDiary[key].versions || [
              { text: incomingDiary[key].text || "", date: "" },
            ];

            const existingTexts = new Set(existingVersions.map((v) => v.text));
            for (const v of incomingVersions) {
              if (!existingTexts.has(v.text)) {
                existingVersions.push(v);
              }
            }
            existingDiary[key] = { versions: existingVersions };
          }
        }
        saveDiary(existingDiary);
      }

      if (!existingCount || !incomingEventCount) {
        if (incomingEventCount) {
          saveEvents(incomingEvents);
        }
        onDone();
        const parts = [];
        if (incomingEventCount) parts.push(`${incomingEventCount} رویداد`);
        if (incomingDiaryCount) parts.push(`${incomingDiaryCount} خاطره`);
        showToast(`✅ ${parts.join(" و ")} وارد شد`);
        return;
      }

      showImportConfirm(existing, incomingEvents, incomingEventCount, onDone);
    };
    reader.readAsText(file);
  };
  input.click();
}

function showImportConfirm(existing, incoming, incomingCount, onDone) {
  const overlay = document.createElement("div");
  overlay.className = "cal-confirm-overlay";
  overlay.innerHTML = `
    <div class="cal-confirm-box">
      <p>📂 فایل شامل <strong>${incomingCount}</strong> رویداد است</p>
      <p class="sub">رویدادهای فعلی چه شوند؟</p>
      <div class="cal-confirm-actions">
        <button class="cal-cbtn-merge">ادغام</button>
        <button class="cal-cbtn-replace">جایگزینی</button>
        <button class="cal-cbtn-cancel">انصراف</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector(".cal-cbtn-cancel").onclick = () => overlay.remove();

  overlay.querySelector(".cal-cbtn-replace").onclick = () => {
    saveEvents(incoming);
    onDone();
    overlay.remove();
    showToast(`✅ ${incomingCount} رویداد جایگزین شد`);
  };

  overlay.querySelector(".cal-cbtn-merge").onclick = () => {
    const merged = { ...existing };
    for (const [key, arr] of Object.entries(incoming)) {
      if (!Array.isArray(arr)) continue;
      if (!merged[key]) {
        merged[key] = arr;
      } else {
        const existingJSON = merged[key].map((e) => JSON.stringify(e));
        for (const ev of arr) {
          if (!existingJSON.includes(JSON.stringify(ev))) {
            merged[key].push(ev);
          }
        }
      }
    }
    saveEvents(merged);
    const totalCount = Object.values(merged).reduce((s, a) => s + a.length, 0);
    onDone();
    overlay.remove();
    showToast(`✅ ادغام انجام شد — مجموعاً ${totalCount} رویداد`);
  };
}

function clearMonthEvents(jy, jm, events, onDone) {
  const monthName = `${MONTH_NAMES[jm - 1]} ${jy}`;
  const prefix = `${jy}/${String(jm).padStart(2, "0")}/`;

  events._annual = events._annual || {};

  let evCount = 0;
  const evKeys = [];
  for (const k in events) {
    if (k === "_annual") continue;
    if (k.startsWith(prefix)) {
      evCount += Array.isArray(events[k]) ? events[k].length : 0;
      evKeys.push(k);
    }
  }

  let annualCount = 0;
  const annualKeys = [];
  const jm2 = String(jm).padStart(2, "0");

  for (const md in events._annual) {
    const parts = md.split("/");
    let m = null;

    if (parts.length === 2) m = String(parts[0]).padStart(2, "0");
    else if (parts.length === 3) m = String(parts[1]).padStart(2, "0");

    if (m === jm2) {
      annualCount += Array.isArray(events._annual[md])
        ? events._annual[md].length
        : 0;
      annualKeys.push(md);
    }
  }

  const diary = JSON.parse(localStorage.getItem("jalali_diary") || "{}");
  const diaryKeys = [];
  for (const k in diary) {
    if (k.startsWith(prefix)) diaryKeys.push(k);
  }
  const diaryCount = diaryKeys.length;

  const hasAny = evCount + annualCount + diaryCount > 0;
  if (!hasAny) {
    showToast(`رویداد یا خاطره‌ای در ${monthName} وجود ندارد`);
    return;
  }

  const buildMsg = (includeAnnual) => {
    const total = evCount + (includeAnnual ? annualCount : 0);
    const parts = [];
    if (total) parts.push(`${total} رویداد`);
    if (diaryCount) parts.push(`${diaryCount} خاطره`);
    return `🗑 حذف ${parts.join(" و ")} ${monthName}؟`;
  };

  const overlay = document.createElement("div");
  overlay.className = "cal-confirm-overlay";
  overlay.innerHTML = `
    <div class="cal-confirm-box">
      <p id="clear-msg" style="color:deeppink;">${buildMsg(false)}</p>
      <div class="bell-settings-divider"></div>
      <small>حذف رویدادهای سالانه باعث حذف دائمی آن‌ها می‌شود.</small>
      <label class="cal-backup-label">
        <input type="checkbox" id="delete-annual-also" />
        رویدادهای سالانه‌ی این ماه هم حذف شوند
      </label>
      <div class="bell-settings-divider"></div>
      <div class="cal-confirm-actions">
        <button class="cal-cbtn-replace">حذف</button>
        <button class="cal-cbtn-cancel">انصراف</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const msgEl = overlay.querySelector("#clear-msg");
  const annualCb = overlay.querySelector("#delete-annual-also");

  if (annualCb) {
    annualCb.onchange = () => {
      msgEl.textContent = buildMsg(annualCb.checked);
    };
  }

  overlay.querySelector(".cal-cbtn-cancel").onclick = () => overlay.remove();
  overlay.querySelector(".cal-cbtn-replace").onclick = () => {
    const deleteAnnual = annualCb?.checked;

    evKeys.forEach((k) => delete events[k]);

    if (deleteAnnual) {
      annualKeys.forEach((md) => delete events._annual[md]);
      if (events._annual && Object.keys(events._annual).length === 0) {
        delete events._annual;
      }
    }

    saveEvents(events);

    if (diaryCount) {
      diaryKeys.forEach((k) => delete diary[k]);
      localStorage.setItem("jalali_diary", JSON.stringify(diary));
    }

    const deletedCount = evCount + (deleteAnnual ? annualCount : 0);
    const parts = [];
    if (deletedCount) parts.push(`${deletedCount} رویداد`);
    if (diaryCount) parts.push(`${diaryCount} خاطره`);

    overlay.remove();
    onDone();
    showToast(`✅ ${parts.join(" و ")} ${monthName} حذف شد`);
  };
}

function clearYearEvents(jy, events, onDone) {
  const yearStr = String(jy);

  events._annual = events._annual || {};

  let evCount = 0;
  const evKeys = [];
  for (const k in events) {
    if (k === "_annual") continue;
    if (k.startsWith(yearStr + "/")) {
      evCount += Array.isArray(events[k]) ? events[k].length : 0;
      evKeys.push(k);
    }
  }

  let annualCount = 0;
  const annualKeys = [];
  for (const md in events._annual) {
    annualCount += Array.isArray(events._annual[md])
      ? events._annual[md].length
      : 0;
    annualKeys.push(md);
  }

  const diary = JSON.parse(localStorage.getItem("jalali_diary") || "{}");
  const diaryKeys = [];
  for (const k in diary) {
    if (k.startsWith(yearStr + "/")) diaryKeys.push(k);
  }
  const diaryCount = diaryKeys.length;

  const hasAny = evCount + annualCount + diaryCount > 0;
  if (!hasAny) {
    showToast(`رویداد یا خاطره‌ای در سال ${jy} وجود ندارد`);
    return;
  }

  const buildMsg = (includeAnnual) => {
    const total = evCount + (includeAnnual ? annualCount : 0);
    const parts = [];
    if (total) parts.push(`${total} رویداد`);
    if (diaryCount) parts.push(`${diaryCount} خاطره`);
    return `🗑 حذف ${parts.join(" و ")} سال ${jy}؟`;
  };

  const overlay = document.createElement("div");
  overlay.className = "cal-confirm-overlay";
  overlay.innerHTML = `
    <div class="cal-confirm-box">
      <p id="clear-msg" style="color:deeppink;">${buildMsg(false)}</p>
      <div class="bell-settings-divider"></div>
      <label class="cal-backup-label">
        <input type="checkbox" id="backup-before-clear" checked />
        قبل از حذف، بکاپ گرفته شود
      </label>
      <label class="cal-backup-label">
        <input type="checkbox" id="delete-annual-also" />
        رویدادهای سالانه هم حذف شوند
      </label>
      <div class="bell-settings-divider"></div>
      <div class="cal-confirm-actions">
        <button class="cal-cbtn-replace">حذف</button>
        <button class="cal-cbtn-cancel">انصراف</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const msgEl = overlay.querySelector("#clear-msg");
  const annualCb = overlay.querySelector("#delete-annual-also");

  if (annualCb) {
    annualCb.onchange = () => {
      msgEl.textContent = buildMsg(annualCb.checked);
    };
  }

  overlay.querySelector(".cal-cbtn-cancel").onclick = () => overlay.remove();
  overlay.querySelector(".cal-cbtn-replace").onclick = () => {
    if (overlay.querySelector("#backup-before-clear").checked) {
      exportEvents();
    }

    const deleteAnnual = annualCb?.checked;

    evKeys.forEach((k) => delete events[k]);

    if (deleteAnnual) {
      annualKeys.forEach((md) => delete events._annual[md]);
      if (events._annual && Object.keys(events._annual).length === 0) {
        delete events._annual;
      }
    }

    saveEvents(events);

    if (diaryCount) {
      diaryKeys.forEach((k) => delete diary[k]);
      localStorage.setItem("jalali_diary", JSON.stringify(diary));
    }

    const deletedCount = evCount + (deleteAnnual ? annualCount : 0);
    const parts = [];
    if (deletedCount) parts.push(`${deletedCount} رویداد`);
    if (diaryCount) parts.push(`${diaryCount} خاطره`);

    overlay.remove();
    showToast(`✅ ${parts.join(" و ")} سال ${jy} حذف شد`);
    onDone();
  };
}

function attachCalendar(containerId) {
  const container = document.getElementById(containerId);
  const now = new Date();
  const [ty, tm, td] = toJalali(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  );
  let curY = ty,
    curM = tm;
  let selectedY = ty,
    selectedM = tm,
    selectedD = td;
  let events = loadEvents();

  function changeSelectedDay(offset) {
    const gDate = jalaliToGregorian(selectedY, selectedM, selectedD);
    gDate.setUTCDate(gDate.getUTCDate() + offset);
    [selectedY, selectedM, selectedD] = toJalali(
      gDate.getUTCFullYear(),
      gDate.getUTCMonth() + 1,
      gDate.getUTCDate(),
    );
    if (selectedM !== curM || selectedY !== curY) {
      curY = selectedY;
      curM = selectedM;
    }
    render();
  }

  function getAnnualReaction(ev, yearKey = String(selectedY)) {
    const aid = ev?._aid;
    if (!aid) return null;
    return events._annualReactions?.[yearKey]?.[aid] || null;
  }

  function getPeriodFromLabel(label) {
    if (!label) return "شب";

    const fa = "۰۱۲۳۴۵۶۷۸۹";
    const ar = "٠١٢٣٤٥٦٧٨٩";
    let s = String(label)
      .replace(/[۰-۹]/g, (d) => fa.indexOf(d))
      .replace(/[٠-٩]/g, (d) => ar.indexOf(d));

    if (s.includes("24:00")) return "تا پایان شب ۲۴:۰۰";

    const m = s.match(/(\d{1,2})\s*:\s*(\d{1,2})/);
    if (!m) return "شب";

    const hour = Number(m[1]);
    const period =
      hour >= 0 && hour < 6
        ? "بامداد"
        : hour >= 6 && hour < 12
          ? "صبح"
          : hour >= 12 && hour < 17
            ? "ظهر"
            : hour >= 17 && hour < 20
              ? "عصر"
              : "شب";

    const time = `${m[1].padStart(2, "0")}:${m[2].padStart(2, "0")}`;
    const timeFa = time.replace(/\d/g, (d) => fa[d]);

    return `${timeFa} ${period}`;
  }

  function renderDayPanel() {
    const todayG = new Date();
    const [todayYear, todayMonth, todayDay] = toJalali(
      todayG.getFullYear(),
      todayG.getMonth() + 1,
      todayG.getDate(),
    );

    const key = jKey(selectedY, selectedM, selectedD);
    const md = `${selectedM.toString().padStart(2, "0")}/${selectedD
      .toString()
      .padStart(2, "0")}`;

    const normal = events[key] || [];
    const annual = (events._annual && events._annual[md]) || [];

    const dayEvs = [
      ...normal.map((ev, i) => ({ ev, src: "normal", idx: i })),
      ...annual.map((ev, i) => ({ ev, src: "annual", idx: i })),
    ];

    const panel = container.querySelector("#day-panel");
    if (!panel) return;

    const g = jalaliToGregorian(selectedY, selectedM, selectedD);
    const gy = g.getUTCFullYear();
    const gm = g.getUTCMonth() + 1;
    const gd = g.getUTCDate();

    let moonBlock = "";
    try {
      const moon = getMoonInScorpioWindow(gd, gm, gy, 3.5);
      let moonMsg = "";
      if (!moon.inScorpio) {
        moonMsg = "";
      } else if (moon.fullDay) {
        moonMsg = "امروز ماه کاملاً در برج عقرب است.";
      } else if (moon.entryToday && moon.exitToday) {
        const startPart = moon.startLabel
          ? `از ساعت <span style="color:deeppink;">${getPeriodFromLabel(moon.startLabel)}</span>`
          : "از ابتدای روز";

        const endPart = moon.endLabel
          ? `تا ساعت <span style="color:deeppink;">${getPeriodFromLabel(moon.endLabel)}</span>`
          : "تا پایان شب";

        moonMsg = `امروز ${startPart} ${endPart} قمر در عقرب است.`;
      } else if (moon.entryToday) {
        const startPart = moon.startLabel
          ? `از ساعت <span style="color:deeppink;">${getPeriodFromLabel(moon.startLabel)}</span>`
          : "از ابتدای روز";

        moonMsg = `قمر در عقرب امروز ${startPart} آغاز می‌شود.`;
      } else if (moon.exitToday) {
        const endPart = moon.endLabel
          ? `تا ساعت <span style="color:deeppink;">${getPeriodFromLabel(moon.endLabel)}</span>`
          : "تا پایان شب";

        moonMsg = `قمر در عقرب امروز ${endPart} ادامه دارد.`;
      }

      if (moon?.inScorpio) {
        moonBlock = `
          <span class="mis-icon">${MOON_IN_SCORPIO()}</span>
          <span>${moonMsg}</span>
        `;
      } else {
        moonBlock = ``;
      }
    } catch (err) {
      console.error("moon block error:", err);
      moonBlock = "";
    }

    if (!dayEvs.length) {
      panel.innerHTML = `
        ${moonBlock ? `<div class="mis-item mis-item-panel">${moonBlock}</div>` : ""}
        <p class="no-ev">
          رویدادی برای ${getDayName(selectedY, selectedM, selectedD)}، ${selectedD} ${MONTH_NAMES[selectedM - 1]} ${selectedY} ثبت نشده
        </p>
      `;
      EventBus.getCurrentContext = () => ({ year: curY, month: curM });
      EventBus.emit("calendarUpdate");
      return;
    }

    panel.innerHTML = `
    <div class="day-panel-header">${getDayName(selectedY, selectedM, selectedD)}، ${selectedD} ${MONTH_NAMES[selectedM - 1]} ${selectedY}</div>
    ${moonBlock ? `<div class="mis-item mis-item-panel">${moonBlock}</div>` : ""}
    ${dayEvs
      .map(({ ev, src, idx }) => {
        const reaction =
          src === "annual"
            ? getAnnualReaction(ev, String(selectedY))
            : ev.reaction;

        return `
          <div class="ev-item ev-item-panel${
            reaction ? " has-reaction" : ""
          }" style="border-right:4px solid ${
            EVENT_TYPES[ev.type]?.color || "#999"
          };position:relative" data-ev-index="${idx}" data-src="${src}">
            <span class="ev-dot" style="background:${
              EVENT_TYPES[ev.type]?.color || "#999"
            }"></span>
            <span class="ev-label">${EVENT_TYPES[ev.type]?.label || ev.type}</span>
            ${ev.priority ? `<span class="ev-priority-badge">⭐</span>` : ""}
            ${
              (selectedY < todayYear ||
                (selectedY === todayYear && selectedM < todayMonth) ||
                (selectedY === todayYear &&
                  selectedM === todayMonth &&
                  selectedD < todayDay)) &&
              ev.priority
                ? `<span class="cal-signs-expired-label">رد شده</span>`
                : ""
            }
            ${ev.clock ? `<span class="ev-clock-badge">⏰</span>` : ""}
            ${ev.text ? `<span class="ev-text">— ${ev.text}</span>` : ""}
            ${
              ev.clockTimes
                ? `<span class="ev-clock-times">${ev.clockTimes}</span>`
                : ""
            }
            ${
              reaction
                ? `<span class="ev-reaction-badge" data-tooltip="${reaction.text}">${reaction.emoji}</span>`
                : ""
            }
            ${ev.ts ? `<span class="ev-timestamp">${ev.ts}</span>` : ""}
            ${ev.repeatId ? `<span class="ev-repeat-badge">🔁</span>` : ""}
            ${ev.annual ? `<span class="annual-icon">♾️</span>` : ""}
            ${
              !reaction
                ? `<button class="ev-reaction-btn" data-idx="${idx}" data-src="${src}">💬</button>`
                : ""
            }
          </div>`;
      })
      .join("")}`;

    panel.querySelectorAll(".ev-reaction-btn").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = +btn.dataset.idx;
        const src = btn.dataset.src || "normal";
        openReactionPopup(key, idx, btn, src, md);
      };
    });

    EventBus.getCurrentContext = () => ({ year: curY, month: curM });
    EventBus.emit("calendarUpdate");
  }

  function openReactionPopup(key, idx, anchorBtn, src = "normal", md = "") {
    document.querySelectorAll(".reaction-popup").forEach((p) => p.remove());
    document.querySelectorAll(".reaction-overlay").forEach((o) => o.remove());

    const list =
      src === "annual"
        ? (events._annual && events._annual[md]) || []
        : events[key] || [];

    const ev = list[idx];
    if (!ev) return;

    const typeName = EVENT_TYPES[ev.type]?.label || ev.type;
    const typeIcon =
      EVENT_TYPES[ev.type]?.icon ||
      `💬 ══◄ <span style="color:deeppink;">${getDayName(
        selectedY,
        selectedM,
        selectedD,
      )}، ${selectedD} ${MONTH_NAMES[selectedM - 1]} ${selectedY}</span> —`;
    const evText = ev.text ? ` — ${ev.text}` : "";
    const clockInfo = ev.clockTimes ? ` — ⏰ راس ساعت: ${ev.clockTimes}` : "";

    const overlay = document.createElement("div");
    overlay.className = "reaction-overlay";
    document.body.appendChild(overlay);

    const popup = document.createElement("div");
    popup.className = "reaction-popup";
    popup.innerHTML = `
      <div class="reaction-popup-header">
        <span class="reaction-popup-title">${typeIcon} ${typeName}${evText}${clockInfo}</span>
      </div>
      <div class="reaction-emojis">
        ${REACTIONS.map(
          (r) =>
            `<button class="reaction-emoji-btn" data-emoji="${r.emoji}" title="${r.label}">${r.emoji}</button>`,
        ).join("")}
      </div>
      <div class="reaction-row">
        <div class="reaction-row">
          <textarea class="reaction-text-input" placeholder="یه چیزی بنویس..." maxlength="80" rows="2"></textarea>
          <div class="reaction-actions">
            <button class="reaction-submit">ثبت</button>
            <button class="reaction-cancel">بیخیال</button>
          </div>
      </div>
    `;

    document.body.appendChild(popup);

    let selectedEmoji = "";

    popup.querySelectorAll(".reaction-emoji-btn").forEach((eb) => {
      eb.onclick = () => {
        popup
          .querySelectorAll(".reaction-emoji-btn")
          .forEach((x) => x.classList.remove("active"));
        eb.classList.add("active");
        selectedEmoji = eb.dataset.emoji;
      };
    });

    function closePopup() {
      popup.remove();
      overlay.remove();
    }

    overlay.addEventListener("click", closePopup);
    popup.querySelector(".reaction-cancel").onclick = closePopup;

    // --- کمک برای ساخت ID ثابت رویداد سالانه ---
    function ensureAnnualId(e) {
      if (!e._aid) {
        e._aid = crypto.randomUUID?.() || String(Date.now() + Math.random());
      }
      return e._aid;
    }

    popup.querySelector(".reaction-submit").onclick = () => {
      const text = popup.querySelector(".reaction-text-input").value.trim();
      if (!selectedEmoji && !text) {
        showToast("یه ایموجی انتخاب کن یا چیزی بنویس");
        return;
      }

      const reaction = {
        emoji: selectedEmoji || "💬",
        text:
          text || REACTIONS.find((r) => r.emoji === selectedEmoji)?.label || "",
        date: getJalaliTimestamp(),
      };

      if (src === "annual") {
        const yearKey = String(selectedY);
        const aid = ensureAnnualId(ev);

        events._annualReactions ??= {};
        events._annualReactions[yearKey] ??= {};
        events._annualReactions[yearKey][aid] = reaction;

        // مطمئن شو ری‌اکشن روی خود رویداد سالانه ذخیره نشه
        if (ev.reaction) delete ev.reaction;
      } else {
        list[idx].reaction = reaction;
      }

      saveEvents(events);
      renderDayPanel();
      showToast("✅ ری‌اکشن ثبت شد");
      closePopup();
    };
  }

  function render() {
    const firstDay = jalaliToGregorian(curY, curM, 1);
    const startOffset = (firstDay.getUTCDay() + 1) % 7;
    const total = daysInMonth(curY, curM);
    const prevM = curM === 1 ? 12 : curM - 1;
    const prevY = curM === 1 ? curY - 1 : curY;
    const nextM = curM === 12 ? 1 : curM + 1;
    const nextY = curM === 12 ? curY + 1 : curY;
    const seasonColor = getSeasonColor(curM);

    let cells = "";
    for (let i = 0; i < startOffset; i++)
      cells += `<div class="cal-cell empty"></div>`;
    for (let d = 1; d <= total; d++) {
      const key = jKey(curY, curM, d);
      const md = `${curM.toString().padStart(2, "0")}/${d
        .toString()
        .padStart(2, "0")}`;

      const normal = events[key] || [];
      const annual = (events._annual && events._annual[md]) || [];
      const dayEvs = [...normal, ...annual];

      const isToday = d === td && curM === tm && curY === ty;
      const isSelected =
        d === selectedD && curM === selectedM && curY === selectedY;
      const col = (startOffset + d - 1) % 7;
      const isFriday = col === 6;

      const hasPriority = dayEvs.some((ev) => ev.priority);
      const hasClock = dayEvs.some((ev) => ev.clock);
      const hasAnnual = annual && annual.length > 0;

      const g = jalaliToGregorian(curY, curM, d);
      const gy = g.getUTCFullYear();
      const gm = g.getUTCMonth() + 1;
      const gd = g.getUTCDate();

      const moon = getMoonInScorpioWindow(gd, gm, gy, 3.5);
      const hasMoonInScorpio = moon.inScorpio;
      const hasRepeat = dayEvs.some((ev) => ev.repeatId);
      const gDateCell = jalaliToGregorian(curY, curM, d);
      const isPast =
        gDateCell.getTime() <
        new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const isPriorityExpired = hasPriority && isPast;

      const grouped = {};
      dayEvs.forEach((ev) => {
        grouped[ev.type] = (grouped[ev.type] || 0) + 1;
      });

      const dots = Object.entries(grouped)
        .map(
          ([type, count]) =>
            `<span class="cal-dot-badge" style="background:${
              EVENT_TYPES[type]?.color || "#999"
            }">${count > 1 ? count : ""}</span>`,
        )
        .join("");

      cells += `
        <div class="cal-cell${isToday ? " today" : ""}${isSelected ? " selected" : ""}${
          isFriday ? " friday" : ""
        }${hasPriority ? " has-priority" : ""}${
          isPriorityExpired ? " priority-expired" : ""
        }${hasClock ? " has-clock" : ""}" data-d="${d}">
        ${
          hasPriority || hasClock
            ? `<div class="priority-top-row">
                ${hasPriority ? `<span class="priority-indicator">⭐</span>` : ""}
                ${isPriorityExpired ? `<span class="expired-label">رد شده</span>` : ""}
                ${hasClock ? `<span class="clock-indicator">⏰</span>` : ""}
                <span class="cal-add-btn" data-d="${d}">+</span>
              </div>`
            : ""
        }
        <span class="cal-day-num">${d}</span>
        ${!hasPriority && !hasClock ? `<span class="cal-add-btn" data-d="${d}">+</span>` : ""}
        ${dots ? `<div class="cal-dots">${dots}</div>` : ""}
        ${
          hasAnnual || hasRepeat || hasMoonInScorpio
            ? `<div class="cell-bottom-left">
                ${hasAnnual ? `<span class="annual-icon">♾️</span>` : ""}
                ${hasRepeat ? `<span class="ev-repeat-badge-small">🔁</span>` : ""}
                ${hasMoonInScorpio ? `<span class="ev-repeat-badge-small">${MOON_IN_SCORPIO()}</span>` : ""}
              </div>`
            : ""
        }
        </div>`;
    }

    const today = new Date();

    const gregoryStr = today.toLocaleDateString("en", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      calendar: "gregory",
    });

    const hijriStr = today.toLocaleDateString("ar", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      calendar: "islamic-umalqura",
    });

    const m = today.getMonth() + 1;
    const d = today.getDate();

    const zodiac =
      ZODIAC_SIGNS.find(
        (z) => m < z.end[0] || (m === z.end[0] && d <= z.end[1]),
      ) || ZODIAC_SIGNS[0];

    const coincidenceItems = `
      <span style="color:blue;">📅 ${gregoryStr}</span>
      <span style="color:purple;">${zodiac.symbol} برج فلکی: ${zodiac.name}</span>
      <span style="color:green;">🌙 ${hijriStr}</span>
    `;

    const legendItems = Object.entries(EVENT_TYPES)
      .map(
        ([k, v]) =>
          `<div class="legend-item">
        <span class="legend-dot" style="background:${v.color}"></span>
        :
        <span>${v.label}</span>
      </div>`,
      )
      .join("");

    container.innerHTML = `
      <div class="cal-header" style="background:${seasonColor}">
        <button class="cal-nav" id="cal-prev">▶ ماه قبل</button>
        <div class="cal-title">
          <span>
            <div class="notification-bell-container">
              <div class="notification-bell-icon" id="notificationBell">
                <svg class="bell-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
                </svg>

                <span class="bell-badge" id="bellBadge">0</span>
                <span class="bell-star" id="bellStar">⭐</span>
              </div>

              <div class="bell-dropdown" id="bellDropdown">
                <div class="bell-dropdown-header">
                  <span>یادآورها</span>
                  <button class="bell-settings-btn">
                    ⚙️ تنظیمات
                  </button>
                </div>
                
                <div id="bellDropdownBody">
                  
                </div>
              </div>
            </div>
          </span>
          <span class="cal-month">${MONTH_NAMES[curM - 1]}</span>
          <span class="cal-year">${curY}</span>
        </div>
        <button class="cal-nav" id="cal-next">ماه بعد ◀</button>
      </div>
      <div class="cal-today-row" style="background:${seasonColor}">
        <button class="cal-arrow" id="cal-yesterday">▶ دیروز</button>
        <button id="cal-today-btn">
          <span>برو به امروز</span>
          <span>${formatJalaliDate()}</span>
        </button>
        <button class="cal-arrow" id="cal-tomorrow">فردا ◀</button>
      </div>
      <div class="cal-weekdays">${DAY_NAMES.map((d) => `<div>${d}</div>`).join("")}</div>
      <div class="cal-grid">${cells}</div>
      <div class=cal-signs>
        <div class="signs-title">راهنمای نشانه‌ها:</div>
        <div class="signs-items">
          <span><span class="priority-indicator">⭐</span>: برای رویدادهای با اولویت بالا</span>
          <span><span class="cal-signs-expired-label">رد شده</span>: برای رویدادهای با اولویت بالا که زمان آن‌ها گذشته است</span>
          <span><span class="clock-indicator">⏰</span>: برای رویدادهایی که باید رأس ساعت تعیین‌شده انجام شوند</span>
          <span><span class="ev-repeat-badge">🔁</span>: برای رویدادهایی که به‌صورت تکراری ایجاد شده‌اند</span>
          <span><span class="annual-icon">♾️</span>: برای رویدادهایی که هر سال تکرار می‌شوند</span>
          <span><span class="mis-icon">${MOON_IN_SCORPIO()}</span>: برای نمایش ایام قمر در عقرب در تقویم با دقت ± 2 ساعت و گاهی بیشتر</span>
        </div>
      </div>
      <div id="day-panel" class="day-panel"></div>
      <div class="cal-coincidence">
        <div class="coincidence-title"><span style="color:orange;">امروز ${formatJalaliDate()} مصادف است با:</span></div>
        <div class="coincidence-items">${coincidenceItems}</div>
        <div class="cal-wrench-section">
          <button class="cal-wrench-toggle" id="cal-wrench-toggle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
              امکانات و ابزارها
              <span class="cal-wrench-arrow" id="cal-wrench-arrow">▼</span>
          </button>
          <div class="cal-wrench-panel" id="cal-wrench-panel">
            <button class="cal-age-btn age-btn" id="cal-age">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/>
                <path d="M4 16h16"/>
                <path d="M12 7V3"/>
                <path d="M8 7V5"/>
                <path d="M16 7V5"/>
                <rect x="2" y="21" width="20" height="0"/>
                <path d="M12 3a1 1 0 0 1 0 2 1 1 0 0 1 0-2"/>
              </svg>
              من چند سالمه
            </button>
            <button class="cal-date-convert-btn date-convert-btn" id="cal-date-convert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <path d="M9 16l3-3 3 3"/>
                <path d="M15 14l-3 3-3-3"/>
              </svg>
              تبدیل تاریخ
            </button>
            <button class="cal-events-btn" id="cal-events-month">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              تمام یادآوری های ${MONTH_NAMES[curM - 1]}
            </button>
            <button class="cal-diary-btn" id="cal-diary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                <line x1="8" y1="7" x2="16" y2="7"/>
                <line x1="8" y1="11" x2="13" y2="11"/>
              </svg>
              دفترچه خاطرات
            </button>
          </div>
        </div>
      </div>
      <div class="cal-legend">
        <div class="legend-title">راهنمای رنگ‌ها و نمادها:</div>
        <div class="legend-items">${legendItems}</div>
        <div class="cal-settings-section">
          <button class="cal-settings-toggle" id="cal-settings-toggle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            تنظیمات و مدیریت
            <span class="cal-settings-arrow" id="cal-settings-arrow">▼</span>
          </button>
          <div class="cal-settings-panel" id="cal-settings-panel">
            <button class="cal-backup-btn export-btn" id="cal-export">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              خروجی رویدادها
            </button>
            <button class="cal-backup-btn import-btn" id="cal-import">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              ورود رویدادها
            </button>
            <button class="cal-clear-btn" id="cal-clear-month">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
              </svg>
              پاک‌سازی ${MONTH_NAMES[curM - 1]}
            </button>
            <button class="cal-clear-btn" id="cal-clear-year">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
              </svg>
              پاک‌سازی سال ${curY}
            </button>
          </div>
        </div>
      </div>
      <div class="cal-footer">
        <span>طراحی و توسعه توسط </span>
        <button class="cal-dev-btn" id="cal-dev-btn">جاهد کبیری</button>
        &nbsp;---&nbsp;<span id="copyrightYear"></span>© 
      </div>
      <div class="cal-dev-overlay" id="cal-dev-overlay">
        <div class="cal-dev-card">
          <button class="cal-dev-close" id="cal-dev-close">✕</button>
          <img class="cal-dev-avatar" src="https://github.com/slowwitted.png" loading="lazy" decoding="async" alt="SlowWitted" onerror="this.style.display='none'">
          <h3 class="cal-dev-name">جاهد کبیری</h3>
          <p class="cal-dev-role">توسعه‌دهنده ابزارها و فرایندها</p>
          <div class="cal-dev-links">
            <a href="https://github.com/slowwitted" target="_blank">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/></svg>
            </a>
            <a href="https://t.me/jahedkabiri" target="_blank">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6.54l-1.37 6.47c-.1.46-.37.58-.75.36l-2.07-1.53-1 .96c-.11.11-.2.2-.42.2l.15-2.13 3.87-3.5c.17-.15-.04-.23-.26-.09l-4.79 3.01-2.06-.64c-.45-.14-.46-.45.09-.67l8.04-3.1c.38-.14.7.09.58.66z"/></svg>
            </a>
            <a href="mailto:jahed.kabiri@gmail.com">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </a>
          </div>
          <p class="cal-dev-desc">این تقویم با ❤️ طراحی و توسعه داده شده است.</p>
        </div>
      </div>
    `;

    container.querySelector("#cal-prev").onclick = () => {
      curY = prevY;
      curM = prevM;
      render();
      updateNotificationBell(prevY, prevM);
    };
    container.querySelector("#cal-next").onclick = () => {
      curY = nextY;
      curM = nextM;
      render();
      updateNotificationBell(nextY, nextM);
    };
    container.querySelector("#cal-today-btn").onclick = () => {
      curY = ty;
      curM = tm;
      selectedY = ty;
      selectedM = tm;
      selectedD = td;
      render();
      updateNotificationBell(ty, tm);
    };
    container.querySelector("#cal-yesterday").onclick = () => {
      changeSelectedDay(-1);
      updateNotificationBell(curY, curM);
    };

    container.querySelector("#cal-tomorrow").onclick = () => {
      changeSelectedDay(1);
      updateNotificationBell(curY, curM);
    };

    container.querySelectorAll(".cal-cell[data-d]").forEach((cell) => {
      const d = +cell.dataset.d;
      cell.onclick = (e) => {
        if (e.target.classList.contains("cal-add-btn")) return;
        selectedY = curY;
        selectedM = curM;
        selectedD = d;
        render();
      };
    });

    container.querySelectorAll(".cal-add-btn").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        openEventModal(curY, curM, +btn.dataset.d, events, render);
      };
    });

    function sanitizeDateInput(input) {
      input.addEventListener("input", () => {
        let val = input.value.replace(/[^0-9]/g, "");
        const max = parseInt(input.max) || 9999;
        if (parseInt(val) > max) val = String(max);
        input.value = val;
      });

      input.addEventListener("keydown", (e) => {
        if (["e", "E", "-", "+", "."].includes(e.key)) {
          e.preventDefault();
        }
      });
    }

    function initBellDropdown() {
      const bellIcon = document.getElementById("notificationBell");
      const bellDropdown = document.getElementById("bellDropdown");

      if (!bellIcon || !bellDropdown) {
        console.error("Bell elements not found!");
        return;
      }

      bellIcon.addEventListener("click", (e) => {
        e.stopPropagation();

        renderBellDropdown();

        bellDropdown.classList.toggle("show");
      });
    }

    function renderBellDropdown() {
      const dropdownBody = document.getElementById("bellDropdownBody");
      if (!dropdownBody) return;

      const now = new Date();
      const [todayY, todayM, todayD] = toJalali(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
      );

      const isCurrentMonth = curY === todayY && curM === todayM;
      const displayMode = getBellDisplayMode();

      let html = "";

      const importantEvents = getImportantMonthlyEventsForDropdown(curY, curM);

      if (displayMode === "priority") {
        if (importantEvents.length > 0) {
          html += '<div class="bell-dropdown-section">';
          html += '<div class="bell-section-title">رویدادهای مهم ماه</div>';

          importantEvents.forEach((item) => {
            const { year, month, day } = item.date;
            const evt = item.event;

            const isPriorityExpired =
              evt.priority &&
              (curY < todayY ||
                (curY === todayY && curM < todayM) ||
                (curY === todayY && curM === todayM && day < todayD));

            html += `<div class="bell-reminder-item" style="border-right:4px solid ${EVENT_TYPES[evt.type]?.color || "#999"}">`;
            html += `<span>${evt.priority ? `⭐` : ""}</span>`;
            if (isPriorityExpired)
              html += `<span class="cal-signs-expired-label">رد شده</span>`;
            html += `<span>${evt.clock ? `⏰` : ""}</span>`;
            html += `<span class="bell-reminder-text">${EVENT_TYPES[evt.type]?.label} - ${evt.text}</span>`;
            html += `<span class="bell-reminder-date">${day} ${MONTH_NAMES[month - 1]}</span>`;
            html += `<span>${evt.repeatId ? `🔁` : ""}</span>`;
            html += `<span>${evt.annual ? `♾️` : ""}</span>`;
            html += "</div>";
          });

          html += "</div>";
        } else {
          html +=
            '<div class="bell-dropdown-empty">رویداد مهمی برای نمایش وجود ندارد</div>';
        }

        dropdownBody.innerHTML = html;
        return;
      }

      if (isCurrentMonth) {
        const weeklyEvents = getWeeklyEventsForDropdown(todayY, todayM, todayD);

        if (displayMode === "today") {
          const todayEvents = weeklyEvents.filter(
            (item) =>
              item.date.year === todayY &&
              item.date.month === todayM &&
              item.date.day === todayD,
          );

          if (todayEvents.length > 0) {
            html += '<div class="bell-dropdown-section">';
            html += '<div class="bell-section-title">رویدادهای امروز</div>';

            todayEvents.forEach((item) => {
              const { year, month, day } = item.date;
              const evt = item.event;

              const isPriorityExpired =
                evt.priority &&
                (curY < todayY ||
                  (curY === todayY && curM < todayM) ||
                  (curY === todayY && curM === todayM && day < todayD));

              html += `<div class="bell-reminder-item" style="border-right:4px solid ${EVENT_TYPES[evt.type]?.color || "#999"}">`;
              html += `<span>${evt.priority ? `⭐` : ""}</span>`;
              if (isPriorityExpired)
                html += `<span class="cal-signs-expired-label">رد شده</span>`;
              html += `<span>${evt.clock ? `⏰` : ""}</span>`;
              html += `<span class="bell-reminder-text">${EVENT_TYPES[evt.type]?.label} - ${evt.text}</span>`;
              html += `<span class="bell-reminder-date">امروز - ${todayD} ${MONTH_NAMES[todayM - 1]}</span>`;
              html += `<span>${evt.repeatId ? `🔁` : ""}</span>`;
              html += `<span>${evt.annual ? `♾️` : ""}</span>`;
              html += "</div>";
            });

            html += "</div>";
          } else {
            html +=
              '<div class="bell-dropdown-empty">رویدادی برای امروز وجود ندارد</div>';
          }

          dropdownBody.innerHTML = html;
          return;
        }

        if (displayMode === "week") {
          if (weeklyEvents.length > 0) {
            html += '<div class="bell-dropdown-section">';
            html += '<div class="bell-section-title">رویدادهای این هفته</div>';

            weeklyEvents.forEach((item) => {
              const { year, month, day } = item.date;
              const evt = item.event;

              const isPriorityExpired =
                evt.priority &&
                (curY < todayY ||
                  (curY === todayY && curM < todayM) ||
                  (curY === todayY && curM === todayM && day < todayD));

              const isToday =
                year === todayY && month === todayM && day === todayD;
              const dayLabel = isToday
                ? `امروز - ${day} ${MONTH_NAMES[month - 1]}`
                : `${day} ${MONTH_NAMES[month - 1]}`;

              html += `<div class="bell-reminder-item" style="border-right:4px solid ${EVENT_TYPES[evt.type]?.color || "#999"}">`;
              html += `<span>${evt.priority ? `⭐` : ""}</span>`;
              if (isPriorityExpired)
                html += `<span class="cal-signs-expired-label">رد شده</span>`;
              html += `<span>${evt.clock ? `⏰` : ""}</span>`;
              html += `<span class="bell-reminder-text">${EVENT_TYPES[evt.type]?.label} - ${evt.text}</span>`;
              html += `<span class="bell-reminder-date">${dayLabel}</span>`;
              html += `<span>${evt.repeatId ? `🔁` : ""}</span>`;
              html += `<span>${evt.annual ? `♾️` : ""}</span>`;
              html += "</div>";
            });

            html += "</div>";
          } else {
            html +=
              '<div class="bell-dropdown-empty">رویدادی برای نمایش وجود ندارد</div>';
          }

          dropdownBody.innerHTML = html;
          return;
        }

        if (weeklyEvents.length > 0) {
          html += '<div class="bell-dropdown-section">';
          html += '<div class="bell-section-title">رویدادهای این هفته</div>';

          weeklyEvents.forEach((item) => {
            const { year, month, day } = item.date;
            const evt = item.event;

            const isPriorityExpired =
              evt.priority &&
              (curY < todayY ||
                (curY === todayY && curM < todayM) ||
                (curY === todayY && curM === todayM && day < todayD));

            const isToday =
              year === todayY && month === todayM && day === todayD;
            const dayLabel = isToday
              ? `امروز - ${day} ${MONTH_NAMES[month - 1]}`
              : `${day} ${MONTH_NAMES[month - 1]}`;

            html += `<div class="bell-reminder-item" style="border-right:4px solid ${EVENT_TYPES[evt.type]?.color || "#999"}">`;
            html += `<span>${evt.priority ? `⭐` : ""}</span>`;
            if (isPriorityExpired)
              html += `<span class="cal-signs-expired-label">رد شده</span>`;
            html += `<span>${evt.clock ? `⏰` : ""}</span>`;
            html += `<span class="bell-reminder-text">${EVENT_TYPES[evt.type]?.label} - ${evt.text}</span>`;
            html += `<span class="bell-reminder-date">${dayLabel}</span>`;
            html += `<span>${evt.repeatId ? `🔁` : ""}</span>`;
            html += `<span>${evt.annual ? `♾️` : ""}</span>`;
            html += "</div>";
          });

          html += "</div>";
        }

        const weeklyEventKeys = new Set(
          weeklyEvents.map(
            (item) =>
              `${item.date.year}/${item.date.month}/${item.date.day}/${item.event.title}`,
          ),
        );

        const uniqueImportantEvents = importantEvents.filter((item) => {
          const key = `${item.date.year}/${item.date.month}/${item.date.day}/${item.event.title}`;
          return !weeklyEventKeys.has(key);
        });

        if (uniqueImportantEvents.length > 0) {
          html += '<div class="bell-dropdown-section">';
          html += '<div class="bell-section-title">رویدادهای مهم ماه</div>';

          uniqueImportantEvents.forEach((item) => {
            const { year, month, day } = item.date;
            const evt = item.event;

            const isPriorityExpired =
              evt.priority &&
              (curY < todayY ||
                (curY === todayY && curM < todayM) ||
                (curY === todayY && curM === todayM && day < todayD));

            html += `<div class="bell-reminder-item" style="border-right:4px solid ${EVENT_TYPES[evt.type]?.color || "#999"}">`;
            html += `<span>${evt.priority ? `⭐` : ""}</span>`;
            if (isPriorityExpired)
              html += `<span class="cal-signs-expired-label">رد شده</span>`;
            html += `<span>${evt.clock ? `⏰` : ""}</span>`;
            html += `<span class="bell-reminder-text">${EVENT_TYPES[evt.type]?.label} - ${evt.text}</span>`;
            html += `<span class="bell-reminder-date">${day} ${MONTH_NAMES[month - 1]}</span>`;
            html += `<span>${evt.repeatId ? `🔁` : ""}</span>`;
            html += `<span>${evt.annual ? `♾️` : ""}</span>`;
            html += "</div>";
          });

          html += "</div>";
        }

        if (weeklyEvents.length === 0 && uniqueImportantEvents.length === 0) {
          html +=
            '<div class="bell-dropdown-empty">رویدادی برای نمایش وجود ندارد</div>';
        }
      } else {
        if (importantEvents.length > 0) {
          html += '<div class="bell-dropdown-section">';
          html += '<div class="bell-section-title">رویدادهای مهم ماه</div>';

          importantEvents.forEach((item) => {
            const { year, month, day } = item.date;
            const evt = item.event;

            const isPriorityExpired =
              evt.priority &&
              (curY < todayY ||
                (curY === todayY && curM < todayM) ||
                (curY === todayY && curM === todayM && day < todayD));

            html += `<div class="bell-reminder-item" style="border-right:4px solid ${EVENT_TYPES[evt.type]?.color || "#999"}">`;
            html += `<span>${evt.priority ? `⭐` : ""}</span>`;
            if (isPriorityExpired)
              html += `<span class="cal-signs-expired-label">رد شده</span>`;
            html += `<span>${evt.clock ? `⏰` : ""}</span>`;
            html += `<span class="bell-reminder-text">${EVENT_TYPES[evt.type]?.label} - ${evt.text}</span>`;
            html += `<span class="bell-reminder-date">${day} ${MONTH_NAMES[month - 1]}</span>`;
            html += `<span>${evt.repeatId ? `🔁` : ""}</span>`;
            html += `<span>${evt.annual ? `♾️` : ""}</span>`;
            html += "</div>";
          });

          html += "</div>";
        } else {
          html +=
            '<div class="bell-dropdown-empty">رویداد مهمی در این ماه وجود ندارد</div>';
        }
      }

      dropdownBody.innerHTML = html;
    }

    function getWeeklyEventsForDropdown(jy, jm, jd) {
      const events = loadEvents();
      const result = [];

      const gDate = jalaliToGregorian(jy, jm, jd);
      const dayOfWeek = new Date(gDate).getDay();
      const jalaliDayOfWeek = (dayOfWeek + 1) % 7;
      const daysUntilFriday = 6 - jalaliDayOfWeek;

      for (let i = 0; i <= daysUntilFriday; i++) {
        const gCurrent = new Date(gDate);
        gCurrent.setDate(gCurrent.getDate() + i);
        const [y, m, d] = toJalali(
          gCurrent.getFullYear(),
          gCurrent.getMonth() + 1,
          gCurrent.getDate(),
        );

        const key = jKey(y, m, d);
        const md = `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}`;

        const normal = events[key] || [];
        const annual = (events._annual && events._annual[md]) || [];
        const dayEvs = [...normal, ...annual];

        dayEvs.forEach((evt) => {
          result.push({
            date: { year: y, month: m, day: d },
            event: evt,
          });
        });
      }

      return result;
    }

    function getImportantMonthlyEventsForDropdown(jy, jm) {
      const events = loadEvents();
      const result = [];
      const monthPrefix = `${jy}/${String(jm).padStart(2, "0")}/`;
      const monthLen = jDaysInMonth(jy, jm);

      for (const key in events) {
        if (key === "_annual") continue;
        if (key.startsWith(monthPrefix)) {
          const dayEvents = events[key];
          const [y, m, d] = key.split("/").map(Number);

          dayEvents.forEach((evt) => {
            if (evt.priority === true) {
              result.push({
                date: { year: y, month: m, day: d },
                event: evt,
              });
            }
          });
        }
      }

      const annual = events._annual || {};
      for (let d = 1; d <= monthLen; d++) {
        const md = `${String(jm).padStart(2, "0")}/${String(d).padStart(2, "0")}`;
        const dayAnnual = annual[md] || [];
        dayAnnual.forEach((evt) => {
          if (evt.priority === true) {
            result.push({
              date: { year: jy, month: jm, day: d },
              event: evt,
            });
          }
        });
      }

      result.sort((a, b) => {
        if (a.date.day !== b.date.day) return a.date.day - b.date.day;
        return 0;
      });

      return result;
    }

    function getWeeklyEventsCount(jy, jm, jd) {
      const events = loadEvents();
      let count = 0;

      const gDate = jalaliToGregorian(jy, jm, jd);
      const dayOfWeek = new Date(gDate).getDay();

      const jalaliDayOfWeek = (dayOfWeek + 1) % 7;

      const daysUntilFriday = 6 - jalaliDayOfWeek;

      for (let i = 0; i <= daysUntilFriday; i++) {
        const gCurrent = new Date(gDate);
        gCurrent.setDate(gCurrent.getDate() + i);
        const [y, m, d] = toJalali(
          gCurrent.getFullYear(),
          gCurrent.getMonth() + 1,
          gCurrent.getDate(),
        );

        const key = jKey(y, m, d);
        if (events[key] && events[key].length > 0) {
          count += events[key].length;
        }
      }

      return count;
    }

    function hasImportantMonthlyEvents(jy, jm) {
      const events = loadEvents();
      const monthPrefix = `${jy}/${String(jm).padStart(2, "0")}/`;

      for (const key in events) {
        if (key.startsWith(monthPrefix)) {
          const dayEvents = events[key];
          for (const evt of dayEvents) {
            if (evt.priority === true) {
              return true;
            }
          }
        }
      }

      return false;
    }

    function getImportantMonthlyEventsCount(jy, jm) {
      const events = loadEvents();
      const monthPrefix = `${jy}/${String(jm).padStart(2, "0")}/`;
      const monthKey = `${String(jm).padStart(2, "0")}/`;
      let count = 0;

      for (const key in events) {
        if (key.startsWith(monthPrefix)) {
          for (const evt of events[key]) {
            if (evt.priority === true) count++;
          }
        }
      }

      if (events._annual) {
        for (const key in events._annual) {
          if (key.startsWith(monthKey)) {
            for (const evt of events._annual[key]) {
              if (evt.priority === true) count++;
            }
          }
        }
      }

      return count;
    }

    function updateNotificationBell(year = null, month = null) {
      const displayYear = year ?? curY;
      const displayMonth = month ?? curM;

      const today = new Date();
      const todayJalali = toJalali(
        today.getUTCFullYear(),
        today.getUTCMonth() + 1,
        today.getUTCDate(),
      );
      const [todayY, todayM, todayD] = todayJalali;

      const isCurrentMonth = displayYear === todayY && displayMonth === todayM;

      let totalCount = 0;
      let hasImportantMonthly = false;

      if (isCurrentMonth) {
        totalCount = getWeeklyEventsCount(todayY, todayM, todayD);
        hasImportantMonthly = hasImportantMonthlyEvents(
          displayYear,
          displayMonth,
        );
      } else {
        const importantCount = getImportantMonthlyEventsCount(
          displayYear,
          displayMonth,
        );
        totalCount = importantCount;
        hasImportantMonthly = importantCount > 0;
      }

      const badge = document.getElementById("bellBadge");
      if (totalCount > 0) {
        badge.textContent = totalCount;
        badge.classList.add("visible");

        if (!isCurrentMonth) {
          badge.classList.add("other-month");
        } else {
          badge.classList.remove("other-month");
        }
      } else {
        badge.classList.remove("visible", "other-month");
      }

      const star = document.getElementById("bellStar");
      if (hasImportantMonthly) {
        star.classList.add("visible");
      } else {
        star.classList.remove("visible");
      }

      const bellSvg = document.querySelector(".bell-svg");
      const seasonColor = getSeasonColor(displayMonth);
      bellSvg.style.fill = seasonColor;
    }

    function openBellSettingsModal() {
      const now = new Date();
      const [todayY, todayM] = toJalali(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
      );

      const isCurrentMonth = curY === todayY && curM === todayM;

      const existing = document.querySelector(".cal-confirm-overlay");
      if (existing) existing.remove();

      const overlay = document.createElement("div");
      overlay.className = "cal-confirm-overlay";

      if (!isCurrentMonth) {
        overlay.innerHTML = `
          <div class="bell-settings-box">
            <p style="color:deeppink;">نمایش تنظیمات یادآورها</p>
            <div class="bell-settings-divider"></div>
            <p style="line-height:1.9; font-size:14px;">
              چون در ماه جاری نیستید، فقط تعداد و محتوای رویدادهای مهم همان ماه نمایش داده می‌شود
              و امکان تنظیمات وجود ندارد.
            </p>
            <div class="cal-confirm-actions">
              <button class="cal-cbtn-cancel" id="bellSettingsClose">بستن</button>
            </div>
          </div>
        `;
      } else {
        overlay.innerHTML = `
          <div class="bell-settings-box">
            <p style="color:deeppink;">نمایش تنظیمات یادآورها</p>
            <div class="bell-settings-divider"></div>

            <div class="bell-settings-options">
              <label class="bell-radio-row">
                <input type="radio" name="bell-display-mode" value="today" />
                فقط رویدادهای امروز
              </label>

              <label class="bell-radio-row">
                <input type="radio" name="bell-display-mode" value="week" />
                فقط رویدادهای هفته جاری
              </label>

              <label class="bell-radio-row">
                <input type="radio" name="bell-display-mode" value="priority" />
                فقط رویدادهای با اولویت بالای این ماه
              </label>

              <label class="bell-radio-row">
                <input type="radio" name="bell-display-mode" value="all" checked />
                همه رویدادهای امروز و هفته جاری و با اولویت بالای این ماه
              </label>
            </div>

            <div class="cal-confirm-actions">
              <button class="cal-cbtn-replace" id="bellSettingsSave">ذخیره</button>
              <button class="cal-cbtn-cancel" id="bellSettingsCancel">انصراف</button>
            </div>
          </div>
        `;
      }

      document.body.appendChild(overlay);

      if (isCurrentMonth) {
        const savedMode = getBellDisplayMode();
        const radio = overlay.querySelector(
          `input[name="bell-display-mode"][value="${savedMode}"]`,
        );
        if (radio) radio.checked = true;

        document.getElementById("bellSettingsCancel").onclick = () => {
          overlay.remove();
        };

        document.getElementById("bellSettingsSave").onclick = () => {
          const selected = overlay.querySelector(
            'input[name="bell-display-mode"]:checked',
          )?.value;

          if (selected) {
            setBellDisplayMode(selected);
            renderBellDropdown();
          }
          overlay.remove();
        };
      } else {
        document.getElementById("bellSettingsClose").onclick = () => {
          overlay.remove();
        };
      }

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.remove();
        }
      });
    }

    function initBellSettingsButton() {
      const btn = document.querySelector(".bell-settings-btn");
      if (!btn) return;

      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        openBellSettingsModal();
      };
    }

    function createModal(
      title,
      bodyHTML,
      footerHTML = "",
      closeOnOverlayClick = true,
    ) {
      const existing = document.querySelector(".cal-overlay");
      if (existing) existing.remove();

      const overlay = document.createElement("div");
      overlay.className = "cal-overlay";

      overlay.innerHTML = `
        <div class="cal-modal">
          <div class="cal-modal-header">
            <span>${title}</span>
            <button class="cal-modal-close">✕</button>
          </div>
          <div class="cal-modal-events">
            ${bodyHTML}
          </div>
          ${footerHTML ? `<div class="cal-modal-add">${footerHTML}</div>` : ""}
        </div>
      `;

      document.body.appendChild(overlay);

      if (closeOnOverlayClick) {
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) overlay.remove();
        });

        const escHandler = (e) => {
          if (e.key === "Escape") {
            overlay.remove();
            document.removeEventListener("keydown", escHandler);
          }
        };
        document.addEventListener("keydown", escHandler);
      }

      overlay
        .querySelector(".cal-modal-close")
        .addEventListener("click", () => {
          overlay.remove();
        });

      return overlay.querySelector(".cal-modal");
    }

    function getMonthNames(calType) {
      if (calType === "shamsi") return MONTH_NAMES;
      if (calType === "qamari") return HIJRI_MONTHS;
      return MILADI_MONTHS;
    }

    function getYearRange(calType) {
      if (calType === "shamsi") return { min: 979, max: 1500 };
      if (calType === "qamari") return { min: 1008, max: 1500 };
      return { min: 1600, max: 2122 };
    }

    function buildMonthSelect(id, calType) {
      const months = getMonthNames(calType);
      const dir = calType === "miladi" ? "ltr" : "rtl";
      const opts = months
        .map((name, i) => `<option value="${i + 1}">${name}</option>`)
        .join("");
      return `<select id="${id}" style="padding:10px 12px; border:1px solid #ddd; border-radius:6px;
        font-family:inherit; font-size:1.05em; min-width:120px; direction:${dir}; text-align:center;">${opts}</select>`;
    }

    function openAgeCalculator() {
      const body = `
        <div style="text-align:center; direction:rtl;">
          <p style="margin-bottom:12px;">📅 تاریخ تولد شمسی خود را وارد کنید:</p>
          <div class="cal-modal-add-row" style="justify-content:center; flex-wrap:wrap;">
            <input type="number" id="age-day" placeholder="روز" min="1" max="31"
              class="date-input date-input-day">
            <span>/</span>
            ${buildMonthSelect("age-month", "shamsi")}
            <span>/</span>
            <input type="number" id="age-year" placeholder="سال (979–1500)" min="979" max="1500"
              class="date-input date-input-year">
          </div>
          <div id="age-result" style="margin-top:16px;"></div>
        </div>
      `;

      const footer = `
        <button id="age-calc-btn" style="width:100%;">🎂 محاسبه سن</button>
      `;

      const modal = createModal("🎂 من چند سالمه؟", body, footer);
      modal.querySelectorAll(".date-input").forEach(sanitizeDateInput);

      modal.querySelector("#age-calc-btn").onclick = () => {
        const by = parseInt(modal.querySelector("#age-year").value);
        const bm = parseInt(modal.querySelector("#age-month").value);
        const bd = parseInt(modal.querySelector("#age-day").value);
        const resultDiv = modal.querySelector("#age-result");

        if (!by || !bm || !bd) {
          resultDiv.innerHTML = `<span style="color:red;">⚠️ لطفاً تمام فیلدها را پر کنید</span>`;
          return;
        }

        if (by < 979 || by > 1500) {
          resultDiv.innerHTML = `<span style="color:red;">⚠️ سال باید بین ۹۷۹ تا ۱۵۰۰ باشد</span>`;
          return;
        }

        if (bd < 1 || bd > 31) {
          resultDiv.innerHTML = `<span style="color:red;">⚠️ روز نامعتبر است</span>`;
          return;
        }

        if (bd > daysInMonth(by, bm)) {
          resultDiv.innerHTML = `<span style="color:red;">⚠️ روز وارد شده برای این ماه معتبر نیست</span>`;
          return;
        }

        const nowRaw = new Date();
        const [ty, tm, td] = toJalali(
          nowRaw.getFullYear(),
          nowRaw.getMonth() + 1,
          nowRaw.getDate(),
        );

        if (
          by > ty ||
          (by === ty && bm > tm) ||
          (by === ty && bm === tm && bd > td)
        ) {
          resultDiv.innerHTML = `<span style="color:red;">⚠️ تاریخ تولد نمی‌تواند در آینده باشد</span>`;
          return;
        }

        let years = ty - by;
        let months = tm - bm;
        let days = td - bd;

        if (days < 0) {
          months--;
          const prevMonth = tm - 1 > 0 ? tm - 1 : 12;
          const prevMonthYear = tm - 1 > 0 ? ty : ty - 1;
          days += daysInMonth(prevMonthYear, prevMonth);
        }

        if (months < 0) {
          years--;
          months += 12;
        }

        const birthDate = jalaliToGregorian(by, bm, bd);
        const todayDate = jalaliToGregorian(ty, tm, td);

        const totalDays = Math.round(
          (todayDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        let nextBirthYear = ty;
        if (bm < tm || (bm === tm && bd <= td)) {
          nextBirthYear = ty + 1;
        }

        let nextBirthDay = bd;
        if (nextBirthDay > daysInMonth(nextBirthYear, bm)) {
          nextBirthDay = daysInMonth(nextBirthYear, bm);
        }

        const nextBirthDate = jalaliToGregorian(
          nextBirthYear,
          bm,
          nextBirthDay,
        );

        const daysToNextBirth = Math.round(
          (nextBirthDate.getTime() - todayDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        const dayName = getDayName(nextBirthYear, bm, nextBirthDay);

        resultDiv.innerHTML = `
          <div class="age-result-card">
            <div class="age-main">🎉 سن شما: <strong>${years} سال و ${months} ماه و ${days} روز</strong></div>
            <div class="age-detail">📊 مجموعاً <strong>${totalDays.toLocaleString("fa-IR")}</strong> روز زندگی کرده‌اید</div>
            <div class="age-detail">🎈 تولد بعدی: <strong>${daysToNextBirth}</strong> روز دیگه (${dayName} ${nextBirthDay} ${MONTH_NAMES[bm - 1]} ${nextBirthYear})</div>
          </div>
        `;
      };
    }

    function openDateConverter() {
      function buildInputsHTML(calType) {
        const yr = getYearRange(calType);
        return `
          <div class="cal-modal-add-row" style="justify-content:center; margin-top:12px; flex-wrap:wrap;">
            <input type="number" id="conv-day" placeholder="روز" min="1" max="31"
              class="date-input date-input-day">
            <span>/</span>
            ${buildMonthSelect("conv-month", calType)}
            <span>/</span>
            <input type="number" id="conv-year" placeholder="سال (${yr.min}–${yr.max})" min="${yr.min}" max="${yr.max}"
              class="date-input date-input-year">
          </div>
        `;
      }

      const body = `
        <div style="text-align:center; direction:rtl;">
          <div class="cal-modal-checks" style="flex-wrap:wrap;">
            <label style="font-size:14px; font-weight:bold;">از:</label>
            <select id="conv-from" style="padding:8px 12px; border:1px solid #ddd; border-radius:6px; font-family:inherit; font-size:13px;">
              <option value="shamsi">شمسی</option>
              <option value="miladi">میلادی</option>
              <option value="qamari">قمری</option>
            </select>
            <label style="font-size:14px; font-weight:bold;">←</label>
            <select id="conv-to" style="padding:8px 12px; border:1px solid #ddd; border-radius:6px; font-family:inherit; font-size:13px;">
              <option value="miladi">میلادی</option>
              <option value="shamsi">شمسی</option>
              <option value="qamari">قمری</option>
            </select>
          </div>
          <div id="conv-inputs">
            ${buildInputsHTML("shamsi")}
          </div>
          <div id="conv-result" style="margin-top:16px;"></div>
        </div>
      `;

      const footer = `
        <button id="conv-btn" style="width:100%;">📅 تبدیل</button>
      `;

      const modal = createModal("📅 تبدیل تاریخ", body, footer);

      const fromSelect = modal.querySelector("#conv-from");
      const toSelect = modal.querySelector("#conv-to");
      const inputsContainer = modal.querySelector("#conv-inputs");

      function updateToOptions() {
        const fromVal = fromSelect.value;
        const allOptions = [
          { value: "shamsi", label: "شمسی" },
          { value: "miladi", label: "میلادی" },
          { value: "qamari", label: "قمری" },
        ];
        const prevTo = toSelect.value;
        toSelect.innerHTML = "";
        allOptions.forEach((opt) => {
          if (opt.value !== fromVal) {
            const o = document.createElement("option");
            o.value = opt.value;
            o.textContent = opt.label;
            if (opt.value === prevTo) o.selected = true;
            toSelect.appendChild(o);
          }
        });
      }

      fromSelect.addEventListener("change", () => {
        updateToOptions();
        inputsContainer.innerHTML = buildInputsHTML(fromSelect.value);
      });
      updateToOptions();

      modal.querySelectorAll(".date-input").forEach(sanitizeDateInput);

      fromSelect.addEventListener("change", () => {
        updateToOptions();
        inputsContainer.innerHTML = buildInputsHTML(fromSelect.value);
        modal.querySelectorAll(".date-input").forEach(sanitizeDateInput);
      });

      function hijriToGregorian(hy, hm, hd) {
        const jd =
          Math.floor((11 * hy + 3) / 30) +
          354 * hy +
          30 * hm -
          Math.floor((hm - 1) / 2) +
          hd +
          1948440 -
          385;

        let l = jd + 68569;
        const n = Math.floor((4 * l) / 146097);
        l = l - Math.floor((146097 * n + 3) / 4);
        const i = Math.floor((4000 * (l + 1)) / 1461001);
        l = l - Math.floor((1461 * i) / 4) + 31;
        const j = Math.floor((80 * l) / 2447);
        const day = l - Math.floor((2447 * j) / 80);
        l = Math.floor(j / 11);
        const month = j + 2 - 12 * l;
        const year = 100 * (n - 49) + i + l;

        const d = new Date(year, month - 1, day);
        d.setFullYear(year);
        return d;
      }

      function gregorianToHijri(gDate) {
        const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        });
        const parts = formatter.formatToParts(gDate);
        const y = parseInt(parts.find((p) => p.type === "year").value);
        const m = parseInt(parts.find((p) => p.type === "month").value);
        const d = parseInt(parts.find((p) => p.type === "day").value);
        return [y, m, d];
      }

      modal.querySelector("#conv-btn").onclick = () => {
        const y = parseInt(modal.querySelector("#conv-year").value);
        const m = parseInt(modal.querySelector("#conv-month").value);
        const d = parseInt(modal.querySelector("#conv-day").value);
        const from = fromSelect.value;
        const to = toSelect.value;
        const resultDiv = modal.querySelector("#conv-result");

        if (!y || !m || !d) {
          resultDiv.innerHTML = `<span style="color:red;">⚠️ لطفاً تمام فیلدها را پر کنید</span>`;
          return;
        }

        const yr = getYearRange(from);
        if (y < yr.min || y > yr.max) {
          resultDiv.innerHTML = `<span style="color:red;">⚠️ سال باید بین ${yr.min} تا ${yr.max} باشد</span>`;
          return;
        }

        if (d < 1 || d > 31) {
          resultDiv.innerHTML = `<span style="color:red;">⚠️ روز نامعتبر است</span>`;
          return;
        }

        let gregDate;

        if (from === "shamsi") {
          gregDate = jalaliToGregorian(y, m, d);
        } else if (from === "miladi") {
          gregDate = new Date(y, m - 1, d);
          gregDate.setFullYear(y);
        } else if (from === "qamari") {
          gregDate = hijriToGregorian(y, m, d);
        }

        if (!gregDate || isNaN(gregDate.getTime())) {
          resultDiv.innerHTML = `<span style="color:red;">⚠️ تاریخ وارد شده معتبر نیست</span>`;
          return;
        }

        let resultText = "";

        if (to === "shamsi") {
          const parts = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          }).formatToParts(gregDate);

          const shamsiStr = `${parts.find((p) => p.type === "weekday")?.value}، ${parts.find((p) => p.type === "day")?.value} ${parts.find((p) => p.type === "month")?.value} ${parts.find((p) => p.type === "year")?.value}`;

          resultText = `
            <div class="age-result-card">
              <div class="age-main">🗓️ تاریخ شمسی:</div>
              <div class="age-detail" style="font-size:20px; margin-top:8px;">
                <strong>${shamsiStr}</strong>
              </div>
            </div>
          `;
        } else if (to === "miladi") {
          const miladiStr = gregDate.toLocaleDateString("en", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
            calendar: "gregory",
          });
          resultText = `
            <div class="age-result-card">
              <div class="age-main">🗓️ تاریخ میلادی:</div>
              <div class="age-detail" style="font-size:20px; margin-top:8px;">
                <strong>${miladiStr}</strong>
              </div>
            </div>
          `;
        } else if (to === "qamari") {
          const qamariStr = gregDate.toLocaleDateString("ar", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
            calendar: "islamic-umalqura",
          });
          resultText = `
            <div class="age-result-card">
              <div class="age-main">🗓️ تاریخ قمری:</div>
              <div class="age-detail" style="font-size:20px; margin-top:8px;">
                <strong>${qamariStr}</strong>
              </div>
            </div>
          `;
        }

        resultDiv.innerHTML = resultText;
      };
    }

    function openMonthEvents() {
      const events = loadEvents();
      const monthName = MONTH_NAMES[curM - 1];

      const todayG = new Date();
      const [todayYear, todayMonth, todayDay] = toJalali(
        todayG.getFullYear(),
        todayG.getMonth() + 1,
        todayG.getDate(),
      );

      const monthLen = jDaysInMonth(curY, curM);
      let rows = [];

      function buildRow(ev, dayNum) {
        let eventDisplay = "";
        if (typeof ev === "string") {
          eventDisplay = ev;
        } else {
          const typeInfo = EVENT_TYPES[ev.type] || {};
          const label = typeInfo.label || "";
          const text = ev.text || "";
          const clockInfo = ev.clockTimes
            ? `⏰ راس ساعت: ${ev.clockTimes}`
            : "";
          if (label) {
            eventDisplay = text
              ? `${label} — ${text}${clockInfo}`
              : `${label}${clockInfo}`;
          } else {
            eventDisplay = text + clockInfo;
          }
        }

        const isPast =
          curY < todayYear ||
          (curY === todayYear && curM < todayMonth) ||
          (curY === todayYear && curM === todayMonth && dayNum < todayDay);

        const hasPriority = !!ev.priority;
        const isPriorityExpired = hasPriority && isPast;

        const badges =
          (ev.priority ? `<span class="ev-priority-badge">⭐</span>` : "") +
          (isPriorityExpired
            ? `<span class="cal-signs-expired-label">رد شده</span>`
            : "") +
          (ev.clock ? `<span class="ev-clock-badge">⏰</span>` : "") +
          (ev.repeatId ? `<span class="ev-repeat-badge">🔁</span>` : "") +
          (ev.annual ? `<span class="annual-icon">♾️</span>` : "");

        const reactionStr = ev.reaction
          ? `<span class="ev-reaction-badge" data-tooltip="${ev.reaction.text || ""}">${ev.reaction.emoji || ""}</span> ${ev.reaction.text || ""}`
          : `<span style="color:#999;">—</span>`;

        rows.push({
          day: dayNum,
          event: eventDisplay,
          badges,
          reaction: reactionStr,
        });
      }

      for (let d = 1; d <= monthLen; d++) {
        const key = jKey(curY, curM, d);
        const md = `${String(curM).padStart(2, "0")}/${String(d).padStart(2, "0")}`;

        const normal = events[key] || [];
        const annual = (events._annual && events._annual[md]) || [];
        const dayEvs = [...normal, ...annual];

        dayEvs.forEach((ev) => buildRow(ev, d));
      }

      rows.sort((a, b) => a.day - b.day);

      let content;
      if (rows.length === 0) {
        content = `<div style="text-align:center; padding:20px; color:#888;">📭 هیچ رویدادی در ${monthName} ${curY} ثبت نشده</div>`;
      } else {
        content = `
          <div class="month-events-scroll">
            <table class="month-events-table">
              <thead>
                <tr>
                  <th>روز</th>
                  <th>رویداد</th>
                  <th>وضعیت</th>
                  <th>واکنش</th>
                </tr>
              </thead>
              <tbody>
                ${rows
                  .map(
                    (r) => `
                      <tr>
                        <td class="col-day">${r.day}</td>
                        <td class="col-event">${r.event}</td>
                        <td class="col-status">${r.badges || `<span style="color:#999;">—</span>`}</td>
                        <td class="col-reaction">${r.reaction}</td>
                      </tr>
                    `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `;
      }

      const modal = createModal(`📋 رویدادهای ${monthName} ${curY}`, content);

      const modalEl = modal.closest?.(".cal-modal-overlay") || modal;
      modalEl.querySelectorAll("*").forEach((el) => {
        const cs = getComputedStyle(el);
        if (
          el.classList.contains("month-events-scroll") ||
          el.tagName === "TABLE"
        )
          return;
        if (
          ["auto", "scroll"].includes(cs.overflow) ||
          ["auto", "scroll"].includes(cs.overflowY) ||
          ["auto", "scroll"].includes(cs.overflowX)
        ) {
          el.style.overflow = "visible";
          el.style.overflowX = "visible";
          el.style.overflowY = "visible";
          el.style.maxHeight = "none";
        }
      });
    }

    function loadDiary() {
      try {
        return JSON.parse(localStorage.getItem("jalali_diary") || "{}");
      } catch {
        return {};
      }
    }

    function saveDiary(diary) {
      localStorage.setItem("jalali_diary", JSON.stringify(diary));
    }

    function openDiary() {
      const now = new Date();
      const [ty, tm, td] = toJalali(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
      );
      const todayKey = jKey(ty, tm, td);
      const diary = loadDiary();

      const todayEntry = diary[todayKey];
      const todayText = todayEntry
        ? todayEntry.versions
          ? todayEntry.versions[todayEntry.versions.length - 1].text
          : todayEntry.text || ""
        : "";

      const editableDays = [];
      for (let i = 1; i <= 7; i++) {
        const pastDate = new Date(now);
        pastDate.setDate(pastDate.getDate() - i);
        const [py, pm, pd] = toJalali(
          pastDate.getFullYear(),
          pastDate.getMonth() + 1,
          pastDate.getDate(),
        );
        const pKey = jKey(py, pm, pd);
        const pDayName = getDayName(py, pm, pd);
        const hasEntry = !!diary[pKey];
        editableDays.push({
          key: pKey,
          label: `${pDayName} ${pd} ${MONTH_NAMES[pm - 1]}`,
          hasEntry,
        });
      }

      const stickerGroups = [
        {
          title: "احساسات",
          items: [
            "😊",
            "😢",
            "😍",
            "😡",
            "😴",
            "🤔",
            "😎",
            "🥺",
            "😂",
            "🤗",
            "😭",
            "🥰",
            "😤",
            "😱",
            "🤩",
            "😇",
            "🫠",
            "🥱",
            "😏",
            "🤯",
          ],
        },
        {
          title: "فعالیت",
          items: [
            "🏃",
            "📚",
            "🎵",
            "🍕",
            "☕",
            "🎮",
            "💪",
            "🎬",
            "✈️",
            "🛌",
            "🧘",
            "🚗",
            "🎨",
            "📝",
            "💻",
            "🎯",
            "🏊",
            "🛒",
            "🧹",
            "👨‍💻",
          ],
        },
        {
          title: "طبیعت/آب‌وهوا",
          items: [
            "☀️",
            "🌧️",
            "❄️",
            "🌸",
            "🌙",
            "⭐",
            "🌈",
            "🍂",
            "🌊",
            "💐",
            "🌺",
            "🌻",
            "🌴",
            "🦋",
            "🐈",
            "🐕",
            "🌅",
            "🌃",
            "⛅",
            "🌪️",
          ],
        },
        {
          title: "نمادها",
          items: [
            "❤️",
            "💔",
            "✨",
            "🔥",
            "💯",
            "🎉",
            "🙏",
            "👏",
            "💡",
            "⚡",
            "🏆",
            "🎁",
            "💬",
            "📌",
            "🔔",
            "✅",
            "❌",
            "⭕",
            "💫",
            "🌟",
          ],
        },
      ];

      function getStickerPanelHTML() {
        return stickerGroups
          .map(
            (g) => `
              <div class="sticker-group">
                <div class="sticker-group-title">${g.title}</div>
                <div class="sticker-group-items">
                  ${g.items.map((s) => `<span class="sticker-item" data-sticker="${s}">${s}</span>`).join("")}
                </div>
              </div>
            `,
          )
          .join("");
      }

      function getSearchHTML() {
        const freshDiary = loadDiary();
        const diaryKeys = Object.keys(freshDiary);
        const availableMonthsByYear = {};
        diaryKeys.forEach((key) => {
          const parts = key.split("/");
          if (parts.length === 3) {
            const y = parseInt(parts[0]);
            const m = parseInt(parts[1]);
            if (!availableMonthsByYear[y]) availableMonthsByYear[y] = new Set();
            availableMonthsByYear[y].add(m);
          }
        });
        const sortedYears = Object.keys(availableMonthsByYear)
          .map(Number)
          .sort((a, b) => b - a);

        if (sortedYears.length === 0) {
          return `
            <div class="diary-search-section">
              <div class="diary-section-title">🔍 مرور خاطرات گذشته</div>
              <div class="diary-no-result">📭 هنوز خاطره‌ای ثبت نشده</div>
            </div>
          `;
        }

        const firstYear = sortedYears[0];
        const firstYearMonths = [...availableMonthsByYear[firstYear]].sort(
          (a, b) => a - b,
        );

        return `
          <div class="diary-search-section">
            <div class="diary-section-title">🔍 مرور خاطرات گذشته</div>
            <div class="diary-search-row">
              <select id="diary-search-year" class="diary-select">
                ${sortedYears.map((y) => `<option value="${y}">${y}</option>`).join("")}
              </select>
              <select id="diary-search-month" class="diary-select">
                ${firstYearMonths.map((m) => `<option value="${m}">${MONTH_NAMES[m - 1]}</option>`).join("")}
              </select>
              <button id="diary-search-btn" class="diary-action-btn">📖 نمایش</button>
            </div>
            <div id="diary-search-results"></div>
          </div>
        `;
      }

      const body = `
        <div style="direction:rtl;">
          <div class="diary-section-title">📝 خاطره امروز — <span style="color:deeppink;">${getDayName(ty, tm, td)} ${td} ${MONTH_NAMES[tm - 1]} ${ty}</span></div>
          <div class="diary-textarea-wrap">
            <textarea id="diary-text" class="diary-textarea" rows="5"
              placeholder="خاطره امروز رو اینجا بنویس...">${todayText}</textarea>
            <div class="diary-sticker-anchor">
              <button id="diary-sticker-toggle" class="diary-sticker-btn" title="استیکر">😊</button>
              <div id="diary-sticker-panel" class="sticker-balloon">
                ${getStickerPanelHTML()}
              </div>
            </div>
          </div>
          <div id="diary-msg" class="diary-msg"></div>

          <div class="diary-past-section">
            <div class="diary-section-title">📅 هفته اخیر (قابل ویرایش)</div>
            <div class="diary-past-grid">
              ${editableDays
                .map(
                  (d) => `
                <button class="diary-past-btn ${d.hasEntry ? "has-entry" : ""}" data-key="${d.key}" data-label="${d.label}">
                  <span class="diary-past-icon">${d.hasEntry ? "📝" : "📄"}</span>
                  <span class="diary-past-label">${d.label}</span>
                </button>
              `,
                )
                .join("")}
            </div>
          </div>

          <div id="diary-edit-area"></div>

          <div id="diary-search-container">
            ${getSearchHTML()}
          </div>
        </div>
      `;

      const footer = `
      <button id="diary-save-btn" class="diary-save-btn">💾 ذخیره خاطره امروز</button>
    `;

      const modal = createModal("📓 دفترچه خاطرات", body, footer, false);

      function updateSearchSection() {
        const searchContainer = modal.querySelector("#diary-search-container");
        if (searchContainer) {
          searchContainer.innerHTML = getSearchHTML();
          setupSearchHandlers();
        }
      }

      function setupSearchHandlers() {
        const diary = loadDiary();
        const diaryKeys = Object.keys(diary);
        const availableMonthsByYear = {};
        diaryKeys.forEach((key) => {
          const parts = key.split("/");
          if (parts.length === 3) {
            const y = parseInt(parts[0]);
            const m = parseInt(parts[1]);
            if (!availableMonthsByYear[y]) availableMonthsByYear[y] = new Set();
            availableMonthsByYear[y].add(m);
          }
        });

        const yearSelect = modal.querySelector("#diary-search-year");
        const monthSelect = modal.querySelector("#diary-search-month");

        if (yearSelect && monthSelect) {
          yearSelect.onchange = () => {
            const selectedYear = parseInt(yearSelect.value);
            const months = availableMonthsByYear[selectedYear]
              ? [...availableMonthsByYear[selectedYear]].sort((a, b) => a - b)
              : [];
            monthSelect.innerHTML = months
              .map((m) => `<option value="${m}">${MONTH_NAMES[m - 1]}</option>`)
              .join("");
          };
        }

        const searchBtn = modal.querySelector("#diary-search-btn");
        if (searchBtn) {
          searchBtn.onclick = () => {
            const year = parseInt(
              modal.querySelector("#diary-search-year").value,
            );
            const month = parseInt(
              modal.querySelector("#diary-search-month").value,
            );
            const freshDiary = loadDiary();
            const prefix = `${year}/${String(month).padStart(2, "0")}/`;
            const resultsDiv = modal.querySelector("#diary-search-results");

            let found = [];
            for (const key in freshDiary) {
              if (key.startsWith(prefix)) {
                const entry = freshDiary[key];
                const dayNum = parseInt(key.split("/")[2]);
                const versions = entry.versions || [
                  { text: entry.text || "", date: "" },
                ];
                const lastText = versions[versions.length - 1].text;
                const lastDate = versions[versions.length - 1].date;

                const parts = key.split("/");
                const entryDate = jalaliToGregorian(
                  parseInt(parts[0]),
                  parseInt(parts[1]),
                  parseInt(parts[2]),
                );
                const diffDays = Math.round(
                  (now - entryDate.getTime()) / (1000 * 60 * 60 * 24),
                );
                const isEditable = diffDays >= 0 && diffDays <= 7;

                found.push({
                  key,
                  day: dayNum,
                  text: lastText,
                  date: lastDate,
                  versionCount: versions.length,
                  isEditable,
                });
              }
            }

            found.sort((a, b) => a.day - b.day);

            if (found.length === 0) {
              resultsDiv.innerHTML = `
            <div class="diary-no-result">
              📭 خاطره‌ای در ${MONTH_NAMES[month - 1]} ${year} یافت نشد
            </div>
          `;
            } else {
              resultsDiv.innerHTML = `
                <div class="diary-results-list">
                  ${found
                    .map(
                      (f) => `
                    <div class="diary-result-card" data-key="${f.key}">
                      <div class="diary-result-header">
                        <span class="diary-result-day">${f.day} ${MONTH_NAMES[month - 1]}</span>
                        <span class="diary-result-meta">
                          ${f.versionCount > 1 ? `📜 ${f.versionCount} نسخه` : ""}
                          ${f.isEditable ? `<button class="diary-result-edit-btn" data-key="${f.key}" data-label="${f.day} ${MONTH_NAMES[month - 1]} ${year}">✏️</button>` : "🔒"}
                        </span>
                      </div>
                      <div class="diary-result-text">${f.text.length > 150 ? f.text.substring(0, 150) + "..." : f.text}</div>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              `;

              resultsDiv
                .querySelectorAll(".diary-result-edit-btn")
                .forEach((btn) => {
                  btn.onclick = (e) => {
                    e.stopPropagation();
                    openDiaryEditor(
                      modal,
                      btn.dataset.key,
                      btn.dataset.label,
                      getStickerPanelHTML,
                    );
                  };
                });

              resultsDiv
                .querySelectorAll(".diary-result-card")
                .forEach((card) => {
                  card.onclick = () => {
                    const cardKey = card.dataset.key;
                    if (cardKey && freshDiary[cardKey]) {
                      const textDiv = card.querySelector(".diary-result-text");
                      const versions = freshDiary[cardKey].versions || [
                        { text: freshDiary[cardKey].text || "" },
                      ];
                      textDiv.textContent = versions[versions.length - 1].text;
                      textDiv.style.maxHeight = "none";
                    }
                  };
                });
            }
          };
        }
      }

      setupSearchHandlers();

      modal.querySelector("#diary-save-btn").onclick = () => {
        const text = modal.querySelector("#diary-text").value.trim();
        const freshDiary = loadDiary();
        const msg = modal.querySelector("#diary-msg");

        if (!text) {
          msg.innerHTML = `<span style="color:red;">⚠️ متنی وارد نشده</span>`;
          return;
        }

        if (!freshDiary[todayKey]) {
          freshDiary[todayKey] = {
            versions: [{ text, date: new Date().toISOString() }],
          };
        } else {
          if (!freshDiary[todayKey].versions) {
            freshDiary[todayKey] = {
              versions: [
                {
                  text: freshDiary[todayKey].text || "",
                  date: new Date().toISOString(),
                },
              ],
            };
          }
          const lastVersion =
            freshDiary[todayKey].versions[
              freshDiary[todayKey].versions.length - 1
            ];
          if (lastVersion.text !== text) {
            freshDiary[todayKey].versions.push({
              text,
              date: new Date().toISOString(),
            });
          }
        }

        saveDiary(freshDiary);
        msg.innerHTML = `<span style="color:green;">✅ خاطره ذخیره شد</span>`;
        setTimeout(() => (msg.innerHTML = ""), 2000);

        updateSearchSection();
      };

      modal.querySelector("#diary-sticker-toggle").onclick = (e) => {
        e.stopPropagation();
        const panel = modal.querySelector("#diary-sticker-panel");
        panel.classList.toggle("open");
      };

      modal.addEventListener("click", (e) => {
        const panel = modal.querySelector("#diary-sticker-panel");
        const anchor = modal.querySelector(".diary-sticker-anchor");
        if (panel && anchor && !anchor.contains(e.target)) {
          panel.classList.remove("open");
        }
      });

      function setupStickerHandlers() {
        modal.querySelectorAll(".sticker-item").forEach((s) => {
          s.onclick = (e) => {
            e.stopPropagation();
            const editTextarea = modal.querySelector("#diary-edit-text");
            const todayTextarea = modal.querySelector("#diary-text");
            const target = editTextarea || todayTextarea;

            if (target) {
              const start = target.selectionStart;
              const end = target.selectionEnd;
              const val = target.value;
              const sticker = s.dataset.sticker;
              target.value =
                val.substring(0, start) + sticker + val.substring(end);
              target.selectionStart = target.selectionEnd =
                start + sticker.length;
              target.focus();
            }
          };
        });
      }

      setupStickerHandlers();

      modal.querySelectorAll(".diary-past-btn").forEach((btn) => {
        btn.onclick = () => {
          modal
            .querySelectorAll(".diary-past-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          const key = btn.dataset.key;
          const label = btn.dataset.label;
          openDiaryEditor(modal, key, label, getStickerPanelHTML);
        };
      });
    }

    function openDiaryEditor(modal, key, label, getStickerPanelHTML) {
      const diary = loadDiary();
      const entry = diary[key];
      const editArea = modal.querySelector("#diary-edit-area");

      const versions = entry
        ? entry.versions || [{ text: entry.text || "", date: "" }]
        : [];
      const currentText =
        versions.length > 0 ? versions[versions.length - 1].text : "";

      let versionsHTML = "";
      if (versions.length > 1) {
        versionsHTML = `
          <details class="diary-versions-details">
            <summary class="diary-versions-summary">📜 تاریخچه ویرایش‌ها (${versions.length} نسخه)</summary>
            <div class="diary-versions">
              ${versions
                .map((v, i) => {
                  const dateStr = v.date
                    ? new Date(v.date).toLocaleString("fa-IR")
                    : "—";
                  const diffHTML =
                    i > 0 ? getDiffHTML(versions[i - 1].text, v.text) : "";
                  return `
                  <div class="diary-version-item">
                    <div class="diary-version-header">
                      <span class="diary-version-num">نسخه ${i + 1}</span>
                      <span class="diary-version-date">${dateStr}</span>
                    </div>
                    <div class="diary-version-text">${v.text}</div>
                    ${diffHTML ? `<div class="diary-version-diff">${diffHTML}</div>` : ""}
                  </div>
                `;
                })
                .join("")}
            </div>
          </details>
        `;
      }

      editArea.innerHTML = `
        <div class="diary-edit-section">
          <div class="diary-edit-title">✏️ ویرایش خاطره ${label}</div>
          <div class="diary-textarea-wrap">
            <textarea id="diary-edit-text" class="diary-textarea" rows="4"
              placeholder="خاطره این روز...">${currentText}</textarea>
            <div class="diary-sticker-anchor">
              <button id="diary-edit-sticker-toggle" class="diary-sticker-btn" title="استیکر">😊</button>
              <div id="diary-edit-sticker-panel" class="sticker-balloon">
                ${getStickerPanelHTML()}
              </div>
            </div>
          </div>
          <button id="diary-edit-save" class="diary-save-btn" style="margin-top:8px;">💾 ذخیره ویرایش</button>
          <div id="diary-edit-msg" class="diary-msg"></div>
          ${versionsHTML}
        </div>
      `;

      editArea.scrollIntoView({ behavior: "smooth" });

      modal.querySelector("#diary-edit-sticker-toggle").onclick = (e) => {
        e.stopPropagation();
        const panel = modal.querySelector("#diary-edit-sticker-panel");
        panel.classList.toggle("open");
      };

      modal
        .querySelectorAll("#diary-edit-sticker-panel .sticker-item")
        .forEach((s) => {
          s.onclick = (e) => {
            e.stopPropagation();
            const target = modal.querySelector("#diary-edit-text");

            if (target) {
              const start = target.selectionStart;
              const end = target.selectionEnd;
              const val = target.value;
              const sticker = s.dataset.sticker;
              target.value =
                val.substring(0, start) + sticker + val.substring(end);
              target.selectionStart = target.selectionEnd =
                start + sticker.length;
              target.focus();
            }
          };
        });

      modal.querySelector("#diary-edit-save").onclick = () => {
        const newText = modal.querySelector("#diary-edit-text").value.trim();
        const editMsg = modal.querySelector("#diary-edit-msg");
        const diary = loadDiary();

        if (!newText) {
          editMsg.innerHTML = `<span style="color:red;">⚠️ متنی وارد نشده</span>`;
          return;
        }

        if (!diary[key]) {
          diary[key] = {
            versions: [{ text: newText, date: new Date().toISOString() }],
          };
        } else {
          if (!diary[key].versions) {
            diary[key] = {
              versions: [
                { text: diary[key].text || "", date: new Date().toISOString() },
              ],
            };
          }
          const lastV = diary[key].versions[diary[key].versions.length - 1];
          if (lastV.text !== newText) {
            diary[key].versions.push({
              text: newText,
              date: new Date().toISOString(),
            });
          } else {
            editMsg.innerHTML = `<span style="color:orange;">⚠️ تغییری ایجاد نشده</span>`;
            return;
          }
        }

        saveDiary(diary);
        editMsg.innerHTML = `<span style="color:green;">✅ ویرایش ذخیره شد (نسخه ${diary[key].versions.length})</span>`;
        setTimeout(
          () => openDiaryEditor(modal, key, label, getStickerPanelHTML),
          1000,
        );
      };
    }

    container.querySelector("#cal-age").onclick = () => openAgeCalculator();
    container.querySelector("#cal-date-convert").onclick = () =>
      openDateConverter();
    container.querySelector("#cal-events-month").onclick = () =>
      openMonthEvents();
    container.querySelector("#cal-diary").onclick = () => openDiary();

    container.querySelector("#cal-export").onclick = () => exportEvents();
    container.querySelector("#cal-import").onclick = () => {
      importEvents(() => {
        events = loadEvents();
        render();
      });
    };

    container.querySelector("#cal-clear-month").onclick = () => {
      clearMonthEvents(curY, curM, events, render);
    };
    container.querySelector("#cal-clear-year").onclick = () => {
      clearYearEvents(curY, events, render);
    };

    container.querySelector("#cal-wrench-toggle").onclick = () => {
      const panel = container.querySelector("#cal-wrench-panel");
      const arrow = container.querySelector("#cal-wrench-arrow");
      panel.classList.toggle("open");
      arrow.textContent = panel.classList.contains("open") ? "▲" : "▼";
    };

    container.querySelector("#cal-settings-toggle").onclick = () => {
      const panel = container.querySelector("#cal-settings-panel");
      const arrow = container.querySelector("#cal-settings-arrow");
      panel.classList.toggle("open");
      arrow.textContent = panel.classList.contains("open") ? "▲" : "▼";
    };

    document.getElementById("cal-dev-btn").addEventListener("click", () => {
      document.getElementById("cal-dev-overlay").classList.add("active");
    });
    document.getElementById("cal-dev-close").addEventListener("click", () => {
      document.getElementById("cal-dev-overlay").classList.remove("active");
    });
    document
      .getElementById("cal-dev-overlay")
      .addEventListener("click", (e) => {
        if (e.target === e.currentTarget) {
          e.target.classList.remove("active");
        }
      });

    document.addEventListener("DOMContentLoaded", () => {
      copyrightYear();

      initBellDropdown();
      updateNotificationBell();

      initBellSettingsButton();

      if (typeof EventBus !== "undefined") {
        EventBus.on("calendarUpdate", (year, month) => {
          updateNotificationBell();
          initBellDropdown();

          initBellSettingsButton();

          copyrightYear();
        });
      }
    });

    renderDayPanel();
  }

  render();
}

(function () {
  function g2j(gy, gm, gd) {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = gy <= 1600 ? 0 : 979;
    gy -= gy <= 1600 ? 621 : 1600;
    const gy2 = gm > 2 ? gy + 1 : gy;
    let days =
      365 * gy +
      Math.floor((gy2 + 3) / 4) -
      Math.floor((gy2 + 99) / 100) +
      Math.floor((gy2 + 399) / 400) -
      80 +
      gd +
      g_d_m[gm - 1];
    jy += 33 * Math.floor(days / 12053);
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    const jm =
      days < 186
        ? 1 + Math.floor(days / 31)
        : 7 + Math.floor((days - 186) / 30);
    const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
    return [jy, jm, jd];
  }

  function todayParts() {
    const d = new Date();
    const [jy, jm, jd] = g2j(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const dateKey = `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
    const annualKey = `${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
    const nowMin = d.getHours() * 60 + d.getMinutes();
    return { dateKey, annualKey, nowMin };
  }

  function parseTimes(clockTimes) {
    if (!clockTimes) return [];
    return clockTimes
      .split("|")
      .map((s) => s.trim())
      .map((part) => {
        const m = part.match(/(\d{1,2}):(\d{2})/);
        if (!m) return null;
        return {
          min: parseInt(m[1], 10) * 60 + parseInt(m[2], 10),
          label: part,
        };
      })
      .filter(Boolean);
  }

  function loadEv() {
    try {
      return JSON.parse(localStorage.getItem("jalali_events") || "{}");
    } catch {
      return {};
    }
  }
  function loadFired() {
    try {
      return JSON.parse(localStorage.getItem("jalali_fired_notifs") || "{}");
    } catch {
      return {};
    }
  }
  function saveFired(f) {
    localStorage.setItem("jalali_fired_notifs", JSON.stringify(f));
  }

  function typeInfo(type) {
    const ET = typeof EVENT_TYPES !== "undefined" ? EVENT_TYPES : null;
    const t = (ET && ET[type]) || null;
    return {
      label: t ? t.label : "🔔 یادآوری",
      color: t ? t.color : "#f59e0b",
    };
  }

  let audioCtx = null;
  function unlockAudio() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
    } catch {}
  }
  window.addEventListener("click", unlockAudio);
  window.addEventListener("keydown", unlockAudio);

  function beep() {
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();
    try {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.type = "sine";
      o.frequency.value = 880;
      const t = audioCtx.currentTime;
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      o.start(t);
      o.stop(t + 0.7);
    } catch {}
  }

  function ensureContainer() {
    let c = document.getElementById("__notif_box");
    if (c) return c;
    c = document.createElement("div");
    c.id = "__notif_box";
    c.style.cssText =
      "position:fixed;top:16px;left:16px;z-index:999999;display:flex;flex-direction:column;gap:10px;direction:rtl;font-family:Tahoma,sans-serif;";
    document.body.appendChild(c);
    return c;
  }

  function showPopup(ev, timeLabel) {
    const info = typeInfo(ev.type);
    const title = ev.text ? ev.text : info.label;
    const c = ensureContainer();
    const card = document.createElement("div");
    card.style.cssText =
      "position:relative;min-width:240px;max-width:320px;" +
      "background-color:" +
      info.color +
      ";color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.5);" +
      "border-radius:10px;padding:12px 32px 12px 14px;" +
      "box-shadow:0 8px 24px rgba(0,0,0,.35);opacity:0;transform:translateX(-20px);transition:all .25s ease;";
    card.innerHTML =
      `<div style="font-weight:bold;margin-bottom:4px;font-size:14px;">${info.label}</div>` +
      `<div style="font-size:13px;margin-bottom:4px;">${title}</div>` +
      `<div style="font-size:12px;opacity:.9;">⏰ ${timeLabel}</div>` +
      `<span style="position:absolute;top:6px;left:8px;cursor:pointer;font-size:16px;opacity:.85;">✕</span>`;
    card.querySelector("span").onclick = () => card.remove();
    c.appendChild(card);
    requestAnimationFrame(() => {
      card.style.opacity = "1";
      card.style.transform = "translateX(0)";
    });
    beep();
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(info.label, { body: title + " — " + timeLabel });
      } catch {}
    }
  }

  function checkNow() {
    const { dateKey, annualKey, nowMin } = todayParts();
    const events = loadEv();
    let fired = loadFired();
    if (fired._day !== dateKey) fired = { _day: dateKey };

    const lists = [];
    if (events[dateKey]) lists.push(...events[dateKey]);
    if (events._annual && events._annual[annualKey])
      lists.push(...events._annual[annualKey]);

    lists.forEach((ev) => {
      if (!ev || !ev.clock || !ev.clockTimes) return;
      parseTimes(ev.clockTimes).forEach((t) => {
        if (nowMin >= t.min && nowMin - t.min < 60) {
          const id = `${dateKey}|${ev.repeatId || ev.text}|${t.min}`;
          if (fired[id]) return;
          fired[id] = true;
          showPopup(ev, t.label);
        }
      });
    });
    saveFired(fired);
  }

  function start() {
    if ("Notification" in window && Notification.permission === "default") {
      try {
        Notification.requestPermission();
      } catch {}
    }
    checkNow();
    setInterval(checkNow, 30000);

    window.addEventListener("storage", (e) => {
      if (e.key === "jalali_events") checkNow();
    });
    if (typeof EventBus !== "undefined" && EventBus.on) {
      EventBus.on("calendarUpdate", checkNow);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  window.__checkNotifNow = checkNow;
})();
