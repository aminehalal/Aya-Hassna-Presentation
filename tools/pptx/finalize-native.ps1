# Native PowerPoint version - step 2/2: PowerPoint itself (COM) applies the
# animation plan written by build-native.mjs:
#   - Morph transition on every slide (shapes with the same name move/morph
#     from one step to the next)
#   - entrance effects for shapes that are new on a slide (fade, zoom, wipe,
#     fly, wheel...), all automatic (no extra click), timed with delays
#   - looping "ambient" effects: rotations, pulses, motion paths
#
#   powershell -ExecutionPolicy Bypass -File tools\pptx\finalize-native.ps1

param(
  [string]$Root = (Resolve-Path "$PSScriptRoot\..\..").Path,
  [string]$Base = 'native-base.pptx',
  [string]$Plan = 'native-anims.json',
  [string]$Output = 'Presentation-EST-Sale-animee.pptx'
)
$ErrorActionPreference = 'Stop'

$export = Join-Path $Root 'export'
$animPlan = Get-Content (Join-Path $export $Plan) -Raw -Encoding UTF8 | ConvertFrom-Json
$outPath = Join-Path $export $Output

# MsoAnimEffect / MsoAnimDirection values read from the PowerPoint type library
$ENTER = @{ fade = 10; zoom = 23; fadedZoom = 48; ascend = 39; expand = 50; wipe = 22; fly = 2; wheel = 21 }
$DIR = @{ top = 10; bottom = 11; left = 4; right = 2 }
$WITH_PREVIOUS = 2
$MORPH = 3954
$FADE = 1793

$ppt = New-Object -ComObject PowerPoint.Application
$applied = 0; $skipped = 0; $missing = 0
try {
  $pres = $ppt.Presentations.Open((Join-Path $export $Base), -1, 0, 0)
  $previous = @{}
  for ($n = 1; $n -le $pres.Slides.Count; $n++) {
    $slide = $pres.Slides.Item($n)
    $names = @{}
    foreach ($sh in $slide.Shapes) { $names[$sh.Name] = $true }

    $t = $slide.SlideShowTransition
    if ($n -eq 1) { $t.EntryEffect = $FADE } else { $t.EntryEffect = $MORPH }
    $t.Duration = 1.3

    $items = @($animPlan | Where-Object { $_.slide -eq $n })
    $seq = $slide.TimeLine.MainSequence

    # 1) looping ambient effects (start with the slide)
    foreach ($a in ($items | Where-Object { $_.kind -eq 'ambient' })) {
      if (-not $names.ContainsKey($a.shape)) { $missing++; continue }
      $sh = $slide.Shapes.Item($a.shape)
      switch ($a.effect) {
        'spin'   { $e = $seq.AddEffect($sh, 61, 0, $WITH_PREVIOUS); $e.Behaviors.Item(1).RotationEffect.By = [single]$a.by }
        'pulse'  { $e = $seq.AddEffect($sh, 59, 0, $WITH_PREVIOUS); $s = $e.Behaviors.Item(1).ScaleEffect; $s.ByX = [single]$a.by; $s.ByY = [single]$a.by }
        'teeter' { $e = $seq.AddEffect($sh, 80, 0, $WITH_PREVIOUS) }
        'path'   { $e = $seq.AddEffect($sh, 149, 0, $WITH_PREVIOUS); $e.Behaviors.Item(1).MotionEffect.Path = $a.path; $e.Timing.SmoothStart = 0; $e.Timing.SmoothEnd = 0 }
        default  { continue }
      }
      $e.Timing.Duration = [single]$a.dur
      $e.Timing.TriggerDelayTime = [single]$a.delay
      $e.Timing.RepeatCount = 9999
      if ($a.reverse) { $e.Timing.AutoReverse = -1 }
      # Pulses "breathe": ease in and out instead of a mechanical back-and-forth
      if ($a.effect -eq 'pulse') { $e.Timing.Accelerate = 0.5; $e.Timing.Decelerate = 0.5 }
      $applied++
    }

    # 2) entrances, only for shapes that did not exist on the previous step
    #    (shapes present on both are moved by the Morph transition instead)
    foreach ($a in ($items | Where-Object { $_.kind -eq 'enter' })) {
      if (-not $names.ContainsKey($a.shape)) { $missing++; continue }
      if ($previous.ContainsKey($a.shape)) { $skipped++; continue }
      $code = $ENTER[$a.effect]; if (-not $code) { $code = 10 }
      $e = $seq.AddEffect($slide.Shapes.Item($a.shape), $code, 0, $WITH_PREVIOUS)
      if ($a.dir -and $DIR.ContainsKey($a.dir)) { try { $e.EffectParameters.Direction = $DIR[$a.dir] } catch {} }
      # Titles reveal word by word (one 10 % step per word)
      if ($a.shape -eq '!!title') { try { $e = $seq.ConvertToTextUnitEffect($e, 2) } catch {} }
      $e.Timing.Duration = [single]$a.dur
      $e.Timing.TriggerDelayTime = [single]$a.at
      # Everything that moves in slows down gently at the end (no abrupt stop)
      if ($a.effect -ne 'fade') { $e.Timing.Decelerate = 0.7 }
      $applied++
    }

    $previous = $names
    Write-Host ("  slide {0,2}: {1,3} effects" -f $n, $seq.Count)
  }
  $pres.SaveAs($outPath, 24)
  $pres.Close()
  Write-Host "applied=$applied  morph-kept=$skipped  missing=$missing"
  Write-Host "saved $outPath"
} finally {
  $ppt.Quit() | Out-Null
}
