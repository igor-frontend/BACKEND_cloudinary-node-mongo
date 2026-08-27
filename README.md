# 🖥️ Blogspot/Pinterest Platform - Backend API RESTful

Esta es la API de servicios, persistencia y administración de datos para la plataforma web, desarrollada sobre **Node.js** con el framework **Express** y conectada a una base de datos distribuida en la nube en **MongoDB Atlas**.

---

## 🔑 Guía Completa de Variables de Entorno (.env)

Para inicializar el servidor en un entorno de desarrollo local, es obligatorio crear un archivo `.env` en la raíz del proyecto con la siguiente estructura de variables:

*   `MONGO_URI`: Cadena de conexión oficial (`connection string`) proporcionada por el clúster de MongoDB Atlas.
*   `JWT_SECRET`: Clave alfanumérica secreta e de integridad utilizada por la librería `jsonwebtoken` para firmar y verificar los tokens de sesión.
*   `PORT`: Puerto de red local asignado para que el servidor Express escuche las peticiones HTTP (Valor por defecto: `3030`).
*   `CLOUDINARY_NAME`: Nombre de la cuenta o espacio de trabajo asignado en Cloudinary.
*   `CLOUDINARY_KEY`: Clave pública de la API de Cloudinary para autenticación de peticiones.
*   `CLOUDINARY_SECRET`: Clave privada y secreta de Cloudinary para firmar operaciones de subida y borrado de recursos multimedia.

---

## 🛠️ Instrucciones de Instalación y Despliegue Local

Sigue estos pasos detallados para poner en marcha el entorno de desarrollo en tu máquina local:

1.  **Instalar dependencias del proyecto:**
    ```bash
    npm install
    ```
2.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz del proyecto utilizando la estructura provista en la sección anterior.
3.  **Ejecutar la semilla de datos (Opcional):**
    Si deseas poblar la base de datos con publicaciones base de prueba, ejecuta:
    ```bash
    npm run seed
    ```
4.  **Iniciar el servidor de desarrollo:**
    Arranca la API en modo de escucha automática mediante `nodemon`:
    ```bash
    npm run dev
    ```

---

## 🔌 Documentación Completa de Endpoints de la API

### 👤 Módulo de Usuarios y Autenticación (`/users`)

| Método | Ruta | Middleware de Seguridad | Descripción Técnica |
| :--- | :--- | :--- | :--- |
| **POST** | `/users/register` | Público (Sube imagen) | Registra un usuario nuevo en el sistema con hasheo automático mediante el hook `pre("save")`. |
| **POST** | `/users/login` | Público | Valida las credenciales mediante `bcrypt.compare` y retorna el token JWT firmado junto a los datos del usuario. |
| **GET** | `/users` | Público | Recupera la lista completa de todos los usuarios registrados en el sistema. |
| **GET** | `/users/:id` | Público | Obtiene el documento detallado de un único usuario localizándolo por su identificador. |
| **PUT** | `/users/:id` | `isAuth` (Dueño o Admin) | Modifica el perfil. Sube una nueva foto, purga la imagen anterior de Cloudinary y gestiona el rehasheo seguro si cambia la password. |
| **DELETE**| `/users/:id` | `isAuth` (Dueño o Admin) | **Borrado Completo**: Purga de Cloudinary la foto de perfil, elimina el registro y destruye en cascada todas sus publicaciones. |
| **PATCH** | `/users/:id/role` | `isAuth` + `isAdmin` | Endpoint administrativo restrictivo para cambiar el nivel de permisos de una cuenta (`user` / `admin`). |

### 📝 Módulo de Publicaciones y Muro (`/posts`)

| Método | Ruta | Middleware de Seguridad | Descripción Técnica |
| :--- | :--- | :--- | :--- |
| **GET** | `/posts` | Público | Recupera el listado completo de publicaciones almacenadas en el muro. |
| **GET** | `/posts/:id` | Público | Obtiene el documento y los detalles de una única publicación mediante su ID. |
| **POST** | `/posts` | `isAuth` (Token Válido) | Registra un nuevo post vinculando de forma interna el identificador del creador extraído directamente del payload del token (`req.user._id`). |
| **PUT** | `/posts/:id` | `isAuth` (Dueño o Admin) | Modifica el título o contenido de un post. El sistema verifica estrictamente que el solicitante sea el creador original o un `admin`. |
| **DELETE**| `/posts/:id` | `isAuth` (Dueño o Admin) | Elimina permanentemente la publicación de la base de datos y saca su referencia del array del usuario (`$pull`). |

---

## 🧬 Estructura Detallada de los Modelos de Datos (Mongoose)

### Modelo: `User` (Colección: `users`)
*   `username` (String, Requerido, Único): Nombre de cuenta del usuario.
*   `email` (String, Requerido, Único): Correo electrónico de acceso.
*   `password` (String, Requerido): Clave de acceso encriptada de forma automática mediante el middleware del modelo si su valor sufre alguna modificación.
*   `role` (String, Enum): Niveles de autorización válidos: `["user", "admin"]` (Por defecto: `"user"`).
*   `image` (String): URL pública absoluta del archivo de imagen del perfil alojado en los servidores de Cloudinary.
*   `posts` (Array de ObjectIds): Referencias relacionales inversas que apuntan a la colección de publicaciones.

### Modelo: `Post` (Colección: `posts`)
*   `title` (String, Requerido): Título semántico de la publicación.
*   `content` (String, Requerido): Cuerpo de texto o descripción de la imagen.
*   `user` (ObjectId, Requerido): Propiedad relacional directa y obligatoria referenciada al modelo `User` para identificar la autoría del post de manera inequívoca.
