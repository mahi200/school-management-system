<#
.SYNOPSIS
  School Management System — Deployment Script for Windows
.DESCRIPTION
  One-command deploy for Windows (PowerShell 5.1+ or PowerShell 7+).
  Checks Docker, creates .env with auto-generated secrets, builds images,
  starts services, and prints access URLs.
.EXAMPLE
  .\deploy.ps1
#>

#Requires -Version 5.1

$ErrorActionPreference = 'Stop'
$Host.UI.RawUI.WindowTitle = 'School Management System — Deploy'

# ── Helper functions ─────────────────────────────────────
function Write-Info   { Write-Host "[INFO]  $_" -ForegroundColor Cyan }
function Write-Ok     { Write-Host "[OK]    $_" -ForegroundColor Green }
function Write-Warn   { Write-Host "[WARN]  $_" -ForegroundColor Yellow }
function Write-Err    { Write-Host "[ERROR] $_" -ForegroundColor Red }
function Write-Header { Write-Host; Write-Host "── $_ ──" -ForegroundColor White -BackgroundColor DarkBlue }

# ── 1. Prerequisites ─────────────────────────────────────
Write-Header "Checking prerequisites"

# Check Docker
$dockerVersion = docker --version 2>$null
if (-not $dockerVersion) {
  Write-Err "Docker is not installed."
  Write-Err "Install Docker Desktop from: https://docs.docker.com/desktop/setup/install/windows-install/"
  exit 1
}
Write-Ok "Docker found: $dockerVersion"

# Check Docker Compose
$composeVersion = docker compose version 2>$null
if (-not $composeVersion) {
  Write-Err "Docker Compose is not available."
  Write-Err "Ensure Docker Desktop is up-to-date (Compose v2 is included)."
  exit 1
}
Write-Ok "Docker Compose found: $composeVersion"

# ── 2. Environment file ──────────────────────────────────
Write-Header "Setting up environment"

Set-Location $PSScriptRoot

if (-not (Test-Path '.env')) {
  Write-Warn ".env file not found — creating from .env.example"

  if (-not (Test-Path '.env.example')) {
    Write-Err ".env.example not found! Is this the project root?"
    exit 1
  }

  Copy-Item '.env.example' '.env'

  # Auto-generate secure secrets
  $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 44 | ForEach-Object { [char]$_ })
  $dbPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 24 | ForEach-Object { [char]$_ })

  # Replace placeholders in .env
  (Get-Content '.env') -replace 'change-this-to-a-random-256-bit-secret', $jwtSecret `
                       -replace 'change-me-to-a-strong-password', $dbPassword |
    Set-Content '.env' -Encoding ASCII

  Write-Ok ".env created with auto-generated secrets"
  Write-Warn "────────────────────────────────────────────────────"
  Write-Warn "  IMPORTANT: Review .env before continuing!"
  Write-Warn "  Edit it now if you need custom values:"
  Write-Warn "    notepad .env"
  Write-Warn "────────────────────────────────────────────────────"
  Write-Host
  $null = Read-Host "Press Enter to continue (or Ctrl+C to abort)"
}
else {
  Write-Ok ".env file found"
}

# ── 3. Build images ──────────────────────────────────────
Write-Header "Building Docker images"
Write-Host "This may take a few minutes on first run..."

docker compose build
if ($LASTEXITCODE -ne 0) {
  Write-Err "Build failed. Check the output above."
  exit 1
}
Write-Ok "Images built"

# ── 4. Start services ────────────────────────────────────
Write-Header "Starting services"

docker compose up -d
if ($LASTEXITCODE -ne 0) {
  Write-Err "Failed to start services. Check the output above."
  exit 1
}
Write-Ok "All services started"

# ── 5. Wait for healthy services ─────────────────────────
Write-Header "Waiting for services to become healthy"

Write-Host "Checking PostgreSQL..."
$pgReady = $false
for ($i = 1; $i -le 30; $i++) {
  $result = docker compose exec -T postgres pg_isready -U school -d school 2>$null
  if ($LASTEXITCODE -eq 0) {
    Write-Ok "PostgreSQL is ready"
    $pgReady = $true
    break
  }
  if ($i -eq 30) {
    Write-Warn "PostgreSQL did not report ready — check logs: docker compose logs postgres"
  }
  Start-Sleep -Seconds 2
}

Write-Host "Checking auth-service..."
for ($i = 1; $i -le 60; $i++) {
  try {
    $response = Invoke-WebRequest -Uri 'http://localhost:8081/actuator/health' -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
      Write-Ok "Auth service is healthy"
      break
    }
  }
  catch {
    # Not ready yet
  }
  if ($i -eq 60) {
    Write-Warn "Auth service did not become healthy — check logs: docker compose logs auth-service"
  }
  Start-Sleep -Seconds 2
}

# ── 6. Summary ────────────────────────────────────────────
Write-Header "Deployment Complete"

Write-Host
Write-Host "  App:" -NoNewline -ForegroundColor White
Write-Host "          http://localhost" -ForegroundColor Green
Write-Host "  Auth API:" -NoNewline -ForegroundColor White
Write-Host "     http://localhost/api/v1/auth/health" -ForegroundColor Green
Write-Host "  Swagger UI:" -NoNewline -ForegroundColor White
Write-Host "   http://localhost/swagger-ui/index.html" -ForegroundColor Green
Write-Host "  MinIO Console:" -NoNewline -ForegroundColor White
Write-Host " http://localhost:9001" -ForegroundColor Green
Write-Host
Write-Host "  Default login:" -ForegroundColor White
Write-Host "    Email:    admin@demo.school" -ForegroundColor Cyan
Write-Host "    Password: Admin@12345" -ForegroundColor Cyan
Write-Host "    School:   DEMO" -ForegroundColor Cyan
Write-Host
Write-Host "  Useful commands:" -ForegroundColor White
Write-Host "    docker compose logs -f   — tail all logs" -ForegroundColor Cyan
Write-Host "    docker compose ps        — show service status" -ForegroundColor Cyan
Write-Host "    docker compose down      — stop all services" -ForegroundColor Cyan
Write-Host

Write-Ok "Happy schooling! 🎓"
