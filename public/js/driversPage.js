function editDriver(rowId, _id) {
    rowId -= 2;
    var $row = $("#driversTable tbody")[0].rows[rowId];
    var licExp = new Date($row.cells[9].innerHTML);
    var licExpM = licExp.getMonth();
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    licExp = months[licExpM] + " " + licExp.getDate() + ", " + licExp.getFullYear();

    $('#editDriverFirstName :input').attr('value', $row.cells[1].innerHTML);
    $('#editDriverLastName :input').attr('value', $row.cells[2].innerHTML);
    $('#editDriverNationalId :input').attr('value', $row.cells[3].innerHTML);
    $('#editDriverAddress :input').attr('value', $row.cells[4].innerHTML);
    $('#editDriverEmail :input').attr('value', $row.cells[5].innerHTML);
    $('#editDriverPhoneNumber :input').attr('value', $row.cells[6].innerHTML);
    $('#editDriverDistanceTraveled :input').attr('value', $row.cells[7].innerHTML);
    $('#editDriverLicenseCategory :input').attr('value', $row.cells[8].innerHTML);
    $('#editDriverLicenseExpiryDate :input').attr('value', licExp);

    $('#editDriverForm').attr('action', "/drivers/update/" + _id);
}

function deleteDriver(rowId, _id) {
    rowId -= 2;
    var $row = $("#driversTable tbody")[0].rows[rowId];

    $('#deleteDriverFullName').text($row.cells[1].innerHTML + " " + $row.cells[2].innerHTML);

    $('#deleteDriverHref').attr('href', "/drivers/delete/" + _id);
}