# Guía de Deployment en AWS Elastic Beanstalk

## Prerrequisitos

1. **AWS CLI instalado y configurado**
   ```bash
   aws configure
   ```

2. **EB CLI instalado**
   ```bash
   pip install awsebcli
   ```

3. **Variables de entorno configuradas**
   - Copiar `.env.example` a `.env` y configurar todas las variables

## Configuración Inicial

### 1. Configurar VPC y Subnets
Actualizar los siguientes archivos con tus valores reales:

**`.ebextensions/02-database.config`**
```yaml
SubnetIds:
  - subnet-12345678  # Reemplazar con tu subnet ID
  - subnet-87654321  # Reemplazar con tu subnet ID
```

**`.ebextensions/03-security.config`**
```yaml
VPCId: vpc-12345678  # Reemplazar con tu VPC ID
```

### 2. Configurar Variables de Entorno en AWS
```bash
# Configurar variables sensibles en AWS Systems Manager
aws ssm put-parameter --name "/elasticbeanstalk/crm/rds/password" --value "tu-password-seguro" --type "SecureString"
```

## Proceso de Deployment

### 1. Inicializar Elastic Beanstalk
```bash
cd /ruta/a/tu/proyecto
eb init
```

Seleccionar:
- Región: us-east-1 (o tu región preferida)
- Aplicación: crm-twilio-app
- Plataforma: Node.js 18 running on 64bit Amazon Linux 2

### 2. Crear Entorno
```bash
eb create crm-production --platform "Node.js 18 running on 64bit Amazon Linux 2"
```

### 3. Configurar Variables de Entorno
```bash
eb setenv TWILIO_ACCOUNT_SID=tu_account_sid \
         TWILIO_AUTH_TOKEN=tu_auth_token \
         TWILIO_PHONE_NUMBER=+1234567890 \
         AGENT_PHONE_NUMBER=+1234567890 \
         JWT_SECRET=tu-jwt-secret \
         GOOGLE_AI_API_KEY=tu_google_ai_key
```

### 4. Deploy
```bash
eb deploy
```

## Configuración de Base de Datos

### 1. Crear RDS Instance
La configuración en `.ebextensions/02-database.config` creará automáticamente una instancia RDS MySQL.

### 2. Configurar Variables de Base de Datos
```bash
eb setenv RDS_HOSTNAME=tu-rds-endpoint.region.rds.amazonaws.com \
         RDS_USERNAME=crmadmin \
         RDS_PASSWORD=tu-password-seguro \
         RDS_DB_NAME=crm_production \
         DATABASE_URL=mysql://crmadmin:password@endpoint:3306/crm_production
```

## Monitoreo y Logs

### 1. Ver Logs
```bash
eb logs
```

### 2. Monitoreo de Salud
```bash
eb health
```

### 3. Acceder a CloudWatch
Los logs se envían automáticamente a CloudWatch para monitoreo avanzado.

## Comandos Útiles

### Deployment
```bash
# Deploy rápido
npm run eb-deploy

# Ver estado
eb status

# Abrir aplicación en navegador
eb open
```

### Debugging
```bash
# SSH a la instancia
eb ssh

# Ver logs en tiempo real
eb logs --all

# Reiniciar aplicación
eb restart
```

## Configuración de Dominio Personalizado

### 1. Configurar Route 53
```bash
# Crear hosted zone
aws route53 create-hosted-zone --name tu-dominio.com --caller-reference $(date +%s)
```

### 2. Configurar SSL
```bash
# Solicitar certificado SSL
aws acm request-certificate --domain-name tu-dominio.com --validation-method DNS
```

## Escalado Automático

La configuración incluye:
- **Mínimo**: 1 instancia
- **Máximo**: 4 instancias
- **Tipo**: t3.small
- **Escalado**: Basado en CPU y latencia

## Seguridad

### Configuraciones Incluidas:
- **Helmet.js**: Headers de seguridad
- **Rate Limiting**: Protección contra ataques
- **CORS**: Configurado para producción
- **Security Groups**: Acceso restringido
- **Encryption**: Base de datos encriptada

## Backup y Recuperación

### Base de Datos:
- **Backup automático**: 7 días de retención
- **Snapshots**: Configurados automáticamente

### Aplicación:
- **Versiones**: EB mantiene versiones anteriores
- **Rollback**: `eb deploy --version=version-label`

## Troubleshooting

### Problemas Comunes:

1. **Error de conexión a base de datos**
   ```bash
   eb setenv RDS_HOSTNAME=nuevo-endpoint
   eb restart
   ```

2. **Timeout en health checks**
   - Verificar que `/health` endpoint responda
   - Revisar logs: `eb logs`

3. **Variables de entorno faltantes**
   ```bash
   eb printenv  # Ver variables actuales
   eb setenv VARIABLE=valor
   ```

## Costos Estimados

### Configuración Básica (us-east-1):
- **EC2 t3.small**: ~$15/mes
- **RDS db.t3.micro**: ~$12/mes
- **Load Balancer**: ~$18/mes
- **Total estimado**: ~$45/mes

## Contacto y Soporte

Para problemas de deployment, revisar:
1. Logs de CloudWatch
2. Health dashboard de EB
3. Documentación de AWS EB
