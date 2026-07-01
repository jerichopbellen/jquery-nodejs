$(document).ready(function () {
  const getCartCount = () => JSON.parse(localStorage.getItem('cart') || '[]').length;
  const isLoggedIn = () => !!sessionStorage.getItem('token');
  const getRole = () => (sessionStorage.getItem('role') || '').toLowerCase().trim();
  const getDisplayName = () => sessionStorage.getItem('name') || sessionStorage.getItem('email') || 'User';

  // Helper to escape HTML and prevent XSS injections if names contain special characters
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Generates the shopping cart item badge dynamically
  function cartBadgeHtml() {
    const count = getCartCount();
    const style = count > 0 ? '' : 'style="display:none;"';
    return `Cart 🛒 <span id="itemCount" class="badge badge-danger" ${style}>${count}</span>`;
  }

  // Main rendering engine for the navigation bar content
  function renderNav() {
    const $nav = $('#mainNavLinks');
    if (!$nav.length) return; // Guard clause if navigation container isn't in the DOM yet

    // 1. View configuration for UNAUTHENTICATED users
    if (!isLoggedIn()) {
      $nav.html(`
        <li class="nav-item"><a class="nav-link" href="home.html">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="cart.html">${cartBadgeHtml()}</a></li>
        <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>
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
        <a class="dropdown-item" href="admin-users.html">Manage Users</a>
        <div class="dropdown-divider"></div>
      `;
    }

    $nav.html(`
      <li class="nav-item"><a class="nav-link" href="home.html">Home</a></li>
      <li class="nav-item"><a class="nav-link" href="cart.html">${cartBadgeHtml()}</a></li>
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
    sessionStorage.clear();
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