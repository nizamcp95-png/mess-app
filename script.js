// Sweet messages array (365 messages)
const sweetMessages = [
    "You are amazing! 🌟",
    "Today is full of possibilities! ✨",
    "Your smile brightens the world! 😊",
    "You're stronger than you know! 💪",
    "Every day is a fresh start! 🌅",
    "You make a difference! 🌈",
    "Believe in yourself! 💫",
    "You're doing great! 🎉",
    "Keep shining bright! ⭐",
    "You are loved! ❤️",
    "Today is your day! 🌺",
    "You're one of a kind! 🦋",
    "Dream big! 🌙",
    "You inspire others! 🌟",
    "Stay positive! ☀️",
    "You're beautiful inside and out! 🌸",
    "Keep going! 🚀",
    "You're capable of amazing things! 💎",
    "Today holds magic! ✨",
    "You're a gift to the world! 🎁",
    "Stay true to yourself! 🌻",
    "You're making progress! 📈",
    "Your kindness matters! 💝",
    "You're braver than you believe! 🦁",
    "Every moment is precious! ⏰",
    "You're on the right path! 🛤️",
    "You bring joy to others! 🎈",
    "You're enough! 💯",
    "Keep reaching for the stars! 🌠",
    "You're a ray of sunshine! ☀️",
    "You make the world better! 🌍"
];

// Generate more messages to reach 365
function generateMessages() {
    const baseMessages = [...sweetMessages];
    const messages = [];
    
    for (let i = 0; i < 365; i++) {
        const baseMsg = baseMessages[i % baseMessages.length];
        const variations = [
            baseMsg,
            `Day ${i + 1}: ${baseMsg}`,
            `${baseMsg} Day ${i + 1} of 2026!`,
            `On this special day: ${baseMsg}`,
            `${baseMsg} You've made it to day ${i + 1}!`
        ];
        messages.push(variations[i % variations.length]);
    }
    
    return messages;
}

const allMessages = generateMessages();

// Calendar data
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Generate all dates for 2026
function generateCalendarDates() {
    const dates = [];
    const year = 2026;
    
    for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        
        const monthData = {
            month: month,
            monthName: months[month],
            firstDay: firstDay,
            days: []
        };
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayOfYear = Math.floor((date - new Date(year, 0, 1)) / (1000 * 60 * 60 * 24)) + 1;
            
            monthData.days.push({
                day: day,
                date: date,
                dateString: dateString,
                dayOfYear: dayOfYear,
                dayName: daysOfWeek[date.getDay()]
            });
        }
        
        dates.push(monthData);
    }
    
    return dates;
}

// Get current date (local time)
function getCurrentDate() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// Check if a date is unlocked
function isDateUnlocked(boxDate) {
    const currentDate = getCurrentDate();
    return boxDate <= currentDate;
}

// Load opened boxes from localStorage
function loadOpenedBoxes() {
    const stored = localStorage.getItem('openedBoxes');
    return stored ? JSON.parse(stored) : [];
}

// Save opened box to localStorage
function saveOpenedBox(dateString) {
    const opened = loadOpenedBoxes();
    if (!opened.includes(dateString)) {
        opened.push(dateString);
        localStorage.setItem('openedBoxes', JSON.stringify(opened));
    }
}

// Check if box is opened
function isBoxOpened(dateString) {
    return loadOpenedBoxes().includes(dateString);
}

// Create calendar HTML
function createCalendar() {
    const calendar = document.getElementById('calendar');
    const calendarData = generateCalendarDates();
    
    calendar.innerHTML = '';
    
    calendarData.forEach(monthData => {
        const monthSection = document.createElement('div');
        monthSection.className = 'month-section';
        
        const monthHeader = document.createElement('div');
        monthHeader.className = 'month-header';
        monthHeader.textContent = `${monthData.monthName} 2026`;
        monthSection.appendChild(monthHeader);
        
        const monthGrid = document.createElement('div');
        monthGrid.className = 'month-grid';
        
        // Add empty cells for days before month starts
        for (let i = 0; i < monthData.firstDay; i++) {
            const emptyBox = document.createElement('div');
            emptyBox.className = 'day-box empty';
            monthGrid.appendChild(emptyBox);
        }
        
        // Add day boxes
        monthData.days.forEach(dayData => {
            const dayBox = document.createElement('div');
            dayBox.className = 'day-box';
            dayBox.setAttribute('data-date', dayData.dateString);
            dayBox.setAttribute('data-day', dayData.dayOfYear);
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = dayData.day;
            
            const dayName = document.createElement('div');
            dayName.className = 'day-name';
            dayName.textContent = dayData.dayName;
            
            dayBox.appendChild(dayNumber);
            dayBox.appendChild(dayName);
            
            // Set locked/unlocked state
            if (isDateUnlocked(dayData.date)) {
                dayBox.classList.add('unlocked');
                
                // Check if already opened
                if (isBoxOpened(dayData.dateString)) {
                    dayBox.classList.add('opened');
                } else {
                    // Add click handler
                    dayBox.addEventListener('click', () => openBox(dayBox, dayData));
                }
            } else {
                dayBox.classList.add('locked');
            }
            
            monthGrid.appendChild(dayBox);
        });
        
        monthSection.appendChild(monthGrid);
        calendar.appendChild(monthSection);
    });
}

// Open box with animation
function openBox(boxElement, dayData) {
    // Prevent multiple clicks
    if (boxElement.classList.contains('opening')) return;
    
    // Add opening animation class
    boxElement.classList.add('opening');
    
    // Save to localStorage
    saveOpenedBox(dayData.dateString);
    
    // Show modal after animation
    setTimeout(() => {
        boxElement.classList.remove('opening');
        boxElement.classList.add('opened');
        boxElement.classList.remove('unlocked');
        
        // Remove click handler
        boxElement.style.pointerEvents = 'none';
        
        showMessage(dayData.dayOfYear - 1);
    }, 600);
}

// Show message modal
function showMessage(dayIndex) {
    const modal = document.getElementById('messageModal');
    const messageText = document.getElementById('messageText');
    
    messageText.textContent = allMessages[dayIndex];
    modal.classList.add('show');
    
    // Close modal handlers
    const closeBtn = document.getElementById('closeModal');
    closeBtn.onclick = () => {
        modal.classList.remove('show');
    };
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    };
    
    // Close on Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            modal.classList.remove('show');
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

// Initialize calendar on page load
document.addEventListener('DOMContentLoaded', () => {
    createCalendar();
});
