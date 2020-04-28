$rubybin = "C:\tools\ruby27\bin"
$adoc = "$rubybin\asciidoctor.bat"
$epub = "$rubybin\asciidoctor-epub3.bat"
$pdf = "$rubybin\asciidoctor-pdf.bat"

# HTML expects images in a directory named images in its output folder
# epub / pdf embeds them from images in this folder
Copy-Item -Path .\images\* -Destination .\output\images\

& $adoc -r asciidoctor-diagram -D output index.adoc
& $epub -r asciidoctor-diagram -D output -o systems-integration.epub index.adoc
& $epub -r asciidoctor-diagram -D output -a ebook-format=kf8 -o systems-integration.mobi index.adoc
Remove-Item -Path .\output\systems-integration-kf8.epub
& $pdf -r asciidoctor-diagram -D output -o systems-integration.pdf index.adoc
