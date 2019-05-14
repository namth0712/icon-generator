const JSZip = require('jszip');
const FileSaver = require('file-saver');

(() => {
  const sizes = [
    16,
    18,
    19,
    20,
    24,
    29,
    32,
    36,
    38,
    40,
    44, //Window 10 app list in start menu, task bar, task manager
    48,
    50,
    55,
    57, //iPhone(first generation or 2G), 3G, 3GS
    58,
    60,
    64,
    71, //Window 10 small tile
    72,
    76, //Old iPads 1, 2, Mini 1 @1x
    80,
    87,
    88,
    96,
    100,
    114, //Retina iPhone
    120, //iPhone 4, 4S, 5, 5C, 5S, 6, 6SE, 6S, 7, 8
    128, //Android Devices Normal Resolution
    144, //Retina iPad
    150, //Window 10 medium tile
    152, //Retina iPads Mini 2 & 3, Air, 3 & 4
    167, //iPad Pro
    171,
    172,
    180, //iPhone 6+, 6S+, 7+, 8+, X
    192, //Android Devices High Resolution
    196,
    200,
    256,
    300, //Window 10 Large tile
    512,
  ];

  const checkboxList = document.querySelector('.checkbox-list');
  let hasImg = false;
  for (let size of sizes) {
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
  }

  document.querySelector('.checkall').addEventListener('click', e => {
    Array.from(
      document.querySelectorAll('.checkbox-list input[type="checkbox"]'),
    ).map(cb => (cb.checked = e.target.checked));
    return updateResized();
  });

  const resizeTypes = document.querySelectorAll('input[name="resize_type"]');
  for (let i = 0; i < resizeTypes.length; i++) {
    resizeTypes[i].addEventListener('click', e => {
      return updateResized();
    });
  }

  const img = new Image();
  img.onload = function() {
    updateOrig();
    updateResized();
  };

  const updateOrig = () => {
    let src, ctx;
    src = document.getElementById('src');
    src.width = 200;
    src.height = (200 / img.width) * img.height;
    document.querySelector('.src-info').innerHTML = `${img.width} x ${
      img.height
    }`;

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

    let checkboxes = Array.from(
      document.querySelectorAll('.checkbox-list input[type="checkbox"]'),
    )
      .filter(checkbox => checkbox.checked)
      .map(checkbox => parseInt(checkbox.value));

    for (let i = 0; i < checkboxes.length; i++) {
      let size = checkboxes[i];
      let canvas = document.createElement('canvas');
      canvas.setAttribute('class', `cnvs cnvs-${size}`);
      canvas.setAttribute('data-size', size);
      console.log('===size===', size);
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
      result.appendChild(canvas);
    }
  };

  const imgHandler = document.getElementsByClassName('upload-handler')[0];
  imgHandler.addEventListener('change', evt => {
    const files = evt.target.files; // FileList object

    if (files.length && files[0] && !files[0].type.match('image.*')) {
      return;
    }
    const imgUploaded = files[0];
    img.src = window.URL.createObjectURL(imgUploaded);
  });

  const downloadZip = document.getElementById('download-zip');
  downloadZip.addEventListener('click', e => {
    e.preventDefault();
    if (!hasImg) {
      return;
    }
    const zip = new JSZip();
    const imgFolder = zip.folder('icons');

    const canvases = document.querySelectorAll('canvas.cnvs');
    canvases.forEach(canvas => {
      let size = canvas.getAttribute('data-size');
      let dataURL = canvas.toDataURL('image/png');
      dataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
      imgFolder.file(`icon-${size}.png`, dataURL, { base64: true });
    });
    // Generate the zip file asynchronously
    zip.generateAsync({ type: 'blob' }).then(content => {
      // Force down of the Zip file
      FileSaver.saveAs(content, 'archive.zip');
    });
  });
})();
