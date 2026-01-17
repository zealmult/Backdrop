document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const els = {
    domainBadge: document.getElementById('current-domain'),
    bgTypes: document.getElementsByName('bgType'),
    sectionColor: document.getElementById('section-color'),
    sectionImage: document.getElementById('section-image'),
    sectionStyles: document.getElementById('section-styles'),
    colorPicker: document.getElementById('color-picker'),
    colorText: document.getElementById('color-text'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    imageUrl: document.getElementById('image-url'),
    dropArea: document.getElementById('drop-area'),
    fileInput: document.getElementById('image-file'),
    fileInfo: document.getElementById('file-info'),
    fileName: document.querySelector('.filename'),
    removeFileBtn: document.getElementById('remove-file'),
    imagePreview: document.getElementById('image-preview'),
    opacity: document.getElementById('opacity'),
    opacityVal: document.getElementById('opacity-val'),
    blur: document.getElementById('blur'),
    blurVal: document.getElementById('blur-val'),
    bgFixed: document.getElementById('bg-fixed'),
    bgSize: document.getElementById('bg-size'),
    bgRepeat: document.getElementById('bg-repeat'),
    imageOptions: document.getElementById('image-options'),
    saveBtn: document.getElementById('save-btn'),
    resetBtn: document.getElementById('reset-btn'),
    statusMsg: document.getElementById('status-msg')
  };

  // State
  let currentDomain = '';
  let currentImageBase64 = null;

  // Init
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    try {
      const url = new URL(tab.url);
      currentDomain = url.hostname;
      els.domainBadge.textContent = currentDomain;
      loadSettings(currentDomain);
    } catch (e) {
      els.domainBadge.textContent = 'Invalid URL';
      disableAll();
    }
  } else {
    els.domainBadge.textContent = 'No Active Tab';
    disableAll();
  }

  // Event Listeners
  
  // Background Type Switch
  els.bgTypes.forEach(radio => {
    radio.addEventListener('change', () => updateUI(radio.value));
  });

  // Color Picker Sync
  els.colorPicker.addEventListener('input', (e) => els.colorText.value = e.target.value);
  els.colorText.addEventListener('input', (e) => els.colorPicker.value = e.target.value);

  // Tabs
  els.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      els.tabBtns.forEach(b => b.classList.remove('active'));
      els.tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  // File Upload
  els.dropArea.addEventListener('click', () => els.fileInput.click());
  els.fileInput.addEventListener('change', handleFileSelect);
  els.dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    els.dropArea.classList.add('dragover');
  });
  els.dropArea.addEventListener('dragleave', () => els.dropArea.classList.remove('dragover'));
  els.dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    els.dropArea.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  });
  els.removeFileBtn.addEventListener('click', clearFile);

  // Sliders
  els.opacity.addEventListener('input', (e) => els.opacityVal.textContent = `${e.target.value}%`);
  els.blur.addEventListener('input', (e) => els.blurVal.textContent = `${e.target.value}px`);

  // URL Preview
  els.imageUrl.addEventListener('input', (e) => {
    if (e.target.value) {
      els.imagePreview.style.backgroundImage = `url('${e.target.value}')`;
    }
  });

  // Actions
  els.saveBtn.addEventListener('click', saveSettings);
  els.resetBtn.addEventListener('click', resetSettings);

  // Functions

  function disableAll() {
    document.querySelector('main').style.opacity = '0.5';
    document.querySelector('main').style.pointerEvents = 'none';
    els.saveBtn.disabled = true;
    els.resetBtn.disabled = true;
  }

  async function loadSettings(domain) {
    const data = await chrome.storage.local.get(domain);
    const settings = data[domain] || { type: 'none', opacity: 100, blur: 0, style: { fixed: true, size: 'cover', repeat: false } };

    // Set Type
    document.querySelector(`input[name="bgType"][value="${settings.type}"]`).checked = true;
    updateUI(settings.type);

    // Set Values based on type
    if (settings.type === 'color') {
      els.colorPicker.value = settings.value || '#ffffff';
      els.colorText.value = settings.value || '#ffffff';
    } else if (settings.type === 'image') {
      // Check if it's base64 or url
      if (settings.value && settings.value.startsWith('data:')) {
        // Local file
        currentImageBase64 = settings.value;
        els.imagePreview.style.backgroundImage = `url('${currentImageBase64}')`;
        els.tabBtns[1].click(); // Switch to local tab
        els.dropArea.classList.add('hidden');
        els.fileInfo.classList.remove('hidden');
        els.fileName.textContent = 'Saved Image';
      } else {
        // URL
        els.imageUrl.value = settings.value || '';
        if (settings.value) els.imagePreview.style.backgroundImage = `url('${settings.value}')`;
        els.tabBtns[0].click(); // Switch to URL tab
      }
    }

    // Common Styles
    els.opacity.value = settings.opacity;
    els.opacityVal.textContent = `${settings.opacity}%`;
    els.blur.value = settings.blur;
    els.blurVal.textContent = `${settings.blur}px`;
    
    if (settings.style) {
      els.bgFixed.checked = settings.style.fixed;
      els.bgSize.value = settings.style.size || 'cover';
      els.bgRepeat.checked = settings.style.repeat;
    }
  }

  function updateUI(type) {
    els.sectionColor.classList.add('hidden');
    els.sectionImage.classList.add('hidden');
    els.sectionStyles.classList.add('hidden');
    els.imageOptions.classList.add('hidden');

    if (type === 'color') {
      els.sectionColor.classList.remove('hidden');
      els.sectionStyles.classList.remove('hidden');
    } else if (type === 'image') {
      els.sectionImage.classList.remove('hidden');
      els.sectionStyles.classList.remove('hidden');
      els.imageOptions.classList.remove('hidden');
    }
  }

  function handleFileSelect(e) {
    if (e.target.files.length) {
      handleFile(e.target.files[0]);
    }
  }

  function handleFile(file) {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      currentImageBase64 = e.target.result;
      els.imagePreview.style.backgroundImage = `url('${currentImageBase64}')`;
      els.dropArea.classList.add('hidden');
      els.fileInfo.classList.remove('hidden');
      els.fileName.textContent = file.name;
    };
    reader.readAsDataURL(file);
  }

  function clearFile() {
    currentImageBase64 = null;
    els.fileInput.value = '';
    els.dropArea.classList.remove('hidden');
    els.fileInfo.classList.add('hidden');
    els.imagePreview.style.backgroundImage = '';
  }

  async function saveSettings() {
    const type = document.querySelector('input[name="bgType"]:checked').value;
    let value = '';

    if (type === 'color') {
      value = els.colorPicker.value;
    } else if (type === 'image') {
      // Determine if we use URL or Local
      // If we are on URL tab and have a value, use it. 
      // If we are on Local tab (or URL is empty) and have base64, use base64?
      // Better: check which tab is active.
      const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
      if (activeTab === 'url') {
        value = els.imageUrl.value;
      } else {
        value = currentImageBase64;
      }
    }

    const settings = {
      type,
      value,
      opacity: els.opacity.value,
      blur: els.blur.value,
      style: {
        fixed: els.bgFixed.checked,
        size: els.bgSize.value,
        repeat: els.bgRepeat.checked
      },
      timestamp: Date.now()
    };

    try {
      await chrome.storage.local.set({ [currentDomain]: settings });
      
      // Notify Content Script
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          chrome.tabs.sendMessage(tab.id, { action: 'updateBackground', settings });
        }
      } catch (err) {
        console.log('Content script might not be ready', err);
      }

      showStatus('Saved!');
    } catch (err) {
      showStatus('Error saving!');
      console.error(err);
    }
  }

  async function resetSettings() {
    await chrome.storage.local.remove(currentDomain);
    // Reset UI
    document.querySelector('input[value="none"]').click();
    els.opacity.value = 100;
    els.blur.value = 0;
    clearFile();
    els.imageUrl.value = '';
    
    // Notify Content Script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: 'updateBackground', settings: { type: 'none' } });
    }
    showStatus('Reset!');
  }

  function showStatus(msg) {
    els.statusMsg.textContent = msg;
    els.statusMsg.classList.remove('hidden');
    setTimeout(() => els.statusMsg.classList.add('hidden'), 2000);
  }
});
