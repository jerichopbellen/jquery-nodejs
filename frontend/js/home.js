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

  function loadItems() {
    $.ajax({
      method: 'GET',
      url: `${url}api/v1/items`,
      dataType: 'json',
      success: function (data) {
        $('#items').empty();
        let row;
        const rows = data?.rows || [];

        $.each(rows, function (key, value) {
          if (key % 4 === 0) {
            row = $('<div class="row"></div>');
            $('#items').append(row);
          }

          const stock = value.quantity ?? 0;
          const price = parseFloat(value.sell_price || 0).toFixed(2);
          const image = value.img_path ? `${url}${value.img_path}` : `${url}images/default-gadget.jpg`;

          row.append(`
            <div class="col-md-3 mb-4">
              <div class="card h-100 shadow-sm">
                <img src="${image}" class="card-img-top" alt="${value.description}" style="height:200px;object-fit:contain;padding:10px;">
                <div class="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h5 class="card-title text-truncate">${value.description}</h5>
                    <p class="card-text text-primary font-weight-bold">₱ ${price}</p>
                  </div>
                  <div>
                    <p class="card-text"><small class="text-muted">Stock available: ${stock}</small></p>
                    <button
                      class="btn btn-block btn-outline-primary show-details"
                      data-id="${value.item_id}"
                      data-description="${value.description}"
                      data-price="${value.sell_price}"
                      data-image="${image}"
                      data-stock="${stock}"
                    >
                      View Options
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `);
        });
      },
      error: function () {
        Swal.fire({ icon: 'error', text: 'Failed to load items.' });
      }
    });
  }

  $('#items').on('click', '.show-details', function () {
    const id = parseInt($(this).data('id'), 10);
    const description = $(this).data('description');
    const price = parseFloat($(this).data('price') || 0);
    const image = $(this).data('image');
    const stock = parseInt($(this).data('stock') || 0, 10);

    $('#productDetailsModalLabel').text(description);
    $('#productDetailsModalBody').html(`
      <div class="text-center mb-3">
        <img src="${image}" class="img-fluid" style="max-height:250px;object-fit:contain;">
      </div>
      <h4>Price: <span class="text-success">₱ ${price.toFixed(2)}</span></h4>
      <p class="text-muted">Available Stock: <strong id="modalStockDisplay">${stock}</strong></p>
      <input type="hidden" id="detailsItemId" value="${id}">
      <input type="hidden" id="detailsItemPrice" value="${price}">
      <div class="form-group row mt-3">
        <label for="detailsQty" class="col-sm-4 col-form-label font-weight-bold">Quantity:</label>
        <div class="col-sm-8">
          <input type="number" id="detailsQty" class="form-control" value="1" min="1" max="${stock}" ${stock <= 0 ? 'disabled' : ''}>
        </div>
      </div>
      ${stock <= 0 ? '<small class="text-danger">Out of stock</small>' : ''}
    `);

    $('#productDetailsModal').modal('show');
  });

  $(document).on('click', '#confirmAddToCart', function () {
    const qty = parseInt($('#detailsQty').val() || '0', 10);
    const stock = parseInt($('#modalStockDisplay').text() || '0', 10);

    if (!qty || qty < 1) return Swal.fire({ icon: 'warning', text: 'Enter valid quantity.' });
    if (qty > stock) return Swal.fire({ icon: 'error', text: 'Quantity exceeds stock.' });

    const id = parseInt($('#detailsItemId').val(), 10);
    const description = $('#productDetailsModalLabel').text();
    const price = parseFloat($('#detailsItemPrice').val() || '0');
    const image = $('#productDetailsModalBody img').attr('src') || '';

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
    Swal.fire({ icon: 'success', text: 'Item added to cart!', timer: 900, showConfirmButton: false });
  });

  ensureProductModal();
  loadItems();
  renderCartBadge();
});