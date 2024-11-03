

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
