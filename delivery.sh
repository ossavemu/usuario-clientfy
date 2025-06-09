#!/usr/bin/env bash

set -e

KEY_PATH="$HOME/.ssh/id_ed25519"
read -p "👉 Ingresa la IP del servidor remoto (ej. 64.23.186.39): " HOST_IP
IP="root@$HOST_IP"
REMOTE_DIR="/root/usuario-clientfy"

echo "--------------------------------------"
echo "🚀 Deploy a $IP usando Bun + Next.js"
echo "--------------------------------------"

# 1) Verifica que la clave SSH esté cargada
echo "🔐 Verificando clave SSH..."
ssh-add -l | grep -q "$(ssh-keygen -lf $KEY_PATH | awk '{print $2}')" || {
  echo "❌ Clave SSH no cargada. Ejecuta: ssh-add $KEY_PATH"
  exit 1
}

# 2) Build local
echo "🏗️  Ejecutando build local con Bun..."
bun install
bun run build

# 3) Limpiar y transferir `.next` con tar (ignorando xattrs de macOS)
echo "🗑️  Limpiando .next en el servidor..."
ssh -i "$KEY_PATH" "$IP" "rm -rf $REMOTE_DIR/.next && mkdir -p $REMOTE_DIR/.next"

echo "📦 Enviando contenido de .next (ignorando metadatos macOS)..."
# Solución robusta para ignorar xattrs
tar --exclude='._*' \
    --exclude='.DS_Store' \
    --disable-copyfile \
    -czf - -C .next . \
  | ssh -i "$KEY_PATH" "$IP" "tar -xzf - -C $REMOTE_DIR/.next"

# 4) Transferir start.prod.sh solo si existe localmente
if [ -f start.prod.sh ]; then
  echo "⬆️  Enviando start.prod.sh..."
  scp -i "$KEY_PATH" start.prod.sh $IP:$REMOTE_DIR/
  ssh -i "$KEY_PATH" "$IP" "chmod +x $REMOTE_DIR/start.prod.sh"
else
  echo "⚠️  Advertencia: start.prod.sh no encontrado localmente"
fi

# 5) Verificación del contenido en .next
echo "🔍 Verificando .next en el servidor..."
VERIFY=$(ssh -i "$KEY_PATH" "$IP" \
  "[ -d $REMOTE_DIR/.next ] && [ \"\$(ls -A $REMOTE_DIR/.next)\" ] && echo OK || echo FAIL"
)

if [ "$VERIFY" != "OK" ]; then
  echo "❌ Verificación fallida: .next está vacío o no existe."
  exit 2
fi
echo "✅ Verificación exitosa: .next contiene archivos."

# 6) Reiniciar app remotamente
echo "♻️  Reiniciando aplicación en el servidor..."
ssh -i "$KEY_PATH" "$IP" "
  cd $REMOTE_DIR
  if [ -f app.pid ]; then
    echo '🛑 Deteniendo instancia anterior...'
    kill \$(cat app.pid) 2>/dev/null || true
    rm -f app.pid
  fi
  nohup ./start.prod.sh > ./logs.out 2>&1 &
  echo \$! > app.pid
  echo \"✅ Aplicación reiniciada con PID: \$(cat app.pid)\"
"

echo "🎉 Despliegue completo y exitoso en $IP"