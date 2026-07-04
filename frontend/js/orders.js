$(document).ready(function () {
  const url = 'http://localhost:5000/';
  const token = sessionStorage.getItem('token') || '';
  let allOrders = [];
  let activeFilter = 'active';

  if (!token) {
    Swal.fire({ icon: 'warning', text: 'Please login first.' }).then(() => {
      window.location.href = 'login.html';
    });
    return;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  function statusBadgeClass(status) {
    switch ((status || '').toLowerCase()) {
      case 'processing': return 'badge-warning';
      case 'shipped': return 'badge-info';
      case 'delivered': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  function filterOrders() {
    if (activeFilter === 'active') {
      return allOrders.filter((order) => ['processing', 'shipped'].includes((order.status || '').toLowerCase()));
    }
    return allOrders.filter((order) => ['delivered', 'cancelled'].includes((order.status || '').toLowerCase()));
  }

  function renderOrders() {
    const orders = filterOrders();
    if (!orders.length) {
      $('#ordersList').html('<div class="alert alert-light border">No orders found.</div>');
      return;
    }

    const html = orders.map((order) => {
      const itemsCount = order.items?.length || 0;
      const statusClass = statusBadgeClass(order.status);
      return `
        <div class="card order-card mb-3 shadow-sm">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-3 mb-3 mb-md-0">
                <div class="small text-muted text-uppercase">Order #</div>
                <div class="h5 mb-0 text-primary">${escapeHtml(order.orderId)}</div>
              </div>
              <div class="col-md-2 mb-3 mb-md-0">
                <div class="small text-muted text-uppercase">Date</div>
                <div>${formatDate(order.date)}</div>
              </div>
              <div class="col-md-2 mb-3 mb-md-0">
                <div class="small text-muted text-uppercase">Status</div>
                <span class="badge ${statusClass} px-3 py-2 text-uppercase">${escapeHtml(order.status)}</span>
              </div>
              <div class="col-md-2 mb-3 mb-md-0">
                <div class="small text-muted text-uppercase">Total</div>
                <div class="font-weight-bold">₱${Number(order.totalAmount || 0).toFixed(2)}</div>
              </div>
              <div class="col-md-3 text-md-right">
                <button class="btn btn-outline-primary detail-toggle" data-order-id="${order.orderId}">
                  Details <span class="ml-1">+</span>
                </button>
              </div>
            </div>

            <div class="order-details mt-4 pt-4 border-top" id="details-${order.orderId}" style="display:none;"></div>
          </div>
        </div>
      `;
    }).join('');

    $('#ordersList').html(html);
  }

  function renderDetails(order) {
  const itemsHtml = (order.items || []).map((item) => `
    <div class="media mb-3">
      <div class="mr-3" style="width:60px;">
        <img src="${item.image ? `${url}${item.image}` : `${url}images/default-gadget.jpg`}" alt="${escapeHtml(item.description)}" class="img-fluid rounded border" />
      </div>
      <div class="media-body">
        <h6 class="mt-0 mb-1">${escapeHtml(item.description)}</h6>
        <div class="text-muted small">Qty: ${item.quantity}</div>
        <div class="small text-muted">₱${Number(item.price || 0).toFixed(2)}</div>
      </div>
    </div>
  `).join('');

  const canCancel = (order.status || '').toLowerCase() === 'processing';

  // new: only build the cancel button markup when the order can actually be cancelled
  const cancelButtonHtml = canCancel
    ? `<button class="btn btn-danger cancel-order-btn" data-order-id="${order.orderId}">Cancel Order</button>`
    : '';

  return `
    <div class="row">
      <div class="col-lg-7 mb-4 mb-lg-0">
        <div class="detail-panel p-3 h-100">
          <h6 class="mb-3">Items Ordered</h6>
          ${itemsHtml || '<p class="text-muted mb-0">No items available.</p>'}
        </div>
      </div>
      <div class="col-lg-5">
        <div class="detail-panel p-3 h-100">
          <h6 class="mb-3">Shipping Address</h6>
          <p class="mb-3">${escapeHtml(order.shippingAddress)}</p>
          <div class="border-top pt-3 d-flex justify-content-end">
            ${cancelButtonHtml}
          </div>
        </div>
      </div>
    </div>
  `;

  }

  // fetches a single order's full details (items, shipping address, etc.)
  // returns the jQuery AJAX promise so callers can chain .done()/.fail()
  function loadOrderDetails(orderId) {
    return $.ajax({
      method: 'GET',
      url: `${url}api/v1/my-orders/${orderId}`,
      dataType: 'json',
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  function loadOrders() {
    $.ajax({
      method: 'GET',
      url: `${url}api/v1/my-orders`,
      dataType: 'json',
      headers: { Authorization: `Bearer ${token}` },
      success: function (data) {
        allOrders = data?.rows || [];
        renderOrders();
      },
      error: function (error) {
        if (error.status === 401) {
          sessionStorage.clear();
          return Swal.fire({ icon: 'warning', text: 'Session expired. Please login again.' }).then(() => {
            window.location.href = 'login.html';
          });
        }

        $('#ordersList').html('<div class="alert alert-danger">Failed to load orders.</div>');
      }
    });
  }

  $('#ordersTabs').on('click', 'a[data-filter]', function (e) {
    e.preventDefault();
    $('#ordersTabs .nav-link').removeClass('active');
    $(this).addClass('active');
    activeFilter = $(this).data('filter');
    renderOrders();
  });

  $('#ordersList').on('click', '.detail-toggle', function () {
    const orderId = Number($(this).data('order-id'));
    const $button = $(this);
    const $panel = $(`#details-${orderId}`);

    if ($panel.is(':visible')) {
      $panel.slideUp(180);
      $button.find('span').text('+');
      return;
    }

    if ($panel.data('loaded')) {
      $panel.slideDown(180);
      $button.find('span').text('−');
      return;
    }

    loadOrderDetails(orderId).done(function (data) {
      const order = data?.data;
      if (!order) {
        $panel.html('<div class="alert alert-light border mb-0">Order details not found.</div>');
      } else {
        $panel.html(renderDetails(order));
        $panel.data('loaded', true);
      }
      $panel.slideDown(180);
      $button.find('span').text('−');
    }).fail(function (error) {
      Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Failed to load order details' });
    });
  });

  $('#ordersList').on('click', '.cancel-order-btn', function () {
    const orderId = Number($(this).data('order-id'));

    Swal.fire({
      title: 'Cancel this order?',
      text: 'This will mark the order as cancelled.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it'
    }).then((result) => {
      if (!result.isConfirmed) return;

      $.ajax({
        method: 'PATCH',
        url: `${url}api/v1/my-orders/${orderId}/cancel`,
        dataType: 'json',
        headers: { Authorization: `Bearer ${token}` },
        success: function (data) {
          Swal.fire({ icon: 'success', text: data?.message || 'Order cancelled' });
          loadOrders();
        },
        error: function (error) {
          Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Cancel failed' });
        }
      });
    });
  });

  loadOrders();
});