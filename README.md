# 🚀 API REST Completa - Gestión de Usuarios y Publicaciones

Esta aplicación despliega una infraestructura de Backend robusta con **Express**, **Mongoose** y **MongoDB Atlas**, integrando lógica de subida y destrucción asíncrona de recursos en **Cloudinary**.

## 🛠️ Instalación y Despliegue Técnico

1. Instala el árbol de dependencias necesarias:
   ```bash
   npm install
   ```
2. Inicializa las colecciones en la nube inyectando el script de la semilla:
   ```bash
   npm run seed
   ```
3. Lanza el entorno de ejecución en modo desarrollo:
   ```bash
   npm run dev
   ```

## 🔐 Credenciales del Administrador del Sistema (Para Evaluación)
* **URL de Login:** `POST http://localhost:3030/users/login`
* **Email de acceso:** `admin_prueba@school.com`
* **Contraseña:** `Admin1234!`
