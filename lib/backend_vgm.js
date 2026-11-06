/*
 backend_vgm.js: VGMPlay plugin for use in ScriptNodePlayer.

 version 1.1

 	Copyright (C) 2015-2023 Juergen Wothke

	
 LICENSE

 This library is free software; you can redistribute it and/or modify it
 under the terms of the GNU General Public License as published by
 the Free Software Foundation; either version 2.1 of the License, or (at
 your option) any later version. This library is distributed in the hope
 that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public
 License along with this library; if not, write to the Free Software
 Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301 USA
*/

// create separate namespace for all the Emscripten stuff.. otherwise naming clashes may occur especially when 
// optimizing using closure compiler..
window.spp_backend_state_VGM= {
	locateFile: function(path, scriptDirectory) { return (typeof window.WASM_SEARCH_PATH == 'undefined') ? path : window.WASM_SEARCH_PATH + path; },
	notReady: true,
	adapterCallback: function(){}	// overwritten later	
};
window.spp_backend_state_VGM["onRuntimeInitialized"] = function() {	// emscripten callback needed in case async init is used (e.g. for WASM)
	this.notReady= false;
	this.adapterCallback();
}.bind(window.spp_backend_state_VGM);

var backend_vgmPlay = (function(Module) {var e;e||(e=typeof Module !== 'undefined' ? Module : {});var k={},l;for(l in e)e.hasOwnProperty(l)&&(k[l]=e[l]);e.arguments=[];e.thisProgram="./this.program";e.quit=function(a,b){throw b;};e.preRun=[];e.postRun=[];var n=!1,q=!1,r=!1,aa=!1;n="object"===typeof window;q="function"===typeof importScripts;r="object"===typeof process&&"function"===typeof require&&!n&&!q;aa=!n&&!r&&!q;var t="";function ba(a){return e.locateFile?e.locateFile(a,t):t+a}
if(r){t=__dirname+"/";var ca,da;e.read=function(a,b){ca||(ca=require("fs"));da||(da=require("path"));a=da.normalize(a);a=ca.readFileSync(a);return b?a:a.toString()};e.readBinary=function(a){a=e.read(a,!0);a.buffer||(a=new Uint8Array(a));assert(a.buffer);return a};1<process.argv.length&&(e.thisProgram=process.argv[1].replace(/\\/g,"/"));e.arguments=process.argv.slice(2);"undefined"!==typeof module&&(module.exports=e);process.on("uncaughtException",function(a){throw a;});process.on("unhandledRejection",
u);e.quit=function(a){process.exit(a)};e.inspect=function(){return"[Emscripten Module object]"}}else if(aa)"undefined"!=typeof read&&(e.read=function(a){return read(a)}),e.readBinary=function(a){if("function"===typeof readbuffer)return new Uint8Array(readbuffer(a));a=read(a,"binary");assert("object"===typeof a);return a},"undefined"!=typeof scriptArgs?e.arguments=scriptArgs:"undefined"!=typeof arguments&&(e.arguments=arguments),"function"===typeof quit&&(e.quit=function(a){quit(a)});else if(n||q)q?
t=self.location.href:document.currentScript&&(t=document.currentScript.src),t=0!==t.indexOf("blob:")?t.substr(0,t.lastIndexOf("/")+1):"",e.read=function(a){var b=new XMLHttpRequest;b.open("GET",a,!1);b.send(null);return b.responseText},q&&(e.readBinary=function(a){var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}),e.readAsync=function(a,b,c){var d=new XMLHttpRequest;d.open("GET",a,!0);d.responseType="arraybuffer";d.onload=function(){200==
d.status||0==d.status&&d.response?b(d.response):c()};d.onerror=c;d.send(null)},e.setWindowTitle=function(a){document.title=a};var ea=e.print||("undefined"!==typeof console?console.log.bind(console):"undefined"!==typeof print?print:null),w=e.printErr||("undefined"!==typeof printErr?printErr:"undefined"!==typeof console&&console.warn.bind(console)||ea);for(l in k)k.hasOwnProperty(l)&&(e[l]=k[l]);k=void 0;function fa(a){var b=x;x=x+a+15&-16;return b}
function ha(a){var b;b||(b=16);return Math.ceil(a/b)*b}var ia={"f64-rem":function(a,b){return a%b},"debugger":function(){debugger}},ja=!1;function assert(a,b){a||u("Assertion failed: "+b)}var qa={stackSave:function(){ka()},stackRestore:function(){la()},arrayToC:function(a){var b=ma(a.length);oa.set(a,b);return b},stringToC:function(a){var b=0;if(null!==a&&void 0!==a&&0!==a){var c=(a.length<<2)+1;b=ma(c);pa(a,y,b,c)}return b}},ra={string:qa.stringToC,array:qa.arrayToC};
function sa(a,b){if(0===b||!a)return"";for(var c=0,d,f=0;;){d=y[a+f>>0];c|=d;if(0==d&&!b)break;f++;if(b&&f==b)break}b||(b=f);d="";if(128>c){for(;0<b;)c=String.fromCharCode.apply(String,y.subarray(a,a+Math.min(b,1024))),d=d?d+c:c,a+=1024,b-=1024;return d}return ta(a)}var ua="undefined"!==typeof TextDecoder?new TextDecoder("utf8"):void 0;
function z(a,b){for(var c=b;a[c];)++c;if(16<c-b&&a.subarray&&ua)return ua.decode(a.subarray(b,c));for(c="";;){var d=a[b++];if(!d)return c;if(d&128){var f=a[b++]&63;if(192==(d&224))c+=String.fromCharCode((d&31)<<6|f);else{var g=a[b++]&63;if(224==(d&240))d=(d&15)<<12|f<<6|g;else{var h=a[b++]&63;if(240==(d&248))d=(d&7)<<18|f<<12|g<<6|h;else{var m=a[b++]&63;if(248==(d&252))d=(d&3)<<24|f<<18|g<<12|h<<6|m;else{var p=a[b++]&63;d=(d&1)<<30|f<<24|g<<18|h<<12|m<<6|p}}}65536>d?c+=String.fromCharCode(d):(d-=
65536,c+=String.fromCharCode(55296|d>>10,56320|d&1023))}}else c+=String.fromCharCode(d)}}function ta(a){return z(y,a)}
function pa(a,b,c,d){if(!(0<d))return 0;var f=c;d=c+d-1;for(var g=0;g<a.length;++g){var h=a.charCodeAt(g);if(55296<=h&&57343>=h){var m=a.charCodeAt(++g);h=65536+((h&1023)<<10)|m&1023}if(127>=h){if(c>=d)break;b[c++]=h}else{if(2047>=h){if(c+1>=d)break;b[c++]=192|h>>6}else{if(65535>=h){if(c+2>=d)break;b[c++]=224|h>>12}else{if(2097151>=h){if(c+3>=d)break;b[c++]=240|h>>18}else{if(67108863>=h){if(c+4>=d)break;b[c++]=248|h>>24}else{if(c+5>=d)break;b[c++]=252|h>>30;b[c++]=128|h>>24&63}b[c++]=128|h>>18&63}b[c++]=
128|h>>12&63}b[c++]=128|h>>6&63}b[c++]=128|h&63}}b[c]=0;return c-f}"undefined"!==typeof TextDecoder&&new TextDecoder("utf-16le");var buffer,oa,y,va,A;function wa(){e.HEAP8=oa=new Int8Array(buffer);e.HEAP16=va=new Int16Array(buffer);e.HEAP32=A=new Int32Array(buffer);e.HEAPU8=y=new Uint8Array(buffer);e.HEAPU16=new Uint16Array(buffer);e.HEAPU32=new Uint32Array(buffer);e.HEAPF32=new Float32Array(buffer);e.HEAPF64=new Float64Array(buffer)}var xa,x,ya,za,Aa,Ba,Ca,C;xa=x=za=Aa=Ba=Ca=C=0;ya=!1;
function Da(){u("Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value "+D+", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ")}var Ea=e.TOTAL_STACK||5242880,D=e.TOTAL_MEMORY||67108864;D<Ea&&w("TOTAL_MEMORY should be larger than TOTAL_STACK, was "+D+"! (TOTAL_STACK="+Ea+")");
e.buffer?buffer=e.buffer:("object"===typeof WebAssembly&&"function"===typeof WebAssembly.Memory?(e.wasmMemory=new WebAssembly.Memory({initial:D/65536,maximum:D/65536}),buffer=e.wasmMemory.buffer):buffer=new ArrayBuffer(D),e.buffer=buffer);wa();function Fa(a){for(;0<a.length;){var b=a.shift();if("function"==typeof b)b();else{var c=b.Nc;"number"===typeof c?void 0===b.U?e.dynCall_v(c):e.dynCall_vi(c,b.U):c(void 0===b.U?null:b.U)}}}var Ga=[],Ja=[],Ka=[],La=[],Ma=[],Na=!1;
function Oa(){var a=e.preRun.shift();Ga.unshift(a)}var E=0,Pa=null,F=null;function Qa(){E++;e.monitorRunDependencies&&e.monitorRunDependencies(E)}function Ra(){E--;e.monitorRunDependencies&&e.monitorRunDependencies(E);if(0==E&&(null!==Pa&&(clearInterval(Pa),Pa=null),F)){var a=F;F=null;a()}}e.preloadedImages={};e.preloadedAudios={};function Sa(a){return String.prototype.startsWith?a.startsWith("data:application/octet-stream;base64,"):0===a.indexOf("data:application/octet-stream;base64,")}
(function(){function a(){try{if(e.wasmBinary)return new Uint8Array(e.wasmBinary);if(e.readBinary)return e.readBinary(f);throw"both async and sync fetching of the wasm failed";}catch(B){u(B)}}function b(){return e.wasmBinary||!n&&!q||"function"!==typeof fetch?new Promise(function(b){b(a())}):fetch(f,{credentials:"same-origin"}).then(function(a){if(!a.ok)throw"failed to load wasm binary file at '"+f+"'";return a.arrayBuffer()}).catch(function(){return a()})}function c(a){function c(a){m=a.exports;if(m.memory){a=
m.memory;var b=e.buffer;a.byteLength<b.byteLength&&w("the new buffer in mergeMemory is smaller than the previous one. in native wasm, we should grow memory here");b=new Int8Array(b);(new Int8Array(a)).set(b);e.buffer=buffer=a;wa()}e.asm=m;e.usingWasm=!0;Ra()}function d(a){c(a.instance)}function g(a){b().then(function(a){return WebAssembly.instantiate(a,h)}).then(a,function(a){w("failed to asynchronously prepare wasm: "+a);u(a)})}if("object"!==typeof WebAssembly)return w("no native wasm support detected"),
!1;if(!(e.wasmMemory instanceof WebAssembly.Memory))return w("no native wasm Memory in use"),!1;a.memory=e.wasmMemory;h.global={NaN:NaN,Infinity:Infinity};h["global.Math"]=Math;h.env=a;Qa();if(e.instantiateWasm)try{return e.instantiateWasm(h,c)}catch(J){return w("Module.instantiateWasm callback failed with error: "+J),!1}e.wasmBinary||"function"!==typeof WebAssembly.instantiateStreaming||Sa(f)||"function"!==typeof fetch?g(d):WebAssembly.instantiateStreaming(fetch(f,{credentials:"same-origin"}),h).then(d,
function(a){w("wasm streaming compile failed: "+a);w("falling back to ArrayBuffer instantiation");g(d)});return{}}var d="vgm.wast",f="vgm.wasm",g="vgm.temp.asm.js";Sa(d)||(d=ba(d));Sa(f)||(f=ba(f));Sa(g)||(g=ba(g));var h={global:null,env:null,asm2wasm:ia,parent:e},m=null;e.asmPreload=e.asm;var p=e.reallocBuffer;e.reallocBuffer=function(a){if("asmjs"===v)var b=p(a);else a:{var c=e.usingWasm?65536:16777216;0<a%c&&(a+=c-a%c);c=e.buffer.byteLength;if(e.usingWasm)try{b=-1!==e.wasmMemory.grow((a-c)/65536)?
e.buffer=e.wasmMemory.buffer:null;break a}catch(na){b=null;break a}b=void 0}return b};var v="";e.asm=function(a,b){if(!b.table){a=e.wasmTableSize;void 0===a&&(a=1024);var d=e.wasmMaxTableSize;b.table="object"===typeof WebAssembly&&"function"===typeof WebAssembly.Table?void 0!==d?new WebAssembly.Table({initial:a,maximum:d,element:"anyfunc"}):new WebAssembly.Table({initial:a,element:"anyfunc"}):Array(a);e.wasmTable=b.table}b.memoryBase||(b.memoryBase=e.STATIC_BASE);b.tableBase||(b.tableBase=0);b=c(b);
assert(b,"no binaryen method succeeded.");return b}})();xa=1024;x=xa+3380272;Ja.push();e.STATIC_BASE=xa;e.STATIC_BUMP=3380272;x+=16;
var G={F:1,u:2,xc:3,tb:4,B:5,fa:6,Ma:7,Rb:8,s:9,$a:10,aa:11,Hc:11,va:12,P:13,mb:14,cc:15,R:16,ba:17,Ic:18,T:19,da:20,I:21,h:22,Mb:23,ua:24,C:25,Ec:26,nb:27,Zb:28,M:29,uc:30,Fb:31,nc:32,jb:33,rc:34,Vb:42,qb:43,ab:44,wb:45,xb:46,yb:47,Eb:48,Fc:49,Pb:50,vb:51,gb:35,Sb:37,Sa:52,Va:53,Jc:54,Nb:55,Wa:56,Xa:57,hb:35,Ya:59,ac:60,Qb:61,Bc:62,$b:63,Wb:64,Xb:65,tc:66,Tb:67,Pa:68,yc:69,bb:70,oc:71,Hb:72,kb:73,Ua:74,ic:76,Ta:77,sc:78,zb:79,Ab:80,Db:81,Cb:82,Bb:83,bc:38,ea:39,Ib:36,S:40,jc:95,mc:96,fb:104,Ob:105,
Qa:97,qc:91,fc:88,Yb:92,vc:108,eb:111,Na:98,cb:103,Lb:101,Jb:100,Cc:110,ob:112,pb:113,sb:115,Ra:114,ib:89,Gb:90,pc:93,wc:94,Oa:99,Kb:102,ub:106,dc:107,Dc:109,Gc:87,lb:122,zc:116,hc:95,Ub:123,rb:84,kc:75,Za:125,ec:131,lc:130,Ac:86},Ta={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",
13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",
35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",
54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",
75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",
92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",
109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};function Ua(a){e.___errno_location&&(A[e.___errno_location()>>2]=a);return a}
function Va(a,b){for(var c=0,d=a.length-1;0<=d;d--){var f=a[d];"."===f?a.splice(d,1):".."===f?(a.splice(d,1),c++):c&&(a.splice(d,1),c--)}if(b)for(;c;c--)a.unshift("..");return a}function Wa(a){var b="/"===a.charAt(0),c="/"===a.substr(-1);(a=Va(a.split("/").filter(function(a){return!!a}),!b).join("/"))||b||(a=".");a&&c&&(a+="/");return(b?"/":"")+a}
function Xa(a){var b=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);a=b[0];b=b[1];if(!a&&!b)return".";b&&(b=b.substr(0,b.length-1));return a+b}function Ya(a){if("/"===a)return"/";var b=a.lastIndexOf("/");return-1===b?a:a.substr(b+1)}function Za(){var a=Array.prototype.slice.call(arguments,0);return Wa(a.join("/"))}function H(a,b){return Wa(a+"/"+b)}
function $a(){for(var a="",b=!1,c=arguments.length-1;-1<=c&&!b;c--){b=0<=c?arguments[c]:"/";if("string"!==typeof b)throw new TypeError("Arguments to path.resolve must be strings");if(!b)return"";a=b+"/"+a;b="/"===b.charAt(0)}a=Va(a.split("/").filter(function(a){return!!a}),!b).join("/");return(b?"/":"")+a||"."}var ab=[];function bb(a,b){ab[a]={input:[],output:[],H:b};cb(a,db)}
var db={open:function(a){var b=ab[a.node.rdev];if(!b)throw new I(G.T);a.tty=b;a.seekable=!1},close:function(a){a.tty.H.flush(a.tty)},flush:function(a){a.tty.H.flush(a.tty)},read:function(a,b,c,d){if(!a.tty||!a.tty.H.oa)throw new I(G.fa);for(var f=0,g=0;g<d;g++){try{var h=a.tty.H.oa(a.tty)}catch(m){throw new I(G.B);}if(void 0===h&&0===f)throw new I(G.aa);if(null===h||void 0===h)break;f++;b[c+g]=h}f&&(a.node.timestamp=Date.now());return f},write:function(a,b,c,d){if(!a.tty||!a.tty.H.Z)throw new I(G.fa);
for(var f=0;f<d;f++)try{a.tty.H.Z(a.tty,b[c+f])}catch(g){throw new I(G.B);}d&&(a.node.timestamp=Date.now());return f}},fb={oa:function(a){if(!a.input.length){var b=null;if(r){var c=new Buffer(256),d=0,f=process.stdin.fd;if("win32"!=process.platform){var g=!1;try{f=fs.openSync("/dev/stdin","r"),g=!0}catch(h){}}try{d=fs.readSync(f,c,0,256,null)}catch(h){if(-1!=h.toString().indexOf("EOF"))d=0;else throw h;}g&&fs.closeSync(f);0<d?b=c.slice(0,d).toString("utf-8"):b=null}else"undefined"!=typeof window&&
"function"==typeof window.prompt?(b=window.prompt("Input: "),null!==b&&(b+="\n")):"function"==typeof readline&&(b=readline(),null!==b&&(b+="\n"));if(!b)return null;a.input=eb(b)}return a.input.shift()},Z:function(a,b){null===b||10===b?(ea(z(a.output,0)),a.output=[]):0!=b&&a.output.push(b)},flush:function(a){a.output&&0<a.output.length&&(ea(z(a.output,0)),a.output=[])}},gb={Z:function(a,b){null===b||10===b?(w(z(a.output,0)),a.output=[]):0!=b&&a.output.push(b)},flush:function(a){a.output&&0<a.output.length&&
(w(z(a.output,0)),a.output=[])}},K={m:null,j:function(){return K.createNode(null,"/",16895,0)},createNode:function(a,b,c,d){if(24576===(c&61440)||4096===(c&61440))throw new I(G.F);K.m||(K.m={dir:{node:{o:K.c.o,i:K.c.i,lookup:K.c.lookup,J:K.c.J,rename:K.c.rename,unlink:K.c.unlink,rmdir:K.c.rmdir,readdir:K.c.readdir,symlink:K.c.symlink},stream:{A:K.f.A}},file:{node:{o:K.c.o,i:K.c.i},stream:{A:K.f.A,read:K.f.read,write:K.f.write,ga:K.f.ga,ra:K.f.ra,ta:K.f.ta}},link:{node:{o:K.c.o,i:K.c.i,readlink:K.c.readlink},
stream:{}},ja:{node:{o:K.c.o,i:K.c.i},stream:hb}});c=ib(a,b,c,d);L(c.mode)?(c.c=K.m.dir.node,c.f=K.m.dir.stream,c.b={}):32768===(c.mode&61440)?(c.c=K.m.file.node,c.f=K.m.file.stream,c.g=0,c.b=null):40960===(c.mode&61440)?(c.c=K.m.link.node,c.f=K.m.link.stream):8192===(c.mode&61440)&&(c.c=K.m.ja.node,c.f=K.m.ja.stream);c.timestamp=Date.now();a&&(a.b[b]=c);return c},Ca:function(a){if(a.b&&a.b.subarray){for(var b=[],c=0;c<a.g;++c)b.push(a.b[c]);return b}return a.b},Oc:function(a){return a.b?a.b.subarray?
a.b.subarray(0,a.g):new Uint8Array(a.b):new Uint8Array},ka:function(a,b){a.b&&a.b.subarray&&b>a.b.length&&(a.b=K.Ca(a),a.g=a.b.length);if(!a.b||a.b.subarray){var c=a.b?a.b.length:0;c>=b||(b=Math.max(b,c*(1048576>c?2:1.125)|0),0!=c&&(b=Math.max(b,256)),c=a.b,a.b=new Uint8Array(b),0<a.g&&a.b.set(c.subarray(0,a.g),0))}else for(!a.b&&0<b&&(a.b=[]);a.b.length<b;)a.b.push(0)},Ha:function(a,b){if(a.g!=b)if(0==b)a.b=null,a.g=0;else{if(!a.b||a.b.subarray){var c=a.b;a.b=new Uint8Array(new ArrayBuffer(b));c&&
a.b.set(c.subarray(0,Math.min(b,a.g)))}else if(a.b||(a.b=[]),a.b.length>b)a.b.length=b;else for(;a.b.length<b;)a.b.push(0);a.g=b}},c:{o:function(a){var b={};b.dev=8192===(a.mode&61440)?a.id:1;b.ino=a.id;b.mode=a.mode;b.nlink=1;b.uid=0;b.gid=0;b.rdev=a.rdev;L(a.mode)?b.size=4096:32768===(a.mode&61440)?b.size=a.g:40960===(a.mode&61440)?b.size=a.link.length:b.size=0;b.atime=new Date(a.timestamp);b.mtime=new Date(a.timestamp);b.ctime=new Date(a.timestamp);b.D=4096;b.blocks=Math.ceil(b.size/b.D);return b},
i:function(a,b){void 0!==b.mode&&(a.mode=b.mode);void 0!==b.timestamp&&(a.timestamp=b.timestamp);void 0!==b.size&&K.Ha(a,b.size)},lookup:function(){throw jb[G.u];},J:function(a,b,c,d){return K.createNode(a,b,c,d)},rename:function(a,b,c){if(L(a.mode)){try{var d=M(b,c)}catch(g){}if(d)for(var f in d.b)throw new I(G.ea);}delete a.parent.b[a.name];a.name=c;b.b[c]=a;a.parent=b},unlink:function(a,b){delete a.b[b]},rmdir:function(a,b){var c=M(a,b),d;for(d in c.b)throw new I(G.ea);delete a.b[b]},readdir:function(a){var b=
[".",".."],c;for(c in a.b)a.b.hasOwnProperty(c)&&b.push(c);return b},symlink:function(a,b,c){a=K.createNode(a,b,41471,0);a.link=c;return a},readlink:function(a){if(40960!==(a.mode&61440))throw new I(G.h);return a.link}},f:{read:function(a,b,c,d,f){var g=a.node.b;if(f>=a.node.g)return 0;a=Math.min(a.node.g-f,d);assert(0<=a);if(8<a&&g.subarray)b.set(g.subarray(f,f+a),c);else for(d=0;d<a;d++)b[c+d]=g[f+d];return a},write:function(a,b,c,d,f,g){if(!d)return 0;a=a.node;a.timestamp=Date.now();if(b.subarray&&
(!a.b||a.b.subarray)){if(g)return a.b=b.subarray(c,c+d),a.g=d;if(0===a.g&&0===f)return a.b=new Uint8Array(b.subarray(c,c+d)),a.g=d;if(f+d<=a.g)return a.b.set(b.subarray(c,c+d),f),d}K.ka(a,f+d);if(a.b.subarray&&b.subarray)a.b.set(b.subarray(c,c+d),f);else for(g=0;g<d;g++)a.b[f+g]=b[c+g];a.g=Math.max(a.g,f+d);return d},A:function(a,b,c){1===c?b+=a.position:2===c&&32768===(a.node.mode&61440)&&(b+=a.node.g);if(0>b)throw new I(G.h);return b},ga:function(a,b,c){K.ka(a.node,b+c);a.node.g=Math.max(a.node.g,
b+c)},ra:function(a,b,c,d,f,g,h){if(32768!==(a.node.mode&61440))throw new I(G.T);c=a.node.b;if(h&2||c.buffer!==b&&c.buffer!==b.buffer){if(0<f||f+d<a.node.g)c.subarray?c=c.subarray(f,f+d):c=Array.prototype.slice.call(c,f,f+d);a=!0;d=kb(d);if(!d)throw new I(G.va);b.set(c,d)}else a=!1,d=c.byteOffset;return{Qc:d,Kc:a}},ta:function(a,b,c,d,f){if(32768!==(a.node.mode&61440))throw new I(G.T);if(f&2)return 0;K.f.write(a,b,0,d,c,!1);return 0}}},N={O:!1,Ka:function(){N.O=!!process.platform.match(/^win/);var a=
process.binding("constants");a.fs&&(a=a.fs);N.la={1024:a.O_APPEND,64:a.O_CREAT,128:a.O_EXCL,0:a.O_RDONLY,2:a.O_RDWR,4096:a.O_SYNC,512:a.O_TRUNC,1:a.O_WRONLY}},ha:function(a){return Buffer.Mc?Buffer.from(a):new Buffer(a)},j:function(a){assert(r);return N.createNode(null,"/",N.na(a.Y.root),0)},createNode:function(a,b,c){if(!L(c)&&32768!==(c&61440)&&40960!==(c&61440))throw new I(G.h);a=ib(a,b,c);a.c=N.c;a.f=N.f;return a},na:function(a){try{var b=fs.lstatSync(a);N.O&&(b.mode=b.mode|(b.mode&292)>>2)}catch(c){if(!c.code)throw c;
throw new I(G[c.code]);}return b.mode},l:function(a){for(var b=[];a.parent!==a;)b.push(a.name),a=a.parent;b.push(a.j.Y.root);b.reverse();return Za.apply(null,b)},Ba:function(a){a&=-2656257;var b=0,c;for(c in N.la)a&c&&(b|=N.la[c],a^=c);if(a)throw new I(G.h);return b},c:{o:function(a){a=N.l(a);try{var b=fs.lstatSync(a)}catch(c){if(!c.code)throw c;throw new I(G[c.code]);}N.O&&!b.D&&(b.D=4096);N.O&&!b.blocks&&(b.blocks=(b.size+b.D-1)/b.D|0);return{dev:b.dev,ino:b.ino,mode:b.mode,nlink:b.nlink,uid:b.uid,
gid:b.gid,rdev:b.rdev,size:b.size,atime:b.atime,mtime:b.mtime,ctime:b.ctime,D:b.D,blocks:b.blocks}},i:function(a,b){var c=N.l(a);try{void 0!==b.mode&&(fs.chmodSync(c,b.mode),a.mode=b.mode),void 0!==b.size&&fs.truncateSync(c,b.size)}catch(d){if(!d.code)throw d;throw new I(G[d.code]);}},lookup:function(a,b){var c=H(N.l(a),b);c=N.na(c);return N.createNode(a,b,c)},J:function(a,b,c,d){a=N.createNode(a,b,c,d);b=N.l(a);try{L(a.mode)?fs.mkdirSync(b,a.mode):fs.writeFileSync(b,"",{mode:a.mode})}catch(f){if(!f.code)throw f;
throw new I(G[f.code]);}return a},rename:function(a,b,c){a=N.l(a);b=H(N.l(b),c);try{fs.renameSync(a,b)}catch(d){if(!d.code)throw d;throw new I(G[d.code]);}},unlink:function(a,b){a=H(N.l(a),b);try{fs.unlinkSync(a)}catch(c){if(!c.code)throw c;throw new I(G[c.code]);}},rmdir:function(a,b){a=H(N.l(a),b);try{fs.rmdirSync(a)}catch(c){if(!c.code)throw c;throw new I(G[c.code]);}},readdir:function(a){a=N.l(a);try{return fs.readdirSync(a)}catch(b){if(!b.code)throw b;throw new I(G[b.code]);}},symlink:function(a,
b,c){a=H(N.l(a),b);try{fs.symlinkSync(c,a)}catch(d){if(!d.code)throw d;throw new I(G[d.code]);}},readlink:function(a){var b=N.l(a);try{return b=fs.readlinkSync(b),b=lb.relative(lb.resolve(a.j.Y.root),b)}catch(c){if(!c.code)throw c;throw new I(G[c.code]);}}},f:{open:function(a){var b=N.l(a.node);try{32768===(a.node.mode&61440)&&(a.L=fs.openSync(b,N.Ba(a.flags)))}catch(c){if(!c.code)throw c;throw new I(G[c.code]);}},close:function(a){try{32768===(a.node.mode&61440)&&a.L&&fs.closeSync(a.L)}catch(b){if(!b.code)throw b;
throw new I(G[b.code]);}},read:function(a,b,c,d,f){if(0===d)return 0;try{return fs.readSync(a.L,N.ha(b.buffer),c,d,f)}catch(g){throw new I(G[g.code]);}},write:function(a,b,c,d,f){try{return fs.writeSync(a.L,N.ha(b.buffer),c,d,f)}catch(g){throw new I(G[g.code]);}},A:function(a,b,c){if(1===c)b+=a.position;else if(2===c&&32768===(a.node.mode&61440))try{b+=fs.fstatSync(a.L).size}catch(d){throw new I(G[d.code]);}if(0>b)throw new I(G.h);return b}}};x+=16;x+=16;x+=16;
var mb=null,nb={},O=[],ob=1,P=null,pb=!0,Q={},I=null,jb={};
function R(a,b){a=$a("/",a);b=b||{};if(!a)return{path:"",node:null};var c={ma:!0,$:0},d;for(d in c)void 0===b[d]&&(b[d]=c[d]);if(8<b.$)throw new I(G.S);a=Va(a.split("/").filter(function(a){return!!a}),!1);var f=mb;c="/";for(d=0;d<a.length;d++){var g=d===a.length-1;if(g&&b.parent)break;f=M(f,a[d]);c=H(c,a[d]);f.K&&(!g||g&&b.ma)&&(f=f.K.root);if(!g||b.V)for(g=0;40960===(f.mode&61440);)if(f=qb(c),c=$a(Xa(c),f),f=R(c,{$:b.$}).node,40<g++)throw new I(G.S);}return{path:c,node:f}}
function S(a){for(var b;;){if(a===a.parent)return a=a.j.sa,b?"/"!==a[a.length-1]?a+"/"+b:a+b:a;b=b?a.name+"/"+b:a.name;a=a.parent}}function rb(a,b){for(var c=0,d=0;d<b.length;d++)c=(c<<5)-c+b.charCodeAt(d)|0;return(a+c>>>0)%P.length}function sb(a){var b=rb(a.parent.id,a.name);a.G=P[b];P[b]=a}function M(a,b){var c;if(c=(c=tb(a,"x"))?c:a.c.lookup?0:G.P)throw new I(c,a);for(c=P[rb(a.id,b)];c;c=c.G){var d=c.name;if(c.parent.id===a.id&&d===b)return c}return a.c.lookup(a,b)}
function ib(a,b,c,d){ub||(ub=function(a,b,c,d){a||(a=this);this.parent=a;this.j=a.j;this.K=null;this.id=ob++;this.name=b;this.mode=c;this.c={};this.f={};this.rdev=d},ub.prototype={},Object.defineProperties(ub.prototype,{read:{get:function(){return 365===(this.mode&365)},set:function(a){a?this.mode|=365:this.mode&=-366}},write:{get:function(){return 146===(this.mode&146)},set:function(a){a?this.mode|=146:this.mode&=-147}},Fa:{get:function(){return L(this.mode)}},Ea:{get:function(){return 8192===(this.mode&
61440)}}}));a=new ub(a,b,c,d);sb(a);return a}function L(a){return 16384===(a&61440)}var vb={r:0,rs:1052672,"r+":2,w:577,wx:705,xw:705,"w+":578,"wx+":706,"xw+":706,a:1089,ax:1217,xa:1217,"a+":1090,"ax+":1218,"xa+":1218};function wb(a){var b=["r","w","rw"][a&3];a&512&&(b+="w");return b}function tb(a,b){if(pb)return 0;if(-1===b.indexOf("r")||a.mode&292){if(-1!==b.indexOf("w")&&!(a.mode&146)||-1!==b.indexOf("x")&&!(a.mode&73))return G.P}else return G.P;return 0}
function xb(a,b){try{return M(a,b),G.ba}catch(c){}return tb(a,"wx")}function yb(a){var b=4096;for(a=a||0;a<=b;a++)if(!O[a])return a;throw new I(G.ua);}function zb(a,b){Ab||(Ab=function(){},Ab.prototype={},Object.defineProperties(Ab.prototype,{object:{get:function(){return this.node},set:function(a){this.node=a}}}));var c=new Ab,d;for(d in a)c[d]=a[d];a=c;b=yb(b);a.fd=b;return O[b]=a}var hb={open:function(a){a.f=nb[a.node.rdev].f;a.f.open&&a.f.open(a)},A:function(){throw new I(G.M);}};
function cb(a,b){nb[a]={f:b}}function Bb(a,b){var c="/"===b,d=!b;if(c&&mb)throw new I(G.R);if(!c&&!d){var f=R(b,{ma:!1});b=f.path;f=f.node;if(f.K)throw new I(G.R);if(!L(f.mode))throw new I(G.da);}b={type:a,Y:{},sa:b,Ga:[]};a=a.j(b);a.j=b;b.root=a;c?mb=a:f&&(f.K=b,f.j&&f.j.Ga.push(b))}function Cb(a,b,c){var d=R(a,{parent:!0}).node;a=Ya(a);if(!a||"."===a||".."===a)throw new I(G.h);var f=xb(d,a);if(f)throw new I(f);if(!d.c.J)throw new I(G.F);return d.c.J(d,a,b,c)}
function T(a,b){return Cb(a,(void 0!==b?b:511)&1023|16384,0)}function Db(a,b,c){"undefined"===typeof c&&(c=b,b=438);return Cb(a,b|8192,c)}function Eb(a,b){if(!$a(a))throw new I(G.u);var c=R(b,{parent:!0}).node;if(!c)throw new I(G.u);b=Ya(b);var d=xb(c,b);if(d)throw new I(d);if(!c.c.symlink)throw new I(G.F);return c.c.symlink(c,b,a)}
function Fb(a){var b=R(a,{parent:!0}).node,c=Ya(a),d=M(b,c);a:{try{var f=M(b,c)}catch(h){f=h.v;break a}var g=tb(b,"wx");f=g?g:L(f.mode)?G.I:0}if(f)throw new I(f);if(!b.c.unlink)throw new I(G.F);if(d.K)throw new I(G.R);try{Q.willDeletePath&&Q.willDeletePath(a)}catch(h){console.log("FS.trackingDelegate['willDeletePath']('"+a+"') threw an exception: "+h.message)}b.c.unlink(b,c);b=rb(d.parent.id,d.name);if(P[b]===d)P[b]=d.G;else for(b=P[b];b;){if(b.G===d){b.G=d.G;break}b=b.G}try{if(Q.onDeletePath)Q.onDeletePath(a)}catch(h){console.log("FS.trackingDelegate['onDeletePath']('"+
a+"') threw an exception: "+h.message)}}function qb(a){a=R(a).node;if(!a)throw new I(G.u);if(!a.c.readlink)throw new I(G.h);return $a(S(a.parent),a.c.readlink(a))}function Gb(a,b){var c;"string"===typeof a?c=R(a,{V:!0}).node:c=a;if(!c.c.i)throw new I(G.F);c.c.i(c,{mode:b&4095|c.mode&-4096,timestamp:Date.now()})}
function U(a,b,c,d){if(""===a)throw new I(G.u);if("string"===typeof b){var f=vb[b];if("undefined"===typeof f)throw Error("Unknown file open mode: "+b);b=f}c=b&64?("undefined"===typeof c?438:c)&4095|32768:0;if("object"===typeof a)var g=a;else{a=Wa(a);try{g=R(a,{V:!(b&131072)}).node}catch(p){}}f=!1;if(b&64)if(g){if(b&128)throw new I(G.ba);}else g=Cb(a,c,0),f=!0;if(!g)throw new I(G.u);8192===(g.mode&61440)&&(b&=-513);if(b&65536&&!L(g.mode))throw new I(G.da);if(!f){var h=g?40960===(g.mode&61440)?G.S:
L(g.mode)&&("r"!==wb(b)||b&512)?G.I:tb(g,wb(b)):G.u;if(h)throw new I(h);}if(b&512){c=g;var m;"string"===typeof c?m=R(c,{V:!0}).node:m=c;if(!m.c.i)throw new I(G.F);if(L(m.mode))throw new I(G.I);if(32768!==(m.mode&61440))throw new I(G.h);if(c=tb(m,"w"))throw new I(c);m.c.i(m,{size:0,timestamp:Date.now()})}b&=-641;d=zb({node:g,path:S(g),flags:b,seekable:!0,position:0,f:g.f,La:[],error:!1},d);d.f.open&&d.f.open(d);!e.logReadFiles||b&1||(Hb||(Hb={}),a in Hb||(Hb[a]=1,h("read file: "+a)));try{Q.onOpenFile&&
(h=0,1!==(b&2097155)&&(h|=1),0!==(b&2097155)&&(h|=2),Q.onOpenFile(a,h))}catch(p){console.log("FS.trackingDelegate['onOpenFile']('"+a+"', flags) threw an exception: "+p.message)}return d}function Ib(a){if(null===a.fd)throw new I(G.s);a.W&&(a.W=null);try{a.f.close&&a.f.close(a)}catch(b){throw b;}finally{O[a.fd]=null}a.fd=null}function Jb(a,b,c){if(null===a.fd)throw new I(G.s);if(!a.seekable||!a.f.A)throw new I(G.M);a.position=a.f.A(a,b,c);a.La=[]}
function Kb(a,b,c,d,f,g){if(0>d||0>f)throw new I(G.h);if(null===a.fd)throw new I(G.s);if(0===(a.flags&2097155))throw new I(G.s);if(L(a.node.mode))throw new I(G.I);if(!a.f.write)throw new I(G.h);a.flags&1024&&Jb(a,0,2);var h="undefined"!==typeof f;if(!h)f=a.position;else if(!a.seekable)throw new I(G.M);b=a.f.write(a,b,c,d,f,g);h||(a.position+=b);try{if(a.path&&Q.onWriteToFile)Q.onWriteToFile(a.path)}catch(m){console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: "+m.message)}return b}
function Lb(){I||(I=function(a,b){this.node=b;this.Ja=function(a){this.v=a;for(var b in G)if(G[b]===a){this.code=b;break}};this.Ja(a);this.message=Ta[a];this.stack&&Object.defineProperty(this,"stack",{value:Error().stack,writable:!0})},I.prototype=Error(),I.prototype.constructor=I,[G.u].forEach(function(a){jb[a]=new I(a);jb[a].stack="<generic error, no stack>"}))}var Mb;function Nb(a,b){var c=0;a&&(c|=365);b&&(c|=146);return c}
function Ob(a,b,c,d){a=H("string"===typeof a?a:S(a),b);return T(a,Nb(c,d))}function Pb(a,b){a="string"===typeof a?a:S(a);for(b=b.split("/").reverse();b.length;){var c=b.pop();if(c){var d=H(a,c);try{T(d)}catch(f){}a=d}}return d}function Qb(a,b,c,d){a=H("string"===typeof a?a:S(a),b);c=Nb(c,d);return Cb(a,(void 0!==c?c:438)&4095|32768,0)}
function Rb(a,b,c,d,f,g){a=b?H("string"===typeof a?a:S(a),b):a;d=Nb(d,f);f=Cb(a,(void 0!==d?d:438)&4095|32768,0);if(c){if("string"===typeof c){a=Array(c.length);b=0;for(var h=c.length;b<h;++b)a[b]=c.charCodeAt(b);c=a}Gb(f,d|146);a=U(f,"w");Kb(a,c,0,c.length,0,g);Ib(a);Gb(f,d)}return f}
function V(a,b,c,d){a=H("string"===typeof a?a:S(a),b);b=Nb(!!c,!!d);V.qa||(V.qa=64);var f=V.qa++<<8|0;cb(f,{open:function(a){a.seekable=!1},close:function(){d&&d.buffer&&d.buffer.length&&d(10)},read:function(a,b,d,f){for(var g=0,h=0;h<f;h++){try{var m=c()}catch(Ia){throw new I(G.B);}if(void 0===m&&0===g)throw new I(G.aa);if(null===m||void 0===m)break;g++;b[d+h]=m}g&&(a.node.timestamp=Date.now());return g},write:function(a,b,c,f){for(var g=0;g<f;g++)try{d(b[c+g])}catch(B){throw new I(G.B);}f&&(a.node.timestamp=
Date.now());return g}});return Db(a,b,f)}function Sb(a,b,c){a=H("string"===typeof a?a:S(a),b);return Eb(c,a)}
function Tb(a){if(a.Ea||a.Fa||a.link||a.b)return!0;var b=!0;if("undefined"!==typeof XMLHttpRequest)throw Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");if(e.read)try{a.b=eb(e.read(a.url)),a.g=a.b.length}catch(c){b=!1}else throw Error("Cannot load without read() or XMLHttpRequest.");b||Ua(G.B);return b}
function Ub(a,b,c,d,f){function g(){this.X=!1;this.N=[]}g.prototype.get=function(a){if(!(a>this.length-1||0>a)){var b=a%this.chunkSize;return this.pa(a/this.chunkSize|0)[b]}};g.prototype.Ia=function(a){this.pa=a};g.prototype.ia=function(){var a=new XMLHttpRequest;a.open("HEAD",c,!1);a.send(null);if(!(200<=a.status&&300>a.status||304===a.status))throw Error("Couldn't load "+c+". Status: "+a.status);var b=Number(a.getResponseHeader("Content-length")),d,f=(d=a.getResponseHeader("Accept-Ranges"))&&"bytes"===
d;a=(d=a.getResponseHeader("Content-Encoding"))&&"gzip"===d;var g=1048576;f||(g=b);var h=this;h.Ia(function(a){var d=a*g,f=(a+1)*g-1;f=Math.min(f,b-1);if("undefined"===typeof h.N[a]){var m=h.N;if(d>f)throw Error("invalid range ("+d+", "+f+") or no bytes requested!");if(f>b-1)throw Error("only "+b+" bytes available! programmer error!");var p=new XMLHttpRequest;p.open("GET",c,!1);b!==g&&p.setRequestHeader("Range","bytes="+d+"-"+f);"undefined"!=typeof Uint8Array&&(p.responseType="arraybuffer");p.overrideMimeType&&
p.overrideMimeType("text/plain; charset=x-user-defined");p.send(null);if(!(200<=p.status&&300>p.status||304===p.status))throw Error("Couldn't load "+c+". Status: "+p.status);d=void 0!==p.response?new Uint8Array(p.response||[]):eb(p.responseText||"");m[a]=d}if("undefined"===typeof h.N[a])throw Error("doXHR failed!");return h.N[a]});if(a||!b)g=b=1,g=b=this.pa(0).length,console.log("LazyFiles on gzip forces download of the whole file when length is accessed");this.ya=b;this.wa=g;this.X=!0};if("undefined"!==
typeof XMLHttpRequest){if(!q)throw"Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";var h=new g;Object.defineProperties(h,{length:{get:function(){this.X||this.ia();return this.ya}},chunkSize:{get:function(){this.X||this.ia();return this.wa}}});var m=void 0}else m=c,h=void 0;var p=Qb(a,b,d,f);h?p.b=h:m&&(p.b=null,p.url=m);Object.defineProperties(p,{g:{get:function(){return this.b.length}}});var v={};Object.keys(p.f).forEach(function(a){var b=
p.f[a];v[a]=function(){if(!Tb(p))throw new I(G.B);return b.apply(null,arguments)}});v.read=function(a,b,c,d,f){if(!Tb(p))throw new I(G.B);a=a.node.b;if(f>=a.length)return 0;d=Math.min(a.length-f,d);assert(0<=d);if(a.slice)for(var g=0;g<d;g++)b[c+g]=a[f+g];else for(g=0;g<d;g++)b[c+g]=a.get(f+g);return d};p.f=v;return p}
function Vb(a,b,c,d,f,g,h,m,p,v){function B(c){function B(c){v&&v();m||Rb(a,b,c,d,f,p);g&&g();Ra()}var J=!1;e.preloadPlugins.forEach(function(a){!J&&a.canHandle(Z)&&(a.handle(c,Z,B,function(){h&&h();Ra()}),J=!0)});J||B(c)}Browser.Pc();var Z=b?$a(H(a,b)):a;Qa();"string"==typeof c?Browser.Lc(c,function(a){B(a)},h):B(c)}var FS={},ub,Ab,Hb,W=0;function X(){W+=4;return A[W-4>>2]}function Y(){var a=O[X()];if(!a)throw new I(G.s);return a}function Wb(a){return Math.pow(2,a)}
function Xb(a){return Math.log(a)/Math.LN10}Lb();P=Array(4096);Bb(K,"/");T("/tmp");T("/home");T("/home/web_user");
(function(){T("/dev");cb(259,{read:function(){return 0},write:function(a,b,f,g){return g}});Db("/dev/null",259);bb(1280,fb);bb(1536,gb);Db("/dev/tty",1280);Db("/dev/tty1",1536);if("undefined"!==typeof crypto){var a=new Uint8Array(1);var b=function(){crypto.getRandomValues(a);return a[0]}}else r?b=function(){return require("crypto").randomBytes(1)[0]}:b=function(){u("random_device")};V("/dev","random",b);V("/dev","urandom",b);T("/dev/shm");T("/dev/shm/tmp")})();T("/proc");T("/proc/self");T("/proc/self/fd");
Bb({j:function(){var a=ib("/proc/self","fd",16895,73);a.c={lookup:function(a,c){var b=O[+c];if(!b)throw new I(G.s);a={parent:null,j:{sa:"fake"},c:{readlink:function(){return b.path}}};return a.parent=a}};return a}},"/proc/self/fd");
Ja.unshift(function(){if(!e.noFSInit&&!Mb){assert(!Mb,"FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");Mb=!0;Lb();e.stdin=e.stdin;e.stdout=e.stdout;e.stderr=e.stderr;e.stdin?V("/dev","stdin",e.stdin):Eb("/dev/tty","/dev/stdin");e.stdout?V("/dev","stdout",null,e.stdout):Eb("/dev/tty","/dev/stdout");e.stderr?V("/dev","stderr",null,e.stderr):Eb("/dev/tty1","/dev/stderr");var a=
U("/dev/stdin","r");assert(0===a.fd,"invalid handle for stdin ("+a.fd+")");a=U("/dev/stdout","w");assert(1===a.fd,"invalid handle for stdout ("+a.fd+")");a=U("/dev/stderr","w");assert(2===a.fd,"invalid handle for stderr ("+a.fd+")")}});Ka.push(function(){pb=!1});La.push(function(){Mb=!1;var a=e._fflush;a&&a(0);for(a=0;a<O.length;a++){var b=O[a];b&&Ib(b)}});e.FS_createFolder=Ob;e.FS_createPath=Pb;e.FS_createDataFile=Rb;e.FS_createPreloadedFile=Vb;e.FS_createLazyFile=Ub;e.FS_createLink=Sb;
e.FS_createDevice=V;e.FS_unlink=Fb;Ja.unshift(function(){});La.push(function(){});if(r){var fs=require("fs"),lb=require("path");N.Ka()}C=fa(4);za=Aa=ha(x);Ba=za+Ea;Ca=ha(Ba);A[C>>2]=Ca;ya=!0;function eb(a){for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);55296<=d&&57343>=d&&(d=65536+((d&1023)<<10)|a.charCodeAt(++c)&1023);127>=d?++b:b=2047>=d?b+2:65535>=d?b+3:2097151>=d?b+4:67108863>=d?b+5:b+6}b=Array(b+1);a=pa(a,b,0,b.length);b.length=a;return b}e.wasmTableSize=213;e.wasmMaxTableSize=213;
e.za={};
e.Aa={abort:u,enlargeMemory:function(){Da()},getTotalMemory:function(){return D},abortOnCannotGrowMemory:Da,___lock:function(){},___setErrNo:Ua,___syscall140:function(a,b){W=b;try{var c=Y();X();var d=X(),f=X(),g=X();Jb(c,d,g);A[f>>2]=c.position;c.W&&0===d&&0===g&&(c.W=null);return 0}catch(h){return"undefined"!==typeof FS&&h instanceof I||u(h),-h.v}},___syscall145:function(a,b){W=b;try{var c=Y(),d=X();a:{var f=X();for(b=a=0;b<f;b++){var g=A[d+(8*b+4)>>2],h=c,m=A[d+8*b>>2],p=g,v=void 0,B=oa;if(0>p||
0>v)throw new I(G.h);if(null===h.fd)throw new I(G.s);if(1===(h.flags&2097155))throw new I(G.s);if(L(h.node.mode))throw new I(G.I);if(!h.f.read)throw new I(G.h);var Z="undefined"!==typeof v;if(!Z)v=h.position;else if(!h.seekable)throw new I(G.M);var Ia=h.f.read(h,B,m,p,v);Z||(h.position+=Ia);var na=Ia;if(0>na){var J=-1;break a}a+=na;if(na<g)break}J=a}return J}catch(Ha){return"undefined"!==typeof FS&&Ha instanceof I||u(Ha),-Ha.v}},___syscall146:function(a,b){W=b;try{var c=Y(),d=X();a:{var f=X();for(b=
a=0;b<f;b++){var g=Kb(c,oa,A[d+8*b>>2],A[d+(8*b+4)>>2],void 0);if(0>g){var h=-1;break a}a+=g}h=a}return h}catch(m){return"undefined"!==typeof FS&&m instanceof I||u(m),-m.v}},___syscall221:function(a,b){W=b;try{var c=Y();switch(X()){case 0:var d=X();return 0>d?-G.h:U(c.path,c.flags,0,d).fd;case 1:case 2:return 0;case 3:return c.flags;case 4:return d=X(),c.flags|=d,0;case 12:case 12:return d=X(),va[d+0>>1]=2,0;case 13:case 14:case 13:case 14:return 0;case 16:case 8:return-G.h;case 9:return Ua(G.h),
-1;default:return-G.h}}catch(f){return"undefined"!==typeof FS&&f instanceof I||u(f),-f.v}},___syscall5:function(a,b){W=b;try{var c=sa(X()),d=X(),f=X();return U(c,d,f).fd}catch(g){return"undefined"!==typeof FS&&g instanceof I||u(g),-g.v}},___syscall54:function(a,b){W=b;try{var c=Y(),d=X();switch(d){case 21509:case 21505:return c.tty?0:-G.C;case 21510:case 21511:case 21512:case 21506:case 21507:case 21508:return c.tty?0:-G.C;case 21519:if(!c.tty)return-G.C;var f=X();return A[f>>2]=0;case 21520:return c.tty?
-G.h:-G.C;case 21531:a=f=X();if(!c.f.Da)throw new I(G.C);return c.f.Da(c,d,a);case 21523:return c.tty?0:-G.C;case 21524:return c.tty?0:-G.C;default:u("bad ioctl syscall "+d)}}catch(g){return"undefined"!==typeof FS&&g instanceof I||u(g),-g.v}},___syscall6:function(a,b){W=b;try{var c=Y();Ib(c);return 0}catch(d){return"undefined"!==typeof FS&&d instanceof I||u(d),-d.v}},___unlock:function(){},_ems_request_file:function(a){var b=window.ScriptNodePlayer.getInstance();if(b.isReady())return b._fileRequestCallback(a);
window.console.log("error: ems_request_file not ready")},_emscripten_memcpy_big:function(a,b,c){y.set(y.subarray(b,b+c),a);return a},_llvm_exp2_f64:function(){return Wb.apply(null,arguments)},_llvm_log10_f64:function(){return Xb.apply(null,arguments)},_llvm_trap:function(){u("trap!")},DYNAMICTOP_PTR:C,STACKTOP:Aa};var Yb=e.asm(e.za,e.Aa,buffer);e.asm=Yb;e.___errno_location=function(){return e.asm.___errno_location.apply(null,arguments)};
e._emu_compute_audio_samples=function(){return e.asm._emu_compute_audio_samples.apply(null,arguments)};e._emu_get_audio_buffer=function(){return e.asm._emu_get_audio_buffer.apply(null,arguments)};e._emu_get_audio_buffer_length=function(){return e.asm._emu_get_audio_buffer_length.apply(null,arguments)};e._emu_get_current_position=function(){return e.asm._emu_get_current_position.apply(null,arguments)};e._emu_get_max_position=function(){return e.asm._emu_get_max_position.apply(null,arguments)};
e._emu_get_sample_rate=function(){return e.asm._emu_get_sample_rate.apply(null,arguments)};e._emu_get_track_info=function(){return e.asm._emu_get_track_info.apply(null,arguments)};e._emu_load_file=function(){return e.asm._emu_load_file.apply(null,arguments)};e._emu_seek_position=function(){return e.asm._emu_seek_position.apply(null,arguments)};e._emu_set_boost=function(){return e.asm._emu_set_boost.apply(null,arguments)};
e._emu_set_resource_path=function(){return e.asm._emu_set_resource_path.apply(null,arguments)};e._emu_set_subsong=function(){return e.asm._emu_set_subsong.apply(null,arguments)};e._emu_teardown=function(){return e.asm._emu_teardown.apply(null,arguments)};e._free=function(){return e.asm._free.apply(null,arguments)};
var kb=e._malloc=function(){return e.asm._malloc.apply(null,arguments)},ma=e.stackAlloc=function(){return e.asm.stackAlloc.apply(null,arguments)},la=e.stackRestore=function(){return e.asm.stackRestore.apply(null,arguments)},ka=e.stackSave=function(){return e.asm.stackSave.apply(null,arguments)};e.dynCall_v=function(){return e.asm.dynCall_v.apply(null,arguments)};e.dynCall_vi=function(){return e.asm.dynCall_vi.apply(null,arguments)};e.asm=Yb;
e.ccall=function(a,b,c,d){var f=e["_"+a];assert(f,"Cannot call unknown function "+a+", make sure it is exported");var g=[];a=0;if(d)for(var h=0;h<d.length;h++){var m=ra[c[h]];m?(0===a&&(a=ka()),g[h]=m(d[h])):g[h]=d[h]}c=f.apply(null,g);c="string"===b?sa(c):"boolean"===b?!!c:c;0!==a&&la(a);return c};e.getMemory=function(a){if(ya)if(Na)var b=kb(a);else{b=A[C>>2];a=b+a+15&-16;A[C>>2]=a;if(a=a>=D)Da(),a=!0;a&&(A[C>>2]=b,b=0)}else b=fa(a);return b};e.Pointer_stringify=sa;e.UTF8ToString=ta;
e.addRunDependency=Qa;e.removeRunDependency=Ra;e.FS_createFolder=Ob;e.FS_createPath=Pb;e.FS_createDataFile=Rb;e.FS_createPreloadedFile=Vb;e.FS_createLazyFile=Ub;e.FS_createLink=Sb;e.FS_createDevice=V;e.FS_unlink=Fb;F=function Zb(){e.calledRun||$b();e.calledRun||(F=Zb)};
function $b(){function a(){if(!e.calledRun&&(e.calledRun=!0,!ja)){Na||(Na=!0,Fa(Ja));Fa(Ka);if(e.onRuntimeInitialized)e.onRuntimeInitialized();if(e.postRun)for("function"==typeof e.postRun&&(e.postRun=[e.postRun]);e.postRun.length;){var a=e.postRun.shift();Ma.unshift(a)}Fa(Ma)}}if(!(0<E)){if(e.preRun)for("function"==typeof e.preRun&&(e.preRun=[e.preRun]);e.preRun.length;)Oa();Fa(Ga);0<E||e.calledRun||(e.setStatus?(e.setStatus("Running..."),setTimeout(function(){setTimeout(function(){e.setStatus("")},
1);a()},1)):a())}}e.run=$b;function u(a){if(e.onAbort)e.onAbort(a);void 0!==a?(ea(a),w(a),a=JSON.stringify(a)):a="";ja=!0;throw"abort("+a+"). Build with -s ASSERTIONS=1 for more info.";}e.abort=u;if(e.preInit)for("function"==typeof e.preInit&&(e.preInit=[e.preInit]);0<e.preInit.length;)e.preInit.pop()();e.noExitRuntime=!0;$b();
  return {
	Module: Module,  // expose original Module
  };
})(window.spp_backend_state_VGM);
/*
 vgm_adapter.js: Adapts vgmPlay backend to generic WebAudio/ScriptProcessor player.

 version 1.1

 	Copyright (C) 2015-2023 Juergen Wothke




 LICENSE

 This library is free software; you can redistribute it and/or modify it
 under the terms of the GNU General Public License as published by
 the Free Software Foundation; either version 2.1 of the License, or (at
 your option) any later version. This library is distributed in the hope
 that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public
 License along with this library; if not, write to the Free Software
 Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301 USA
*/

