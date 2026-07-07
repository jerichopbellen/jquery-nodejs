$(document).ready(function () {
  const url = 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

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

  $('#wrapper').show();

  let currentEditId = null;

  // DataTable Definition
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

          // Reset validation errors and remove dynamic Bootstrap classes
          if (typeof $('#bform').validate === 'function') {
            $('#bform').validate().resetForm();
            $('#bform').find('input').removeClass('is-invalid is-valid');
          }

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

  // jQuery Validation Module Configured for Bootstrap 4
  $("#bform").validate({
    rules: {
      name: {
        required: true,
        minlength: 2
      }
    },
    messages: {
      name: {
        required: "Please enter a brand name.",
        minlength: "Brand name must be at least 2 characters long."
      }
    },
    errorElement: "small",
    errorClass: "text-danger d-block mt-1 font-weight-bold",
    
    // Highlight input fields on validation failure
    highlight: function(element) {
      $(element).addClass('is-invalid').removeClass('is-valid');
    },
    // Clear highlight states once valid data is entered
    unhighlight: function(element) {
      $(element).removeClass('is-invalid').addClass('is-valid');
    },

    // submitHandler takes control automatically when form is completely valid
    submitHandler: function(form) {
      const isUpdate = $('#brandUpdate').is(':visible') && currentEditId;
      const method = isUpdate ? 'PUT' : 'POST';
      const endpoint = isUpdate ? `${url}/api/v1/brands/${currentEditId}` : `${url}/api/v1/brands`;

      const payload = {
        name: $('#name').val().trim()
      };

      $.ajax({
        method: method,
        url: endpoint,
        contentType: 'application/json',
        data: JSON.stringify(payload),
        headers: { Authorization: `Bearer ${token}` },
        success: function () {
          $('#brandModal').modal('hide');
          table.ajax.reload(null, false);
          Swal.fire({ 
            icon: 'success', 
            text: isUpdate ? 'Brand updated successfully!' : 'Brand created successfully!' 
          });
        },
        error: function (error) {
          Swal.fire({ 
            icon: 'error', 
            text: error.responseJSON?.message || (isUpdate ? 'Update failed.' : 'Creation failed.') 
          });
        }
      });
    }
  });

  // Row Edit Trigger Actions
  $('#btable').on('click', '.btn-edit', function () {
    const $row = $(this).closest('tr');
    const data = table.row($row).data();
    if (!data) return;

    currentEditId = data.brand_id;
    $('#name').val(data.name);

    // Clear structural validation flags left behind from previous actions
    if (typeof $('#bform').validate === 'function') {
      $('#bform').validate().resetForm();
    }
    $('#bform').find('input').removeClass('is-invalid is-valid');

    $('#brandModal .modal-title').text('Update brand');
    $('#brandSubmit').hide();
    $('#brandUpdate').show();
    $('#brandModal').modal('show');
  });

  // Row Delete Actions
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