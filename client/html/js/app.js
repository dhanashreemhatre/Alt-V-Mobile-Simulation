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
});


