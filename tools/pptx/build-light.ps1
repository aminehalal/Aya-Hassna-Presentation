# Builds the LIGHT versions of both native decks (run after `npm run pptx:native`):
#   powershell -ExecutionPolicy Bypass -File tools/pptx/build-light.ps1
$env:LIGHT = '1'
python tools/pptx/make_native_assets.py
$env:DECK_NAME = 'native-base-light.pptx'; node tools/pptx/build-native.mjs
$env:DECK_NAME = 'enjeux-base-light.pptx'; node tools/pptx/build-enjeux.mjs
Copy-Item export/native-anims.json export/native-anims-light.json -Force
Copy-Item export/enjeux-anims.json export/enjeux-anims-light.json -Force
powershell -NoProfile -ExecutionPolicy Bypass -File tools/pptx/finalize-native.ps1 -Base native-base-light.pptx -Plan native-anims-light.json -Output Presentation-EST-Sale-animee-CLAIR.pptx
powershell -NoProfile -ExecutionPolicy Bypass -File tools/pptx/finalize-native.ps1 -Base enjeux-base-light.pptx -Plan enjeux-anims-light.json -Output Enjeux-RH-2023-CLAIR.pptx
