var Transform = require('stream').Transform;
var util = require('util');
var _ = require('lodash');

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

	this.newline = opts.newline || /\n|\r\n/g;
	this.encode = opts.encoding || 'utf8';
	this.buffer = '';

	if (opts.lines && opts.lines[0] && opts.lines[1] && (opts.lines[0] < opts.lines[1])) {
		this.lineStart = opts.lines[0];
		this.lineEnd = opts.lines[1];
	} else if (opts.lines && opts.lines[0] && opts.lines[1] && (opts.lines[0] > opts.lines[1])) {
		throw new Error('The first line option can\'t be greater than the second.');
	} else if (opts.lines && opts.lines[0]) {
		this.lineStart = opts.lines[0];
	} else if (opts.lines[0] < 1 || opts.lines[1] < 1) {
		throw new Error('Line range should be greater than 1');
	} else if (opts.lines[0] === opts.lines[1]) {
		throw new Error('Line start and end shouldn\'t be the same.');
	}
}

GetLine.prototype._transform = function (chunk, encoding, cb) {
	var chunk = chunk.toString(this.encode);
	if(chunk) {
		chunk = this.buffer + chunk;
		this.buffer = '';
	}
	var bk = this.breakLine(chunk);

	// store the last value if it is incomplete
	var lastValueIsIncomplete = _.last(bk) !== '';
	if (lastValueIsIncomplete) {
		// if have value
		this.buffer = _.last(bk);
		bk.pop();
	}

	this.countLine(bk);

	cb();
}


GetLine.prototype.breakLine = function(chunk) {
	return chunk.split(this.newline);
}

GetLine.prototype.countLine = function(arr) {
	for(var i = 0; i < arr.length; i++) {
		this.count++;

		if (this.count === this.lineStart && !this.lineEnd) {
			this.push(arr[i]);
			this.end();
			break;
		} else if (this.count > this.lineEnd) {
			this.end();
			break;
		} else if (this.count >= this.lineStart && this.count <= this.lineEnd) {
			this.push(arr[i]);
		}
	}
}

GetLine.prototype._flush = function(cb) {
	this.count = 0;
	this.buffer = '';
	cb();
}
