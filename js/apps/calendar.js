 // Global variables
 let currentDate = new Date();
 let events = {};
 let calendarInitialized = false;
 
 
 // Initialize calendar
 function initCalendar() {
   try {
     // Initial render
     updateTime();
     renderCalendar();
     
     // Set up interval for time updates
     setInterval(updateTime, 1000);
     
     // Setup event listeners after ensuring elements exist
     setupEventListeners();
     
     console.log('Calendar initialized successfully');
   } catch (error) {
     console.error('Error initializing calendar:', error);
   }
 }
 
 // Update time in status bar
 function updateTime() {
   const timeElement = $('.time');  // Using jQuery selector
   if (timeElement.length) {
     const now = new Date();
     timeElement.text(now.toLocaleTimeString([], { 
       hour: '2-digit', 
       minute: '2-digit' 
     }));
   }
 }
 
 // Render calendar
 function renderCalendar() {
   try {
     const grid = $('.calendar-grid');
     const monthTitle = $('#currentMonth');
     
     if (!grid.length || !monthTitle.length) {
       throw new Error('Required calendar elements not found');
     }
     
     const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
     const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
     
     monthTitle.text(currentDate.toLocaleString('default', { 
       month: 'long', 
       year: 'numeric' 
     }));
     
     grid.empty();  // Clear existing content
     
     // Add previous month's days
     const firstDayIndex = firstDay.getDay();
     for (let i = firstDayIndex; i > 0; i--) {
       const day = new Date(firstDay);
       day.setDate(day.getDate() - i);
       addDayToGrid(day, true);
     }
     
     // Add current month's days
     for (let i = 1; i <= lastDay.getDate(); i++) {
       const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
       addDayToGrid(day);
     }
     
     // Add next month's days
     const remainingDays = 42 - (firstDayIndex + lastDay.getDate());
     for (let i = 1; i <= remainingDays; i++) {
       const day = new Date(lastDay);
       day.setDate(day.getDate() + i);
       addDayToGrid(day, true);
     }
     
     console.log('Calendar rendered successfully');
   } catch (error) {
     console.error('Error rendering calendar:', error);
   }
 }
 
 // Add day to calendar grid
 function addDayToGrid(date, otherMonth = false) {
   try {
     const grid = $('.calendar-grid');
     const dayElement = $('<div>', {
       class: `calendar-day${otherMonth ? ' other-month' : ''}${isToday(date) ? ' today' : ''}`
     });
     
     dayElement.text(date.getDate());
     
     const dateString = date.toISOString().split('T')[0];
     if (events[dateString]) {
       const dot = $('<div>', {
         class: 'event-dot'
       });
       dayElement.append(dot);
     }
     
     dayElement.on('click', () => openEventModal(date));
     grid.append(dayElement);
   } catch (error) {
     console.error('Error adding day to grid:', error);
   }
 }
 
 // Check if date is today
 function isToday(date) {
   const today = new Date();
   return date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear();
 }
 
 // Event modal functions
 function openEventModal(date) {
   const modal = $('.event-modal');
   modal.show();
   modal.data('date', date.toISOString().split('T')[0]);
   
   // Clear previous inputs
   $('#eventTitle').val('');
   $('#eventTime').val('');
 }
 
 function closeEventModal() {
   $('.event-modal').hide();
 }
 
 function saveEvent() {
   const modal = $('.event-modal');
   const title = $('#eventTitle').val().trim();
   const time = $('#eventTime').val();
   const date = modal.data('date');
   
   if (title && time && date) {
     if (!events[date]) {
       events[date] = [];
     }
     events[date].push({ title, time });
     
     closeEventModal();
     renderCalendar();  // Refresh calendar to show new event dot
   }
 }
 
 // Setup event listeners
 function setupEventListeners() {
   try {
     // Navigation buttons
     $('#prevMonth').on('click', function() {
       currentDate.setMonth(currentDate.getMonth() - 1);
       renderCalendar();
     });
     
     $('#nextMonth').on('click', function() {
       currentDate.setMonth(currentDate.getMonth() + 1);
       renderCalendar();
     });
     
     // Event handling
     $('.add-event').on('click', function() {
       openEventModal(new Date());
     });
     
     $('.modal-buttons .save').on('click', saveEvent);
     $('.modal-buttons .cancel').on('click', closeEventModal);
     
     console.log('Event listeners set up successfully');
   } catch (error) {
     console.error('Error setting up event listeners:', error);
   }
 }
 function showCalendarApp() {
   document.getElementById('homeScreen').style.display = 'none';
   document.getElementById('calendarApp').style.display = 'block';
   if (!window.calendarInitialized) {
     initCalendar();  // This function tries to set up the calendar
     window.calendarInitialized = true;
   }
 }
 // The calendar initialization is inside jQuery ready, but the referenced function isn't defined yet
 $(document).ready(function() {
   $('#appCalenderButton').on('click', function() {
     // Hide any other open apps
     $('#appContacts,#appCamera,#phoneApp, #appSettings, #appGallery, #widgetsPanel, #appMessages, #chatScreen, #newMessageScreen, #attachmentPreview')
     .hide();
     $('#homeScreen').hide();
     $('#appScreen').show();
     $('#homeButton').show();
     updateHeaderColors();
     showCalendarApp();
   });
 });





 
//updating header color in accordance to the theme
const appScreen = document.getElementById('appScreen');
const head = document.getElementById('head');
    // Get computed background color
    function getBackgroundColor(element) {
        return window.getComputedStyle(element).backgroundColor;
    }

    // Check if color is light or dark
    function isLightColor(color) {
        const rgb = color.match(/\d+/g);
        if (!rgb) return true;
        
        const [r, g, b] = rgb.map(Number);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128;
    }

    // Update icon colors based on background
    function updateIconColors(backgroundColor) {
        const icons = document.querySelectorAll('#headInfo i');
        const timeElement = document.querySelector('.time');
        const textColor = isLightColor(backgroundColor) ? '#000000' : '#ffffff';
        
        icons.forEach(icon => {
            icon.style.color = textColor;
        });

        if (timeElement) {
            timeElement.style.color = textColor;
        }
    }

    // Update header colors
    function updateHeaderColors() {
        if (!appScreen) return;

        const backgroundColor = getBackgroundColor(appScreen);
        
        [ head].forEach(element => {
            if (element) {
                element.style.backgroundColor = backgroundColor;
            }
        });

        updateIconColors(backgroundColor);
    }