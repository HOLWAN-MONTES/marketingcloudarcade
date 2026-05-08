$content = Get-Content -Path "Pages\about.html" -Raw -Encoding UTF8
$bytes = [System.Text.Encoding]::GetEncoding("windows-1252").GetBytes($content)
$fixed = [System.Text.Encoding]::UTF8.GetString($bytes)
$fixed | Select-String "LOGROS DESBLOQUEADOS"
