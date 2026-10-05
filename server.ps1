$port = 8088
$listener = New-Object System.Net.Sockets.TcpListener ([System.Net.IPAddress]::Loopback, $port)
$listener.Start()
Write-Host "PORTAL_SERVER_STARTED: http://localhost:$port/"
$baseDir = $PSScriptRoot

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $buffer = New-Object byte[] 4096
        $readCount = $stream.Read($buffer, 0, $buffer.Length)
        if ($readCount -gt 0) {
            $reqText = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $readCount)
            $firstLine = $reqText.Split([char]10)[0].Trim()
            $tokens = $firstLine.Split(' ')
            $rawPath = if ($tokens.Length -gt 1) { $tokens[1] } else { "/" }
            $cleanPath = $rawPath.Split('?')[0].TrimStart('/')
            if ($cleanPath -eq "" -or $cleanPath -eq "/") { $cleanPath = "index.html" }
            $localPath = Join-Path $baseDir $cleanPath
            
            if (Test-Path $localPath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($localPath)
                $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
                $mime = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    ".svg"  { "image/svg+xml" }
                    ".png"  { "image/png" }
                    default { "application/octet-stream" }
                }
                $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: " + $bytes.Length + "`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                $hBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
                $stream.Write($hBytes, 0, $hBytes.Length)
                $stream.Write($bytes, 0, $bytes.Length)
            } else {
                $err = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: 9`r`nConnection: close`r`n`r`nNot Found"
                $errBytes = [System.Text.Encoding]::ASCII.GetBytes($err)
                $stream.Write($errBytes, 0, $errBytes.Length)
            }
            $stream.Flush()
        }
        $client.Close()
    } catch {
        # continue loop
    }
}
