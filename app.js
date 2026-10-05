/**
 * AI LMS Studio - Portal Application Controller
 * Features:
 * - Mobile Navigation Drawer & Backdrop Handling
 * - Scroll Reveal & Stagger Animation Observer
 * - Navbar Scroll Elevation
 * - Enterprise RBAC Role Gateways
 * - Interactive Encrypted Offline Learner Simulation Demo
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize UI enhancements (Mobile Nav, Scroll Animations, Navbar elevation)
  initNavbarScrollEffect();
  initMobileNavigation();
  initScrollReveal();

  // 2. Update UI with existing session status if available
  updateSessionIndicator();

  // 3. Initialize interactive offline learner demo
  await initOfflineDemo();

  // 4. Role Card Click Listeners
  setupRoleButtons();
});

/**
 * Navbar Elevation on Scroll
 */
function initNavbarScrollEffect() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Mobile Navigation Drawer Management
 */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const closeBtn = document.getElementById('mobile-menu-close');
  const drawer = document.getElementById('mobile-nav-drawer');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-item');
  const mobileSignInBtn = document.getElementById('mobile-signin-btn');

  if (!toggleBtn || !drawer || !backdrop) return;

  const openDrawer = () => {
    toggleBtn.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    drawer.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('active');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('mobile-nav-open');
  };

  const closeDrawer = () => {
    toggleBtn.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('active');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('active');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('mobile-nav-open');
  };

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (drawer.classList.contains('active')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  backdrop.addEventListener('click', closeDrawer);

  // Close drawer on clicking navigation links
  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Mobile Sign In button click
  if (mobileSignInBtn) {
    mobileSignInBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeDrawer();
      if (window.roleGateway) {
        window.roleGateway.handlePrimarySignIn();
      }
    });
  }

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeDrawer();
    }
  });
}

/**
 * Viewport Scroll Reveal & Stagger Animation System
 */
function initScrollReveal() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll('[data-reveal], [data-stagger]');

  if (isReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12,
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/**
 * User Session Indicator & Authentication Status
 */
function updateSessionIndicator() {
  const statusEl = document.getElementById('user-session-status');
  const mobileStatusEl = document.getElementById('mobile-user-status');
  const signInBtn = document.getElementById('nav-signin-btn');
  const mobileSignInBtn = document.getElementById('mobile-signin-btn');
  const heroSignInBtn = document.getElementById('hero-signin-btn');

  if (window.roleGateway && window.roleGateway.isAuthenticated()) {
    const role = window.roleGateway.getUserRole();
    const statusText = `<span class="status-dot"></span> Authenticated: ${role.replace('_', ' ')}`;
    
    if (statusEl) {
      statusEl.innerHTML = statusText;
      statusEl.style.display = 'inline-flex';
    }
    if (mobileStatusEl) {
      mobileStatusEl.innerHTML = statusText;
      mobileStatusEl.style.display = 'inline-flex';
    }
    if (signInBtn) signInBtn.textContent = 'Go to Portal';
    if (mobileSignInBtn) mobileSignInBtn.textContent = 'Go to Portal';
    if (heroSignInBtn) {
      const span = heroSignInBtn.querySelector('span');
      if (span) span.textContent = 'Enter My Portal';
      else heroSignInBtn.textContent = 'Enter My Portal';
    }
  } else {
    const guestText = `<span class="status-dot" style="background: #94a3b8; box-shadow: none;"></span> Public Guest (Unauthenticated)`;
    if (statusEl) {
      statusEl.innerHTML = guestText;
      statusEl.style.display = 'inline-flex';
    }
    if (mobileStatusEl) {
      mobileStatusEl.innerHTML = guestText;
      mobileStatusEl.style.display = 'inline-flex';
    }
  }
}

function setupRoleButtons() {
  // Nav & Hero Sign In
  const signInBtn = document.getElementById('nav-signin-btn');
  if (signInBtn) {
    signInBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.roleGateway.handlePrimarySignIn();
    });
  }

  const heroSignInBtn = document.getElementById('hero-signin-btn');
  if (heroSignInBtn) {
    heroSignInBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.roleGateway.handlePrimarySignIn();
    });
  }

  // Four Role Gateway Cards
  const roleCards = [
    { id: 'btn-role-orgadmin', role: 'ORGANIZATION_ADMIN', label: 'Organization Admin Portal' },
    { id: 'btn-role-trainer', role: 'TRAINER_MANAGER', label: 'Trainer Manager Portal' },
    { id: 'btn-role-manager', role: 'TEAM_MANAGER', label: 'Team Manager Portal' },
    { id: 'btn-role-learner', role: 'LEARNER', label: 'Learner Portal' },
  ];

  roleCards.forEach(item => {
    const btn = document.getElementById(item.id);
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.roleGateway.handleRoleCardClick(item.role, item.label);
      });
    }
  });
}

