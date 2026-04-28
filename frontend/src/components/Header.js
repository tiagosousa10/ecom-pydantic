import { state } from '../services/state.js';

export function renderHeader() {
  const { cartItemCount } = state;
  return `
  <header class="header">
    <div class="container header-inner">
      <div class="header-left">
        <button class="menu-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <h1 class="header-logo" style="cursor: pointer;" onclick="window.location.hash='#/'">LUXE</h1>
        <nav class="nav">
          <button class="nav-link" onclick="handleCatClick('')">All</button>
          <button class="nav-link" onclick="handleCatClick('men')">Men</button>
          <button class="nav-link" onclick="handleCatClick('women')">Women</button>
          <button class="nav-link" onclick="handleCatClick('kids')">Kids</button>
        </nav>
      </div>
      <div class="header-right">
        <a href="#/add-products" class="btn btn-primary" style="margin-right: 15px;">Add Products</a>
        <button class="icon-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </button>
        <button id="cartBtn" class="icon-btn relative" onclick="window.location.hash='#/cart'">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          ${cartItemCount > 0 ? `<span class="cart-badge">${cartItemCount}</span>` : ''}
        </button>
      </div>
    </div>
  </header>
`;
}
