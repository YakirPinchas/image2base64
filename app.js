const modeImageToBase64Btn = document.getElementById("modeImageToBase64");
const modeBase64ToImageBtn = document.getElementById("modeBase64ToImage");
const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const previewImage = document.getElementById("previewImage");
const previewPlaceholder = document.getElementById("previewPlaceholder");
const thumbsWrapper = document.getElementById("thumbsWrapper");
const thumbsGrid = document.getElementById("thumbsGrid");
const thumbsPlaceholder = document.getElementById("thumbsPlaceholder");
const thumbsCountLabel = document.getElementById("thumbsCountLabel");
const leftError = document.getElementById("leftError");
const formatSelect = document.getElementById("formatSelect");
const qualityRange = document.getElementById("qualityRange");
const qualityValue = document.getElementById("qualityValue");
const base64OnlyCheckbox = document.getElementById("base64OnlyCheckbox"); 
const optionsRow = document.getElementById("optionsRow");
const toggleAdvancedBtn = document.getElementById("toggleAdvancedBtn");
const advancedOptions = document.getElementById("advancedOptions");
const resizeModeSelect = document.getElementById("resizeMode");
const resizeWidthInput = document.getElementById("resizeWidth");
const resizeHeightInput = document.getElementById("resizeHeight");
const watermarkTextInput = document.getElementById("watermarkText");
const panelImageToBase64 = document.getElementById("panelImageToBase64");
const panelBase64ToImage = document.getElementById("panelBase64ToImage");
const cardsContainer = document.getElementById("cardsContainer");
const downloadAllRow = document.getElementById("downloadAllRow");
const downloadAllBtn = document.getElementById("downloadAllBtn");
const copyAllBtn = document.getElementById("copyAllBtn");
const imagesSummaryText = document.getElementById("imagesSummaryText");
const rightErrorImg = document.getElementById("rightErrorImg");
const singleBase64Input = document.getElementById("singleBase64Input");
const previewImageB64 = document.getElementById("previewImageB64");
const previewPlaceholderB64 = document.getElementById("previewPlaceholderB64");
const singleClearBtn = document.getElementById("singleClearBtn");
const singleCopyBtn = document.getElementById("singleCopyBtn");
const singleDownloadImageBtn = document.getElementById("singleDownloadImageBtn");
const rightErrorB64 = document.getElementById("rightErrorB64");
const b64InfoText = document.getElementById("b64InfoText");

let currentMode = "imageToBase64";
let lastFiles = null;
let currentImageDataUrl = "";
let imageItems = []; // { index, name, base64, dataUrl }
let currentPreviewIndex = -1;

function setMode(mode) {
  currentMode = mode;
  leftError.textContent = "";
  rightErrorImg.textContent = "";
  rightErrorImg.style.color = "#f97373";
  rightErrorB64.textContent = "";
  rightErrorB64.style.color = "#f97373";
  b64InfoText.textContent = "";
  previewImage.classList.remove("zoomed");
  previewImageB64.classList.remove("zoomed");
  previewImage.style.display = "none";
  previewImage.src = "";
  previewPlaceholder.style.display = "block";
  currentPreviewIndex = -1;
  thumbsGrid.innerHTML = "";
  thumbsPlaceholder.style.display = "block";
  thumbsCountLabel.textContent = "";
  thumbsWrapper.style.display = "none";
  previewImageB64.style.display = "none";
  previewImageB64.src = "";
  previewPlaceholderB64.style.display = "block";

  if (mode === "imageToBase64") {
    modeImageToBase64Btn.classList.add("active");
    modeBase64ToImageBtn.classList.remove("active");
    document.getElementById("leftTitle").textContent = "Upload image(s)";
    document.getElementById("leftHint").textContent = "Select one or multiple images";
    panelImageToBase64.classList.remove("hidden");
    panelBase64ToImage.classList.add("hidden");
    optionsRow.classList.remove("disabled");
    uploadArea.style.pointerEvents = "auto";
    fileInput.disabled = false;
  } else {
    modeImageToBase64Btn.classList.remove("active");
    modeBase64ToImageBtn.classList.add("active");
    document.getElementById("leftTitle").textContent = "Base64 input";
    document.getElementById("leftHint").textContent = "Paste Base64 to render image";
    panelImageToBase64.classList.add("hidden");
    panelBase64ToImage.classList.remove("hidden");
    optionsRow.classList.add("disabled");
    uploadArea.style.pointerEvents = "none";
    fileInput.disabled = true;
    imageItems = [];
    renderCards();
  }
}

