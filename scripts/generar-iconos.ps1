# Genera los iconos PNG de la PWA (sin dependencias externas).
# Uso: powershell -ExecutionPolicy Bypass -File scripts/generar-iconos.ps1
Add-Type -AssemblyName System.Drawing

$raiz = Split-Path -Parent $PSScriptRoot
$destinoIconos = Join-Path $raiz "public\icons"
$destinoApple = Join-Path $raiz "src\app"
New-Item -ItemType Directory -Force -Path $destinoIconos | Out-Null

function New-RoundedPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

function New-Icono([int]$tamano, [string]$ruta, [double]$escala = 1.0) {
  $bmp = New-Object System.Drawing.Bitmap($tamano, $tamano)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

  $verde = [System.Drawing.ColorTranslator]::FromHtml("#1e5c45")
  $crema = [System.Drawing.ColorTranslator]::FromHtml("#f7f5f0")
  $tomate = [System.Drawing.ColorTranslator]::FromHtml("#bf4318")

  $g.Clear($verde)
  $g.ScaleTransform($tamano / 512.0, $tamano / 512.0)
  if ($escala -ne 1.0) {
    $g.TranslateTransform(256, 256)
    $g.ScaleTransform($escala, $escala)
    $g.TranslateTransform(-256, -256)
  }

  $pincel = New-Object System.Drawing.SolidBrush($crema)
  $pincelTomate = New-Object System.Drawing.SolidBrush($tomate)

  # Manijas
  $g.FillPath($pincel, (New-RoundedPath 72 246 70 34 17))
  $g.FillPath($pincel, (New-RoundedPath 370 246 70 34 17))

  # Cuerpo de la olla
  $g.FillPath($pincel, (New-RoundedPath 128 226 256 178 36))

  # Borde y tapa
  $g.FillPath($pincel, (New-RoundedPath 110 204 292 40 20))
  $g.FillPath($pincel, (New-RoundedPath 150 184 212 24 12))

  # Perilla
  $g.FillEllipse($pincelTomate, 234, 160, 44, 44)

  # Vapor
  $lapiz = New-Object System.Drawing.Pen($crema, 11)
  $lapiz.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $lapiz.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $g.DrawBezier($lapiz, 206, 142, 186, 116, 224, 104, 204, 74)
  $g.DrawBezier($lapiz, 306, 142, 286, 116, 324, 104, 304, 74)

  $bmp.Save($ruta, [System.Drawing.Imaging.ImageFormat]::Png)

  $lapiz.Dispose()
  $pincel.Dispose()
  $pincelTomate.Dispose()
  $g.Dispose()
  $bmp.Dispose()
}

New-Icono 192 (Join-Path $destinoIconos "icon-192.png")
New-Icono 512 (Join-Path $destinoIconos "icon-512.png")
New-Icono 512 (Join-Path $destinoIconos "icon-maskable-512.png") 0.82
New-Icono 180 (Join-Path $destinoApple "apple-icon.png")

Write-Host "Iconos generados en public/icons y src/app/apple-icon.png"
