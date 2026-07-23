// ═══════════════════════════════════════════════════════════════════
// Petrus FOH — Admin-Only Page Guard
// ═══════════════════════════════════════════════════════════════════
// Pages with this guard require admin access.
// Non-admin users see a "coming soon" message.

(function() {
  document.documentElement.style.opacity = '0';
  document.documentElement.style.transition = 'opacity 0.3s ease';

  auth.onAuthStateChanged(async function(user) {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }

    const admin = await isAdmin(user);

    if (admin) {
      // Admin — show full page
      document.documentElement.style.opacity = '1';
      logAccess(user, 'page_view');

      // Add logout to top-bar
      var topBar = document.querySelector('.top-bar');
      if (topBar) {
        var logoutLink = document.createElement('a');
        logoutLink.textContent = 'Logout';
        logoutLink.href = '#';
        logoutLink.style.cssText = 'color:#b89650;text-decoration:none;font-size:11px;letter-spacing:1px;text-transform:uppercase;opacity:0.7;cursor:pointer';
        logoutLink.addEventListener('click', function(e) {
          e.preventDefault();
          petrusLogout().then(function() {
            window.location.href = 'index.html';
          });
        });
        var emptySpan = topBar.querySelector('span:last-child');
        if (emptySpan && !emptySpan.textContent.trim()) {
          topBar.replaceChild(logoutLink, emptySpan);
        }
      }
    } else {
      // Not admin — show "coming soon" message
      document.documentElement.style.opacity = '1';
      document.body.innerHTML = ''
        + '<div class="top-bar" style="background:#2d0a0a;padding:12px 24px;display:flex;align-items:center;justify-content:space-between">'
        + '<a href="index.html" style="color:#b89650;text-decoration:none;font-size:12px;letter-spacing:1px;text-transform:uppercase">&larr; Back</a>'
        + '<h2 style="font-family:Cormorant Garamond,serif;color:#fff;font-size:18px;margin:0">Petrus</h2>'
        + '<span></span>'
        + '</div>'
        + '<div style="max-width:500px;margin:80px auto;padding:0 20px;text-align:center">'
        + '<h1 style="font-family:Cormorant Garamond,serif;font-size:32px;color:#5c1a1a;margin-bottom:16px">Access Restricted</h1>'
        + '<p style="font-size:14px;color:#888;line-height:1.6">Apologies, you don\'t have access to this section. Contact Fiorella.</p>'
        + '</div>';
    }
  });
})();
