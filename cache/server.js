const http = require('http')
const sysFs = require('fs/promises')
const sysPath = require('path')
const sysUrl = require('url')
const MIME = require('mime')
http
  .createServer(async function (req, res) {
    const {pathname} = sysUrl.parse(req.url == '/' ? '/index.html' : req.url)
    const {base} = sysPath.parse(pathname)
    const contenttype = MIME.getType(base)
    const path = sysPath.resolve(__dirname, './public', '.' + pathname)
    try {
      const data = await sysFs.readFile(path)
      res.setHeader('Content-Type', contenttype)
      res.end(data)
    } catch (e) {
      handleError(e, res)
    }
  })
  .listen(8080)
function handleError(err, res) {
  if (err.code === 'ENOENT') {
    res.statusCode = 404
    res.end('NOT FOUND')
  } else {
    res.statusCode = 500
    res.end('SERVER INNER ERROR')
  }
}
