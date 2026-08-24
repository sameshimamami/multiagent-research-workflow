# 唤醒专用 Chrome：带调试端口启动 + 打开三个网页模型标签页（幂等，可重复跑）
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$prof   = 'C:\Users\我\Documents\DEEPSEEK\web-llm-bridge\.chrome-profile'

# 1) 检查 CDP 是否已监听
$up = $false
try {
  Invoke-RestMethod -Uri 'http://127.0.0.1:9222/json/version' -TimeoutSec 2 | Out-Null
  $up = $true
} catch {
  $up = $false
}

if (-not $up) {
  Write-Output "启动专用 Chrome（调试端口 9222）…"
  Start-Process $chrome -ArgumentList '--remote-debugging-port=9222', "--user-data-dir=$prof", '--remote-allow-origins=*', '--no-first-run'
  Start-Sleep -Seconds 8
}

# 2) 确认 CDP
try {
  $v = (Invoke-RestMethod -Uri 'http://127.0.0.1:9222/json/version' -TimeoutSec 5).Browser
} catch {
  Write-Output "CDP 未就绪: $($_.Exception.Message)"
  exit 1
}
Write-Output "CDP 就绪: $v"

# 3) 打开三个模型标签页（若缺失）
try {
  $pages = Invoke-RestMethod -Uri 'http://127.0.0.1:9222/json' -TimeoutSec 5 | Where-Object { $_.type -eq 'page' }
} catch {
  $pages = @()
}
foreach ($u in @('https://chatgpt.com','https://claude.ai','https://gemini.google.com')) {
  $h = ([uri]$u).Host
  if (-not ($pages | Where-Object { $_.url -like "*$h*" })) {
    try {
      Invoke-RestMethod -Method Put -Uri ('http://127.0.0.1:9222/json/new?' + [uri]::EscapeDataString($u)) -TimeoutSec 8 | Out-Null
      Write-Output "已打开 $u"
    } catch {
      Write-Output "打开失败 $u"
    }
  } else {
    Write-Output "已有 $u"
  }
}
Write-Output "专用 Chrome 就绪，三个网页模型可用了。"
