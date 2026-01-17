(() => {
  const ROOT_ID = 'backdrop-extension-root';
  const STYLE_ID = 'backdrop-extension-style-override';
  
  // Initialize
  init();

  function init() {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'updateBackground') {
        applyBackground(message.settings);
      }
    });

    // Load initial settings
    const domain = window.location.hostname;
    chrome.storage.local.get(domain, (data) => {
      const settings = data[domain];
      if (settings && settings.type !== 'none') {
        applyBackground(settings);
      }
    });
  }

  function applyBackground(settings) {
    if (!settings || settings.type === 'none') {
      removeBackdrop();
      return;
    }

    // 1. Ensure transparency of existing page background
    enforceTransparency();

    // 2. Get or create root element
    let root = document.getElementById(ROOT_ID);
    let layer;

    if (!root) {
      root = document.createElement('div');
      root.id = ROOT_ID;
      // High negative z-index to be behind everything
      // Fixed position to cover viewport
      Object.assign(root.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '-2147483648', // Min integer
        pointerEvents: 'none',
        overflow: 'hidden',
        display: 'block' // Ensure it's visible
      });
      document.documentElement.appendChild(root);
      
      // Use Shadow DOM to isolate styles
      const shadow = root.attachShadow({ mode: 'open' });
      layer = document.createElement('div');
      layer.id = 'backdrop-layer';
      shadow.appendChild(layer);
    } else {
      layer = root.shadowRoot.getElementById('backdrop-layer');
    }

    // 3. Apply styles to the layer
    const style = {
      width: '100%',
      height: '100%',
      transition: 'background 0.3s ease, opacity 0.3s ease',
      opacity: (settings.opacity / 100).toString(),
      filter: `blur(${settings.blur}px)`,
      transform: 'scale(1.05)', // Prevent blur edge artifacts
    };

    if (settings.type === 'color') {
      style.backgroundColor = settings.value;
      style.backgroundImage = 'none';
    } else if (settings.type === 'image') {
      style.backgroundColor = 'transparent';
      style.backgroundImage = `url("${settings.value}")`;
      
      if (settings.style) {
        style.backgroundPosition = 'center center';
        style.backgroundSize = settings.style.size || 'cover';
        style.backgroundRepeat = settings.style.repeat ? 'repeat' : 'no-repeat';
        
        // Note: The root is fixed, so the background inside is relative to viewport already.
        // If user wants "scroll" (background moves with content), we need to change root position?
        // Actually, if root is fixed, background is fixed.
        // If user wants "scroll", we should set root to absolute and height to full document height?
        // But performance-wise, fixed background is better.
        // Let's implement 'fixed' vs 'scroll' by changing background-attachment?
        // Since the container is fixed, background-attachment: scroll means it moves with the container (which doesn't move).
        // If we want it to scroll with page, the container must be absolute.
        
        if (settings.style.fixed) {
           root.style.position = 'fixed';
           root.style.height = '100vh';
        } else {
           root.style.position = 'absolute';
           root.style.height = '100%'; // Full document height
        }
      }
    }

    // Apply styles
    Object.assign(layer.style, style);
  }

  function removeBackdrop() {
    const root = document.getElementById(ROOT_ID);
    if (root) root.remove();
    
    const style = document.getElementById(STYLE_ID);
    if (style) style.remove();
  }

  function enforceTransparency() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        html, body {
          background: none !important;
          background-color: transparent !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }
  }

})();
