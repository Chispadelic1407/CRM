-- Script de inicialización de la base de datos
-- Se ejecuta automáticamente cuando se crea el contenedor de MariaDB por primera vez

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS crm_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE crm_production;

-- Las tablas serán creadas automáticamente por Sequelize al iniciar la aplicación
-- Este script solo asegura que la base de datos exista

-- Opcional: Configurar permisos adicionales si es necesario
-- GRANT ALL PRIVILEGES ON crm_production.* TO 'crm_user'@'%';
-- FLUSH PRIVILEGES;
