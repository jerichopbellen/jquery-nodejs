$(document).ready(function () {
  const getCartCount = () => JSON.parse(localStorage.getItem('cart') || '[]').length;
  const isLoggedIn = () => !!localStorage.getItem('token');
  const getRole = () => (localStorage.getItem('role') || '').toLowerCase().trim();
  const getDisplayName = () => localStorage.getItem('name') || localStorage.getItem('email') || 'User';

  // Helper to escape HTML and prevent XSS injections if names contain special characters
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ICON-ONLY nav links (Home + Cart), matching the sidebar's stroke-style SVGs.
  // title="" gives a native tooltip on hover so the icons stay identifiable
  // without needing visible text labels.
  const homeIconHtml = `
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  `;

  const cartIconHtml = `
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  `;

  const loginIconHtml = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  `;
  function cartBadgeHtml() {
    const count = getCartCount();
    const style = count > 0 ? '' : 'style="display:none;"';
    return `${cartIconHtml}<span id="itemCount" class="badge badge-danger" ${style}>${count}</span>`;
  }

  // Main rendering engine for the navigation bar content
  function renderNav() {
    const $nav = $('#mainNavLinks');
    if (!$nav.length) return; // Guard clause if navigation container isn't in the DOM yet

    // 1. View configuration for UNAUTHENTICATED users
    if (!isLoggedIn()) {
      $nav.html(`
        <li class="nav-item"><a class="nav-link" href="home.html" title="Home">${homeIconHtml}</a></li>
        <li class="nav-item"><a class="nav-link" href="cart.html" title="Cart">${cartBadgeHtml()}</a></li>
        <li class="nav-item"><a class="nav-link" href="login.html">${loginIconHtml}Login</a></li>
      `);
      return;
    }

    // 2. View configuration for AUTHENTICATED users
    const role = getRole();
    const safeName = escapeHtml(getDisplayName());

    // Build the Admin Controls cluster if the lowercased role string matches 'admin'
    let adminControls = '';
    if (role === 'admin') {
      adminControls = `
        <h6 class="dropdown-header">Admin Management</h6>
        <a class="dropdown-item" href="admin-dashboard.html"><b>Dashboard</b></a>
        <a class="dropdown-item" href="admin-items.html">Manage Items</a>
        <a class="dropdown-item" href="admin-brands.html">Manage Brands</a>
        <a class="dropdown-item" href="admin-category.html">Manage Categories</a>
        <a class="dropdown-item" href="admin-orders.html">Manage Orders</a>
        <a class="dropdown-item" href="admin-reviews.html">Manage Reviews</a>
        <a class="dropdown-item" href="admin-users.html">Manage Users</a>
        <div class="dropdown-divider"></div>
      `;
    }

    $nav.html(`
      <li class="nav-item"><a class="nav-link" href="home.html" title="Home">${homeIconHtml}</a></li>
      <li class="nav-item"><a class="nav-link" href="cart.html" title="Cart">${cartBadgeHtml()}</a></li>
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          ${safeName}
        </a>
        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
          ${adminControls}
          <h6 class="dropdown-header">User Controls</h6>
          <a class="dropdown-item" href="profile.html">My Profile</a>
          <a class="dropdown-item" href="orders.html">My Orders</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item text-danger" href="#" id="logoutLink">Logout</a>
        </div>
      </li>
    `);
  }

  // Handle Logout Event delegation safely across the document
  $(document).on('click', '#logoutLink', function (e) {
    e.preventDefault();
    localStorage.clear();
    window.location.href = 'login.html';
  });

  // Automatically determine the correct structural wrapper present on the current layout
  const target = $('#header').length ? '#header' : ($('#home').length ? '#home' : null);
  
  if (target) {
    $(target).load('header.html', function (response, status, xhr) {
      if (status === "error") {
        console.error("Failed to load header.html:", xhr.status, xhr.statusText);
      } else {
        renderNav();
      }
    });
  }
});