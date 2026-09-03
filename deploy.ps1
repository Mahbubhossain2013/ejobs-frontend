param()

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$frontendDir = Join-Path $repoRoot 'frontend'
$buildDir = Join-Path $frontendDir '.next'
$standaloneDir = Join-Path $buildDir 'standalone'
$innerDir = Join-Path $standaloneDir 'frontend'
$staticDir = Join-Path $buildDir 'static'
$publicDir = Join-Path $frontendDir 'public'
$zipPath = Join-Path $repoRoot 'frontend-deploy.zip'

if (-not (Test-Path $innerDir)) {
    throw "Standalone build not found at $innerDir. Run 'npm run build' first."
}

$workingDir = Join-Path $env:TEMP ('frontend-deploy-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $workingDir | Out-Null

Write-Host "Packaging standalone app from: $innerDir"
Copy-Item -Path (Join-Path $innerDir '*') -Destination $workingDir -Recurse -Force

$destStatic = Join-Path $workingDir '.next' 'static'
if (Test-Path $staticDir) {
    Write-Host "Copying static assets"
    if (-not (Test-Path $destStatic)) { New-Item -ItemType Directory -Path $destStatic | Out-Null }
    Copy-Item -Path (Join-Path $staticDir '*') -Destination $destStatic -Recurse -Force
}

if (Test-Path $publicDir) {
    Write-Host "Copying public files"
    Copy-Item -Path $publicDir -Destination (Join-Path $workingDir 'public') -Recurse -Force
}

Write-Host "Creating zip: $zipPath"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path (Join-Path $workingDir '*') -DestinationPath $zipPath -Force

Remove-Item $workingDir -Recurse -Force
Write-Host "Done: $zipPath"
Write-Host "Zip size: $([math]::Round((Get-Item $zipPath).Length / 1MB, 2)) MB"
