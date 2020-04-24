$rubybin = "C:\tools\ruby27\bin"
$adoc = "$rubybin\asciidoctor.bat"
$epub = "$rubybin\asciidoctor-epub3.bat"

& $adoc -r asciidoctor-diagram -D output index.adoc
& $epub -r asciidoctor-diagram -D output -o systems-integration.epub index.adoc
& $epub -r asciidoctor-diagram -D output -a ebook-format=kf8 -o systems-integration.mobi index.adoc
Remove-Item -Path .\output\systems-integration-kf8.epub
