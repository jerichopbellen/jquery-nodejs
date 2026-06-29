$(document).ready(function () {
  const url = 'http://localhost:5000';
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  // simple admin guard
  if (!token) {
    Swal.fire({ icon: 'warning', text: 'Please login first.' }).then(() => {
      window.location.href = 'login.html';
    });
    return;
  }

  if (role && role !== 'admin') {
    Swal.fire({ icon: 'error', text: 'Admin access only.' }).then(() => {
      window.location.href = 'home.html';
    });
    return;
  }

  const table = $('#itable').DataTable({
    ajax: {
      url: `${url}/api/v1/items`,
      dataSrc: 'rows',
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    dom: 'Bfrtip',
    buttons: [
      'pdf',
      'excel',
      {
        text: 'Add item',
        className: 'btn btn-primary',
        action: function () {
          $('#iform').trigger('reset');
          $('#itemModal').modal('show');
          $('#itemUpdate').hide();
          $('#itemSubmit').show();
        }
      }
    ],
    columns: [
      { data: 'item_id' },
      {
        data: null,
        render: function (data) {
          return `<img src="${url}/${data.img_path}" width="50" height="60" class="img-thumbnail">`;
        }
      },
      { data: 'description' },
      {
        data: 'sell_price',
        render: function (data) {
          return `₱ ${parseFloat(data).toFixed(2)}`;
        }
      },
      {
        data: 'cost_price',
        render: function (data) {
          return `₱ ${parseFloat(data).toFixed(2)}`;
        }
      },
      { data: 'quantity' },
      {
        data: null,
        orderable: false,
        render: function () {
          return `<button type="button" class="btn btn-danger btn-sm btn-delete">Delete</button>`;
        }
      }
    ]
  });

  $('#itemSubmit').on('click', function (e) {
    e.preventDefault();
    const formData = new FormData($('#iform')[0]);

    $.ajax({
      method: 'POST',
      url: `${url}/api/v1/items`,
      data: formData,
      processData: false,
      contentType: false,
      headers: {
        Authorization: `Bearer ${token}`
      },
      success: function (data) {
        if (data?.success) {
          $('#itemModal').modal('hide');
          table.ajax.reload(null, false);
          Swal.fire({ icon: 'success', text: 'Item created successfully!' });
        } else {
          Swal.fire({ icon: 'error', text: data?.message || 'Create failed.' });
        }
      },
      error: function (error) {
        Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Save operation failed.' });
      }
    });
  });

  $('#itable tbody').on('click', 'tr', function (e) {
    if ($(e.target).hasClass('btn-delete')) return;

    const data = table.row(this).data();
    if (!data) return;

    $('#itemModal').modal('show');
    $('#itemSubmit').hide();
    $('#itemUpdate').show().data('id', data.item_id);

    $('#desc').val(data.description);
    $('#sell').val(data.sell_price);
    $('#cost').val(data.cost_price);
    $('#qty').val(data.quantity);
  });

  $('#itemUpdate').on('click', function (e) {
    e.preventDefault();
    const id = $(this).data('id');
    const formData = new FormData($('#iform')[0]);

    $.ajax({
      method: 'PUT',
      url: `${url}/api/v1/items/${id}`,
      data: formData,
      processData: false,
      contentType: false,
      headers: {
        Authorization: `Bearer ${token}`
      },
      success: function () {
        $('#itemModal').modal('hide');
        table.ajax.reload(null, false);
        Swal.fire({ icon: 'success', text: 'Item updated successfully!' });
      },
      error: function (error) {
        Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Update failed.' });
      }
    });
  });

  $('#itable').on('click', '.btn-delete', function (e) {
    e.stopPropagation();

    const $row = $(this).closest('tr');
    const data = table.row($row).data();
    if (!data) return;

    bootbox.confirm({
      message: 'Are you sure you want to delete this item?',
      buttons: {
        confirm: { label: 'Yes', className: 'btn-success' },
        cancel: { label: 'No', className: 'btn-danger' }
      },
      callback: function (result) {
        if (!result) return;

        $.ajax({
          method: 'DELETE',
          url: `${url}/api/v1/items/${data.item_id}`,
          headers: {
            Authorization: `Bearer ${token}`
          },
          success: function () {
            table.ajax.reload(null, false);
            Swal.fire({ icon: 'success', text: 'Record deleted.' });
          },
          error: function (error) {
            Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Delete failed.' });
          }
        });
      }
    });
  });
});