/**
 * Interactive Offline Learner Simulation
 */
const SAMPLE_COURSE_ID = 'crs-sales-7045';
const SAMPLE_LESSON_ID = 'lsn-discovery-101';
const SAMPLE_LESSON_TITLE = 'Consultative Selling & Discovery Call Simulation';

let isSimulatedOffline = false;

async function initOfflineDemo() {
  const downloadBtn = document.getElementById('demo-download-btn');
  const removeBtn = document.getElementById('demo-remove-btn');
  const playBtn = document.getElementById('demo-play-btn');
  const networkToggle = document.getElementById('network-toggle');

  if (networkToggle) {
    networkToggle.addEventListener('click', () => {
      isSimulatedOffline = !isSimulatedOffline;
      if (isSimulatedOffline) {
        networkToggle.classList.add('sim-offline');
        networkToggle.innerHTML = `<span>⚠️ Simulated: Offline Mode</span>`;
        window.roleGateway.showToast('Network Simulation', 'Switched to Simulated Offline Mode. Only cached encrypted courses are playable.', 'info');
      } else {
        networkToggle.classList.remove('sim-offline');
        networkToggle.innerHTML = `<span>🌐 Network: Online</span>`;
        window.roleGateway.showToast('Network Simulation', 'Restored Online Network. Re-authorization and cloud synchronization active.', 'info');
      }
      refreshDemoState();
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', handleDownloadAction);
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', handleRemoveAction);
  }

  if (playBtn) {
    playBtn.addEventListener('click', handlePlaybackAction);
  }

  await refreshDemoState();
}

async function refreshDemoState() {
  const isCached = await window.offlineStorageManager.isAvailableOffline(SAMPLE_COURSE_ID, SAMPLE_LESSON_ID);
  const record = await window.offlineStorageManager.getOfflineRecord(SAMPLE_COURSE_ID, SAMPLE_LESSON_ID);

  const downloadBtn = document.getElementById('demo-download-btn');
  const removeBtn = document.getElementById('demo-remove-btn');
  const statusBadge = document.getElementById('demo-status-badge');
  const progressContainer = document.getElementById('demo-progress-container');
  const sizeVal = document.getElementById('demo-size-val');
  const authVal = document.getElementById('demo-auth-val');

  if (progressContainer) progressContainer.style.display = 'none';

  if (isCached && record) {
    if (downloadBtn) {
      downloadBtn.innerHTML = `✓ Available Offline`;
      downloadBtn.className = 'btn btn-secondary btn-sm demo-action-btn';
      downloadBtn.disabled = true;
    }
    if (removeBtn) removeBtn.style.display = 'inline-flex';
    if (statusBadge) {
      statusBadge.textContent = 'Encrypted & Cached Offline';
      statusBadge.style.color = '#10b981';
    }
    if (sizeVal) sizeVal.textContent = `${(record.sizeBytes / (1024 * 1024)).toFixed(1)} MB (AES-GCM-256)`;
    if (authVal) {
      const d = new Date(record.lastAuthorizedAt);
      authVal.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Valid 14d)';
    }
  } else {
    if (downloadBtn) {
      downloadBtn.innerHTML = `Download for Offline (18.4 MB)`;
      downloadBtn.className = 'btn btn-primary btn-sm demo-action-btn';
      downloadBtn.disabled = false;
    }
    if (removeBtn) removeBtn.style.display = 'none';
    if (statusBadge) {
      statusBadge.textContent = 'Not Downloaded';
      statusBadge.style.color = '#94a3b8';
    }
    if (sizeVal) sizeVal.textContent = '--';
    if (authVal) authVal.textContent = 'Unverified';
  }
}

async function handleDownloadAction() {
  const downloadBtn = document.getElementById('demo-download-btn');
  const progressContainer = document.getElementById('demo-progress-container');
  const progressFill = document.getElementById('demo-progress-bar');
  const progressPct = document.getElementById('demo-progress-pct');

  if (isSimulatedOffline) {
    window.roleGateway.showToast('Network Error', 'Cannot initiate new course downloads while device is offline.', 'error');
    return;
  }

  if (downloadBtn) {
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Authorizing & Encrypting...';
  }
  if (progressContainer) progressContainer.style.display = 'block';

  try {
    await window.offlineStorageManager.downloadAndEncryptMedia(
      SAMPLE_COURSE_ID,
      SAMPLE_LESSON_ID,
      SAMPLE_LESSON_TITLE,
      '/sample-video.mp4',
      (pct, downloadedBytes) => {
        if (progressFill) progressFill.style.width = `${pct}%`;
        if (progressPct) progressPct.textContent = `${pct}% (${(downloadedBytes / (1024 * 1024)).toFixed(1)} MB)`;
      }
    );

    window.roleGateway.showToast('Download Complete', 'Course video successfully encrypted with AES-GCM and stored in IndexedDB.', 'success');
  } catch (err) {
    window.roleGateway.showToast('Download Failed', err.message, 'error');
  } finally {
    await refreshDemoState();
  }
}

async function handleRemoveAction() {
  try {
    await window.offlineStorageManager.removeDownload(SAMPLE_COURSE_ID, SAMPLE_LESSON_ID);
    window.offlineStorageManager.revokeBlobUrls();
    const videoPlayer = document.getElementById('video-player');
    const videoPlaceholder = document.getElementById('video-placeholder');
    if (videoPlayer) {
      videoPlayer.pause();
      videoPlayer.src = '';
      videoPlayer.style.display = 'none';
    }
    if (videoPlaceholder) videoPlaceholder.style.display = 'flex';

    window.roleGateway.showToast('Removed', 'Offline cached video package safely purged from device.', 'info');
  } catch (e) {
    window.roleGateway.showToast('Error', 'Failed to remove offline package.', 'error');
  }
  await refreshDemoState();
}

async function handlePlaybackAction() {
  const isCached = await window.offlineStorageManager.isAvailableOffline(SAMPLE_COURSE_ID, SAMPLE_LESSON_ID);
  const videoPlayer = document.getElementById('video-player');
  const videoPlaceholder = document.getElementById('video-placeholder');

  if (isSimulatedOffline && !isCached) {
    window.roleGateway.showToast('Offline Error', 'Content not cached offline. Connect online to authorize and download.', 'error');
    return;
  }

  try {
    if (isCached) {
      // Decrypt from IndexedDB
      const blobUrl = await window.offlineStorageManager.getDecryptedPlaybackUrl(SAMPLE_COURSE_ID, SAMPLE_LESSON_ID);
      if (videoPlayer && videoPlaceholder) {
        videoPlaceholder.style.display = 'none';
        videoPlayer.style.display = 'block';
        videoPlayer.src = blobUrl;
        videoPlayer.play().catch(() => {});
      }
      window.roleGateway.showToast('Protected Playback', 'Streaming decrypted video securely from device storage.', 'success');
    } else {
      // Stream online with short-lived token
      if (videoPlayer && videoPlaceholder) {
        videoPlaceholder.style.display = 'none';
        videoPlayer.style.display = 'block';
        // HTML5 sample video with context menu & download disabled
        videoPlayer.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
        videoPlayer.play().catch(() => {});
      }
      window.roleGateway.showToast('Protected Playback', 'Authorized online stream active (15-min short-lived token).', 'success');
    }
  } catch (err) {
    window.roleGateway.showToast('Playback Error', err.message, 'error');
  }
}
