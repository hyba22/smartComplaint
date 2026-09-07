Write-Host "=== Testing Classification System ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check vocabulary file
Write-Host "1. Checking vocabulary file..." -ForegroundColor Yellow
$vocabPath = "src\main\resources\config\reclamation-classification-vocabulary.json"
if (Test-Path $vocabPath) {
    $vocab = Get-Content $vocabPath | ConvertFrom-Json
    Write-Host "   OK - Vocabulary file found" -ForegroundColor Green
    Write-Host "   OK - Version: $($vocab.version)" -ForegroundColor Green
    
    $n1Keywords = $vocab.levels.NIVEAU_1.keywords.fr.Count
    $n2Keywords = $vocab.levels.NIVEAU_2.keywords.fr.Count
    $n3Keywords = $vocab.levels.NIVEAU_3.keywords.fr.Count
    
    Write-Host "   OK - NIVEAU_1: $n1Keywords keywords" -ForegroundColor Green
    Write-Host "   OK - NIVEAU_2: $n2Keywords keywords" -ForegroundColor Green
    Write-Host "   OK - NIVEAU_3: $n3Keywords keywords" -ForegroundColor Green
} else {
    Write-Host "   ERROR - Vocabulary file not found!" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Ready to Test! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to http://localhost:9060" -ForegroundColor White
Write-Host "2. Login as a client" -ForegroundColor White
Write-Host "3. Create test reclamations (see TESTING_CLASSIFICATION.md)" -ForegroundColor White
Write-Host ""
