module.exports = {
  handleError,
  setHeader,
  getHeader,
  getGMT
}

function handleError(err, res) {
  if (err.code === 'ENOENT') {
    res.statusCode = 404
    res.end('NOT FOUND')
  } else {
    res.statusCode = 500
    res.end('SERVER INNER ERROR')
  }
}
function setHeader(res, headers) {
  Object.keys(headers).forEach((header) =>
    res.setHeader(header, headers[header])
  )
}
function getHeader(req, headers) {
  return headers.reduce(
    (pre, cur) => (
      (pre[cur] =
        req.headers[
          cur.replace(/([A-Z])/g, function (match, p) {
            return '-' + p.toLowerCase()
          })
        ]),
      pre
    ),
    {}
  )
}
function getGMT(date, delay) {
  return new Date(date.getTime() + delay * 1000 * 60).toGMTString()
}
