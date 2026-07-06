$(document).ready(function () {
  const url = 'http://localhost:5000/';
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  // simple admin guard
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

  function randomColors(count) {
    const colors = [];
    const letters = '0123456789ABCDEF';
    for (let i = 0; i < count; i++) {
      let c = '#';
      for (let j = 0; j < 6; j++) c += letters[Math.floor(Math.random() * 16)];
      colors.push(c);
    }
    return colors;
  }

  function peso(amount) {
    const n = Number(amount) || 0;
    return '\u20b1' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function toDateInputValue(d) {
    return d.toISOString().slice(0, 10);
  }

  // ---------------------------------------------------------------
  // Key statistics (total revenue, users, products, customers, admins)
  // ---------------------------------------------------------------
  $.ajax({
    method: 'GET',
    url: `${url}api/v1/dashboard/stats`,
    dataType: 'json',
    headers: { Authorization: `Bearer ${token}` },
    success: function (data) {
      $('#statRevenue').text(peso(data?.totalRevenue));
      $('#statTotalUsers').text(data?.totalUsers ?? 0);
      $('#statTotalProducts').text(data?.totalProducts ?? 0);
      $('#statCustomers').text(data?.totalCustomers ?? 0);
      $('#statAdmins').text(data?.totalAdmins ?? 0);
    },
    error: function (error) {
      console.log(error);
      Swal.fire({ icon: 'error', text: 'Failed to load key statistics.' });
    }
  });

  // ---------------------------------------------------------------
  // Order status overview
  // ---------------------------------------------------------------
  $.ajax({
    method: 'GET',
    url: `${url}api/v1/dashboard/order-status`,
    dataType: 'json',
    headers: { Authorization: `Bearer ${token}` },
    success: function (data) {
      $('#statTotalOrders').text(data?.total ?? 0);
      $('#statProcessing').text(data?.processing ?? 0);
      $('#statShipped').text(data?.shipped ?? 0);
      $('#statDelivered').text(data?.delivered ?? 0);
      $('#statCancelled').text(data?.cancelled ?? 0);
    },
    error: function (error) {
      console.log(error);
      Swal.fire({ icon: 'error', text: 'Failed to load order status overview.' });
    }
  });

  // ---------------------------------------------------------------
  // Tab switching
  // ---------------------------------------------------------------
  const panes = { performance: '#tab-performance', yearly: '#tab-yearly', product: '#tab-product' };

  $('.chart-tab-btn').on('click', function () {
    const tab = $(this).data('tab');

    $('.chart-tab-btn').removeClass('active');
    $(this).addClass('active');

    Object.values(panes).forEach((sel) => $(sel).addClass('d-none'));
    $(panes[tab]).removeClass('d-none');

    if (tab === 'yearly' && !yearlyRevenueChart) loadYearlyRevenue();
    if (tab === 'product' && !productShareChart) loadProductShare();
  });

  // ---------------------------------------------------------------
  // Sales Performance (daily, date-filtered bar chart)
  // ---------------------------------------------------------------
  let salesPerformanceChart = null;

  function loadSalesPerformance(startDate, endDate) {
    $('#salesPerformanceLoading').show();
    $.ajax({
      method: 'GET',
      url: `${url}api/v1/dashboard/sales-performance`,
      dataType: 'json',
      headers: { Authorization: `Bearer ${token}` },
      data: { startDate, endDate },
      success: function (data) {
        const values = data?.values || [];
        const labels = data?.labels || [];
        const ctx = $('#salesPerformanceChart');

        if (salesPerformanceChart) salesPerformanceChart.destroy();
        salesPerformanceChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Daily Sales',
              data: values,
              backgroundColor: 'rgba(129, 212, 197, 0.6)',
              borderColor: 'rgba(129, 212, 197, 1)',
              borderWidth: 1
            }]
          },
          options: {
            scales: { y: { beginAtZero: true } }
          }
        });
      },
      error: function (error) {
        console.log(error);
        Swal.fire({ icon: 'error', text: 'Failed to load sales performance chart.' });
      },
      complete: function () {
        $('#salesPerformanceLoading').hide();
      }
    });
  }

  // default range: last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  $('#salesStartDate').val(toDateInputValue(thirtyDaysAgo));
  $('#salesEndDate').val(toDateInputValue(today));

  loadSalesPerformance($('#salesStartDate').val(), $('#salesEndDate').val());

  $('#filterSalesBtn').on('click', function () {
    const startDate = $('#salesStartDate').val();
    const endDate = $('#salesEndDate').val();
    if (!startDate || !endDate) {
      Swal.fire({ icon: 'warning', text: 'Please select both a start and end date.' });
      return;
    }
    loadSalesPerformance(startDate, endDate);
  });

  $('#clearSalesBtn').on('click', function () {
    $('#salesStartDate').val(toDateInputValue(thirtyDaysAgo));
    $('#salesEndDate').val(toDateInputValue(today));
    loadSalesPerformance($('#salesStartDate').val(), $('#salesEndDate').val());
  });

  // ---------------------------------------------------------------
  // Yearly Revenue (line chart, loaded on first tab visit)
  // ---------------------------------------------------------------
  let yearlyRevenueChart = null;

  function loadYearlyRevenue() {
    $('#yearlyRevenueLoading').show();
    $.ajax({
      method: 'GET',
      url: `${url}api/v1/dashboard/yearly-revenue`,
      dataType: 'json',
      headers: { Authorization: `Bearer ${token}` },
      success: function (data) {
        const values = data?.values || [];
        const labels = data?.labels || [];
        const ctx = $('#yearlyRevenueChart');

        yearlyRevenueChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Monthly Sales',
              data: values,
              fill: true,
              backgroundColor: 'rgba(21, 101, 224, 0.1)',
              borderColor: 'rgba(21, 101, 224, 1)',
              tension: 0.35,
              pointBackgroundColor: 'rgba(21, 101, 224, 1)'
            }]
          },
          options: {
            scales: { y: { beginAtZero: true } }
          }
        });
      },
      error: function (error) {
        console.log(error);
        Swal.fire({ icon: 'error', text: 'Failed to load yearly revenue chart.' });
      },
      complete: function () {
        $('#yearlyRevenueLoading').hide();
      }
    });
  }

  // ---------------------------------------------------------------
  // Product Share (pie chart + custom legend list, loaded on first visit)
  // ---------------------------------------------------------------
  let productShareChart = null;

  function loadProductShare() {
    $('#productShareLoading').show();
    $.ajax({
      method: 'GET',
      url: `${url}api/v1/dashboard/product-share`,
      dataType: 'json',
      headers: { Authorization: `Bearer ${token}` },
      success: function (data) {
        const values = data?.values || [];
        const labels = data?.labels || [];
        const colors = randomColors(values.length);
        const total = values.reduce((sum, v) => sum + Number(v || 0), 0);
        const ctx = $('#productShareChart');

        productShareChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels,
            datasets: [{
              data: values,
              backgroundColor: colors,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } }
          }
        });

        const $legend = $('#productShareLegend').empty();
        labels.forEach((label, i) => {
          const units = values[i];
          const pct = total ? ((units / total) * 100).toFixed(1) : 0;
          $legend.append(`
            <li>
              <span class="legend-swatch" style="background:${colors[i]}"></span>
              <span>
                <span class="legend-name">${label}</span>
                <span class="legend-sub">${units} units (${pct}%)</span>
              </span>
            </li>
          `);
        });
      },
      error: function (error) {
        console.log(error);
        Swal.fire({ icon: 'error', text: 'Failed to load product share chart.' });
      },
      complete: function () {
        $('#productShareLoading').hide();
      }
    });
  }
});