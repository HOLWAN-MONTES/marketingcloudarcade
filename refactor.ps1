$files = Get-ChildItem -Path . -Filter *.html -Recurse
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # 1. Remove <style>
    $content = $content -replace '(?s)<style>.*?</style>', ''

    # 2. Replace <nav>
    $content = $content -replace '(?s)<!-- ════════════════ NAVBAR ════════════════ -->.*?<nav class="navbar">.*?</nav>', '<div id="dynamic-navbar"></div>'
    $content = $content -replace '(?s)<nav class="navbar">.*?</nav>', '<div id="dynamic-navbar"></div>'

    # 3. Replace <footer>
    $content = $content -replace '(?s)<!-- FOOTER.*?-->.*?<footer.*?</footer>', '<div id="dynamic-footer"></div>'
    $content = $content -replace '(?s)<!-- ════════════════ FOOTER ════════════════ -->.*?<footer.*?</footer>', '<div id="dynamic-footer"></div>'
    $content = $content -replace '(?s)<footer.*?</footer>', '<div id="dynamic-footer"></div>'

    # 4. Replace Overlays & Konami
    $content = $content -replace '(?s)<!-- SEARCH OVERLAY -->.*?<div id="konami-toast">[^<]*</div>', '<div id="dynamic-overlays"></div>'
    $content = $content -replace '(?s)<div id="search-overlay".*?<div id="konami-toast">[^<]*</div>', '<div id="dynamic-overlays"></div>'

    # 5. Insert layout.js script before main.js
    $relativePath = ""
    if ($file.DirectoryName -match "Pages$|pages$") {
        $relativePath = "../"
    }
    
    $layoutScript = "<script src=`"${relativePath}assets/js/layout.js`"></script>`n"
    
    # Clean up any potential previous multiple <div id="dynamic-navbar"></div>
    # (Just in case the regex runs multiple times)
    $content = $content -replace '(?s)(<div id="dynamic-navbar"></div>\s*)+', '<div id="dynamic-navbar"></div>'
    $content = $content -replace '(?s)(<div id="dynamic-footer"></div>\s*)+', '<div id="dynamic-footer"></div>'
    
    if ($content -notmatch "layout\.js") {
        $content = $content -replace '(<script[^>]*assets/js/main\.js[^>]*></script>)', ($layoutScript + '$1')
    }

    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}