class VgmFileMapper extends SimpleFileMapper {
	constructor(module, resourcePath)
	{
		super(module);
		this.resourcePath = resourcePath ?? "";
	}

	mapToVirtualFilename(filename)
	{
		// PlayMOD hack: allow relative names in preload list
		if (this.isResource(filename)) filename = this.resourcePath + filename;
		return super.mapToVirtualFilename(filename);
	}

	registerFileData(pathFilenameArray, data)
	{
		// PlayMOD hack: allow relative names in preload list
		if (this.isResource(pathFilenameArray[1])) pathFilenameArray[0] = this.resourcePath.slice(0, -1);

		return super.registerFileData(pathFilenameArray, data);
	}

	isResource(name)
	{
		return (name == "VGMPlay.ini") || (name == "yrw801.rom");
	}
};


class VgmBackendAdapter extends EmsHEAP16BackendAdapter {
	constructor(resourcePath)
	{
		super(backend_vgmPlay.Module, 2, new VgmFileMapper(backend_vgmPlay.Module, resourcePath));

		this.resourcePath = resourcePath ?? "";

		this.ensureReadyNotification();
	}

	loadMusicData(sampleRate, path, filename, data)
	{
		filename = this._getFilename(path, filename);

		this.Module.ccall('emu_set_resource_path', 'number', ['string'], [this.resourcePath]);

		let ret = this.Module.ccall('emu_load_file', 'number',
							['string', 'number', 'number', 'number', 'number', 'number'],
							[ filename, 0, 0, ScriptNodePlayer.getWebAudioSampleRate(), 1024, false]);

		if (ret == 0)
		{
			this._setupOutputResampling(sampleRate);
		}
		return ret;
	}

