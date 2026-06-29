$(document).ready(function () {
  const url = 'http://localhost:5000/';

  const token = sessionStorage.getItem('token') || '';
  const userId = Number(sessionStorage.getItem('userId') || 0);

  if (!token) {
    Swal.fire({ icon: 'warning', text: 'Please login first.' }).then(() => {
      window.location.href = 'login.html';
    });
    return;
  }

  function renderCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length > 0) $('#itemCount').text(cart.length).show();
    else $('#itemCount').hide();
  }

  $('#avatar').on('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => $('#avatarPreview').attr('src', e.target.result).show();
    reader.readAsDataURL(file);
  });

  $('#updateBtn').on('click', function (event) {
    event.preventDefault();

    if (!userId) {
      return Swal.fire({ icon: 'error', text: 'Invalid session. Please login again.' }).then(() => {
        sessionStorage.clear();
        window.location.href = 'login.html';
      });
    }

    const formData = new FormData($('#profileForm')[0]);
    formData.set('userId', userId);

    $.ajax({
      method: 'POST',
      url: `${url}api/v1/update-profile`,
      data: formData,
      contentType: false,
      processData: false,
      dataType: 'json',
      headers: { Authorization: `Bearer ${token}` },
      success: function (data) {
        Swal.fire({ icon: 'success', text: data.message || 'Profile updated' });
      },
      error: function (error) {
        if (error.status === 401) {
          sessionStorage.clear();
          return Swal.fire({ icon: 'warning', text: 'Session expired. Please login again.' }).then(() => {
            window.location.href = 'login.html';
          });
        }
        Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Profile update failed' });
      }
    });
  });

  $('#deactivateBtn').on('click', function (e) {
    e.preventDefault();

    const email = sessionStorage.getItem('email') || '';
    if (!email) return Swal.fire({ icon: 'error', text: 'Missing account email.' });

    $.ajax({
      method: 'DELETE',
      url: `${url}api/v1/deactivate`,
      data: JSON.stringify({ email }),
      processData: false,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: { Authorization: `Bearer ${token}` },
      success: function (data) {
        sessionStorage.clear();
        Swal.fire({ icon: 'success', text: data.message || 'Account deactivated' }).then(() => {
          window.location.href = 'login.html';
        });
      },
      error: function (error) {
        Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Deactivate failed' });
      }
    });
  });

  renderCartBadge();
});