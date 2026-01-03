const gallery = document.getElementById("gallery");
const editToggle = document.getElementById("editToggle");
const editor = document.getElementById("editor");

// Cambia esto a tu URL de Render cuando hagas deploy
// const API_URL = "https://tu-backend.onrender.com/api/photos";
const API_URL = "https://almanaque-recuerdos-1.onrender.com/api/photos";

let editingId = null; // Para modo edición

// Alternar modo edición
editToggle.addEventListener("click", () => {
  editor.classList.toggle("hidden");
  if (editor.classList.contains("hidden")) {
    editToggle.textContent = "✏️ Modo edición";
    resetForm();
  } else {
    editToggle.textContent = "❌ Cancelar";
  }
});

// Cargar todas las fotos
async function loadPhotos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al cargar fotos');
    
    const photos = await res.json();

    gallery.innerHTML = "";

    if (photos.length === 0) {
      gallery.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📷</div>
          <h3>No hay recuerdos aún</h3>
          <p>¡Agrega el primer recuerdo de vuestras locuras!</p>
          <button onclick="document.getElementById('editToggle').click()" class="add-first-btn">
            ➕ Agregar primer recuerdo
          </button>
        </div>
      `;
      return;
    }

    photos.forEach(photo => {
      const card = document.createElement("div");
      card.className = "photo-card";
      card.dataset.id = photo._id;
      
      card.innerHTML = `
        <div class="photo-image">
          <img src="${photo.imageUrl}" alt="${photo.text || 'Recuerdo'}" loading="lazy">
          <div class="photo-overlay">
            <button class="delete-btn" onclick="deletePhoto('${photo._id}')">🗑️</button>
          </div>
        </div>
        <div class="photo-info">
          <div class="photo-header">
            <h3>${photo.year || 'Sin año'}</h3>
            <span class="photo-date">${photo.date || ''}</span>
          </div>
          <p class="photo-text">${photo.text || ''}</p>
          <div class="photo-footer">
            <small>${formatDate(photo.createdAt)}</small>
            <button class="edit-btn" onclick="editPhoto('${photo._id}')">✏️ Editar</button>
          </div>
        </div>
      `;
      
      gallery.appendChild(card);
    });
  } catch (error) {
    console.error('Error:', error);
    gallery.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Error al cargar los recuerdos</h3>
        <p>Intenta recargar la página o verifica la conexión.</p>
        <button onclick="location.reload()" class="retry-btn">
          🔄 Recargar
        </button>
      </div>
    `;
  }
}

// Formatear fecha
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Guardar nueva foto o actualizar
document.getElementById("savePhoto").addEventListener("click", async () => {
  const imageFile = document.getElementById("image").files[0];
  const year = document.getElementById("year").value.trim();
  const date = document.getElementById("date").value.trim();
  const text = document.getElementById("text").value.trim();

  // Validaciones
  if (!editingId && !imageFile) {
    showAlert("Seleccioná una imagen", "warning");
    return;
  }

  if (!year) {
    showAlert("Ingresá el año del recuerdo", "warning");
    return;
  }

  const formData = new FormData();
  if (imageFile) formData.append("image", imageFile);
  formData.append("year", year);
  formData.append("date", date);
  formData.append("text", text);

  try {
    let response;
    if (editingId) {
      // Modo edición - necesitarías implementar PUT en backend
      showAlert("Función de edición pendiente", "info");
      return;
    } else {
      // Modo creación
      response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });
    }

    if (!response.ok) throw new Error('Error al guardar');
    
    const savedPhoto = await response.json();
    
    // Limpiar y resetear
    resetForm();
    editor.classList.add("hidden");
    editToggle.textContent = "✏️ Modo edición";
    
    showAlert("¡Recuerdo guardado con éxito! 📸", "success");
    loadPhotos();
  } catch (error) {
    console.error('Error:', error);
    showAlert("Error al guardar el recuerdo", "error");
  }
});

// Eliminar foto
async function deletePhoto(id) {
  if (!confirm("¿Estás seguro de eliminar este recuerdo?")) return;
  
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    
    if (!response.ok) throw new Error('Error al eliminar');
    
    showAlert("Recuerdo eliminado", "info");
    loadPhotos();
  } catch (error) {
    console.error('Error:', error);
    showAlert("No se pudo eliminar", "error");
  }
}

// Editar foto (pendiente de implementar backend)
async function editPhoto(id) {
  editingId = id;
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Error al cargar foto');
    
    const photo = await response.json();
    
    // Llenar formulario con datos existentes
    document.getElementById("year").value = photo.year || '';
    document.getElementById("date").value = photo.date || '';
    document.getElementById("text").value = photo.text || '';
    
    // Mostrar editor
    editor.classList.remove("hidden");
    editToggle.textContent = "❌ Cancelar";
    document.getElementById("savePhoto").textContent = "💾 Actualizar recuerdo";
    
    // Scroll al formulario
    editor.scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    console.error('Error:', error);
    showAlert("No se pudo cargar para editar", "error");
  }
}

// Resetear formulario
function resetForm() {
  document.getElementById("image").value = "";
  document.getElementById("year").value = "";
  document.getElementById("date").value = "";
  document.getElementById("text").value = "";
  editingId = null;
  document.getElementById("savePhoto").textContent = "💾 Guardar recuerdo";
}

// Mostrar alerta
function showAlert(message, type = "info") {
  // Remover alerta anterior si existe
  const existingAlert = document.querySelector('.alert-message');
  if (existingAlert) existingAlert.remove();
  
  const alert = document.createElement('div');
  alert.className = `alert-message alert-${type}`;
  alert.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="alert-close">×</button>
  `;
  
  document.body.appendChild(alert);
  
  // Auto-remover después de 4 segundos
  setTimeout(() => {
    if (alert.parentElement) alert.remove();
  }, 4000);
}

// Cargar fotos al inicio
loadPhotos();

// Recargar cada 30 segundos para ver nuevos recuerdos (si hay múltiples usuarios)
setInterval(loadPhotos, 30000);
