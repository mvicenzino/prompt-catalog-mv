// PromptPal Content Script for X.com (Twitter)
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
    btn.title = 'Save prompts from this page to PromptPal';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      const prompts = extractPrompts();
      if (prompts.length > 0) {
        showPromptSelector(prompts);
      } else {
        showNotification('No prompts found. Try scrolling to load more tweets.', 'error');
      }
    });

    return btn;
  }

  // Check if text looks like a prompt (heuristics)
  function looksLikePrompt(text) {
    const promptIndicators = [
      /prompt/i,
      /chatgpt/i,
      /gpt-?4/i,
      /claude/i,
      /midjourney/i,
      /dall-?e/i,
      /stable diffusion/i,
      /\[.*\]/,  // Variables like [topic]
      /^(act as|you are|pretend|imagine|write|create|generate|design|help me)/i,
      /```/,     // Code blocks
      /<.*>/,    // XML-like tags
    ];

    // Check if any indicator matches
    return promptIndicators.some(pattern => pattern.test(text));
  }

  // Extract engagement metrics from tweet
  function extractMetrics(tweetElement) {
    const metrics = { likes: 0, retweets: 0, replies: 0, views: 0 };

    // Try to find metric buttons/spans
    const metricGroups = tweetElement.querySelectorAll('[role="group"]');
    metricGroups.forEach(group => {
      const buttons = group.querySelectorAll('button');
      buttons.forEach((btn, idx) => {
        const text = btn.innerText.trim();
        const num = parseInt(text.replace(/[,K.M]/g, '')) || 0;
        // Order is usually: replies, retweets, likes, views
        if (idx === 0) metrics.replies = num;
        if (idx === 1) metrics.retweets = num;
        if (idx === 2) metrics.likes = num;
        if (idx === 3) metrics.views = num;
      });
    });

    return metrics;
  }

  // Extract author info
  function extractAuthor(tweetElement) {
    // Try multiple selectors for author
    const authorLink = tweetElement.querySelector('a[href^="/"][role="link"]');
    const displayNameEl = tweetElement.querySelector('[data-testid="User-Name"]');

    let handle = '';
    let displayName = '';

    if (authorLink) {
      const href = authorLink.getAttribute('href');
      if (href && href.startsWith('/')) {
        handle = href.split('/')[1];
      }
    }

    if (displayNameEl) {
      const spans = displayNameEl.querySelectorAll('span');
      if (spans.length > 0) {
        displayName = spans[0].innerText.trim();
      }
      // Find @handle
      spans.forEach(span => {
        if (span.innerText.startsWith('@')) {
          handle = span.innerText.replace('@', '');
        }
      });
    }

    return { handle, displayName };
  }

  // Extract prompts from visible tweets
  function extractPrompts() {
    const prompts = [];

    // X.com uses article elements for tweets
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');

    tweets.forEach((tweet, index) => {
      // Get tweet text
      const tweetTextEl = tweet.querySelector('[data-testid="tweetText"]');
      if (!tweetTextEl) return;

      const textContent = tweetTextEl.innerText.trim();

      // Skip very short tweets or tweets that don't look like prompts
      if (textContent.length < 50) return;

      // Get author info
      const author = extractAuthor(tweet);

      // Get metrics
      const metrics = extractMetrics(tweet);

      // Get tweet URL
      const timeLink = tweet.querySelector('time')?.closest('a');
      const tweetUrl = timeLink ? 'https://x.com' + timeLink.getAttribute('href') : '';

      prompts.push({
        id: `x-${index}-${Date.now()}`,
        content: textContent,
        source: 'X',
        author: author.handle || author.displayName || 'Unknown',
        authorDisplay: author.displayName,
        metrics: metrics,
        url: tweetUrl,
        timestamp: new Date().toISOString(),
        isPrompt: looksLikePrompt(textContent)
      });
    });

    // Sort by likelihood of being a prompt, then by engagement
    prompts.sort((a, b) => {
      if (a.isPrompt && !b.isPrompt) return -1;
      if (!a.isPrompt && b.isPrompt) return 1;
      return (b.metrics.likes + b.metrics.retweets) - (a.metrics.likes + a.metrics.retweets);
    });

    return prompts;
  }

  // Show prompt selector modal
  function showPromptSelector(prompts) {
    const existing = document.getElementById('promptpal-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'promptpal-modal';
    modal.innerHTML = `
      <div class="promptpal-modal-overlay">
        <div class="promptpal-modal-content" style="max-width: 600px;">
          <div class="promptpal-modal-header">
            <h3>Save to PromptPal</h3>
            <button class="promptpal-close-btn">&times;</button>
          </div>
          <div class="promptpal-modal-body">
            <p class="promptpal-subtitle">Found ${prompts.length} potential prompts</p>
            <div class="promptpal-prompt-list" style="max-height: 400px; overflow-y: auto;">
              ${prompts.map((p, i) => `
                <label class="promptpal-prompt-item" style="flex-direction: column; align-items: flex-start;">
                  <div style="display: flex; align-items: flex-start; gap: 12px; width: 100%;">
                    <input type="checkbox" value="${i}" ${p.isPrompt ? 'checked' : ''} style="margin-top: 4px;">
                    <div style="flex: 1;">
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span style="font-weight: 600; color: #fff;">@${escapeHtml(p.author)}</span>
                        ${p.isPrompt ? '<span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">PROMPT</span>' : ''}
                        <span style="color: #666; font-size: 11px;">
                          ❤️ ${p.metrics.likes} · 🔁 ${p.metrics.retweets}
                        </span>
                      </div>
                      <span class="promptpal-prompt-text">${escapeHtml(p.content.substring(0, 280))}${p.content.length > 280 ? '...' : ''}</span>
                    </div>
                  </div>
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
      prompts: prompts.map(p => ({
        ...p,
        // Include metadata for AI categorization
        attachment: {
          sourceUrl: p.url,
          author: p.author,
          authorDisplay: p.authorDisplay,
          metrics: p.metrics,
          capturedAt: p.timestamp
        }
      }))
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

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Add save button to individual tweets on hover (optional enhancement)
  function addTweetSaveButtons() {
    const observer = new MutationObserver(() => {
      const tweets = document.querySelectorAll('article[data-testid="tweet"]:not([data-promptpal-processed])');
      tweets.forEach(tweet => {
        tweet.setAttribute('data-promptpal-processed', 'true');

        // Add a small save button on hover
        const btn = document.createElement('button');
        btn.className = 'promptpal-tweet-save-btn';
        btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        `;
        btn.title = 'Save this prompt to PromptPal';
        btn.style.cssText = `
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(99, 102, 241, 0.9);
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          z-index: 10;
          transition: transform 0.2s;
        `;

        // Position relative container
        tweet.style.position = 'relative';
        tweet.appendChild(btn);

        tweet.addEventListener('mouseenter', () => btn.style.display = 'flex');
        tweet.addEventListener('mouseleave', () => btn.style.display = 'none');

        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();

          const tweetTextEl = tweet.querySelector('[data-testid="tweetText"]');
          if (!tweetTextEl) {
            showNotification('Could not extract tweet text', 'error');
            return;
          }

          const content = tweetTextEl.innerText.trim();
          const author = extractAuthor(tweet);
          const metrics = extractMetrics(tweet);
          const timeLink = tweet.querySelector('time')?.closest('a');
          const tweetUrl = timeLink ? 'https://x.com' + timeLink.getAttribute('href') : '';

          savePrompts([{
            id: `x-single-${Date.now()}`,
            content: content,
            source: 'X',
            author: author.handle || 'Unknown',
            authorDisplay: author.displayName,
            metrics: metrics,
            url: tweetUrl,
            timestamp: new Date().toISOString()
          }]);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Initialize
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        createCaptureButton();
        addTweetSaveButtons();
      });
    } else {
      createCaptureButton();
      addTweetSaveButtons();
    }
  }

  init();
})();
