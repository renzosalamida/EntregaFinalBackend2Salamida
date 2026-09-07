# Primera Entrega - Backend II

## Alumno

Renzo Salamida

## Descripción

Proyecto ecommerce desarrollado con Node.js, Express y MongoDB.

En esta entrega se incorporó un CRUD de usuarios, autenticación mediante Passport, encriptación de contraseñas con bcrypt, generación de tokens JWT y autorización basada en roles.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- Passport
- Passport Local
- Passport JWT
- bcrypt
- JSON Web Tokens
- Cookie Parser
- Dotenv
- Handlebars
- Socket.IO

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`:

```env
JWT_SECRET=colocar_una_clave_secreta
```

Luego iniciar el servidor:

```bash
npm run start
```

El servidor funciona en:

```text
http://localhost:8080
```

## Usuarios

El modelo de usuario contiene:

- `first_name`
- `last_name`
- `email`
- `age`
- `password`
- `cart`
- `role`

Las contraseñas son encriptadas mediante `bcrypt.hashSync` antes de almacenarse en MongoDB.

### CRUD de usuarios

Estas rutas requieren un JWT válido y rol `admin`.

| Método | Ruta | Descripción |
| POST | `/api/users` | Crear un usuario |
| GET | `/api/users` | Obtener todos los usuarios |
| GET | `/api/users/:uid` | Obtener un usuario |
| PUT | `/api/users/:uid` | Actualizar un usuario |
| DELETE | `/api/users/:uid` | Eliminar un usuario |

## Autenticación

| Método | Ruta | Descripción |
| POST | `/api/sessions/register` | Registrar un usuario |
| POST | `/api/sessions/login` | Iniciar sesión y generar el JWT |
| GET | `/api/sessions/current` | Obtener los datos del usuario    autenticado|

El JWT puede enviarse mediante la cookie `coderCookieToken` o con el encabezado:

```text
Authorization: Bearer TOKEN
```

La ruta `/api/sessions/current` devuelve `401 Unauthorized` cuando el token no existe, es inválido o está vencido.

## Autorización

Los usuarios tienen el rol `user` por defecto. El CRUD de usuarios está protegido para que solamente pueda utilizarlo un usuario con rol `admin`.

- `401 Unauthorized`: usuario no autenticado.
- `403 Forbidden`: usuario autenticado sin permisos suficientes.

## Funcionalidades del ecommerce

- CRUD de productos.
- CRUD de carritos.
- CRUD de usuarios.
- Persistencia con MongoDB.
- Autenticación con Passport.
- Login mediante JWT.
- Encriptación de contraseñas.
- Autorización basada en roles.
- Filtros, paginación y ordenamiento de productos.
- Vistas con Handlebars.
- Actualizaciones con Socket.IO.