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

  $.ajax({
    method: 'GET',
    url: `${url}api/v1/dashboard/address-chart`,
    dataType: 'json',
    headers: { Authorization: `Bearer ${token}` },
    success: function (data) {
      const values = data?.values || [];
      const labels = data?.labels || [];
      const ctx = $('#addressChart');

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Number of Customers per town',
            data: values,
            backgroundColor: randomColors(values.length),
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
      Swal.fire({ icon: 'error', text: 'Failed to load address chart.' });
    }
  });

  $.ajax({
    method: 'GET',
    url: `${url}api/v1/dashboard/sales-chart`,
    dataType: 'json',
    headers: { Authorization: `Bearer ${token}` },
    success: function (data) {
      const values = data?.values || [];
      const labels = data?.labels || [];
      const ctx = $('#salesChart');

      new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Monthly sales',
            data: values,
            backgroundColor: randomColors(values.length),
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
      Swal.fire({ icon: 'error', text: 'Failed to load sales chart.' });
    }
  });

  $.ajax({
    method: 'GET',
    url: `${url}api/v1/dashboard/items-chart`,
    dataType: 'json',
    headers: { Authorization: `Bearer ${token}` },
    success: function (data) {
      const values = data?.values || [];
      const labels = data?.labels || [];
      const ctx = $('#itemsChart');

      new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            label: 'Number of items sold',
            data: values,
            backgroundColor: randomColors(values.length),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            datalabels: {
              color: 'white',
              font: { weight: 'bold' },
              formatter: Math.round
            }
          }
        }
      });
    },
    error: function (error) {
      console.log(error);
      Swal.fire({ icon: 'error', text: 'Failed to load items chart.' });
    }
  });
});