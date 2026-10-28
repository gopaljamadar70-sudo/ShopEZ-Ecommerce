$staging = Join-Path $env:TEMP ('shopez_clean_source_' + [System.DateTime]::Now.Ticks)
New-Item -ItemType Directory -Path $staging -Force | Out-Null

$excludeNames = @('node_modules', '.git', 'dist', 'documentation-evidence', 'documentation-evidence.zip', 'shopez-source.zip', '.devcontainer')

$items = Get-ChildItem -Path C:\ShopEZ
foreach ($item in $items) {
    if ($excludeNames -contains $item.Name) {
        continue
    }

    if ($item.PSIsContainer) {
        $targetDir = Join-Path $staging $item.Name
        # Robocopy directory contents excluding nested node_modules and dist
        robocopy $item.FullName $targetDir /E /XD node_modules dist /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
    } else {
        Copy-Item -Path $item.FullName -Destination $staging -Force
    }
}

$destZip = 'C:\ShopEZ\shopez-source.zip'
if (Test-Path $destZip) {
    Remove-Item $destZip -Force
}

Compress-Archive -Path (Join-Path $staging '*') -DestinationPath $destZip -Force
Remove-Item -Path $staging -Recurse -Force
Get-Item $destZip
