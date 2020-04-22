$rubybin = "C:\tools\ruby27\bin"
$adoc = "$rubybin\asciidoctor.bat"
$epub = "$rubybin\asciidoctor-epub3.bat"

& $adoc -r asciidoctor-diagram -D output index.adoc
& $epub -r asciidoctor-diagram -D output index.adoc
