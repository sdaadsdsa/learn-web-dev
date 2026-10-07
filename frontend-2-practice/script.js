const MONTHS_NOMINATIVE = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const MONTHS_GENITIVE = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const DAYS_OF_WEEK = [
    'Понедельник', 'Вторник', 'Среда', 'Четверг',
    'Пятница', 'Суббота', 'Воскресенье'
];

function getSlotsForDay(day, month) {
    const busyTimes = (day === 9) ? ['11:00', '13:00'] : [];
    const baseTimes = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    return baseTimes.map(time => ({
        time,
        available: !busyTimes.includes(time)
    }));
}

const today = new Date();
today.setHours(0, 0, 0, 0);

const state = {
    currentYear: today.getFullYear(),
    currentMonth: today.getMonth(),
    selectedDay: today.getDate(),
    selectedTime: null
};

function buildCalendarGrid(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const cells = [];

    for (let i = offset - 1; i >= 0; i--) {
        cells.push({ day: prevMonthLastDay - i, otherMonth: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, otherMonth: false });
    }
    const totalCells = Math.ceil(cells.length / 7) * 7;
    let nextDay = 1;
    while (cells.length < totalCells) {
        cells.push({ day: nextDay, otherMonth: true });
        nextDay++;
    }

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
}

function compareDates(d1, d2) {
    return d1.getFullYear() === d2.getFullYear()
        && d1.getMonth() === d2.getMonth()
        && d1.getDate() === d2.getDate();
}

function isDateSelectable(day, month, year, otherMonth) {
    if (otherMonth) return false;
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date >= today;
}

const calendarMonthEl  = document.getElementById('calendarMonth');
const calendarGridEl   = document.getElementById('calendarGrid');
const timeSlotsGridEl  = document.getElementById('timeSlotsGrid');
const summaryValueEl   = document.getElementById('summaryValue');

function renderCalendar() {
    calendarMonthEl.textContent = `${MONTHS_NOMINATIVE[state.currentMonth]} ${state.currentYear}`;

    const weeks = buildCalendarGrid(state.currentYear, state.currentMonth);
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    let html = '';
    dayNames.forEach(name => {
        html += `<div class="calendar__day-name">${name}</div>`;
    });

    weeks.forEach(week => {
        week.forEach(cell => {
            const { day, otherMonth } = cell;
            const selectable = isDateSelectable(day, state.currentMonth, state.currentYear, otherMonth);
            const isSelected = !otherMonth
                && state.selectedDay !== null
                && day === state.selectedDay;

            let classes = 'calendar__day';
            if (!selectable) classes += ' calendar__day--empty';
            if (isSelected && selectable) classes += ' calendar__day--active';

            const dataAttr = otherMonth ? '' : ` data-day="${day}"`;
            html += `<div class="${classes}"${dataAttr}>${day}</div>`;
        });
    });

    calendarGridEl.innerHTML = html;

    calendarGridEl.querySelectorAll('.calendar__day[data-day]').forEach(el => {
        el.addEventListener('click', onDayClick);
    });
}

function renderTimeSlots() {
    if (state.selectedDay === null) {
        timeSlotsGridEl.innerHTML = '';
        return;
    }

    const slots = getSlotsForDay(state.selectedDay, state.currentMonth);

    let html = '';
    slots.forEach(slot => {
        let classes = 'time-slot';
        if (!slot.available) classes += ' time-slot--busy';
        if (slot.available && slot.time === state.selectedTime) classes += ' time-slot--active';

        html += `<button class="${classes}" data-time="${slot.time}"${!slot.available ? ' disabled' : ''}>
            ${slot.time}${!slot.available ? '<span>Занято</span>' : ''}
        </button>`;
    });

    timeSlotsGridEl.innerHTML = html;

    timeSlotsGridEl.querySelectorAll('.time-slot:not(.time-slot--busy)').forEach(el => {
        el.addEventListener('click', onTimeSlotClick);
    });
}

function onDayClick(event) {
    const day = parseInt(event.currentTarget.dataset.day, 10);
    if (!isDateSelectable(day, state.currentMonth, state.currentYear, false)) return;

    state.selectedDay = day;
    state.selectedTime = null;
    renderCalendar();
    renderTimeSlots();
    updateBottomBar();
}

function onTimeSlotClick(event) {
    const time = event.currentTarget.dataset.time;
    state.selectedTime = time;
    renderTimeSlots();
    updateBottomBar();
}

function setupMonthNavigation() {
    document.getElementById('prevMonth').addEventListener('click', () => {
        state.currentMonth--;
        if (state.currentMonth < 0) {
            state.currentMonth = 11;
            state.currentYear--;
        }
        state.selectedDay = null;
        state.selectedTime = null;
        renderCalendar();
        renderTimeSlots();
        updateBottomBar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        state.currentMonth++;
        if (state.currentMonth > 11) {
            state.currentMonth = 0;
            state.currentYear++;
        }
        state.selectedDay = null;
        state.selectedTime = null;
        renderCalendar();
        renderTimeSlots();
        updateBottomBar();
    });
}

function updateBottomBar() {
    if (state.selectedDay === null) {
        summaryValueEl.textContent = '—';
        return;
    }

    const monthName = MONTHS_GENITIVE[state.currentMonth];
    let text = `${state.selectedDay} ${monthName}`;

    if (state.selectedTime) {
        text += ` в ${state.selectedTime}`;
    }
    summaryValueEl.textContent = text;
}

function init() {
    const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
    for (let d = today.getDate(); d <= daysInMonth; d++) {
        if (isDateSelectable(d, state.currentMonth, state.currentYear, false)) {
            state.selectedDay = d;
            break;
        }
    }

    renderCalendar();
    renderTimeSlots();
    setupMonthNavigation();
    updateBottomBar();
}

document.addEventListener('DOMContentLoaded', init);