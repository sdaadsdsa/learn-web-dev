import { useState, useEffect } from 'react';
import foto from './images/foto.png';
import foto2 from './images/foto2.png';

const MONTHS_NOMINATIVE = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

const DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const BASE_TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

function getSlotsForDay(day) {
  const busyTimes = day === 9 ? ['11:00', '13:00'] : [];
  return BASE_TIMES.map(time => ({
    time,
    available: !busyTimes.includes(time)
  }));
}

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

function isDateSelectable(day, month, year, today) {
  const date = new Date(year, month, day);
  date.setHours(0, 0, 0, 0);
  return date >= today;
}

function getFirstAvailableDay(year, month, today) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    if (isDateSelectable(d, month, year, today)) return d;
  }
  return null;
}

export default function App() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(() =>
    getFirstAvailableDay(today.getFullYear(), today.getMonth(), today)
  );
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    const first = getFirstAvailableDay(currentYear, currentMonth, today);
    setSelectedDay(first);
    setSelectedTime(null);
  }, [currentMonth, currentYear]);

  const weeks = buildCalendarGrid(currentYear, currentMonth);
  const slots = selectedDay ? getSlotsForDay(selectedDay) : [];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayClick = (day) => {
    if (!isDateSelectable(day, currentMonth, currentYear, today)) return;
    setSelectedDay(day);
    setSelectedTime(null);
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
  };

  const getBottomBarText = () => {
    if (selectedDay === null) return '—';
    const monthName = MONTHS_GENITIVE[currentMonth];
    let text = `${selectedDay} ${monthName}`;
    if (selectedTime) text += ` в ${selectedTime}`;
    return text;
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container header__container">
          <div className="header__logo-wrap">
            <img src={foto} alt="Салон красоты АВРОРА" className="header__logo" />
          </div>
          <nav className="header__nav">
            <ul className="nav__list">
              <li><a href="#" className="nav__link">Услуги</a></li>
              <li><a href="#" className="nav__link">Галерея</a></li>
              <li><a href="#" className="nav__link">Команда</a></li>
              <li><a href="#" className="nav__link">Отзывы</a></li>
              <li><a href="#" className="nav__link">Контакты</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="progress-wrapper">
          <div className="container">
            <section className="progress">
              <div className="progress__step progress__step--done">
                <span className="progress__number">1</span>
                <span className="progress__label">Мастер</span>
              </div>
              <div className="progress__line"></div>
              <div className="progress__dash"></div>
              <div className="progress__step progress__step--done">
                <span className="progress__number">2</span>
                <span className="progress__label">Услуга</span>
              </div>
              <div className="progress__line"></div>
              <div className="progress__dash"></div>
              <div className="progress__step progress__step--active">
                <span className="progress__number">3</span>
                <span className="progress__label">Дата</span>
              </div>
              <div className="progress__line progress__line--active"></div>
              <div className="progress__dash"></div>
              <div className="progress__step">
                <span className="progress__number">4</span>
                <span className="progress__label">Контакты</span>
              </div>
              <div className="progress__line"></div>
              <div className="progress__dash"></div>
              <div className="progress__step">
                <span className="progress__number">5</span>
                <span className="progress__label">Подтверждение</span>
              </div>
              <div className="progress__dash progress__dash--last"></div>
            </section>
          </div>
        </div>

        <div className="container">
          <h1 className="main__title">Выберите дату</h1>
          <p className="main__subtitle">Шаг 3 из 5</p>

          <div className="booking">
            <div className="calendar">
              <div className="calendar__header">
                <h2 className="calendar__month">
                  {MONTHS_NOMINATIVE[currentMonth]} {currentYear}
                </h2>
                <div className="calendar__controls">
                  <button
                    className="calendar__btn calendar__btn--prev"
                    onClick={handlePrevMonth}
                    aria-label="Предыдущий месяц"
                  ></button>
                  <button
                    className="calendar__btn calendar__btn--next"
                    onClick={handleNextMonth}
                    aria-label="Следующий месяц"
                  ></button>
                </div>
              </div>
              <div className="calendar__grid">
                {DAY_NAMES_SHORT.map(name => (
                  <div key={name} className="calendar__day-name">{name}</div>
                ))}
                {weeks.flat().map((cell, idx) => {
                  const { day, otherMonth } = cell;
                  const selectable = !otherMonth && isDateSelectable(day, currentMonth, currentYear, today);
                  const isSelected = !otherMonth && day === selectedDay;

                  let classes = 'calendar__day';
                  if (!selectable) classes += ' calendar__day--empty';
                  if (isSelected && selectable) classes += ' calendar__day--active';

                  return (
                    <div
                      key={idx}
                      className={classes}
                      onClick={() => selectable && handleDayClick(day)}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="time-slots">
              <h2 className="time-slots__title">Доступное время</h2>
              <div className="time-slots__grid">
                {slots.map(slot => {
                  let classes = 'time-slot';
                  if (!slot.available) classes += ' time-slot--busy';
                  if (slot.available && slot.time === selectedTime) classes += ' time-slot--active';

                  return (
                    <button
                      key={slot.time}
                      className={classes}
                      disabled={!slot.available}
                      onClick={() => slot.available && handleTimeClick(slot.time)}
                    >
                      {slot.time}
                      {!slot.available && <span>Занято</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="summary">
            <div className="summary__info">
              <p className="summary__label">Вы выбрали:</p>
              <p className="summary__value">{getBottomBarText()}</p>
            </div>
            <button className="summary__btn">Далее</button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container footer__container">
          <div className="footer__logo">
            <img src={foto2} alt="АВРОРА" />
          </div>
          <div className="footer__contacts">
            <h3>КОНТАКТЫ</h3>
            <p>ул. Садовая, 15, Москва</p>
            <p>+7 (495) 123-45-67</p>
            <p>Пн–Сб: 9:00 – 21:00</p>
          </div>
          <div className="footer__schedule">
            <h3>РЕЖИМ РАБОТЫ</h3>
            <p>Пн–Пт: 9:00 – 21:00</p>
            <p>Сб–Вс: 10:00 – 19:00</p>
          </div>
        </div>
        <div className="footer__bottom">
          <p>2026 © АВРОРА Все права защищены</p>
          <a href="#">Пользовательское соглашение</a>
          <a href="#">Политика конфиденциальности</a>
          <a href="#">Помощь по сайту</a>
        </div>
      </footer>
    </div>
  );
}