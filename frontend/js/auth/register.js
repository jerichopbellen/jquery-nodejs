$(document).ready(function () {
  const url = 'http://localhost:5000/';

  // If already logged in, redirect away
  if (localStorage.getItem('token')) {
    const role = localStorage.getItem('role');
    window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'home.html';
    return;
  }

  // jQuery Validation Module for Registration Form
  $('#registerForm').validate({
    rules: {
      firstName: {
        required: true,
        minlength: 2
      },
      lastName: {
        required: true,
        minlength: 2
      },
      email: {
        required: true,
        email: true
      },
      password: {
        required: true,
        minlength: 6
      }
    },
    messages: {
      firstName: {
        required: "Please enter your first name.",
        minlength: "First name must be at least 2 characters long."
      },
      lastName: {
        required: "Please enter your last name.",
        minlength: "Last name must be at least 2 characters long."
      },
      email: {
        required: "Please enter your email address.",
        email: "Please provide a valid email format (e.g., name@example.com)."
      },
      password: {
        required: "Please provide a password.",
        minlength: "Your password must be at least 6 characters long."
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

    // Runs automatically ONLY when all fields pass validation rules
    submitHandler: function(form) {
      const firstName = $('#firstname').val().trim();
      const lastName = $('#lastname').val().trim();
      const email = $('#email').val().trim();
      const password = $('#password').val();

      $.ajax({
        method: 'POST',
        url: `${url}api/v1/register`,
        data: JSON.stringify({ firstName, lastName, email, password }),
        processData: false,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (data) {
          Swal.fire({
            icon: 'success',
            text: data?.message || 'Registration successful!'
          });

          setTimeout(() => {
            window.location.href = 'login.html';
          }, 800);
        },
        error: function (error) {
          Swal.fire({
            icon: 'error',
            text: error.responseJSON?.message || 'Registration failed.'
          });
        }
      });
    }
  });
});