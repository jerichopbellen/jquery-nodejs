$(document).ready(function () {
  const url = 'http://localhost:5000';
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  let currentEditId = null;
  let serverImages = [];       // Tracks current images from the DB column
  let imagesToDelete = [];     // Tracks image paths marked for removal

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

  // DataTable Definition
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
          serverImages = [];
          imagesToDelete = [];
          $('#iform').trigger('reset');
          renderImagePreviews(); // Resets layout
          
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
        orderable: false,
        searchable: false,
        render: function (data) {
          let imageArray = [];
          try {
            imageArray = typeof data.images === 'string' ? JSON.parse(data.images) : (data.images || []);
          } catch (e) {
            imageArray = [];
          }
          
          if (!imageArray || imageArray.length === 0) {
            return `<img src="${url}/images/default-gadget.jpg" width="150px" height="150px" class="img-thumbnail" alt="default">`;
          }

          const carouselId = `carousel-item-${data.item_id}`;
          let slides = '';

          imageArray.forEach((img, idx) => {
            slides += `
              <div class="carousel-item ${idx === 0 ? 'active' : ''}">
                <img src="${url}/${img}" style="width:150px; height:150px; object-fit:cover;" class="d-block mx-auto rounded img-thumbnail" alt="product">
              </div>`;
          });

          return `
            <div id="${carouselId}" class="carousel slide" data-ride="carousel" data-interval="3000" style="width:150px; margin:0 auto;">
              <div class="carousel-inner">
                ${slides}
              </div>
              ${imageArray.length > 1 ? `
              <a class="carousel-control-prev" href="#${carouselId}" role="button" data-slide="prev" style="filter: invert(100%); width:12%;">
                <span class="carousel-control-prev-icon" aria-hidden="true" style="width:14px; height:14px;"></span>
              </a>
              <a class="carousel-control-next" href="#${carouselId}" role="button" data-slide="next" style="filter: invert(100%); width:12%;">
                <span class="carousel-control-next-icon" aria-hidden="true" style="width:14px; height:14px;"></span>
              </a>` : ''}
            </div>`;
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

  // Master UI Rendering Engine for Active Previews and Management Gallery
  function renderImagePreviews() {
    const container = $('#imagePreviewContainer');
    container.empty();

    let displayCount = 0;

    // 1. Render Current Images loaded from DB (excluding deleted ones)
    serverImages.forEach((imgSrc) => {
      if (!imagesToDelete.includes(imgSrc)) {
        displayCount++;
        const element = `
          <div class="position-relative m-1 border rounded bg-white p-1 text-center server-img-item" data-src="${imgSrc}" style="width: 95px;">
            <img src="${url}/${imgSrc}" style="width:85px; height:85px; object-fit:cover;" class="rounded" />
            <button type="button" class="btn btn-danger btn-xs position-absolute btn-remove-server" 
                    style="top:2px; right:2px; padding:1px 5px; font-size:10px; line-height:1.2; border-radius:3px;" title="Remove this image">
              <i class="fa fa-times"></i>
            </button>
            <small class="d-block text-muted text-truncate mt-1" style="font-size:10px;">Active</small>
          </div>`;
        container.append(element);
      }
    });

    // 2. Render Live Previews of Newly Uploaded Local Files
    const fileInput = $('#img')[0];
    if (fileInput && fileInput.files.length > 0) {
      Array.from(fileInput.files).forEach((file) => {
        displayCount++;
        const reader = new FileReader();
        reader.onload = function (e) {
          const element = `
            <div class="position-relative m-1 border rounded bg-white p-1 text-center" style="width: 95px; border-style: dashed !important; border-color: #28a745 !important;">
              <img src="${e.target.result}" style="width:85px; height:85px; object-fit:cover;" class="rounded" />
              <small class="d-block text-success text-truncate mt-1" style="font-size:10px; font-weight:bold;">New Preview</small>
            </div>`;
          container.append(element);
        };
        reader.readAsDataURL(file);
      });
    }

    // Fallback indicator placeholder text if container is blank
    setTimeout(() => {
      if (displayCount === 0) {
        container.html('<p class="text-muted m-2 gallery-placeholder">No images chosen</p>');
      }
    }, 40);
  }

  // Bind input element file actions to render engine
  $('#img').on('change', function () {
    renderImagePreviews();
  });

  // Interactive UI action to flag server image for removal
  $('#imagePreviewContainer').on('click', '.btn-remove-server', function () {
    const parentWrapper = $(this).closest('.server-img-item');
    const targetPath = parentWrapper.data('src');
    imagesToDelete.push(targetPath); // Push path to tracking container
    renderImagePreviews();          // Re-render UI
  });

  // Combined Form submit handler
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

    // Send down the array of image paths to clear out of the database column string
    if (imagesToDelete.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
    }

    // Append newly staged files
    const fileInput = $('#img')[0];
    if (fileInput && fileInput.files.length > 0) {
      for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('images', fileInput.files[i]);
      }
    }

    const isUpdate = $('#itemUpdate').is(':visible') && currentEditId;
    const method = isUpdate ? 'PUT' : 'POST';
    const endpoint = isUpdate ? `${url}/api/v1/items/${currentEditId}` : `${url}/api/v1/items`;

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

  // Row Edit Command Actions
  $('#itable').on('click', '.btn-edit', function () {
    const data = table.row($(this).closest('tr')).data();
    if (!data) return;

    currentEditId = data.item_id;
    imagesToDelete = []; // Reset tracked elements for deletion

    // Safely parse row image values from single database column string
    try {
      serverImages = typeof data.images === 'string' ? JSON.parse(data.images) : (data.images || []);
    } catch (e) {
      serverImages = [];
    }

    $('#desc').val(data.description);
    $('#sell').val(data.sell_price);
    $('#cost').val(data.cost_price);
    $('#qty').val(data.quantity);
    $('#img').val(''); // Empty file input elements

    loadDropdowns().always(() => {
      $('#brand').val(data.brand_id || '');
      $('#category').val(data.category_id || '');
      $('#specs').val(data.specs ? (typeof data.specs === 'object' ? JSON.stringify(data.specs) : data.specs) : '{}');

      renderImagePreviews(); // Initialize items view layout context

      $('#itemModal .modal-title').text('Update item');
      $('#itemSubmit').hide();
      $('#itemUpdate').show();
      $('#itemModal').modal('show');
    });
  });

  // Row Delete Command Actions
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