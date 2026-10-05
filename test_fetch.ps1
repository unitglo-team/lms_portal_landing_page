$r = Invoke-WebRequest -Uri "http://127.0.0.1:8088/index.html" -UseBasicParsing -TimeoutSec 3
Write-Host "HTTP_STATUS: $($r.StatusCode)"
Write-Host "BYTES_RECEIVED: $($r.RawContentLength)"
