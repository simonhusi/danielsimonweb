param(
  [string]$ImageDir = "assets/images/imagicore/bts",
  [string]$OutputJson = "assets/data/bts-gallery.json"
)

$extensions = @("*.jpg", "*.jpeg", "*.png", "*.webp", "*.avif")

if (-not (Test-Path $ImageDir)) {
  New-Item -ItemType Directory -Force -Path $ImageDir | Out-Null
}

$outputFolder = Split-Path -Parent $OutputJson
if ($outputFolder -and -not (Test-Path $outputFolder)) {
  New-Item -ItemType Directory -Force -Path $outputFolder | Out-Null
}

$files = foreach ($ext in $extensions) {
  Get-ChildItem -Path $ImageDir -Filter $ext -File -ErrorAction SilentlyContinue
}

$items = @(
  $files |
    Sort-Object LastWriteTime -Descending |
    ForEach-Object {
      $relativePath = $_.FullName.Replace((Get-Location).Path + "\\", "").Replace("\\", "/")
      $altText = [System.IO.Path]::GetFileNameWithoutExtension($_.Name) -replace "[_-]+", " "

      [PSCustomObject]@{
        src = $relativePath
        alt = "BTS - $altText"
      }
    }
)

$json = $items | ConvertTo-Json -Depth 3 -Compress
if ([string]::IsNullOrWhiteSpace($json)) {
  $json = "[]"
}

$json | Set-Content -Path $OutputJson -Encoding UTF8
Write-Output "BTS gallery JSON generated: $OutputJson"
Write-Output "Images found: $($items.Count)"
