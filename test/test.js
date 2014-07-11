var getLine = require('../');
var fs = require('fs');
var rs = fs.createReadStream('./test/100000.csv', {encoding: 'utf8'})
var ws = fs.createWriteStream('./test/output');

var getLine = getLine({lines: [1], encoding: 'utf8', newline: '\n'}, cb);

function cb(line) {
	console.log(line);
}

rs.pipe(getLine).pipe(ws)