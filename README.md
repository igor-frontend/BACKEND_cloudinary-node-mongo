# 🖥️ Blogspot/Pinterest Platform - Backend API RESTful

Esta es la API de servicios, persistencia y administración de datos para la plataforma web, desarrollada sobre **Node.js** con el framework **Express** y conectada a una base de datos distribuida en la nube en **MongoDB Atlas**.

---

## 🔑 Guía Completa de Variables de Entorno (.env)

Para inicializar el servidor en un entorno de desarrollo local, es obligatorio crear un archivo `.env` en la raíz del proyecto con la siguiente estructura de variables:

*   `MONGO_URI`: Cadena de conexión oficial (`connection string`) proporcionada por el clúster de MongoDB Atlas que incluye usuario y credenciales de acceso a la base de datos.
*   `JWT_SECRET`: Clave alfanumérica secreta e inequívoca utilizada por la librería `jsonwebtoken` para firmar y verificar la autenticidad de los tokens de sesión de los usuarios.
*   `PORT`: Puerto de red local asignado para que el servidor Express escuche las peticiones HTTP (Valor por defecto: `3030`).

---

## 🔌 Documentación Completa de Endpoints de la API

### 👤 Módulo de Autenticación y Usuarios (`/users`)

| Método | Ruta | Middleware de Seguridad | Descripción Técnica |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Público | Registra un usuario nuevo en el sistema con hasheo automático mediante el hook `pre("save")`. |
| **POST** | `/api/auth/login` | Público | Valida las credenciales mediante `bcrypt.compare` y retorna el token JWT firmado. |
| **PUT** | `/api/users/:id` | `isAuth` (Token Válido) | Actualiza las propiedades del usuario invocando el método nativo `.save()`. |
| **DELETE**| `/api/users/:id` | `isAuth` (Token Válido) | **Borrado en Cascada**: Elimina el registro del usuario de la base de datos y purga de forma simultánea todos los posts asociados a su ID (`user`). |

### 📝 Módulo de Publicaciones y Tablón (`/posts`)

| Método | Ruta | Middleware de Seguridad | Descripción Técnica |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/posts` | Público | Recupera el listado completo de publicaciones almacenadas en el muro. |
| **GET** | `/api/posts/:id` | Público | Obtiene el documento y los detalles de una única publicación mediante su ID. |
| **POST** | `/api/posts` | `isAuth` (Token Válido) | Registra un nuevo post vinculando el identificador del creador de forma interna mediante el payload del token (`req.user._id`). |
| **PUT** | `/api/posts/:id` | `isAuth` + Validación de Propietario | Modifica el título o contenido de un post. El sistema verifica estrictamente que el solicitante sea el creador original o un `admin`. |
| **DELETE**| `/api/posts/:id` | `isAuth` + Validación de Propietario | Purga un post de la colección de forma definitiva y retira su referencia del array del usuario (`$pull`). Requiere ser propietario o `admin`. |

---

## 🧬 Estructura Detallada de los Modelos de Datos (Mongoose)

### Modelo: `User` (Colección: `users`)
*   `username` (String, Requerido, Único): Nombre de cuenta del alumno.
*   `email` (String, Requerido, Único): Correo electrónico de acceso.
*   `password` (String, Requerido): Clave de acceso almacenada de forma segura tras pasar por el middleware automático de encriptación `pre("save")`.
*   `role` (String, Enum): Niveles de autorización válidos: `["user", "admin"]` (Por defecto: `"user"`).
*   `posts` (Array de ObjectIds): Referencias relacionales inversas que apuntan a la colección de publicaciones.

### Modelo: `Post` (Colección: `posts`)
*   `title` (String, Requerido): Título semántico de la publicación.
*   `content` (String, Requerido): Cuerpo de texto o descripción de la imagen.
*   `user` (ObjectId, Requerido): Propiedad relacional directa y obligatoria referenciada al modelo `User` para identificar la autoría del post.