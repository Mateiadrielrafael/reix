const { resolve } = require('path')

require('ts-node').register({
    project: resolve(__dirname, '../tsconfig.node.json')
})
