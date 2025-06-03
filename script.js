const canvas = document.getElementById("canvas");
const textInput = document.getElementById("prop-text");
const fontSizeInput = document.getElementById("prop-font-size");
const colorInput = document.getElementById("prop-color");
const imageUpload = document.getElementById("upload-image");
const saveBtn = document.getElementById("save-btn");
const output = document.getElementById("output");

const widthInput = document.getElementById("prop-width");
const heightInput = document.getElementById("prop-height");
const cropBtn = document.getElementById("crop-image");
const imageControls = document.getElementById("image-controls");
const removeBtn = document.getElementById("remove-element");
const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");

let selectedElement = null;
const undoStack = [];
const redoStack = [];

// Save current canvas state for undo
const saveState = () => {
  undoStack.push(canvas.innerHTML);
  redoStack.length = 0; // clear redo stack on new action
};

// Utility: convert rgb(...) string to hex color code
const rgbToHex = (rgb) => {
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
};

// Make an element draggable inside canvas
const makeDraggable = (el) => {
  let offsetX, offsetY;

  const onMouseMove = (e) => {
    el.style.left = `${e.pageX - canvas.offsetLeft - offsetX}px`;
    el.style.top = `${e.pageY - canvas.offsetTop - offsetY}px`;
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  el.addEventListener("mousedown", (e) => {
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
};

// Add new editable text element to canvas
document.getElementById("add-text").addEventListener("click", () => {
  saveState();

  const div = document.createElement("div");
  div.className = "element";
  div.textContent = "Editable Text";
  div.style.top = "10px";
  div.style.left = "10px";

  makeDraggable(div);
  canvas.appendChild(div);
});

// Handle image upload and add to canvas
imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  saveState();

  const reader = new FileReader();
  reader.onload = (evt) => {
    const img = document.createElement("img");
    img.src = evt.target.result;
    img.style.maxWidth = "100px";

    const wrapper = document.createElement("div");
    wrapper.className = "element";
    wrapper.style.top = "100px";
    wrapper.style.left = "100px";
    wrapper.appendChild(img);

    makeDraggable(wrapper);
    canvas.appendChild(wrapper);
  };
  reader.readAsDataURL(file);
});

// Handle canvas click for selection (event delegation)
canvas.addEventListener("click", (e) => {
  const el = e.target.closest(".element");
  if (el) {
    if (selectedElement) selectedElement.classList.remove("selected");
    selectedElement = el;
    selectedElement.classList.add("selected");

    const style = getComputedStyle(selectedElement);
    textInput.value = selectedElement.textContent || "";
    fontSizeInput.value = parseInt(style.fontSize) || 16;
    colorInput.value = rgbToHex(style.color);

    const img = selectedElement.querySelector("img");
    if (img) {
      imageControls.style.display = "block";
      widthInput.value = img.width;
      heightInput.value = img.height;
    } else {
      imageControls.style.display = "none";
    }
  } else {
    if (selectedElement) selectedElement.classList.remove("selected");
    selectedElement = null;
    imageControls.style.display = "none";
  }
});

// Update selected element's text content
textInput.addEventListener("input", () => {
  if (!selectedElement) return;
  selectedElement.textContent = textInput.value;
});

// Update font size of selected element
fontSizeInput.addEventListener("input", () => {
  if (!selectedElement) return;
  selectedElement.style.fontSize = `${fontSizeInput.value}px`;
});

// Update color of selected element
colorInput.addEventListener("input", () => {
  if (!selectedElement) return;
  selectedElement.style.color = colorInput.value;
});

// Update image width if selected element contains image
widthInput.addEventListener("input", () => {
  if (!selectedElement) return;
  const img = selectedElement.querySelector("img");
  if (img) img.width = parseInt(widthInput.value, 10);
});

// Update image height if selected element contains image
heightInput.addEventListener("input", () => {
  if (!selectedElement) return;
  const img = selectedElement.querySelector("img");
  if (img) img.height = parseInt(heightInput.value, 10);
});

// Simulated crop button (placeholder)
cropBtn.addEventListener("click", () => {
  alert("Crop is not implemented. Use Canvas API for real cropping.");
});

// Remove selected element from canvas
removeBtn.addEventListener("click", () => {
  if (!selectedElement) return;
  saveState();
  selectedElement.remove();
  selectedElement = null;
  imageControls.style.display = "none";
});

// Undo last action
undoBtn.addEventListener("click", () => {
  if (undoStack.length === 0) return;

  redoStack.push(canvas.innerHTML);
  canvas.innerHTML = undoStack.pop();
  rebindElements();
});

// Redo last undone action
redoBtn.addEventListener("click", () => {
  if (redoStack.length === 0) return;

  undoStack.push(canvas.innerHTML);
  canvas.innerHTML = redoStack.pop();
  rebindElements();
});

// Rebind draggable functionality after undo/redo
const rebindElements = () => {
  canvas.querySelectorAll(".element").forEach(makeDraggable);
};

// Save current canvas content to output div
saveBtn.addEventListener("click", () => {
  let html = "";

  canvas.querySelectorAll(".element").forEach((el) => {
    const img = el.querySelector("img");
    const style = getComputedStyle(el);

    if (img) {
      html += `<img src="${img.src}" style="width:${img.width}px; height:${img.height}px; margin:5px;">`;
    } else if (el.textContent.trim()) {
      html += `<div style="font-size:${style.fontSize}; color:${style.color}; margin:5px 0;">${el.textContent}</div>`;
    }
  });

  output.innerHTML = html ? `<h3>Saved Output:</h3>${html}` : "<em>No content to save</em>";
});

