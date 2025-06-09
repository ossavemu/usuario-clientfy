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

# 3) Limpiar y transferir `.next` con tar (más eficiente que rsync para carpetas grandes)
echo "🗑️  Limpiando .next en el servidor..."
ssh -i "$KEY_PATH" "$IP" "rm -rf $REMOTE_DIR/.next && mkdir -p $REMOTE_DIR/.next"

echo "📦 Enviando contenido de .next sin xattrs..."
COPYFILE_DISABLE=1 tar --disable-copyfile -czf - -C .next . \
  | ssh -i "$KEY_PATH" "$IP" \
      "tar --no-xattrs -xzf - -C $REMOTE_DIR/.next"

# 4) Transferir archivos adicionales con rsync
echo "🔁 Sincronizando archivos auxiliares..."
rsync -az --delete \
  public \
  package.json \
  bun.lockb \
  .env.production \
  start.sh \
  -e "ssh -i $KEY_PATH" \
  $IP:$REMOTE_DIR

# 5) Verificación rápida del contenido en .next
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
    kill \$(cat app.pid) || true
    rm app.pid
  fi
  chmod +x ./start.prod.sh
  ./start.prod.sh
"

echo "🎉 Despliegue completo y exitoso en $IP"
