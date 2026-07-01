$(document).ready(function () {
  const url = 'http://localhost:5000';
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  // Simple admin guard
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

  // --- NEW: POPULATE LOOKUP DROPDOWNS ---
  function loadDropdowns() {
    // Load Brands
    $.ajax({
      method: 'GET',
      url: `${url}/api/v1/brands`, // Ensure this endpoint exists in your router
      headers: { Authorization: `Bearer ${token}` },
      success: function (data) {
        let options = '<option value="">Select Brand</option>';
        data.rows.forEach(b => {
          options += `<option value="${b.brand_id}">${b.name}</option>`;
        });
        $('#brand').html(options);
      }
    });

    // Load Categories
    $.ajax({
      method: 'GET',
      url: `${url}/api/v1/categories`, // Ensure this endpoint exists in your router
      headers: { Authorization: `Bearer ${token}` },
      success: function (data) {
        let options = '<option value="">Select Category</option>';
        data.rows.forEach(c => {
          options += `<option value="${c.category_id}">${c.name}</option>`;
        });
        $('#category').html(options);
      }
    });
  }

  // Call immediately on load
  loadDropdowns();

  // DataTables Initialization
  const table = $('#itable').DataTable({
    ajax: {
      url: `${url}/api/v1/items`,
      dataSrc: 'rows',
      headers: { Authorization: `Bearer ${token}` }
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
          const imgSrc = data.img_path ? `${url}/${data.img_path}` : `${url}/images/default-gadget.jpg`;
          return `<img src="${imgSrc}" width="50" height="60" class="img-thumbnail" alt="product">`;
        }
      },
      { data: 'description' },
      { data: 'brand' },    // Remains flat because backend formats plain property row mappings!
      { data: 'category' }, // Remains flat because backend formats plain property row mappings!
      {
        data: 'cost_price',
        render: function (data) { return `₱${Number(data).toFixed(2)}`; }
      },
      {
        data: 'sell_price',
        render: function (data) { return `₱${Number(data).toFixed(2)}`; }
      },
      { data: 'quantity' },
      {
        data: 'specs',
        render: function (data) {
          if (!data) return `<i class="text-muted">None</i>`;
          let obj = data;
          if (typeof data === 'string') {
            try { obj = JSON.parse(data); } catch(e) { return data; }
          }
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

  // --- CREATE ITEM ACTION ---
  $('#itemSubmit').on('click', function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('description', $('#desc').val());
    formData.append('brand_id', $('#brand').val());       // Correct key expected by backend
    formData.append('category_id', $('#category').val()); // Correct key expected by backend
    formData.append('sell_price', $('#sell').val());
    formData.append('cost_price', $('#cost').val());
    formData.append('quantity', $('#qty').val());
    formData.append('specs', $('#specs').val() || '{}');

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

  // --- EDIT ITEM MODAL BINDING ---
  let currentEditId = null;

  $('#itable').on('click', '.btn-edit', function () {
    const $row = $(this).closest('tr');
    const data = table.row($row).data();
    if (!data) return;

    currentEditId = data.item_id;

    $('#desc').val(data.description);
    $('#sell').val(data.sell_price);
    $('#cost').val(data.cost_price);
    $('#qty').val(data.quantity);
    
    // Bind to the corresponding primary key IDs stored on the object row
    $('#brand').val(data.brand_id || '');
    $('#category').val(data.category_id || '');

    // Format string format fallback for specs textarea view formatting
    if (data.specs) {
      $('#specs').val(typeof data.specs === 'object' ? JSON.stringify(data.specs) : data.specs);
    } else {
      $('#specs').val('{}');
    }

    $('#itemSubmit').hide();
    $('#itemUpdate').show();
    $('#itemModal').modal('show');
  });

  // --- UPDATE ITEM ACTION ---
  $('#itemUpdate').on('click', function (e) {
    e.preventDefault();
    if (!currentEditId) return;

    const formData = new FormData();
    formData.append('description', $('#desc').val());
    formData.append('brand_id', $('#brand').val());       // Correct key expected by backend
    formData.append('category_id', $('#category').val()); // Correct key expected by backend
    formData.append('sell_price', $('#sell').val());
    formData.append('cost_price', $('#cost').val());
    formData.append('quantity', $('#qty').val());
    formData.append('specs', $('#specs').val() || '{}');

    if ($('#img')[0].files.length > 0) {
      formData.append('image', $('#img')[0].files[0]);
    }

    $.ajax({
      method: 'PUT',
      url: `${url}/api/v1/items/${currentEditId}`,
      data: formData,
      processData: false,
      contentType: false,
      headers: { Authorization: `Bearer ${token}` },
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

  // --- DELETE ACTION ---
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
          headers: { Authorization: `Bearer ${token}` },
          success: function () {
            table.ajax.reload(null, false);
            Swal.fire({ icon: 'success', text: 'Record deleted.' });
          },
          error: function (error) {
            Swal.fire({ icon: 'error', text: 'Failed to delete record.' });
          }
        });
      }
    });
  });
});