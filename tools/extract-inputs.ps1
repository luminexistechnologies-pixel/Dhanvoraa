Add-Type -AssemblyName System.IO.Compression.FileSystem
$path = 'C:/Users/Akash/Downloads/Dhanvoraa - SEO Recommendations.xlsx'
$archive = [IO.Compression.ZipFile]::OpenRead($path)
function Read-Entry($name) {
  $entry = $archive.GetEntry($name)
  if ($null -eq $entry) { return '' }
  $reader = New-Object IO.StreamReader($entry.Open())
  $value = $reader.ReadToEnd()
  $reader.Dispose()
  return $value
}
[xml]$shared = Read-Entry 'xl/sharedStrings.xml'
$strings = @()
foreach ($si in $shared.sst.si) { $strings += $si.InnerText }
[xml]$workbook = Read-Entry 'xl/workbook.xml'
[xml]$relations = Read-Entry 'xl/_rels/workbook.xml.rels'
$output = @()
foreach ($sheet in $workbook.workbook.sheets.sheet) {
  $output += "`nSHEET: $($sheet.name)"
  $id = $sheet.GetAttribute('id','http://schemas.openxmlformats.org/officeDocument/2006/relationships')
  $rel = $relations.Relationships.Relationship | Where-Object { $_.Id -eq $id }
  $target = $rel.Target.TrimStart('/')
  if (-not $target.StartsWith('xl/')) { $target = 'xl/' + $target }
  [xml]$doc = Read-Entry $target
  foreach ($row in $doc.worksheet.sheetData.row) {
    $cells = @()
    foreach ($c in $row.c) {
      $value = $c.v
      if ($c.t -eq 's') { $value = $strings[[int]$c.v] }
      if ($c.t -eq 'inlineStr') { $value = $c.is.InnerText }
      if ($value) { $cells += "$($c.r): $value" }
    }
    if ($cells.Count) { $output += $cells -join ' | ' }
  }
}
$archive.Dispose()
$output | Set-Content -LiteralPath 'tools/seo-content.txt' -Encoding UTF8
$output
