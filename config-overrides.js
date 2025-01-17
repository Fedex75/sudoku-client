const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

module.exports = function override(config) {
    config.plugins.push(
        new ForkTsCheckerWebpackPlugin({
            async: false, // Ensures type errors are shown during development.
        })
    )
    return config
}
