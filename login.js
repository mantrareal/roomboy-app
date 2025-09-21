document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://depkkpxkbpgbvzylcdcn.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlcGtrcHhrYnBnYnZ6eWxjZGNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzEzNjgsImV4cCI6MjA3Mzk0NzM2OH0.n8CDtIA-If4dSjLuRRG5N0y1IolPSMx44qD7Y3odV28';
    const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY );

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = '';
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) throw authError;

            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('role, full_name')
                .eq('user_id', authData.user.id)
                .single();
            
            if (profileError || !profileData) {
                throw new Error('Este usuario no tiene un perfil asignado en el sistema.');
            }

            const sessionData = {
                id: authData.user.id,
                email: authData.user.email,
                role: profileData.role,
                full_name: profileData.full_name
            };
            localStorage.setItem('userSession', JSON.stringify(sessionData));

            if (profileData.role === 'admin') {
                window.location.href = 'admin.html';
            } else if (profileData.role === 'roomboy') {
                window.location.href = 'roomboy-app.html';
            } else {
                throw new Error('Rol de usuario no reconocido.');
            }

        } catch (error) {
            errorMessage.textContent = error.message;
        }
    });
});
