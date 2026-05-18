---
name: cloudflare-tunnel
category: community
version: 1.0.0
description: Túnel cloudflared persistente para exponer el sitio local
tags: [cloudflare, tunnel, dev]
requires: []
needs: []
recommendedFor: [static, ecommerce]
---

# Cloudflare Tunnel

Skill para crear túneles seguros de desarrollo con Cloudflare Tunnel.

## Uso Rápido

```bash
# Setup inicial (una vez)
./setup.sh <subdomain> <port>

# Ejemplo
./setup.sh swl 4321

# Iniciar tunnel
cloudflared tunnel run swl
```

## Configuración

### 1. Instalar cloudflared

```bash
# Linux
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# macOS
brew install cloudflared

# Verificar
cloudflared --version
```

### 2. Autenticar

```bash
cloudflared tunnel login
# Abre navegador, selecciona dominio, autoriza
```

### 3. Crear tunnel

```bash
cloudflared tunnel create <nombre>
# Guarda el Tunnel ID que aparece
```

### 4. Configurar DNS

```bash
cloudflared tunnel route dns <nombre> <subdomain>.<tudominio.com>
```

## Script de Setup Automático

```bash
#!/bin/bash
# setup.sh

TUNNEL_NAME=$1
PORT=$2
DOMAIN="1511170.xyz"  # o tu dominio

# Crear tunnel
cloudflared tunnel create $TUNNEL_NAME

# Configurar DNS
cloudflared tunnel route dns $TUNNEL_NAME "$TUNNEL_NAME.$DOMAIN"

# Crear config.yml
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/${TUNNEL_NAME}.yml << EOF
tunnel: $(cloudflared tunnel list | grep $TUNNEL_NAME | awk '{print $1}')
credentials-file: ~/.cloudflared/$(cloudflared tunnel list | grep $TUNNEL_NAME | awk '{print $1}').json

ingress:
  - hostname: ${TUNNEL_NAME}.${DOMAIN}
    service: http://localhost:${PORT}
  - service: http_status:404
EOF

echo "Tunnel configurado: https://${TUNNEL_NAME}.${DOMAIN} → localhost:${PORT}"
```

## Flujo de Trabajo Dev/Prod

### Desarrollo (Dev)
- **URL:** `*.1511170.xyz` (tunnel)
- **Servidor:** Localhost con hot reload
- **Uso:** Testing, previews, desarrollo activo

### Producción (Prod)
- **URL:** `*.kinto.info` (Cloudflare Pages)
- **Servidor:** CDN global
- **Uso:** Sitio público final

## Servicio Systemd (Opcional)

```bash
# Crear servicio
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

## Comandos Útiles

```bash
# Listar tunnels
cloudflared tunnel list

# Iniciar tunnel
cloudflared tunnel run <nombre>

# Iniciar con config específica
cloudflared tunnel --config ~/.cloudflared/mi-tunnel.yml run

# Ver logs
cloudflared tunnel info <nombre>

# Eliminar tunnel
cloudflared tunnel delete <nombre>

# Cleanup
cloudflared tunnel cleanup
```

## Troubleshooting

### Error: "Cannot determine default origin certificate"

```bash
# Re-autenticar
cloudflared tunnel login
```

### Error: "Tunnel already exists"

```bash
# Usar nombre diferente o eliminar existente
cloudflared tunnel delete <nombre>
```

### Tunnel no conecta

```bash
# Verificar tunnel está running
cloudflared tunnel list

# Reiniciar
cloudflared tunnel run <nombre>
```

## Configuración Avanzada

### Múltiples servicios en un tunnel

```yaml
# config.yml
tunnel: <tunnel-id>
credentials-file: /home/user/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: api.misitio.com
    service: http://localhost:3000
  - hostname: app.misitio.com
    service: http://localhost:4321
  - hostname: admin.misitio.com
    service: http://localhost:8080
  - service: http_status:404
```

### Con headers personalizados

```yaml
ingress:
  - hostname: api.misitio.com
    service: http://localhost:3000
    originRequest:
      httpHostHeader: api.local
      noTLSVerify: true
```

## Ejemplos

### Tunnel para Astro dev

```bash
# Setup
./setup.sh edupayments 4322

# En desarrollo - Terminal 1
cd sites/edupayments && npm run dev -- --port 4322

# En desarrollo - Terminal 2
cloudflared tunnel run edupayments

# Resultado: https://edupayments.1511170.xyz
```

### Múltiples proyectos

```bash
# Proyecto 1: SWL
./setup.sh swl 4321
cloudflared tunnel run swl

# Proyecto 2: Edupayments
./setup.sh edupayments 4322
cloudflared tunnel run edupayments
```

## Recursos

- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [TryCloudflare](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/do-more-with-tunnels/trycloudflare/)

## Notas

- **Gratuito** para uso personal
- No requiere IP pública
- Encriptación TLS end-to-end
- Ideal para desarrollo y testing
- No usar para producción (usar Cloudflare Pages en su lugar)
