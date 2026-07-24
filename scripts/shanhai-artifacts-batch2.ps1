# Batch 2: expand 名物 illustrations (20 cards) via RexAI gpt-image-2
# Then compress: node scripts/shanhai-compress-webp.mjs --delete-png
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
  @{ Id = 'A-R01-SR-005'; Prompt = "$style. Ancient Chinese bronze gui food vessel, round belly two handles ring foot, soft gold-bronze patina, inscription shadow suggestion on inner wall abstract not readable." }
  @{ Id = 'A-R01-R-002'; Prompt = "$style. Fragment of Shang-Zhou bronze with taotie beast-face pattern, symmetrical eyes horns relief, green-brown patina gold highlight." }
  @{ Id = 'A-R01-R-007'; Prompt = "$style. Ancient Chinese bronze jue wine vessel, spout and tail, three slender legs, classic ritual wine cup silhouette." }
  @{ Id = 'A-R01-R-008'; Prompt = "$style. Chinese bi jade disc, flat circular jade with center hole, soft celadon white jade glow, ritual jade object." }
  @{ Id = 'A-R01-R-023'; Prompt = "$style. Ancient Chinese bronze mirror, round mirror face and ornate reverse with central knob, soft museum light." }
  @{ Id = 'A-R02-SR-004'; Prompt = "$style. Chu culture tiger-base phoenix-frame drum, twin phoenixes holding a drum above tiger pedestals, lacquer red black gold, elegant." }
  @{ Id = 'A-R02-R-017'; Prompt = "$style. Chu lacquer wooden object painted red black gold, refined wood vessel or tray, glossy lacquer texture." }
  @{ Id = 'A-R03-R-004'; Prompt = "$style. Artistic Bashu bronze divine tree with branching arms, dark bronze gold accents, mythical ritual tree, not a real photo." }
  @{ Id = 'A-R03-R-010'; Prompt = "$style. Artistic Bashu bronze standing figure tall slender holding objects, ritual bronze person, dark bronze gold accents, awe-inspiring." }
  @{ Id = 'A-R04-R-002'; Prompt = "$style. Chinese blue-and-white porcelain plate or dish, white ground cobalt blue floral brushwork, elegant Jiangnan porcelain." }
  @{ Id = 'A-R04-R-006'; Prompt = "$style. Chinese tea cup celadon or plain scholarly tea bowl, soft jade glaze, quiet tea ceremony mood." }
  @{ Id = 'A-R04-R-015'; Prompt = "$style. Chinese Yixing zisha purple clay teapot, unglazed warm purple-brown clay, elegant simple form." }
  @{ Id = 'A-R05-R-002'; Prompt = "$style. Silk road camel caravan silhouette, two-hump Bactrian camel with packs, soft grassland desert mist refined illustration." }
  @{ Id = 'A-R05-R-005'; Prompt = "$style. Steppe horn cup drinking vessel, polished horn form with metal rim, northern banquet object refined museum style." }
  @{ Id = 'A-R06-R-002'; Prompt = "$style. Mythic nine-tailed fox Chinese classic, elegant not scary, soft clouds gold accents, Shan Hai Jing spirit." }
  @{ Id = 'A-R06-R-016'; Prompt = "$style. Mythic candle dragon Zhulong Chinese classic, serpentine body eyes as day and night, purple-gray mist gold light, refined fantasy." }
  @{ Id = 'A-R07-SR-001'; Prompt = "$style. Traditional Chinese New Year red couplet papers hanging on wooden door frame, blank red paper with abstract ink strokes NOT readable Chinese characters, warm festival gold." }
  @{ Id = 'A-R07-R-008'; Prompt = "$style. Traditional Chinese mooncake on soft cloth, round pastry with abstract pattern NO readable characters, Mid-Autumn festival mood soft gold." }
  @{ Id = 'A-R08-R-002'; Prompt = "$style. Traditional Chinese maritime compass luopan or ancient navigational dial, refined brass wood, soft museum light." }
  @{ Id = 'A-R08-R-003'; Prompt = "$style. Chinese export blue-and-white porcelain plate for overseas trade, elegant open panel design, maritime silk road mood." }
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
Get-ChildItem $outRoot -Filter *.webp | Measure-Object | ForEach-Object { Write-Host "webp_count=$($_.Count)" }
