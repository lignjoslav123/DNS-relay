"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.responseDNS = exports.requestDNS = exports.headerDNS = exports.concat = void 0;
var NUMBER_OF_SECONDS_TO_BE_CASHED = Uint8Array.from([23, 45]);
function bin(buf) {
    var ret = "";
    for (var _i = 0, buf_1 = buf; _i < buf_1.length; _i++) {
        var i = buf_1[_i];
        var b = i.toString(2);
        var s = "";
        for (var o = 0; o < 8 - b.length; o++) {
            s += '0';
        }
        s += b + " (".concat(i.toString(16), " || ").concat(i, ")");
        ret += " ".concat(s);
    }
    return ret;
}
//addition of buffers/uint8arrays
function concat(buffers) {
    function add(buff1, buff2) {
        var buf3 = new Uint8Array(buff1.length + buff2.length);
        var v = 0;
        for (var _i = 0, buff1_1 = buff1; _i < buff1_1.length; _i++) {
            var i = buff1_1[_i];
            buf3[v] = i;
            v++;
        }
        for (var _a = 0, buff2_1 = buff2; _a < buff2_1.length; _a++) {
            var i = buff2_1[_a];
            buf3[v] = i;
            v++;
        }
        return buf3;
    }
    var ret = Uint8Array.from([]);
    for (var _i = 0, buffers_1 = buffers; _i < buffers_1.length; _i++) {
        var i = buffers_1[_i];
        ret = add(ret, i);
    }
    return ret;
}
exports.concat = concat;
var headerDNS = /** @class */ (function () {
    function headerDNS() {
    }
    headerDNS.prototype.print = function () {
        return "id=".concat(bin(this.id), " \ninfo=").concat(bin(this.info), "\nqdcount=").concat(bin(this.qdcount), " \nancount=").concat(bin(this.ancount), " \nnscount=").concat(bin(this.nscount), " \narcount=").concat(bin(this.arcount));
    };
    headerDNS.build = function (data) {
        var p = new headerDNS();
        p.id = data.slice(0, 2);
        p.info = data.slice(2, 4);
        p.qdcount = data.slice(4, 6);
        p.ancount = data.slice(6, 8);
        p.nscount = data.slice(8, 10);
        p.arcount = data.slice(10, 12);
        return p;
    };
    headerDNS.prototype.copyheader = function (sup) {
        this.id = sup.id;
        this.info = sup.info;
        this.qdcount = sup.qdcount;
        this.ancount = sup.ancount;
        this.nscount = sup.nscount;
        this.arcount = sup.arcount;
    };
    headerDNS.prototype.getData = function () {
        return concat([this.id, this.info, this.qdcount, this.ancount, this.nscount, this.arcount]);
    };
    return headerDNS;
}());
exports.headerDNS = headerDNS;
var requestDNS = /** @class */ (function (_super) {
    __extends(requestDNS, _super);
    function requestDNS() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    requestDNS.build = function (data) {
        var p = new requestDNS();
        p.copyheader(_super.build.call(this, data));
        p.qclass = data.slice(data.length - 2, data.length);
        p.qtype = data.slice(data.length - 4, data.length - 2);
        p.qname = data.slice(12, data.length - 4);
        return p;
    };
    requestDNS.prototype.print = function () {
        var s = _super.prototype.print.call(this);
        s += "\ndomaine= ".concat(this.qname.toString());
        return s;
    };
    requestDNS.prototype.getData = function () {
        return concat([_super.prototype.getData.call(this), this.qname, this.qtype, this.qclass]);
    };
    return requestDNS;
}(headerDNS));
exports.requestDNS = requestDNS;
var responseDNS = /** @class */ (function (_super) {
    __extends(responseDNS, _super);
    function responseDNS() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    responseDNS.responde = function (req, adress) {
        var ret = new responseDNS();
        ret.copyheader(req);
        ret.info = Uint8Array.from([129, 128]);
        ret.ancount = Uint8Array.from([0, 1]);
        ret.aname = req.qname;
        ret.qdcount = Uint8Array.from([0, 0]);
        ret.type = req.qtype;
        ret["class"] = Uint8Array.from([0, 1]);
        ret.ttl = NUMBER_OF_SECONDS_TO_BE_CASHED;
        ret.rdlengh = Uint8Array.from([0, 4]);
        ret.rdata = Uint8Array.from(adress);
        return ret;
    };
    responseDNS.prototype.print = function () {
        var s = _super.prototype.print.call(this);
        s += "\ndomaine= ".concat(this.aname.toString());
        return s;
    };
    responseDNS.prototype.getData = function () {
        return concat([_super.prototype.getData.call(this), this.aname, this.type, this["class"], this.ttl, this.rdlengh, this.rdata]);
    };
    return responseDNS;
}(headerDNS));
exports.responseDNS = responseDNS;
