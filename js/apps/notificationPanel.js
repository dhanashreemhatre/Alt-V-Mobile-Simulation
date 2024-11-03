
  // Add swipe down detection
  let touchStartY = 0;
  let touchEndY = 0;
  
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

  // Toggle buttons functionality
  $('.toggle-button').click(function() {
    $(this).toggleClass('active');
    audioClick.play();
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
