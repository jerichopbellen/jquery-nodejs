$(document).ready(function () {
  const url = 'http://localhost:5000/';

  const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
  const saveCart = (cart) => localStorage.setItem('cart', JSON.stringify(cart));

  function renderCartBadge() {
    const cart = getCart();
    if (cart.length > 0) $('#itemCount').text(cart.length).show();
    else $('#itemCount').hide();
  }

  function ensureProductModal() {
    if ($('#productDetailsModal').length) return;

    $('body').append(`
      <div class="modal fade" id="productDetailsModal" tabindex="-1" role="dialog" aria-labelledby="productDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="productDetailsModalLabel">Product Details</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body" id="productDetailsModalBody"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" id="confirmAddToCart">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    `);
  }

  renderCartBadge();

  // 1. Fetch and render items on the home page grid
  $.ajax({
    method: 'GET',
    url: `${url}api/v1/items`,
    dataType: 'json',
    success: function (res) {
      if (!res.success || !res.rows) return;

      let html = '<div class="row">';
      res.rows.forEach((item) => {
        let imageArray = [];
        try {
          // Safe JSON extraction from the stringified column field
          imageArray = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []);
        } catch (e) {
          imageArray = [];
        }

        // Pull the first entry as the primary display card thumbnail image
        const primaryImg = (imageArray && imageArray.length > 0) ? imageArray[0] : 'images/default-gadget.jpg';
        const itemImgSrc = `${url}${primaryImg}`;

        html += `
          <div class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
              <img class="card-img-top p-3" src="${itemImgSrc}" alt="${item.description}" style="height: 200px; object-fit: contain;">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title text-truncate">${item.description}</h5>
                <p class="card-text text-muted mb-1"><small>Brand: ${item.brand} | Category: ${item.category}</small></p>
                <h4 class="text-primary mt-auto">₱${Number(item.sell_price).toFixed(2)}</h4>
                <button class="btn btn-outline-primary btn-block mt-3 btn-view-details" data-id="${item.item_id}">
                  View Details
                </button>
              </div>
            </div>
          </div>
        `;
      });
      html += '</div>';
      $('#items').html(html);
    },
    error: function () {
      $('#items').html('<p class="text-danger">Failed to load products.</p>');
    }
  });

  // 2. View details click handling matching dynamic image arrays
  $(document).on('click', '.btn-view-details', function () {
    const id = $(this).data('id');

    $.ajax({
      method: 'GET',
      url: `${url}api/v1/items/${id}`,
      dataType: 'json',
      success: function (res) {
        if (!res.success || !res.data) return;
        const item = res.data;

        ensureProductModal();

        let imageArray = [];
        try {
          imageArray = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []);
        } catch (e) {
          imageArray = [];
        }

        if (imageArray.length === 0) {
          imageArray.push('images/default-gadget.jpg');
        }

        // Build out slide items inside a clean interactive responsive carousel
        let carouselIndicators = '';
        let carouselItems = '';

        imageArray.forEach((img, index) => {
          const isActive = index === 0 ? 'active' : '';
          carouselIndicators += `
            <li data-target="#itemImagesCarousel" data-slide-to="${index}" class="${isActive}"></li>
          `;
          carouselItems += `
            <div class="carousel-item ${isActive}">
              <img class="d-block w-100" src="${url}${img}" alt="Slide ${index}" style="height: 350px; object-fit: contain;">
            </div>
          `;
        });

        // Parse structured data specifications loop block mappings
        let specsHtml = '';
        let specsObj = item.specs;
        if (typeof specsObj === 'string') {
          try { specsObj = JSON.parse(specsObj); } catch (e) { specsObj = null; }
        }

        if (specsObj && typeof specsObj === 'object' && Object.keys(specsObj).length > 0) {
          specsHtml += '<h6 class="mt-3">Specifications:</h6><ul>';
          for (const [key, value] of Object.entries(specsObj)) {
            specsHtml += `<li><strong>${key}:</strong> ${value}</li>`;
          }
          specsHtml += '</ul>';
        }

        const stock = item.quantity;

        $('#productDetailsModalLabel').text(item.description);
        $('#productDetailsModalBody').html(`
          <input type="hidden" id="detailsItemId" value="${item.item_id}">
          <input type="hidden" id="detailsItemPrice" value="${item.sell_price}">
          
          <div class="row">
            <div class="col-md-6">
              <div id="itemImagesCarousel" class="carousel slide border rounded bg-light" data-ride="carousel">
                <ol class="carousel-indicators">
                  ${carouselIndicators}
                </ol>
                <div class="carousel-inner">
                  ${carouselItems}
                </div>
                ${imageArray.length > 1 ? `
                  <a class="carousel-control-prev" href="#itemImagesCarousel" role="button" data-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true" style="filter: invert(100%);"></span>
                    <span class="sr-only">Previous</span>
                  </a>
                  <a class="carousel-control-next" href="#itemImagesCarousel" role="button" data-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true" style="filter: invert(100%);"></span>
                    <span class="sr-only">Next</span>
                  </a>
                ` : ''}
              </div>
            </div>
            <div class="col-md-6">
              <p class="text-muted mb-1">Brand: <strong>${item.brand}</strong></p>
              <p class="text-muted mb-3">Category: <strong>${item.category}</strong></p>
              <h3 class="text-primary mb-3">₱${Number(item.sell_price).toFixed(2)}</h3>
              <p>Available Stock: <span id="modalStockDisplay" class="font-weight-bold">${stock}</span></p>
              ${specsHtml}
              
              <div class="form-group mt-4" ${stock <= 0 ? 'style="display:none;"' : ''}>
                <label for="detailsQty">Quantity:</label>
                <input type="number" id="detailsQty" class="form-control" value="1" min="1" max="${stock}">
              </div>
              ${stock <= 0 ? '<div class="alert alert-danger p-2 text-center font-weight-bold mt-4">Out of Stock</div>' : ''}
            </div>
          </div>
        `);

        // Hide or enable checkout buttons depending on real-time count structures
        if (stock <= 0) $('#confirmAddToCart').hide();
        else $('#confirmAddToCart').show();

        $('#productDetailsModal').modal('show');
      },
      error: function () {
        Swal.fire({ icon: 'error', text: 'Could not fetch item specifications.' });
      }
    });
  });

  // 3. Confirm add item to cart layout processing logic updates
  $(document).on('click', '#confirmAddToCart', function () {
    const qty = parseInt($('#detailsQty').val() || '0', 10);
    const stock = parseInt($('#modalStockDisplay').text() || '0', 10);

    if (!qty || qty < 1) return Swal.fire({ icon: 'warning', text: 'Enter valid quantity.' });
    if (qty > stock) return Swal.fire({ icon: 'error', text: 'Quantity exceeds stock.' });

    const id = parseInt($('#detailsItemId').val(), 10);
    const description = $('#productDetailsModalLabel').text();
    const price = parseFloat($('#detailsItemPrice').val() || '0');
    
    // Fallback cleanly to the active slide's image path for shopping cart listing reference entries
    const image = $('#productDetailsModalBody .carousel-item.active img').attr('src') || '';

    const cart = getCart();
    const existing = cart.find((x) => x.item_id === id);

    if (existing) {
      if (existing.quantity + qty > stock) {
        return Swal.fire({ icon: 'error', text: 'Total cart quantity exceeds stock.' });
      }
      existing.quantity += qty;
    } else {
      cart.push({ item_id: id, description, price, image, quantity: qty });
    }

    saveCart(cart);
    renderCartBadge();
    $('#productDetailsModal').modal('hide');
    Swal.fire({ icon: 'success', text: 'Item added to cart!', timer: 1000, showConfirmButton: false });
  });
});