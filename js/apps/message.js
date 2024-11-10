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
      updateHeaderColors();
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

  // Improved chat initialization and scroll handling
function initializeChatFunctionality() {
  let isTyping = false;
  let typingTimeout;
  
  // Initial scroll to bottom
  scrollToBottom();
  
  // Message input handling
  $('#messageInput').on('keypress', function(e) {
    if (e.which === 13 && !e.shiftKey) {
      e.preventDefault();
      const message = $(this).val().trim();
      if (message) {
        sendMessage(message);
        $(this).val('');
      }
    }
  });

  // Send button handling
  $('#sendMessage').on('click', function() {
    const message = $('#messageInput').val().trim();
    if (message) {
      sendMessage(message);
      $('#messageInput').val('');
    }
  });

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
    
    // Append message immediately
    appendMessage(newMessage);
    scrollToBottom();

    // Simulate message delivery
    setTimeout(() => {
      newMessage.delivered = true;
      updateMessageStatus(newMessage.id, 'delivered');
      
      // Simulate reply
      if (Math.random() > 0.5) {
        simulateReply();
      }
    }, 1000);
  }

  function appendMessage(message) {
    const messageHtml = `
      <div class="message-bubble ${message.sent ? 'message-sent' : 'message-received'}" 
           data-message-id="${message.id}">
        <div class="message-content">${escapeHtml(message.content)}</div>
        <div class="message-time">${message.time}</div>
        ${message.sent ? `
          <div class="message-status">
            ${message.delivered ? '✓✓' : '✓'}
          </div>
        ` : ''}
      </div>
    `;
    
    $('#chatMessages').append(messageHtml);
    scrollToBottom();
  }

  function simulateReply() {
    showTypingIndicator();
    
    setTimeout(() => {
      hideTypingIndicator();
      
      const replies = [
        "Got it, thanks!",
        "I'll check and get back to you.",
        "Sounds good!",
        "Perfect, thanks for letting me know.",
        "I understand, will do!"
      ];
      
      const replyMessage = {
        type: 'text',
        content: replies[Math.floor(Math.random() * replies.length)],
        sent: false,
        time: getCurrentTime(),
        id: generateMessageId()
      };
      
      if (!messages[currentChat]) {
        messages[currentChat] = [];
      }
      
      messages[currentChat].push(replyMessage);
      appendMessage(replyMessage);
    }, 1500 + Math.random() * 1000);
  }

  function showTypingIndicator() {
    if (!$('#typingIndicator').length) {
      const typingHtml = `
        <div class="message-loading" id="typingIndicator">
          <div class="loading-dots">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
          </div>
        </div>
      `;
      
      $('#chatMessages').append(typingHtml);
      scrollToBottom();
    }
  }

  function hideTypingIndicator() {
    $('#typingIndicator').remove();
  }

  function updateMessageStatus(messageId, status) {
    const messageElement = $(`.message-bubble[data-message-id="${messageId}"]`);
    const statusElement = messageElement.find('.message-status');
    
    if (status === 'delivered') {
      statusElement.html('✓✓');
    }
  }

  function scrollToBottom() {
    const chatMessages = $('#chatMessages');
    chatMessages.scrollTop(chatMessages[0].scrollHeight);
  }

  // Handle window resize
  $(window).on('resize', function() {
    scrollToBottom();
  });

  // Attachment handling
  $('.chat-attachments i').on('click', function() {
    const type = $(this).hasClass('fa-camera') ? 'camera' :
                $(this).hasClass('fa-image') ? 'gallery' :
                $(this).hasClass('fa-map-marker-alt') ? 'location' : 'audio';
    showAttachmentInterface(type);
  });
}

// Initialize when document is ready
$(document).ready(function() {
  initializeChatFunctionality();
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