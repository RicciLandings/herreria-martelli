# Panel de administrador

`admin.html` permite subir, ordenar y borrar las fotos de la sección **Trabajos** desde el celular.
Sin configurar funciona en **modo demo** (no guarda nada) y la web muestra las fotos fijas de `images/`.

## Conectarlo (una sola vez)

1. Crear un proyecto en [supabase.com](https://supabase.com) (plan gratis alcanza).
2. En **SQL Editor**, pegar `supabase/setup.sql`, cambiar `EMAIL_DEL_ADMIN@ejemplo.com` por el email del admin y ejecutar.
3. En **Authentication → Users → Add user**, crear el usuario con ese email y una contraseña.
4. En **Authentication → Sign In / Providers**, desactivar *Allow new users to sign up*.
5. En **Settings → API**, copiar *Project URL* y la clave *anon/publishable* en `config.js`.

Listo: entrar a `tusitio.com/admin.html` con ese email y contraseña.
Para sumar otro admin: `insert into admins (email) values ('otro@mail.com');` y crearle el usuario.
