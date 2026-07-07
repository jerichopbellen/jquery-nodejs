$(document).ready(function () {
  const url = 'http://localhost:5000/';

  const token = localStorage.getItem('token') || '';
  const userId = Number(localStorage.getItem('userId') || 0);
  const defaultAvatar = `${url}images/default-avatar.png`;

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

  // Toggles the visibility of the "Remove Photo" button
  function updateRemoveAvatarBtnVisibility() {
    const inEditMode = $('#updateBtn').is(':visible');
    const currentSrc = $('#avatarPreview').attr('src') || '';
    
    // Check if the current preview is a custom avatar or the default placeholder
    const hasCustomAvatar = currentSrc && !currentSrc.includes(defaultAvatar);

    if (inEditMode && hasCustomAvatar) {
      $('#removeAvatarBtn').show();
    } else {
      $('#removeAvatarBtn').hide();
    }
  }

  function setProfileForm(profile) {
    $('#firstName').val(profile.firstName || '');
    $('#lastName').val(profile.lastName || '');
    $('#address').val(profile.addressline || '');
    $('#phone').val(profile.phone || '');
    $('#zipcode').val(profile.zipcode || '');

    // Reset the deletion flag state
    $('#removeAvatarFlag').val('false');

    // Set Sidebar Display Full Name
    if (profile.firstName || profile.lastName) {
      const fullDisplay = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
      $('#profileSidebarFullName').text(fullDisplay);
    } else {
      $('#profileSidebarFullName').text('User Profile');
    }

    const avatar = profile.avatar || '';
    if (avatar) {
      $('#avatarPreview').attr('src', `${url}${avatar}`).show();
    } else {
      $('#avatarPreview').attr('src', defaultAvatar).show();
    }

    updateRemoveAvatarBtnVisibility();
  }

  // --- display/edit mode helpers ---
  const $textInputs = $('#firstName, #lastName, #address, #phone, #zipcode');
  let lastLoadedProfile = null;

  function showDisplayMode() {
    $textInputs.attr('readonly', true).removeClass('is-invalid');
    $('#avatar').attr('disabled', true);
    
    // Update container overlay class states
    $('#avatarPreviewContainer').removeClass('editable-active');
    
    $('#editBtn').show();
    $('#updateBtn').hide();
    $('#cancelBtn').hide();
    $('#removeAvatarBtn').hide();
  }

  function showEditMode() {
    $textInputs.removeAttr('readonly');
    $('#avatar').removeAttr('disabled');
    
    // Allow interactive hovering on avatar
    $('#avatarPreviewContainer').addClass('editable-active');
    
    $('#editBtn').hide();
    $('#updateBtn').show();
    $('#cancelBtn').show();
    
    updateRemoveAvatarBtnVisibility();
  }

  // Interactive Avatar Click Handler: Routes clicks to the file field when editable
  $('#avatarPreviewContainer').on('click', function () {
    if ($(this).hasClass('editable-active')) {
      $('#avatar').trigger('click');
    }
  });

  $('#editBtn').on('click', showEditMode);

  $('#cancelBtn').on('click', function () {
    $('#removeAvatarFlag').val('false');
    if (lastLoadedProfile) setProfileForm(lastLoadedProfile);
    showDisplayMode();
  });

  // Action to remove profile image (clears input, displays default, sets backend flag)
  $('#removeAvatarBtn').on('click', function () {
    $('#avatar').val(''); // Clear any newly chosen files
    $('#avatarPreview').attr('src', defaultAvatar).show();
    $('#removeAvatarFlag').val('true');
    updateRemoveAvatarBtnVisibility();
  });

  function loadProfile() {
    $.ajax({
      method: 'GET',
      url: `${url}api/v1/profile`,
      dataType: 'json',
      headers: { Authorization: `Bearer ${token}` },
      success: function (data) {
        if (data?.data) {
          lastLoadedProfile = data.data;
          setProfileForm(data.data);
        }
        showDisplayMode();
      },
      error: function (error) {
        if (error.status === 401) {
          localStorage.clear();
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
    reader.onload = (e) => {
      $('#avatarPreview').attr('src', e.target.result).show();
      $('#removeAvatarFlag').val('false'); // Clear deletion flag because a new image is loaded
      updateRemoveAvatarBtnVisibility();
    };
    reader.readAsDataURL(file);
  });

  $('#updateBtn').on('click', function (event) {
    event.preventDefault();

    if (!userId) {
      return Swal.fire({ icon: 'error', text: 'Invalid session. Please login again.' }).then(() => {
        localStorage.clear();
        window.location.href = 'login.html';
      });
    }

    // --- validation before submit ---
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
          lastLoadedProfile = data.data;
          setProfileForm(data.data);
          if (data.data.firstName || data.data.lastName) {
            const displayName = [data.data.firstName, data.data.lastName].filter(Boolean).join(' ').trim();
            if (displayName) localStorage.setItem('name', displayName);
          }
        }
        Swal.fire({ icon: 'success', text: data.message || 'Profile updated' });
        showDisplayMode();
      },
      error: function (error) {
        if (error.status === 401) {
          localStorage.clear();
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