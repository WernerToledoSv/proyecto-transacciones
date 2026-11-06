---
name: project-change-documentation
description: "Úsala al preparar un commit, publicar o subir cambios a Git, o cuando se solicite documentar cambios del proyecto. Resume brevemente los cambios reales y actualiza el README.md de la raíz, fuera de backend y frontend."
---

# Documentación de cambios del proyecto

## Objetivo

Ayudar a resumir los cambios reales del proyecto y mantener actualizada su documentación general en el `README.md` de la raíz del repositorio.

## Responsabilidades

- Revisar los cambios locales, preparados para commit o ya confirmados, según el contexto disponible.
- Explicar brevemente qué cambió y qué parte del proyecto afecta.
- Actualizar el README general ubicado en la raíz, no los README de `backend/` o `frontend/`, cuando los cambios deban quedar documentados.
- Mantener la documentación concisa, coherente con la estructura actual y basada en evidencia del repositorio.

## Cuándo utilizarla

- Antes de crear un commit o de publicar/subir cambios a Git.
- Cuando el usuario pida un resumen breve de los cambios realizados.
- Cuando se solicite actualizar la documentación general del proyecto tras un cambio.

## Archivos relacionados del proyecto

- `README.md`: documentación general ubicada en la raíz del repositorio.
- `backend/README.md` y `frontend/README.md`, si existen: documentación específica de cada capa; no sustituye al README general.
- Archivos modificados, preparados para commit o incluidos en commits recientes: fuente para verificar los cambios que se describirán.

## Procedimiento

1. Identificar qué cambios se quieren documentar. Revisar el estado de Git, los diffs disponibles y los archivos afectados; leer archivos nuevos no incluidos en un diff cuando sea necesario.
2. Separar cambios propios del proyecto de modificaciones preexistentes o ajenas a la tarea. Si el alcance de los cambios no está claro, solicitar aclaración antes de atribuirlos.
3. Resumir en español, de forma breve y concreta, qué se cambió y su efecto confirmado. No inventar resultados, funcionalidades ni estado de publicación.
4. Actualizar solo el `README.md` de la raíz. Integrar la explicación en la sección pertinente o, si hace falta, añadir una sección breve de cambios; evitar duplicar información ya documentada.
5. Comprobar que los enlaces, rutas y afirmaciones añadidos correspondan al repositorio y que la modificación documental no altere código funcional.
6. Informar el resumen y confirmar si se actualizó el README. No afirmar que los cambios fueron subidos o publicados si no se verificó.

## Entradas y salidas

- **Entradas:** solicitud de documentación, estado/diff de Git y archivos que contienen los cambios.
- **Salida:** explicación breve de los cambios y actualización coherente del `README.md` raíz cuando corresponda.

## Reglas y restricciones

- El README general es el `README.md` de la raíz; no actualizar por error los README internos de backend o frontend.
- Documentar solo cambios verificables. No incluir cambios ajenos ni afirmar que se ejecutaron pruebas, commits o publicaciones sin evidencia.
- Mantener el README conciso: explicar cambios de alcance general y no copiar el diff ni enumerar detalles internos innecesarios.
- No crear commits, hacer push ni subir archivos a GitHub. La Skill documenta los cambios; las operaciones Git requieren una solicitud y autorización explícitas del usuario.
- Esta Skill se activa por solicitud o selección en Copilot Chat; no es un hook automático que se ejecute al hacer commit o push.

## Ejemplo

Ante «Prepara estos cambios para subirlos a Git y documenta qué hice», revisar los cambios reales, actualizar brevemente el README de la raíz y presentar el resumen. No crear el commit ni hacer push salvo que el usuario lo solicite explícitamente.
