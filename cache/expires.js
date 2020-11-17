const http = require('http')
const sysFs = require('fs')
const sysPath = require('path')
const sysUrl = require('url')
const MIME = require('mime')
http
  .createServer(function (req, res) {
    const {pathname} = sysUrl.parse(req.url == '/' ? '/index.html' : req.url)
    const {base} = sysPath.parse(pathname)
    const contenttype = MIME.getType(base)
    sysFs.readFile(
      sysPath.resolve(__dirname, './public', '.' + pathname),
      function (err, data) {
        if (err) {
          if (err.code === 'ENOENT') {
            res.statusCode = 404
            res.end('NOT FOUND')
          } else {
            res.statusCode = 500
            res.end('SERVER INNER ERROR')
          }
        } else {
          res.setHeader('expires', getExpires(new Date(), 1))
          res.setHeader('Content-Type', contenttype)
          res.end(data)
        }
      }
    )
  })
  .listen(8080)
function getExpires(date, delay) {
  return new Date(date.getTime() + delay * 1000 * 60).toGMTString()
}
