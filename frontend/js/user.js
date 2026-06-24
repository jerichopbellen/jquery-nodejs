$(document).ready(function () {
  const url = 'http://localhost:5000/';

  const saveSession = (data) => {
    sessionStorage.setItem('token', data.token); // raw string
    sessionStorage.setItem('userId', String(data.user.id));
    sessionStorage.setItem('email', data.user.email);
  };

  $('#register').on('click', function (e) {
    e.preventDefault();
    const name = $('#name').val().trim();
    const email = $('#email').val().trim();
    const password = $('#password').val();

    $.ajax({
      method: 'POST',
      url: `${url}api/v1/register`,
      data: JSON.stringify({ name, email, password }),
      processData: false,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function (data) {
        Swal.fire({ icon: 'success', text: data.message || 'Register success' });
        setTimeout(() => (window.location.href = 'login.html'), 700);
      },
      error: function (error) {
        Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Register failed' });
      }
    });
  });

  $('#avatar').on('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => $('#avatarPreview').attr('src', e.target.result).show();
    reader.readAsDataURL(file);
  });

  $('#login').on('click', function (e) {
    e.preventDefault();
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
        saveSession(data);
        Swal.fire({ icon: 'success', text: data.message || 'Welcome back', timer: 900, showConfirmButton: false });
        setTimeout(() => (window.location.href = 'profile.html'), 900);
      },
      error: function (error) {
        Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Login failed' });
      }
    });
  });

  $('#updateBtn').on('click', function (event) {
    event.preventDefault();

    const userId = Number((sessionStorage.getItem('userId') || '').replace(/"/g, '').trim());
    if (!userId) return Swal.fire({ icon: 'error', text: 'Please login first' });

    const formData = new FormData($('#profileForm')[0]);
    formData.set('userId', userId);

    $.ajax({
      method: 'POST',
      url: `${url}api/v1/update-profile`,
      data: formData,
      contentType: false,
      processData: false,
      dataType: 'json',
      success: function (data) {
        Swal.fire({ icon: 'success', text: data.message || 'Profile updated' });
      },
      error: function (error) {
        Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Profile update failed' });
      }
    });
  });

  $('#deactivateBtn').on('click', function (e) {
    e.preventDefault();
    const email = sessionStorage.getItem('email') || $('#email').val();

    $.ajax({
      method: 'DELETE',
      url: `${url}api/v1/deactivate`,
      data: JSON.stringify({ email }),
      processData: false,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function (data) {
        sessionStorage.clear();
        Swal.fire({ icon: 'success', text: data.message || 'Deactivated' });
      },
      error: function (error) {
        Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Deactivate failed' });
      }
    });
  });

  $("#home").load("header.html", function () {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.length;
    if (totalItems > 0) $('#itemCount').text(totalItems).show();
    else $('#itemCount').hide();

    if (sessionStorage.getItem('token')) {
      $('#log .nav-link').text('Logout').attr('href', '#').off('click').on('click', function (e) {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = 'login.html';
      });
    }
  });
});