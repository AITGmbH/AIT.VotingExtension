Param(
    [Parameter(Mandatory = $False)] 
    [string]$jsInputDir = "D:\Build\_work\1\a\Extension.Voting.zip\obj\Release\Package\PackageTmp\Scripts\"
)
	
$Minifier ="$PSScriptRoot/AjaxMin.exe"


get-childitem $jsInputDir -recurse -force -include *.js -exclude *.min.js | 
	foreach-object {
		$newFileName=$_.FullName -replace ".js$",".min.js"
		&$Minifier $_.FullName -out $newFileName -clobber
	}
