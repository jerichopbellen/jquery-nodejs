$(document).ready(function () {
  const url = 'http://localhost:5000/';

  const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
  const saveCart = (cart) => localStorage.setItem('cart', JSON.stringify(cart));
  const getToken = () => sessionStorage.getItem('token');

  function renderCart() {
    const cart = getCart();
    let html = '';
    let total = 0;

    if (!cart.length) {
      html = '<p>Your cart is empty.</p>';
    } else {
      html = `<table class="table table-bordered"><thead><tr><th>Image</th><th>Description</th><th>Price</th><th>Qty</th><th>Subtotal</th><th>Remove</th></tr></thead><tbody>`;
      cart.forEach((item, idx) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        html += `<tr>
          <td><img src="${item.image}" width="60"></td>
          <td>${item.description}</td>
          <td>₱ ${item.price.toFixed(2)}</td>
          <td>${item.quantity}</td>
          <td>₱ ${subtotal.toFixed(2)}</td>
          <td><button class="btn btn-danger btn-sm remove-item" data-idx="${idx}">&times;</button></td>
        </tr>`;
      });
      html += `</tbody></table><h4>Total: ₱ ${total.toFixed(2)}</h4>`;
    }

    $('#cartTable').html(html);
  }

  $('#cartTable').on('click', '.remove-item', function () {
    const idx = $(this).data('idx');
    const cart = getCart();
    cart.splice(idx, 1);
    saveCart(cart);
    renderCart();
  });

  $("#header").load("header.html", function () {
    const cart = getCart();
    $('#itemCount').text(cart.length);
    cart.length ? $('#itemCount').show() : $('#itemCount').hide();
  });

  $('#checkoutBtn').on('click', function () {
    const token = getToken();
    const cart = getCart();

    if (!token) {
      return Swal.fire({ icon: 'warning', text: 'Please login first' }).then(() => (window.location.href = 'login.html'));
    }
    if (!cart.length) return Swal.fire({ icon: 'warning', text: 'Cart is empty' });

    $.ajax({
      type: 'POST',
      url: `${url}api/v1/create-order`,
      data: JSON.stringify({ cart }),
      dataType: 'json',
      processData: false,
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
  });

  renderCart();
});