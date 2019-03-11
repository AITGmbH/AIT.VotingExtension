// Used within package.json to update the paths for icon assets to be able to display the icon within azure devops ui
// The $tfx_publisher env variable is provided within package.json calls
// Please make sure that you provide your publisher id to use the extension for your purposes
// If the $tfx_publisher is not present, we use the original publisher within vss-extension.json
var fs = require('fs');

var vssExtensions = JSON.parse(fs.readFileSync('./vss-extension.json', 'utf-8'));

publisherName = process.argv[2];
if (!publisherName) {
    publisherName = vssExtensions.publisher;
}

const searchTerm = "." + vssExtensions.id;
const replacement = publisherName;

for (let contribution of vssExtensions.contributions) {
    if (contribution.properties) {
        if (contribution.properties.iconAsset) {
            var str = contribution.properties.iconAsset;
            contribution.properties.iconAsset = replaceString(str, searchTerm, replacement);
        }
        if (contribution.properties._sharedData) {
            for (var i = 0; i < contribution.properties._sharedData.assets.length; i++) {
                var str = contribution.properties._sharedData.assets[i];
                contribution.properties._sharedData.assets[i] = replaceString(str, searchTerm, replacement);
            }
        }
    }
}

fs.writeFileSync('./vss-extension.json', JSON.stringify(vssExtensions, null, 2));

function replaceString(str, searchTerm, replaceTerm) {
    var pointPos = str.indexOf(`${searchTerm}`);
    if (pointPos > -1) {
        str = `${replaceTerm}${str.substring(pointPos)}`
    }
    return str;
}