# ============================================================
#  淨淨 CleanClean 團購儀表板 — 新電腦一鍵安裝腳本
#  用法：在 PowerShell 執行  .\SETUP.ps1
# ============================================================

Set-StrictMode -Off
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  淨淨 CleanClean 儀表板  一鍵安裝" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. 檢查 Node.js ─────────────────────────────────────────
Write-Host "[1/6] 檢查 Node.js..." -ForegroundColor Yellow
$nodeOk = $false
try {
    $v = node --version 2>$null
    if ($v -match "v(\d+)" -and [int]$Matches[1] -ge 18) {
        Write-Host "    Node.js $v  OK" -ForegroundColor Green
        $nodeOk = $true
    }
} catch {}

if (-not $nodeOk) {
    Write-Host "    找不到 Node.js >= 18，嘗試用 winget 安裝..." -ForegroundColor Yellow
    winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-Host "    安裝完成，請重新開啟終端機後再執行一次此腳本" -ForegroundColor Red
    exit 1
}

# ── 2. 決定安裝位置 ──────────────────────────────────────────
Write-Host "[2/6] 設定安裝路徑..." -ForegroundColor Yellow
$defaultPath = "D:\claude_司\cleanclean-dashboard"
$installDir = Read-Host "    安裝到哪個目錄？（直接按 Enter 使用預設：$defaultPath）"
if ([string]::IsNullOrWhiteSpace($installDir)) { $installDir = $defaultPath }

$parentDir = Split-Path $installDir -Parent
if (-not (Test-Path $parentDir)) {
    New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
}

# ── 3. Clone repo ────────────────────────────────────────────
Write-Host "[3/6] Clone GitHub repo..." -ForegroundColor Yellow

$ghToken = Read-Host "    輸入 GitHub Personal Access Token（有 repo 權限）"
$repoUrl = "https://${ghToken}@github.com/carayang1011-dot/cleanclean-dashboard.git"

if (Test-Path $installDir) {
    Write-Host "    目錄已存在，跳過 clone，直接更新..." -ForegroundColor DarkYellow
    Set-Location $installDir
    git remote set-url origin $repoUrl 2>$null
    git pull origin master
} else {
    git clone $repoUrl $installDir
    Set-Location $installDir
}

# 設定 git 作者（Vercel 部署需要 email 對應到 GitHub 帳號）
git config user.name "carayang1011-dot"
git config user.email "carayang1011@gmail.com"

# 加上 Vercel fork remote（用於 git push vercel master:main 觸發部署）
$vercelUrl = "https://${ghToken}@github.com/carayang1011-dot/cleanclean-dashboard_.git"
git remote remove vercel 2>$null
git remote add vercel $vercelUrl
Write-Host "    remotes 設定完成（origin + vercel）" -ForegroundColor Green

# ── 4. 建立 .env.local ───────────────────────────────────────
Write-Host "[4/6] 建立 .env.local..." -ForegroundColor Yellow

$envPath = Join-Path $installDir ".env.local"
if (-not (Test-Path $envPath)) {
    $envContent = @"
# 填入真實的 Supabase 憑證才會連線；留 placeholder 則使用本地 JSON 資料
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
"@
    Set-Content -Path $envPath -Value $envContent -Encoding utf8
    Write-Host "    已建立 .env.local（使用 placeholder，即本地資料模式）" -ForegroundColor Green
} else {
    Write-Host "    .env.local 已存在，跳過" -ForegroundColor DarkYellow
}

# ── 5. npm install ───────────────────────────────────────────
Write-Host "[5/6] 安裝 npm 套件..." -ForegroundColor Yellow
Set-Location $installDir
npm install
Write-Host "    套件安裝完成" -ForegroundColor Green

# ── 6. 啟動 dev server ───────────────────────────────────────
Write-Host "[6/6] 完成！" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  安裝完成！專案路徑：$installDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "  常用指令：" -ForegroundColor White
Write-Host "    npm run dev              啟動開發伺服器（localhost:3000）" -ForegroundColor White
Write-Host "    npm run build            本地 production build 測試" -ForegroundColor White
Write-Host "    git push vercel master:main   推送到 Vercel 觸發部署" -ForegroundColor White
Write-Host ""
Write-Host "  線上網址：https://cleanclean-dashboard.vercel.app" -ForegroundColor Cyan
Write-Host "  GitHub：  https://github.com/carayang1011-dot/cleanclean-dashboard" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$launch = Read-Host "    現在啟動 dev server？(y/n)"
if ($launch -eq "y" -or $launch -eq "Y") {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$installDir'; npm run dev"
    Start-Sleep 3
    Start-Process "http://localhost:3000"
}
