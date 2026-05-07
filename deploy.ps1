# deploy.ps1 - 推送到 GitHub 并部署到 GitHub Pages
$ErrorActionPreference = "Stop"

# 设置 git 路径
$env:PATH = "D:\develop\javaimport\Git\cmd;" + $env:PATH

Write-Host "=== Step 1: 配置远程仓库 ===" -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin https://github.com/wxjb0/SmallAi.git

Write-Host "=== Step 2: 暂存并提交所有文件 ===" -ForegroundColor Cyan
git add -A
git status
$commitMsg = "feat: Nexus AI chat assistant"
try { git commit -m $commitMsg } catch { Write-Host "没有新更改需要提交" }

Write-Host "=== Step 3: 推送到 main 分支 ===" -ForegroundColor Cyan
git branch -M main
git push -u origin main --force

Write-Host "=== Step 4: 安装 gh-pages 工具 ===" -ForegroundColor Cyan
npm install --save-dev gh-pages

Write-Host "=== Step 5: 构建项目 ===" -ForegroundColor Cyan
npm run build

Write-Host "=== Step 6: 部署到 GitHub Pages ===" -ForegroundColor Cyan
npx gh-pages -d dist

Write-Host ""
Write-Host "=== 全部完成！===" -ForegroundColor Green
Write-Host "请去以下地址启用 GitHub Pages:"
Write-Host "https://github.com/wxjb0/SmallAi/settings/pages" -ForegroundColor Yellow
Write-Host "Source 选择 gh-pages 分支，目录选 / (root)，点 Save"
Write-Host ""
Write-Host "部署后访问: https://wxjb0.github.io/SmallAi/" -ForegroundColor Yellow
