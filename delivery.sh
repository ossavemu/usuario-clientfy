#!/usr/bin/env bash

KEY_PATH="$HOME/.ssh/id_ed25519"
IP="root@143.110.233.60"
REMOTE_DIR="/root/usuario-clientfy"

# 1) Comprueba clave SSH
ssh-add -l | grep -q "$(ssh-keygen -lf $KEY_PATH | awk '{print $2}')" || {
  echo "🔑 Clave SSH no cargada. Ejecuta: ssh-add $KEY_PATH"
  exit 1
}

# 2) Limpia remoto
echo "🗑️  Limpiando .next en el servidor…"
ssh -i "$KEY_PATH" "$IP" "rm -rf $REMOTE_DIR/.next && mkdir -p $REMOTE_DIR/.next"

# 3) Envía **solo contenido** + desactiva xattrs local y remoto
echo "📦 Enviando contenido de .next sin anidar…"
{ 
  COPYFILE_DISABLE=1 tar --disable-copyfile -czf - -C .next . \
    | ssh -i "$KEY_PATH" "$IP" \
        "tar --no-xattrs -xzf - -C $REMOTE_DIR/.next"
} 2> >(grep -v 'LIBARCHIVE.xattr.com.apple.provenance' >&2)

# 4) Verificación exprés
echo "🔍 Verificando en el servidor…"
VERIFY=$(ssh -i "$KEY_PATH" "$IP" \
  "[ -d $REMOTE_DIR/.next ] && [ \"\$(ls -A $REMOTE_DIR/.next)\" ] && echo OK || echo FAIL"
)

if [ "$VERIFY" = "OK" ]; then
  echo "✅ Verificación exitosa: .next en el servidor contiene archivos."
  exit 0
else
  echo "❌ Verificación fallida: .next está vacío o no existe."
  exit 2
fi
