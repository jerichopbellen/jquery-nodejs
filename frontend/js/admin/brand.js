$(document).ready(function () {
  const url = 'http://localhost:5000';
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

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

  let currentEditId = null;

  const table = $('#btable').DataTable({
    ajax: {
      url: `${url}/api/v1/brands`,
      dataSrc: function (data) {
        return Array.isArray(data) ? data : (data.rows || []);
      },
      headers: { Authorization: `Bearer ${token}` }
    },
    dom: 'Bfrtip',
    buttons: [
      'pdf',
      'excel',
      {
        text: 'Add brand',
        className: 'btn btn-primary',
        action: function () {
          currentEditId = null;
          $('#bform').trigger('reset');
          $('#brandModal .modal-title').text('Create new brand');
          $('#brandUpdate').hide();
          $('#brandSubmit').show();
          $('#brandModal').modal('show');
        }
      }
    ],
    columns: [
      { data: 'brand_id' },
      { data: 'name' },
      {
        data: null,
        orderable: false,
        searchable: false,
        render: function () {
          return `
            <button class="btn btn-warning btn-sm btn-edit"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-sm btn-delete"><i class="fas fa-trash"></i></button>
          `;
        }
      }
    ]
  });

  $('#brandSubmit').on('click', function (e) {
    e.preventDefault();

    const payload = {
      name: $('#name').val().trim()
    };

    if (!payload.name) {
      Swal.fire({ icon: 'warning', text: 'Brand name is required.' });
      return;
    }

    $.ajax({
      method: 'POST',
      url: `${url}/api/v1/brands`,
      contentType: 'application/json',
      data: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
      success: function () {
        $('#brandModal').modal('hide');
        table.ajax.reload(null, false);
        Swal.fire({ icon: 'success', text: 'Brand created successfully!' });
      },
      error: function (error) {
        Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Creation failed.' });
      }
    });
  });

  $('#btable').on('click', '.btn-edit', function () {
    const $row = $(this).closest('tr');
    const data = table.row($row).data();
    if (!data) return;

    currentEditId = data.brand_id;
    $('#name').val(data.name);

    $('#brandModal .modal-title').text('Update brand');
    $('#brandSubmit').hide();
    $('#brandUpdate').show();
    $('#brandModal').modal('show');
  });

  $('#brandUpdate').on('click', function (e) {
    e.preventDefault();
    if (!currentEditId) return;

    const payload = {
      name: $('#name').val().trim()
    };

    if (!payload.name) {
      Swal.fire({ icon: 'warning', text: 'Brand name is required.' });
      return;
    }

    $.ajax({
      method: 'PUT',
      url: `${url}/api/v1/brands/${currentEditId}`,
      contentType: 'application/json',
      data: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
      success: function () {
        $('#brandModal').modal('hide');
        table.ajax.reload(null, false);
        Swal.fire({ icon: 'success', text: 'Brand updated successfully!' });
      },
      error: function (error) {
        Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Update failed.' });
      }
    });
  });

  $('#btable').on('click', '.btn-delete', function (e) {
    e.stopPropagation();
    const $row = $(this).closest('tr');
    const data = table.row($row).data();
    if (!data) return;

    bootbox.confirm({
      message: `Are you sure you want to delete brand "${data.name}"?`,
      buttons: {
        confirm: { label: 'Yes', className: 'btn-success' },
        cancel: { label: 'No', className: 'btn-danger' }
      },
      callback: function (result) {
        if (!result) return;

        $.ajax({
          method: 'DELETE',
          url: `${url}/api/v1/brands/${data.brand_id}`,
          headers: { Authorization: `Bearer ${token}` },
          success: function () {
            table.ajax.reload(null, false);
            Swal.fire({ icon: 'success', text: 'Record deleted.' });
          },
          error: function (error) {
            Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Failed to delete record.' });
          }
        });
      }
    });
  });

  $('#brandUpdate').hide();
});