	evalTrackOptions(options)
	{
		super.evalTrackOptions(options);

		let boostVolume= (options && options.boostVolume) ? options.boostVolume : 0;
		this.Module.ccall('emu_set_boost', 'number', ['number'], [boostVolume]);

		let id= (options && options.track) ? options.track : 0;
		return this.Module.ccall('emu_set_subsong', 'number', ['number'], [id]);
	}

	getSongInfoMeta()
	{
		return {
			title: String,
			author: String,
			desc: String,
			notes: String,
			program: String,	// deprecated use "system"
			system: String,
			chips: String,
			tracks: Number,
			currentTrack: Number
		};
	}

	unicodeToString(ptr)
	{
		ptr = ptr >> 2;	//32-bit
		let str = '';
		for (let i= 0; i< 255*4; i++) {	// use a limit just in case
			let ch = this.Module.HEAP32[ptr++];
			if (!ch)
			{
				return str;
			}
			str += String.fromCharCode(ch);
		}
	}

	updateSongInfo(filename) {
		let result = this._songInfo;
		
		let numAttr = 6;
		let ret = this.Module.ccall('emu_get_track_info', 'number');

		let array = this.Module.HEAP32.subarray(ret>>2, (ret>>2)+numAttr);
		result.title = this.unicodeToString(array[0]);
		if (!result.title.length) result.title = this._makeTitleFromPath(filename);

		result.author = this.unicodeToString(array[1]);
		result.desc = this.unicodeToString(array[2]);
		result.notes = this.unicodeToString(array[3]);
		result.system = this.unicodeToString(array[4]);
		result.program = result.system;	// deprecated
		result.chips = this.Module.Pointer_stringify(array[5]);
		let t = this.Module.Pointer_stringify(array[6]);
		result.tracks = parseInt(t);
		result.currentTrack = 0;
	}
};


window.VgmBackendAdapter = VgmBackendAdapter;
