
🏥 Medly - Sistema de Gestión Médica

<div align="center">

</div>

📖 Descripción

Medly es una plataforma integral diseñada para la gestión administrativa y clínica de consultorios médicos. Este repositorio contiene el Backend (API REST) que orquesta la arquitectura híbrida del sistema, manejando transacciones críticas y almacenamiento de expedientes.

🚀 Stack Tecnológico

El proyecto utiliza una arquitectura moderna basada en microservicios contenerizados:

<div align="center">

Categoría

Tecnologías

Core



SQL



NoSQL



Cache & Auth



DevOps



</div>

🛠️ Instalación y Despliegue

1. Pre-requisitos

Asegúrate de tener instalado:

Node.js v18+

Docker Desktop (Corriendo)

2. Clonar Repositorio

git clone [https://github.com/zaokdev/medly_backend.git](https://github.com/zaokdev/medly_backend.git)
cd medly_backend


3. Variables de Entorno

Crea un archivo .env en la raíz con la siguiente configuración:

PORT=3000
SESSION_SECRET=secreto_seguro_para_cookies

# Base de Datos Relacional (MySQL)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=medly
DB_PORT=3306

# Base de Datos Documental (MongoDB)
MONGO_URI=mongodb://localhost:27017/medly

# Cache de Sesiones (Redis)
REDIS_HOST=localhost
REDIS_PORT=6379


4. Levantar Servicios (Docker)

Ejecuta el stack de bases de datos:

docker-compose up -d


5. Iniciar Servidor

npm install
npm run dev


El servidor iniciará en: http://localhost:3000

📦 Arquitectura de Datos

El sistema implementa una Arquitectura Híbrida para aprovechar lo mejor de ambos mundos:

🔵 SQL (MySQL)

Maneja datos estructurados y transaccionales que requieren integridad referencial estricta.

Usuarios: (Médicos, Pacientes, Admin)

Agenda: (Disponibilidad de horarios con bloqueo pesimista)

Citas: (Registro transaccional del evento)

🟢 NoSQL (MongoDB)

Maneja datos semi-estructurados y voluminosos.

Expedientes: Documentos flexibles que contienen el historial clínico, recetas, signos vitales y notas evolutivas.

🛡️ Seguridad y Características Clave

🔒 Autenticación Segura: Manejo de sesiones vía Redis con Cookies HttpOnly (inmunes a XSS).

⚡ Concurrencia: Implementación de Atomic Updates en SQL para evitar dobles reservas en el mismo milisegundo.

🔄 Transacciones Distribuidas: Mecanismo de Two-Phase Commit manual (con Rollback compensatorio) para asegurar consistencia entre MySQL y MongoDB al cerrar consultas médicas.

🔗 Enlaces Relacionados

Frontend Repo: github.com/zaokdev/medly_frontend

<div align="center">
<sub>Desarrollado por Kevin Zapata para la Universidad Anáhuac Mayab</sub>
</div>
