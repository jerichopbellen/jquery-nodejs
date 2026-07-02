$(document).ready(function () {
  const url = 'http://localhost:5000/';

  const token = sessionStorage.getItem('token') || '';
  const userId = Number(sessionStorage.getItem('userId') || 0);
  const defaultAvatar = 'images/default-gadget.jpg';

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

  function setProfileForm(profile) {
    $('#firstName').val(profile.firstName || '');
    $('#lastName').val(profile.lastName || '');
    $('#address').val(profile.addressline || '');
    $('#phone').val(profile.phone || '');
    $('#zipcode').val(profile.zipcode || '');

    const avatar = profile.avatar || '';
    if (avatar) {
      $('#avatarPreview').attr('src', `${url}${avatar}`).show();
    } else {
      $('#avatarPreview').attr('src', defaultAvatar).show();
    }
  }

  // --- new: display/edit mode helpers ---
  const $textInputs = $('#firstName, #lastName, #address, #phone, #zipcode');
  let lastLoadedProfile = null;

  function showDisplayMode() {
    $textInputs.attr('readonly', true).removeClass('is-invalid');
    $('#avatar').attr('disabled', true);
    $('#editBtn').show();
    $('#updateBtn').hide();
    $('#cancelBtn').hide();
  }

  function showEditMode() {
    $textInputs.removeAttr('readonly');
    $('#avatar').removeAttr('disabled');
    $('#editBtn').hide();
    $('#updateBtn').show();
    $('#cancelBtn').show();
  }

  $('#editBtn').on('click', showEditMode);

  $('#cancelBtn').on('click', function () {
    if (lastLoadedProfile) setProfileForm(lastLoadedProfile);
    showDisplayMode();
  });
  // --- end new ---

  function loadProfile() {
    $.ajax({
      method: 'GET',
      url: `${url}api/v1/profile`,
      dataType: 'json',
      headers: { Authorization: `Bearer ${token}` },
      success: function (data) {
        if (data?.data) {
          lastLoadedProfile = data.data; // new
          setProfileForm(data.data);
        }
        showDisplayMode(); // new
      },
      error: function (error) {
        if (error.status === 401) {
          sessionStorage.clear();
          Swal.fire({ icon: 'warning', text: 'Session expired. Please login again.' }).then(() => {
            window.location.href = 'login.html';
          });
        } else {
          Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Failed to load profile' });
        }
      }
    });
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

    // --- new: validation before submit ---
    let isValid = true;
    $textInputs.removeClass('is-invalid');
    $textInputs.each(function () {
      if (!$(this).val() || !$(this).val().trim()) {
        $(this).addClass('is-invalid');
        isValid = false;
      }
    });
    if (!isValid) {
      return Swal.fire({ icon: 'warning', text: 'Please fill in all required fields.' });
    }
    // --- end new ---

    const formData = new FormData($('#profileForm')[0]);

    $.ajax({
      method: 'PUT',
      url: `${url}api/v1/profile`,
      data: formData,
      contentType: false,
      processData: false,
      dataType: 'json',
      headers: { Authorization: `Bearer ${token}` },
      success: function (data) {
        if (data?.data) {
          lastLoadedProfile = data.data; // new
          setProfileForm(data.data);
          if (data.data.firstName || data.data.lastName) {
            const displayName = [data.data.firstName, data.data.lastName].filter(Boolean).join(' ').trim();
            if (displayName) sessionStorage.setItem('name', displayName);
          }
        }
        Swal.fire({ icon: 'success', text: data.message || 'Profile updated' });
        showDisplayMode(); // new
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

  renderCartBadge();
  loadProfile();
});