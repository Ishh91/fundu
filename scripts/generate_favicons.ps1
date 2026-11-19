Add-Type -AssemblyName System.Drawing
$srcPath = Join-Path $PSScriptRoot "..\public\logo1.png"
$publicDir = Join-Path $PSScriptRoot "..\public"

$src = [System.Drawing.Bitmap]::FromFile($srcPath)

function Resize-Image($bmp, $w, $h, $outPath) {
    $dest = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($bmp, 0, 0, $w, $h)
    $g.Dispose()
    $dest.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()
    Write-Host "Created $outPath ($w x $h)"
}

Resize-Image $src 16 16 (Join-Path $publicDir "favicon-16x16.png")
Resize-Image $src 32 32 (Join-Path $publicDir "favicon-32x32.png")
Resize-Image $src 48 48 (Join-Path $publicDir "favicon-48x48.png")
Resize-Image $src 96 96 (Join-Path $publicDir "favicon-96x96.png")
Resize-Image $src 144 144 (Join-Path $publicDir "favicon-144x144.png")
Resize-Image $src 180 180 (Join-Path $publicDir "apple-touch-icon.png")
Resize-Image $src 192 192 (Join-Path $publicDir "icon-192.png")
Resize-Image $src 512 512 (Join-Path $publicDir "icon-512.png")

$src.Dispose()
