const fs = require('fs')
const LF = 10;
const CR = 13;
module.exports = (dirname) => {
  return (req, res, next) => {
    let file;
    // to concat fragment data;
    let totalChunks;
    let bondaryLength;
    req.on('data', chunks => {
      /**
       * need 3 /r/n to get data body from req chunk
       * chunk sample:
       *  ------WebKitFormBoundary3tuwBqRDFNcHv5IX
          Content-Disposition: form-data; name="png"; filename="testImg.png"
          Content-Type: image/png

          PNG
          
          IHDRà5ÑÜä IDATx^¬½Y¯fé&ô¼Ã÷7!"2"Ó.]
      */
      let count = 3;
      if(totalChunks) {
        totalChunks = Buffer.concat([totalChunks,chunks] )
        return
      }
      for(let i = 0; i < chunks.length; i ++) {
        // if meet with /r/n
        if (chunks[i] === CR && chunks[i+1] === LF) {
          // chunk first line is bondary info, to save it for deletation later
          if (count === 3) {
            bondaryLength = i
          }
          if (count === 2) {
            const disposition = chunks.slice(bondaryLength+2, i).toString()
            // disposition:"Content-Disposition: form-data; name="png"; filename="testImg.png""
            const dispositionArray = disposition.trim().split(';')
            // dispositionArray: ["Content-Disposition: form-data", " name="png"", " filename="testImg.png""]
            dispositionArray.map(str => {
              if (str.includes('filename')) {
                // str: "filename="testImg.png""
                const filename = str.split('=')[1].replace(/"/g,'');
                file = fs.createWriteStream( `./${dirname}/${filename}`,{encoding: 'binary'});
              }
            })
          }
          if (count === 0 || totalChunks) {
            // +2 means skip /r/n
            totalChunks = chunks.slice(i + 2)
            break
          }
          count -= 1
        }
      }
    })
    
    req.on('end', () => {
      /** to delete bondary info from chunks, -6 means to delete additional '/r/n/r/n--'
       * chunk end sample:
       * ÑÜä IDATx^¬½Y¯fé
       * 
       * ------WebKitFormBoundary3tuwBqRDFNcHv5IX--
       */
      file.write(totalChunks.slice(0, totalChunks.length-bondaryLength - 6), () => {
        console.log('start write')
      })
      file.end(() => {
        console.log('finish write')
        next('route')

      })
    })

  }
}