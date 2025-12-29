// PromptPal Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const statusBadge = document.getElementById('status-badge');
  const statusText = document.getElementById('status-text');
  const userEmailEl = document.getElementById('user-email');
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');
  const loggedOutView = document.getElementById('logged-out-view');
  const loggedInView = document.getElementById('logged-in-view');
  const tokenInput = document.getElementById('token-input');
  const connectBtn = document.getElementById('connect-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const openAppBtn = document.getElementById('open-app-btn');
  const settingsToggle = document.getElementById('settings-toggle');
  const settingsSection = document.getElementById('settings-section');
  const apiUrlInput = document.getElementById('api-url');
  const saveSettingsBtn = document.getElementById('save-settings-btn');

  // Load current settings
  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        resolve(response);
      });
    });
  }

  // Update UI based on auth state
  function updateUI(settings) {
    apiUrlInput.value = settings.apiUrl || 'http://localhost:5001';

    if (settings.authToken) {
      statusBadge.classList.remove('disconnected');
      statusBadge.classList.add('connected');
      statusText.textContent = 'Connected';
      userEmailEl.textContent = settings.userEmail || 'Connected to PromptPal';
      loggedOutView.classList.remove('active');
      loggedInView.classList.add('active');
    } else {
      statusBadge.classList.remove('connected');
      statusBadge.classList.add('disconnected');
      statusText.textContent = 'Not connected';
      userEmailEl.textContent = '';
      loggedInView.classList.remove('active');
      loggedOutView.classList.add('active');
    }
  }

  // Show error message
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 5000);
  }

  // Show success message
  function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);
  }

  // Connect with token
  connectBtn.addEventListener('click', async () => {
    const token = tokenInput.value.trim();
    const apiUrl = apiUrlInput.value.trim() || 'http://localhost:5001';

    if (!token) {
      showError('Please enter your API token');
      return;
    }

    connectBtn.textContent = 'Connecting...';
    connectBtn.disabled = true;

    // Validate token
    chrome.runtime.sendMessage({
      action: 'validateToken',
      apiUrl: apiUrl,
      token: token
    }, (response) => {
      if (response.valid) {
        // Save settings
        chrome.runtime.sendMessage({
          action: 'saveSettings',
          apiUrl: apiUrl,
          authToken: token,
          userEmail: 'Connected'
        }, () => {
          showSuccess('Connected successfully!');
          tokenInput.value = '';
          loadSettings().then(updateUI);
        });
      } else {
        showError('Invalid token. Please check and try again.');
      }
      connectBtn.textContent = 'Connect';
      connectBtn.disabled = false;
    });
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'logout' }, () => {
      showSuccess('Disconnected');
      loadSettings().then(updateUI);
    });
  });

  // Open PromptPal app
  openAppBtn.addEventListener('click', async () => {
    const settings = await loadSettings();
    const appUrl = settings.apiUrl.replace(':3001', ':5173'); // Dev server
    chrome.tabs.create({ url: appUrl });
  });

  // Toggle settings
  settingsToggle.addEventListener('click', () => {
    settingsToggle.classList.toggle('open');
    settingsSection.classList.toggle('open');
  });

  // Save settings
  saveSettingsBtn.addEventListener('click', async () => {
    const settings = await loadSettings();
    chrome.runtime.sendMessage({
      action: 'saveSettings',
      apiUrl: apiUrlInput.value.trim(),
      authToken: settings.authToken,
      userEmail: settings.userEmail
    }, () => {
      showSuccess('Settings saved');
    });
  });

  // Initialize
  const settings = await loadSettings();
  updateUI(settings);
});
