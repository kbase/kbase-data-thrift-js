/*global define */
/*jslint white: true */

/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Radoslaw Gruchalski <radek@gruchalski.com>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * Initializes a BinaryProtocol Implementation as a Wrapper for Thrift.Protocol
 * @constructor
 * @param {Thrift.Transport} transport - The transport to serialize to/from.
 * @param {boolean} stringRead - indicates strict read.
 * @param {boolean} stringWrite - indicates strict write.
 * @classdesc Apache Thrift Protocols perform serialization which enables cross 
 * language RPC. The Protocol type is the JavaScript browser implementation 
 * of the Apache Thrift TBinaryProtocol.
 * @example
 *     var protocol  = new Thrift.TBinaryProtocol(transport);
 */
define([
    '../core'
], function (Thrift) {
    'use strict';
    
     /*
     * A base Exception object for 
     * 
     * @returns {thrift-transport-xhr_L25.TTransportError}
     */
    function TProtocolException() {
        this.name = 'TProtocolException';
    }
    TProtocolException.prototype = Object.create(Thrift.TException.prototype);
    TProtocolException.prototype.constructor = TProtocolException;
    Thrift.TTransportError = TProtocolException;
    
    function TBinaryProtocolException(error) {
        this.name = 'TBinaryProtocolException';
        this.reason = error.reason;
        this.message = error.message;
        this.suggestions = error.suggestions;
        this.data = error.data;
        this.stack = (new Error()).stack;
    }
    // Steal the function prototype from Thrift.TException
    TBinaryProtocolException.prototype = Object.create(TProtocolException.prototype);
    TBinaryProtocolException.prototype.constructor = TBinaryProtocolException;
    Thrift.TBinaryProtocolException = TBinaryProtocolException;
    
    
    Thrift.TBinaryProtocol = function (transport, strictRead, strictWrite) {
        this.transport = transport;
        this.strictRead = (strictRead !== undefined ? strictRead : false);
        this.strictWrite = (strictWrite !== undefined ? strictWrite : false);
        // this is just to work around one small section of code in maps which uses
        // this rtack thing, which is an implementation detail of json that
        // leaked into the generator (or so I think.)
        this.rstack = [];
    };

    Thrift.TBinaryProtocol.VERSION_MASK = 0xffff0000;
    Thrift.TBinaryProtocol.VERSION_1 = 0x80010000;
    Thrift.TBinaryProtocol.TYPE_MASK = 0x000000ff;

    Thrift.TBinaryProtocol.prototype = {
        getTransport: function () {
            return this.transport;
        },
        /**
         * Serializes the beginning of a Thrift RPC message.
         * @param {string} name - The service method to call.
         * @param {Thrift.MessageType} messageType - The type of method call.
         * @param {number} seqid - The sequence number of this call (always 0 in Apache Thrift).
         */
        writeMessageBegin: function (name, type, seqid) {
            if (this.strictWrite) {
                this.writeI16(Thrift.TBinaryProtocol.VERSION_1 >> 16);
                this.writeI16(type);
                this.writeString(name);
                this.writeI32(seqid);
            } else {
                this.writeString(name);
                this.writeByte(type);
                this.writeI32(seqid);
            }
        },
        /**
         * Serializes the end of a Thrift RPC message.
         */
        writeMessageEnd: function () {
            // Nothing to do
        },
        /**
         * Serializes the beginning of a struct.
         * @param {string} name - The name of the struct.
         */
        writeStructBegin: function (name) {
            // EAP - nothing to do or not implemented?
        },
        /**
         * Serializes the end of a struct.
         */
        writeStructEnd: function () {
            // EAP - nothing to do or not implemented?
        },
        /**
         * Serializes the beginning of a struct field.
         * @param {string} name - The name of the field.
         * @param {Thrift.Protocol.Type} fieldType - The data type of the field.
         * @param {number} fieldId - The field's unique identifier.
         */
        // EAP - name in args but not used? Other impls don't seem to use either.
        writeFieldBegin: function (name, type, id) {
            this.writeByte(type);
            this.writeI16(id);
        },
        /**
         * Serializes the end of a field.
         */
        writeFieldEnd: function () {
            // EAP - nothing to do or not implemented?
        },
        /**
         * Serializes the end of the set of fields for a struct.
         */
        writeFieldStop: function () {
            this.writeByte(Thrift.Type.STOP);
        },
        /**
         * Serializes the beginning of a map collection.
         * @param {Thrift.Type} keyType - The data type of the key.
         * @param {Thrift.Type} valType - The data type of the value.
         * @param {number} [size] - The number of elements in the map (ignored).
         */
        writeMapBegin: function (keyType, valType, size) {
            this.writeByte(keyType);
            this.writeByte(valType);
            this.writeI32(size);
        },
        /**
         * Serializes the end of a map.
         */
        writeMapEnd: function () {
            // EAP - nothing to do or not implemented?
        },
        /**
         * Serializes the beginning of a list collection.
         * @param {Thrift.Type} elemType - The data type of the elements.
         * @param {number} size - The number of elements in the list.
         */
        writeListBegin: function (elemType, size) {
            this.writeByte(elemType);
            this.writeI32(size);
        },
        /**
         * Serializes the end of a list.
         */
        writeListEnd: function () {
            // EAP - nothing to do or not implemented?
            // Oh why are there methods for noops ??
        },
        /**
         * Serializes the beginning of a set collection.
         * @param {Thrift.Type} elemType - The data type of the elements.
         * @param {number} size - The number of elements in the list.
         */
        writeSetBegin: function (elemType, size) {
            this.writeByte(elemType);
            this.writeI32(size);
        },
        /**
         * Serializes the end of a set.
         */
        writeSetEnd: function () {
            // EAP - nothing to do or not implemented?
        },
        /** Serializes a boolean */
        writeBool: function (bool) {
            this.writeByte(bool ? 1 : 0);
        },
        /** Serializes a number */
        writeByte: function (byte) {
            if (byte <= Math.pow(2, 31) * -1 || byte >= Math.pow(2, 31)) {
                throw new Error(byte + " is incorrect for byte.");
            }
            this.transport.writeByte(byte);
        },
        /** Serializes a number (short) */
        /*jslint bitwise: true */
        writeI16: function (i16) {
            if (i16 < Math.pow(2, 15) * -1 || i16 >= Math.pow(2, 16)) {
                throw new Error(i16 + " is incorrect for i16.");
            }
            this.transport.writeByte(255 & i16 >> 8);
            this.transport.writeByte(255 & i16);
        },
        /** Serializes a number (int) */
        writeI32: function (i32) {
            if (i32 <= Math.pow(2, 31) * -1 || i32 >= Math.pow(2, 31)) {
                throw new Error(i32 + " is incorrect for i32.");
            }
            this.transport.writeByte(255 & i32 >> 24);
            this.transport.writeByte(255 & i32 >> 16);
            this.transport.writeByte(255 & i32 >> 8);
            this.transport.writeByte(255 & i32);
        },
        /** Serializes a number (long, for values over MAX_INTEGER, it will overflow) */
        writeI64: function (i64) {
            if (i64 <= Math.pow(2, 63) * -1 || i64 >= Math.pow(2, 64)) {
                throw new Error(i64 + " is incorrect for i64.");
            }
            // Although this is a correct way of packing a long int,
            // the value will overflow if the number is higher than max int
            var hi = (i64 & 0xffffffff00000000 >> 32);
            var lo = i64 & 0x00000000ffffffff;
            this.writeI32(hi);
            this.writeI32(lo);
        },
        /** Serializes a number (double IEEE-754) */
        writeDouble: function (dub) {
            // The code obtained from here: http://cautionsingularityahead.blogspot.nl/2010/04/javascript-and-ieee754-redux.html
            // According to the comments by the author, this code has been included in an external library
            // and it's available under MIT license.
            var ebits = 11;
            var fbits = 52;
            var bias = (1 << (ebits - 1)) - 1;
            // Compute sign, exponent, fraction
            var s, e, f;
            if (isNaN(dub)) {
                e = (1 << bias) - 1;
                f = 1;
                s = 0;
            } else if (dub === Infinity || dub === -Infinity) {
                e = (1 << bias) - 1;
                f = 0;
                s = (dub < 0) ? 1 : 0;
            } else if (dub === 0) {
                e = 0;
                f = 0;
                s = (1 / dub === -Infinity) ? 1 : 0;
            } else {
                s = dub < 0;
                dub = Math.abs(dub);
                if (dub >= Math.pow(2, 1 - bias)) {
                    var ln = Math.min(Math.floor(Math.log(dub) / Math.LN2), bias);
                    e = ln + bias;
                    f = dub * Math.pow(2, fbits - ln) - Math.pow(2, fbits);
                } else {
                    e = 0;
                    f = dub / Math.pow(2, 1 - bias - fbits);
                }
            }

            // Pack sign, exponent, fraction
            var i, bits = [];
            for (i = fbits; i; i -= 1) {
                bits.push(f % 2 ? 1 : 0);
                f = Math.floor(f / 2);
            }
            for (i = ebits; i; i -= 1) {
                bits.push(e % 2 ? 1 : 0);
                e = Math.floor(e / 2);
            }
            bits.push(s ? 1 : 0);
            bits.reverse();
            var str = bits.join('');

            // Bits to bytes
            while (str.length) {
                this.transport.writeByte(parseInt(str.substring(0, 8), 2));
                str = str.substring(8);
            }
        },
        /*jslint bitwise: false */

        /** Serializes a string */
        writeString: function (str) {
            var s = this.encode_utf8(str),
                strLen = s.length;
            this.writeI32(s.length);
            for (var i = 0; i < strLen; i += 1) {
                this.transport.writeByte(s.charCodeAt(i));
            }
        },
        /** Serializes abritrary array of bytes */
        writeBinary: function (buf) {
            this.writeI32(buf.length);
            this.transport.write(buf);
//            buf.forEach(function (byte) {
//                this.transport.writeByte(byte);
//            }.bind(this));
        },
        /**
         @class
         @name AnonReadMessageBeginReturn
         @property {string} fname - The name of the service method.
         @property {Thrift.MessageType} mtype - The type of message call.
         @property {number} rseqid - The sequence number of the message (0 in Thrift RPC).
         */
        /** 
         * Deserializes the beginning of a message. 
         * @returns {AnonReadMessageBeginReturn}
         */
        readMessageBegin: function () {
            var version = this.readI32().value,
                name, type, seqid;
            if (version < 0) {
                if (version & Thrift.TBinaryProtocol.VERSION_MASK !== Thrift.TBinaryProtocol.VERSION_1) {
                    throw new Thrift.TBinaryProtocolException({
                        reason: 'MissingVersionIdentifier',
                        message: 'Missing version identifier'
                    });
                }
                type = version & Thrift.TBinaryProtocol.TYPE_MASK;
                name = this.readString().value;
                seqid = this.readI32().value;
                return {fname: name, mtype: type, rseqid: seqid};
            } else {
                if (this.strictRead) {
                    throw new Thrift.TBinaryProtocolException({
                        reason: 'InvalidVersionIdentifier',
                        message: 'No version identifier, old protocol client?'
                    });
                }
                name = this.readMultipleAsString(version);
                type = this.readByte().value;
                seqid = this.readI32().value;
                return {fname: name, mtype: type, rseqid: seqid};
            }
        },
        /** Deserializes the end of a message. */
        readMessageEnd: function () {
        },
        /** 
         * Deserializes the beginning of a struct. 
         * @param {string} [name] - The name of the struct (ignored)
         * @returns {object} - Not supported in binary protocol
         */
        readStructBegin: function (name) {
            return {fname: ''};
        },
        /** Deserializes the end of a struct. */
        readStructEnd: function () {
        },
        /**
         @class
         @name AnonReadFieldBeginReturn
         @property {string} fname - The name of the field (always '').
         @property {Thrift.Type} ftype - The data type of the field.
         @property {number} fid - The unique identifier of the field.
         */
        /** 
         * Deserializes the beginning of a field. 
         * @returns {AnonReadFieldBeginReturn}
         */
        readFieldBegin: function () {
            var type = this.readByte().value;
            if (type === Thrift.Type.STOP) {
                return {fname: '', ftype: type, fid: 0};
            } else {
                return {fname: '', ftype: type, fid: this.readI16().value};
            }
        },
        /** Deserializes the end of a field. */
        readFieldEnd: function () {
            return {value: ''};
        },
        /**
         @class
         @name AnonReadMapBeginReturn
         @property {Thrift.Type} ktype - The data type of the key.
         @property {Thrift.Type} vtype - The data type of the value.
         @property {number} size - The number of elements in the map.
         */
        /** 
         * Deserializes the beginning of a map. 
         * @returns {AnonReadMapBeginReturn}
         */
        readMapBegin: function () {
            var ktype = this.readByte().value;
            var vtype = this.readByte().value;
            var size = this.readI32().value;
            return {ktype: ktype, vtype: vtype, size: size};
        },
        /** Deserializes the end of a map. */
        readMapEnd: function () {
            return this.readFieldEnd().value;
        },
        /**
         @class
         @name AnonReadColBeginReturn
         @property {Thrift.Type} etype - The data type of the element.
         @property {number} size - The number of elements in the collection.
         */
        /** 
         * Deserializes the beginning of a list. 
         * @returns {AnonReadColBeginReturn}
         */
        readListBegin: function () {
            var etype = this.readByte().value;
            var size = this.readI32().value;
            return {etype: etype, size: size};
        },
        /** Deserializes the end of a list. */
        readListEnd: function () {
            return this.readFieldEnd().value;
        },
        /** 
         * Deserializes the beginning of a set. 
         * @returns {AnonReadColBeginReturn}
         */
        readSetBegin: function () {
            var etype = this.readByte().value;
            var size = this.readI32().value;
            return {etype: etype, size: size};
        },
        /** Deserializes the end of a set. */
        readSetEnd: function () {
            return this.readFieldEnd().value;
        },
        /** Returns an object with a value property set to 
         *  False unless the next number in the protocol buffer 
         *  is 1, in which case the value property is True */
        readBool: function () {
            var byte = this.readByte().value;
            return {value: (byte !== 0)};
        },
        /** Returns the an object with a value property set to the 
         next value found in the protocol buffer */
        readByte: function () {
            var val = this.transport.readByte();
            if (val > 0x7f) {
                val = 0 - ((val - 1) ^ 0xff);
            }
            return {value: val};
        },
        /** Returns the an object with a value property set to the 
         next value found in the protocol buffer */
        readI16: function () {
            return {value: ((this.readByte().value & 255) << 8 | this.readByte().value & 255)};
        },
        /** Returns the an object with a value property set to the 
         next value found in the protocol buffer */
        readI32: function () {
            return {value: ((this.readByte().value & 255) << 24 | (this.readByte().value & 255) << 16 | (this.readByte().value & 255) << 8 | this.readByte().value & 255)};
        },
        /** Returns the an object with a value property set to the 
         next value found in the protocol buffer */
        readI64: function () {
            // Although this is a correct way of packing a long int,
            // the value will overflow if the number is higher than max int
            var i32_1 = this.readI32().value;
            var i32_2 = this.readI32().value;
            return {value: (i32_1 << 32 | i32_2)};
        },
        /** Returns the an object with a value property set to the 
         next value found in the protocol buffer */
        readDouble: function () {
            // The code obtained from here: http://cautionsingularityahead.blogspot.nl/2010/04/javascript-and-ieee754-redux.html
            // According to the comments by the author, this code has been included in an external library
            // and it's available under MIT license.
            var ebits = 11;
            var fbits = 52;
            var bytes = this.readMultiple(8);
            // Bytes to bits
            var bits = [];
            for (var i = bytes.length; i; i -= 1) {
                var byte = bytes[i - 1];
                for (var j = 8; j; j -= 1) {
                    bits.push(byte % 2 ? 1 : 0);
                    byte = byte >> 1;
                }
            }
            bits.reverse();
            var str = bits.join('');
            // Unpack sign, exponent, fraction
            var bias = (1 << (ebits - 1)) - 1;
            var s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
            var e = parseInt(str.substring(1, 1 + ebits), 2);
            var f = parseInt(str.substring(1 + ebits), 2);
            // Produce number
            if (e === (1 << ebits) - 1) {
                return {value: (f !== 0 ? NaN : s * Infinity)};
            } else if (e > 0) {
                return {value: (s * Math.pow(2, e - bias) * (1 + f / Math.pow(2, fbits)))};
            } else if (f !== 0) {
                return {value: (s * Math.pow(2, -(bias - 1)) * (f / Math.pow(2, fbits)))};
            } else {
                return {value: (s * 0)};
            }
        },
        /** Returns the an object with a value property set to the 
         next value found in the protocol buffer */
        readString: function () {
            var size = this.readI32().value,
                bytes = this.readMultiple(size);
            return {value: this.decode_utf8(this.stringFromByteArray(bytes))};
        },
        readBinary: function () {
            var size = this.readI32().value;
            return {value: this.readMultiple(size)};
        },
        /** Returns the an object with a value property set to the 
         next value found in the protocol buffer */
        readMultipleAsString: function (len) {
            var bytes = this.readMultiple(len);
            return this.decode_utf8(this.stringFromByteArray(bytes));
        },
        /** Returns the an object with a value property set to the 
         next value found in the protocol buffer */
        readMultiple: function (len) {
            return this.transport.read(len);
        },
        /** 
         * Method to arbitrarily skip over data */
        skip: function (type) {
            var ret, i;
            switch (type) {
                case Thrift.Type.STOP:
                    return null;
                case Thrift.Type.BOOL:
                    return this.readBool();
                case Thrift.Type.BYTE:
                    return this.readByte();
                case Thrift.Type.I16:
                    return this.readI16();
                case Thrift.Type.I32:
                    return this.readI32();
                case Thrift.Type.I64:
                    return this.readI64();
                case Thrift.Type.DOUBLE:
                    return this.readDouble();
                case Thrift.Type.STRING:
                    return this.readString();
                case Thrift.Type.STRUCT:
                    this.readStructBegin();
                    while (true) {
                        ret = this.readFieldBegin();
                        if (ret.ftype === Thrift.Type.STOP) {
                            break;
                        }
                        this.skip(ret.ftype);
                        this.readFieldEnd();
                    }
                    this.readStructEnd();
                    return null;
                case Thrift.Type.MAP:
                    ret = this.readMapBegin();
                    for (i = 0; i < ret.size; i++) {
                        if (i > 0) {
                            if (this.rstack.length > this.rpos[this.rpos.length - 1] + 1) {
                                this.rstack.pop();
                            }
                        }
                        this.skip(ret.ktype);
                        this.skip(ret.vtype);
                    }
                    this.readMapEnd();
                    return null;
                case Thrift.Type.SET:
                    ret = this.readSetBegin();
                    for (i = 0; i < ret.size; i++) {
                        this.skip(ret.etype);
                    }
                    this.readSetEnd();
                    return null;
                case Thrift.Type.LIST:
                    ret = this.readListBegin();
                    for (i = 0; i < ret.size; i++) {
                        this.skip(ret.etype);
                    }
                    this.readListEnd();
                    return null;
            }
        },
        // utils:

        encode_utf8: function (s) {
            return unescape(encodeURIComponent(s));
        },
        decode_utf8: function (s) {
            return decodeURIComponent(escape(s));
        },
        stringFromByteArray: function (barr) {
            // no try catch here, this will not work correctly for all Unicode characters
            // if an array is used instead of Uint8Array.
            // This is definitely working in the browser. PhantomJS has problems with this code.
            // More details here:
            //  - https://github.com/mozilla/pdf.js/issues/1955
            //  - https://github.com/mozilla/pdf.js/issues/1008
            return String.fromCharCode.apply(null, new Uint8Array(barr));
        }
    };

    return Thrift;
});