# PowerPoint export - step 2/3: uses PowerPoint itself (COM) to embed the
# recorded 3D clips behind each slide, make them play automatically with the
# slide (and stay on their last frame), and set a fade transition.
# Step 3 (set_morph.py) then upgrades in-scene transitions to Morph.
#
#   powershell -ExecutionPolicy Bypass -File tools\pptx\finalize.ps1

param([string]$Root = (Resolve-Path "$PSScriptRoot\..\..").Path)

$ErrorActionPreference = 'Stop'
$export = Join-Path $Root 'export'
$recordings = Join-Path $Root 'recordings'
$manifest = Get-Content (Join-Path $export 'manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$output = Join-Path $export 'with-videos.pptx'

$ppt = New-Object -ComObject PowerPoint.Application
try {
  $pres = $ppt.Presentations.Open((Join-Path $export 'base.pptx'), -1, 0, 0)  # read-only, no window
  $w = $pres.PageSetup.SlideWidth
  $h = $pres.PageSetup.SlideHeight
  foreach ($m in $manifest) {
    $slide = $pres.Slides.Item([int]$m.slide)
    $clip = Join-Path $recordings $m.clip
    if (-not (Test-Path $clip)) { throw "Missing clip: $clip" }

    $video = $slide.Shapes.AddMediaObject2($clip, 0, -1, 0, 0, $w, $h)
    $video.Name = 'Scene 3D'
    $video.AlternativeText = 'Animation 3D illustrant la diapositive'
    $video.ZOrder(1)  # msoSendToBack: behind the gradient and the text

    # Play automatically with the slide (msoAnimEffectMediaPlay, msoAnimTriggerWithPrevious)
    $effect = $slide.TimeLine.MainSequence.AddEffect($video, 83, 0, 2)
    $effect.MoveTo(1)
    $play = $video.AnimationSettings.PlaySettings
    $play.HideWhileNotPlaying = 0
    $play.RewindMovie = 0       # stay on the last frame
    $play.LoopUntilStopped = 0

    $slide.SlideShowTransition.EntryEffect = 1793  # ppEffectFade
    $slide.SlideShowTransition.Duration = 0.8
    Write-Host ("  slide {0,2}: {1}" -f $m.slide, $m.clip)
  }
  $pres.SaveAs($output, 24)  # ppSaveAsOpenXMLPresentation
  $pres.Close()
  Write-Host "saved $output"
} finally {
  $ppt.Quit() | Out-Null
}
