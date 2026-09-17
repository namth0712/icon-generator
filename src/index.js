const JSZip = require('jszip');
const FileSaver = require('file-saver');

(() => {
  const supportedSizes = [
    16, 24, 29, 32, 36, 40, 44, 48, 50, 55, 57, 58, 60, 64, 71, 72, 76,
    80, 87, 88, 96, 100, 114, 120, 128, 144, 150, 152, 167, 172, 180, 192,
    196, 228, 256, 300, 512, 1024,
  ];
  const modernSizes = [16, 32, 48, 180, 192, 512, 1024];
  const sizeDescriptions = {
    16: ['Favicon', false], 24: ['Pinned browser site', false], 29: ['iOS settings', false],
    32: ['Favicon', false], 36: ['Android LDPI', false], 40: ['iOS notifications', false],
    44: ['Windows taskbar', false], 48: ['Android MDPI', false], 50: ['iPad Spotlight', true],
    55: ['Apple Watch notification', false], 57: ['iPhone home screen', true],
    58: ['iOS settings', false], 60: ['iOS notification', false], 64: ['Browser icon', false],
    71: ['Windows small tile', false], 72: ['Android HDPI', false], 76: ['iPad', false],
    80: ['iOS Spotlight', false], 87: ['iPhone settings', false], 88: ['Apple Watch notification', false],
    96: ['Android XHDPI', false], 100: ['iPad Spotlight', true], 114: ['iPhone home screen', true],
    120: ['iPhone home screen', false], 128: ['Android icon', false], 144: ['Android XXHDPI', false],
    150: ['Windows medium tile', false], 152: ['iPad', false], 167: ['iPad Pro', false],
    172: ['Apple Watch short look', false], 180: ['iPhone home screen', false],
    192: ['Android XXXHDPI', false], 196: ['Apple Watch short look', false],
    228: ['Opera Coast', false], 256: ['Desktop icon', false], 300: ['Windows large tile', false],
    512: ['Store icon', false], 1024: ['App Store icon', false],
  };
  const supportedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
  const uploadArea = document.querySelector('.uploadArea');
  const uploadInput = document.querySelector('.upload-handler');
  const status = document.querySelector('.upload-status');
  const sourceInfo = document.querySelector('.src-info');
  const sourceCanvas = document.getElementById('src');
  const sourcePreview = document.querySelector('.source-preview');
  const result = document.getElementById('result');
  const zipButton = document.getElementById('download-zip');
  const customInput = document.getElementById('custom-sizes');
  const platformPreview = document.getElementById('platform-preview');
  const previewIcon = document.getElementById('preview-icon');
  let previewBackground = 'checker';
  const image = new Image();
  let sourceFile;
  let sourceUrl;
  let sourceWidth = 0;
  let sourceHeight = 0;
  let hasImage = false;
  let loadToken = 0;

  const setStatus = (message, error = false) => {
    status.innerText = message;
    status.classList.toggle('error', error);
  };

  const clearOutput = () => {
    result.innerHTML = '';
    zipButton.classList.remove('show');
  };

  const fileIsSupported = (file) => {
    const extension = file.name.toLowerCase().split('.').pop();
    return supportedTypes.includes(file.type) || ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(extension);
  };

  const selectedSizes = () => {
    const mode = document.querySelector('input[name="output-mode"]:checked').value;
    if (mode === 'all') return supportedSizes;
    if (mode === 'modern') return modernSizes;

    const values = customInput.value.split(/[\s,]+/).filter(Boolean).map(Number);
    if (!values.length || values.some((size) => !Number.isSafeInteger(size) || size <= 0) || new Set(values).size !== values.length) {
      return null;
    }
    return values;
  };

  const canvasToBlob = (canvas) => new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Export failed'))), 'image/png');
  });

  const updatePreviewBackground = (background) => {
    previewBackground = background;
    sourcePreview.className = `source-preview preview-${previewBackground}`;
    document.querySelectorAll('.icon-preview').forEach((preview) => {
      preview.className = `icon-preview preview-${previewBackground}`;
    });
  };

  const drawContained = (context, size) => {
    const scale = Math.min(size / sourceWidth, size / sourceHeight);
    const width = sourceWidth * scale;
    const height = sourceHeight * scale;
    context.clearRect(0, 0, size, size);
    context.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
  };

  const updateSourcePreview = () => {
    sourceCanvas.width = 200;
    sourceCanvas.height = Math.round((200 / sourceWidth) * sourceHeight);
    sourceCanvas.getContext('2d').drawImage(image, 0, 0, sourceCanvas.width, sourceCanvas.height);
    sourceInfo.innerText = `${sourceFile.name} — ${sourceWidth} × ${sourceHeight}`;
  };

  const updateResized = () => {
    clearOutput();
    platformPreview.hidden = true;
    if (!hasImage) return;
    const sizes = selectedSizes();
    if (!sizes) {
      setStatus('Enter unique positive integer sizes, separated by commas or spaces.', true);
      return;
    }

    sizes.forEach((size) => {
      const canvas = document.createElement('canvas');
      canvas.className = `cnvs cnvs-${size}`;
      canvas.width = size;
      canvas.height = size;
      canvas.dataset.size = size;
      drawContained(canvas.getContext('2d'), size);

      const item = document.createElement('div');
      item.className = 'icon-item';
      const preview = document.createElement('div');
      preview.className = `icon-preview preview-${previewBackground}`;
      preview.appendChild(canvas);
      item.appendChild(preview);
      const label = document.createElement('span');
      label.className = 'icon-size';
      label.innerText = `${size} × ${size}`;
      item.appendChild(label);
      const description = document.createElement('small');
      const [descriptionText, legacy] = sizeDescriptions[size] || ['App icon', false];
      description.className = `icon-description${legacy ? ' legacy' : ''}`;
      description.innerText = descriptionText;
      item.appendChild(description);
      const download = document.createElement('button');
      download.className = 'icon-download';
      download.type = 'button';
      download.innerText = 'Download';
      download.addEventListener('click', async () => {
        try {
          FileSaver.saveAs(await canvasToBlob(canvas), `icon-${size}.png`);
        } catch (error) {
          setStatus('Could not export this icon.', true);
        }
      });
      item.appendChild(download);
      result.appendChild(item);
    });
    zipButton.classList.toggle('show', sizes.length > 0);
    platformPreview.hidden = sizes.length === 0;
    if (sizes.length) drawContained(previewIcon.getContext('2d'), 60);
    if (status.classList.contains('error')) setStatus(`Loaded ${sourceFile.name}`);
  };

  const loadFile = (file) => {
    if (!file || !fileIsSupported(file)) {
      setStatus('Please choose a PNG, JPEG, WebP, or SVG image.', true);
      return;
    }

    clearOutput();
    platformPreview.hidden = true;
    hasImage = false;
    sourceFile = file;
    if (sourceUrl) window.URL.revokeObjectURL(sourceUrl);
    sourceUrl = window.URL.createObjectURL(file);
    const currentLoad = ++loadToken;
    setStatus(`Loading ${file.name}...`);
    image.onload = () => {
      if (currentLoad !== loadToken) return;
      sourceWidth = image.naturalWidth || image.width;
      sourceHeight = image.naturalHeight || image.height;
      if (!sourceWidth || !sourceHeight) return image.onerror();
      hasImage = true;
      updateSourcePreview();
      updateResized();
      window.URL.revokeObjectURL(sourceUrl);
      sourceUrl = null;
      if (!status.classList.contains('error')) setStatus(`Loaded ${sourceFile.name}`);
    };
    image.onerror = () => {
      if (currentLoad !== loadToken) return;
      if (sourceUrl) window.URL.revokeObjectURL(sourceUrl);
      sourceUrl = null;
      hasImage = false;
      clearOutput();
      platformPreview.hidden = true;
      sourceInfo.innerText = '';
      sourceCanvas.getContext('2d').clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
      setStatus(`Could not decode ${file.name}. Please choose a valid image.`, true);
    };
    image.src = sourceUrl;
  };

  document.querySelectorAll('input[name="output-mode"]').forEach((mode) => {
    mode.addEventListener('change', () => {
      customInput.closest('.custom-sizes').hidden = mode.value !== 'custom';
      updateResized();
    });
  });
  document.querySelectorAll('input[name="preview-background"]').forEach((background) => {
    background.addEventListener('change', () => updatePreviewBackground(background.value));
  });
  customInput.addEventListener('input', updateResized);
  uploadInput.addEventListener('change', () => loadFile(uploadInput.files[0]));
  uploadArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    uploadArea.classList.add('is-dragging');
  });
  uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('is-dragging'));
  uploadArea.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadArea.classList.remove('is-dragging');
    loadFile(event.dataTransfer.files[0]);
  });

  zipButton.addEventListener('click', async (event) => {
    event.preventDefault();
    if (!hasImage) return;
    try {
      const zip = new JSZip().folder('icons');
      await Promise.all(Array.from(document.querySelectorAll('canvas.cnvs')).map(async (canvas) => {
        zip.file(`icon-${canvas.dataset.size}.png`, await canvasToBlob(canvas));
      }));
      FileSaver.saveAs(await zip.generateAsync({ type: 'blob' }), 'app-icons.zip');
    } catch (error) {
      setStatus('Could not create the ZIP file.', true);
    }
  });
})();
