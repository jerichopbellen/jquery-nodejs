$(document).ready(function () {
  const url = 'http://localhost:5000/';

  // If already logged in, redirect away
  if (sessionStorage.getItem('token')) {
    const role = sessionStorage.getItem('role');
    window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'home.html';
    return;
  }

  // --- password show/hide toggle ---
  const toggleBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const eyeIcon = document.getElementById('eyeIcon');

  if (toggleBtn && passwordInput && eyeIcon) {
    const eyeOpen = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
    const eyeClosed = `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;

    toggleBtn.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      eyeIcon.innerHTML = type === 'password' ? eyeOpen : eyeClosed;
    });
  }

  // jQuery Validation Module for Login Form
  $('#loginForm').validate({
    rules: {
      email: {
        required: true,
        email: true
      },
      password: {
        required: true
      }
    },
    messages: {
      email: {
        required: "Please enter your email address.",
        email: "Please enter a valid email address."
      },
      password: {
        required: "Please enter your password."
      }
    },
    errorElement: "small",
    errorClass: "text-danger d-block mt-1 font-weight-bold",
    
    // Highlight inputs on validation exception
    highlight: function(element) {
      $(element).addClass('is-invalid').removeClass('is-valid');
    },
    // Clear highlight states once valid data is entered
    unhighlight: function(element) {
      $(element).removeClass('is-invalid').addClass('is-valid');
    },

    // Runs automatically ONLY when credentials pass simple front-end validation checks
    submitHandler: function(form) {
      const email = $('#email').val().trim();
      const password = $('#password').val();

      $.ajax({
        method: 'POST',
        url: `${url}api/v1/login`,
        data: JSON.stringify({ email, password }),
        processData: false,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (data) {
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
          Swal.fire({
            icon: 'error',
            text: error.responseJSON?.message || 'Invalid credentials or login failed.'
          });
        }
      });
    }
  });
});