modeImageToBase64Btn.addEventListener("click", () => setMode("imageToBase64"));
modeBase64ToImageBtn.addEventListener("click", () => setMode("base64ToImage"));

toggleAdvancedBtn.addEventListener("click", () => {
  advancedOptions.classList.toggle("visible");
  toggleAdvancedBtn.textContent = advancedOptions.classList.contains("visible")
    ? "Less options"
    : "More options";
});

uploadArea.addEventListener("click", () => {
  if (currentMode === "imageToBase64") {
    fileInput.click();
  }
});

uploadArea.addEventListener("dragover", (e) => {
  if (currentMode === "imageToBase64") {
    e.preventDefault();
    uploadArea.style.borderColor = varCss("accent");
    uploadArea.style.boxShadow = "0 0 0 1px rgba(56, 189, 248, 0.25)";
  }
});

uploadArea.addEventListener("dragleave", () => {
  if (currentMode === "imageToBase64") {
    uploadArea.style.borderColor = "rgba(148, 163, 184, 0.7)";
    uploadArea.style.boxShadow = "none";
  }
});

uploadArea.addEventListener("drop", (e) => {
  uploadArea.style.borderColor = "rgba(148, 163, 184, 0.7)";
  uploadArea.style.boxShadow = "none";
  if (currentMode !== "imageToBase64") return;
  e.preventDefault();
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    handleFiles(e.dataTransfer.files);
  }
});

fileInput.addEventListener("change", () => {
  if (fileInput.files && fileInput.files.length > 0) {
    handleFiles(fileInput.files);
  }
});

function handleFiles(fileList) {
  leftError.textContent = "";
  rightErrorImg.textContent = "";
  rightErrorImg.style.color = "#f97373";
  previewImage.style.display = "none";
  previewImage.src = "";
  previewPlaceholder.style.display = "block";
  currentPreviewIndex = -1;
  previewImage.classList.remove("zoomed");
  thumbsGrid.innerHTML = "";
  thumbsPlaceholder.style.display = "block";
  thumbsCountLabel.textContent = "";
  thumbsWrapper.style.display = "none";

  const files = Array.from(fileList).filter((f) => {
    if (f.type && f.type.startsWith("image/")) return true;
    const name = (f.name || "").toLowerCase();
    return /\.(png|jpe?g|webp|gif|bmp|svg|svgz)$/i.test(name);
  });

  if (files.length === 0) {
    leftError.textContent = "Please select one or more valid image files.";
    imageItems = [];
    renderCards();
    return;
  }

  lastFiles = files;
  imageItems = [];

  if (files.length === 1) {
    previewPlaceholder.textContent = "Preview of: " + files[0].name;
  } else {
    previewPlaceholder.textContent = `Multiple images selected (${files.length}). Previewing first one.`;
  }

  let processedCount = 0;
  files.forEach((file, index) => {
    processSingleFile(file, (base64, dataUrl) => {
      if (base64 && dataUrl) {
        imageItems.push({
          index,
          name: file.name,
          base64,
          dataUrl,
        });
      }
      processedCount++;
      if (processedCount === files.length) {
        imageItems.sort((a, b) => a.index - b.index);
        renderCards();
        renderThumbnails();
        if (imageItems.length > 0) {
          setActivePreview(0);
        }
      }
    });
  });
}

