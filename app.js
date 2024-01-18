'use strict'

// Перемикання між вкладками 
const tabs = document.querySelectorAll('.app>section')
tabs.forEach((tab) => {
    tab.querySelector('.section__title').addEventListener('click', () => {
        if (!tab.classList.contains('active')) {
            tab.classList.add('active')
        } else { tab.classList.remove('active') }

    })
    // console.log(tab.querySelector('.section__title'))
})

const showError = (place, errorMessage) => {
    const div = document.createElement('div');
    div.classList.add('error');
    div.innerText = errorMessage;
    place.prepend(div)
    setTimeout(() => { div.remove() }, 3000)
}

// Клас для калькулятора часу
class Calculator {
    constructor() {
        this.firstDate = document.querySelectorAll('.datepicker__input input')[0];
        this.secondDate = document.querySelectorAll('.datepicker__input input')[1];
        this.datepickerText = document.querySelector('.datepicker__text')
        this.presets = document.querySelectorAll('.preset__button');
        this.presetWeek = document.querySelector('.preset__week');
        this.presetMonth = document.querySelector('.preset__month');
        this.includedDays = document.querySelectorAll('.parameters .radio-group__input')
        this.countButton = document.querySelector('.count-button__wrapper');
        this.countButton.button = document.querySelector('.count-button > button');
        this.countButton.tick = document.querySelector('.count-button__dropdown-icon');
        this.countButton.options = document.querySelector('.count-button__dropdown-list');
        this.historyTable = document.querySelector('.history__table');
    }



    openButtonOptions() {
        this.countButton.options.classList.add(`${this.countButton.options.classList[0]}_active`);
    }
    closeButtonOptions(e) {
        if (e.type === 'click') {
            if (!this.countButton.contains(e.target) && !e.target.classList.contains(`${this.countButton.options.classList[0]}_active`)) {
                this.countButton.options.classList.remove(`${this.countButton.options.classList[0]}_active`);
            }
        } else if (e.type === 'pointerleave') {
            setTimeout(() => { this.countButton.options.classList.remove(`${this.countButton.options.classList[0]}_active`) }, 1000);
        }
    }
    countDateDifference(format, includeDays) {
        if (this.firstDate.value && this.secondDate.value) {
            const startDate = new Date(this.firstDate.value)
            const currentDate = new Date(this.firstDate.value)
            const endDate = new Date(this.secondDate.value)
            let countDay = 0;
            switch (includeDays) {
                case 'all_days':
                    let timeDifference = endDate - startDate;
                    countDay = Math.floor(timeDifference / (1000 * 60 * 60 * 24) + 1)
                    break;
                case 'work_days':
                    while (currentDate <= endDate) {
                        if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {
                            countDay++;
                        }
                        currentDate.setDate(currentDate.getDate() + 1)
                    }
                    break;
                case 'day_offs':
                    while (currentDate <= endDate) {
                        if (currentDate.getDay() == 0 || currentDate.getDay() == 6) {
                            countDay++;
                        }
                        currentDate.setDate(currentDate.getDate() + 1)
                    }
                    break;
            }
            let result;
            switch (format) {
                case 'days':
                    result = `${countDay} днів`;
                    break;
                case 'hours':
                    result = `${countDay * 24} годин`;
                    break;
                case 'minutes':
                    result = `${countDay * 24 * 60} хвилин`;
                    break;
                case 'seconds':
                    result = `${countDay * 24 * 60 * 60}} секунд`;
                    break;
            }

            this.datepickerText.innerText = result;


            const formatDate = (date) => {
                const monthsUkrainianLocale = ['Січня', 'Лютого', 'Березня', 'Квітня', 'Травня', 'Червня',
                    'Липня', 'Серпня', 'Вересня', 'Жовтня', 'Листопада', 'Грудня'];
                return `${date.getDate()} ${monthsUkrainianLocale[date.getMonth()]} ${date.getFullYear()}`
            }

            this.saveResultToLocalStorage(formatDate(startDate), formatDate(endDate), result);
            this.refreshTable();
            document.querySelector('.history').classList.remove('empty');
            this.renderFromLocalStorage();
        }
    }

