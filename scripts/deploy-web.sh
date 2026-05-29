#!/usr/bin/env bash

set -Eeuo pipefail

if [[ -n "${NO_COLOR:-}" ]]; then
  C_RESET=""
  C_BOLD=""
  C_CYAN=""
  C_BLUE=""
  C_GREEN=""
  C_YELLOW=""
  C_RED=""
else
  C_RESET=$'\033[0m'
  C_BOLD=$'\033[1m'
  C_CYAN=$'\033[36m'
  C_BLUE=$'\033[34m'
  C_GREEN=$'\033[32m'
  C_YELLOW=$'\033[33m'
  C_RED=$'\033[31m'
fi

log_step() {
  printf "%b%s%b %s\n" "${C_BOLD}${C_CYAN}" "[step]" "${C_RESET}" "$*"
}

log_info() {
  printf "%b%s%b %s\n" "${C_BOLD}${C_BLUE}" "[info]" "${C_RESET}" "$*"
}

log_success() {
  printf "%b%s%b %s\n" "${C_BOLD}${C_GREEN}" "[ok]" "${C_RESET}" "$*"
}

log_warn() {
  printf "%b%s%b %s\n" "${C_BOLD}${C_YELLOW}" "[warn]" "${C_RESET}" "$*"
}

log_error() {
  printf "%b%s%b %s\n" "${C_BOLD}${C_RED}" "[error]" "${C_RESET}" "$*" >&2
}

trap 'log_error "Deployment failed on line ${LINENO}."' ERR

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
PREFLIGHT_TYPECHECK="${PREFLIGHT_TYPECHECK:-true}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-https://golf.whackablemole.com}"

if [[ -z "${SSH_HOST}" || -z "${SSH_USER}" ]]; then
  log_error "SSH_HOST and SSH_USER must be set."
  exit 1
fi

TARGET="${SSH_USER}@${SSH_HOST}"

log_step "Preparing deployment context"
log_info "Deploy target: ${TARGET}"
log_info "Remote app dir: ${REMOTE_APP_DIR}"
log_info "PM2 app: ${PM2_APP}"
log_info "Branch: ${GIT_BRANCH}"
log_info "Preflight typecheck: ${PREFLIGHT_TYPECHECK}"
log_info "Health check URL: ${HEALTHCHECK_URL}"

REMOTE_SCRIPT='set -Eeuo pipefail

if [[ -n "${NO_COLOR:-}" ]]; then
  C_RESET=""
  C_BOLD=""
  C_CYAN=""
  C_BLUE=""
  C_GREEN=""
  C_YELLOW=""
  C_RED=""
else
  C_RESET=$'"'"'\033[0m'"'"'
  C_BOLD=$'"'"'\033[1m'"'"'
  C_CYAN=$'"'"'\033[36m'"'"'
  C_BLUE=$'"'"'\033[34m'"'"'
  C_GREEN=$'"'"'\033[32m'"'"'
  C_YELLOW=$'"'"'\033[33m'"'"'
  C_RED=$'"'"'\033[31m'"'"'
fi

r_step() {
  printf "%b%s%b %s\n" "${C_BOLD}${C_CYAN}" "[remote][step]" "${C_RESET}" "$*"
}

r_info() {
  printf "%b%s%b %s\n" "${C_BOLD}${C_BLUE}" "[remote][info]" "${C_RESET}" "$*"
}

r_ok() {
  printf "%b%s%b %s\n" "${C_BOLD}${C_GREEN}" "[remote][ok]" "${C_RESET}" "$*"
}

r_warn() {
  printf "%b%s%b %s\n" "${C_BOLD}${C_YELLOW}" "[remote][warn]" "${C_RESET}" "$*"
}

r_error() {
  printf "%b%s%b %s\n" "${C_BOLD}${C_RED}" "[remote][error]" "${C_RESET}" "$*" >&2
}

trap "r_error \"Deploy failed on line ${LINENO}.\"" ERR

r_info "Host: $(hostname)"
r_info "User: $(whoami)"
r_step "Starting deploy at $(date)"

cd "${REMOTE_APP_DIR}"

