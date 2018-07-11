var request = require('request')
var fs = require('fs')
var url = 'https://s3.ap-south-1.amazonaws.com/handwrittennotes/grocery_image_3.png'
var filename = 'pic.png'

var writeFileStream = fs.createWriteStream(filename)

request(url).pipe(writeFileStream).on('close', function() {
  console.log(url, 'saved to', filename)
})
