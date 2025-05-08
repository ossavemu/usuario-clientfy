#!/bin/bash
echo "Iniciando aplicación en modo producción..."
nohup bun run start > ./logs.out 2>&1 &
echo $! > ./app.pid
echo "Aplicación iniciada con PID: $(cat ./app.pid)"