if [[ -n "${REMOTE_NODE_BIN}" && -x "${REMOTE_NODE_BIN}" ]]; then
  export PATH="$(dirname "${REMOTE_NODE_BIN}"):${PATH}"
  NODE_INTERPRETER_FLAG=(--interpreter "${REMOTE_NODE_BIN}")
  r_info "Using Node binary: ${REMOTE_NODE_BIN}"
else
  NODE_INTERPRETER_FLAG=()
  r_warn "REMOTE_NODE_BIN not found/executable; using default node from PATH"
fi

r_info "Node: $(node -v)"

r_step "Pulling latest ${GIT_BRANCH}"
git fetch origin "${GIT_BRANCH}"
git checkout "${GIT_BRANCH}"
git pull --ff-only origin "${GIT_BRANCH}"

r_step "Installing dependencies"
npm ci

if [[ "${PREFLIGHT_TYPECHECK}" == "true" ]]; then
  r_step "Preflight typecheck (no downtime)"
  npx tsc --noEmit
  r_ok "Preflight typecheck passed"
fi

r_step "Building app (no downtime)"
npm run build

if [[ "${STOP_ALL_PM2}" == "true" ]]; then
  r_step "Stopping all PM2 processes"
  pm2 stop all || true
else
  r_step "Stopping PM2 app ${PM2_APP}"
  pm2 stop "${PM2_APP}" || true
fi

r_step "Starting PM2 app ${PM2_APP}"
pm2 start "${PM2_APP}" --update-env "${NODE_INTERPRETER_FLAG[@]}" \
  || pm2 restart "${PM2_APP}" --update-env "${NODE_INTERPRETER_FLAG[@]}"

pm2 save || true
pm2 describe "${PM2_APP}" | sed -n "1,80p"

if [[ -n "${HEALTHCHECK_URL}" ]]; then
  r_step "Health check: ${HEALTHCHECK_URL}"
  curl -fsS --max-time 20 "${HEALTHCHECK_URL}" >/dev/null
  r_ok "Health check passed"
fi

r_ok "Deploy finished at $(date)"'

run_via_ssh() {
  ssh -p "${SSH_PORT}" \
    -o StrictHostKeyChecking="${SSH_STRICT_HOST_KEY_CHECKING:-no}" \
    "${TARGET}" \
    "REMOTE_APP_DIR=$(printf '%q' "${REMOTE_APP_DIR}") PM2_APP=$(printf '%q' "${PM2_APP}") GIT_BRANCH=$(printf '%q' "${GIT_BRANCH}") REMOTE_NODE_BIN=$(printf '%q' "${REMOTE_NODE_BIN}") STOP_ALL_PM2=$(printf '%q' "${STOP_ALL_PM2}") PREFLIGHT_TYPECHECK=$(printf '%q' "${PREFLIGHT_TYPECHECK}") HEALTHCHECK_URL=$(printf '%q' "${HEALTHCHECK_URL}") bash -lc $(printf '%q' "${REMOTE_SCRIPT}")"
}

run_via_plink() {
  local plink_bin
  plink_bin="$(command -v plink || command -v plink.exe || true)"
  if [[ -z "${plink_bin}" ]]; then
    log_error "plink is not installed and SSH_PASSWORD is set. Install PuTTY/plink or use SSH key auth."
    exit 1
  fi

  printf 'y\n' | "${plink_bin}" -ssh -P "${SSH_PORT}" -pw "${SSH_PASSWORD}" "${TARGET}" \
    "REMOTE_APP_DIR=$(printf '%q' "${REMOTE_APP_DIR}") PM2_APP=$(printf '%q' "${PM2_APP}") GIT_BRANCH=$(printf '%q' "${GIT_BRANCH}") REMOTE_NODE_BIN=$(printf '%q' "${REMOTE_NODE_BIN}") STOP_ALL_PM2=$(printf '%q' "${STOP_ALL_PM2}") PREFLIGHT_TYPECHECK=$(printf '%q' "${PREFLIGHT_TYPECHECK}") HEALTHCHECK_URL=$(printf '%q' "${HEALTHCHECK_URL}") bash -lc $(printf '%q' "${REMOTE_SCRIPT}")"
}

if [[ -n "${SSH_PASSWORD}" ]]; then
  log_step "Connecting via plink"
  run_via_plink
else
  log_step "Connecting via ssh"
  run_via_ssh
fi

log_success "Deployment completed successfully."
