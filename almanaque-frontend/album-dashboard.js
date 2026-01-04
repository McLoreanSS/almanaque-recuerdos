const gallery = document.getElementById("gallery");
const editToggle = document.getElementById("editToggle");
const editor = document.getElementById("editor");

// IMPORTANTE: Cambia esto por tu URL REAL
const API_URL = "https://almanaque-recuerdos-1.onrender.com/api/photos";

let editingId = null;

// Debug info
console.log("=== DASHBOARD INICIALIZADO ===");
console.log("API_URL:", API_URL);
console.log("Elementos encontrados:", {
  gallery: !!gallery,
  editToggle: !!editToggle,
  editor: !!editor,
  savePhoto: !!document.getElementById("savePhoto")
});

// Toggle editor
editToggle.addEventListener("click", () => {
  editor.classList.toggle("hidden");
  if (editor.classList.contains("hidden")) {
    editToggle.textContent = "✏️ Modo edición";
    resetForm();
  } else {
    editToggle.textContent = "❌ Cancelar";
  }
});

// Load photos
async function loadPhotos() {
  console.log("🔄 Cargando fotos...");
  
  try {
    const response = await fetch(API_URL);
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const photos = await response.json();
    console.log(`✅ ${photos.length} fotos recibidas`);

    gallery.innerHTML = "";

    if (photos.length === 0) {
      gallery.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; text-align:center; padding:40px; color:#666;">
          <div style="font-size:60px; margin-bottom:20px;">📷</div>
          <h3>No hay recuerdos aún</h3>
          <p>¡Agrega el primer recuerdo de nuestras locuras!</p>
          <button onclick="document.getElementById('editToggle').click()" 
                  style="margin-top:20px; padding:10px 20px; background:#2d2d2d; color:white; border:none; border-radius:20px; cursor:pointer;">
            ➕ Agregar primer recuerdo
          </button>
        </div>
      `;
      return;
    }

    // Ordenar por fecha (más reciente primero)
    photos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    photos.forEach(photo => {
      const card = document.createElement("div");
      card.className = "photo-card";
      card.dataset.id = photo._id;
      
      card.innerHTML = `
        <div class="photo-image">
          <img src="${photo.imageUrl}" 
               alt="${photo.text || 'Recuerdo'}" 
               loading="lazy"
               onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible'">
        </div>
        <div class="photo-info">
          <div class="photo-header">
            <h3>${photo.year || 'Sin año'}</h3>
            <span class="photo-date">${photo.date || ''}</span>
          </div>
          <p class="photo-text">${photo.text || ''}</p>
          <div class="photo-footer">
            <small>${formatDate(photo.createdAt)}</small>
            <button class="delete-btn" onclick="deletePhoto('${photo._id}')">🗑️</button>
          </div>
        </div>
      `;
      
      gallery.appendChild(card);
    });
    
  } catch (error) {
    console.error('❌ Error cargando fotos:', error);
    gallery.innerHTML = `
      <div class="error-state" style="grid-column: 1 / -1; text-align:center; padding:40px; color:#e74c3c;">
        <div style="font-size:60px; margin-bottom:20px;">⚠️</div>
        <h3>Error al cargar los recuerdos</h3>
        <p>${error.message}</p>
        <button onclick="loadPhotos()" 
                style="margin-top:20px; padding:10px 20px; background:#3498db; color:white; border:none; border-radius:5px; cursor:pointer;">
          🔄 Reintentar
        </button>
      </div>
    `;
  }
}

// Format date
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return '';
  }
}

// Save photo - VERSIÓN MEJORADA
document.getElementById("savePhoto").addEventListener("click", async function() {
  console.log("🎯 Botón Guardar clickeado");
  
  const imageFile = document.getElementById("image").files[0];
  const year = document.getElementById("year").value.trim();
  const date = document.getElementById("date").value.trim();
  const text = document.getElementById("text").value.trim();
  
  // Validaciones
  if (!imageFile) {
    alert("Seleccioná una imagen");
    return;
  }
  
  if (!year) {
    alert("Ingresá el año del recuerdo");
    return;
  }
  
  // Validar tipo de imagen
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!validTypes.includes(imageFile.type)) {
    alert("Formato no válido. Usá JPG, PNG o WebP.");
    return;
  }
  
  // Validar tamaño (5MB máximo)
  if (imageFile.size > 5 * 1024 * 1024) {
    alert("La imagen es muy grande. Máximo 5MB.");
    return;
  }
  
  // Botón loading state
  const originalText = this.textContent;
  this.textContent = "⏳ Subiendo...";
  this.disabled = true;
  
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("year", year);
  formData.append("date", date);
  formData.append("text", text);
  
  try {
    console.log("📤 Enviando imagen...");
    
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData
    });
    
    console.log("📥 Respuesta status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
// Save photo - VERSIÓN CORREGIDA
document.getElementById("savePhoto").addEventListener("click", async function() {
  console.log("🎯 Botón Guardar clickeado");
  
  const imageFile = document.getElementById("image").files[0];
  const year = document.getElementById("year").value.trim();
  const date = document.getElementById("date").value.trim();
  const text = document.getElementById("text").value.trim();
  
  // Validaciones
  if (!imageFile) {
    alert("Seleccioná una imagen");
    return;
  }
  
  if (!year) {
    alert("Ingresá el año del recuerdo");
    return;
  }
  
  // Validar tipo de imagen
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!validTypes.includes(imageFile.type)) {
    alert("Formato no válido. Usá JPG, PNG o WebP.");
    return;
  }
  
  // Validar tamaño (5MB máximo)
  if (imageFile.size > 5 * 1024 * 1024) {
    alert("La imagen es muy grande. Máximo 5MB.");
    return;
  }
  
  // Botón loading state
  const originalText = this.textContent;
  this.textContent = "⏳ Subiendo...";
  this.disabled = true;
  
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("year", year);
  formData.append("date", date);
  formData.append("text", text);
  
  try {
    console.log("📤 Enviando imagen...");
    
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData
    });
    
    console.log("📥 Respuesta status:", response.status);
    
    // Obtener respuesta como texto primero para debug
    const responseText = await response.text();
    console.log("📥 Respuesta texto:", responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ Error parseando JSON:", e);
      throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 100)}`);
    }
    
    console.log("✅ Respuesta parseada:", result);
    
    if (!response.ok) {
      throw new Error(result.message || `Error ${response.status}`);
    }
    
    // Verificar si fue exitoso
    if (result.success === false) {
      throw new Error(result.message || "Error del servidor");
    }
    
    console.log("✅ Foto guardada exitosamente:", result);
    
    // 1. Limpiar formulario
    document.getElementById("image").value = "";
    document.getElementById("year").value = "";
    document.getElementById("date").value = "";
    document.getElementById("text").value = "";
    
    // 2. Ocultar editor
    editor.classList.add("hidden");
    editToggle.textContent = "✏️ Modo edición";
    
    // 3. Mostrar mensaje de éxito
    alert(`¡Recuerdo guardado con éxito! 🎉\nAño: ${result.year}`);
    
    // 4. Agregar la foto inmediatamente al gallery
    addPhotoToGallery(result);
    
    // 5. También recargar después de 2 segundos
    setTimeout(() => {
      loadPhotos();
    }, 2000);
    
  } catch (error) {
    console.error("❌ Error completo al guardar:", error);
    alert(`Error al guardar: ${error.message}`);
  } finally {
    // Restaurar botón
    this.textContent = originalText;
    this.disabled = false;
  }
});
    
    // 4. Agregar la foto inmediatamente al gallery
    addPhotoToGallery(savedPhoto);
    
    // 5. También recargar después de 2 segundos (por si acaso)
    setTimeout(() => {
      loadPhotos();
    }, 2000);
    
  } catch (error) {
    console.error("❌ Error al guardar:", error);
    alert(`Error al guardar: ${error.message}`);
  } finally {
    // Restaurar botón
    this.textContent = originalText;
    this.disabled = false;
  }
});

