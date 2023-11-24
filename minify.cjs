(async () => {
    var UglifyJS = require("uglify-js");
    const { readFile, writeFile } = require('node:fs/promises');
    const { resolve } = require('node:path');
    const filePath = resolve('./public/javascripts/client.js');

    let contents = await readFile(filePath, { encoding: 'utf8' });
    var result = UglifyJS.minify(contents);
    if (result.error) {
        console.log(result.error);
        process.exit();
    } else {

        var JavaScriptObfuscator = require('javascript-obfuscator');

        var obfuscationResult = JavaScriptObfuscator.obfuscate(result.code,
            {
                compact: true,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 1,
                numbersToExpressions: true,
                simplify: true,
                stringArrayShuffle: true,
                splitStrings: true,
                stringArrayThreshold: 1
            }
        );
        await writeFile("./public/javascripts/client.min.js", obfuscationResult.getObfuscatedCode(), "utf8");
    }
})().catch(function (err) {
    console.log(err);
    process.exit();
});