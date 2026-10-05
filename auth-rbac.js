/**
 * AI LMS Studio - Enterprise Authentication & Role Gateway (RBAC)
 * 
 * Rules:
 * - Detects active user token and tenant context from storage
 * - Never bypasses RBAC
 * - If unauthenticated -> routes to /login (or http://localhost:3000/login)
 * - If authenticated -> verifies user role and routes ONLY to authorized destination
 */

const LMS_BASE_URL = window.location.port === '3000' ? '' : 'http://localhost:3000';

class RoleGatewayManager {
  constructor() {
    this.currentUser = this.loadUser();
  }

  loadUser() {
    try {
      const userRaw = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (token && userRaw) {
        return JSON.parse(userRaw);
      }
    } catch (e) {}
    return null;
  }

  isAuthenticated() {
    return !!(localStorage.getItem('token') && this.currentUser);
  }

  getUserRole() {
    if (!this.currentUser || !this.currentUser.role) return null;
    const raw = String(this.currentUser.role).toUpperCase();
    if (raw.includes('SUPER')) return 'SUPER_ADMIN';
    if (raw.includes('ORG') || raw.includes('ADMIN')) return 'ORGANIZATION_ADMIN';
    if (raw.includes('TRAIN')) return 'TRAINER_MANAGER';
    if (raw.includes('TEAM') || raw.includes('MANAGE')) return 'TEAM_MANAGER';
    return 'LEARNER';
  }

  getAuthorizedRouteForRole(role) {
    switch (role) {
      case 'SUPER_ADMIN':
        return `${LMS_BASE_URL}/super-admin/dashboard`;
      case 'ORGANIZATION_ADMIN':
        return `${LMS_BASE_URL}/organization-admin/dashboard`;
      case 'TRAINER_MANAGER':
        return `${LMS_BASE_URL}/trainer-manager/dashboard`;
      case 'TEAM_MANAGER':
        return `${LMS_BASE_URL}/team-manager/dashboard`;
      case 'LEARNER':
      default:
        return `${LMS_BASE_URL}/learner/dashboard`;
    }
  }

  /**
   * Evaluates role card clicks
   * Target Role: 'ORGANIZATION_ADMIN' | 'TRAINER_MANAGER' | 'TEAM_MANAGER' | 'LEARNER'
   */
  handleRoleCardClick(targetRole, roleLabel) {
    if (!this.isAuthenticated()) {
      this.showToast(
        'Authentication Required',
        `Sign in to verify enterprise entitlements for ${roleLabel}. Redirecting to sign-in portal...`,
        'warning'
      );
      setTimeout(() => {
        window.location.href = `${LMS_BASE_URL}/login?roleTarget=${targetRole}`;
      }, 1000);
      return;
    }

    const currentRole = this.getUserRole();

    // Super Admin has universal access
    if (currentRole === 'SUPER_ADMIN' || currentRole === targetRole) {
      const dest = this.getAuthorizedRouteForRole(targetRole);
      this.showToast(
        'Access Granted',
        `Routing to your authorized ${roleLabel}...`,
        'success'
      );
      setTimeout(() => {
        window.location.href = dest;
      }, 600);
      return;
    }

    // Role mismatch: enforce RBAC without escalation
    const authorizedDest = this.getAuthorizedRouteForRole(currentRole);
    this.showToast(
      'RBAC Boundary Enforced',
      `Your account is provisioned as ${currentRole.replace('_', ' ')}. You are not authorized for ${roleLabel}. Directing to your authorized portal...`,
      'error'
    );
    setTimeout(() => {
      window.location.href = authorizedDest;
    }, 1500);
  }

  handlePrimarySignIn() {
    if (this.isAuthenticated()) {
      const currentRole = this.getUserRole();
      const dest = this.getAuthorizedRouteForRole(currentRole);
      this.showToast(
        'Session Active',
        `Welcome back! Directing to your ${currentRole.replace('_', ' ')} workspace...`,
        'success'
      );
      setTimeout(() => {
        window.location.href = dest;
      }, 600);
    } else {
      window.location.href = `${LMS_BASE_URL}/login`;
    }
  }

  showToast(title, message, type = 'info') {
    const toast = document.getElementById('security-toast');
    if (!toast) return;

    const titleEl = document.getElementById('toast-title');
    const msgEl = document.getElementById('toast-message');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    toast.classList.add('active');

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, 3800);
  }
}

window.roleGateway = new RoleGatewayManager();
