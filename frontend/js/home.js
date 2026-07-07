$(document).ready(function () {
  const url = 'http://localhost:5000/';
  const PAGE_LIMIT = 12;

  let currentPage = 1;
  let isLoading = false;
  let hasMore = true;
  let activeFilters = {
    brands: [],
    categories: [],
    minPrice: null,
    maxPrice: null
  };
  
  // Keep track of any existing review by the logged-in user to dynamically show edit/delete inline
  let loggedInUserReview = null;

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
              <button type="button" class="btn btn-primary px-4 font-weight-bold" id="confirmAddToCart" style="background-color: #1a2340; border: none;">Add to Cart</button>
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
        starsHtml += '<i class="far fa-star text-warning" style="opacity: 0.5;"></i>';
      }
    }
    const reviewText = totalReviews > 0
      ? `<span class="text-muted small ml-2 font-weight-bold">${rating.toFixed(1)} (${totalReviews} Reviews)</span>`
      : `<span class="text-muted small ml-2">No reviews yet</span>`;
    return `<div class="stars-container">${starsHtml}${reviewText}</div>`;
  }

  function buildStaticStarsHtml(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += i <= rating
        ? '<i class="fas fa-star text-warning mr-1"></i>'
        : '<i class="far fa-star text-warning mr-1" style="opacity: 0.4;"></i>';
    }
    return html;
  }

  function buildStarInputHtml(selected = 0) {
    let html = '<div class="star-input my-2" data-rating="' + selected + '">';
    for (let i = 1; i <= 5; i++) {
      const filled = i <= selected ? 'fas' : 'far';
      html += `<i class="${filled} fa-star text-warning star-pick" data-value="${i}" style="cursor:pointer; font-size:1.4rem; margin-right:4px;"></i>`;
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
      <div class="col-md-6 col-lg-4 mb-4 product-card-container" 
           data-brand-id="${item.brand_id || ''}" 
           data-brand-name="${(item.brand || '').toLowerCase()}"
           data-category="${(item.category || '').toLowerCase()}" 
           data-price="${item.sell_price}">
        <div class="product-card h-100 d-flex flex-column">
          <div class="product-img-wrapper">
            <img src="${itemImgSrc}" alt="${item.description}">
          </div>
          <div class="product-details d-flex flex-column flex-grow-1">
            <span class="product-category-tag">${item.category}</span>
            <h5 class="product-title" title="${item.description}">${item.description}</h5>
            ${buildStarsHtml(item.averageRating, item.totalReviews)}
            <div class="product-brand-text mb-2">Brand: <strong>${item.brand}</strong></div>
            
            <div class="mt-auto">
              <div class="mb-3">
                <span class="product-price d-block">₱${Number(item.sell_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <button class="btn btn-details-action btn-block btn-view-details" data-id="${item.item_id}">
                View Details
              </button>
            </div>
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

        // Dynamically extract categories to populate sidebar list dynamically if not populated yet
        populateCategoriesFromItems(res.rows);

        hasMore = res.pagination ? res.pagination.hasMore : false;
        currentPage++;

        if (!hasMore) {
          $('#itemsEnd').removeClass('d-none');
        }

        applySidebarFiltersClientSide();
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

  function populateCategoriesFromItems(rows) {
    if (!rows) return;
    const existingOptions = $('#categoryFilterList label.filter-checkbox-label input').map(function() {
      return $(this).val().toLowerCase();
    }).get();

    rows.forEach(item => {
      if (item.category) {
        const catLower = item.category.toLowerCase();
        if (existingOptions.indexOf(catLower) === -1) {
          existingOptions.push(catLower);
          $('#categoryFilterList').append(`
            <label class="filter-checkbox-label">
              <input type="checkbox" class="category-filter-checkbox" value="${item.category}">
              ${item.category}
            </label>
          `);
        }
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
            <li data-target="#itemImagesCarousel" data-slide-to="${index}" class="${isActive}" style="background-color: #b08d57;"></li>
          `;
          carouselItems += `
            <div class="carousel-item ${isActive}">
              <img class="d-block w-100" src="${url}${img}" alt="Slide ${index}" style="height: 420px; object-fit: cover;">
            </div>
          `;
        });

        let specsHtml = '';
        let specsObj = item.specs;
        if (typeof specsObj === 'string') {
          try { specsObj = JSON.parse(specsObj); } catch (e) { specsObj = null; }
        }

        if (specsObj && typeof specsObj === 'object' && Object.keys(specsObj).length > 0) {
          specsHtml += `
            <h6 class="mt-4 font-weight-bold text-dark border-bottom pb-2">Specifications</h6>
            <table class="specs-table">
          `;
          for (const [key, value] of Object.entries(specsObj)) {
            specsHtml += `
              <tr>
                <td>${key}</td>
                <td>${value}</td>
              </tr>
            `;
          }
          specsHtml += '</table>';
        }

        const stock = item.quantity;
        const isOutOfStock = stock <= 0;

        $('#productDetailsModalLabel').text(item.description);
        $('#productDetailsModalBody').html(`
          <input type="hidden" id="detailsItemId" value="${item.item_id}">
          <input type="hidden" id="detailsItemPrice" value="${item.sell_price}">
          
          <div class="row align-items-stretch">
            <div class="col-md-6 mb-4 mb-md-0 d-flex flex-column">
              <div id="itemImagesCarousel" class="carousel slide border rounded bg-light p-3 flex-grow-1 d-flex flex-column justify-content-center" data-ride="carousel" style="min-height: 440px;">
                <ol class="carousel-indicators">
                  ${carouselIndicators}
                </ol>
                <div class="carousel-inner carousel-inner-modal my-auto">
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
            <div class="col-md-6 d-flex flex-column">
              <div class="mb-3 d-flex flex-wrap gap-2">
                <span class="badge-premium-brand mr-2">Brand: ${item.brand}</span>
                <span class="badge-premium-category">Category: ${item.category}</span>
              </div>
              
              <h4 class="font-weight-bold text-dark mb-2">${item.description}</h4>
              ${buildStarsHtml(item.averageRating, item.totalReviews)}
              
              <div class="my-3">
                <span class="modal-item-price">₱${Number(item.sell_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              <div class="mb-3">
                ${isOutOfStock 
                  ? `<span class="stock-indicator stock-out"><i class="fas fa-times-circle"></i> Out of Stock</span>` 
                  : `<span class="stock-indicator stock-in"><i class="fas fa-check-circle"></i> In Stock (${stock} available)</span>`
                }
                <span id="modalStockDisplay" class="d-none">${stock}</span>
              </div>

              ${specsHtml}
              
              <div class="form-group mt-auto pt-3" ${isOutOfStock ? 'style="display:none;"' : ''}>
                <label for="detailsQty" class="font-weight-bold text-muted small d-block mb-2">SELECT QUANTITY:</label>
                <div class="d-flex align-items-center">
                  <button type="button" class="btn btn-outline-secondary d-flex align-items-center justify-content-center" id="qtyMinusBtn" style="width: 38px; height: 38px; font-weight: bold; font-size: 1.1rem; border-radius: 6px 0 0 6px; border-right: none;">-</button>
                  <input type="number" id="detailsQty" class="form-control text-center font-weight-bold" value="1" min="1" max="${stock}" style="width: 60px; height: 38px; border-radius: 0; margin: 0; outline: none; border-color: #6c757d; box-shadow: none;">
                  <button type="button" class="btn btn-outline-secondary d-flex align-items-center justify-content-center" id="qtyPlusBtn" style="width: 38px; height: 38px; font-weight: bold; font-size: 1.1rem; border-radius: 0 6px 6px 0; border-left: none;">+</button>
                </div>
              </div>
            </div>
          </div>

          <hr class="my-4">
          <div id="reviewsSection">
            <h5 class="font-weight-bold text-dark mb-3">Customer Reviews</h5>
            <div id="reviewFormContainer" class="mb-4"></div>
            <div id="reviewsList"><p class="text-muted">Loading reviews...</p></div>
          </div>
        `);

        if (isOutOfStock) $('#confirmAddToCart').hide();
        else $('#confirmAddToCart').show();

        $('#productDetailsModal').modal('show');
        loadReviewsSection(item.item_id);
      },
      error: function () {
        Swal.fire({ icon: 'error', text: 'Could not fetch item specifications.' });
      }
    });
  });

  // Handle Increment/Decrement Buttons inside Details Modal
  $(document).on('click', '#qtyMinusBtn', function () {
    const $input = $('#detailsQty');
    let val = parseInt($input.val() || '1', 10);
    if (val > 1) {
      $input.val(val - 1);
    }
  });

  $(document).on('click', '#qtyPlusBtn', function () {
    const $input = $('#detailsQty');
    const max = parseInt($input.attr('max') || '1', 10);
    let val = parseInt($input.val() || '1', 10);
    if (val < max) {
      $input.val(val + 1);
    }
  });

  // ============================================================
  // Reviews
  // ============================================================

  function loadReviewsSection(itemId) {
    const token = localStorage.getItem('token');
    loggedInUserReview = null; // reset state

    const fetchAllReviews = () => {
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
    };

    if (!token) {
      $('#reviewFormContainer').html(`
        <div class="alert alert-light border text-center py-3">
          <p class="mb-2 text-muted">Want to leave feedback for this product?</p>
          <a href="login.html" class="btn btn-sm px-4 text-white" style="background-color: #1a2340;">Log in</a>
        </div>
      `);
      fetchAllReviews();
      return;
    }

    // Check eligibility
    $.ajax({
      method: 'GET',
      url: `${url}api/v1/items/${itemId}/reviews/eligibility`,
      headers: { Authorization: `Bearer ${token}` },
      dataType: 'json',
      success: function (res) {
        if (res.alreadyReviewed && res.existingReview) {
          // Store existing review to intercept in list rendering
          loggedInUserReview = res.existingReview;
          $('#reviewFormContainer').empty(); // Keep top container clean & quiet
        } else if (res.canReview) {
          renderReviewForm(itemId, null);
        } else {
          $('#reviewFormContainer').html('<p class="text-muted small italic">Only customers who received this item can leave a review.</p>');
        }
        fetchAllReviews();
      },
      error: function () {
        $('#reviewFormContainer').empty();
        fetchAllReviews();
      }
    });
  }

  function renderReviewsList(reviews) {
    const $list = $('#reviewsList');
    if (!reviews || reviews.length === 0) {
      $list.html('<p class="text-muted italic">No reviews yet. Be the first to review this product!</p>');
      return;
    }

    const html = reviews.map((r) => {
      const initial = r.reviewerName ? r.reviewerName.charAt(0).toUpperCase() : '?';
      
      // Determine if this review belongs to the currently logged-in user
      const isMyReview = loggedInUserReview && 
        (r.reviewId === loggedInUserReview.reviewId || r.id === loggedInUserReview.reviewId);

      const actionButtons = isMyReview ? `
        <div class="ml-auto">
          <button class="btn btn-xs btn-link text-secondary p-0 btn-edit-review" 
                  data-id="${loggedInUserReview.reviewId}" 
                  data-rating="${loggedInUserReview.rating}" 
                  data-comment="${$('<div>').text(loggedInUserReview.comment || '').html()}">
            <i class="fas fa-edit"></i> Edit
          </button>
          <span class="text-muted mx-1">|</span>
          <button class="btn btn-xs btn-link text-danger p-0 btn-delete-review" 
                  data-id="${loggedInUserReview.reviewId}" 
                  data-item-id="${$('#detailsItemId').val()}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      ` : '';

      return `
        <div class="review-card" style="${isMyReview ? 'border-left: 4px solid #b08d57;' : ''}">
          <div class="d-flex align-items-start mb-2">
            <div class="review-avatar mr-2" style="${isMyReview ? 'background-color: #1a2340;' : ''}">${initial}</div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <strong class="text-dark">${r.reviewerName}</strong>
                  ${isMyReview ? '<span class="badge badge-secondary ml-2 font-weight-normal text-xs" style="font-size: 0.7rem; background-color: #b08d57;">Your Review</span>' : ''}
                </div>
                <small class="text-muted">${new Date(r.createdAt).toLocaleDateString()}</small>
              </div>
              <div class="d-flex align-items-center mt-1">
                <div>${buildStaticStarsHtml(r.rating)}</div>
                ${actionButtons}
              </div>
            </div>
          </div>
          ${r.comment ? `<p class="mb-0 text-secondary mt-2 pl-1">${$('<div>').text(r.comment).html()}</p>` : ''}
        </div>
      `;
    }).join('');

    $list.html(html);
  }

  function renderReviewForm(itemId, existingReview) {
    const isEdit = !!existingReview;
    const selectedRating = existingReview ? existingReview.rating : 0;
    const existingComment = existingReview ? existingReview.comment || '' : '';

    $('#reviewFormContainer').html(`
      <div class="card card-body border-light bg-light">
        <h6 class="font-weight-bold text-dark mb-1">${isEdit ? 'Edit your review' : 'Write a review'}</h6>
        ${buildStarInputHtml(selectedRating)}
        <textarea id="reviewComment" class="form-control mt-2" rows="3" placeholder="Share your experience with this product...">${existingComment}</textarea>
        <div class="mt-3">
          <button class="btn text-white btn-sm px-4" id="submitReviewBtn" data-item-id="${itemId}" data-review-id="${isEdit ? existingReview.reviewId : ''}" style="background-color: #1a2340;">
            ${isEdit ? 'Update Review' : 'Submit Review'}
          </button>
          ${isEdit ? '<button class="btn btn-outline-secondary btn-sm ml-1 px-3" id="cancelEditReviewBtn">Cancel</button>' : ''}
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
    const token = localStorage.getItem('token');
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
    
    // Smoothly scroll to top of details card and append dynamic review form inline
    renderReviewForm(itemId, { reviewId, rating, comment });
    document.getElementById('reviewFormContainer').scrollIntoView({ behavior: 'smooth' });
  });

  $(document).on('click', '#cancelEditReviewBtn', function () {
    const itemId = $('#detailsItemId').val();
    loadReviewsSection(itemId);
  });

  $(document).on('click', '.btn-delete-review', function () {
    const reviewId = $(this).data('id');
    const itemId = $(this).data('item-id');
    const token = localStorage.getItem('token');

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
    applySidebarFiltersClientSide();
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
            <div class="search-item-price">₱${Number(item.sell_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
  }

  $(document).on('input', '#productSearch', function () {
    const query = $(this).val().trim();

    clearTimeout(searchDebounce);
    if (searchRequest && searchRequest.abort) searchRequest.abort();

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
  // 5. Sidebar Brand and Category Filters Integration
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
          return `
            <label class="filter-checkbox-label">
              <input type="checkbox" class="brand-filter-checkbox" value="${id}">
              ${brand.name}
            </label>
          `;
        }).join('');

        $('#brandFilterList').append(linksHtml);
      },
      error: function () {
        console.error('Failed to load brands for filters.');
      }
    });
  }

  loadBrands();

  // Handle sidebar checkbox filters (Brands)
  $(document).on('change', '.brand-filter-checkbox', function () {
    const val = $(this).val();
    if (val === "") {
      // If "All Brands" is selected, uncheck others
      $('.brand-filter-checkbox').not(this).prop('checked', false);
    } else {
      // Uncheck "All Brands" if single brand selected
      $('.brand-filter-checkbox[value=""]').prop('checked', false);
    }

    updateActiveFiltersObject();
  });

  // Handle sidebar checkbox filters (Categories)
  $(document).on('change', '.category-filter-checkbox', function () {
    const val = $(this).val();
    if (val === "") {
      $('.category-filter-checkbox').not(this).prop('checked', false);
    } else {
      $('.category-filter-checkbox[value=""]').prop('checked', false);
    }

    updateActiveFiltersObject();
  });

  function updateActiveFiltersObject() {
    // Brands
    const brandVals = [];
    $('.brand-filter-checkbox:checked').each(function () {
      if ($(this).val() !== "") brandVals.push($(this).val());
    });
    activeFilters.brands = brandVals;

    // Categories
    const categoryVals = [];
    $('.category-filter-checkbox:checked').each(function () {
      if ($(this).val() !== "") categoryVals.push($(this).val().toLowerCase());
    });
    activeFilters.categories = categoryVals;

    // Price
    const minVal = parseFloat($('#minPriceInput').val());
    const maxVal = parseFloat($('#maxPriceInput').val());
    activeFilters.minPrice = isNaN(minVal) ? null : minVal;
    activeFilters.maxPrice = isNaN(maxVal) ? null : maxVal;
  }

  // Trigger filters application
  $(document).on('click', '#applyFiltersBtn', function () {
    updateActiveFiltersObject();
    applySidebarFiltersClientSide();
  });

  // Reset filters
  $(document).on('click', '#clearFiltersBtn', function (e) {
    e.preventDefault();
    $('.brand-filter-checkbox').prop('checked', false);
    $('.brand-filter-checkbox[value=""]').prop('checked', true);

    $('.category-filter-checkbox').prop('checked', false);
    $('.category-filter-checkbox[value=""]').prop('checked', true);

    $('#minPriceInput').val('');
    $('#maxPriceInput').val('');

    activeFilters = { brands: [], categories: [], minPrice: null, maxPrice: null };
    applySidebarFiltersClientSide();
  });

  // Apply filters logic on DOM components
  function applySidebarFiltersClientSide() {
    let matchCount = 0;

    $('.product-card-container').each(function () {
      const cardBrandId = $(this).attr('data-brand-id') || '';
      const cardCategory = ($(this).attr('data-category') || '').trim();
      const cardPrice = parseFloat($(this).attr('data-price') || '0');

      let brandMatch = activeFilters.brands.length === 0 || activeFilters.brands.includes(cardBrandId);
      let categoryMatch = activeFilters.categories.length === 0 || activeFilters.categories.includes(cardCategory);
      let priceMatch = true;

      if (activeFilters.minPrice !== null && cardPrice < activeFilters.minPrice) {
        priceMatch = false;
      }
      if (activeFilters.maxPrice !== null && cardPrice > activeFilters.maxPrice) {
        priceMatch = false;
      }

      if (brandMatch && categoryMatch && priceMatch) {
        $(this).removeClass('d-none');
        matchCount++;
      } else {
        $(this).addClass('d-none');
      }
    });

    // Handle display message if matches are zero
    $('#noProductsMatchAlert').remove();
    if (matchCount === 0 && $('.product-card-container').length > 0) {
      $('#itemsRow').append(`
        <div id="noProductsMatchAlert" class="col-12 py-5 text-center text-muted">
          <i class="fas fa-filter fa-2x mb-3 text-secondary"></i>
          <p class="font-weight-bold mb-1">No products match your active filters.</p>
          <p class="small">Try expanding your price range or switching brands/categories.</p>
        </div>
      `);
    }
  }
});