$(document).ready(function () {
  const url = 'http://localhost:5000/';

  // if already logged in, redirect away
  if (sessionStorage.getItem('token')) {
    const role = sessionStorage.getItem('role');
    window.location.href = role === 'admin' ? 'dashboard.html' : 'home.html';
    return;
  }

  $('#registerForm').on('submit', function (e) {
    e.preventDefault();

    const name = $('#name').val().trim();
    const email = $('#email').val().trim();
    const password = $('#password').val();

    if (!name || !email || !password) {
      return Swal.fire({ icon: 'warning', text: 'Name, email, and password are required.' });
    }

    $.ajax({
      method: 'POST',
      url: `${url}api/v1/register`,
      data: JSON.stringify({ name, email, password }),
      processData: false,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function (data) {
        Swal.fire({
          icon: 'success',
          text: data?.message || 'Register success'
        });

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 800);
      },
      error: function (error) {
        Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Register failed' });
      }
    });
  });
});