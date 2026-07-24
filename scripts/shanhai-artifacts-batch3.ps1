# Batch 3: remaining visual R-tier 名物 (29) via RexAI gpt-image-2
# After: node scripts/shanhai-compress-webp.mjs --delete-png
$ErrorActionPreference = "Continue"
$k = [Environment]::GetEnvironmentVariable("REXAI_API_KEY", "Machine")
if (-not $k) { $k = $env:REXAI_API_KEY }
if (-not $k) { throw "REXAI_API_KEY missing" }
$env:REXAI_API_KEY = $k

$script = Join-Path $env:USERPROFILE ".claude\skills\rexai-image-generation\scripts\rexai-image.ps1"
if (-not (Test-Path $script)) { throw "rexai-image.ps1 not found: $script" }

$root = "E:\coding\rex-game"
$outRoot = Join-Path $root "public\assets\shanhai\artifacts"
New-Item -ItemType Directory -Force -Path $outRoot | Out-Null

$style = "New Chinese style digital museum object illustration, refined modern Chinese illustration, soft xuan paper texture, elegant muted palette, museum spotlight, single subject centered, clean soft background, no text no watermark no logo, high detail, artistic recreation not a real museum photo"

$jobs = @(
  @{ Id = 'A-R01-R-011'; Prompt = "$style. Ancient Chinese bronze zun wine vessel, wide mouth or tall neck, green-brown patina gold highlights, ritual vessel." }
  @{ Id = 'A-R01-R-012'; Prompt = "$style. Ancient Chinese bronze pan water basin, wide rim shallow body, soft patina, ritual washing vessel." }
  @{ Id = 'A-R01-R-013'; Prompt = "$style. Ancient Chinese bronze ge dagger-axe, classic Shang Zhou weapon silhouette with yuan hu and nei, museum display." }
  @{ Id = 'A-R01-R-015'; Prompt = "$style. Close detail panel of cloud-thunder pattern cloud leiwen geometric spiral motif on bronze surface, soft museum light." }
  @{ Id = 'A-R01-R-017'; Prompt = "$style. Chinese gui jade tablet elongated flat jade tablet pointed tip, soft celadon white jade glow, ritual jade." }
  @{ Id = 'A-R01-R-019'; Prompt = "$style. Ancient Chinese pottery li tripod cooker with bag-shaped legs, earthenware clay texture, prehistoric to bronze age vessel." }
  @{ Id = 'A-R01-R-022'; Prompt = "$style. Chinese stone chime qing L-shaped or curved stone percussion plate hanging, ritual music instrument with bronze bells mood." }
  @{ Id = 'A-R01-R-027'; Prompt = "$style. Bronze vessel surface detail with rows of stud nipple patterns ru ding wen, green-brown patina relief." }
  @{ Id = 'A-R02-R-005'; Prompt = "$style. Ancient Chinese standing drum jian gu on wooden pedestal base, ritual drum, lacquer wood accents soft light." }
  @{ Id = 'A-R02-R-006'; Prompt = "$style. Chu culture silk painting scroll fragment, elegant figure or mythical motifs soft silk texture, refined not a photo of real painting." }
  @{ Id = 'A-R02-R-009'; Prompt = "$style. Traditional Chinese river boat on misty water, southern Yangtze Han river mood, refined ink-wash digital illustration." }
  @{ Id = 'A-R02-R-011'; Prompt = "$style. Chu style bronze vessel elegant form with distinctive southern bronze ornament, green-gold patina." }
  @{ Id = 'A-R02-R-012'; Prompt = "$style. Set of southern Chinese bronze chime bells hanging on wooden frame, ritual music, soft museum light." }
  @{ Id = 'A-R02-R-015'; Prompt = "$style. Elegant Chinese dragon and phoenix paired motif panel, lacquer red black gold, Chu ornamental style." }
  @{ Id = 'A-R03-R-005'; Prompt = "$style. Corner of Sichuan Shu brocade silk textile colorful warp weft geometric floral pattern, soft fabric fold museum style." }
  @{ Id = 'A-R03-R-014'; Prompt = "$style. Bashu bronze solar wheel disc with radiating spokes, dark bronze gold accents, ritual sun motif." }
  @{ Id = 'A-R03-R-017'; Prompt = "$style. Chinese zhang jade tablet elongated ritual jade blade form, soft white green jade glow southwest ritual." }
  @{ Id = 'A-R04-R-005'; Prompt = "$style. Traditional Chinese folding fan half open, paper or silk leaf bamboo ribs, scholarly Jiangnan mood soft light." }
  @{ Id = 'A-R04-R-008'; Prompt = "$style. Chinese silk painting handscroll partially unrolled on table, elegant landscape suggestion no readable text, soft scholarly light." }
  @{ Id = 'A-R05-R-004'; Prompt = "$style. Traditional Chinese steppe horse saddle with leather and metal fittings, northern nomadic refined museum object." }
  @{ Id = 'A-R05-R-011'; Prompt = "$style. Traditional Mongolian yurt felt tent ger on grassland, soft mist northern steppe, refined illustration." }
  @{ Id = 'A-R06-R-004'; Prompt = "$style. Fragment page of Classic of Mountains and Seas book, aged paper mythical map illustration no readable Chinese characters, gold accents." }
  @{ Id = 'A-R06-R-005'; Prompt = "$style. Mythic Weak Water ruo shui legendary river that cannot float a feather, misty dark water with floating feather, Chinese fantasy refined." }
  @{ Id = 'A-R06-R-006'; Prompt = "$style. Mythic Chinese divine bird luan phoenix-like elegant wings gold and soft colors among clouds, Shan Hai Jing spirit." }
  @{ Id = 'A-R07-R-005'; Prompt = "$style. Traditional Chinese zongzi rice dumpling wrapped in reed leaves tied with string, Dragon Boat festival food soft natural light." }
  @{ Id = 'A-R07-R-006'; Prompt = "$style. Chinese dragon boat race drum and prow vignette, red gold festive, no readable Chinese characters, festival energy refined." }
  @{ Id = 'A-R07-R-014'; Prompt = "$style. Festive Chinese ritual boat with lanterns on water, seasonal festival mood soft gold red, no readable text." }
  @{ Id = 'A-R08-R-004'; Prompt = "$style. Traditional spice pouch silk bag with fragrant herbs for maritime trade, elegant fabric ties, soft museum light." }
  @{ Id = 'A-R08-R-016'; Prompt = "$style. Traditional Chinese coastal fishing or trading junk near shore, soft sea horizon refined maritime illustration." }
)

