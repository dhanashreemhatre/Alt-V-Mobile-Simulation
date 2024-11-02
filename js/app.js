$(() => {
	// #region CONFIG
	let isCharging = false;
	let isFlightMode = false;
	let audioVolume = 0.25;

	let audioCharge = new Audio('./audio/charge.mp3');
	audioCharge.volume = audioVolume;
	let audioClick = new Audio('./audio/click.mp3');
	audioClick.volume = audioVolume;

	let noSound = ['appChargeButton', 'appWeatherButton', 'appCalenderButton'];
	let noAppScreen = [
		'appChargeButton',
		'appAirplaneButton',
		'appWeatherButton',
		'appCalenderButton'
	];
	// #endregion
	
  // clock functionality
  function updateTime() {
    const timeElement = document.querySelector('.time');
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    timeElement.textContent = timeString;
  }

  // Generate app grid
  function generateAppGrid() {
    const appGrid = document.querySelector('.app-grid');
    for (let i = 0; i < 16; i++) {
      const appIcon = document.createElement('div');
      appIcon.className = 'app-icon';
      appIcon.innerHTML = '<div class="app-icon-inner"></div>';
      appGrid.appendChild(appIcon);
    }
  }
  updateTime();
  setInterval(updateTime, 1000);


	// #region EVENTS
	if ('alt' in window) {
		alt.emit('smartphone:ready');

		alt.on('smartphone:update', (data) => {
			updateSmartphone(data);
		});
		alt.on('smartphone:contacts:receive', (data) => {
			receiveContacts(data);
		});
		alt.on('smartphone:hide', () => {
			$('#smartphone').animate({ bottom: '-29vw', opacity: '0.5' }, 250);
		});
		alt.on('smartphone:show', () => {
			$('#smartphone').animate({ bottom: '2vw', opacity: '1' }, 250);
		});
	}
	// #endregion

	// #region general
	function updateSmartphone(data) {
		let batteryIcon = 'battery-empty';
		if (data.batteryPercent >= 25) batteryIcon = 'battery-quarter';
		if (data.batteryPercent >= 50) batteryIcon = 'battery-half';
		if (data.batteryPercent >= 75) batteryIcon = 'battery-three-quarters';
		if (data.batteryPercent >= 90) batteryIcon = 'battery-full';
		$('#battery')
			.removeClass()
			.addClass('fas fa-' + batteryIcon);

		$('#clock').text(data.currentTime);

		$('#appWeatherButton > i')
			.removeClass()
			.addClass('fas fa-' + data.weather);

		$('#appCalenderButton').text(data.date);
	}

	function toggleHomeScreen(screen = null) {
		if ($('#homeScreen').is(':visible')) {
			$('#homeScreen').hide();
			$('#appScreen').show();
			$('#appScreen > div').hide();
			$('#homeButton').show();
			if (screen)
				$((showScreen = '#' + screen.replace('Button', ''))).show();
		} else {
			$('#homeScreen').show();
			$('#appScreen').hide();
			$('#homeButton').hide();
		}
	}

	$('#appChargeButton').click(() => {
		audioCharge.play();
		if (isCharging) {
			isCharging = false;
			$('#battery').css('color', '#FFF');
		} else {
			isCharging = true;
			$('#battery').css('color', 'rgb(110, 255, 128)');
		}
		if ('alt' in window) alt.emit('smartphone:charge', isCharging);
	});

	$('#appAirplaneButton').click(() => {
		if (isFlightMode) {
			isFlightMode = false;
			$('#signal')
				.removeClass('fa-plane')
				.addClass('fa-signal');
		} else {
			isFlightMode = true;
			$('#signal')
				.removeClass('fa-signal')
				.addClass('fa-plane');
		}
		if ('alt' in window) alt.emit('smartphone:flightmode', isFlightMode);
	});

	$('#homeButton').click(() => {
		audioClick.play();
		toggleHomeScreen();
	});

	$('.app').click(function() {
		if (!noSound.includes($(this).attr('id'))) audioClick.play();
		if (!noAppScreen.includes($(this).attr('id')))
			toggleHomeScreen($(this).attr('id'));
	});
	// #endregion

	// #region CONTACTS
	$('#appContactsSearch').on('keyup change', function() {
		let searchString = $(this)
			.val()
			.toLowerCase();
		if (searchString.length) {
			$('.contact').hide();
			$('.contact').each(function() {
				if (
					$(this)
						.text()
						.toLowerCase()
						.includes(searchString)
				)
					$(this).show();
			});
		} else {
			$('.contact').show();
		}
	});

	$('#appContactsButton').click(() => {
		if ('alt' in window) alt.emit('smartphone:contacts:request');
		$('#appContactsOverview').show();
	});

	$('#contactNewName').on('change, keyup', () => {
		sendUpdateContact();
	});

	$('#contactNewPhone').on('change, keyup', () => {
		sendUpdateContact();
	});

	$(document).on('click', '.contact', function() {
		showEditContact(
			$(this).attr('data-id'),
			$(this).attr('data-name'),
			$(this).attr('data-phone')
		);
	});

	$('#editContactHead').click(() => {
		hideEditContact();
	});

	$('#editContactDeleteButton').click(() => {
		let deleteId = $('#contactId').val();
		if ('alt' in window) alt.emit('smartphone:contacts:delete', deleteId);
		hideEditContact();
	});

	function showEditContact(id, name, phone) {
		$('#contactId').val(id);
		$('#contactNewName').val(name);
		$('#editContactName').text(name);
		$('#editContactLetter > span').text(name[0]);
		$('#contactNewPhone').val(phone);
		$('#appContactsOverview').hide();
		$('#appContactsEdit').show();
	}

	function hideEditContact() {
		$('#contactId').val('');
		$('#contactNewName').val('');
		$('#contactNewPhone').val('');
		$('#appContactsOverview').show();
		$('#appContactsEdit').hide();
		$('#appContactsSearch').val('');
		$('.contact').show();
	}

	function sendUpdateContact() {
		let contactId = $('#contactId').val();
		let contactName = $('#contactNewName').val();
		let contactPhone = $('#contactNewPhone').val();

		let newData = { id: contactId, name: contactName, phone: contactPhone };
		if (contactId && contactName && contactPhone) {
			if ('alt' in window)
				alt.emit('smartphone:contacts:update', newData);
			$('#editContactName').text(contactName);
		}
	}

	function receiveContacts(data) {
		if ($('#appContacts').length) {
			$('#appContactsList').html('');
			let newHTML = '';
			data.forEach((d) => {
				newHTML += `
				<div class="contact" data-id="${d.id}" data-name="${d.name}" data-phone="${d.phone}">
					${d.name}
				</div>`;
			});
			$('#appContactsList').html(newHTML);
		}
	}
	let currentChat = null;
  let attachmentType = null;
  let messages = {};

  // Sample data with more realistic structure
  const sampleMessages = {
    'contact1': [
      { type: 'text', content: 'Hey, how are you?', sent: false, time: '09:30', id: 1 },
      { type: 'text', content: "I'm good, thanks! How about you?", sent: true, time: '09:31', id: 2 },
      { type: 'image', content: '/api/placeholder/200/200', sent: true, time: '09:32', id: 3 },
      { type: 'location', lat: 40.7128, lng: -74.0060, sent: true, time: '09:33', id: 4 }
    ],
    'contact2': [
      { type: 'text', content: 'Are we still meeting today?', sent: false, time: '10:15', id: 5 },
      { type: 'text', content: 'Yes, at 2 PM', sent: true, time: '10:16', id: 6 }
    ]
  };

  // Initialize messages
  messages = sampleMessages;

  // Event Handlers
  function initializeEventHandlers() {
    // App navigation
    $('#appMessagesButton').on('click', function() {
      $('.app-screen').hide();
      $('#appMessages').show();
      loadMessagesList();
    });

    $('#newMessageBtn').on('click', function() {
      $('#appMessages').hide();
      $('#newMessageScreen').show();
      loadSuggestedContacts();
    });

    $('#backFromNew').on('click', function() {
      $('#newMessageScreen').hide();
      $('#appMessages').show();
    });

    $('#searchMessagesBtn').on('click', function() {
      $('.messages-search').slideToggle();
      $('#messageSearchInput').focus();
    });

    $('#backToMessages').on('click', function() {
      $('#chatScreen').hide();
      $('#appMessages').show();
    });

    // Message input handling
    $('#messageInput').on('keypress', function(e) {
      if (e.which === 13 && $(this).val().trim()) {
        sendMessage($(this).val());
        $(this).val('');
      }
    });

    $('#sendMessage').on('click', function() {
      const message = $('#messageInput').val().trim();
      if (message) {
        sendMessage(message);
        $('#messageInput').val('');
      }
    });

    // Attachment handling
    $('.chat-attachments i').on('click', function() {
      const type = $(this).hasClass('fa-camera') ? 'camera' :
                  $(this).hasClass('fa-image') ? 'gallery' :
                  $(this).hasClass('fa-map-marker-alt') ? 'location' : 'audio';
      showAttachmentInterface(type);
    });

    // Search functionality
    $('#messageSearchInput').on('input', function() {
      const searchTerm = $(this).val().toLowerCase();
      filterMessages(searchTerm);
    });

    // Attachment preview handlers
    $('#closeAttachment, #cancelAttachment').on('click', function() {
      $('#attachmentPreview').hide();
    });

    $('#sendAttachment').on('click', function() {
      sendAttachment();
    });
  }

  // Core Functions
  function loadMessagesList() {
    const list = Object.entries(messages).map(([contactId, msgs]) => {
      const lastMessage = msgs[msgs.length - 1];
      const unreadCount = msgs.filter(m => !m.sent && !m.read).length;
      
      return `
        <div class="message-preview" data-contact="${contactId}">
          <div class="message-contact-photo">
            ${contactId[0].toUpperCase()}
          </div>
          <div class="message-info">
            <div class="message-header">
              <div class="message-contact-name">Contact ${contactId.slice(-1)}</div>
              <div class="message-time">${lastMessage.time}</div>
            </div>
            <div class="message-preview-text">
              ${getMessagePreview(lastMessage)}
              ${unreadCount ? `<span class="unread-count">${unreadCount}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    $('#messagesList').html(list);
    
    $('.message-preview').on('click', function() {
      const contactId = $(this).data('contact');
      openChat(contactId);
    });
  }

  function getMessagePreview(message) {
    switch(message.type) {
      case 'text':
        return message.content;
      case 'image':
        return '📷 Photo';
      case 'location':
        return '📍 Location';
      case 'audio':
        return '🎵 Audio';
      default:
        return 'Message';
    }
  }

  function openChat(contactId) {
    currentChat = contactId;
    $('.chat-contact-name').text(`Contact ${contactId.slice(-1)}`);
    $('#appMessages').hide();
    $('#chatScreen').show();
    loadChatMessages();
    markMessagesAsRead(contactId);
  }

  function loadChatMessages() {
    if (!messages[currentChat]) return;

    const chat = messages[currentChat].map(message => `
      <div class="message-bubble ${message.sent ? 'message-sent' : 'message-received'}" data-message-id="${message.id}">
        ${renderMessageContent(message)}
        <div class="message-time">${message.time}</div>
        ${message.sent ? `<div class="message-status">${message.delivered ? '✓✓' : '✓'}</div>` : ''}
      </div>
    `).join('');
    
    $('#chatMessages').html(chat);
    scrollToBottom();
  }

  function renderMessageContent(message) {
    switch(message.type) {
      case 'text':
        return `<div class="message-text">${escapeHtml(message.content)}</div>`;
      case 'image':
        return `<img src="${message.content}" alt="Shared image" class="message-image"/>`;
      case 'location':
        return `
          <div class="location-preview">
            <i class="fas fa-map-marker-alt"></i>
            <div>Location shared</div>
            <div class="location-coordinates">
              ${message.lat.toFixed(4)}, ${message.lng.toFixed(4)}
            </div>
          </div>
        `;
      case 'audio':
        return `
          <div class="audio-preview">
            <i class="fas fa-play"></i>
            <div class="audio-duration">${message.duration || '0:00'}</div>
          </div>
        `;
      default:
        return '<div class="message-error">Unsupported message type</div>';
    }
  }

  function sendMessage(content) {
    if (!currentChat || !content) return;

    const newMessage = {
      type: 'text',
      content: content,
      sent: true,
      time: getCurrentTime(),
      id: generateMessageId(),
      delivered: false
    };

    if (!messages[currentChat]) {
      messages[currentChat] = [];
    }

    messages[currentChat].push(newMessage);
    loadChatMessages();
    
    // Simulate message delivery
    setTimeout(() => {
      newMessage.delivered = true;
      loadChatMessages();
    }, 1000);
  }

  function showAttachmentInterface(type) {
    attachmentType = type;
    $('#attachmentPreview').show();
    
    const previewContent = type === 'location' ? 
      `<div class="location-preview">
        <i class="fas fa-map-marker-alt"></i>
        <div>Current Location</div>
        <div class="location-loading">Loading...</div>
      </div>` :
      `<div class="attachment-placeholder">
        <i class="fas fa-${type === 'camera' ? 'camera' : 
                         type === 'gallery' ? 'image' : 
                         type === 'audio' ? 'microphone' : 'file'}"></i>
        <div>Select ${type}</div>
      </div>`;

    $('.attachment-content').html(previewContent);
  }

  function sendAttachment() {
    if (!currentChat || !attachmentType) return;

    const newMessage = {
      type: attachmentType === 'camera' || attachmentType === 'gallery' ? 'image' : attachmentType,
      sent: true,
      time: getCurrentTime(),
      id: generateMessageId(),
      delivered: false
    };

    switch(attachmentType) {
      case 'camera':
      case 'gallery':
        newMessage.content = '/api/placeholder/200/200';
        break;
      case 'location':
        newMessage.lat = 40.7128;
        newMessage.lng = -74.0060;
        break;
      case 'audio':
        newMessage.duration = '0:15';
        break;
    }

    messages[currentChat].push(newMessage);
    loadChatMessages();
    $('#attachmentPreview').hide();
    
    setTimeout(() => {
      newMessage.delivered = true;
      loadChatMessages();
    }, 1000);
  }

  // Utility Functions
  function getCurrentTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  function generateMessageId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  }

  function scrollToBottom() {
    const chatMessages = $('#chatMessages');
    chatMessages.scrollTop(chatMessages[0].scrollHeight);
  }

  function filterMessages(searchTerm) {
    $('.message-preview').each(function() {
      const contactId = $(this).data('contact');
      const contactMessages = messages[contactId];
      const hasMatch = contactMessages.some(msg => 
        msg.type === 'text' && msg.content.toLowerCase().includes(searchTerm)
      );
      $(this).toggle(hasMatch);
    });
  }

  function markMessagesAsRead(contactId) {
    if (!messages[contactId]) return;
    
    messages[contactId].forEach(message => {
      if (!message.sent) {
        message.read = true;
      }
    });
    
    loadMessagesList();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize the system
  initializeEventHandlers();
  loadMessagesList();

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
            <div class="call-actions">
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
    $('#appScreen').show();
    $('#homeScreen').hide();
    showCalendarApp();
  });
});

});


