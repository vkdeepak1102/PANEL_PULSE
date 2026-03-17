#!/usr/bin/env bash
# =============================================================
# deploy.sh — Redeploy Panel Pulse AI (run on the VM)
# Usage:  bash /opt/panel-pulse/deployment/deploy.sh
# =============================================================
set -euo pipefail

APP_DIR="/opt/panel-pulse"

echo ""
echo "========================================"
echo "  Panel Pulse AI — Redeploy"
echo "========================================"

# ── Pull latest code ─────────────────────────────────────────
echo ""
echo "▶ [1/4] Pulling latest code from main..."
cd "$APP_DIR"
git pull origin main

# ── Backend: install deps ────────────────────────────────────
echo ""
echo "▶ [2/4] Installing backend dependencies..."
cd "$APP_DIR/backend"
npm install --omit=dev

# ── Frontend: build ──────────────────────────────────────────
echo ""
echo "▶ [3/4] Building frontend..."
cd "$APP_DIR/frontend"
# Ensure production env is set (safe to re-write on every deploy)
echo "VITE_API_BASE_URL=http://10.10.142.91"  > .env.production
echo "VITE_APP_NAME=Panel Pulse AI"          >> .env.production
echo "VITE_ENABLE_MOCK=false"                >> .env.production
npm install
npm run build

# ── Restart backend ──────────────────────────────────────────
echo ""
echo "▶ [4/4] Restarting backend via PM2..."
cd "$APP_DIR"
pm2 restart panel-pulse-backend --update-env
pm2 save

echo ""
echo "========================================"
echo "  ✅  Redeployment complete!"
echo ""
echo "  Frontend : http://10.10.142.91"
echo "  Health   : http://10.10.142.91/api/v1/health"
echo "========================================"
