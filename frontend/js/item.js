$(document).ready(function () {
    const url = 'http://localhost:5000'; // Target your Express server base URL

    // Secure authentication extraction utility
    const getToken = () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            Swal.fire({
                icon: 'warning',
                text: 'You must be logged in to access this page.',
                showConfirmButton: true
            }).then(() => {
                window.location.href = 'login.html';
            });
            return null;
        }
        return JSON.parse(token); // Matches your session parser format
    };

    // 1. Initialize Interactive Inventory Grid
    const table = $('#itable').DataTable({
        ajax: {
            url: `${url}/api/v1/items`,
            dataSrc: 'rows', // Processes our backend's flattened rows package
            headers: {
                "Authorization": "Bearer " + getToken()
            }
        },
        dom: 'Bfrtip',
        buttons: [
            'pdf',
            'excel',
            {
                text: 'Add item',
                className: 'btn btn-primary',
                action: function (e, dt, node, config) {
                    $("#iform").trigger("reset");
                    $('#itemModal').modal('show');
                    $('#itemUpdate').hide();
                    $('#itemSubmit').show();
                    $('#itemImagePreview').remove(); // Clears trailing image layouts
                }
            }
        ],
        columns: [
            { data: 'item_id' },
            {
                data: null,
                render: function (data, type, row) {
                    // Serves static image folder streams seamlessly
                    return `<img src="${url}/${data.img_path}" width="50" height="60" class="img-thumbnail">`;
                }
            },
            { data: 'description' },
            { 
                data: 'sell_price',
                render: function(data) { return `₱ ${parseFloat(data).toFixed(2)}`; }
            },
            { 
                data: 'cost_price',
                render: function(data) { return `₱ ${parseFloat(data).toFixed(2)}`; }
            },
            { data: 'quantity' } // Reads the flattened separate stock properties cleanly!
        ]
    });

    // 2. Submit New Item Form Routine
    $('#itemSubmit').on('click', function (e) {
        e.preventDefault();
        
        // Form boundary collector handling raw text parameters and photo binary payloads
        const formData = new FormData($('#iform')[0]);

        $.ajax({
            method: "POST",
            url: `${url}/api/v1/items`,
            data: formData,
            processData: false, // Prevents jQuery from converting object profiles into query strings
            contentType: false, // Enforces boundary strings for multipart transmission
            headers: {
                "Authorization": "Bearer " + getToken()
            },
            success: function (data) {
                if (data.success) {
                    $('#itemModal').modal('hide');
                    table.ajax.reload(); // Instantly refreshes list row indicators
                    Swal.fire({ icon: 'success', text: 'Gadget catalog row established!' });
                }
            },
            error: function (error) {
                Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Save operation failed.' });
            }
        });
    });

    // 3. Edit Trigger: Populate Existing Values onto Modal inputs
    $('#itable tbody').on('click', 'tr', function () {
        const data = table.row(this).data();
        if (!data) return;

        $('#itemModal').modal('show');
        $('#itemSubmit').hide();
        $('#itemUpdate').show().data('id', data.item_id); // Securely pins index reference tracking

        // Map straight to your modal inputs
        $('#desc').val(data.description);
        $('#sell').val(data.sell_price);
        $('#cost').val(data.cost_price);
        $('#qty').val(data.quantity); // Matches your stock parameters cleanly
    });

    // 4. Submit Update Changes
    $('#itemUpdate').on('click', function (e) {
        e.preventDefault();
        const id = $(this).data('id');
        const formData = new FormData($('#iform')[0]);

        $.ajax({
            method: "PUT",
            url: `${url}/api/v1/items/${id}`,
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                "Authorization": "Bearer " + getToken()
            },
            success: function (data) {
                $('#itemModal').modal('hide');
                table.ajax.reload();
                Swal.fire({ icon: 'success', text: 'Catalog spec updates saved successfully!' });
            },
            error: function (error) {
                console.log(error);
            }
        });
    });

    // 5. Delete Entry Block
    $('#itable').on('click', '.btn-danger', function (e) {
        e.stopPropagation(); // Prevents launching edit popup modals on click trigger
        const $row = $(this).closest('tr');
        const data = table.row($row).data();

        bootbox.confirm({
            message: "Are you sure you want to completely remove this gadget record and wipe out its matching warehouse stock count?",
            buttons: {
                confirm: { label: 'Yes', className: 'btn-success' },
                cancel: { label: 'No', className: 'btn-danger' }
            },
            callback: function (result) {
                if (result) {
                    $.ajax({
                        method: "DELETE",
                        url: `${url}/api/v1/items/${data.item_id}`,
                        headers: { "Authorization": "Bearer " + getToken() },
                        success: function (response) {
                            $row.fadeOut(1000, function () { table.row($row).remove().draw(); });
                            Swal.fire({ icon: 'success', text: 'Record deleted.' });
                        }
                    });
                }
            }
        });
    });
});