    // LocalStorage
    saveResultToLocalStorage(startDate, endDate, result) {
        if (localStorage.getItem('history')) {
            const history = JSON.parse(localStorage.getItem('history'));
            if (history.length > 9) {
                console.log('more than 10')
                history.splice(9, history.length - 9)
            }
            history.unshift({ startDate, endDate, result });

            localStorage.setItem('history', JSON.stringify(history));
        } else {
            const history = [{ startDate, endDate, result }];
            localStorage.setItem('history', JSON.stringify(history));
        }
    }
    renderFromLocalStorage() {
        const history = JSON.parse(localStorage.getItem('history'));

        history.forEach(row => {
            const tableRow = document.createElement('div');
            tableRow.classList.add('row', 'table-row');
            for (let key in row) {
                const tableCell = document.createElement('div');
                tableCell.innerText = row[key]
                tableRow.appendChild(tableCell);
            }
            this.historyTable.appendChild(tableRow);
        })

    }

    refreshTable() {
        this.historyTable.querySelectorAll('.table-row').forEach(row => row.remove())
    }
}

const calculator = new Calculator();

// Якщо в LocalStorage є історія підрахунків, то дістаємо її і постимо в UI
if (!localStorage.getItem('history')) {
    document.querySelector('.history').classList.add('empty');
} else {
    document.querySelector('.history').classList.remove('empty');
    calculator.renderFromLocalStorage()
}


/**** Event listeners для калькулятора ****/

// Керуємо диапазоном дат (перша дата має бути меньша за другу і навпаки)
calculator.firstDate.addEventListener('change', () => {
    calculator.secondDate.setAttribute('min', calculator.firstDate.value)
    if (new Date(calculator.firstDate.value) > new Date(calculator.secondDate.value)) {
        calculator.firstDate.value = calculator.secondDate.value
    }
})
calculator.secondDate.addEventListener('change', () => {
    calculator.firstDate.setAttribute('max', calculator.firstDate.value);
    if (new Date(calculator.secondDate.value) < new Date(calculator.firstDate.value)) {
        calculator.secondDate.value = calculator.firstDate.value
    }
})

// Події пресетів
calculator.presets.forEach(button => button.addEventListener('click', (e) => {
    //Якщо першій інпут пустий, ставимо поточну дату
    if (!calculator.firstDate.value) {
        const currentDate = new Date();
        const month = ("0" + (currentDate.getMonth() + 1)).slice(-2)
        const day = ("0" + currentDate.getDate()).slice(-2)
        const year = currentDate.getFullYear()
        calculator.firstDate.value = `${year}-${month}-${day}`
    }
    // Беремо значення з першого інпуту та вираховуємо проміжок в залежності від опції
    const startDate = new Date(calculator.firstDate.value)

    if (e.target.classList.contains('preset__week')) {
        startDate.setDate(startDate.getDate() + 6);
    }
    if (e.target.classList.contains('preset__month')) {
        startDate.setDate(startDate.getDate() + 29);
    }
    // Приводимо дату до потрібного формату
    const month = ("0" + (startDate.getMonth() + 1)).slice(-2)
    const day = ("0" + startDate.getDate()).slice(-2)
    const year = startDate.getFullYear()
    // Вносимо нове значення в другий інпут
    calculator.secondDate.value = `${year}-${month}-${day}`
}))

// Події фільтру днів
let checkedFilterOption = Array.from(calculator.includedDays).find(input => input.checked);
calculator.includedDays.forEach(input => input.addEventListener('click', () => { checkedFilterOption = Array.from(calculator.includedDays).find(input => input.checked) }));

// Події кнопки підрахунку
calculator.countButton.tick.addEventListener('click', calculator.openButtonOptions.bind(calculator));
document.addEventListener('click', calculator.closeButtonOptions.bind(calculator));
calculator.countButton.addEventListener('pointerleave', calculator.closeButtonOptions.bind(calculator));

// Вибір опцій для кнопки підрахунку
const options = calculator.countButton.options.querySelectorAll('li');
for (let i = 1; i < options.length; i++) {
    options[i].addEventListener('click', () => {
        calculator.countButton.button.innerText = options[i].innerText;
        calculator.countButton.button.dataset.format = options[i].dataset.format;
    })
}

