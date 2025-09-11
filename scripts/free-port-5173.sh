#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-5173}"
echo "Scanning for listeners on port ${PORT}..."

# Try lsof
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -ti :"${PORT}" || true)
  if [ -n "${PIDS}" ]; then
    echo "Killing PIDs: ${PIDS}"
    kill -9 ${PIDS} || true
    echo "Done."
    exit 0
  fi
fi

# Try fuser
if command -v fuser >/dev/null 2>&1; then
  if fuser -s "${PORT}/tcp"; then
    echo "Killing processes using ${PORT}/tcp"
    fuser -k "${PORT}/tcp" || true
    echo "Done."
    exit 0
  fi
fi

# Fallback to netstat (Linux/macOS)
if command -v netstat >/dev/null 2>&1; then
  if [[ "$(uname -s)" == "Darwin" ]]; then
    PIDS=$(netstat -anv | awk -v p=":""${PORT}"" '$4 ~ p && $6 == "LISTEN" {print $9}' | sort -u)
  else
    PIDS=$(netstat -tulpn 2>/dev/null | awk -v p=":""${PORT}"" '$4 ~ p {print $7}' | cut -d/ -f1 | sort -u)
  fi
  if [ -n "${PIDS}" ]; then
    echo "Killing PIDs: ${PIDS}"
    kill -9 ${PIDS} || true
    echo "Done."
    exit 0
  fi
fi

echo "No process is listening on port ${PORT}."
