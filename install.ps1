#!/usr/bin/env pwsh
# KINTO CMS - instalador de una linea para Windows / PowerShell.
#
# Uso:
#   irm get.kinto.co | iex
#
# Clona el repo kinto-cms en la carpeta actual y lanza el wizard `kinto start`
# dentro del repo. El sitio queda en kinto-cms/sites/<nombre>/.

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

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host 'X  git no encontrado. Instalalo desde https://git-scm.com' -ForegroundColor Red
    exit 1
}

$repoUrl = 'https://github.com/1511170/kinto-cms.git'
$target = Join-Path (Get-Location) 'kinto-cms'

if (Test-Path $target) {
    Write-Host "-> 'kinto-cms' ya existe; actualizando con git pull..." -ForegroundColor Cyan
    git -C $target pull --ff-only
} else {
    Write-Host "-> Clonando KINTO CMS en $target ..." -ForegroundColor Cyan
    git clone $repoUrl $target
}

Set-Location $target
Write-Host '-> Lanzando el wizard de KINTO...' -ForegroundColor Cyan
Write-Host ''
node bin/kinto.js start
