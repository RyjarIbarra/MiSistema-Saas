import { insertSession, sign_in } from "./apiEndpoints.js";
import { getData, postData } from "./apiService.js";
import { showWarningToast } from "./toast.js";

const email = document.getElementById('email');
const password = document.getElementById('password');
async function signIn() {
    const data = {
        email: email.value.trim(),
        password: password.value.trim()
    };

    try {
        const response = await postData(sign_in, data);
        sessionStorage.setItem('token', response.data.itoken);
        sessionStorage.setItem('username', response.data.username);
        sessionStorage.setItem('rol', response.data.rol);
        sessionStorage.setItem('email', response.data.email);
        sessionStorage.setItem('userMenu', JSON.stringify(response.data.menu || []));

        await getData(insertSession + `?users_id=${response.data.id_usuario}`);
        window.location.href = 'menu.html';
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
    }
}

document.getElementById("Btnlogin").addEventListener("click", async function(e) {
    if(!email.value.trim() || !password.value.trim()){
        showWarningToast('Campos incompletos', 'Por favor, complete todos los campos', 3000);
        return;
    }
    signIn();
});
