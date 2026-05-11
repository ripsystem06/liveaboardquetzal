#!/usr/bin/env bash
#
# Quetzal Liveaboard — Commit Protocol
#
# Estructura de commits con protocolo documentado.
# Uso: ./scripts/commit-protocol.sh
#
# Reglas:
#   1. Siempre conventional commits: type(scope): description
#   2. Body estructurado con secciones fijas (Why, Changes, Route map si aplica)
#   3. NO commitear sin revisar el diff primero
#   4. NO commitear archivos generados (.atl/, node_modules/, .next/)
#   5. Siempre verificar build antes de commitear cambios de código
#
# Scope convenciones del proyecto:
#   p0   — Critical fixes (broken links, 404s, security)
#   i18n — Internationalization changes
#   ui   — Visual/UX changes (palette, layout, components)
#   seo  — Metadata, sitemap, structured data
#   form — Contact form, booking, validation
#   auth — Authentication, registration
#   admin— Admin panel changes
#   api  — Backend integration, API routes
#   infra— Config, CI, tooling
#

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Quetzal — Protocolo de Commit${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo ""

# Check we're in a git repo
if ! git rev-parse --is-inside-work-tree &>/dev/null; then
  echo -e "${RED}✗ No estás en un repositorio git.${NC}"
  exit 1
fi

# Check for uncommitted changes
if git diff --staged --quiet 2>/dev/null && git diff --quiet 2>/dev/null; then
  echo -e "${YELLOW}⚠ No hay cambios para commitear.${NC}"
  exit 0
fi

# Show current branch
BRANCH=$(git branch --show-current)
echo -e "${BLUE}Rama:${NC} $BRANCH"
echo ""

# Show unstaged changes
echo -e "${YELLOW}▸ Cambios sin stagiar:${NC}"
git diff --stat
echo ""

# Show staged changes
echo -e "${GREEN}▸ Cambios en staging area:${NC}"
git diff --staged --stat
echo ""

# Warn about files that should NOT be committed
EXCLUDED_PATTERNS=(".atl/" "node_modules/" ".next/" "*.local" "*.env")
STAGED_FILES=$(git diff --staged --name-only 2>/dev/null || true)
WARNINGS=false

for pattern in "${EXCLUDED_PATTERNS[@]}"; do
  if echo "$STAGED_FILES" | grep -q "$pattern"; then
    echo -e "${RED}✗ ALERTA: Archivo que NO debería commitearse detectado: $pattern${NC}"
    WARNINGS=true
  fi
done

if [ "$WARNINGS" = true ]; then
  echo ""
  echo -e "${RED}Cancelá los archivos con: git restore --staged <archivo>${NC}"
  echo -e "${RED}O_readd_ todo sin los excluidos y volvé a correr este script.${NC}"
  echo ""
  read -p "¿Continuar de todos modos? (s/N): " CONTINUE
  if [[ ! "$CONTINUE" =~ ^[sS]$ ]]; then
    echo -e "${YELLOW}Commit cancelado.${NC}"
    exit 1
  fi
fi

# Check if build passes (if package.json exists)
if [ -f "package.json" ]; then
  echo -e "${BLUE}▸ Verificando build...${NC}"
  if npm run build 2>&1 | tail -5 | grep -q "Generating static pages"; then
    echo -e "${GREEN}✓ Build exitoso.${NC}"
  else
    echo -e "${RED}✗ Build falló. Corregí los errores antes de commitear.${NC}"
    exit 1
  fi
  echo ""
fi

# Prompt for commit type
echo -e "${CYAN}Tipos de commit:${NC}"
echo "  fix     — Bug fix, corrección"
echo "  feat    — Nueva funcionalidad"
echo "  refactor— Reestructuración sin cambio de comportamiento"
echo "  style   — Cambios visuales (palette, CSS)"
echo "  docs    — Documentación"
echo "  chore   — Config, tooling, mantenimiento"
echo ""
read -p "Tipo (fix/feat/refactor/style/docs/chore): " TYPE

# Prompt for scope
echo ""
echo -e "${CYAN}Scopes del proyecto:${NC}"
echo "  p0     — Critical fixes (404s, security)"
echo "  i18n   — Internationalization"
echo "  ui     — Visual/UX (palette, layout, components)"
echo "  seo    — Metadata, structured data"
echo "  form   — Contact form, booking, validation"
echo "  auth   — Authentication, registration"
echo "  admin  — Admin panel"
echo "  api    — Backend integration"
echo "  infra  — Config, CI, tooling"
echo ""
read -p "Scope (p0/i18n/ui/seo/form/auth/admin/api/infra): " SCOPE

# Prompt for short description
echo ""
read -p "Descripción breve (imperativa, sin punto final): " DESC

if [ -z "$TYPE" ] || [ -z "$SCOPE" ] || [ -z "$DESC" ]; then
  echo -e "${RED}✗ Tipo, scope y descripción son obligatorios.${NC}"
  exit 1
fi

HEADER="${TYPE}(${SCOPE}): ${DESC}"

# Prompt for WHY (mandatory)
echo ""
echo -e "${CYAN}▸ ¿Por qué se hizo este cambio? (obligatorio)${NC}"
echo "  Explicá el problema o necesidad que motiva el cambio."
read -p "Why: " WHY

if [ -z "$WHY" ]; then
  echo -e "${RED}✗ El campo 'Why' es obligatorio. Un commit sin contexto no sirve.${NC}"
  exit 1
fi

# Prompt for CHANGES (mandatory)
echo ""
echo -e "${CYAN}▸ ¿Qué se cambió? (obligatorio, una por línea, enter vacío para terminar)${NC}"
CHANGES=()
while true; do
  read -p "  - " CHANGE
  if [ -z "$CHANGE" ]; then
    break
  fi
  CHANGES+=("- $CHANGE")
done

if [ ${#CHANGES[@]} -eq 0 ]; then
  echo -e "${RED}✗ Tenés que listar al menos un cambio.${NC}"
  exit 1
fi

# Prompt for ROUTE MAP (optional, for link/route changes)
echo ""
read -p "¿Hubo cambios de rutas/links? (s/N): " HAS_ROUTES
ROUTES=""
if [[ "$HAS_ROUTES" =~ ^[sS]$ ]]; then
  echo -e "${CYAN}  Ingresá rutas (formato: antes → después), enter vacío para terminar${NC}"
  ROUTE_LINES=()
  while true; do
    read -p "    " ROUTE_LINE
    if [ -z "$ROUTE_LINE" ]; then
      break
    fi
    ROUTE_LINES+=("  $ROUTE_LINE")
  done
  if [ ${#ROUTE_LINES[@]} -gt 0 ]; then
    ROUTES=$'\nRoute map:\n'"$(printf '%s\n' "${ROUTE_LINES[@]}")"
  fi
fi

# Prompt for verification note
echo ""
read -p "Verificación (ej: 'npm run build pasa, 15 rutas'): " VERIFY
VERIFY_LINE=""
if [ -n "$VERIFY" ]; then
  VERIFY_LINE=$'\nVerified: '"$VERIFY"
fi

# Build commit message
COMMIT_MSG="$HEADER

Why: $WHY

Changes:
$(printf '%s\n' "${CHANGES[@]}")$ROUTES$VERIFY_LINE"

# Show preview
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Preview del commit:${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo ""
echo "$COMMIT_MSG"
echo ""

# Final confirmation
read -p "¿Confirmar commit? (s/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[sS]$ ]]; then
  echo -e "${YELLOW}Commit cancelado.${NC}"
  exit 0
fi

# Execute commit
git commit -m "$COMMIT_MSG"

echo ""
echo -e "${GREEN}✓ Commit creado exitosamente.${NC}"
echo -e "${BLUE}  Para push: git push origin $BRANCH${NC}"
echo ""