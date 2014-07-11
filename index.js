var Transform = require('stream').Transform;
var fs = require('fs');
var util = require('util');

util.inherits(GetLine, Transform);

module.exports = GetLine;

function GetLine (opts, cb) {

	if(!(this instanceof GetLine))
		return new GetLine(opts, cb);

	this.count = 0;

	Transform.call(this, opts);
	var self = this;

	if(arguments.length === 1 && typeof opts === 'function') {
		// no opts
		cb = opts;
		opts = {};
	}

	this.cb = cb;

	this.newline = opts.newline || '\n';
	this.encode = opts.encoding || 'utf8';
	this.buffer = '';
	this.str_arr = [];

	if(opts.lines && opts.lines[0] && opts.lines[1] && (opts.lines[0] < opts.lines[1])) {
		this.lineStart = opts.lines[0];
		this.lineEnd = opts.lines[1];
	}else if(opts.lines && opts.lines[0] && opts.lines[1] && (opts.lines[0] > opts.lines[1])){
		throw new Error("The first line option can't greater then the second.");
	}else if(opts.lines && opts.lines[0]) {
		this.lineStart = opts.lines[0];
	}else if(opts.lines[0] < 1 || opts.lines[1] < 1) {
		throw new Error("Line range should be greater than 1");
	}else if(opts.lines[0] === opts.lines[1]) {
		throw new Error("Line start and end shouldn't be the same.")
	}
}

GetLine.prototype._transform = function(chunk, encoding, cb) {
	var chunk = chunk.toString(this.encode);
	if(chunk) {
		chunk = this.buffer + chunk;
	}
	var bk = this.breakLine(chunk);

	// buffer the last value, cause might be an incomplete value.
	for(var j = bk.length - 1; j >= 0; j--) {
		if(bk[j]) {
			// if have value
			this.buffer = bk[j];
			bk.splice(j, bk.length - 1);
			break;
		}
	}

	this.countLine(bk);

	cb();
}


GetLine.prototype.breakLine = function(chunk) {
	var bkl_reg = new RegExp('([^' + this.newline + ']*)','g');
	var bkl_result = chunk.match(bkl_reg);
	return bkl_result;
}

GetLine.prototype.countLine = function(arr) {
	for(var i = 0; i < arr.length; i++) {
		if(arr[i] === '') {
			// a line
			this.count++;
			console.log(this.count)
			if(this.count === this.lineStart && this.lineStart === 1 && this.lineEnd === undefined) {
				this.push(arr[i - 1] + this.newline)
				this.str_arr.push(arr[i - 1] + this.newline)
				this.end();
				break;
			}else if(this.count === this.lineStart && this.lineEnd === undefined && arr[i - 1] === '') {
				// hit to the start line
				this.push(arr[i] + this.newline);
				this.str_arr.push(arr[i] + this.newline);
				this.end();
				break;
			}else if(this.count === this.lineStart && this.lineEnd === undefined && arr[i - 1] !== '') {
				this.push(arr[i - 1] + this.newline);
				this.str_arr.push(arr[i - 1] + this.newline);
				this.end();
				break;
			}else if(this.count >= this.lineStart && this.lineEnd !== undefined && this.count <= this.lineEnd && arr[i - 1] === '') {
				this.push(arr[i] + this.newline);
				this.str_arr.push(arr[i] + this.newline);
			}else if(this.count >= this.lineStart && this.lineEnd !== undefined && this.count <= this.lineEnd && arr[i - 1] !== '') {
				this.push(arr[i - 1] + this.newline);
				this.str_arr.push(arr[i -1] + this.newline)
			}else if(this.count > this.lineEnd) {
				this.end();
				break;
			}
		}
	}
}

GetLine.prototype._flush = function(cb) {
	if(this.cb)
		this.cb(this.str_arr)
	this.count = 0;
	this.buffer = '';
	cb();
}