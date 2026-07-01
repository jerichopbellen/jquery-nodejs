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

  function loadBrands() {
    return $.ajax({
      method: 'GET',
      url: `${url}/api/v1/brands`,
      headers: { Authorization: `Bearer ${token}` },
      success: function (data) {
        const brands = Array.isArray(data) ? data : (data.rows || []);
        let options = '<option value="">Select Brand</option>';
        brands.forEach(b => {
          options += `<option value="${b.brand_id}">${b.name}</option>`;
        });
        $('#brand').html(options);
      },
      error: function (xhr) {
        console.error('Brands fetch failed:', xhr.responseText);
        $('#brand').html('<option value="">Select Brand</option>');
      }
    });
  }

  function loadCategories() {
    return $.ajax({
      method: 'GET',
      url: `${url}/api/v1/categories`,
      headers: { Authorization: `Bearer ${token}` },
      success: function (data) {
        const categories = Array.isArray(data) ? data : (data.rows || []);
        let options = '<option value="">Select Category</option>';
        categories.forEach(c => {
          options += `<option value="${c.category_id}">${c.name}</option>`;
        });
        $('#category').html(options);
      },
      error: function (xhr) {
        console.error('Categories fetch failed:', xhr.responseText);
        $('#category').html('<option value="">Select Category</option>');
      }
    });
  }

  function loadDropdowns() {
    return $.when(loadBrands(), loadCategories());
  }

  loadDropdowns();

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
          currentEditId = null;
          $('#iform').trigger('reset');
          loadDropdowns().always(() => {
            $('#itemModal .modal-title').text('Create new item');
            $('#itemUpdate').hide();
            $('#itemSubmit').show();
            $('#itemModal').modal('show');
          });
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
      { data: 'brand' },
      { data: 'category' },
      { data: 'cost_price', render: data => `₱${Number(data).toFixed(2)}` },
      { data: 'sell_price', render: data => `₱${Number(data).toFixed(2)}` },
      { data: 'quantity' },
      {
        data: 'specs',
        render: function (data) {
          if (!data) return `<i class="text-muted">None</i>`;
          let obj = data;
          if (typeof data === 'string') {
            try { obj = JSON.parse(data); } catch (e) { return data; }
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

  let currentEditId = null;

  // unified submit (Enter + Save/Update buttons)
  $('#iform').on('submit', function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('description', $('#desc').val());
    formData.append('brand_id', $('#brand').val());
    formData.append('category_id', $('#category').val());
    formData.append('sell_price', $('#sell').val());
    formData.append('cost_price', $('#cost').val());
    formData.append('quantity', $('#qty').val());
    formData.append('specs', $('#specs').val() || '{}');

    if ($('#img')[0].files.length > 0) {
      formData.append('image', $('#img')[0].files[0]);
    }

    const isUpdate = $('#itemUpdate').is(':visible') && currentEditId;
    const method = isUpdate ? 'PUT' : 'POST';
    const endpoint = isUpdate
      ? `${url}/api/v1/items/${currentEditId}`
      : `${url}/api/v1/items`;

    $.ajax({
      method,
      url: endpoint,
      data: formData,
      processData: false,
      contentType: false,
      headers: { Authorization: `Bearer ${token}` },
      success: function () {
        $('#itemModal').modal('hide');
        table.ajax.reload(null, false);
        Swal.fire({ icon: 'success', text: isUpdate ? 'Item updated successfully!' : 'Item created successfully!' });
      },
      error: function (error) {
        Swal.fire({ icon: 'error', text: error.responseJSON?.message || (isUpdate ? 'Update failed.' : 'Creation failed.') });
      }
    });
  });

  $('#itable').on('click', '.btn-edit', function () {
    const data = table.row($(this).closest('tr')).data();
    if (!data) return;

    currentEditId = data.item_id;
    $('#desc').val(data.description);
    $('#sell').val(data.sell_price);
    $('#cost').val(data.cost_price);
    $('#qty').val(data.quantity);

    loadDropdowns().always(() => {
      $('#brand').val(data.brand_id || '');
      $('#category').val(data.category_id || '');
      $('#specs').val(data.specs ? (typeof data.specs === 'object' ? JSON.stringify(data.specs) : data.specs) : '{}');

      $('#itemModal .modal-title').text('Update item');
      $('#itemSubmit').hide();
      $('#itemUpdate').show();
      $('#itemModal').modal('show');
    });
  });

  $('#itable').on('click', '.btn-delete', function (e) {
    e.stopPropagation();
    const data = table.row($(this).closest('tr')).data();
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
          error: function () {
            Swal.fire({ icon: 'error', text: 'Failed to delete record.' });
          }
        });
      }
    });
  });

  $('#itemUpdate').hide();
});