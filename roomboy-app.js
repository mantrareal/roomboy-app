// ... (el resto del código es igual, solo cambia la sección de 'uploadPhoto' y 'getTodayPhotos')

async function uploadPhoto() {
    // ... (código previo sin cambios)
    try {
        // ... (código de nombre de archivo y subida a storage sin cambios)
        const { data: urlData } = supabase.storage.from('task-photos').getPublicUrl(`public/${fileName}`);
        
        // *** CORRECCIÓN FINAL: Cambiado 'employee_id' a 'user_id' y otros campos ***
        const { error: dbError } = await supabase.from('task_photos').insert([{
            user_id: currentUser.id, // Usamos user_id
            // employee_name: currentUser.name, // Esta columna no parece existir en tu tabla
            table_number: parseInt(tableNumber),
            photo_url: urlData.publicUrl,
            status: 'pending'
        }]);
        if (dbError) throw dbError;

        // ... (resto del código sin cambios)
    } catch (error) {
        // ... (código de manejo de error sin cambios)
    }
}

async function getTodayPhotos() {
    if (!currentUser) return [];
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    // *** CORRECCIÓN FINAL: Cambiado 'employee_id' a 'user_id' ***
    const { data, error } = await supabase
        .from('task_photos')
        .select('*')
        .eq('user_id', currentUser.id) // Usamos la columna correcta
        .gte('created_at', startOfDay)
        .lt('created_at', endOfDay)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error obteniendo fotos de hoy:', error);
        return [];
    }
    return data || [];
}

// --- Pega aquí el resto de funciones de roomboy-app.js del bloque anterior ---
// (El código completo está abajo para que solo copies y pegues una vez)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let selectedPhoto = null;
let currentUser = null;
function switchToDashboard() { if (confirm('¿Cambiar al dashboard? Esta vista es mejor para PC.')) { window.location.href = 'roomboy-dashboard.html'; } }
function logout() { if (confirm('¿Estás seguro de cerrar sesión?')) { localStorage.removeItem('userSession'); window.location.href = 'index.html'; } }
function showMessage(text, type = 'info') { const container = document.getElementById('messageContainer'); container.innerHTML = `<div class="message ${type}">${text}</div>`; setTimeout(() => { container.innerHTML = ''; }, 5000); }
function triggerFileInput() { document.getElementById('photoInput').click(); }
document.getElementById('photoInput').addEventListener('change', function(e) { const file = e.target.files[0]; if (!file) return; if (file.size > 5 * 1024 * 1024) { showMessage('❌ La imagen es muy grande (Máx 5MB).', 'error'); return; } if (!file.type.startsWith('image/')) { showMessage('❌ Solo se permiten archivos de imagen.', 'error'); return; } selectedPhoto = file; const reader = new FileReader(); reader.onload = e => { const preview = document.getElementById('photoPreview'); preview.src = e.target.result; preview.style.display = 'block'; }; reader.readAsDataURL(file); updateUploadButton(); });
function updateUploadButton() { const tableNumber = document.getElementById('tableNumber').value; const uploadBtn = document.getElementById('uploadBtn'); uploadBtn.disabled = !(selectedPhoto && tableNumber && tableNumber >= 1 && tableNumber <= 150); }
document.getElementById('tableNumber').addEventListener('input', updateUploadButton);
async function uploadPhoto() { if (!selectedPhoto || !currentUser) return; const tableNumber = document.getElementById('tableNumber').value; const uploadBtn = document.getElementById('uploadBtn'); const todayPhotos = await getTodayPhotos(); if (todayPhotos.length >= 2) { showMessage('❌ Ya has subido las 2 fotos permitidas hoy.', 'error'); return; } uploadBtn.disabled = true; uploadBtn.textContent = 'Subiendo...'; try { const fileExt = selectedPhoto.name.split('.').pop(); const fileName = `${currentUser.id}_${Date.now()}_mesa_${tableNumber}.${fileExt}`; const { error: uploadError } = await supabase.storage .from('task-photos') .upload(`public/${fileName}`, selectedPhoto); if (uploadError) throw uploadError; const { data: urlData } = supabase.storage.from('task-photos').getPublicUrl(`public/${fileName}`); const { error: dbError } = await supabase.from('task_photos').insert([{ user_id: currentUser.id, table_number: parseInt(tableNumber), photo_url: urlData.publicUrl, status: 'pending' }]); if (dbError) throw dbError; showMessage('✅ ¡Foto subida exitosamente!', 'success'); resetForm(); await updatePhotoCounter(); await loadTodayPhotos(); } catch (error) { console.error('Error al subir:', error); showMessage(`❌ Error: ${error.message}`, 'error'); } finally { uploadBtn.disabled = false; uploadBtn.textContent = '📤 Subir Foto'; } }
function resetForm() { selectedPhoto = null; document.getElementById('photoInput').value = ''; document.getElementById('photoPreview').style.display = 'none'; document.getElementById('tableNumber').value = ''; updateUploadButton(); }
async function getTodayPhotos() { if (!currentUser) return []; const today = new Date(); const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString(); const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString(); const { data, error } = await supabase .from('task_photos') .select('*') .eq('user_id', currentUser.id) .gte('created_at', startOfDay) .lt('created_at', endOfDay) .order('created_at', { ascending: false }); if (error) { console.error('Error obteniendo fotos de hoy:', error); return []; } return data || []; }
async function updatePhotoCounter() { const todayPhotos = await getTodayPhotos(); const count = todayPhotos.length; document.getElementById('photoCount').textContent = count; const progressPercent = (count / 2) * 100; document.getElementById('progressFill').style.width = `${progressPercent}%`; if (count >= 2) { document.getElementById('uploadSection').style.display = 'none'; showMessage('✅ ¡Felicidades! Completaste tus 2 fotos del día.', 'success'); } else { document.getElementById('uploadSection').style.display = 'block'; } }
async function loadTodayPhotos() { const todayPhotos = await getTodayPhotos(); const grid = document.getElementById('todayPhotoGrid'); if (todayPhotos.length === 0) { grid.innerHTML = '<p>Aún no has subido fotos hoy</p>'; return; } grid.innerHTML = todayPhotos.map(photo => ` <div class="photo-item"> <img src="${photo.photo_url}" alt="Foto de mesa ${photo.table_number}" loading="lazy"> <p>Mesa ${photo.table_number}</p> <p style="font-size: 0.8rem; color: ${photo.status === 'approved' ? '#4caf50' : '#ff9800'}"> ${photo.status === 'approved' ? '✅ Aprobada' : '⏳ Pendiente'} </p> </div> `).join(''); }
async function initializeApp() { const session = localStorage.getItem('userSession'); if (!session) { window.location.href = 'index.html'; return; } try { currentUser = JSON.parse(session); if (currentUser.role !== 'roomboy') { showMessage('❌ Acceso denegado.', 'error'); setTimeout(() => { window.location.href = 'index.html'; }, 2000); return; } document.getElementById('userName').textContent = currentUser.name || 'Room Boy'; await updatePhotoCounter(); await loadTodayPhotos(); } catch (error) { console.error('Error de inicialización:', error); localStorage.removeItem('userSession'); window.location.href = 'index.html'; } }
document.addEventListener('DOMContentLoaded', initializeApp);

