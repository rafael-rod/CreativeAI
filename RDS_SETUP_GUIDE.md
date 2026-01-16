# Guía de Creación RDS (PostgreSQL)

Sigue estos pasos para crear tu base de datos en AWS.

## 1. Crear Base de Datos

1.  Ve a la consola de AWS y busca **RDS**.
2.  Haz clic en el botón naranja **"Crear base de datos"** (Create database).
3.  Selecciona **"Creación estándar"** (Standard create).

## 2. Configuración del Motor

1.  **Tipo de motor**: Selecciona **PostgreSQL**.
2.  **Versión**: Selecciona la versión por defecto (ej. PostgreSQL 16.x).
3.  **Plantillas** (Templates):
    - Selecciona **"Capa gratuita"** (Free tier) si está disponible.
    - Si no (ej. cuenta de laboratorio), selecciona **"Desarrollo y pruebas"** (Dev/Test).

## 3. Configuración

1.  **Identificador de instancias de base de datos**: `proyecto-cloud-db` (o lo que prefieras).
2.  **Nombre de usuario maestro**: `postgres` (déjalo así).
3.  **Contraseña maestra**: Escribe una contraseña segura. **ANÓTALA**.

## 4. Configuración de la Instancia

1.  **Clase de instancia**: Selecciona `db.t3.micro` o `db.t3.small` (la opción más barata disponible).

## 5. Conectividad (¡IMPORTANTE!)

1.  **VPC**: Deja la por defecto.
2.  **Acceso público** (Public access):
    - **SÍ** (Yes): Si necesitas conectarte desde tu computadora local para probar (`npm run dev`).
    - **NO**: Si solo te conectarás desde la instancia EC2.
    - _Recomendación_: Ponle **SÍ** por ahora para poder hacer el `prisma db push` desde tu máquina.
3.  **Grupos de seguridad de VPC**:
    - Selecciona "Crear nuevo" (Create new).
    - Nombre: `rds-launch-wizard`.
    - Esto permitirá el tráfico al puerto 5432.

## 6. Autenticación de base de datos

- Selecciona **"Autenticación con contraseña"** (Password authentication).

## 7. Configuración adicional (Additional configuration)

- **Nombre de la base de datos inicial** (Initial database name): Escribe `app_db` (Opcional, pero recomendado para que cree la DB por ti).
- Desmarca "Habilitar copias de seguridad automáticas" si es solo para pruebas (ahorra espacio).

## 8. Finalizar

1.  Haz clic en **"Crear base de datos"**.
2.  Espera unos minutos a que el estado cambie a "Disponible" (Available).

---

## 9. Obtener la Conexión para tu .env

Una vez creada:

1.  Entra a la instancia de base de datos.
2.  Copia el **Punto de enlace** (Endpoint) (ej. `proyecto-cloud.cxyz.us-east-1.rds.amazonaws.com`).
3.  Construye tu `DATABASE_URL` así:

```env
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@TU_ENDPOINT:5432/app_db"
```

> **Ejemplo:** > `postgresql://postgres:mypassword123@proyecto-cloud.cxyz.us-east-1.rds.amazonaws.com:5432/app_db`

## 10. Aplicar Cambios

Una vez tengas la URL en tu `.env`, ejecuta en tu terminal:

```bash
npx prisma db push
```
