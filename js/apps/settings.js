// Fix smartphone selector (remove #)
const smartphone = document.getElementById('smartphone');
const body = document.body;  // Add body reference for font size

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
        smartphone.setAttribute('data-theme', 'dark');
        updateHeaderColors();
    } else {
        smartphone.setAttribute('data-theme', 'light');
        updateHeaderColors();
    }
});

// Settings Navigation
const settingsItems = document.querySelectorAll('.settings-item');
const settingsContents = document.querySelectorAll('.settings-content');
const settingsList = document.querySelector('.settings-list');
const settingsHeader = document.querySelector('.settings-header');

// Add back button to header
const backButton = document.createElement('button');
backButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
backButton.classList.add('settings-back-btn');
settingsHeader.insertBefore(backButton, settingsHeader.firstChild);
backButton.style.display = 'none';

// Update click handlers
settingsItems.forEach(item => {
    item.addEventListener('click', () => {
        const section = item.getAttribute('data-section');
        
        // Hide settings list and show back button
        settingsList.style.display = 'none';
        backButton.style.display = 'block';
        
        // Hide all content sections first
        settingsContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Show selected section
        const selectedContent = document.getElementById(section);
        if (selectedContent) {
            selectedContent.classList.add('active');
        }
        
        // Update header title to match selected section
        const headerTitle = settingsHeader.querySelector('h5');
        headerTitle.textContent = item.querySelector('span').textContent;
        
        // Hide search input when in subsection
        const searchInput = document.getElementById('settingsSearch');
        searchInput.style.display = 'none';
    });
});

// Back button handler
backButton.addEventListener('click', () => {
    // Show settings list and hide back button
    settingsList.style.display = 'block';
    backButton.style.display = 'none';
    
    // Hide all content sections
    settingsContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Reset header title
    const headerTitle = settingsHeader.querySelector('h5');
    headerTitle.textContent = 'Settings';
    
    // Show search input again
    const searchInput = document.getElementById('settingsSearch');
    searchInput.style.display = 'block';
});

// Search Functionality
const searchInput = document.getElementById('settingsSearch');

searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    settingsItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
});

// Wallpaper Selection
const wallpaperOptions = document.querySelectorAll('.wallpaper-option');

wallpaperOptions.forEach(option => {
    option.addEventListener('click', () => {
        // Remove selected class from all options
        wallpaperOptions.forEach(opt => opt.classList.remove('selected'));
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Get the background style and apply it to the smartphone
        const backgroundStyle = window.getComputedStyle(option).background;
        if (smartphone) {  // Check if smartphone element exists
            smartphone.style.background = backgroundStyle;
        }
    });
});

// Font Size Change
const fontSelect = document.getElementById('fontSize');

fontSelect.addEventListener('change', (e) => {
    const size = e.target.value;
    if (body) {  // Check if body element exists
        switch(size) {
            case 'small':
                body.style.fontSize = '14px';
                break;
            case 'medium':
                body.style.fontSize = '16px';
                break;
            case 'large':
                body.style.fontSize = '18px';
                break;
        }
    }
});

// Phone app button click handler
$('#appSettingsButton').on('click', function() {
    // Hide home screen and show phone app
    $('#homeScreen').hide();
    $('#appScreen').show();
    $('#appSettings').show();
    updateHeaderColors();
    
    // Hide any other open apps
    $('#appContacts,#appCalls,#appGallery, #widgetsPanel, #appMessages, #chatScreen, #newMessageScreen, #attachmentPreview')
        .hide();
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