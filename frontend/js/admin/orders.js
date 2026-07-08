$(document).ready(function () {
  const url = 'http://localhost:5000/';
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

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

  $('#wrapper').show();

  const STATUS_OPTIONS = ['processing', 'shipped', 'delivered', 'cancelled'];

  const statusColors = {
    processing: '#f1c40f', // yellow
    shipped: '#e67e22',    // orange
    delivered: '#2ecc71',  // green
    cancelled: '#e74c3c'   // red
  };

  function formatCurrency(amount) {
    const n = Number(amount);
    return isNaN(n) ? amount : `₱${n.toFixed(2)}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
  }

  function statusBadge(status) {
    const color = statusColors[status] || '#95a5a6';
    const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    return `<span class="badge" style="background-color:${color}; color:#fff;">${label}</span>`;
  }

  const ordersTable = $('#ordersTable').DataTable({
    ajax: {
      url: `${url}api/v1/admin/orders`,
      headers: { Authorization: `Bearer ${token}` },
      dataSrc: 'rows',
      error: function (xhr) {
        if (xhr.status === 401) {
          Swal.fire({ icon: 'error', text: 'Session expired. Please log in again.' });
          localStorage.clear();
          setTimeout(() => (window.location.href = 'login.html'), 1200);
        } else if (xhr.status === 403) {
          Swal.fire({ icon: 'error', text: 'You do not have access to this page.' });
        } else {
          Swal.fire({ icon: 'error', text: 'Failed to load orders.' });
        }
      }
    },
    columns: [
      { data: 'orderId' },
      { data: 'customerName', defaultContent: '' },
      { data: 'customerEmail', defaultContent: '' },
      { data: 'totalAmount', render: (data) => formatCurrency(data) },
      { data: 'status', render: (data) => statusBadge(data) },
      { data: 'date', render: (data) => formatDate(data) },
      {
        data: null,
        orderable: false,
        render: () =>
          `<button class="btn btn-sm btn-success viewOrderBtn mr-1" title="View"><i class="fas fa-eye"></i></button>` +
          `<button class="btn btn-sm btn-warning editOrderBtn mr-1" title="Edit"><i class="fas fa-edit"></i></button>` +
          `<button class="btn btn-sm btn-danger deleteOrderBtn" title="Delete"><i class="fas fa-trash"></i></button>`
      }
    ]
  });

  function buildDetailsPanel(rowData) {
    const items = rowData.items || [];
    const itemsRows = items.length
      ? items
          .map((item) => {
            const subtotal = Number(item.price || 0) * Number(item.quantity || 0);
            return `
              <tr>
                <td>${item.description || 'Item'}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.price)}</td>
                <td class="text-right">${formatCurrency(subtotal)}</td>
              </tr>
            `;
          })
          .join('')
      : '<tr><td colspan="4" class="text-center text-muted">No items found</td></tr>';

    return `
      <div class="p-3">
        <div class="row mb-3">
          <div class="col-md-6">
            <strong>Customer:</strong> ${rowData.customerName || ''}<br />
            <strong>Email:</strong> ${rowData.customerEmail || ''}
          </div>
          <div class="col-md-6">
            <strong>Status:</strong> ${statusBadge(rowData.status)}<br />
            <strong>Placed on:</strong> ${formatDate(rowData.date)}
          </div>
        </div>
        <div class="mb-3">
          <strong>Shipping address:</strong>
          <p class="mb-0">${rowData.shippingAddress || '—'}</p>
        </div>
        ${
          rowData.trackingNumber
            ? `<div class="mb-3"><strong>Tracking number:</strong> ${rowData.trackingNumber}</div>`
            : ''
        }
        <div class="table-responsive">
          <table class="table table-sm table-bordered mb-0">
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-center">Quantity</th>
                <th class="text-right">Price</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
            <tfoot>
              <tr>
                <th colspan="3" class="text-right">Total</th>
                <th class="text-right">${formatCurrency(rowData.totalAmount)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
  }

  $('#ordersTable tbody').on('click', '.viewOrderBtn', function () {
    const $btn = $(this);
    const tr = $btn.closest('tr');
    const row = ordersTable.row(tr);

    if (row.child.isShown()) {
      row.child.hide();
      tr.removeClass('shown');
      $btn.attr('title', 'View').html('<i class="fas fa-eye"></i>');
    } else {
      row.child(buildDetailsPanel(row.data())).show();
      tr.addClass('shown');
      $btn.attr('title', 'Hide').html('<i class="fas fa-eye-slash"></i>');
    }
  });

  // open modal pre-filled with the selected order's data
  $('#ordersTable tbody').on('click', '.editOrderBtn', function () {
    const rowData = ordersTable.row($(this).closest('tr')).data();
    if (!rowData) return;

    $('#orderIdField').val(rowData.orderId);
    $('#orderCustomer').val(rowData.customerName || '');
    $('#orderTotal').val(formatCurrency(rowData.totalAmount));

    const currentStatus = rowData.status;
    const $statusSelect = $('#orderStatus');

    // Reset: Enable all options first
    $statusSelect.find('option').prop('disabled', false);

    // Set the current value
    const valToSet = STATUS_OPTIONS.includes(currentStatus) ? currentStatus : STATUS_OPTIONS[0];
    $statusSelect.val(valToSet);

    // Business Logic for graying out options
    if (currentStatus === 'shipped') {
      // Cannot revert to processing
      $statusSelect.find('option[value="processing"]').prop('disabled', true);
    } 
    else if (currentStatus === 'delivered') {
      // Final state: Cannot change to anything else
      $statusSelect.find('option[value="processing"]').prop('disabled', true);
      $statusSelect.find('option[value="shipped"]').prop('disabled', true);
      $statusSelect.find('option[value="cancelled"]').prop('disabled', true);
    }
    else if (currentStatus === 'cancelled') {
      // Final state: Cannot revert a cancelled order
      $statusSelect.find('option[value="processing"]').prop('disabled', true);
      $statusSelect.find('option[value="shipped"]').prop('disabled', true);
      $statusSelect.find('option[value="delivered"]').prop('disabled', true);
    }

    $('#ordersModal').modal('show');
  });

  $('#orderUpdateBtn').on('click', function () {
    const orderId = $('#orderIdField').val();
    const newStatus = $('#orderStatus').val();

    if (!orderId) return;

    Swal.fire({
      icon: 'question',
      title: 'Confirm status change',
      text: `Change order #${orderId} status to "${newStatus}"?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, update it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#007bff'
    }).then((result) => {
      if (!result.isConfirmed) return;

      $.ajax({
        method: 'PATCH',
        url: `${url}api/v1/admin/orders/${orderId}/status`,
        headers: { Authorization: `Bearer ${token}` },
        data: JSON.stringify({ status: newStatus }),
        processData: false,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (data) {
          $('#ordersModal').modal('hide');
          Swal.fire({
            icon: 'success',
            text: data?.message || 'Order status updated.',
            timer: 1000,
            showConfirmButton: false
          });
          ordersTable.ajax.reload(null, false);
        },
        error: function (error) {
          Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Failed to update order.' });
        }
      });
    });
  });

  $('#ordersTable tbody').on('click', '.deleteOrderBtn', function () {
    const rowData = ordersTable.row($(this).closest('tr')).data();
    if (!rowData) return;

    const orderId = rowData.orderId;

    Swal.fire({
      icon: 'warning',
      title: 'Delete this order?',
      text: `Order #${orderId} will be permanently deleted. This cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#e74c3c'
    }).then((result) => {
      if (!result.isConfirmed) return;

      $.ajax({
        method: 'DELETE',
        url: `${url}api/v1/admin/orders/${orderId}`,
        headers: { Authorization: `Bearer ${token}` },
        dataType: 'json',
        success: function (data) {
          Swal.fire({
            icon: 'success',
            text: data?.message || 'Order deleted.',
            timer: 1000,
            showConfirmButton: false
          });
          ordersTable.ajax.reload(null, false);
        },
        error: function (error) {
          Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Failed to delete order.' });
        }
      });
    });
  });
});