function processSingleFile(file, callback) {
  const isImageByType = file.type && file.type.startsWith("image/");
  const isImageByName = (file.name || "").toLowerCase().match(/\.(png|jpe?g|webp|gif|bmp|svg|svgz)$/i);

  if (!isImageByType && !isImageByName) {
    callback(null, null);
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const originalDataUrl = event.target.result;
    const chosenFormat = formatSelect.value;
    const quality = Number(qualityRange.value) / 100;

    if (
      chosenFormat === "original" ||
      (typeof file.type === "string" && file.type === "image/svg+xml") ||
      /\.svgz?$/i.test(file.name || "")
    ) {
      const base64String = (originalDataUrl.split(",")[1] || "").trim();
      callback(base64String, originalDataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        const mode = resizeModeSelect.value;
        let targetW = img.width;
        let targetH = img.height;

        const maxW = Number(resizeWidthInput.value) || 0;
        const maxH = Number(resizeHeightInput.value) || 0;

        if (mode === "fit" && (maxW > 0 || maxH > 0)) {
          let scale = 1;
          if (maxW > 0 && img.width > maxW) {
            scale = maxW / img.width;
          }
          if (maxH > 0 && img.height * scale > maxH) {
            scale = maxH / img.height;
          }
          targetW = Math.round(img.width * scale);
          targetH = Math.round(img.height * scale);
        } else if (mode === "exact" && maxW > 0 && maxH > 0) {
          targetW = maxW;
          targetH = maxH;
        } else if (mode === "up2") {
          targetW = img.width * 2;
          targetH = img.height * 2;
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const watermark = watermarkTextInput.value.trim();
        if (watermark) {
          const padding = Math.max(8, targetW * 0.015);
          const fontSize = Math.max(14, Math.round(targetW * 0.035));
          ctx.font = `${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
          ctx.textBaseline = "bottom";
          const metrics = ctx.measureText(watermark);
          const boxW = metrics.width + padding * 2;
          const boxH = fontSize + padding;
          const x = targetW - boxW - padding;
          const y = targetH - padding;
          ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
          ctx.fillRect(x, y - boxH, boxW, boxH);
          ctx.fillStyle = "rgba(248, 250, 252, 0.95)";
          ctx.fillText(watermark, x + padding, y - padding * 0.2);
        }

        let mime = "image/png";
        if (chosenFormat === "jpeg") mime = "image/jpeg";
        else if (chosenFormat === "webp") mime = "image/webp";

        const dataUrl = canvas.toDataURL(mime, quality);
        const base64String = (dataUrl.split(",")[1] || "").trim();
        callback(base64String, dataUrl);
      } catch (err) {
        leftError.textContent = "Failed to process image: " + file.name;
        callback(null, null);
      }
    };

    img.onerror = () => {
      leftError.textContent = "Could not load image data for: " + file.name;
      callback(null, null);
    };

    img.src = originalDataUrl;
  };

  reader.onerror = () => {
    leftError.textContent = "Failed to read file: " + file.name;
    callback(null, null);
  };
  reader.readAsDataURL(file);
}

function renderCards() {
  cardsContainer.innerHTML = "";
  rightErrorImg.textContent = "";
  rightErrorImg.style.color = "#f97373";
  
  const isBase64Only = base64OnlyCheckbox.checked;

  if (!imageItems || imageItems.length === 0) {
    imagesSummaryText.textContent = "No images yet.";
    downloadAllRow.classList.add("disabled");
    return;
  }

  imagesSummaryText.textContent = `${imageItems.length} image${imageItems.length > 1 ? "s" : ""} converted.`;
  downloadAllRow.classList.remove("disabled");

  imageItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "b64-card";

    const header = document.createElement("div");
    header.className = "b64-card-header";
    const leftSpan = document.createElement("span");
    leftSpan.innerHTML = `Base64 for: <strong>${item.name}</strong>`;
    const rightSpan = document.createElement("span");
    rightSpan.innerHTML = `Size: ${Math.round(item.base64.length / 1024)} KB`;
    header.appendChild(leftSpan);
    header.appendChild(rightSpan);

    const textarea = document.createElement("textarea");
    const mimeHeader = isBase64Only ? "" : `data:${getDataUrlMime(item.dataUrl)};base64,`;
    textarea.value = mimeHeader + item.base64;
    textarea.readOnly = true;

    const buttonsRow = document.createElement("div");
    buttonsRow.className = "b64-card-buttons";

    const copyBtn = document.createElement("button");
    copyBtn.className = "btn small";
    copyBtn.textContent = "Copy to clipboard";
    copyBtn.addEventListener("click", async () => {
      rightErrorImg.textContent = "";
      rightErrorImg.style.color = "#f97373";
      if (!textarea.value.trim()) return;

      try {
        await navigator.clipboard.writeText(textarea.value);
        rightErrorImg.style.color = "#4ade80";
        rightErrorImg.textContent = `Copied Base64 for ${item.name}`;
        setTimeout(() => {
          rightErrorImg.textContent = "";
          rightErrorImg.style.color = "#f97373";
        }, 1500);
      } catch {
        rightErrorImg.textContent = "Clipboard not available in this browser.";
      }
    });

    const downloadTxtBtn = document.createElement("button");
    downloadTxtBtn.className = "btn small";
    downloadTxtBtn.textContent = "Download .txt";
    downloadTxtBtn.addEventListener("click", () => {
      if (!textarea.value.trim()) return;
      const blob = new Blob([textarea.value.trim()], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeName = item.name.replace(/[^a-z0-9_\-\.]/gi, "_");
      link.download = `${safeName || "image"}-base64.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });

    const downloadImageBtn = document.createElement("button");
    downloadImageBtn.className = "btn primary small";
    downloadImageBtn.textContent = "Download image";
    downloadImageBtn.addEventListener("click", () => {
      rightErrorImg.textContent = "";
      rightErrorImg.style.color = "#f97373";
      if (!item.dataUrl) {
        rightErrorImg.textContent = "No image data to download.";
        return;
      }

      const blob = dataUrlToBlob(item.dataUrl);
      if (!blob) {
        rightErrorImg.textContent = "Could not prepare image for download.";
        return;
      }

      const mime = getDataUrlMime(item.dataUrl);
      let ext = "png";
      if (mime === "image/jpeg") ext = "jpg";
      else if (mime === "image/webp") ext = "webp";
      else if (mime === "image/gif") ext = "gif";

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = item.name.replace(/[^a-z0-9_\-\.]/gi, "_") || "image";
      link.href = url;
      link.download = `${safeName}-converted.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });

    buttonsRow.appendChild(copyBtn);
    buttonsRow.appendChild(downloadTxtBtn);
    buttonsRow.appendChild(downloadImageBtn);

    card.appendChild(header);
    card.appendChild(textarea);
    card.appendChild(buttonsRow);
    cardsContainer.appendChild(card);
  });
}

function renderThumbnails() {
  thumbsGrid.innerHTML = "";
  if (!imageItems || imageItems.length === 0) {
    thumbsWrapper.style.display = "none";
    return;
  }

  thumbsWrapper.style.display = "block";
  thumbsPlaceholder.style.display = "none";
  thumbsCountLabel.textContent = `${imageItems.length} image${imageItems.length > 1 ? "s" : ""}`;

  imageItems.forEach((item, index) => {
    const thumbItem = document.createElement("div");
    thumbItem.className = "thumb-item";
    const img = document.createElement("img");
    img.src = item.dataUrl;
    img.alt = item.name;
    thumbItem.appendChild(img);
    thumbItem.addEventListener("click", () => {
      setActivePreview(index);
    });
    thumbsGrid.appendChild(thumbItem);
  });
}

function setActivePreview(index) {
  if (!imageItems[index]) return;
  currentPreviewIndex = index;
  const item = imageItems[index];
  currentImageDataUrl = item.dataUrl;
  previewImage.src = currentImageDataUrl;
  previewImage.style.display = "block";
  previewPlaceholder.style.display = "none";
  previewImage.classList.remove("zoomed");

  Array.from(thumbsGrid.children).forEach((el, i) => {
    if (i === index) el.classList.add("active");
    else el.classList.remove("active");
  });
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

const reprocessImages = () => {
  if (currentMode === "imageToBase64" && lastFiles && lastFiles.length > 0) {
    handleFiles(lastFiles);
  }
};

const debouncedReprocess = debounce(reprocessImages, 350);

qualityRange.addEventListener("input", () => {
  qualityValue.textContent = qualityRange.value + "%";
  debouncedReprocess();
});

formatSelect.addEventListener("change", () => {
  debouncedReprocess();
});

base64OnlyCheckbox.addEventListener("change", () => {
  if (currentMode === "imageToBase64" && imageItems.length > 0) {
    renderCards();
  }
});

resizeModeSelect.addEventListener("change", () => {
  debouncedReprocess();
});

resizeWidthInput.addEventListener("input", () => {
  debouncedReprocess();
});

resizeHeightInput.addEventListener("input", () => {
  debouncedReprocess();
});

watermarkTextInput.addEventListener("input", () => {
  debouncedReprocess();
});

downloadAllBtn.addEventListener("click", () => {
  rightErrorImg.textContent = "";
  rightErrorImg.style.color = "#f97373";
  if (!imageItems || imageItems.length === 0) {
    rightErrorImg.textContent = "Nothing to download. Please upload image(s) first.";
    return;
  }
  
  const isBase64Only = base64OnlyCheckbox.checked;
  let content = "";
  imageItems.forEach((item) => {
    const mimeHeader = isBase64Only ? "" : `data:${getDataUrlMime(item.dataUrl)};base64,`;
    content += `// ${item.name}\n${mimeHeader}${item.base64}\n\n`;
  });

  const blob = new Blob([content.trim()], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `images-base64-all.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

copyAllBtn.addEventListener("click", async () => {
  rightErrorImg.textContent = "";
  rightErrorImg.style.color = "#f97373";
  if (!imageItems || imageItems.length === 0) {
    rightErrorImg.textContent = "Nothing to copy. Please upload image(s) first.";
    return;
  }
  
  const isBase64Only = base64OnlyCheckbox.checked;
  let content = "";
  imageItems.forEach((item) => {
    const mimeHeader = isBase64Only ? "" : `data:${getDataUrlMime(item.dataUrl)};base64,`;
    content += `// ${item.name}\n${mimeHeader}${item.base64}\n\n`;
  });

  try {
    await navigator.clipboard.writeText(content.trim());
    rightErrorImg.style.color = "#4ade80";
    rightErrorImg.textContent = `${imageItems.length} Base64 blocks copied.`;
    setTimeout(() => {
      rightErrorImg.textContent = "";
      rightErrorImg.style.color = "#f97373";
    }, 2000);
  } catch {
    rightErrorImg.textContent = "Clipboard not available in this browser.";
  }
});

function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(",");
  if (parts.length < 2) return null;

  const mimeMatch = parts[0].match(/data:(.*?);base64/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";

  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function getDataUrlMime(dataUrl) {
  const match = dataUrl.match(/data:(.*?);base64/);
  return match ? match[1] : 'image/png';
}

function varCss(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`);
}

previewImage.addEventListener("click", () => {
  previewImage.classList.toggle("zoomed");
});
previewImageB64.addEventListener("click", () => {
  previewImageB64.classList.toggle("zoomed");
});

singleClearBtn.addEventListener("click", () => {
  singleBase64Input.value = "";
  rightErrorB64.textContent = "";
  rightErrorB64.style.color = "#f97373";
  b64InfoText.textContent = "";
  currentImageDataUrl = "";
  previewImageB64.src = "";
  previewImageB64.style.display = "none";
  previewPlaceholderB64.style.display = "block";
  previewImageB64.classList.remove("zoomed");
});

singleCopyBtn.addEventListener("click", async () => {
  rightErrorB64.textContent = "";
  rightErrorB64.style.color = "#f97373";
  const val = singleBase64Input.value.trim();
  if (!val) {
    rightErrorB64.textContent = "Nothing to copy.";
    return;
  }
  try {
    await navigator.clipboard.writeText(val);
    rightErrorB64.style.color = "#4ade80";
    rightErrorB64.textContent = "Copied Base64.";
    setTimeout(() => {
      rightErrorB64.textContent = "";
      rightErrorB64.style.color = "#f97373";
    }, 1500);
  } catch {
    rightErrorB64.textContent = "Clipboard not available in this browser.";
  }
});

singleBase64Input.addEventListener("input", () => {
  rightErrorB64.textContent = "";
  b64InfoText.textContent = "";
  currentImageDataUrl = "";
  previewImageB64.style.display = "none";
  previewImageB64.classList.remove("zoomed");
  previewPlaceholderB64.style.display = "block";

  const base64 = singleBase64Input.value.trim();
  if (!base64) {
    return;
  }

  let dataUrl = base64;
  if (!base64.startsWith("data:")) {
    dataUrl = "data:image/png;base64," + base64;
  }

  const base64Part = dataUrl.split(",")[1] || "";
  if (base64Part.length < 10) {
    rightErrorB64.textContent = "Base64 string is too short/invalid.";
    return;
  }

  const img = new Image();
  img.onload = () => {
    currentImageDataUrl = dataUrl;
    previewImageB64.src = currentImageDataUrl;
    previewImageB64.style.display = "block";
    previewPlaceholderB64.style.display = "none";

    const mime = getDataUrlMime(currentImageDataUrl);
    const kb = Math.round(base64Part.length * 0.75 / 1024); 
    b64InfoText.textContent = `Detected type: ${mime} • Approx. size: ${kb} KB`;
  };
  img.onerror = () => {
    rightErrorB64.textContent = "Invalid Base64 string.";
  };
  img.src = dataUrl;
});

singleDownloadImageBtn.addEventListener("click", () => {
  rightErrorB64.style.color = "#f97373";
  rightErrorB64.textContent = "";
  if (!currentImageDataUrl) {
    rightErrorB64.textContent = "No image to download. Paste valid Base64 first.";
    return;
  }

  const blob = dataUrlToBlob(currentImageDataUrl);
  if (!blob) {
    rightErrorB64.textContent = "Could not prepare image for download.";
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "image-from-base64.png";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 0);

  setTimeout(() => {
    try {
      window.open(currentImageDataUrl, "_blank");
    } catch (e) {}
  }, 400);

  rightErrorB64.style.color = "#4ade80";
  rightErrorB64.textContent = "Download initiated.";
  setTimeout(() => {
    rightErrorB64.textContent = "";
    rightErrorB64.style.color = "#f97373";
  }, 1500);
});

setMode("imageToBase64");
