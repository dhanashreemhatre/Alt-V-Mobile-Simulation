
  // Add swipe down detection
  let touchStartY = 0;
  let touchEndY = 0;
  let isFlightMode = false;
  let isWifiSignal = false;
  
  $('#smartphone').on('touchstart', function(e) {
    touchStartY = e.originalEvent.touches[0].clientY;
  });
  
  $('#smartphone').on('touchmove', function(e) {
    touchEndY = e.originalEvent.touches[0].clientY;
    
    // If swipe down from top of screen
    if (touchStartY < 50 && (touchEndY - touchStartY) > 50) {
      showNotificationPanel();
      e.preventDefault();
    }
  });

  // Close panel when clicking outside
  $(document).on('click', function(e) {
    if (!$(e.target).closest('#notificationPanel').length && 
        !$(e.target).closest('#head').length) {
      hideNotificationPanel();
    }
  });
  $('#appAirplaneButton').click(() => {
		if (isFlightMode) {
			isFlightMode = false;
			$('#signal')
				.removeClass('fa-plane')
				.addClass('fa-signal');
        $('#signal2')
				.removeClass('fa-plane')
				.addClass('fa-signal');
		} else {
			isFlightMode = true;
			$('#signal')
				.removeClass('fa-signal')
				.addClass('fa-plane');
      $('#signal2')
				.removeClass('fa-signal')
				.addClass('fa-plane');
		}
    
    
		if ('alt' in window) alt.emit('smartphone:flightmode', isFlightMode);
	});
  $('#WifiButton').click(() => {
		if (isWifiSignal) {
			isWifiSignal = false;
			$('#wifi-signal')
				.addClass('hide-notification-item')
        $('#wifi-signal2')
        .addClass('hide-notification-item')
		} else {
			isWifiSignal = true;
			$('#wifi-signal')
      .removeClass('hide-notification-item')
      $('#wifi-signal2')
			.removeClass('hide-notification-item')
		}
    
    
		// if ('alt' in window) alt.emit('smartphone:flightmode', isFlightMode);
	});
  // Toggle buttons functionality
  $('.toggle-button').click(function() {
    $(this).toggleClass('active');
    audioClick.play();
  });
  $('.music-toggle').click(function() {
    // Toggle between the 'fa-pause' and 'fa-play' icons
    $(this).toggleClass('fa-pause fa-play');
});
  function showNotificationPanel() {
    $('#notificationPanel').slideDown(200);
  }

  function hideNotificationPanel() {
    $('#notificationPanel').slideUp(200);
  }

  // Brightness and volume slider functionality
  $('#brightnessSlider').on('input', function() {
    // Add brightness control logic here
  });

  $('#volumeSlider').on('input', function() {
    const value = $(this).val() / 100;
    audioVolume = value;
    audioCharge.volume = value;
    audioClick.volume = value;
  });
window.showNotificationPanel = showNotificationPanel;

showNotificationPanel();