const JSZip = require('jszip');
const FileSaver = require('file-saver');

(() => {
  /* const sizes = [
    18,
    19,
    20,
    38,
    171,
    200,
  ]; */
  const iconSizes = {
    favicon: {
      16: 'favicon.ico',
      24: 'favicon.ico (IE9 Pinned site browser)',
      32: 'favicon.ico',
      64: 'favicon.ico (Windows site icons, Safari Reading List)',
      72: 'apple-touch-icon-72x72-precomposed.png',
      96: 'Google TV Favicon',
      120: 'apple-touch-icon-120x120-precomposed.png',
      144: 'Windows 8 Pinned Site Tile',
      152: 'apple-touch-icon-152x152-precomposed.png',
      228: 'Opera Coast Browser (iPad)',
    },
    //https://developer.apple.com/design/human-interface-guidelines/watchos/icons-and-images/home-screen-icons/
    watchOS: {
      48: 'Notification center on Apple Watch (38mm)',
      55: 'Notification center on Apple Watch (42mm)',
      58: 'Settings in the Apple Watch companion app on iPhone',
      80: 'Home screen on Apple Watch (38mm/42mm), Long-Look notification on Apple Watch (38mm)',
      87: 'Settings in the Apple Watch companion app on iPhone 6 Plus',
      88: 'Long-Look notification on Apple Watch (42mm)',
      172: 'Short-Look notification on Apple Watch (38mm)',
      196: 'Short-Look notification on Apple Watch (42mm)',
    },

    //https://developer.apple.com/design/human-interface-guidelines/macos/icons-and-images/app-icon/
    macOS: {
      16: '',
      32: '',
      64: '',
      128: '',
      256: '',
      512: '',
      1024: '',
    },

    //https://developer.apple.com/library/archive/qa/qa1686/_index.html
    //https://developer.apple.com/design/human-interface-guidelines/ios/icons-and-images/app-icon/
    iOS: {
      16: '',
      29: 'Settings (iPhone @1x)',
      32: '',
      40: 'Notification icon (iPhone @2x, iPad @2x)',
      50: 'Spotlight on iPad (iOS 6.1 and earlier)',
      57: 'Home screen on iPhone/iPod touch (iOS 6.1 and earlier)',
      58: 'Setting icon (iPhone @3x, iPad @2x)',
      60: 'Notification icon (iPhone @3x)',
      72: 'Home screen on iPad (iOS 6.1 and earlier)',
      76: 'iPad @1x',
      80: 'Spotlight icon (iPhone @2x, iPad @2x)',
      87: 'Setting icon iPhone @3x',
      100: 'Spotlight on iPad with retina display (iOS 6.1 and earlier)',
      114: 'Home screen on iPhone/iPod Touch with retina display (iOS 6.1 and earlier)',
      120: 'iPhone @2x (iPhone 4, 4S, 5, 5C, 5S, 6, 6SE, 6S, 7, 8)',
      144: 'Home screen on iPad with retina display (iOS 6.1 and earlier)',
      152: 'iPad @2x (Retina iPads Mini 2 & 3, Air, 3 & 4)',
      167: 'iPad Pro @2x',
      180: 'iPhone @3x (iPhone 6+, 6S+, 7+, 8+, X)',
      512: 'Apple App Store @1x',
      1024: 'Apple App Store @2x',
    },
    android: {
      36: 'LDPI (optional)',
      48: 'MDPI',
      72: 'HDPI',
      96: 'XHDPI',
      144: 'XXHDPI',
      192: 'XXXHDPI',
      512: 'Google Play Store',
    },
    window: {
      16: '',
      24: '',
      32: '',
      44: 'Window 10 app list in start menu, task bar, task manager',
      48: '',
      64: '',
      71: 'Window 10 small tile',
      128: '',
      150: 'Window 10 medium tile',
      256: '',
      300: 'Window 10 Large tile',
    },
  };

  const checkboxList = document.querySelector('.checkbox-list');
  let hasImg = false;

  const sizeGrouped = {};

  for (const sizeType in iconSizes) {
    if (iconSizes[sizeType]) {
      for (const size in iconSizes[sizeType]) {
        if (!sizeGrouped[size]) {
          sizeGrouped[size] = {};
        }
        sizeGrouped[size][sizeType] = iconSizes[sizeType][size];
      }
    }
  }

  for (const size in sizeGrouped) {
    let cb = document.createElement('input');
    cb.setAttribute('type', 'checkbox');
    cb.setAttribute('name', `size[]`);
    cb.setAttribute('value', size);
    cb.classList.add('cb-size');
    const desc = sizeGrouped[size];

    cb.addEventListener('change', () => {
      return updateResized();
    });
    let label = document.createElement('label');

    label.appendChild(cb);
    label.appendChild(document.createTextNode(` ${size}px`));

    Object.keys(desc).map((item) => {
      cb.classList.add(`cb-type-${item}`);
      const sizeDesc = document.createElement('span');
      sizeDesc.classList.add('cb-desc');
      if (desc[item].trim()) {
        sizeDesc.innerText = `- ${desc[item]}`;
        label.appendChild(sizeDesc);
      }
    });

    checkboxList.appendChild(label);
  }

  /*  for (let size of sizes) {
    let cb = document.createElement('input');
    cb.setAttribute('type', 'checkbox');
    cb.setAttribute('name', `size[]`);
    cb.setAttribute('value', size);
    cb.classList.add('cb-size');
    cb.addEventListener('change', () => {
      return updateResized();
    });
    let label = document.createElement('label');
    label.appendChild(cb);
    label.appendChild(document.createTextNode(` ${size}px`));
    checkboxList.appendChild(label);
  } */

  document.querySelector('.checkall').addEventListener('click', (e) => {
    Array.from(
      document.querySelectorAll('.checkbox-list input[type="checkbox"]'),
    ).map((cb) => (cb.checked = e.target.checked));
    return updateResized();
  });

  const resizeTypes = document.querySelectorAll('input[name="resize_type"]');
  for (let i = 0; i < resizeTypes.length; i++) {
    resizeTypes[i].addEventListener('click', (e) => {
      return updateResized();
    });
  }

  const img = new Image();
  img.onload = function () {
    updateOrig();
    updateResized();
  };

  const updateOrig = () => {
    let src, ctx;
    src = document.getElementById('src');
    src.width = 200;
    src.height = (200 / img.width) * img.height;
    document.querySelector(
      '.src-info',
    ).innerHTML = `${img.width} x ${img.height}`;

    ctx = src.getContext('2d');
    ctx.drawImage(img, 0, 0, src.width, src.height);
    document.querySelector('.btn-zip').classList.add('show');
    hasImg = true;
  };

  const updateResized = () => {
    const result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }
    if (!hasImg) {
      return;
    }
    const resizeType = document.querySelector(
      'input[name="resize_type"]:checked',
    ).value;

    const checkboxes = Array.from(
      document.querySelectorAll('.checkbox-list input[type="checkbox"]'),
    )
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => parseInt(checkbox.value));

    for (let i = 0; i < checkboxes.length; i += 1) {
      const size = checkboxes[i];
      const canvas = document.createElement('canvas');
      canvas.setAttribute('class', `cnvs cnvs-${size}`);
      canvas.setAttribute('data-size', size);
      if (resizeType === 'square') {
        canvas.width = size;
        canvas.height = size;
      } else if (resizeType === 'width') {
        canvas.width = size;
        canvas.height = Math.round((size / img.width) * img.height);
      } else if (resizeType === 'height') {
        canvas.width = Math.round((size / img.height) * img.width);
        canvas.height = size;
      }

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const iconItem = document.createElement('div');

      iconItem.classList.add('icon-item');
      iconItem.appendChild(canvas);

      const iconTitle = document.createElement('span');
      iconTitle.innerText = `icon-${size}.png`;
      iconTitle.classList.add('icon-desc');
      iconTitle.addEventListener('click', (e) => {
        e.preventDefault();
        const link = document.createElement('a');
        link.download = `icon-${size}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
      iconItem.appendChild(iconTitle);
      result.appendChild(iconItem);
    }
  };

  const imgHandler = document.getElementsByClassName('upload-handler')[0];
  imgHandler.addEventListener('change', (evt) => {
    const files = evt.target.files; // FileList object

    if (files.length && files[0] && !files[0].type.match('image.*')) {
      return;
    }
    const imgUploaded = files[0];
    img.src = window.URL.createObjectURL(imgUploaded);
  });

  const downloadZip = document.getElementById('download-zip');
  downloadZip.addEventListener('click', (e) => {
    e.preventDefault();
    if (!hasImg) {
      return;
    }
    const zip = new JSZip();
    const imgFolder = zip.folder('icons');

    const canvases = document.querySelectorAll('canvas.cnvs');
    canvases.forEach((canvas) => {
      let size = canvas.getAttribute('data-size');
      let dataURL = canvas.toDataURL('image/png');
      dataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
      imgFolder.file(`icon-${size}.png`, dataURL, { base64: true });
    });
    // Generate the zip file asynchronously
    zip.generateAsync({ type: 'blob' }).then((content) => {
      // Force down of the Zip file
      FileSaver.saveAs(content, 'app-icons.zip');
    });
  });
})();
