# Prefer Machine-level REXAI_API_KEY (User key may be stale)
$mk = [Environment]::GetEnvironmentVariable("REXAI_API_KEY","Machine")
if ($mk) { $env:REXAI_API_KEY = $mk }
# Generate Shanhai key arts via RexAI (requires valid REXAI_API_KEY)
# Usage: powershell -File scripts/shanhai-rexai-batch.ps1
$ErrorActionPreference = "Stop"
if (-not $env:REXAI_API_KEY) { throw "REXAI_API_KEY missing" }
$script = Join-Path $env:USERPROFILE ".claude\skills\rexai-image-generation\scripts\rexai-image.ps1"
if (-not (Test-Path $script)) { throw "rexai-image.ps1 not found: $script" }
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -ErrorAction SilentlyContinue
if (-not $root) { $root = "E:\coding\rex-game" }
$outRoot = Join-Path $root "public\assets\shanhai"
$style = "New Chinese style digital museum illustration, Song dynasty ink landscape mood meets refined modern illustration, soft xuan paper texture, elegant muted palette antique gold bronze green lacquer red, museum quality, no text no watermark no logo"

$jobs = @(
  @{ Name="cover"; Size="1536x1024"; Dir="generated\cover"; Prompt="$style. Horizontal cultural game cover: bronze ding in misty mountains, gold cloud patterns, cinematic wide scholarly calm." },
  @{ Name="r01"; Size="1024x1024"; Dir="regions"; Prompt="$style. Zhongyuan: bronze ding with cloud-thunder pattern, museum lighting." },
  @{ Name="r02"; Size="1024x1024"; Dir="regions"; Prompt="$style. Chu region: elegant phoenix, lacquer red black gold, flowing feathers." },
  @{ Name="r03"; Size="1024x1024"; Dir="regions"; Prompt="$style. Bashu: Sanxingdui-inspired bronze mask vertical eyes gold accents artistic recreation not real photo." },
  @{ Name="r04"; Size="1024x1024"; Dir="regions"; Prompt="$style. Jiangnan: celadon vase garden window soft rain mist porcelain elegance." },
  @{ Name="r05"; Size="1024x1024"; Dir="regions"; Prompt="$style. Saibei: galloping horse and distant pass silhouette grassland silk road mood." },
  @{ Name="r06"; Size="1024x1024"; Dir="regions"; Prompt="$style. Immortal mountain Kunlun peaks clouds mythical calm atmosphere." },
  @{ Name="r07"; Size="1024x1024"; Dir="regions"; Prompt="$style. Seasonal festival red lantern and couplet mood warm paper glow no readable text." },
  @{ Name="r08"; Size="1024x1024"; Dir="regions"; Prompt="$style. Maritime silk road junk ship with sail monsoon sea horizon porcelain crate hint." }
)

foreach ($j in $jobs) {
  $dir = Join-Path $outRoot $j.Dir
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  Write-Host "=== $($j.Name) ==="
  powershell -NoProfile -ExecutionPolicy Bypass -File $script -Model gpt-image-2 -Size $j.Size -OutputDir $dir -Prompt $j.Prompt
}
Write-Host "Done. Copy/rename outputs into public/assets/shanhai as needed."

