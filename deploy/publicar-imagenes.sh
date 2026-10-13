#!/usr/bin/env bash
set -euo pipefail

USUARIO="${DOCKERHUB_USER:-miguelgarduno123}"
VERSION="${SENTINEL_TAG:-1.0}"
API_URL="${PUBLIC_API_URL:-http://172.16.64.2/api}"
PLATAFORMAS="${PLATAFORMAS:-linux/amd64,linux/arm64}"
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND="${FRONTEND_PATH:-$RAIZ/../FrontendEquipo1}"

publicar() {
  local nombre="$1"; shift
  docker buildx build --platform "$PLATAFORMAS" \
    -t "$USUARIO/$nombre:$VERSION" -t "$USUARIO/$nombre:latest" --push "$@"
}

publicar sentinel-db -f "$RAIZ/deploy/db/Dockerfile" "$RAIZ"
publicar sentinel-backend -f "$RAIZ/Dockerfile" "$RAIZ"
publicar sentinel-proxy -f "$RAIZ/deploy/app/proxy.Dockerfile" "$RAIZ/deploy/app"
publicar sentinel-admin-web --build-arg "NEXT_PUBLIC_API_URL=$API_URL" -f "$FRONTEND/Dockerfile" "$FRONTEND"

echo "Publicadas en https://hub.docker.com/u/$USUARIO con la etiqueta $VERSION"
