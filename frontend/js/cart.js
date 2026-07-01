$(document).ready(function () {
  const url = 'http://localhost:5000/';

  const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
  const saveCart = (cart) => localStorage.setItem('cart', JSON.stringify(cart));
  const getToken = () => sessionStorage.getItem('token') || '';

  function renderCartBadge() {
    const cart = getCart();
    $('#itemCount').text(cart.length);
    cart.length ? $('#itemCount').show() : $('#itemCount').hide();
  }

  function renderCart() {
    const cart = getCart();
    let html = '';
    let total = 0;

    if (!cart.length) {
      html = '<p>Your cart is empty.</p>';
    } else {
      html += `
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Image</th>
              <th>Description</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Subtotal</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
      `;

      cart.forEach((item, idx) => {
        const subtotal = Number(item.price) * Number(item.quantity);
        total += subtotal;
        
        const fallbackAsset = `${url}images/default-gadget.jpg`; 
        let imagePath = fallbackAsset;

        if (item.image && item.image.trim() !== '' && item.image !== 'null') {
          if (item.image.includes('default-gadget')) {
            imagePath = fallbackAsset;
          } else {
            imagePath = item.image;
          }
        }  
              
        html += `
          <tr>
            <td><img src="${imagePath}" width="60" alt="${item.description}"></td>
            <td>${item.description}</td>
            <td>₱ ${Number(item.price).toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>₱ ${subtotal.toFixed(2)}</td>
            <td><button class="btn btn-danger btn-sm remove-item" data-idx="${idx}">&times;</button></td>
          </tr>
        `;
      });

      html += `</tbody></table><h4>Total: ₱ ${total.toFixed(2)}</h4>`;
    }

    $('#cartTable').html(html);
    renderCartBadge();
  }

  $('#cartTable').on('click', '.remove-item', function () {
    const idx = Number($(this).data('idx'));
    const cart = getCart();
    cart.splice(idx, 1);
    saveCart(cart);
    renderCart();
  });

  $('#checkoutBtn').on('click', function () {
    const token = getToken();
    const cart = getCart();

    if (!token) {
      return Swal.fire({ icon: 'warning', text: 'Please login first' }).then(() => {
        window.location.href = 'login.html';
      });
    }

    if (!cart.length) {
      return Swal.fire({ icon: 'warning', text: 'Cart is empty' });
    }

    Swal.fire({
      title: 'Shipping Address',
      input: 'text',
      inputPlaceholder: 'Enter your delivery address...',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You must provide a shipping address!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const shipping_address = result.value;

        $.ajax({
          type: 'POST',
          url: `${url}api/v1/create-order`,
          data: JSON.stringify({ cart, shipping_address }),
          dataType: 'json',
          contentType: 'application/json; charset=utf-8',
          headers: { Authorization: `Bearer ${token}` },
          success: function (data) {
            Swal.fire({ icon: 'success', text: data.message || 'Checkout success' });
            localStorage.removeItem('cart');
            renderCart();
          },
          error: function (error) {
            Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Checkout failed' });
          }
        });
      }
    });
  });

  renderCart();
});