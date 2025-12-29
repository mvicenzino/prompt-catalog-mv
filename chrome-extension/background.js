// PromptPal Background Service Worker

// Default API URL - can be changed via popup settings
const DEFAULT_API_URL = 'http://localhost:5001';

// Get stored settings
async function getSettings() {
  const result = await chrome.storage.local.get(['apiUrl', 'authToken', 'userEmail']);
  return {
    apiUrl: result.apiUrl || DEFAULT_API_URL,
    authToken: result.authToken || null,
    userEmail: result.userEmail || null
  };
}

// Save prompts to PromptPal API
async function savePromptsToAPI(prompts) {
  const settings = await getSettings();

  if (!settings.authToken) {
    return { success: false, error: 'Not logged in. Please login via the extension popup.' };
  }

  try {
    const results = [];

    for (const prompt of prompts) {
      const response = await fetch(`${settings.apiUrl}/api/prompts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.authToken}`
        },
        body: JSON.stringify({
          title: generateTitle(prompt.content),
          content: prompt.content,
          category: 'Captured',
          source: prompt.source,
          tags: ['captured', prompt.source.toLowerCase()],
          attachment: {
            capturedAt: prompt.timestamp,
            capturedFrom: prompt.source
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const saved = await response.json();
      results.push(saved);
    }

    return { success: true, saved: results.length };
  } catch (error) {
    console.error('Failed to save prompts:', error);
    return { success: false, error: error.message };
  }
}

// Generate a title from prompt content
function generateTitle(content) {
  // Take first line or first 50 chars
  const firstLine = content.split('\n')[0].trim();
  if (firstLine.length <= 50) {
    return firstLine;
  }
  return firstLine.substring(0, 47) + '...';
}

// Validate auth token by making a test request
async function validateToken(apiUrl, token) {
  try {
    console.log('Validating token with URL:', apiUrl);
    const response = await fetch(`${apiUrl}/api/prompts?limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Validation response status:', response.status);
    return response.ok;
  } catch (err) {
    console.error('Token validation error:', err);
    return false;
  }
}

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'savePrompts') {
    savePromptsToAPI(request.prompts).then(sendResponse);
    return true; // Keep channel open for async response
  }

  if (request.action === 'getSettings') {
    getSettings().then(sendResponse);
    return true;
  }

  if (request.action === 'saveSettings') {
    chrome.storage.local.set({
      apiUrl: request.apiUrl,
      authToken: request.authToken,
      userEmail: request.userEmail
    }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'validateToken') {
    validateToken(request.apiUrl, request.token).then(valid => {
      sendResponse({ valid });
    });
    return true;
  }

  if (request.action === 'logout') {
    chrome.storage.local.remove(['authToken', 'userEmail']).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default API URL
    chrome.storage.local.set({ apiUrl: DEFAULT_API_URL });
    console.log('PromptPal extension installed');
  }
});
