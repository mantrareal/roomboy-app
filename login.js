// Se asume que config.js define SUPABASE_URL y SUPABASE_ANON_KEY
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginForm = document.getElementById('loginForm');
const loginButton = document.getElementById('loginButton');
const buttonText = loginButton.querySelector('span');
const errorMessageDiv = document.getElementById('errorMessage');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setLoading(true);
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // 1. Autenticar al usuario con su email y contraseña
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (authError) throw new Error('Credenciales incorrectas. Verifica tu email y contraseña.');
        if (!authData.user) throw new Error('No se pudo verificar el usuario.');

        // 2. Obtener el perfil del usuario de la tabla 'user_profiles'
        //    (Esta consulta ya es compatible con tu estructura de tabla)
        const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('user_id, full_name, role') // Seleccionamos solo las columnas que necesitamos
            .eq('user_id', authData.user.id)    // Buscamos por la columna 'user_id'
            .single();

        // Si no se encuentra un perfil, el login falla
        if (profileError || !profileData) {
            throw new Error('Este usuario no tiene un perfil asignado en el sistema.');
        }

        // 3. Guardar la sesión del usuario en localStorage
        const userSession = {
            id: profileData.user_id, // Usamos el user_id que obtuvimos
            name: profileData.full_name,
            role: profileData.role,
        };
        localStorage.setItem('userSession', JSON.stringify(userSession));

        // 4. Redirigir según el rol
        if (profileData.role === 'admin') {
            window.location.href = 'admin.html';
        } else if (profileData.role === 'roomboy') {
            window.location.href = 'roomboy-app.html';
        } else {
            throw new Error('Rol de usuario no reconocido.');
        }

    } catch (error) {
        console.error('Error de inicio de sesión:', error.message);
        showError(error.message);
        setLoading(false);
    }
});

function setLoading(isLoading) {
    if (isLoading) {
        loginButton.disabled = true;
        buttonText.textContent = 'Verificando...';
    } else {
        loginButton.disabled = false;
        buttonText.textContent = 'Entrar';
    }
}

function showError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
}


