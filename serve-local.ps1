param(
  [int]$Port = 8080
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = [System.Net.HttpListener]::new()
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()

Write-Host "Serving $root at $prefix"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$groqApiKey = $env:GROQ_API_KEY
$groqModel = 'llama-3.3-70b-versatile'

$contentTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "application/javascript; charset=utf-8"
  ".svg" = "image/svg+xml"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".webp" = "image/webp"
  ".json" = "application/json; charset=utf-8"
  ".txt" = "text/plain; charset=utf-8"
}

function Write-JsonResponse {
  param(
    [Parameter(Mandatory = $true)]
    [System.Net.HttpListenerResponse]$Response,
    [Parameter(Mandatory = $true)]
    [object]$Body,
    [int]$StatusCode = 200
  )

  $json = $Body | ConvertTo-Json -Depth 8
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  $Response.StatusCode = $StatusCode
  $Response.ContentType = "application/json; charset=utf-8"
  $Response.ContentLength64 = $bytes.Length
  $Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $Response.OutputStream.Close()
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    try {
      $requestPath = $context.Request.Url.AbsolutePath.TrimStart("/")
      $method = $context.Request.HttpMethod

      if ([string]::IsNullOrWhiteSpace($requestPath)) {
        $requestPath = "index.html"
      }

      if ($requestPath -eq "api/pyroxai" -and $method -eq "POST") {
        try {
          $reader = New-Object System.IO.StreamReader($context.Request.InputStream, $context.Request.ContentEncoding)
          $rawBody = $reader.ReadToEnd()
          $reader.Close()

          $payload = $rawBody | ConvertFrom-Json
          $message = [string]$payload.message

        if ([string]::IsNullOrWhiteSpace($message)) {
          Write-JsonResponse -Response $context.Response -Body @{ error = "Message is required." } -StatusCode 400
          continue
        }
        if ([string]::IsNullOrWhiteSpace($groqApiKey)) {
          Write-JsonResponse -Response $context.Response -Body @{ error = "Server missing GROQ_API_KEY environment variable." } -StatusCode 500
          continue
        }

        $groqBody = @{
          model = $groqModel
          messages = @(
            @{
              role = "system"
              content = "You are PyroXai, a concise assistant focused on pyrolysis, thermochemical conversion, and energy materials."
            },
            @{
              role = "user"
              content = $message
            }
          )
          temperature = 0.5
          max_tokens = 420
        }

          $groqResponse = Invoke-RestMethod `
            -Method Post `
            -Uri "https://api.groq.com/openai/v1/chat/completions" `
            -Headers @{ Authorization = "Bearer $groqApiKey" } `
            -ContentType "application/json" `
            -Body ($groqBody | ConvertTo-Json -Depth 8)
          $reply = [string]$groqResponse.choices[0].message.content
          if ([string]::IsNullOrWhiteSpace($reply)) {
            $reply = "No response received."
          }

          Write-JsonResponse -Response $context.Response -Body @{ reply = $reply } -StatusCode 200
        }
        catch {
          $detail = $_.ErrorDetails.Message
          if ([string]::IsNullOrWhiteSpace($detail)) {
            $detail = $_.Exception.Message
          }
          Write-JsonResponse -Response $context.Response -Body @{ error = $detail } -StatusCode 502
        }

        continue
      }

      $safePath = $requestPath.Replace("/", "\")
      $fullPath = Join-Path $root $safePath

      if ((Test-Path $fullPath) -and -not (Get-Item $fullPath).PSIsContainer) {
        $extension = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
        $contentType = $contentTypes[$extension]

        if (-not $contentType) {
          $contentType = "application/octet-stream"
        }

        $bytes = [System.IO.File]::ReadAllBytes($fullPath)
        $context.Response.StatusCode = 200
        $context.Response.ContentType = $contentType
        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      }
      else {
        $fallback = Join-Path $root "index.html"
        $bytes = [System.IO.File]::ReadAllBytes($fallback)
        $context.Response.StatusCode = 200
        $context.Response.ContentType = "text/html; charset=utf-8"
        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      }

      $context.Response.OutputStream.Close()
    }
    catch {
      try {
        Write-JsonResponse -Response $context.Response -Body @{ error = "Server exception: $($_.Exception.Message)" } -StatusCode 500
      }
      catch {
      }
    }
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}
