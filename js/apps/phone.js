
  // Sample data
  const contacts = [
    { id: 1, name: 'John Doe', number: '123-456-7890', favorite: true },
    { id: 2, name: 'Jane Smith', number: '234-567-8901', favorite: false },
    { id: 3, name: 'Bob Johnson', number: '345-678-9012', favorite: true }
  ];

  const recentCalls = [
    { id: 1, contactId: 1, type: 'outgoing', time: '10:30 AM', date: 'Today' },
    { id: 2, contactId: 2, type: 'missed', time: '9:15 AM', date: 'Today' },
    { id: 3, contactId: 3, type: 'incoming', time: 'Yesterday', date: 'Yesterday' }
  ];

  // Phone app button click handler
  $('#appPhoneButton').on('click', function() {
    // Hide home screen and show phone app
    $('#homeScreen').hide();
    $('#appScreen').show();
    updateHeaderColors();
    $('#phoneApp').show();

    // Hide any other open apps
    $('#appContacts, #appSettings, #appGallery, #widgetsPanel, #appMessages, #chatScreen, #newMessageScreen, #attachmentPreview')
      .hide();
    
    // Initialize phone app if it hasn't been initialized yet
    if (!window.phoneAppInitialized) {
      initializePhoneApp();
      window.phoneAppInitialized = true;
    }
  });

  // Home button handler
  $('#homeButton').on('click', function() {
    // Hide phone app and show home screen
    $('#phoneApp, #callScreen').hide();
    $('#appScreen').hide();
    $('#homeScreen').show();
    
    // If there's an ongoing call, end it
    if (window.callTimer) {
      endCall();
    }
  });

  // Initialize phone app
  function initializePhoneApp() {
    // Initialize keypad
    const keypadButtons = [
      { number: '1', sub: '' },
      { number: '2', sub: 'ABC' },
      { number: '3', sub: 'DEF' },
      { number: '4', sub: 'GHI' },
      { number: '5', sub: 'JKL' },
      { number: '6', sub: 'MNO' },
      { number: '7', sub: 'PQRS' },
      { number: '8', sub: 'TUV' },
      { number: '9', sub: 'WXYZ' },
      { number: '*', sub: '' },
      { number: '0', sub: '+' },
      { number: '#', sub: '' }
    ];

    // Load initial data
    loadKeypad();
    loadContacts();
    loadFavorites();
    loadRecentCalls();
    initializeEventHandlers();

    function loadKeypad() {
      const keypadHtml = keypadButtons.map(btn => `
        <button class="keypad-btn" data-number="${btn.number}">
          <div class="number">${btn.number}</div>
          ${btn.sub ? `<div class="sub-text">${btn.sub}</div>` : ''}
        </button>
      `).join('');

      $('.keypad-grid').html(keypadHtml);
    }

    function loadContacts() {
      const contactsHtml = contacts.map(contact => `
        <div class="contact-item" data-id="${contact.id}">
          <div class="contact-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="contact-info">
            <div class="contact-name">${contact.name}</div>
            <div class="contact-number">${contact.number}</div>
          </div>
          <div class="contact-actions">
            <i class="fas fa-phone"></i>
            ${contact.favorite ? '<i class="fas fa-star"></i>' : ''}
          </div>
        </div>
      `).join('');

      $('.contacts-list').html(contactsHtml);
    }

    function loadFavorites() {
      const favorites = contacts.filter(contact => contact.favorite);
      const favoritesHtml = favorites.map(contact => `
        <div class="favorite-contact" data-id="${contact.id}">
          <div class="favorite-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="favorite-info">
            <div class="favorite-name">${contact.name}</div>
            <div class="favorite-number">${contact.number}</div>
          </div>
          <div class="favorite-actions">
            <i class="fas fa-phone"></i>
          </div>
        </div>
      `).join('');

      $('.favorites-list').html(favoritesHtml);
    }

    function loadRecentCalls() {
      const recentsHtml = recentCalls.map(call => {
        const contact = contacts.find(c => c.id === call.contactId);
        const iconClass = {
          'incoming': 'fa-phone-alt',
          'outgoing': 'fa-phone',
          'missed': 'fa-phone-slash'
        }[call.type];
        
        return `
          <div class="recent-call" data-id="${call.id}">
            <div class="call-type ${call.type}">
              <i class="fas ${iconClass}"></i>
            </div>
            <div class="call-info">
              <div class="caller-name">${contact ? contact.name : 'Unknown'}</div>
              <div class="call-time">${call.time} - ${call.date}</div>
            </div>
            <div class="call-action">
              <i class="fas fa-info-circle"></i>
            </div>
          </div>
        `;
      }).join('');

      $('.recents-list').html(recentsHtml);
    }

    // Event handlers for phone app
    function initializeEventHandlers() {
      // Tab switching
      $('.phone-tabs .tab').on('click', function() {
        $('.tab').removeClass('active');
        $('.phone-screen').removeClass('active');
        $(this).addClass('active');
        $(`#${$(this).data('tab')}Screen`).addClass('active');
      });

      // Keypad input
      $('.keypad-grid').on('click', '.keypad-btn', function() {
        const number = $(this).data('number');
        const currentNumber = $('#phoneNumber').val();
        $('#phoneNumber').val(currentNumber + number);
      });

      $('#backspace').on('click', function() {
        const currentNumber = $('#phoneNumber').val();
        $('#phoneNumber').val(currentNumber.slice(0, -1));
      });

      // Call button
      $('.call-btn').on('click', function() {
        const number = $('#phoneNumber').val();
        if (number) {
          initiateCall(number);
        }
      });

      // End call button
      $('.end-call-btn').on('click', endCall);

      // Clear recents button
      $('.clear-recents-btn').on('click', clearRecentCalls);

      // Contact search
      $('#contactSearchInput').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        filterContacts(searchTerm);
      });
    }
  }

  function initiateCall(number) {
    const contact = contacts.find(c => c.number === number);
    
    $('.caller-name').text(contact ? contact.name : number);
    $('.call-status').text('Calling...');
    
    $('#phoneApp').hide();
    $('#callScreen').show();
    
    startCallTimer();
    
    // Add to recent calls
    const newCall = {
      id: recentCalls.length + 1,
      contactId: contact ? contact.id : null,
      type: 'outgoing',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today'
    };
    recentCalls.unshift(newCall);
  }

  function endCall() {
    if (window.callTimer) {
      clearInterval(window.callTimer);
    }
    
    $('.call-timer').text('00:00');
    $('.call-status').text('Call ended');
    
    $('#callScreen').hide();
    $('#phoneApp').show();
    
    loadRecentCalls();
  }

  function startCallTimer() {
    let seconds = 0;
    window.callTimer = setInterval(() => {
      seconds++;
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      $('.call-timer').text(
        `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
      );
      $('.call-status').text('Connected');
    }, 1000);
  }

  function filterContacts(searchTerm) {
    $('.contact-item').each(function() {
      const name = $(this).find('.contact-name').text().toLowerCase();
      const number = $(this).find('.contact-number').text().toLowerCase();
      if (name.includes(searchTerm) || number.includes(searchTerm)) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  }

  function clearRecentCalls() {
    recentCalls.length = 0;
    loadRecentCalls();
  }






  
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