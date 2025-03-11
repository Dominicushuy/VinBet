const fs = require('fs')
const path = require('path')

const apiDir = path.join(__dirname, '..', 'src', 'app', 'api')

function addDynamicConfig(dir) {
  const files = fs.readdirSync(dir)

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      addDynamicConfig(filePath)
    } else if (file === 'route.js' || file === 'route.ts') {
      let content = fs.readFileSync(filePath, 'utf8')

      if (!content.includes('export const dynamic')) {
        content = `export const dynamic = 'force-dynamic';\n\n${content}`
        fs.writeFileSync(filePath, content)
        console.log(`Added dynamic config to ${filePath}`)
      }
    }
  })
}

addDynamicConfig(apiDir)
console.log('Done adding dynamic configs to API routes')
