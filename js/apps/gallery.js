
function showGalleryApp() {
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('appGallery').style.display = 'block';
    if (!window.galleryInitialized) {
        initGallery();  // This function tries to set up the gallery
        window.galleryInitialized = true;
    }
}
// The calendar initialization is inside jQuery ready, but the referenced function isn't defined yet
$(document).ready(function() {
    $('#appGalleryButton').on('click', function() {
      // Hide any other open apps
      $('#appContacts, #appSettings, #widgetsPanel, #appMessages, #chatScreen, #newMessageScreen, #attachmentPreview')
      .hide();
      $('#homeScreen').hide();
      $('#appScreen').show();
      $('#homeButton').show();
      updateHeaderColors();
      showGalleryApp();
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