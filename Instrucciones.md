# Planes Juntos - App de Citas/Planes

Esta es una aplicación web profesional diseñada específicamente para que 2 personas planifiquen y organicen sus planes.

## Características:
1. **Diseño:** Temática verde y rosa, con modo oscuro y *glassmorphism* (efecto cristal).
2. **Dashboard:** Calendario y listado de planes ordenados por fecha.
3. **Propuestas y Votación:** Cada uno propone ideas dentro de un plan. Se necesitan 2 votos (uno de cada uno) para que la idea pase a "Plan Confirmado". Si se descartan, van a una lista para recuperarlas en el futuro.
4. **Análisis de Requisitos:** Una vez confirmadas las actividades, podéis hacer una lista de requisitos o preparativos (entradas, reservas, etc) para que no se os olvide nada.
5. **Backend Híbrido:** Por defecto, la app funcionará para ti usando `LocalStorage` (para que puedas probarla inmediatamente sin configurar nada). Sin embargo, para que **ambos la uséis a la vez** y sincronice datos, está preparada para conectarse a **Firebase**.

## 🛠️ Cómo conectar el Backend para los dos (Firebase)

Para que los dos podáis entrar con vuestro usuario y ver los mismos datos sincronizados en tiempo real:

1. Ve a [Firebase Console](https://console.firebase.google.com/).
2. Crea un proyecto nuevo (es 100% gratis).
3. Añade una **Aplicación Web** (el icono de `</>`).
4. Firebase te dará un código llamado `firebaseConfig`.
5. Copia esos valores y pégalos en el archivo `src/lib/store.js` en tu proyecto:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  // ...
};
```
6. En Firebase, ve a **Firestore Database** -> Crear base de datos (elige modo de prueba para empezar, así permites conexiones sin inicio de sesión complejo).
7. Opcional: Modifica tu archivo `src/config.js` para personalizar el nombre de la app, tu PIN y vuestros nombres.
8. ¡Listo! Ya podéis iniciar sesión en la app web con vuestro PIN.

## 🚀 Cómo subir la App a Netlify

1. Asegúrate de tener este código en un repositorio de **GitHub**.
2. Ve a [Netlify](https://www.netlify.com/) y entra con GitHub.
3. Dale a **"Add new site" -> "Import an existing project"**.
4. Selecciona tu repositorio de GitHub.
5. Netlify detectará que es Vite automáticamente. Solo asegúrate de que:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Dale a **Deploy** y... ¡Boom! Tendrás tu enlace web para usar la app desde el móvil o PC en cualquier lugar.

---
*Hecha con ❤️, React, y mucho estilo.*
