param([string]$Archive = 'C:\Users\danie\Downloads\drive-download-20261104T160519Z-1-001.zip')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$root = Join-Path $PSScriptRoot '../wordpress/tools/.imports/sku-images-2026-11-04'
New-Item -ItemType Directory -Force "$root/images" | Out-Null
$zip = [IO.Compression.ZipFile]::OpenRead($Archive)
$rows = @()
try {
 foreach ($entry in $zip.Entries) {
  if ($entry.Length -eq 0) { continue }
  $name = [IO.Path]::GetFileName($entry.FullName)
  $stream = $entry.Open()
  $memory = New-Object IO.MemoryStream
  try { $stream.CopyTo($memory); $bytes = $memory.ToArray() } finally { $stream.Dispose(); $memory.Dispose() }
  $sha = [Security.Cryptography.SHA256]::Create()
  try { $hash = ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-','').ToLowerInvariant() } finally { $sha.Dispose() }
  $file = "images/$hash.jpg"
  if (-not (Test-Path "$root/$file")) { [IO.File]::WriteAllBytes([IO.Path]::GetFullPath("$root/$file"),$bytes) }
  $rows += [pscustomobject]@{name=$name;source=$entry.FullName;file=$file;sha256=$hash}
 }
} finally { $zip.Dispose() }
[pscustomobject]@{source_sha256=(Get-FileHash -LiteralPath $Archive -Algorithm SHA256).Hash.ToLowerInvariant();files=$rows} | ConvertTo-Json -Depth 5 | Set-Content "$root/inventory.json" -Encoding UTF8
Write-Output "Inventoried $($rows.Count) images"
