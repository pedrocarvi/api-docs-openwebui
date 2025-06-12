## API Open WebUI

Este proyecto es una API desarrollada con Express que permite administrar los archivos y bases de conocimiento (KB, por sus siglas en inglés) de una cuenta de Open WebUI.

Incluye además documentación para configurar la sincronización entre directorios de Google Drive y las KBs, lo que facilita la gestión centralizada de archivos directamente desde Google Drive, con actualizaciones automáticas en una o más bases de conocimiento.

### Variables de entorno

1. Crear archivo .env en la raíz del proyecto - se puede tomar el .env.example de ejemplo.
2. Asignar puerto y agregar la URL base de Open WebUI:
```
PORT=3001
OPEN_WEB_UI_BASE_URL=https://www.tuchat.com/api/v1
```
3. Cabe destacar que si se quiere usar un mismo token siempre, se puede directamente agregar el token en la siguiente variable, y se puede modificar el middleware para que lo utilice.
```
OPEN_WEB_UI_TOKEN=

req.owuiToken = process.env.OPEN_WEB_UI_TOKEN;

```

### Uso de la API para administrar los archivos de Open WebUI

Una vez completado el .env, se puede levantar el proyecto y acceder a la ruta /api-docs para acceder al Swagger.

El primer endpoint, ```/authOwui/signin```, permite la autenticación ingresando simplemente el mail y contraseña de un usuario admin. 

Copiar el token de la response del endpoint y agregar en 'Authorize' de Swagger.