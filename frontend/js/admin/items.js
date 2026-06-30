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
          // Fallback placeholder image configuration if no path exists in DB
          const imgSrc = data.img_path ? `${url}/${data.img_path}` : `${url}/images/default-gadget.jpg`;
          return `<img src="${imgSrc}" width="50" height="60" class="img-thumbnail" alt="product">`;
        }
      },
      { data: 'description' },
      { data: 'brand' },
      { data: 'category' },
      {
        data: 'cost_price',
        render: function (data) {
          return `₱${Number(data).toFixed(2)}`;
        }
      },
      {
        data: 'sell_price',
        render: function (data) {
          return `₱${Number(data).toFixed(2)}`;
        }
      },
      { 
        data: 'quantity',
        render: function (data) {
          const qty = Number(data || 0);
          if (qty <= 0) return `<span class="badge badge-danger">Out of Stock</span>`;
          if (qty <= 5) return `<span class="badge badge-warning">${qty} (Low Stock)</span>`;
          return `<span class="badge badge-success">${qty}</span>`;
        }
      },
      {
        data: 'specs',
        render: function (data) {
          if (!data) return `<i class="text-muted">None</i>`;
          
          // Handle cases where specs might arrive parsed as an object or as a raw JSON string
          let obj = data;
          if (typeof data === 'string') {
            try { obj = JSON.parse(data); } catch(e) { return data; }
          }
          
          // Loop through object keys to construct a clean, formatted readable badge setup
          if (typeof obj === 'object' && obj !== null) {
            let output = '';
            for (const [key, val] of Object.entries(obj)) {
              output += `<small class="d-block"><b>${key}:</b> ${val}</small>`;
            }
            return output;
          }
          return data;
        }
      },
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

$('#itemSubmit').on('click', function (e) {
  e.preventDefault();

  const formData = new FormData();
  formData.append('description', $('#desc').val());
  formData.append('brand', $('#brand').val() || 'Generic');
  formData.append('category', $('#category').val() || 'Smartphones');
  formData.append('sell_price', $('#sell').val());
  formData.append('cost_price', $('#cost').val());
  formData.append('quantity', $('#qty').val() || 0);
  formData.append('specs', $('#specs').val() || '{}');

  // Must match upload.single('image') inside your backend routing logic
  if ($('#img')[0].files.length > 0) {
    formData.append('image', $('#img')[0].files[0]);
  }

  $.ajax({
    method: 'POST',
    url: `${url}/api/v1/items`,
    data: formData,
    processData: false,
    contentType: false,
    headers: { Authorization: `Bearer ${token}` },
    success: function () {
      $('#itemModal').modal('hide');
      table.ajax.reload(null, false);
      Swal.fire({ icon: 'success', text: 'Item created successfully!' });
    },
    error: function (error) {
      Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Creation failed.' });
    }
  });
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