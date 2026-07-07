$(document).ready(function () {
  const url = 'http://localhost:5000/';

  const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
  const saveCart = (cart) => localStorage.setItem('cart', JSON.stringify(cart));
  const getToken = () => localStorage.getItem('token') || '';

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

  // Helper function to handle checkout dialog with conditional toggle view
  function handleCheckout(defaultAddress, token, cart) {
    let htmlContent = '';

    if (defaultAddress) {
      htmlContent = `
        <div id="addressContainer" style="text-align: left; font-family: inherit; margin-top: 10px;">
          <!-- Default Address Section -->
          <div id="defaultAddressSection" style="margin-bottom: 10px;">
            <p style="margin-bottom: 8px; font-weight: bold; color: #333; font-size: 15px;">Default Shipping Address:</p>
            <div id="displayAddress" style="padding: 12px; background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; color: #4a5568; line-height: 1.5; margin-bottom: 8px;">
              ${defaultAddress}
            </div>
            <button type="button" id="useDiffAddressBtn" style="background: none; border: none; color: #2c3550; text-decoration: underline; font-size: 13px; cursor: pointer; padding: 0;">Use a different address</button>
          </div>

          <!-- Custom Address Input Section (initially hidden) -->
          <div id="customAddressSection" style="display: none; margin-bottom: 10px;">
            <p style="margin-bottom: 8px; font-weight: bold; color: #333; font-size: 15px;">Enter Shipping Address:</p>
            <input type="text" id="customAddressInput" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box; outline: none; margin-bottom: 8px;" placeholder="Enter your delivery address...">
            <button type="button" id="backToDefaultBtn" style="background: none; border: none; color: #64748b; text-decoration: underline; font-size: 13px; cursor: pointer; padding: 0;">Use saved address</button>
          </div>
        </div>
      `;
    } else {
      // Fallback: Show input field directly if no default address is set
      htmlContent = `
        <div id="addressContainer" style="text-align: left; font-family: inherit; margin-top: 10px;">
          <div id="customAddressSection" style="margin-bottom: 10px;">
            <p style="margin-bottom: 8px; font-weight: bold; color: #333; font-size: 15px;">Shipping Address:</p>
            <input type="text" id="customAddressInput" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box; outline: none;" placeholder="Enter your delivery address...">
          </div>
        </div>
      `;
    }

    Swal.fire({
      title: 'Shipping Address',
      html: htmlContent,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonColor: '#2c3550',
      didOpen: () => {
        const defaultSec = document.getElementById('defaultAddressSection');
        const customSec = document.getElementById('customAddressSection');
        const useDiffBtn = document.getElementById('useDiffAddressBtn');
        const backToDefBtn = document.getElementById('backToDefaultBtn');
        const customInput = document.getElementById('customAddressInput');

        if (useDiffBtn && defaultSec && customSec && customInput) {
          useDiffBtn.addEventListener('click', () => {
            defaultSec.style.display = 'none';
            customSec.style.display = 'block';
            customInput.focus();
          });
        }

        if (backToDefBtn && defaultSec && customSec) {
          backToDefBtn.addEventListener('click', () => {
            customSec.style.display = 'none';
            defaultSec.style.display = 'block';
          });
        }
      },
      preConfirm: () => {
        const customSec = document.getElementById('customAddressSection');
        const customInput = document.getElementById('customAddressInput');
        const displayAddress = document.getElementById('displayAddress');

        let selectedAddress = '';

        if (customSec && customSec.style.display !== 'none' && customInput) {
          selectedAddress = customInput.value.trim();
        } else if (displayAddress) {
          selectedAddress = displayAddress.textContent.trim();
        } else if (customInput) {
          selectedAddress = customInput.value.trim();
        }

        if (!selectedAddress) {
          Swal.showValidationMessage('You must provide a shipping address!');
          return false;
        }

        return selectedAddress;
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
  }

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

    // Temporary loading indicator while fetching user profile
    Swal.fire({
      title: 'Loading profile...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Fetch user profile for addressline and zipcode
    $.ajax({
      type: 'GET',
      url: `${url}api/v1/profile`,
      headers: { Authorization: `Bearer ${token}` },
      success: function (response) {
        Swal.close();
        let formattedAddress = '';
        if (response && response.data) {
          const { addressline, zipcode } = response.data;
          const addressParts = [];
          if (addressline && addressline.trim() !== '') addressParts.push(addressline.trim());
          if (zipcode && zipcode.trim() !== '') addressParts.push(zipcode.trim());
          formattedAddress = addressParts.join(', ');
        }
        handleCheckout(formattedAddress, token, cart);
      },
      error: function () {
        Swal.close();
        // Fallback to empty input if profile retrieval fails
        handleCheckout('', token, cart);
      }
    });
  });

  renderCart();
});