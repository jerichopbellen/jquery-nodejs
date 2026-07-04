$(document).ready(function () {
  const url = 'http://localhost:5000/';
  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');

  if (!token || role !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
  }

  function starsHtml(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += i <= rating
        ? '<i class="fas fa-star text-warning"></i>'
        : '<i class="far fa-star text-warning"></i>';
    }
    return html;
  }

  const reviewsTable = $('#reviewsTable').DataTable({
    ajax: {
      url: `${url}api/v1/admin/reviews`,
      headers: { Authorization: `Bearer ${token}` },
      dataSrc: 'rows',
      error: function (xhr) {
        if (xhr.status === 401) {
          Swal.fire({ icon: 'error', text: 'Session expired. Please log in again.' });
          sessionStorage.clear();
          setTimeout(() => (window.location.href = 'login.html'), 1200);
        } else if (xhr.status === 403) {
          Swal.fire({ icon: 'error', text: 'You do not have access to this page.' });
        } else {
          Swal.fire({ icon: 'error', text: 'Failed to load reviews.' });
        }
      }
    },
    columns: [
      { data: 'reviewId' },
      { data: 'itemName', defaultContent: '' },
      { data: 'reviewerName', defaultContent: '' },
      { data: 'reviewerEmail', defaultContent: '' },
      { data: 'rating', render: (data) => starsHtml(data) },
      {
        data: 'comment',
        defaultContent: '<span class="text-muted">No comment</span>',
        render: (data) => data ? $('<div>').text(data).html() : '<span class="text-muted">No comment</span>'
      },
      { data: 'createdAt', render: (data) => formatDate(data) },
      {
        data: null,
        orderable: false,
        render: () => `<button class="btn btn-sm btn-danger deleteReviewBtn" title="Delete"><i class="fas fa-trash"></i></button>`
      }
    ]
  });

  $('#reviewsTable tbody').on('click', '.deleteReviewBtn', function () {
    const rowData = reviewsTable.row($(this).closest('tr')).data();
    if (!rowData) return;

    Swal.fire({
      icon: 'warning',
      title: 'Delete this review?',
      text: `This review by ${rowData.reviewerName} will be permanently deleted.`,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#e74c3c'
    }).then((result) => {
      if (!result.isConfirmed) return;

      $.ajax({
        method: 'DELETE',
        url: `${url}api/v1/admin/reviews/${rowData.reviewId}`,
        headers: { Authorization: `Bearer ${token}` },
        dataType: 'json',
        success: function (data) {
          Swal.fire({
            icon: 'success',
            text: data?.message || 'Review deleted.',
            timer: 1000,
            showConfirmButton: false
          });
          reviewsTable.ajax.reload(null, false);
        },
        error: function (error) {
          Swal.fire({ icon: 'error', text: error.responseJSON?.message || 'Failed to delete review.' });
        }
      });
    });
  });
});