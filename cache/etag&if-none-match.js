const http = require('http')
const sysFs = require('fs/promises')
const sysPath = require('path')
const sysUrl = require('url')
const MIME = require('mime')
const MD5 = require('md5')
const {handleError, setHeader, getHeader, getGMT} = require('./utils')

http
  .createServer(async function (req, res) {
    const {pathname} = sysUrl.parse(req.url == '/' ? '/index.html' : req.url)
    const {base} = sysPath.parse(pathname)
    const contenttype = MIME.getType(base)
    let path = sysPath.resolve(__dirname, './public', '.' + pathname)
    try {
      const data = await sysFs.readFile(path)
      const stat = await sysFs.stat(path)
      const {ifModifiedSince, ifNoneMatch} = getHeader(req, [
        'ifModifiedSince',
        'ifNoneMatch'
      ])
      const etag = MD5(data)
      if (ifNoneMatch == etag) {
        res.statusCode = 304
        res.end()
      } else if (
        !ifModifiedSince ||
        !notModified(ifModifiedSince, getGMT(stat.mtime, 0))
      ) {
        setHeader(res, {
          etag,
          'Cache-Control': 'no-cache',
          'Last-Modified': getGMT(stat.mtime, 0),
          'Content-Type': contenttype
        })
        res.end(data)
      } else {
        res.statusCode = 304
        res.end()
      }
    } catch (e) {
      handleError(e, res)
    }
  })
  .listen(8080)
function notModified(ifModifiedSince, lastModified) {
  return ifModifiedSince == lastModified
}
