#!/bin/bash
# Script para configurar pg_hba.conf para permitir conexiones con contraseña

echo "Configurando pg_hba.conf para permitir conexiones externas..."

# Agregar regla para permitir conexiones desde cualquier host con md5
cat >> "$PGDATA/pg_hba.conf" <<EOF

# Permitir conexiones desde el host con autenticación md5
host    all             all             0.0.0.0/0               md5
host    all             all             ::/0                    md5
EOF

echo "pg_hba.conf configurado correctamente"