calculator.countButton.button.addEventListener('click', () => calculator.countDateDifference.bind(calculator, calculator.countButton.button.dataset.format, checkedFilterOption.id)());


// Клас для розділа свят

class EventSearch {
    constructor() {
        this.countrySelect = document.querySelector('.select__country');
        this.yearSelect = document.querySelector('.select__year');
        this.apiBase = 'https://calendarific.com/api/v2';
        this.authKey = 'api_key=EJ8Jc5VPwRlNTZGaTLoHgABHMVHBHcn0';
        this.eventTable = document.querySelector('.event__table');
        this.sortButton = document.querySelector('.sort-order');
    }

    getCountries() {
        fetch(`${this.apiBase}/countries?${this.authKey}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Відповідь не отримано')
                }
                return response.json()
            })
            .then(data => {
                this.renderCountriesList(data.response.countries)
            })
            .catch(error => showError(document.querySelector('.event-search .section__wrapper'), 'Під час запиту сталася помилка!'))
    }
    renderCountriesList(countries) {
        countries.forEach(country => {
            const option = document.createElement('option');
            option.innerText = country.country_name;
            option.setAttribute('value', country['iso-3166'])
            this.countrySelect.appendChild(option);
        })
    }
    renderYearsList() {
        const yearRange = { startYear: 2001, endYear: 2049 }
        for (let i = yearRange.startYear; i <= yearRange.endYear; i++) {
            const option = document.createElement('option');
            option.innerText = i;
            option.setAttribute('value', i);
            this.yearSelect.appendChild(option)
        }
        const currentYear = new Date().getFullYear();
        const defaultYear = Array.from(this.yearSelect.querySelectorAll('option')).find(option => option.innerText == currentYear)
        defaultYear.selected = true;
    }
    getEvents() {
        fetch(`${this.apiBase}/holidays?${this.authKey}&country=${this.countrySelect.value}&year=${this.yearSelect.value}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Відповідь не отримано')
                }
                return response.json()
            })
            .then(data => {
                this.renderTable(data.response.holidays)
            })
            .catch(error => showError(document.querySelector('.event-search .section__wrapper'), 'Під час запиту сталася помилка!'))
    }
    renderTable(holidays) {
        const monthsUkrainianLocale = ['Січня', 'Лютого', 'Березня', 'Квітня', 'Травня', 'Червня',
            'Липня', 'Серпня', 'Вересня', 'Жовтня', 'Листопада', 'Грудня'];

        holidays.forEach(holiday => {
            const row = document.createElement('div');
            row.classList.add('row', 'table-row');
            this.eventTable.appendChild(row);
            const dateCell = document.createElement('div');
            const eventNameCell = document.createElement('div');
            dateCell.innerText = `${holiday.date.datetime.day} ${monthsUkrainianLocale[holiday.date.datetime.month - 1]} ${holiday.date.datetime.year}`
            eventNameCell.innerText = `${holiday.name}`
            row.appendChild(dateCell);
            row.appendChild(eventNameCell);
        })
    }
    reverseDates() {
        const rows = Array.from(this.eventTable.querySelectorAll('.table-row'));
        this.eventTable.querySelectorAll('.table-row').forEach(row => row.remove())
        rows.reverse().forEach(row => this.eventTable.appendChild(row))
    }

}

const eventSearch = new EventSearch();

eventSearch.renderYearsList();
eventSearch.countrySelect.addEventListener('change', () => {
    if (eventSearch.countrySelect.value) {
        eventSearch.yearSelect.disabled = false;
    } else {
        eventSearch.yearSelect.disabled = true;
    }
})

/**** Event listeners для розділа дат ****/
const eventSearchTabButton = document.querySelector('.event-search .section__title');
let visited = false;
if (!document.querySelector('.event-search').classList.contains('active') && !visited) {
    eventSearchTabButton.addEventListener('click', () => {
        eventSearch.getCountries.bind(eventSearch)(); visited = true
    })
}
eventSearch.yearSelect.addEventListener('change', eventSearch.getEvents.bind(eventSearch))
eventSearch.countrySelect.addEventListener('change', eventSearch.getEvents.bind(eventSearch))
eventSearch.sortButton.addEventListener('click', eventSearch.reverseDates.bind(eventSearch))






