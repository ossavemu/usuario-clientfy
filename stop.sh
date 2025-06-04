#!/bin/bash
if [ -f ./app.pid ]; then
  PID=$(cat ./app.pid)
  if ps -p $PID > /dev/null; then
    echo "Deteniendo aplicación con PID: $PID"
    kill $PID
    rm ./app.pid
    echo "Aplicación detenida correctamente"
  else
    echo "No se encontró proceso con PID: $PID"
    rm ./app.pid
  fi
else
  echo "Archivo de PID no encontrado. La aplicación no está en ejecución."
fi 