const qrFileInput = document.getElementById('qrFile');
const decodeBtn = document.getElementById('decodeBtn');
const scannerMessage = document.getElementById('scannerMessage');
const previewContainer = document.getElementById('previewContainer');
const fallbackInput = document.getElementById('fallbackNumber');
const openInfoBtn = document.getElementById('openInfoBtn');
const manualMessage = document.getElementById('manualMessage');
const canvas = document.getElementById('qrCanvas');
const ctx = canvas.getContext('2d');

function showScannerMessage(text, isError = false) {
  scannerMessage.textContent = text;
  scannerMessage.classList.toggle('error', isError);
}

function showManualMessage(text, isError = false) {
  manualMessage.textContent = text;
  manualMessage.classList.toggle('error', isError);
}

function redirectToInfoPage(numeroCarteira) {
  if (!numeroCarteira) {
    showScannerMessage('Número da carteira inválido.', true);
    return;
  }
  const sanitized = numeroCarteira.trim();
  if (!sanitized) {
    showScannerMessage('Digite o número da carteira antes de continuar.', true);
    return;
  }
  try {
    const decodedUrl = new URL(sanitized, window.location.href);
    const id = decodedUrl.searchParams.get('id') || decodedUrl.searchParams.get('numero_carteira');
    if (id) {
      const targetParams = new URLSearchParams();
      targetParams.set('id', id);
      ['cv', 'q'].forEach(param => {
        const value = decodedUrl.searchParams.get(param);
        if (value) targetParams.set(param, value);
      });
      window.location.href = `informacoes-carteira.html?${targetParams.toString()}`;
      return;
    }
  } catch (erro) {
    // O QR pode conter apenas o numero da carteira.
  }

  window.location.href = `informacoes-carteira.html?id=${encodeURIComponent(sanitized)}`;
}

function updatePreview(image) {
  previewContainer.innerHTML = '';
  image.style.maxWidth = '100%';
  image.style.maxHeight = '100%';
  previewContainer.appendChild(image);
}

function decodeQRCodeFromImage(image) {
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);
  return code ? code.data : null;
}

function handleFileUpload() {
  const file = qrFileInput.files && qrFileInput.files[0];
  if (!file) {
    showScannerMessage('Selecione uma imagem de QR Code.', true);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      updatePreview(img);
      const decoded = decodeQRCodeFromImage(img);
      if (decoded) {
        showScannerMessage('QR Code detectado. Redirecionando...', false);
        setTimeout(() => {
          redirectToInfoPage(decoded);
        }, 500);
      } else {
        showScannerMessage('Não foi possível ler o QR Code na imagem. Use o número da carteira.', true);
      }
    };
    img.onerror = () => {
      showScannerMessage('Erro ao carregar a imagem. Tente outro arquivo.', true);
    };
    img.src = reader.result;
  };
  reader.onerror = () => {
    showScannerMessage('Não foi possível ler o arquivo. Tente novamente.', true);
  };
  reader.readAsDataURL(file);
}

decodeBtn?.addEventListener('click', handleFileUpload);
openInfoBtn?.addEventListener('click', () => {
  const numeroCarteira = fallbackInput.value;
  if (!numeroCarteira) {
    showManualMessage('Digite o número da carteira para acessar as informações.', true);
    return;
  }
  showManualMessage('Abrindo informações da carteira...', false);
  redirectToInfoPage(numeroCarteira);
});

qrFileInput?.addEventListener('change', () => {
  showScannerMessage('Imagem selecionada. Clique em Decodificar QR para ler.', false);
});
