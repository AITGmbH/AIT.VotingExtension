#Variables which provide the hardcoded changes
$newid = "asap-voting-aitgmb-de-production"
$public = $TRUE
$newName = "AIT Voting Extension"
$hubName = "Voting"
$defaultVersion = "1.0.0.0"

#for Productive use comment the folowing to lines!!!
#$Env:BUILD_SOURCESDIRECTORY = "C:\TFS\online_AIT\AIT\Tools\TFS ASAP\vNext\Voting\Production"

# If this script is not running on a build server, remind user to 
# set environment variables so that this script can be debugged
if(-not ($Env:BUILD_SOURCESDIRECTORY))
{
    Write-Error "You must set the following environment variables"
    Write-Error "to test this script interactively."
    Write-Host '$Env:BUILD_SOURCESDIRECTORY - For example, enter something like:'
    Write-Host '$Env:BUILD_SOURCESDIRECTORY = "C:\code\FabrikamTFVC\HelloWorld"'
    exit 1
}

# Make sure path to source code directory is available
if (-not $Env:BUILD_SOURCESDIRECTORY)
{
    Write-Error ("BUILD_SOURCESDIRECTORY environment variable is missing.")
    exit 1
}
elseif (-not (Test-Path $Env:BUILD_SOURCESDIRECTORY))
{
    Write-Error "BUILD_SOURCESDIRECTORY does not exist: $Env:BUILD_SOURCESDIRECTORY"
    exit 1
}
Write-Verbose "BUILD_SOURCESDIRECTORY: $Env:BUILD_SOURCESDIRECTORY"

### prepare json vss-extension.json
Write-Warning "Source Directory: $Env:BUILD_SOURCESDIRECTORY"

$files = gci -Path $Env:BUILD_SOURCESDIRECTORY -Include vss-extension.json -Recurse
if($files)
{
    Write-Warning "Will apply the changes to $($files.count) files."

    foreach ($file in $files) {
        $filecontent = (Get-Content $file) -join "`n"
		$json = ConvertFrom-Json $filecontent
		$json.id = $newid
		$json.version = $defaultVersion
		$json.name = $newName
		$json.public = $public
		$json.contributions[0].properties.name = $hubName
		$json.contributions[1].properties.name = $hubName
		$filecontent = ConvertTo-Json $json -Depth 3

        attrib $file -r
        $filecontent | Out-File $file -Encoding default
        Write-Warning "$file - changes applied"
    }
}
else
{
    Write-Warning "Found no files."
}

tfx extension create