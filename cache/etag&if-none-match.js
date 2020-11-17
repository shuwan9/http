const http = require('http')
const sysFs = require('fs')
const sysPath = require('path')
const sysUrl = require('url')
const MIME = require('mime')
const MD5 = require('md5')
http
  .createServer(function (req, res) {
    const {pathname} = sysUrl.parse(req.url == '/' ? '/index.html' : req.url)
    const {base} = sysPath.parse(pathname)
    const contenttype = MIME.getType(base)
    let path = sysPath.resolve(__dirname, './public', '.' + pathname)
    sysFs.readFile(path, function (err, data) {
      if (err) {
        if (err.code === 'ENOENT') {
          res.statusCode = 404
          res.end('NOT FOUND')
        } else {
          res.statusCode = 500
          res.end('SERVER INNER ERROR')
        }
      } else {
        sysFs.stat(path, function (err, stat) {
          const ifModifiedSince = req.headers['if-modified-since']
          const ifNoneMatch = req.headers['if-none-match']
          const etag = MD5(data)
          if (ifNoneMatch == etag) {
            res.statusCode = 304
            res.end()
          } else if (
            !ifModifiedSince ||
            !notModified(ifModifiedSince, getExpires(stat.mtime, 0))
          ) {
            res.setHeader('etag', etag)
            res.setHeader('Cache-Control', 'no-cache')
            res.setHeader('Last-Modified', getExpires(stat.mtime, 0))
            res.setHeader('Content-Type', contenttype)
            res.end(data)
          } else {
            res.statusCode = 304
            res.end()
          }
        })
      }
    })
  })
  .listen(8080)
function notModified(ifModifiedSince, lastModified) {
  return ifModifiedSince == lastModified
}
function getExpires(date, delay) {
  return new Date(date.getTime() + delay * 1000 * 60).toGMTString()
}
