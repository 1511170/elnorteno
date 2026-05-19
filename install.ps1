#!/usr/bin/env pwsh
# KINTO CMS - instalador de una linea para Windows / PowerShell.
#
# Uso:
#   irm get.kinto.co | iex
#
# Verifica Node >= 18 y lanza el wizard `kinto start` via npx.

$ErrorActionPreference = 'Stop'
Write-Host ''
Write-Host 'KINTO CMS - instalador' -ForegroundColor Cyan
Write-Host ''

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host 'X  Node.js no encontrado. Instalalo desde https://nodejs.org (>= 18).' -ForegroundColor Red
    exit 1
}

$nodeMajor = [int]((node -v) -replace 'v(\d+)\..*', '$1')
if ($nodeMajor -lt 18) {
    Write-Host "X  Se requiere Node >= 18 (tienes $(node -v))." -ForegroundColor Red
    exit 1
}

Write-Host "OK Node $(node -v)" -ForegroundColor Green
Write-Host '-> Lanzando el wizard de KINTO...' -ForegroundColor Cyan
Write-Host ''
npx --yes kinto-cms@latest start
