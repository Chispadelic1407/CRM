#!/usr/bin/env node

/**
 * Script de Testing Local para CRM
 * Verifica la configuración y funcionalidad básica antes del despliegue
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });
const http = require('http');

// Colores para output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, colors.green);
}

function logError(message) {
    log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
    log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
    log(`ℹ️  ${message}`, colors.blue);
}

// Test 1: Verificar variables de entorno requeridas
function testEnvironmentVariables() {
    logInfo('Test 1: Verificando variables de entorno...');
    
    const required = [
        'NODE_ENV',
        'PORT',
        'DB_HOST',
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD',
        'JWT_SECRET'
    ];
    
    const optional = [
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'GEMINI_API_KEY'
    ];
    
    let hasErrors = false;
    
    required.forEach(key => {
        const value = process.env[key];
        if (!value || value.includes('your_') || value.includes('_here') || value.includes('_host') || value.includes('_name') || value.includes('_user') || value.includes('_password')) {
            logError(`Variable requerida '${key}' no configurada o tiene valor de placeholder (valor: ${value})`);
            hasErrors = true;
        } else {
            logSuccess(`${key}: configurado`);
        }
    });
    
    optional.forEach(key => {
        const value = process.env[key];
        if (!value || value.includes('your_') || value.includes('_here')) {
            logWarning(`Variable opcional '${key}' no configurada (funcionalidad limitada)`);
        } else {
            logSuccess(`${key}: configurado`);
        }
    });
    
    return !hasErrors;
}

// Test 2: Verificar estructura de archivos
function testFileStructure() {
    logInfo('\nTest 2: Verificando estructura de archivos...');
    const fs = require('fs');
    const path = require('path');
    
    const requiredFiles = [
        'backend/server.js',
        'backend/package.json',
        'frontend/index.html',
        'database/init.sql'
    ];
    
    const requiredDirs = [
        'backend/controllers',
        'backend/middleware',
        'backend/models',
        'backend/routes',
        'backend/services',
        'backend/utils'
    ];
    
    let hasErrors = false;
    
    requiredFiles.forEach(file => {
        if (fs.existsSync(path.join(__dirname, file))) {
            logSuccess(`Archivo ${file} existe`);
        } else {
            logError(`Archivo ${file} no encontrado`);
            hasErrors = true;
        }
    });
    
    requiredDirs.forEach(dir => {
        if (fs.existsSync(path.join(__dirname, dir))) {
            logSuccess(`Directorio ${dir} existe`);
        } else {
            logError(`Directorio ${dir} no encontrado`);
            hasErrors = true;
        }
    });
    
    return !hasErrors;
}

// Test 3: Verificar dependencias de Node.js
function testNodeDependencies() {
    logInfo('\nTest 3: Verificando dependencias de Node.js...');
    const fs = require('fs');
    const path = require('path');
    
    const packageJsonPath = path.join(__dirname, 'backend/package.json');
    const nodeModulesPath = path.join(__dirname, 'backend/node_modules');
    
    if (!fs.existsSync(packageJsonPath)) {
        logError('package.json no encontrado');
        return false;
    }
    
    const packageJson = require(packageJsonPath);
    const dependencies = Object.keys(packageJson.dependencies || {});
    
    if (!fs.existsSync(nodeModulesPath)) {
        logError('node_modules no encontrado. Ejecuta: cd backend && npm install');
        return false;
    }
    
    logSuccess(`${dependencies.length} dependencias definidas`);
    logSuccess('node_modules existe');
    
    // Verificar dependencias críticas
    const critical = ['express', 'sequelize', 'mysql2', 'dotenv', 'jsonwebtoken'];
    let hasErrors = false;
    
    critical.forEach(dep => {
        const depPath = path.join(nodeModulesPath, dep);
        if (fs.existsSync(depPath)) {
            logSuccess(`Dependencia crítica '${dep}' instalada`);
        } else {
            logError(`Dependencia crítica '${dep}' NO instalada`);
            hasErrors = true;
        }
    });
    
    return !hasErrors;
}

// Test 4: Verificar conectividad de base de datos
async function testDatabaseConnection() {
    logInfo('\nTest 4: Verificando conexión a base de datos...');
    
    try {
        const mysql2 = require('mysql2/promise');
        
        const connection = await mysql2.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            connectTimeout: 10000
        });
        
        logSuccess('Conexión a base de datos exitosa');
        
        // Verificar tablas
        const [tables] = await connection.query('SHOW TABLES');
        logInfo(`Tablas encontradas: ${tables.length}`);
        
        if (tables.length === 0) {
            logWarning('No hay tablas en la base de datos. Sequelize las creará al iniciar.');
        } else {
            tables.forEach(table => {
                const tableName = Object.values(table)[0];
                logSuccess(`Tabla: ${tableName}`);
            });
        }
        
        await connection.end();
        return true;
    } catch (error) {
        logError(`Error de conexión a DB: ${error.message}`);
        return false;
    }
}

// Test 5: Iniciar servidor temporalmente
async function testServerStartup() {
    logInfo('\nTest 5: Probando inicio del servidor...');
    
    return new Promise((resolve) => {
        const { spawn } = require('child_process');
        const serverProcess = spawn('node', ['backend/server.js'], {
            env: { ...process.env, NODE_ENV: 'production' },
            cwd: __dirname
        });
        
        let output = '';
        let hasStarted = false;
        
        const timeout = setTimeout(() => {
            if (!hasStarted) {
                logError('Timeout: El servidor no inició en 15 segundos');
                serverProcess.kill();
                resolve(false);
            }
        }, 15000);
        
        serverProcess.stdout.on('data', (data) => {
            output += data.toString();
            if (output.includes('Server running') || output.includes('listening')) {
                hasStarted = true;
                clearTimeout(timeout);
                logSuccess('Servidor inició correctamente');
                
                // Esperar 2 segundos y probar health endpoint
                setTimeout(() => {
                    testHealthEndpoint().then((success) => {
                        serverProcess.kill();
                        resolve(success);
                    });
                }, 2000);
            }
        });
        
        serverProcess.stderr.on('data', (data) => {
            const error = data.toString();
            if (error.includes('Error') || error.includes('error')) {
                logError(`Error del servidor: ${error}`);
            }
        });
        
        serverProcess.on('error', (error) => {
            clearTimeout(timeout);
            logError(`Error iniciando servidor: ${error.message}`);
            resolve(false);
        });
    });
}

// Test 6: Verificar health endpoint
function testHealthEndpoint() {
    return new Promise((resolve) => {
        const port = process.env.PORT || 3001;
        
        const options = {
            hostname: 'localhost',
            port: port,
            path: '/api/health',
            method: 'GET',
            timeout: 5000
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    logSuccess(`Health endpoint respondió: ${res.statusCode}`);
                    try {
                        const json = JSON.parse(data);
                        logInfo(`Status: ${json.status}`);
                        resolve(true);
                    } catch (e) {
                        logWarning('Respuesta no es JSON válido');
                        resolve(true);
                    }
                } else {
                    logError(`Health endpoint respondió con error: ${res.statusCode}`);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (error) => {
            logError(`Error en health check: ${error.message}`);
            resolve(false);
        });
        
        req.on('timeout', () => {
            logError('Timeout en health check');
            req.destroy();
            resolve(false);
        });
        
        req.end();
    });
}

// Ejecutar todos los tests
async function runAllTests() {
    console.log('\n' + '='.repeat(60));
    log('🧪 TESTING LOCAL DEL CRM - PRE-DESPLIEGUE', colors.blue);
    console.log('='.repeat(60) + '\n');
    
    const results = {
        env: testEnvironmentVariables(),
        structure: testFileStructure(),
        dependencies: testNodeDependencies(),
        database: await testDatabaseConnection(),
        server: await testServerStartup()
    };
    
    console.log('\n' + '='.repeat(60));
    log('📊 RESUMEN DE TESTS', colors.blue);
    console.log('='.repeat(60) + '\n');
    
    Object.entries(results).forEach(([test, passed]) => {
        if (passed) {
            logSuccess(`${test}: PASS`);
        } else {
            logError(`${test}: FAIL`);
        }
    });
    
    const allPassed = Object.values(results).every(r => r === true);
    
    console.log('\n' + '='.repeat(60));
    if (allPassed) {
        logSuccess('✨ TODOS LOS TESTS PASARON - LISTO PARA DESPLIEGUE');
    } else {
        logError('⚠️  ALGUNOS TESTS FALLARON - REVISA LOS ERRORES ANTES DE DESPLEGAR');
    }
    console.log('='.repeat(60) + '\n');
    
    process.exit(allPassed ? 0 : 1);
}

// Ejecutar
runAllTests().catch(error => {
    logError(`Error fatal: ${error.message}`);
    process.exit(1);
});
