$(document).ready(function () {
  function getCartCount() {
    return JSON.parse(localStorage.getItem('cart') || '[]').length;
  }

  function isLoggedIn() {
    return !!sessionStorage.getItem('token');
  }

  function getRole() {
    return (sessionStorage.getItem('role') || '').toLowerCase();
  }

  function getDisplayName() {
    return sessionStorage.getItem('name') || sessionStorage.getItem('email') || 'User';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function cartBadgeHtml() {
    const count = getCartCount();
    const style = count > 0 ? '' : 'style="display:none;"';
    return `Cart 🛒 <span id="itemCount" class="badge badge-danger" ${style}>${count}</span>`;
  }

  function renderNav() {
    const $nav = $('#mainNavLinks');
    if (!$nav.length) return;

    const loggedIn = isLoggedIn();
    const role = getRole();
    const safeName = escapeHtml(getDisplayName());

    // Unauthenticated: Home, Cart, Login
    if (!loggedIn) {
      $nav.html(`
        <li class="nav-item">
          <a class="nav-link" href="home.html">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="cart.html">${cartBadgeHtml()}</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="login.html">Login</a>
        </li>
      `);
      return;
    }

    // Authenticated: Home, Cart, Name dropdown
    const dashboardItem = role === 'admin'
      ? `<a class="dropdown-item" href="dashboard.html">Dashboard</a>`
      : '';

    $nav.html(`
      <li class="nav-item">
        <a class="nav-link" href="home.html">Home</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="cart.html">${cartBadgeHtml()}</a>
      </li>

      <li class="nav-item dropdown">
        <a
          class="nav-link dropdown-toggle"
          href="#"
          id="userDropdown"
          role="button"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          ${safeName}
        </a>
        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
          <a class="dropdown-item" href="profile.html">My Profile</a>
          <a class="dropdown-item" href="orders.html">My Orders</a>
          ${dashboardItem}
          <div class="dropdown-divider"></div>
          <a class="dropdown-item text-danger" href="#" id="logoutLink">Logout</a>
        </div>
      </li>
    `);

    $(document).off('click', '#logoutLink').on('click', '#logoutLink', function (e) {
      e.preventDefault();
      sessionStorage.clear();
      window.location.href = 'login.html';
    });
  }

  const target = $('#header').length ? '#header' : ($('#home').length ? '#home' : null);
  if (!target) return;

  $(target).load('header.html', function () {
    renderNav();
  });
});