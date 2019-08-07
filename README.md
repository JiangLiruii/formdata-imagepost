# This is a small tool only for **multipart/form-data** request

### This is served on nodejs env as a middleware. It only depends on nodejs one native package: fs, for saving posted image.

## API

## Example

### Server Side
```js
const express = require('express')
// for cross-origin-request-securiy, this is set 'Access-Control-Allow-Origin: *', Forbidden to deploy on production!
const cors = require('cors')
const app = new express()
const parse = require('./middleware')
app.use(cors())
app.use(parse('test'))  // directory for posted picture, need create manually

app.post(/test/, (req, res) => {
  res.send('ok')
})

app.listen(8602)
```

### Client Side

Import following script in html, then the picture you dsignated will transfer to destination automatically.

```js
const url = 'http://localhost:8602'
const formData = new FormData()
// To create Image Blob, you can use any method to generate a blob type.
function generateImageBlob(src) {
  return new Promise((resolve,reject) => {
    const img = new Image;
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");

    img.onload = function() {
      c.width = this.naturalWidth;     // update canvas size to match image
      c.height = this.naturalHeight;
      ctx.drawImage(this, 0, 0);       // draw in image
      c.toBlob(resolve, "image/jpeg", 0.75); // save to blob
    };
    img.crossOrigin = ""
    img.src = src
  })
}
generateImageBlob('./test.png').then(blob => {
  formData.append('png', blob, 'testImg.png')
  const request = new XMLHttpRequest()
  request.open('POST', url)
  request.send(formData)
})
```


