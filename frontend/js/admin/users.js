$(document).ready(function () {
  const url = 'http://localhost:5000/';
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  // Admin guard
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

  // users table
  const table = $('#usersTable').DataTable({
    ajax: {
      url: `${url}api/v1/users`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      dataSrc: function (json) {
        // supports either array or { rows: [...] }
        if (Array.isArray(json)) return json;
        return json?.rows || [];
      },
      error: function (xhr) {
        console.error('Users fetch error:', xhr.status, xhr.responseText);
        Swal.fire({
          icon: 'error',
          text: xhr.responseJSON?.message || 'Failed to load users table.'
        });
      }
    },
    dom: 'Bfrtip',
    buttons: ['pdf', 'excel'],
    columns: [
      { data: 'user_id' },
      { data: 'name' },
      { data: 'email' },
      { data: 'role' },
      {
        data: 'is_active',
        render: function (v) {
          return Number(v) === 1
            ? '<span class="badge badge-success">Active</span>'
            : '<span class="badge badge-secondary">Inactive</span>';
        }
      },
      {
        data: null,
        orderable: false,
        searchable: false,
        render: function (row) {
          const active = Number(row.is_active) === 1;
          return `
            <button class="btn btn-sm btn-primary btn-edit-user" data-id="${row.user_id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm ${active ? 'btn-warning' : 'btn-success'} btn-toggle-user"
                    data-id="${row.user_id}"
                    data-active="${active}">
              ${active ? 'Deactivate' : 'Activate'}
            </button>
          `;
        }
      }
    ]
  });

  // open edit modal
  $('#usersTable').on('click', '.btn-edit-user', function () {
    const id = Number($(this).data('id'));
    const row = table.rows().data().toArray().find(u => Number(u.user_id) === id);
    if (!row) return;

    $('#userName').val(row.name || '');
    $('#userEmail').val(row.email || '');
    $('#userRole').val(row.role || 'customer');
    $('#userActive').prop('checked', Number(row.is_active) === 1);

    $('#userUpdateBtn').data('id', id);
    $('#usersModal').modal('show');
  });

  // update user (role + basic profile + active flag)
  $('#userUpdateBtn').on('click', function (e) {
    e.preventDefault();

    const id = $(this).data('id');
    if (!id) {
      Swal.fire({ icon: 'warning', text: 'No user selected.' });
      return;
    }

    const payload = {
      name: $('#userName').val().trim(),
      email: $('#userEmail').val().trim(),
      role: $('#userRole').val(),
      is_active: $('#userActive').is(':checked')
    };

    if (!payload.name || !payload.email || !payload.role) {
      Swal.fire({ icon: 'warning', text: 'Name, email, and role are required.' });
      return;
    }

    $.ajax({
      method: 'PUT',
      url: `${url}api/v1/users/${id}`,
      headers: { Authorization: `Bearer ${token}` },
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify(payload),
      success: function (res) {
        $('#usersModal').modal('hide');
        table.ajax.reload(null, false);
        Swal.fire({ icon: 'success', text: res?.message || 'User updated successfully.' });
      },
      error: function (xhr) {
        Swal.fire({ icon: 'error', text: xhr.responseJSON?.message || 'Update user failed.' });
      }
    });
  });

  // activate/deactivate
  $('#usersTable').on('click', '.btn-toggle-user', function () {
    const id = Number($(this).data('id'));
    const isActive = String($(this).data('active')) === 'true';
    const nextState = !isActive;

    bootbox.confirm({
      message: `Are you sure you want to ${nextState ? 'activate' : 'deactivate'} this user?`,
      buttons: {
        confirm: { label: 'Yes', className: 'btn-success' },
        cancel: { label: 'No', className: 'btn-danger' }
      },
      callback: function (result) {
        if (!result) return;

        $.ajax({
          method: 'PATCH',
          url: `${url}api/v1/users/${id}/status`,
          headers: { Authorization: `Bearer ${token}` },
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          data: JSON.stringify({ is_active: nextState }),
          success: function (res) {
            table.ajax.reload(null, false);
            Swal.fire({
              icon: 'success',
              text: res?.message || (nextState ? 'User activated.' : 'User deactivated.')
            });
          },
          error: function (xhr) {
            Swal.fire({ icon: 'error', text: xhr.responseJSON?.message || 'Status update failed.' });
          }
        });
      }
    });
  });
});