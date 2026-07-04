$(document).ready(function () {
  const url = 'http://localhost:5000/';
  const PAGE_LIMIT = 12;

  let currentPage = 1;
  let isLoading = false;
  let hasMore = true;

  const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
  const saveCart = (cart) => localStorage.setItem('cart', JSON.stringify(cart));

  function renderCartBadge() {
    const cart = getCart();
    if (cart.length > 0) $('#itemCount').text(cart.length).show();
    else $('#itemCount').hide();
  }

  function ensureProductModal() {
    if ($('#productDetailsModal').length) return;

    $('body').append(`
      <div class="modal fade" id="productDetailsModal" tabindex="-1" role="dialog" aria-labelledby="productDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="productDetailsModalLabel">Product Details</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body" id="productDetailsModalBody"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" id="confirmAddToCart">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    `);
  }

  renderCartBadge();

  // ============================================================
  // Star rating helpers
  // ============================================================

  function buildStarsHtml(avgRating, totalReviews) {
    const rating = Number(avgRating) || 0;
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        starsHtml += '<i class="fas fa-star text-warning"></i>';
      } else if (rating >= i - 0.5) {
        starsHtml += '<i class="fas fa-star-half-alt text-warning"></i>';
      } else {
        starsHtml += '<i class="far fa-star text-warning"></i>';
      }
    }
    const reviewText = totalReviews > 0
      ? `<span class="text-muted small ml-1">${rating.toFixed(1)} (${totalReviews})</span>`
      : `<span class="text-muted small ml-1">No reviews yet</span>`;
    return `<div class="mb-1">${starsHtml}${reviewText}</div>`;
  }

  function buildStaticStarsHtml(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += i <= rating
        ? '<i class="fas fa-star text-warning"></i>'
        : '<i class="far fa-star text-warning"></i>';
    }
    return html;
  }

  function buildStarInputHtml(selected = 0) {
    let html = '<div class="star-input" data-rating="' + selected + '">';
    for (let i = 1; i <= 5; i++) {
      const filled = i <= selected ? 'fas' : 'far';
      html += `<i class="${filled} fa-star text-warning star-pick" data-value="${i}" style="cursor:pointer; font-size:1.3rem; margin-right:2px;"></i>`;
    }
    html += '</div>';
    return html;
  }

  function buildItemCard(item) {
    let imageArray = [];
    try {
      imageArray = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []);
    } catch (e) {
      imageArray = [];
    }

    const primaryImg = (imageArray && imageArray.length > 0) ? imageArray[0] : 'images/default-gadget.jpg';
    const itemImgSrc = `${url}${primaryImg}`;

    return `
      <div class="col-md-4 mb-4">
        <div class="card h-100 shadow-sm">
          <img class="card-img-top p-3" src="${itemImgSrc}" alt="${item.description}" style="height: 200px; object-fit: contain;">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title text-truncate">${item.description}</h5>
            ${buildStarsHtml(item.averageRating, item.totalReviews)}
            <p class="card-text text-muted mb-1"><small>Brand: ${item.brand} | Category: ${item.category}</small></p>
            <h4 class="text-primary mt-auto">₱${Number(item.sell_price).toFixed(2)}</h4>
            <button class="btn btn-outline-primary btn-block mt-3 btn-view-details" data-id="${item.item_id}">
              View Details
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // 1. Fetch and render items on the home page grid, one page at a time
  function loadItems() {
    if (isLoading || !hasMore) return;
    isLoading = true;
    $('#itemsLoading').removeClass('d-none');
    $('#itemsError').addClass('d-none');

    $.ajax({
      method: 'GET',
      url: `${url}api/v1/items?page=${currentPage}&limit=${PAGE_LIMIT}`,
      dataType: 'json',
      success: function (res) {
        if (!res.success || !res.rows) return;

        if (currentPage === 1) {
          $('#items').html('<div class="row" id="itemsRow"></div>');
          if (res.rows.length === 0) {
            $('#itemsRow').html('<div class="col-12"><p class="text-muted text-center py-5">No products found.</p></div>');
          }
        }

        const cardsHtml = res.rows.map(buildItemCard).join('');
        $('#itemsRow').append(cardsHtml);

        hasMore = res.pagination ? res.pagination.hasMore : false;
        currentPage++;

        if (!hasMore) {
          $('#itemsEnd').removeClass('d-none');
        }
      },
      error: function () {
        $('#itemsError').removeClass('d-none');
      },
      complete: function () {
        isLoading = false;
        $('#itemsLoading').addClass('d-none');
      }
    });
  }

  const SCROLL_THRESHOLD = 250;

  function isNearBottom() {
    const scrollTop = $(window).scrollTop();
    const windowHeight = $(window).height();
    const docHeight = $(document).height();
    return scrollTop + windowHeight >= docHeight - SCROLL_THRESHOLD;
  }

  $(window).on('scroll', function () {
    if (isSearchActive) return;
    if (isNearBottom()) {
      loadItems();
    }
  });

  $(document).on('click', '#itemsRetryBtn', function () {
    loadItems();
  });

  loadItems();

  $(window).on('scroll', function () {
    if ($(window).scrollTop() > 400) $('#backToTop').removeClass('d-none');
    else $('#backToTop').addClass('d-none');
  });

  $(document).on('click', '#backToTop', function () {
    $('html, body').animate({ scrollTop: 0 }, 400);
  });

  // 2. View details click handling matching dynamic image arrays
  $(document).on('click', '.btn-view-details', function () {
    const id = $(this).data('id');

    $.ajax({
      method: 'GET',
      url: `${url}api/v1/items/${id}`,
      dataType: 'json',
      success: function (res) {
        if (!res.success || !res.data) return;
        const item = res.data;

        ensureProductModal();

        let imageArray = [];
        try {
          imageArray = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []);
        } catch (e) {
          imageArray = [];
        }

        if (imageArray.length === 0) {
          imageArray.push('images/default-gadget.jpg');
        }

        let carouselIndicators = '';
        let carouselItems = '';

        imageArray.forEach((img, index) => {
          const isActive = index === 0 ? 'active' : '';
          carouselIndicators += `
            <li data-target="#itemImagesCarousel" data-slide-to="${index}" class="${isActive}"></li>
          `;
          carouselItems += `
            <div class="carousel-item ${isActive}">
              <img class="d-block w-100" src="${url}${img}" alt="Slide ${index}" style="height: 350px; object-fit: contain;">
            </div>
          `;
        });

        let specsHtml = '';
        let specsObj = item.specs;
        if (typeof specsObj === 'string') {
          try { specsObj = JSON.parse(specsObj); } catch (e) { specsObj = null; }
        }

        if (specsObj && typeof specsObj === 'object' && Object.keys(specsObj).length > 0) {
          specsHtml += '<h6 class="mt-3">Specifications:</h6><ul>';
          for (const [key, value] of Object.entries(specsObj)) {
            specsHtml += `<li><strong>${key}:</strong> ${value}</li>`;
          }
          specsHtml += '</ul>';
        }

        const stock = item.quantity;

        $('#productDetailsModalLabel').text(item.description);
        $('#productDetailsModalBody').html(`
          <input type="hidden" id="detailsItemId" value="${item.item_id}">
          <input type="hidden" id="detailsItemPrice" value="${item.sell_price}">
          
          <div class="row">
            <div class="col-md-6">
              <div id="itemImagesCarousel" class="carousel slide border rounded bg-light" data-ride="carousel">
                <ol class="carousel-indicators">
                  ${carouselIndicators}
                </ol>
                <div class="carousel-inner">
                  ${carouselItems}
                </div>
                ${imageArray.length > 1 ? `
                  <a class="carousel-control-prev" href="#itemImagesCarousel" role="button" data-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true" style="filter: invert(100%);"></span>
                    <span class="sr-only">Previous</span>
                  </a>
                  <a class="carousel-control-next" href="#itemImagesCarousel" role="button" data-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true" style="filter: invert(100%);"></span>
                    <span class="sr-only">Next</span>
                  </a>
                ` : ''}
              </div>
            </div>
            <div class="col-md-6">
              <p class="text-muted mb-1">Brand: <strong>${item.brand}</strong></p>
              <p class="text-muted mb-3">Category: <strong>${item.category}</strong></p>
              ${buildStarsHtml(item.averageRating, item.totalReviews)}
              <h3 class="text-primary mb-3">₱${Number(item.sell_price).toFixed(2)}</h3>
              <p>Available Stock: <span id="modalStockDisplay" class="font-weight-bold">${stock}</span></p>
              ${specsHtml}
              
              <div class="form-group mt-4" ${stock <= 0 ? 'style="display:none;"' : ''}>
                <label for="detailsQty">Quantity:</label>
                <input type="number" id="detailsQty" class="form-control" value="1" min="1" max="${stock}">
              </div>
              ${stock <= 0 ? '<div class="alert alert-danger p-2 text-center font-weight-bold mt-4">Out of Stock</div>' : ''}
            </div>
          </div>

          <hr class="mt-4">
          <div id="reviewsSection">
            <h5>Customer Reviews</h5>
            <div id="reviewFormContainer"></div>
            <div id="reviewsList" class="mt-3"><p class="text-muted">Loading reviews...</p></div>
          </div>
        `);

        if (stock <= 0) $('#confirmAddToCart').hide();
        else $('#confirmAddToCart').show();

        $('#productDetailsModal').modal('show');
        loadReviewsSection(item.item_id);
      },
      error: function () {
        Swal.fire({ icon: 'error', text: 'Could not fetch item specifications.' });
      }
    });
  });

  // ============================================================
  // Reviews
  // ============================================================

  function loadReviewsSection(itemId) {
    const token = sessionStorage.getItem('token');

    $.ajax({
      method: 'GET',
      url: `${url}api/v1/items/${itemId}/reviews`,
      dataType: 'json',
      success: function (res) {
        renderReviewsList(res.reviews || []);
      },
      error: function () {
        $('#reviewsList').html('<p class="text-danger">Failed to load reviews.</p>');
      }
    });

    if (!token) {
      $('#reviewFormContainer').html('<p class="text-muted"><a href="login.html">Log in</a> to write a review.</p>');
      return;
    }

    $.ajax({
      method: 'GET',
      url: `${url}api/v1/items/${itemId}/reviews/eligibility`,
      headers: { Authorization: `Bearer ${token}` },
      dataType: 'json',
      success: function (res) {
        if (res.alreadyReviewed) {
          renderMyReviewCard(itemId, res.existingReview);
        } else if (res.canReview) {
          renderReviewForm(itemId, null);
        } else {
          $('#reviewFormContainer').html('<p class="text-muted">Only customers who received this item can leave a review.</p>');
        }
      },
      error: function () {
        $('#reviewFormContainer').empty();
      }
    });
  }

  function renderReviewsList(reviews) {
    const $list = $('#reviewsList');
    if (!reviews || reviews.length === 0) {
      $list.html('<p class="text-muted">No reviews yet. Be the first to review this product!</p>');
      return;
    }

    const html = reviews.map((r) => `
      <div class="border-bottom py-2">
        <div class="d-flex justify-content-between">
          <strong>${r.reviewerName}</strong>
          <small class="text-muted">${new Date(r.createdAt).toLocaleDateString()}</small>
        </div>
        <div>${buildStaticStarsHtml(r.rating)}</div>
        ${r.comment ? `<p class="mb-0 mt-1">${$('<div>').text(r.comment).html()}</p>` : ''}
      </div>
    `).join('');

    $list.html(html);
  }

  function renderMyReviewCard(itemId, review) {
    $('#reviewFormContainer').html(`
      <div class="alert alert-light border">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <strong>Your Review</strong>
            <div>${buildStaticStarsHtml(review.rating)}</div>
            ${review.comment ? `<p class="mb-0 mt-1">${$('<div>').text(review.comment).html()}</p>` : ''}
          </div>
          <div>
            <button class="btn btn-sm btn-outline-secondary btn-edit-review" data-id="${review.reviewId}" data-rating="${review.rating}" data-comment="${$('<div>').text(review.comment || '').html()}">Edit</button>
            <button class="btn btn-sm btn-outline-danger btn-delete-review" data-id="${review.reviewId}" data-item-id="${itemId}">Delete</button>
          </div>
        </div>
      </div>
    `);
  }

  function renderReviewForm(itemId, existingReview) {
    const isEdit = !!existingReview;
    const selectedRating = existingReview ? existingReview.rating : 0;
    const existingComment = existingReview ? existingReview.comment || '' : '';

    $('#reviewFormContainer').html(`
      <div class="card card-body bg-light">
        <label class="mb-1">${isEdit ? 'Edit your review' : 'Write a review'}</label>
        ${buildStarInputHtml(selectedRating)}
        <textarea id="reviewComment" class="form-control mt-2" rows="2" placeholder="Share your thoughts about this product (optional)">${existingComment}</textarea>
        <div class="mt-2">
          <button class="btn btn-primary btn-sm" id="submitReviewBtn" data-item-id="${itemId}" data-review-id="${isEdit ? existingReview.reviewId : ''}">
            ${isEdit ? 'Update Review' : 'Submit Review'}
          </button>
          ${isEdit ? '<button class="btn btn-secondary btn-sm ml-1" id="cancelEditReviewBtn">Cancel</button>' : ''}
        </div>
      </div>
    `);
  }

  $(document).on('click', '.star-pick', function () {
    const value = $(this).data('value');
    const $container = $(this).closest('.star-input');
    $container.attr('data-rating', value);
    $container.find('.star-pick').each(function () {
      const v = $(this).data('value');
      $(this).toggleClass('fas', v <= value).toggleClass('far', v > value);
    });
  });

  $(document).on('click', '#submitReviewBtn', function () {
    const token = sessionStorage.getItem('token');
    const itemId = $(this).data('item-id');
    const reviewId = $(this).data('review-id');
    const rating = Number($('#reviewFormContainer .star-input').attr('data-rating')) || 0;
    const comment = $('#reviewComment').val().trim();

    if (!rating) {
      return Swal.fire({ icon: 'warning', text: 'Please select a star rating.' });
    }

    const isEdit = !!reviewId;
    const ajaxUrl = isEdit
      ? `${url}api/v1/reviews/${reviewId}`
      : `${url}api/v1/items/${itemId}/reviews`;
    const method = isEdit ? 'PUT' : 'POST';

    $.ajax({
      method,
      url: ajaxUrl,
      headers: { Authorization: `Bearer ${token}` },
      contentType: 'application/json',
      data: JSON.stringify({ rating, comment }),
      dataType: 'json',
      success: function () {
        Swal.fire({ icon: 'success', text: isEdit ? 'Review updated!' : 'Review submitted!', timer: 1200, showConfirmButton: false });
        loadReviewsSection(itemId);
      },
      error: function (err) {
        Swal.fire({ icon: 'error', text: err.responseJSON?.message || 'Failed to submit review.' });
      }
    });
  });

  $(document).on('click', '.btn-edit-review', function () {
    const reviewId = $(this).data('id');
    const rating = $(this).data('rating');
    const comment = $(this).data('comment');
    const itemId = $('#detailsItemId').val();
    renderReviewForm(itemId, { reviewId, rating, comment });
  });

  $(document).on('click', '#cancelEditReviewBtn', function () {
    const itemId = $('#detailsItemId').val();
    loadReviewsSection(itemId);
  });

  $(document).on('click', '.btn-delete-review', function () {
    const reviewId = $(this).data('id');
    const itemId = $(this).data('item-id');
    const token = sessionStorage.getItem('token');

    Swal.fire({
      icon: 'warning',
      title: 'Delete your review?',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      confirmButtonColor: '#e74c3c'
    }).then((result) => {
      if (!result.isConfirmed) return;

      $.ajax({
        method: 'DELETE',
        url: `${url}api/v1/reviews/${reviewId}`,
        headers: { Authorization: `Bearer ${token}` },
        dataType: 'json',
        success: function () {
          Swal.fire({ icon: 'success', text: 'Review deleted.', timer: 1000, showConfirmButton: false });
          loadReviewsSection(itemId);
        },
        error: function (err) {
          Swal.fire({ icon: 'error', text: err.responseJSON?.message || 'Failed to delete review.' });
        }
      });
    });
  });

  // 3. Confirm add item to cart layout processing logic updates
  $(document).on('click', '#confirmAddToCart', function () {
    const qty = parseInt($('#detailsQty').val() || '0', 10);
    const stock = parseInt($('#modalStockDisplay').text() || '0', 10);

    if (!qty || qty < 1) return Swal.fire({ icon: 'warning', text: 'Enter valid quantity.' });
    if (qty > stock) return Swal.fire({ icon: 'error', text: 'Quantity exceeds stock.' });

    const id = parseInt($('#detailsItemId').val(), 10);
    const description = $('#productDetailsModalLabel').text();
    const price = parseFloat($('#detailsItemPrice').val() || '0');
    
    const image = $('#productDetailsModalBody .carousel-item.active img').attr('src') || '';

    const cart = getCart();
    const existing = cart.find((x) => x.item_id === id);

    if (existing) {
      if (existing.quantity + qty > stock) {
        return Swal.fire({ icon: 'error', text: 'Total cart quantity exceeds stock.' });
      }
      existing.quantity += qty;
    } else {
      cart.push({ item_id: id, description, price, image, quantity: qty });
    }

    saveCart(cart);
    renderCartBadge();
    $('#productDetailsModal').modal('hide');
    Swal.fire({ icon: 'success', text: 'Item added to cart!', timer: 1000, showConfirmButton: false });
  });

  // ============================================================
  // 4. Search / Autocomplete
  // ============================================================

  const SEARCH_PARAM = 'search';
  const SEARCH_DROPDOWN_LIMIT = 8;
  const SEARCH_GRID_LIMIT = 48;
  let searchDebounce;
  let searchRequest;
  let isSearchActive = false;

  function closeSearchResults() {
    $('#searchResults').hide().empty();
  }

  function makeRoomForDropdown() {
    // intentionally left as a no-op
  }

  function renderFilteredGrid(rows) {
    isSearchActive = true;
    $('#itemsEnd').addClass('d-none');
    $('#itemsError').addClass('d-none');

    if (!rows || rows.length === 0) {
      $('#items').html('<div class="row" id="itemsRow"><div class="col-12"><p class="text-muted text-center py-5">No products match your search.</p></div></div>');
      return;
    }

    const cardsHtml = rows.map(buildItemCard).join('');
    $('#items').html(`<div class="row" id="itemsRow">${cardsHtml}</div>`);
  }

  function restoreDefaultGrid() {
    if (!isSearchActive) return;
    isSearchActive = false;
    currentPage = 1;
    hasMore = true;
    $('#itemsEnd').addClass('d-none');
    $('#items').empty();
    loadItems();
  }

  function renderSearchResults(rows) {
    const $results = $('#searchResults');
    $results.empty();

    if (!rows || rows.length === 0) {
      $results.append('<div class="search-item search-no-results">No products found.</div>');
      $results.show();
      makeRoomForDropdown();
      return;
    }

    rows.forEach((item) => {
      let imageArray = [];
      try {
        imageArray = typeof item.images === 'string' ? JSON.parse(item.images) : (item.images || []);
      } catch (e) {
        imageArray = [];
      }
      const primaryImg = (imageArray && imageArray.length > 0) ? imageArray[0] : 'images/default-gadget.jpg';
      const itemImgSrc = `${url}${primaryImg}`;

      const $item = $(`
        <div class="search-item" data-id="${item.item_id}">
          <img src="${itemImgSrc}" alt="${item.description}">
          <div class="search-item-info">
            <div class="search-item-name">${item.description}</div>
            <div class="search-item-price">₱${Number(item.sell_price).toFixed(2)}</div>
          </div>
        </div>
      `);

      $item.on('click', function () {
        closeSearchResults();
        $('#productSearch').val('');
        $('.btn-view-details[data-id="' + item.item_id + '"]').trigger('click');

        if ($('.btn-view-details[data-id="' + item.item_id + '"]').length === 0) {
          $.ajax({
            method: 'GET',
            url: `${url}api/v1/items/${item.item_id}`,
            dataType: 'json',
            success: function (res) {
              if (!res.success || !res.data) return;
              $(document).trigger('showItemDetails', [res.data]);
              const $fakeBtn = $(`<button class="btn-view-details d-none" data-id="${item.item_id}"></button>`).appendTo('body');
              $fakeBtn.trigger('click');
              $fakeBtn.remove();
            }
          });
        }
      });

      $results.append($item);
    });

    $results.show();
    makeRoomForDropdown();
  }

  $(document).on('input', '#productSearch', function () {
    const query = $(this).val().trim();

    clearTimeout(searchDebounce);
    if (searchRequest && searchRequest.abort) searchRequest.abort();

    $('.brand-nav-link').removeClass('active');
    $('.brand-nav-link[data-brand-id=""]').addClass('active');

    if (query.length < 2) {
      closeSearchResults();
      restoreDefaultGrid();
      return;
    }

    searchDebounce = setTimeout(function () {
      searchRequest = $.ajax({
        method: 'GET',
        url: `${url}api/v1/items`,
        data: {
          [SEARCH_PARAM]: query,
          limit: SEARCH_GRID_LIMIT
        },
        dataType: 'json',
        success: function (res) {
          if (!res.success) return closeSearchResults();
          const rows = res.rows || [];
          renderSearchResults(rows.slice(0, SEARCH_DROPDOWN_LIMIT));
          renderFilteredGrid(rows);
        },
        error: function (jqXHR, textStatus) {
          if (textStatus === 'abort') return;
          $('#searchResults')
            .html('<div class="search-item search-no-results">Search failed. Try again.</div>')
            .show();
          makeRoomForDropdown();
        }
      });
    }, 300);
  });

  $(document).on('click', function (e) {
    if (!$(e.target).closest('.search-wrapper').length) {
      closeSearchResults();
    }
  });

  $(document).on('keydown', '#productSearch', function (e) {
    if (e.key === 'Escape') closeSearchResults();
  });

  // ============================================================
  // 5. Brand Nav Bar
  // ============================================================

  function loadBrands() {
    $.ajax({
      method: 'GET',
      url: `${url}api/v1/brands`,
      dataType: 'json',
      success: function (brands) {
        if (!Array.isArray(brands) || brands.length === 0) return;

        const linksHtml = brands.map((brand) => {
          const id = brand.brand_id ?? brand.id;
          return `<li><a href="#" class="brand-nav-link" data-brand-id="${id}">${brand.name}</a></li>`;
        }).join('');

        $('#brandNavList').append(linksHtml);
      },
      error: function () {
        console.error('Failed to load brands for the nav bar.');
      }
    });
  }

  loadBrands();

  $(document).on('click', '.brand-nav-link', function (e) {
    e.preventDefault();

    const brandId = $(this).data('brand-id');

    $('.brand-nav-link').removeClass('active');
    $(this).addClass('active');

    $('#productSearch').val('');
    closeSearchResults();

    if (!brandId) {
      restoreDefaultGrid();
      return;
    }

    $.ajax({
      method: 'GET',
      url: `${url}api/v1/items`,
      data: { brand_id: brandId, limit: 100 },
      dataType: 'json',
      success: function (res) {
        if (!res.success) return;
        renderFilteredGrid(res.rows || []);
      },
      error: function () {
        Swal.fire({ icon: 'error', text: 'Could not load products for this brand.' });
      }
    });
  });
});