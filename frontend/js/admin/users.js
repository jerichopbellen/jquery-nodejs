$(document).ready(function () {
  const url = 'http://localhost:5000/';
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

  // Expected in users.html:
  // table#usersTable
  // modal#usersModal
  // form#usersForm
  // inputs: #userName #userEmail #userRole #userActive
  // buttons: #userCreateBtn #userUpdateBtn

  const table = $('#usersTable').DataTable({
    ajax: {
      url: `${url}api/v1/users`,
      dataSrc: 'rows',
      headers: { Authorization: `Bearer ${token}` }
    },
    columns: [
      { data: 'user_id' },
      { data: 'name' },
      { data: 'email' },
      { data: 'role' },
      {
        data: 'is_active',
        render: function (v) {
          return v
            ? '<span class="badge badge-success">Active</span>'
            : '<span class="badge badge-secondary">Inactive</span>';
        }
      },
      {
        data: null,
        orderable: false,
        render: function (row) {
          return `
            <button class="btn btn-sm btn-primary btn-edit-user" data-id="${row.user_id}">Edit</button>
            <button class="btn btn-sm btn-warning btn-toggle-user" data-id="${row.user_id}" data-active="${row.is_active}">
              ${row.is_active ? 'Deactivate' : 'Activate'}
            </button>
          `;
        }
      }
    ]
  });

  $('#userCreateBtn').on('click', function () {
    $('#usersForm').trigger('reset');
    $('#userUpdateBtn').hide().data('id', '');
    $('#usersModal').modal('show');
  });

  $('#usersTable').on('click', '.btn-edit-user', function () {
    const id = Number($(this).data('id'));
    const row = table.rows().data().toArray().find(u => Number(u.user_id) === id);
    if (!row) return;

    $('#userName').val(row.name || '');
    $('#userEmail').val(row.email || '');
    $('#userRole').val(row.role || 'customer');
    $('#userActive').prop('checked', !!row.is_active);

    $('#userUpdateBtn').show().data('id', id);
    $('#usersModal').modal('show');
  });

  $('#userUpdateBtn').on('click', function (e) {
    e.preventDefault();
    const id = $(this).data('id');
    if (!id) return;

    const payload = {
      name: $('#userName').val().trim(),
      email: $('#userEmail').val().trim(),
      role: $('#userRole').val(),
      is_active: $('#userActive').is(':checked')
    };

    $.ajax({
      method: 'PUT',
      url: `${url}api/v1/users/${id}`,
      data: JSON.stringify(payload),
      processData: false,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: { Authorization: `Bearer ${token}` },
      success: function () {
        $('#usersModal').modal('hide');
        table.ajax.reload(null, false);
        Swal.fire({ icon: 'success', text: 'User updated successfully.' });
      },
      error: function (error) {
        Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Update user failed.' });
      }
    });
  });

  $('#usersTable').on('click', '.btn-toggle-user', function () {
    const id = Number($(this).data('id'));
    const isActive = String($(this).data('active')) === 'true';

    $.ajax({
      method: 'PATCH',
      url: `${url}api/v1/users/${id}/status`,
      data: JSON.stringify({ is_active: !isActive }),
      processData: false,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: { Authorization: `Bearer ${token}` },
      success: function () {
        table.ajax.reload(null, false);
        Swal.fire({
          icon: 'success',
          text: isActive ? 'User deactivated.' : 'User activated.'
        });
      },
      error: function (error) {
        Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Status update failed.' });
      }
    });
  });
});