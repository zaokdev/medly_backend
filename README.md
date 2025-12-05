<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Medly Backend - API Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
            line-height: 1.6;
            color: #24292e;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #ffffff;
        }

        h1, h2, h3 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
        }

        h1 {
            font-size: 2em;
            padding-bottom: 0.3em;
            border-bottom: 1px solid #eaecef;
        }

        h2 {
            font-size: 1.5em;
            padding-bottom: 0.3em;
            border-bottom: 1px solid #eaecef;
            margin-top: 35px;
        }

        h3 {
            font-size: 1.25em;
        }

        p {
            margin-top: 0;
            margin-bottom: 16px;
        }

        a {
            color: #0366d6;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        ul {
            padding-left: 2em;
            margin-bottom: 16px;
        }

        li {
            margin-top: 0.25em;
        }

        code {
            padding: 0.2em 0.4em;
            margin: 0;
            font-size: 85%;
            background-color: #f6f8fa;
            border-radius: 6px;
            font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
        }

        pre {
            padding: 16px;
            overflow: auto;
            font-size: 85%;
            line-height: 1.45;
            background-color: #f6f8fa;
            border-radius: 6px;
            margin-bottom: 16px;
        }

        pre code {
            display: inline;
            padding: 0;
            margin: 0;
            overflow: visible;
            line-height: inherit;
            word-wrap: normal;
            background-color: transparent;
            border: 0;
        }

        blockquote {
            padding: 0 1em;
            color: #6a737d;
            border-left: 0.25em solid #dfe2e5;
            margin: 0 0 16px 0;
        }

        table {
            border-spacing: 0;
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 16px;
        }

        table th, table td {
            padding: 6px 13px;
            border: 1px solid #dfe2e5;
        }

        table tr:nth-child(2n) {
            background-color: #f6f8fa;
        }

        table th {
            font-weight: 600;
            background-color: #f6f8fa;
            text-align: left;
        }

        hr {
            height: 0.25em;
            padding: 0;
            margin: 24px 0;
            background-color: #e1e4e8;
            border: 0;
        }
    </style>
</head>
<body>

    <h1>Medly Backend - API</h1>

    <p>API REST para el sistema de gestión médica <strong>Medly</strong>. Este backend maneja la lógica de negocio, autenticación, gestión de citas (MySQL) y expedientes clínicos electrónicos (MongoDB).</p>

    <h2>🚀 Tecnologías</h2>
    <ul>
        <li><strong>Node.js</strong> con <strong>Express</strong> (Framework Web)</li>
        <li><strong>MySQL</strong> (Base de datos relacional: Usuarios, Citas, Agenda)</li>
        <li><strong>MongoDB</strong> (Base de datos documental: Expedientes Clínicos)</li>
        <li><strong>Redis</strong> (Gestión de Sesiones y Cookies)</li>
        <li><strong>Docker</strong> (Contenedorización de bases de datos)</li>
        <li><strong>Sequelize</strong> (ORM para MySQL)</li>
        <li><strong>Mongoose</strong> (ODM para MongoDB)</li>
    </ul>

    <hr>

    <h2>🛠️ Requisitos Previos</h2>
    <p>Asegúrate de tener instalado:</p>
    <ul>
        <li><a href="https://nodejs.org/">Node.js</a> (v18 o superior)</li>
        <li><a href="https://www.docker.com/products/docker-desktop/">Docker Desktop</a></li>
    </ul>

    <hr>

    <h2>⚙️ Configuración e Instalación</h2>

    <h3>1. Clonar el repositorio</h3>
    <pre><code>git clone https://github.com/zaokdev/medly_backend.git
cd medly_backend</code></pre>

    <h3>2. Instalar dependencias</h3>
    <pre><code>npm install</code></pre>

    <h3>3. Configurar Variables de Entorno</h3>
    <p>Crea un archivo <code>.env</code> en la raíz del proyecto y copia el siguiente contenido:</p>
    <pre><code>PORT=3000
SESSION_SECRET=tu_secreto_super_seguro_123

# MySQL (Relacional)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=medly
DB_PORT=3306

# MongoDB (NoSQL)
MONGO_URI=mongodb://localhost:27017/medly

# Redis (Sesiones)
REDIS_HOST=localhost
REDIS_PORT=6379</code></pre>

    <h3>4. Levantar Servicios (Bases de Datos)</h3>
    <p>Ejecuta el siguiente comando para iniciar MySQL, MongoDB y Redis en contenedores Docker:</p>
    <pre><code>docker-compose up -d</code></pre>
    <blockquote>
        <p><strong>Nota:</strong> La primera vez que se inicia MySQL, puede tardar unos segundos en estar listo.</p>
    </blockquote>

    <h3>5. Iniciar el Servidor (Modo Desarrollo)</h3>
    <pre><code>npm run dev</code></pre>
    <p>El servidor estará corriendo en: <code>http://localhost:3000</code></p>

    <hr>

    <h2>📦 Estructura de la Base de Datos</h2>

    <h3>SQL (MySQL)</h3>
    <ul>
        <li><strong>Usuarios:</strong> Médicos, Pacientes y Administradores.</li>
        <li><strong>Agenda Médica:</strong> Disponibilidad de horarios.</li>
        <li><strong>Citas:</strong> Registro transaccional de reservas.</li>
        <li><strong>Roles:</strong> Catálogo de permisos.</li>
    </ul>

    <h3>NoSQL (MongoDB)</h3>
    <ul>
        <li><strong>Expedientes:</strong> Documentos flexibles que contienen historial de consultas, recetas y signos vitales.</li>
    </ul>

    <hr>

    <h2>🧪 Endpoints Principales</h2>

    <table>
        <thead>
            <tr>
                <th>Método</th>
                <th>Ruta</th>
                <th>Descripción</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>POST</strong></td>
                <td><code>/auth/login</code></td>
                <td>Iniciar sesión (Crea Cookie)</td>
            </tr>
            <tr>
                <td><strong>POST</strong></td>
                <td><code>/auth/register</code></td>
                <td>Registrar nuevo paciente</td>
            </tr>
            <tr>
                <td><strong>GET</strong></td>
                <td><code>/doctors/schedule</code></td>
                <td>Ver horarios disponibles</td>
            </tr>
            <tr>
                <td><strong>POST</strong></td>
                <td><code>/appointments/book</code></td>
                <td>Reservar una cita</td>
            </tr>
            <tr>
                <td><strong>POST</strong></td>
                <td><code>/doctor/diagnose</code></td>
                <td>Guardar consulta y receta (Transacción Híbrida)</td>
            </tr>
        </tbody>
    </table>

    <hr>

    <h2>🛡️ Seguridad y Concurrencia</h2>
    <ul>
        <li><strong>Bloqueo Pesimista (Atomic Update):</strong> Se utiliza <code>UPDATE agenda SET disponible=0 WHERE id=? AND disponible=1</code> para evitar dobles reservas.</li>
        <li><strong>Transacciones Distribuidas:</strong> Se implementa un mecanismo de compensación (Rollback manual) para asegurar consistencia entre MySQL y MongoDB.</li>
        <li><strong>Cookies HttpOnly:</strong> Las sesiones se almacenan en Redis y no son accesibles vía JavaScript en el frontend.</li>
    </ul>

    <hr>

    <p><strong>Autor:</strong> Kevin Zapata</p>

</body>
</html>
