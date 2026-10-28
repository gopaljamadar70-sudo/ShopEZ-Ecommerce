$evidenceSrc = 'C:\ShopEZ\Shopez_Documentation_Evidence'
$evidenceZip = 'C:\ShopEZ\Shopez_Documentation_Evidence.zip'
if (Test-Path $evidenceZip) { Remove-Item $evidenceZip -Force }
Compress-Archive -Path (Join-Path $evidenceSrc '*') -DestinationPath $evidenceZip -Force
Write-Host "Created Shopez_Documentation_Evidence.zip: $((Get-Item $evidenceZip).Length) bytes"

$staging = Join-Path $env:TEMP ('shopez_clean_src_' + [System.DateTime]::Now.Ticks)
New-Item -ItemType Directory -Path $staging -Force | Out-Null

$excludeNames = @('node_modules', '.git', 'dist', 'documentation-evidence', 'documentation-evidence.zip', 'shopez-source.zip', 'Shopez_Documentation_Evidence', 'Shopez_Documentation_Evidence.zip', 'Shopez_Source_Code.zip', '.devcontainer')

$items = Get-ChildItem -Path C:\ShopEZ
foreach ($item in $items) {
    if ($excludeNames -contains $item.Name) {
        continue
    }

    if ($item.PSIsContainer) {
        $targetDir = Join-Path $staging $item.Name
        robocopy $item.FullName $targetDir /E /XD node_modules dist /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
    } else {
        Copy-Item -Path $item.FullName -Destination $staging -Force
    }
}

$sourceZip = 'C:\ShopEZ\Shopez_Source_Code.zip'
if (Test-Path $sourceZip) { Remove-Item $sourceZip -Force }
Compress-Archive -Path (Join-Path $staging '*') -DestinationPath $sourceZip -Force
Remove-Item -Path $staging -Recurse -Force
Write-Host "Created Shopez_Source_Code.zip: $((Get-Item $sourceZip).Length) bytes"

Get-Item C:\ShopEZ\Shopez_Documentation_Evidence.zip, C:\ShopEZ\Shopez_Source_Code.zip
