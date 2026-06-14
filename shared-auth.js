
// ═══════════════════════════════════════
// SHOPBOX SHARED AUTH — v2
// ═══════════════════════════════════════
const SUPABASE_URL = 'https://muyyqqgubkfklqczqbgm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11eXlxcWd1Ymtma2xxY3pxYmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MTgyMDksImV4cCI6MjA5NDQ5NDIwOX0.YQs_H8iMPwEr2pSVbGOwOS4S5Q0aQaBwfxnQy1achdk';
const ADMIN_EMAIL = 'foyegig@gmail.com';

// Pages that require login
const PROTECTED_PAGES = [
  'shopbox-account.html',
  'shopbox-seller-dashboard.html',
  'shopbox-product-upload.html',
  'shopbox-checkout.html',
  'shopbox-notifications.html',
];

// Admin only pages
const ADMIN_PAGES = ['shopbox-admin.html'];

const currentPage = window.location.pathname.split('/').pop() || 'index.html';

window.addEventListener('DOMContentLoaded', async () => {
  if(typeof supabase === 'undefined') return;
  const { createClient } = supabase;
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data: { session } } = await sb.auth.getSession();

  // ── PROTECTED PAGE CHECK ──
  if(PROTECTED_PAGES.includes(currentPage) && !session){
    sessionStorage.setItem('redirect_after_login', window.location.href);
    alert('Please login to access this page');
    window.location = 'index.html';
    return;
  }

  // ── ADMIN CHECK ──
  if(ADMIN_PAGES.includes(currentPage)){
    if(!session){
      alert('Admin access only. Please login first.');
      window.location = 'index.html';
      return;
    }
    if(session.user.email !== ADMIN_EMAIL){
      alert('Access denied. Admin only.');
      window.location = 'index.html';
      return;
    }
  }

  // ── SELLER AGREEMENT — must be logged in to submit ──
  // (They can browse the form but submit button checks login)
  if(currentPage === 'shopbox-seller-agreement.html' && !session){
    // Don't redirect — let them read. 
    // But disable submit and show login prompt on submit
    window._sellerNotLoggedIn = true;
  }

  // ── UPDATE ALL NAVBARS ──
  updateNavbar(session);
});

function updateNavbar(session){
  if(!session?.user) return;

  const u = session.user;
  const name = u.user_metadata?.full_name || u.email.split('@')[0];
  const initial = name.charAt(0).toUpperCase();

  // Desktop auth area
  const dAuth = document.getElementById('dAuth');
  if(dAuth){
    dAuth.innerHTML = `
      <div onclick="window.location='shopbox-account.html'" style="display:flex;align-items:center;gap:8px;padding:6px 14px 6px 8px;background:#161616;border:1.5px solid rgba(245,166,35,.32);border-radius:999px;cursor:pointer;">
        <div style="width:30px;height:30px;border-radius:50%;background:rgba(245,166,35,.15);border:1.5px solid rgba(245,166,35,.4);display:flex;align-items:center;justify-content:center;color:#F5A623;font-size:13px;font-weight:800;font-family:'Syne',sans-serif;">${initial}</div>
        <span style="font-size:13px;font-weight:600;max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</span>
        <i class="fa-solid fa-chevron-down" style="font-size:10px;color:#555;"></i>
      </div>`;
  }

  // Mobile drawer
  const drName = document.getElementById('drName');
  const drSub  = document.getElementById('drSub');
  const drFooter = document.getElementById('drFooter');
  if(drName)  drName.textContent = `Hello, ${name} 👋`;
  if(drSub)   drSub.textContent  = u.email;
  if(drFooter) drFooter.innerHTML = `
    <a href="shopbox-account.html" style="width:100%;height:44px;border-radius:999px;background:rgba(245,166,35,.12);border:1.5px solid rgba(245,166,35,.32);color:#F5A623;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;margin-bottom:8px;"><i class="fa-regular fa-user"></i> My Account</a>
    <button onclick="sbLogout()" style="width:100%;height:44px;border-radius:999px;background:rgba(239,68,68,.1);border:1.5px solid rgba(239,68,68,.2);color:#EF4444;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;border:none;"><i class="fa-solid fa-arrow-right-from-bracket"></i> Log Out</button>`;
}

async function sbLogout(){
  if(typeof supabase === 'undefined') return;
  const { createClient } = supabase;
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  await sb.auth.signOut();
  window.location = 'index.html';
}