function Gen-One($Id, $Prompt) {
  $finalWebp = Join-Path $outRoot "$Id.webp"
  if (Test-Path $finalWebp) {
    Write-Host "SKIP existing $finalWebp"
    return $true
  }
  $dir = Join-Path $outRoot $Id
  $finalPng = Join-Path $outRoot "$Id.png"
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  Get-ChildItem $dir -File -ErrorAction SilentlyContinue | Remove-Item -Force
  for ($try = 1; $try -le 4; $try++) {
    Write-Host "`n=== $Id try $try ==="
    try {
      & powershell -NoProfile -ExecutionPolicy Bypass -File $script `
        -Model gpt-image-2 -Size 1024x1024 -OutputDir $dir -Prompt $Prompt `
        -ApiKey $k -TimeoutMs 300000 | Out-Host
      $img = Get-ChildItem $dir -File -Recurse | Where-Object { $_.Extension -match '\.(png|jpg|webp)$' } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
      if ($img) {
        Copy-Item $img.FullName $finalPng -Force
        Write-Host "OK $finalPng ($([math]::Round($img.Length / 1kb))KB)"
        return $true
      }
      throw "no file"
    }
    catch {
      Write-Host "fail: $($_.Exception.Message)"
      Start-Sleep -Seconds 6
    }
  }
  Write-Host "FAILED $Id"
  return $false
}

$ok = 0; $fail = 0; $failed = @()
foreach ($j in $jobs) {
  if (Gen-One $j.Id $j.Prompt) { $ok++ } else { $fail++; $failed += $j.Id }
}
Write-Host "`nSUMMARY ok=$ok fail=$fail"
if ($failed.Count) { Write-Host "FAILED_IDS: $($failed -join ', ')" }
Get-ChildItem $outRoot -Filter *.png | Select-Object Name, @{ n = 'KB'; e = { [math]::Round($_.Length / 1kb) } }
Write-Host "webp_count=$((Get-ChildItem $outRoot -Filter *.webp).Count)"
