$(document).ready(function () {
  const url = 'http://localhost:5000/';

  // if already logged in, redirect away
  if (sessionStorage.getItem('token')) {
    const role = sessionStorage.getItem('role');
    window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'home.html';
    return;
  }

  // --- password show/hide toggle ---
  const toggleBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const eyeIcon = document.getElementById('eyeIcon');

  const eyeOpen = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
  const eyeClosed = `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;

  if (toggleBtn && passwordInput && eyeIcon) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      eyeIcon.innerHTML = isPassword ? eyeClosed : eyeOpen;
    });
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
          window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'home.html';
        }, 900);
      },
      error: function (error) {
        Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Login failed' });
      }
    });
  });
});