// Función para agregar foto al gallery inmediatamente
function addPhotoToGallery(photo) {
  console.log("➕ Agregando foto al gallery:", photo);
  
  const gallery = document.getElementById("gallery");
  
  // Si hay mensaje de "no hay recuerdos", quitarlo
  const emptyState = gallery.querySelector('.empty-state');
  if (emptyState) {
    gallery.innerHTML = '';
  }
  
  // Crear tarjeta
  const card = document.createElement("div");
  card.className = "photo-card";
  card.dataset.id = photo._id;
  
  card.innerHTML = `
    <div class="photo-image">
      <img src="${photo.imageUrl}" 
           alt="${photo.text || 'Recuerdo'}" 
           loading="lazy"
           onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Imagen+no+disponible'">
    </div>
    <div class="photo-info">
      <div class="photo-header">
        <h3>${photo.year || 'Sin año'}</h3>
        <span class="photo-date">${photo.date || ''}</span>
      </div>
      <p class="photo-text">${photo.text || ''}</p>
      <div class="photo-footer">
        <small>${formatDate(photo.createdAt)}</small>
        <button class="delete-btn" onclick="deletePhoto('${photo._id}')">🗑️</button>
      </div>
    </div>
  `;
  
  // Agregar al principio del gallery
  if (gallery.firstChild) {
    gallery.insertBefore(card, gallery.firstChild);
  } else {
    gallery.appendChild(card);
  }
  
  // Animación de entrada
  card.style.opacity = '0';
  card.style.transform = 'translateY(-20px)';
  setTimeout(() => {
    card.style.transition = 'all 0.3s ease';
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  }, 10);
}

// Delete photo function
async function deletePhoto(id) {
  if (!confirm("¿Estás seguro de eliminar este recuerdo?")) return;
  
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Error al eliminar');
    
    // Eliminar del DOM con animación
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
      card.style.transition = 'all 0.3s ease';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.8)';
      setTimeout(() => {
        if (card.parentNode) {
          card.parentNode.removeChild(card);
        }
      }, 300);
    }
    
    // Si no quedan fotos, mostrar mensaje
    setTimeout(() => {
      const remainingCards = gallery.querySelectorAll('.photo-card');
      if (remainingCards.length === 0) {
        loadPhotos(); // Esto mostrará el estado vacío
      }
    }, 500);
    
  } catch (error) {
    console.error("Error eliminando foto:", error);
    alert("No se pudo eliminar el recuerdo");
  }
}

// Reset form
function resetForm() {
  document.getElementById("image").value = "";
  document.getElementById("year").value = "";
  document.getElementById("date").value = "";
  document.getElementById("text").value = "";
  editingId = null;
}

// Cargar fotos al inicio
loadPhotos();

// Auto-refresh cada 60 segundos (opcional)
setInterval(loadPhotos, 60000);
