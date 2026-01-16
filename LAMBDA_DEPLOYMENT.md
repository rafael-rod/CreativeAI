# Guía de Despliegue: Lambda S3 -> DynamoDB

Sigue estos pasos para crear y conectar tu función Lambda.

## 1. Crear la Función Lambda

1. Ve a **AWS Lambda** en la consola.
2. Click en **"Create function"**.
3. Selecciona **"Author from scratch"**.
4. **Function name:** `s3-metadata-sync`.
5. **Runtime:** `Node.js 20.x`.
6. **Architecture:** `x86_64`.
7. **Permissions (IMPORTANTE):**
   - Despliega la flecha **"Change default execution role"**.
   - Selecciona **"Use an existing role"**.
   - En el buscador, elige el rol que suele llamarse `LabRole`, `LearnerLabRole` o `vocareum-lab-role`. _Este rol ya tiene los permisos necesarios pre-configurados por tu institución._
8. Click en **"Create function"**.

## 2. Copiar el Código

1. En el editor de código de la consola ("Code source"):
   - Abre `index.mjs` (o `index.js`).
   - Copia y pega el contenido del archivo `lambda/s3-trigger.js` de este proyecto.
     _Nota: Si la consola usa CommonJS (`remote requires`), asegúrate de que el archivo termine en `.mjs` o usa `require` en lugar de `import`._
2. Click en **"Deploy"**.

## 3. Configurar Permisos (SALTAR este paso)

**¡IMPORTANTE!**
Si estás usando `LabRole`, **NO** intentes adjuntar políticas nuevas (recibirás un error de permiso denegado `iam:AttachRolePolicy`).
El `LabRole` ya viene pre-configurado con los permisos necesarios para S3 y DynamoDB.
**Pasa directamente al paso 4.**

## 4. Configurar el Trigger (Disparador)

1. Vuelve a tu función Lambda.
2. Click en **"Add trigger"**.
3. Selecciona **S3**.
4. **Bucket:** Selecciona tu bucket (`proyecto-cloud-content-2025`).
5. **Event types:** `All object create events`.
6. Toca **"I acknowledge..."** (advertencia de recursión).
7. Click **"Add"**.

## 5. Prueba

1. Sube una imagen a tu bucket S3 manualmente.
2. Revisa la tabla `generated_content` en DynamoDB. ¡Debería aparecer el registro mágico!
