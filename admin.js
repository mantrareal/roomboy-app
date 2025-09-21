// NOTA: Este es un esqueleto funcional para tu admin.js.
// Deberás conectar las funciones a tu base de datos Supabase.

document.addEventListener('DOMContentLoaded', () => {
    console.log('Panel de Administrador cargado.');

    // Lógica para manejar el cambio de pestañas
    const tabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Quitar clase activa de todas las pestañas y contenidos
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Añadir clase activa a la pestaña y contenido seleccionados
            tab.classList.add('active');
            const targetContentId = `${tab.dataset.tab}-content`;
            document.getElementById(targetContentId).classList.add('active');
            
            console.log(`Cambiando a la pestaña: ${tab.dataset.tab}`);
            // Aquí puedes llamar a funciones para cargar datos de la pestaña activa
            // Ejemplo: if (tab.dataset.tab === 'gallery') loadGalleryPhotos();
        });
    });

    // Cargar datos iniciales para la primera pestaña (Galería)
    loadInitialData();
});

function loadInitialData() {
    // Simula la carga del nombre del administrador
    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl) {
        adminNameEl.textContent = 'Admin'; // Reemplazar con el nombre real del usuario
    }
    
    // Simula la carga de datos para los gráficos
    loadCharts();
}

function loadCharts() {
    // Gráfico de Cumplimiento Diario (Ejemplo)
    const dailyCtx = document.getElementById('dailyComplianceChart')?.getContext('2d');
    if (dailyCtx) {
        new Chart(dailyCtx, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Tareas Completadas',
                    data: [12, 19, 3, 5, 2, 3, 9], // Datos de ejemplo
                    borderColor: '#E91E63',
                    tension: 0.1
                }]
            }
        });
    }

    // Gráfico de Rendimiento por Empleado (Ejemplo)
    const employeeCtx = document.getElementById('employeePerformanceChart')?.getContext('2d');
    if (employeeCtx) {
        new Chart(employeeCtx, {
            type: 'bar',
            data: {
                labels: ['Juan', 'Ana', 'Pedro', 'Luis', 'Maria'], // Nombres de ejemplo
                datasets: [{
                    label: 'Fotos Subidas (Semana)',
                    data: [10, 8, 12, 6, 14], // Datos de ejemplo
                    backgroundColor: 'rgba(233, 30, 99, 0.5)',
                }]
            }
        });
    }
}

function logout() {
    // Lógica para cerrar sesión
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Limpia la sesión guardada (si usas localStorage)
        localStorage.removeItem('userSession');
        // Redirige a la página de inicio de sesión
        window.location.href = 'index.html';
    }
}

// Aquí deberías añadir el resto de tus funciones:
// - Cargar fotos en la galería (loadGalleryPhotos)
// - Cargar empleados (loadEmployees)
// - Funciones para los modales, etc.
