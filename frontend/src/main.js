import { router } from './router.js';

// Initialize application - listen for hash changes to navigate pages
window.addEventListener('hashchange', router);

window.addEventListener('DOMContentLoaded', () => {
  // Kick off the router immediately on page load
  router();
});