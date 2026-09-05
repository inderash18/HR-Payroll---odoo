import { createIcons, Shield, Mail, Lock, Eye, LogIn, CheckSquare } from 'lucide';
import './style.css';

const app = document.getElementById('app');

if (app) {
  app.innerHTML = `
    <div class="login-section">
      <div class="brand">
        <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <div class="brand-text">
          <h2>PeoplePay360</h2>
          <p>HR & Payroll Management</p>
        </div>
      </div>

      <div class="welcome-text">
        <h1>Welcome Back</h1>
        <p>Sign in to continue to your workspace.</p>
      </div>

      <form class="login-form" id="login-form">
        <div class="form-group">
          <label>Work Email</label>
          <div class="input-wrapper">
            <i data-lucide="mail" class="left-icon"></i>
            <input type="email" placeholder="name@company.com" required>
          </div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="input-wrapper">
            <i data-lucide="lock" class="left-icon"></i>
            <input type="password" placeholder="••••••••" required id="password-input">
            <i data-lucide="eye" class="right-icon" id="toggle-password"></i>
          </div>
        </div>

        <div class="form-options" style="justify-content: flex-end;">
          <a href="#" class="forgot-password">Forgot password?</a>
        </div>

        <button type="submit" class="btn-primary">
          <i data-lucide="log-in"></i>
          Sign In
        </button>
      </form>

      <div class="signup-link">
        Accounts are created by an administrator.
      </div>

      <div class="security-badge" style="margin-top: 1rem; text-align: center;">
        After sign-in, show only the modules and actions allowed by the user's assigned role.
      </div>
    </div>

    <div class="image-section">
      <div class="image-overlay-text">
        <h2>Empowering People.</h2>
        <h2 class="highlight">Simplifying Payroll.</h2>
        <p>All-in-one HR & Payroll solution<br>for modern organizations.</p>
      </div>
    </div>
  `;

  // Initialize Lucide icons
  createIcons({
    icons: {
      Shield,
      Mail,
      Lock,
      Eye,
      LogIn,
      CheckSquare
    }
  });

  // Password toggle
  const togglePassword = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password-input') as HTMLInputElement;

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
    });
  }

  // Handle form submit to prevent reload
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // add login logic here
    });
  }
}
