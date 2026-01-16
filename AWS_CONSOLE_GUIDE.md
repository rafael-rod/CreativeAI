# Guía de Configuración AWS (Desde la Consola Web)

Esta guía te ayudará a crear los recursos necesarios (S3 y DynamoDB) utilizando únicamente la interfaz web de AWS (AWS Management Console).

## 1. Crear Bucket S3

1.  Inicia sesión en la **AWS Management Console**.
2.  Navega al servicio **S3**.
3.  Haz clic en el botón naranja **"Crear bucket"** (Create bucket).
4.  **Configuración General**:
    - **Nombre del bucket**: Ingresa un nombre único (ej. `proyecto-cloud-content-2025`). _Anota este nombre, lo necesitarás para el archivo `.env`_.
    - **Región de AWS**: Selecciona la región donde estás desplegando (ej. `us-east-1` N. Virginia).
5.  **Propiedad de objetos**: Deja la opción por defecto ("ACL deshabilitadas").
6.  **Configuración de bloqueo de acceso público**:
    - Mantén marcada la opción **"Bloquear todo el acceso público"** (Block all public access) por seguridad, a menos que tengas un requerimiento específico para hacerlo público.
7.  Haz clic en **"Crear bucket"** al final de la página.

---

## 2. Crear Tabla DynamoDB

1.  Navega al servicio **DynamoDB**.
2.  En el panel lateral, haz clic en **"Tablas"**.
3.  Haz clic en el botón naranja **"Crear tabla"** (Create table).
4.  **Detalles de la tabla**:
    - **Nombre de la tabla**: `generated_content` (o el nombre que prefieras).
    - **Clave de partición** (Partition Key): Escribe `id` y selecciona el tipo **Cadena** (String).
    - **Clave de ordenación** (Sort Key): _Déjalo vacío_.
5.  **Configuración de la tabla**:
    - Puedes dejar la **Configuración predeterminada** (Default settings).
    - Opcional: Si quieres ahorrar costos en pruebas, selecciona "Personalizar configuración" y elige **Bajo demanda** (On-demand).
6.  Haz clic en **"Crear tabla"** al final de la página.

_Nota: No es necesario crear índices secundarios para esta versión del proyecto._

---

## 3. Actualizar tu proyecto

Una vez creados los recursos, ve a tu archivo `.env` y actualiza las siguientes variables:

```env
AWS_S3_BUCKET=el-nombre-de-tu-bucket
AWS_DYNAMODB_TABLE=generate_content
```
