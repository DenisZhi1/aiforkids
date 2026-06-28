param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
  [string]$BackupRoot = (Join-Path $env:TEMP ("KB2MagicSchoolCatcher-assets-" + (Get-Date -Format "yyyyMMdd-HHmmss")))
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function Save-Jpeg {
  param(
    [Parameter(Mandatory)] [string]$Source,
    [Parameter(Mandatory)] [string]$Destination,
    [long]$Quality = 88
  )

  $sourceImage = [System.Drawing.Image]::FromFile($Source)
  try {
    $bitmap = New-Object System.Drawing.Bitmap($sourceImage.Width, $sourceImage.Height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.DrawImage($sourceImage, 0, 0, $sourceImage.Width, $sourceImage.Height)
      } finally {
        $graphics.Dispose()
      }

      $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq "image/jpeg"
      $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
      try {
        $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $Quality)
        $bitmap.Save($Destination, $encoder, $parameters)
      } finally {
        $parameters.Dispose()
      }
    } finally {
      $bitmap.Dispose()
    }
  } finally {
    $sourceImage.Dispose()
  }
}

function Resize-Png {
  param(
    [Parameter(Mandatory)] [string]$Path,
    [Parameter(Mandatory)] [int]$MaxWidth,
    [Parameter(Mandatory)] [int]$MaxHeight
  )

  $sourceImage = [System.Drawing.Image]::FromFile($Path)
  try {
    $scale = [Math]::Min(1.0, [Math]::Min($MaxWidth / $sourceImage.Width, $MaxHeight / $sourceImage.Height))
    if ($scale -ge 1.0) { return }

    $width = [Math]::Max(1, [int][Math]::Round($sourceImage.Width * $scale))
    $height = [Math]::Max(1, [int][Math]::Round($sourceImage.Height * $scale))
    $bitmap = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $bitmap.SetResolution(96, 96)
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.DrawImage($sourceImage, 0, 0, $width, $height)
      } finally {
        $graphics.Dispose()
      }

      $temporaryPath = "$Path.optimized.png"
      $bitmap.Save($temporaryPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $bitmap.Dispose()
    }
  } finally {
    $sourceImage.Dispose()
  }

  Move-Item -LiteralPath $temporaryPath -Destination $Path -Force
}

$assets = Join-Path $ProjectRoot "assets"
if (-not (Test-Path -LiteralPath $assets)) {
  throw "Assets directory was not found: $assets"
}

Copy-Item -LiteralPath $assets -Destination $BackupRoot -Recurse

$backgrounds = @(
  "bg_game_classroom_v2",
  "bg_level_complete_v2",
  "bg_game_over_v2",
  "bg_win_screen_v2"
)

foreach ($name in $backgrounds) {
  $source = Join-Path $assets "backgrounds\$name.png"
  if (Test-Path -LiteralPath $source) {
    Save-Jpeg -Source $source -Destination (Join-Path $assets "backgrounds\$name.jpg")
    Remove-Item -LiteralPath $source
  }
}

$obsoleteBackgrounds = @(
  "backgrounds\bg_start_screen_v2.png",
  "backgrounds\bg_start_screen..png",
  "backgrounds\bg_level_complete.png",
  "backgrounds\bg_game_over.png",
  "backgrounds\bg_win_screen.png"
)
foreach ($relativePath in $obsoleteBackgrounds) {
  $path = Join-Path $assets $relativePath
  if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path }
}

Get-ChildItem (Join-Path $assets "items") -Filter *.png | ForEach-Object {
  Resize-Png -Path $_.FullName -MaxWidth 224 -MaxHeight 224
}
Get-ChildItem (Join-Path $assets "stars") -Filter *.png | ForEach-Object {
  Resize-Png -Path $_.FullName -MaxWidth 288 -MaxHeight 288
}
Get-ChildItem (Join-Path $assets "character") -Filter *.png | ForEach-Object {
  $maxSize = if ($_.Name -eq "mouseidle.png") { 768 } else { 512 }
  Resize-Png -Path $_.FullName -MaxWidth $maxSize -MaxHeight $maxSize
}
Get-ChildItem (Join-Path $assets "rewards") -Filter *.png | ForEach-Object {
  Resize-Png -Path $_.FullName -MaxWidth 320 -MaxHeight 320
}
Get-ChildItem (Join-Path $assets "levels") -Filter *.png | ForEach-Object {
  Resize-Png -Path $_.FullName -MaxWidth 400 -MaxHeight 267
}

$uiTargets = @{
  "blank target word panel.png" = @(400, 400)
  "blanklevelbadgepanel.png"    = @(400, 400)
  "blankscorepanel.png"         = @(400, 400)
  "bluerounded button.png"      = @(400, 400)
  "greenrounded button.png"     = @(400, 400)
  "orangerounded button.png"    = @(400, 400)
  "purplerounded button.png"    = @(400, 400)
  "emptyheart.png"              = @(128, 128)
  "fullhearticon.png"           = @(128, 128)
}
foreach ($entry in $uiTargets.GetEnumerator()) {
  $path = Join-Path $assets ("ui\" + $entry.Key)
  if (Test-Path -LiteralPath $path) {
    Resize-Png -Path $path -MaxWidth $entry.Value[0] -MaxHeight $entry.Value[1]
  }
}

Get-ChildItem (Join-Path $assets "ui\audio") -Filter *.png | ForEach-Object {
  Resize-Png -Path $_.FullName -MaxWidth 128 -MaxHeight 128
}
Get-ChildItem (Join-Path $assets "ui\navigation") -Filter *.png | ForEach-Object {
  Resize-Png -Path $_.FullName -MaxWidth 128 -MaxHeight 128
}
Get-ChildItem (Join-Path $assets "ui\cursor") -Filter *.png | ForEach-Object {
  Resize-Png -Path $_.FullName -MaxWidth 128 -MaxHeight 128
}
Get-ChildItem (Join-Path $assets "ui\hud") -Filter *.png | ForEach-Object {
  Resize-Png -Path $_.FullName -MaxWidth 400 -MaxHeight 160
}

$unusedAssets = @(
  "stars\2.png",
  "stars\8.png",
  "ui\blankmessagepanel.png",
  "ui\game-icon-source.png",
  "ui\game-icon.png",
  "ui\game-logo.svg"
)
foreach ($relativePath in $unusedAssets) {
  $path = Join-Path $assets $relativePath
  if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path }
}

$beforeBytes = (Get-ChildItem $BackupRoot -File -Recurse | Measure-Object Length -Sum).Sum
$afterBytes = (Get-ChildItem $assets -File -Recurse | Measure-Object Length -Sum).Sum
[pscustomobject]@{
  Backup = $BackupRoot
  BeforeMiB = [Math]::Round($beforeBytes / 1MB, 2)
  AfterMiB = [Math]::Round($afterBytes / 1MB, 2)
  SavedPercent = [Math]::Round((1 - ($afterBytes / $beforeBytes)) * 100, 1)
}
