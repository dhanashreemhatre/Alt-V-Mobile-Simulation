import('./apps/calendar.js');
import('./apps/phone.js');
import('./apps/contact.js');
import('./apps/message.js');
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

	
 

});


