
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$entries = @"

# MongoDB Atlas - University DNS bypass (added by fix script)
159.41.196.165 ac-kucw0wx-shard-00-00.e2pi7p4.mongodb.net
159.41.196.178 ac-kucw0wx-shard-00-01.e2pi7p4.mongodb.net
159.41.196.203 ac-kucw0wx-shard-00-02.e2pi7p4.mongodb.net
"@

$existing = Get-Content $hostsPath
if ($existing -match "ac-kucw0wx-shard-00-00") {
    Write-Host "MongoDB Atlas entries already exist in hosts file." -ForegroundColor Yellow
} else {
    Add-Content -Path $hostsPath -Value $entries
    Write-Host "SUCCESS: MongoDB Atlas entries added to hosts file!" -ForegroundColor Green
}

ipconfig /flushdns | Out-Null
Write-Host "DNS cache flushed." -ForegroundColor Cyan
Write-Host "Press any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
