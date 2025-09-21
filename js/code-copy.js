// Enhanced code block copy functionality
(function () {
  'use strict';

  // Use a unique identifier to prevent duplicate processing
  const COPY_BUTTON_CLASS = 'halunhaku-copy-btn';
  const PROCESSED_FLAG = 'data-copy-processed';

  function initCopyButtons() {
    // Use a more efficient selector and check for existing buttons
    const codeBlocks = document.querySelectorAll('pre:not([' + PROCESSED_FLAG + '])');

    codeBlocks.forEach(function (codeBlock) {
      // Double-check to prevent race conditions and remove any existing copy buttons
      const existingButtons = codeBlock.querySelectorAll('button[class*="copy"], button[title*="复制"], button[title*="copy"], .' + COPY_BUTTON_CLASS);
      existingButtons.forEach(btn => btn.remove());
      
      if (codeBlock.hasAttribute(PROCESSED_FLAG)) {
        return;
      }

      // Mark as processed immediately
      codeBlock.setAttribute(PROCESSED_FLAG, 'true');

      // Create enhanced copy button with unique identifier
      const copyBtn = document.createElement('button');
      copyBtn.className = COPY_BUTTON_CLASS;
      copyBtn.innerHTML = '📋';
      copyBtn.title = '复制代码';
      copyBtn.setAttribute('aria-label', '复制代码到剪贴板');
      copyBtn.setAttribute('data-halunhaku-copy', 'true');

      // Enhanced click handler with better UX
      copyBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Find the actual code content
        const code = codeBlock.querySelector('code');
        const text = code ? code.textContent.trim() : codeBlock.textContent.trim();

        if (!text) {
          showCopyError(copyBtn);
          return;
        }

        try {
          await copyToClipboard(text);
          showCopySuccess(copyBtn);
        } catch (err) {
          console.error('复制失败:', err);
          showCopyError(copyBtn);
        }
      });

      // Add hover effects for better UX
      copyBtn.addEventListener('mouseenter', function() {
        this.style.opacity = '1';
      });

      copyBtn.addEventListener('mouseleave', function() {
        if (!this.classList.contains('success') && !this.classList.contains('error')) {
          this.style.opacity = '';
        }
      });

      // Add to code block
      codeBlock.style.position = 'relative';
      codeBlock.appendChild(copyBtn);
    });
  }

  async function copyToClipboard(text) {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      return await navigator.clipboard.writeText(text);
    }

    // Fallback for older browsers or non-secure contexts
    return new Promise((resolve, reject) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.cssText = 'position:fixed;top:-999px;left:-999px;opacity:0;pointer-events:none;';

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);

        if (successful) {
          resolve();
        } else {
          reject(new Error('Copy command failed'));
        }
      } catch (err) {
        document.body.removeChild(textarea);
        reject(err);
      }
    });
  }

  function showCopySuccess(btn) {
    const originalContent = btn.innerHTML;
    btn.innerHTML = '✅';
    btn.classList.add('success');
    
    // Add a subtle animation
    btn.style.transform = 'scale(1.1) rotate(360deg)';
    
    setTimeout(() => {
      btn.innerHTML = originalContent;
      btn.classList.remove('success');
      btn.style.transform = '';
    }, 2000);
  }

  function showCopyError(btn) {
    const originalContent = btn.innerHTML;
    btn.innerHTML = '❌';
    btn.classList.add('error');
    
    // Add shake animation
    btn.style.transform = 'scale(1.1)';
    btn.style.animation = 'shake 0.5s ease-in-out';
    
    setTimeout(() => {
      btn.innerHTML = originalContent;
      btn.classList.remove('error');
      btn.style.transform = '';
      btn.style.animation = '';
    }, 2000);
  }

  // Throttled initialization to prevent excessive calls
  let initTimeout;
  let isInitialized = false;
  
  function throttledInit() {
    clearTimeout(initTimeout);
    initTimeout = setTimeout(() => {
      initCopyButtons();
      isInitialized = true;
    }, 100);
  }
  
  // Reset initialization flag when page changes
  function resetInitialization() {
    isInitialized = false;
    // Remove all existing copy buttons to prevent duplicates
    document.querySelectorAll('.copy-btn, button[class*="copy"], button[title*="复制"], button[title*="copy"]').forEach(btn => {
      if (btn.parentNode) btn.parentNode.removeChild(btn);
    });
    // Clear processed flags
    document.querySelectorAll('[' + PROCESSED_FLAG + ']').forEach(el => {
      el.removeAttribute(PROCESSED_FLAG);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', throttledInit);
  } else {
    throttledInit();
  }

  // Handle dynamic content changes with improved performance
  let lastUrl = location.href;
  const observer = new MutationObserver((mutations) => {
    const currentUrl = location.href;
    let hasNewCodeBlocks = false;

    // Check for SPA navigation
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      resetInitialization();
      throttledInit();
      return;
    }

    // Efficient check for new code blocks
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'PRE' || node.querySelector?.('pre')) {
              hasNewCodeBlocks = true;
              break;
            }
          }
        }
      }
      if (hasNewCodeBlocks) break;
    }

    if (hasNewCodeBlocks) {
      throttledInit();
    }
  });

  // Start observing after initial load
  setTimeout(() => {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }, 100);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    observer.disconnect();
    clearTimeout(initTimeout);
  });

  // Handle visibility change to prevent memory leaks
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimeout(initTimeout);
    }
  });

})();