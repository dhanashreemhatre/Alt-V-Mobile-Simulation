

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
    updateHeaderColors();
    
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