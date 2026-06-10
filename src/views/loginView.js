import { navigate } from "../router/router";
import { qs } from "../utils/dom";
import { login } from "../auth/auth";

export function renderLoginPage(container) {
    container.innerHTML = /*html*/`
    <div class="login-page">
      <div class="login-brand">
        <div class="login-brand-logo">Reservations<span>Man</span></div>
        <h1>Monitor your<br><em>reservations</em><br>with full clarity.</h1>
        <p>Internal operations hub for teams that demand absolute visibility, and rapid execution.</p>
      </div>

      <div class="login-form-side">
        <form class="login-form-box" id="login-form">
          <h2>Sign in</h2>
          <p>Enter your credentials to access the dashboard.</p>
          <div class="login-error hidden" id="login-error"></div>

          <div class="form-group">
            <label class="form-label">Email address</label>
            <input class="form-input" type="email" id="login-email"
              placeholder="you@company.com" autocomplete="email" />
            <span class="form-error" id="err-email"></span>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input class="form-input" type="password" id="login-password"
              placeholder="•••••" autocomplete="current-password" />
            <span class="form-error" id="err-password"></span>
          </div>

          <button class="btn btn-accent" style="width:100%;justify-content:center;margin-top:8px" id="login-btn">
            Sign in →
          </button>

          <div class="login-hint">
            <div class="login-hint-title">Available accounts</div>
            <div class="login-hint-item">
              <strong>Admin:</strong><br>admin@test.com / A123456
            </div>
            <div class="login-hint-item" style="margin-top:4px">
              <strong>Users:</strong><br>user@test.com / A123456<br>user2@test.com / A123456
            </div>
          </div>
        </form>
      </div>
    </div>
  `;

    const loginForm         = qs("#login-form", container);
    const emailInput        = qs('#login-email', container);
    const passwordInput     = qs('#login-password', container);
    const loginBtn          = qs('#login-btn', container);

    async function handleLogin() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        let valid = true;

        if (!email) {
            valid = false;            
        };

        if(!password) {
            valid = false;
        };

        if (!valid) return;

        loginBtn.disabled = true;
        loginBtn.textContent = "Signing in..."

        try {
            await login(email, password);
            navigate('/home');
        } catch (err) {
            loginBtn.disabled = false;
            loginBtn.textContent = "Login";
            console.error(err)
        };
    };

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });
};