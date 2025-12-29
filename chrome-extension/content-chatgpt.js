// PromptPal Content Script for ChatGPT
(function() {
  'use strict';

  // Avoid multiple injections
  if (window.promptPalInjected) return;
  window.promptPalInjected = true;

  // Create floating capture button
  function createCaptureButton() {
    const btn = document.createElement('button');
    btn.id = 'promptpal-capture-btn';
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
      <span>Save to PromptPal</span>
    `;
    btn.title = 'Save selected prompt to PromptPal';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      const prompts = extractPrompts();
      if (prompts.length > 0) {
        showPromptSelector(prompts);
      } else {
        showNotification('No prompts found on this page', 'error');
      }
    });

    return btn;
  }

  // Extract user prompts from ChatGPT conversation
  function extractPrompts() {
    const prompts = [];

    // ChatGPT uses data-message-author-role attribute
    const userMessages = document.querySelectorAll('[data-message-author-role="user"]');

    userMessages.forEach((msg, index) => {
      const textContent = msg.innerText.trim();
      if (textContent) {
        prompts.push({
          id: `chatgpt-${index}-${Date.now()}`,
          content: textContent,
          source: 'ChatGPT',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Fallback: look for user message containers
    if (prompts.length === 0) {
      const altMessages = document.querySelectorAll('[class*="user-message"], [class*="human"]');
      altMessages.forEach((msg, index) => {
        const textContent = msg.innerText.trim();
        if (textContent) {
          prompts.push({
            id: `chatgpt-alt-${index}-${Date.now()}`,
            content: textContent,
            source: 'ChatGPT',
            timestamp: new Date().toISOString()
          });
        }
      });
    }

    return prompts;
  }

  // Show prompt selector modal
  function showPromptSelector(prompts) {
    // Remove existing modal if any
    const existing = document.getElementById('promptpal-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'promptpal-modal';
    modal.innerHTML = `
      <div class="promptpal-modal-overlay">
        <div class="promptpal-modal-content">
          <div class="promptpal-modal-header">
            <h3>Save to PromptPal</h3>
            <button class="promptpal-close-btn">&times;</button>
          </div>
          <div class="promptpal-modal-body">
            <p class="promptpal-subtitle">Select prompts to save (${prompts.length} found)</p>
            <div class="promptpal-prompt-list">
              ${prompts.map((p, i) => `
                <label class="promptpal-prompt-item">
                  <input type="checkbox" value="${i}" checked>
                  <span class="promptpal-prompt-text">${escapeHtml(p.content.substring(0, 200))}${p.content.length > 200 ? '...' : ''}</span>
                </label>
              `).join('')}
            </div>
          </div>
          <div class="promptpal-modal-footer">
            <button class="promptpal-btn promptpal-btn-secondary promptpal-cancel-btn">Cancel</button>
            <button class="promptpal-btn promptpal-btn-primary promptpal-save-btn">Save Selected</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    modal.querySelector('.promptpal-close-btn').addEventListener('click', () => modal.remove());
    modal.querySelector('.promptpal-cancel-btn').addEventListener('click', () => modal.remove());
    modal.querySelector('.promptpal-modal-overlay').addEventListener('click', (e) => {
      if (e.target.classList.contains('promptpal-modal-overlay')) modal.remove();
    });

    modal.querySelector('.promptpal-save-btn').addEventListener('click', () => {
      const selected = Array.from(modal.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => prompts[parseInt(cb.value)]);

      if (selected.length > 0) {
        savePrompts(selected);
        modal.remove();
      } else {
        showNotification('Please select at least one prompt', 'error');
      }
    });
  }

  // Save prompts via background script
  function savePrompts(prompts) {
    chrome.runtime.sendMessage({
      action: 'savePrompts',
      prompts: prompts
    }, (response) => {
      if (response && response.success) {
        showNotification(`Saved ${prompts.length} prompt(s) to PromptPal!`, 'success');
      } else {
        showNotification(response?.error || 'Failed to save. Please login to PromptPal first.', 'error');
      }
    });
  }

  // Show notification toast
  function showNotification(message, type = 'info') {
    const existing = document.querySelector('.promptpal-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `promptpal-notification promptpal-notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize
  function init() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createCaptureButton);
    } else {
      createCaptureButton();
    }
  }

  init();
})();
