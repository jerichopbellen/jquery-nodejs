$(document).ready(function () {
  const url = 'http://localhost:5000/';

  // if already logged in, redirect away
  if (sessionStorage.getItem('token')) {
    const role = sessionStorage.getItem('role');
    window.location.href = role === 'admin' ? 'dashboard.html' : 'home.html';
    return;
  }

  $('#loginForm').on('submit', function (e) {
    e.preventDefault();

    const email = $('#email').val().trim();
    const password = $('#password').val();

    if (!email || !password) {
      return Swal.fire({ icon: 'warning', text: 'Email and password are required.' });
    }

    $.ajax({
      method: 'POST',
      url: `${url}api/v1/login`,
      data: JSON.stringify({ email, password }),
      processData: false,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function (data) {
        // supports token/accessToken/jwt
        const token = data?.token || data?.accessToken || data?.jwt || '';
        const user = data?.user || {};
        const userId = user?.id ?? user?.user_id ?? '';
        const name = user?.name || '';
        const role = user?.role || 'customer';

        if (!token) {
          return Swal.fire({ icon: 'error', text: 'Login succeeded but token is missing.' });
        }

        sessionStorage.setItem('token', token);
        if (userId !== '') sessionStorage.setItem('userId', String(userId));
        if (user.email) sessionStorage.setItem('email', user.email);
        if (name) sessionStorage.setItem('name', name);
        if (role) sessionStorage.setItem('role', role);

        Swal.fire({
          icon: 'success',
          text: data?.message || 'Welcome back',
          timer: 900,
          showConfirmButton: false
        });

        setTimeout(() => {
          window.location.href = role === 'admin' ? 'dashboard.html' : 'home.html';
        }, 900);
      },
      error: function (error) {
        Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Login failed' });
      }
    });
  });
});