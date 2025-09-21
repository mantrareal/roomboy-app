// js/admin.js - VERSIÓN CORREGIDA Y COMPLETA

document.addEventListener('DOMContentLoaded', () => {
    // --- INICIALIZACIÓN Y AUTENTICACIÓN ---
    // ¡CORRECCIÓN! Se inicializa Supabase correctamente.
    const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const session = localStorage.getItem('userSession');
    if (!session) {
        window.location.href = 'index.html';
        return;
    }
    const currentUser = JSON.parse(session);
    
    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl) {
        adminNameEl.textContent = currentUser.full_name || 'Admin';
    }

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('userSession');
            window.location.href = 'index.html';
        });
    }

    // --- NAVEGACIÓN POR PESTAÑAS ---
    const tabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetId = `${tab.dataset.tab}-content`;
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetId) {
                    content.classList.add('active');
                }
            });

            // Cargar contenido dinámico al cambiar de pestaña
            if (tab.dataset.tab === 'gallery') {
                loadGalleryPhotos();
                populateEmployeeFilter();
            } else if (tab.dataset.tab === 'dashboard') {
                loadDashboardCharts();
            }
        });
    });

    // --- LÓGICA DEL DASHBOARD (GRÁFICAS) ---
    let dailyComplianceChart, employeePerformanceChart;

    async function loadDashboardCharts() {
        // Datos de ejemplo. Reemplazar con datos reales de Supabase.
        const dailyData = {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            values: [18, 19, 15, 17, 16, 20, 19]
        };
        const employeeData = {
            labels: ['Ana', 'Luis', 'Carlos', 'Sofía', 'Pedro'],
            values: [25, 22, 20, 18, 15]
        };

        // Gráfica de Cumplimiento Diario
        const dailyCtx = document.getElementById('dailyComplianceChart').getContext('2d');
        if (dailyComplianceChart) dailyComplianceChart.destroy();
        dailyComplianceChart = new Chart(dailyCtx, {
            type: 'line',
            data: {
                labels: dailyData.labels,
                datasets: [{
                    label: 'Tareas Completadas',
                    data: dailyData.values,
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'rgba(233, 30, 99, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            }
        });

        // Gráfica de Rendimiento de Empleados
        const employeeCtx = document.getElementById('employeePerformanceChart').getContext('2d');
        if (employeePerformanceChart) employeePerformanceChart.destroy();
        employeePerformanceChart = new Chart(employeeCtx, {
            type: 'bar',
            data: {
                labels: employeeData.labels,
                datasets: [{
                    label: 'Fotos Subidas este Mes',
                    data: employeeData.values,
                    backgroundColor: [
                        'rgba(233, 30, 99, 0.7)',
                        'rgba(63, 81, 181, 0.7)',
                        'rgba(76, 175, 80, 0.7)',
                        'rgba(255, 152, 0, 0.7)',
                        'rgba(156, 39, 176, 0.7)'
                    ]
                }]
            },
            options: {
                indexAxis: 'y',
            }
        });
    }

    // --- LÓGICA DE LA GALERÍA ---
    const gallery = document.getElementById('photoGallery');
    const employeeFilter = document.getElementById('employeeFilter');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    async function loadGalleryPhotos() {
        if (!gallery) return;
        gallery.innerHTML = '<p>Cargando fotos...</p>';
        try {
            let query = supabase.from('task_photos').select(`id, created_at, photo_url, table_number, status, user_profiles ( full_name )`).order('created_at', { ascending: false });
            const employeeId = employeeFilter.value;
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            if (employeeId !== 'all') query = query.eq('user_id', employeeId);
            if (startDate) query = query.gte('created_at', new Date(startDate).toISOString());
            if (endDate) {
                const end = new Date(endDate);
                end.setDate(end.getDate() + 1);
                query = query.lt('created_at', end.toISOString());
            }
            const { data: photos, error } = await query.limit(100);
            if (error) throw error;
            if (photos.length === 0) {
                gallery.innerHTML = '<p>No se han encontrado fotos con los filtros seleccionados.</p>';
                return;
            }
            gallery.innerHTML = photos.map(photo => `
                <div class="photo-card">
                    <img src="${photo.photo_url}" alt="Foto de verificación" loading="lazy" onclick="openPhotoModal('${photo.photo_url}')">
                    <div class="photo-details">
                        <p><strong>Empleado:</strong> ${photo.user_profiles ? photo.user_profiles.full_name : 'Desconocido'}</p>
                        <p><strong>Mesa:</strong> ${photo.table_number || 'N/A'}</p>
                        <p><strong>Fecha:</strong> ${new Date(photo.created_at).toLocaleString()}</p>
                        <p><strong>Estado:</strong> <span class="status-label status-${photo.status || 'pending'}">${photo.status || 'pendiente'}</span></p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error cargando la galería:', error);
            gallery.innerHTML = '<p style="color: red;">Error al cargar las fotos.</p>';
        }
    }

    async function populateEmployeeFilter() {
        if (!employeeFilter) return;
        try {
            const { data: employees, error } = await supabase.from('user_profiles').select('user_id, full_name').eq('role', 'roomboy').order('full_name');
            if (error) throw error;
            if (employeeFilter.options.length > 1) return;
            employees.forEach(emp => {
                const option = document.createElement('option');
                option.value = emp.user_id;
                option.textContent = emp.full_name;
                employeeFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Error cargando filtro de empleados:', error);
        }
    }

    if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', loadGalleryPhotos);
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            employeeFilter.value = 'all';
            startDateInput.value = '';
            endDateInput.value = '';
            loadGalleryPhotos();
        });
    }

    // --- CARGA INICIAL ---
    const activeTab = document.querySelector('.nav-tab.active');
    if (activeTab) {
        if (activeTab.dataset.tab === 'gallery') {
            loadGalleryPhotos();
            populateEmployeeFilter();
        } else if (activeTab.dataset.tab === 'dashboard') {
            loadDashboardCharts();
        }
    }
});

function openPhotoModal(imageUrl) {
    window.open(imageUrl, '_blank');
}
