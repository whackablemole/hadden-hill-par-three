#!/usr/bin/env bash

set -euo pipefail

# Local script settings (override via environment variables when needed)
SSH_HOST="${SSH_HOST:-192.168.1.160}"
SSH_USER="${SSH_USER:-whackablemole}"
SSH_PORT="${SSH_PORT:-22}"
SSH_PASSWORD="${SSH_PASSWORD:-}"

REMOTE_APP_DIR="${REMOTE_APP_DIR:-/home/whackablemole/apps/hadden-hill-par-three}"
PM2_APP="${PM2_APP:-6}"
GIT_BRANCH="${GIT_BRANCH:-main}"
REMOTE_NODE_BIN="${REMOTE_NODE_BIN:-/home/whackablemole/.nvm/versions/node/v20.20.2/bin/node}"
STOP_ALL_PM2="${STOP_ALL_PM2:-false}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-https://golf.whackablemole.com}"

if [[ -z "${SSH_HOST}" || -z "${SSH_USER}" ]]; then
  echo "SSH_HOST and SSH_USER must be set."
  exit 1
fi

TARGET="${SSH_USER}@${SSH_HOST}"

echo "Deploy target: ${TARGET}"
echo "Remote app dir: ${REMOTE_APP_DIR}"
echo "PM2 app: ${PM2_APP}"
echo "Branch: ${GIT_BRANCH}"

REMOTE_SCRIPT='set -euo pipefail
echo "[remote] Host: $(hostname)"
echo "[remote] User: $(whoami)"
echo "[remote] Starting deploy at $(date)"

cd "${REMOTE_APP_DIR}"

if [[ -n "${REMOTE_NODE_BIN}" && -x "${REMOTE_NODE_BIN}" ]]; then
  export PATH="$(dirname "${REMOTE_NODE_BIN}"):${PATH}"
  NODE_INTERPRETER_FLAG=(--interpreter "${REMOTE_NODE_BIN}")
else
  NODE_INTERPRETER_FLAG=()
fi

echo "[remote] Node: $(node -v)"

if [[ "${STOP_ALL_PM2}" == "true" ]]; then
  echo "[remote] Stopping all PM2 processes"
  pm2 stop all || true
else
  echo "[remote] Stopping PM2 app ${PM2_APP}"
  pm2 stop "${PM2_APP}" || true
fi

echo "[remote] Pulling latest ${GIT_BRANCH}"
git fetch origin "${GIT_BRANCH}"
git checkout "${GIT_BRANCH}"
git pull --ff-only origin "${GIT_BRANCH}"

echo "[remote] Installing dependencies"
npm ci

echo "[remote] Building app"
npm run build

echo "[remote] Starting PM2 app ${PM2_APP}"
pm2 start "${PM2_APP}" --update-env "${NODE_INTERPRETER_FLAG[@]}" \
  || pm2 restart "${PM2_APP}" --update-env "${NODE_INTERPRETER_FLAG[@]}"

pm2 save || true
pm2 describe "${PM2_APP}" | sed -n "1,80p"

if [[ -n "${HEALTHCHECK_URL}" ]]; then
  echo "[remote] Health check: ${HEALTHCHECK_URL}"
  curl -fsS --max-time 20 "${HEALTHCHECK_URL}" >/dev/null
  echo "[remote] Health check passed"
fi

echo "[remote] Deploy finished at $(date)"'

run_via_ssh() {
  ssh -p "${SSH_PORT}" \
    -o StrictHostKeyChecking="${SSH_STRICT_HOST_KEY_CHECKING:-no}" \
    "${TARGET}" \
    "REMOTE_APP_DIR=$(printf '%q' "${REMOTE_APP_DIR}") PM2_APP=$(printf '%q' "${PM2_APP}") GIT_BRANCH=$(printf '%q' "${GIT_BRANCH}") REMOTE_NODE_BIN=$(printf '%q' "${REMOTE_NODE_BIN}") STOP_ALL_PM2=$(printf '%q' "${STOP_ALL_PM2}") HEALTHCHECK_URL=$(printf '%q' "${HEALTHCHECK_URL}") bash -lc $(printf '%q' "${REMOTE_SCRIPT}")"
}

run_via_plink() {
  local plink_bin
  plink_bin="$(command -v plink || command -v plink.exe || true)"
  if [[ -z "${plink_bin}" ]]; then
    echo "plink is not installed and SSH_PASSWORD is set. Install PuTTY/plink or use SSH key auth."
    exit 1
  fi

  printf 'y\n' | "${plink_bin}" -ssh -P "${SSH_PORT}" -pw "${SSH_PASSWORD}" "${TARGET}" \
    "REMOTE_APP_DIR=$(printf '%q' "${REMOTE_APP_DIR}") PM2_APP=$(printf '%q' "${PM2_APP}") GIT_BRANCH=$(printf '%q' "${GIT_BRANCH}") REMOTE_NODE_BIN=$(printf '%q' "${REMOTE_NODE_BIN}") STOP_ALL_PM2=$(printf '%q' "${STOP_ALL_PM2}") HEALTHCHECK_URL=$(printf '%q' "${HEALTHCHECK_URL}") bash -lc $(printf '%q' "${REMOTE_SCRIPT}")"
}

if [[ -n "${SSH_PASSWORD}" ]]; then
  run_via_plink
else
  run_via_ssh
fi
