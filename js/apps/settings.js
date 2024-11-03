const themeToggle = document.getElementById('themeToggle');
        const body = document.getElementById('#smartphone');

        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                body.setAttribute('data-theme', 'dark');
            } else {
                body.setAttribute('data-theme', 'light');
            }
        });

        // Settings Navigation
        const settingsItems = document.querySelectorAll('.settings-item');
        const settingsContents = document.querySelectorAll('.settings-content');

        settingsItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                
                // Hide all content sections
                settingsContents.forEach(content => {
                    content.classList.remove('active');
                });

                // Show selected section
                const selectedContent = document.getElementById(section);
                if (selectedContent) {
                    selectedContent.classList.add('active');
                }
            });
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
                wallpaperOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                body.style.background = window.getComputedStyle(option).background;
            });
        });

        // Font Size Change
        const fontSelect = document.getElementById('fontSize');
        
        fontSelect.addEventListener('change', (e) => {
            const size = e.target.value;
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
        });

// Phone app button click handler
$('#appSettingsButton').on('click', function() {
    // Hide home screen and show phone app
    $('#homeScreen').hide();
    $('#appScreen').show();
    $('#appSettings').show();
    
    // Hide any other open apps
    $('#appContacts,#appCalls,#appGallery, #widgetsPanel, #appMessages, #chatScreen, #newMessageScreen, #attachmentPreview')
      .hide();
    
   
  });