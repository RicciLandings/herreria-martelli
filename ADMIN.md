# Panel de administrador

`admin.html` es un editor en vivo de la web: muestra la página real y se edita sobre ella.

- **Textos**: tocá cualquier texto en la vista previa y escribí. En la barra lateral: tamaño, grosor, espaciado y alineación. También el número y mensaje de WhatsApp.
- **Trabajos**: crear, renombrar, ordenar y borrar categorías; subir, ordenar y borrar fotos; elegir portada y encuadre. *(Se guarda al instante.)*
- **Imágenes**: foto de portada (encuadre y alto) y galería (grilla/carrusel, columnas, proporción, separación).
- **Secciones**: orden, mostrar/ocultar y espacio de cada sección.
- **Diseño**: colores, tipografía, tamaño base y grosor de títulos.
- **Publicar** guarda los cambios en la web. **Descartar** vuelve a lo último publicado.

Sin configurar funciona en **modo demo**: los cambios quedan solo en ese navegador.

## Conectarlo (una sola vez)

1. Crear un proyecto en [supabase.com](https://supabase.com) (plan gratis alcanza).
2. En **SQL Editor**, pegar `supabase/setup.sql`, cambiar `EMAIL_DEL_ADMIN@ejemplo.com` por el email del admin y ejecutar.
3. En **Authentication → Users → Add user**, crear el usuario con ese email y una contraseña.
4. En **Authentication → Sign In / Providers**, desactivar *Allow new users to sign up*.
5. En **Settings → API**, copiar *Project URL* y la clave *anon/publishable* en `config.js`.
6. Entrar a `admin.html`, revisar todo y tocar **Publicar** una vez. Crear las categorías y subir las fotos desde la pestaña Trabajos.

Para sumar otro admin: `insert into admins (email) values ('otro@mail.com');` y crearle el usuario.
