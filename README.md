# Entrega Final - Backend II

## Alumno

Renzo Salamida

## Descripción

Proyecto ecommerce desarrollado con Node.js, Express y MongoDB como entrega final de Backend II.

El proyecto implementa una arquitectura basada en DAO y Repository para separar el acceso a datos de la lógica de la aplicación. También incorpora autenticación con Passport y JWT, autorización basada en roles, DTO para la exposición segura de datos de usuario, recuperación de contraseña mediante correo electrónico y un sistema de compra con control de stock y generación de tickets.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- Mongoose Paginate
- Passport
- Passport Local
- Passport JWT
- bcrypt
- JSON Web Tokens
- Cookie Parser
- Dotenv
- Nodemailer
- Handlebars
- Socket.IO

## Arquitectura

El proyecto utiliza las capas:

```text
Routes
   ↓
Repositories
   ↓
DAO
   ↓
Models
   ↓
MongoDB
```

### DAO

Los DAO son responsables del acceso a la base de datos.

Se implementaron DAO para:

- Usuarios
- Productos
- Carritos
- Tickets

### Repository

Los Repository funcionan como intermediarios entre la aplicación y los DAO, evitando que la lógica principal dependa directamente de los modelos de Mongoose.

Se implementaron:

- `UserRepository`
- `ProductRepository`
- `CartRepository`
- `TicketRepository`

### DTO

Se implementó `UserDTO` para devolver únicamente la información necesaria del usuario autenticado.

La ruta:

```text
GET /api/sessions/current
```

utiliza este DTO y no devuelve información sensible como la contraseña.

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`.

Ejemplo:

```env
PORT=8080
MONGO_URL=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=colocar_una_clave_secreta
MAIL_USER=colocar_email@gmail.com
MAIL_PASS=colocar_contraseña_de_aplicacion
```

`MAIL_PASS` debe ser una contraseña de aplicación del proveedor de correo y no la contraseña personal de la cuenta.

Luego iniciar el servidor:

```bash
npm start
```

Por defecto:

```text
http://localhost:8080
```

## Autenticación

La autenticación se realiza utilizando Passport.

### Registro

```text
POST /api/sessions/register
```

Registra un usuario con rol `user` y crea automáticamente su carrito.

### Login

```text
POST /api/sessions/login
```

Valida las credenciales y genera un JWT.

El token puede utilizarse mediante la cookie:

```text
coderCookieToken
```

o mediante:

```text
Authorization: Bearer TOKEN
```

### Usuario actual

```text
GET /api/sessions/current
```

Requiere autenticación y devuelve los datos del usuario mediante `UserDTO`, evitando exponer la contraseña.

## Roles y autorización

El sistema maneja dos roles:

- `user`
- `admin`

Se utiliza un middleware de autorización para restringir acciones según el rol del usuario.

### Productos

La consulta de productos es pública.

Crear, actualizar y eliminar productos requiere:

```text
role: admin
```

Principales endpoints:

| Método | Ruta | Permiso |
| --- | --- | --- |
| GET | `/api/products` | Público |
| GET | `/api/products/:pid` | Público |
| POST | `/api/products` | Admin |
| PUT | `/api/products/:pid` | Admin |
| DELETE | `/api/products/:pid` | Admin |

## Carritos

Los usuarios pueden agregar productos a su carrito.

```text
POST /api/carts/:cid/product/:pid
```

Esta operación requiere autenticación y rol `user`.

Además, se verifica que el carrito indicado pertenezca al usuario autenticado.

## Proceso de compra

Para finalizar una compra se utiliza:

```text
POST /api/carts/:cid/purchase
```

La ruta requiere autenticación con rol `user` y verifica que el carrito pertenezca al usuario.

Durante la compra el sistema:

1. Obtiene los productos del carrito.
2. Verifica el stock disponible de cada producto.
3. Descuenta el stock de los productos que pueden comprarse.
4. Calcula el importe total.
5. Genera un ticket.
6. Elimina del carrito los productos comprados.
7. Mantiene en el carrito los productos que no pudieron comprarse por falta de stock.

Esto permite manejar tanto compras completas como compras parciales.

## Tickets

Cada compra válida genera un Ticket con:

- `code`
- `purchase_datetime`
- `amount`
- `purchaser`

El código permite identificar individualmente cada compra.

## Recuperación de contraseña

El proyecto incorpora recuperación de contraseña mediante Nodemailer.

### Solicitar recuperación

```text
POST /api/sessions/forgot-password
```

El usuario proporciona su email y recibe un correo con un botón para restablecer su contraseña.

El enlace contiene un token JWT específico para recuperación y tiene una duración de:

```text
1 hora
```

### Restablecer contraseña

El enlace recibido dirige al formulario:

```text
/reset-password?token=TOKEN
```

Desde allí se envía la nueva contraseña a:

```text
POST /api/sessions/reset-password
```

El sistema verifica:

- Que el token sea válido.
- Que el token no haya expirado.
- Que corresponda a recuperación de contraseña.
- Que el usuario exista.
- Que la nueva contraseña no sea igual a la contraseña actual.

Las contraseñas son almacenadas utilizando bcrypt.

## CRUD de usuarios

Las rutas administrativas de usuarios requieren autenticación y rol `admin`.

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/users` | Crear usuario |
| GET | `/api/users` | Obtener usuarios |
| GET | `/api/users/:uid` | Obtener usuario por ID |
| PUT | `/api/users/:uid` | Actualizar usuario |
| DELETE | `/api/users/:uid` | Eliminar usuario |

## Productos

Los productos soportan:

- Paginación
- Filtrado por categoría
- Filtrado por estado
- Ordenamiento por precio

El modelo incluye:

- `title`
- `description`
- `code`
- `price`
- `status`
- `stock`
- `category`
- `thumbnails`

## Otras funcionalidades

El proyecto también incluye:

- Persistencia con MongoDB y Mongoose.
- Vistas con Handlebars.
- Vista para recuperación de contraseña.
- Actualización de productos mediante Socket.IO.
- Cookies para almacenamiento del JWT.
- Variables de entorno mediante Dotenv.
- Manejo de códigos HTTP `401`, `403`, `404` y otros errores correspondientes.

## Seguridad

Las contraseñas se almacenan utilizando bcrypt.

Las credenciales y claves privadas se configuran mediante variables de entorno.

El archivo `.env` no debe publicarse en el repositorio. Se incluye `.env.example` como referencia de las variables necesarias para ejecutar el proyecto.