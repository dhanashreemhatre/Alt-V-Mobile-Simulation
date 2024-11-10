// Constants for element IDs and selectors
const ELEMENTS = {
    HOME_SCREEN: 'homeScreen',
    APP_CAMERA: 'appCamera',
    APP_SCREEN: 'appScreen',
    HOME_BUTTON: 'homeButton',
    HEAD: 'head',
    HEAD_INFO: '#headInfo i',
    TIME: '.time'
};

// Apps to hide when camera opens
const APPS_TO_HIDE = [
    '#appContacts',
    '#appSettings', 
    '#widgetsPanel',
    '#appMessages',
    '#chatScreen',
    '#newMessageScreen',
    '#attachmentPreview',
    '#appGallery'
].join(', ');

// Camera App Class
class CameraApp {
    constructor() {
        this.initialized = false;
        this.bindEvents();
    }

    bindEvents() {
        // Bind click event when document is ready
        $(document).ready(() => {
            $('#appCameraButton').on('click', () => this.showCamera());
        });
    }

    showCamera() {
        // Hide other apps
        $(APPS_TO_HIDE).hide();
        $(`#${ELEMENTS.HOME_SCREEN}`).hide();
        
        // Show camera screen
        $(`#${ELEMENTS.APP_SCREEN}`).show();
        $(`#${ELEMENTS.HOME_BUTTON}`).show();

        // Initialize gallery if needed
        if (!this.initialized) {
            this.initializeCamera();
        }

        // Update header colors
        this.updateHeaderColors();
    }

    initializeCamera() {
        try {
            this.initGallery(); // Assuming this function exists elsewhere
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize camera:', error);
        }
    }

    // Header color management
    getBackgroundColor(element) {
        return window.getComputedStyle(element).backgroundColor;
    }

    isLightColor(color) {
        const rgb = color.match(/\d+/g);
        if (!rgb) return true;
        
        const [r, g, b] = rgb.map(Number);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128;
    }

    updateIconColors(backgroundColor) {
        const textColor = this.isLightColor(backgroundColor) ? '#000000' : '#ffffff';
        
        // Update icons color
        $(ELEMENTS.HEAD_INFO).css('color', textColor);
        
        // Update time color if exists
        $(ELEMENTS.TIME).css('color', textColor);
    }

    updateHeaderColors() {
        const appScreen = document.getElementById(ELEMENTS.APP_SCREEN);
        if (!appScreen) return;

        const backgroundColor = this.getBackgroundColor(appScreen);
        
        // Update header background
        $(`#${ELEMENTS.HEAD}`).css('backgroundColor', backgroundColor);
        
        // Update icons and text colors
        this.updateIconColors(backgroundColor);
    }
}

// Initialize the camera app
const cameraApp = new CameraApp();

// // Export for testing purposes
// export { CameraApp };