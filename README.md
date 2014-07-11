# get-line

Getting a specific line of data or a range of data, and it is a stream. While `get-line` find the range or a specific of data the stream will end itself, cool :).

## Install

```
npm install get-line
```

## Example

```javascript
var getLine = require('get-line');
var fs = require('fs');
var rs = fs.createReadStream('./test/100000.csv', {encoding: 'utf8'})
var ws = fs.createWriteStream('./test/output');

// get data from line 10000 to 10010
var getLine = getLine({lines: [10000, 10010], encoding: 'utf8', newline: '\n'}, cb);

function cb(line) {
    console.log(line);
    // return an array of the data in the range
}

rs.pipe(getLine).pipe(ws)
```


## API

```javascript
getLine(opts, cb)
```

#### Parameters

- options: Readable stream options(optional) http://nodejs.org/api/stream.html#stream_class_stream_readable_1
    * `line` option(must) `array`: If you are only getting a specific line `[100]` get line 100, getting a range of data `[100, 1000]` getting data from range 100 to 1000
- cb: After done will emit the callback function with a result argument an array of the data.



## License

MIT [@chilijung](http://github.com/chilijung)
