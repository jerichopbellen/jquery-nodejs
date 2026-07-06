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

  $('#wrapper').show();

  let currentEditId = null;

  // DataTable Definition
  const table = $('#ctable').DataTable({
    ajax: {
      url: `${url}/api/v1/categories`,
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
        text: 'Add category',
        className: 'btn btn-primary',
        action: function () {
          currentEditId = null;
          $('#cform').trigger('reset');

          // Reset validation states and clear Bootstrap layout highlight modifiers
          if (typeof $('#cform').validate === 'function') {
            $('#cform').validate().resetForm();
            $('#cform').find('input, select, textarea').removeClass('is-invalid is-valid');
          }

          $('#categoryModal .modal-title').text('Create new category');
          $('#categoryUpdate').hide();
          $('#categorySubmit').show();
          $('#categoryModal').modal('show');
        }
      }
    ],
    columns: [
      { data: 'category_id' },
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

  // jQuery Validation Configuration Module
  $("#cform").validate({
    rules: {
      // Points directly to the element's [name="name"] attribute
      name: {
        required: true,
        minlength: 2
      }
    },
    messages: {
      name: {
        required: "Please provide a structural category name.",
        minlength: "Category name must be at least 2 characters long."
      }
    },
    errorElement: "small",
    errorClass: "text-danger d-block mt-1 font-weight-bold",
    
    // Highlights form control wrappers on validation exception
    highlight: function(element) {
      $(element).addClass('is-invalid').removeClass('is-valid');
    },
    // Changes framework markers to green once parameters resolve cleanly
    unhighlight: function(element) {
      $(element).removeClass('is-invalid').addClass('is-valid');
    },

    // Automated submission capture point after all field rules clear successfully
    submitHandler: function(form) {
      const isUpdate = $('#categoryUpdate').is(':visible') && currentEditId;
      const method = isUpdate ? 'PUT' : 'POST';
      const endpoint = isUpdate
        ? `${url}/api/v1/categories/${currentEditId}`
        : `${url}/api/v1/categories`;

      const payload = { 
        name: $('#category_name').val().trim() 
      };

      $.ajax({
        method,
        url: endpoint,
        contentType: 'application/json',
        data: JSON.stringify(payload),
        headers: { Authorization: `Bearer ${token}` },
        success: function () {
          $('#categoryModal').modal('hide');
          table.ajax.reload(null, false);
          Swal.fire({ 
            icon: 'success', 
            text: isUpdate ? 'Category updated successfully!' : 'Category created successfully!' 
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

  // Row Edit Action Bindings
  $('#ctable').on('click', '.btn-edit', function () {
    const data = table.row($(this).closest('tr')).data();
    if (!data) return;

    currentEditId = data.category_id;
    $('#category_name').val(data.name);

    // Clear dynamic error states left over from prior form actions
    if (typeof $('#cform').validate === 'function') {
      $('#cform').validate().resetForm();
    }
    $('#cform').find('input, select, textarea').removeClass('is-invalid is-valid');

    $('#categoryModal .modal-title').text('Update category');
    $('#categorySubmit').hide();
    $('#categoryUpdate').show();
    $('#categoryModal').modal('show');
  });

  // Row Delete Action Bindings
  $('#ctable').on('click', '.btn-delete', function (e) {
    e.stopPropagation();
    const data = table.row($(this).closest('tr')).data();
    if (!data) return;

    bootbox.confirm({
      message: `Are you sure you want to delete category "${data.name}"?`,
      buttons: {
        confirm: { label: 'Yes', className: 'btn-success' },
        cancel: { label: 'No', className: 'btn-danger' }
      },
      callback: function (result) {
        if (!result) return;

        $.ajax({
          method: 'DELETE',
          url: `${url}/api/v1/categories/${data.category_id}`,
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

  $('#categoryUpdate').hide();
});