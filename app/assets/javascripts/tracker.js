  var global_options = {
	debug: true,
    timeout: 5000,
  }
 
  var tracker = {
	user_id: "",
	session_id: "",
	
	setSession: function(){
	  var session_info = this.checkSessionCookie();
	  logit("user_id " + session_info.user_id + " session_id " + session_info.session_id);
	
	  this.user_id = session_info.user_id;
	  this.session_id = session_info.session_id;
	  
	  events.getSessionInfo({"user_id":this.user_id, "session_id":this.session_id});
	  
	},
	
	checkSessionCookie: function(){
		//We will set cookie here
		logit("in checkSessionCookie. checking for user_session cookie");
		var user_session_cookie = docCookies.getItem("user_session")
		
		logit("user_session ="+ user_session_cookie);
		
		if(user_session_cookie != null){
			logit("user_session cookie found.")
			
			var session_cookie_striped = base64.decode(user_session_cookie.replace(/"/g,'')); 
			
			logit("user_session cookie after stripped " + session_cookie_striped);
			
			return JSON.parse(session_cookie_striped);
		}
		
		logit("Cookie not found. :(");
		return {"user_id": "", "session_id": ""};
	}
  }
  
  var events = {
    getSessionInfo: function(params){
	  //request to server
	  request(
	  {
	    api: 'create', 
		method: "POST",
		params: params,
		callback: "getSessionInfo"
	  });
    },
  }

  var eventsCallback = {
	getSessionInfo_callback: function(response){
	  try{
		logit("in getSessionInfo_callback response = "+ response);
		//Set session cookies
	    docCookies.setItem("user_session", JSON.stringify(response), Infinity);
	    
	    logit("user_session cookies has been set");
	
	  }catch(e){
		logit("some problem with the response in function getSessionInfo_callback(), Check whether response is perfect JSON");
	  }
	},
  }

  var request = (function() {

    var httpRequest;
    var callback_method;
	var response_var = "(response)";
	var callback_class = "eventsCallback.";
	var callback_method_postfix = "_callback";

    function sendRequest(options) {
	  var api = options.api;
	  var url = "http://192.168.10.25:3000/tracker/trackers/"+api
	  var method = options.method;
	  var params = options.params;
	  callback_method = options.callback;
	  
	  try{
	    if(params){
		  params = JSON.stringify(params);
  	    }else{
	      logit("no params")	
	    }
	  }catch(e){  }
	
	
      if (window.XMLHttpRequest) { // Mozilla, Safari, ...
        httpRequest = new XMLHttpRequest();
      } else if (window.ActiveXObject) { // IE
        try {
          httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
        } 
        catch (e) {
          try {
            httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
          } 
          catch (e) {}
        }
      }

      if (!httpRequest) {
        logit('Cannot create an XMLHTTP instance');
        return false;
      }

      httpRequest.onreadystatechange = handleContent;
      httpRequest.open(method, url);
	  httpRequest.timeout = global_options.timeout;
	  httpRequest.ontimeout	= timedOut
	
	  if(method.toUpperCase() == "POST"){
		httpRequest.setRequestHeader("Content-type","application/x-www-form-urlencoded");	
        httpRequest.send("params="+params);
      }else{
	    httpRequest.send();
	  }
    };
	
    function handleContent() {
	  try{
        if (httpRequest.readyState === 4) {
          if (httpRequest.status === 200) {
			var response = base64.encode(httpRequest.responseText);
			logit("this is the response" +response);
			eval(callback_class+callback_method+callback_method_postfix+response_var);
	      } else {
            logit("Server Unresponsive");
          }
        }
	  }catch(e){ 
		logit("Something Wrong in function handleContent");
	  }
    };
    
    function timedOut(){
	  logit("timed out!");
	  //What to do if timedout
	  
    };

    return function (options){
	  new sendRequest(options);

    };

  })();

  /*\
  |*|
  |*|  A complete cookies reader/writer framework with full unicode support.
  |*|
  |*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
  |*|
  |*|  This framework is released under the GNU Public License, version 3 or later.
  |*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
  |*|
  |*|  Syntaxes:
  |*|
  |*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
  |*|  * docCookies.getItem(name)
  |*|  * docCookies.removeItem(name[, path], domain)
  |*|  * docCookies.hasItem(name)
  |*|  * docCookies.keys()
  |*|
  \*/
  var docCookies = {
    getItem: function (sKey) {
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },

    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
      if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
      var sExpires = "";
      if (vEnd) {
        switch (vEnd.constructor) {
          case Number:
            sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
            break;
          case String:
            sExpires = "; expires=" + vEnd;
            break;
          case Date:
            sExpires = "; expires=" + vEnd.toUTCString();
          break;
        }
      }
      document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") +   (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
      return true;
    },

    removeItem: function (sKey, sPath, sDomain) {
      if (!sKey || !this.hasItem(sKey)) { return false; }
      document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
      return true;
    },

    hasItem: function (sKey) {
      return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },

    keys: /* optional method: you can safely remove it! */ function () {
      var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
      for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
      return aKeys;
    }
  };

  
  var logit = (function(){
    
    function log(message){
	 console.log(message)
    }   

    return function(message){
	  try{ 
	    if(global_options.debug)
	  	  new log("Error: "+message);
	  }catch(e){} 
    };

  })();
  

  /*
  * Copyright (c) 2010 Nick Galbreath
  * http://code.google.com/p/stringencoders/source/browse/#svn/trunk/javascript
  *
  * Permission is hereby granted, free of charge, to any person
  * obtaining a copy of this software and associated documentation
  * files (the "Software"), to deal in the Software without
  * restriction, including without limitation the rights to use,
  * copy, modify, merge, publish, distribute, sublicense, and/or sell
  * copies of the Software, and to permit persons to whom the
  * Software is furnished to do so, subject to the following
  * conditions:
  *
  * The above copyright notice and this permission notice shall be
  * included in all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
  * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
  * OTHER DEALINGS IN THE SOFTWARE.
  */

  /* base64 encode/decode compatible with window.btoa/atob
  *
  * window.atob/btoa is a Firefox extension to convert binary data (the "b")
  * to base64 (ascii, the "a").
  *
  * It is also found in Safari and Chrome.  It is not available in IE.
  *
  * if (!window.btoa) window.btoa = base64.encode
  * if (!window.atob) window.atob = base64.decode
  *
  * The original spec's for atob/btoa are a bit lacking
  * https://developer.mozilla.org/en/DOM/window.atob
  * https://developer.mozilla.org/en/DOM/window.btoa
  *
  * window.btoa and base64.encode takes a string where charCodeAt is [0,255]
  * If any character is not [0,255], then an DOMException(5) is thrown.
  *
  * window.atob and base64.decode take a base64-encoded string
  * If the input length is not a multiple of 4, or contains invalid characters
  *   then an DOMException(5) is thrown.
  */
 var base64 = {};
 base64.PADCHAR = '=';
 base64.ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  base64.makeDOMException = function() {
    // sadly in FF,Safari,Chrome you can't make a DOMException
    var e, tmp;

    try {
        return new DOMException(DOMException.INVALID_CHARACTER_ERR);
    } catch (tmp) {
        // not available, just passback a duck-typed equiv
        // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error
        // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error/prototype
        var ex = new Error("DOM Exception 5");

        // ex.number and ex.description is IE-specific.
        ex.code = ex.number = 5;
        ex.name = ex.description = "INVALID_CHARACTER_ERR";

        // Safari/Chrome output format
        ex.toString = function() { return 'Error: ' + ex.name + ': ' + ex.message; };
        return ex;
    }
  }

 base64.getbyte64 = function(s,i) {
    // This is oddly fast, except on Chrome/V8.
    //  Minimal or no improvement in performance by using a
    //   object with properties mapping chars to value (eg. 'A': 0)
    var idx = base64.ALPHA.indexOf(s.charAt(i));
    if (idx === -1) {
        throw base64.makeDOMException();
    }
    return idx;
  }

  base64.decode = function(s) {
    // convert to string
    s = '' + s;
    var getbyte64 = base64.getbyte64;
    var pads, i, b10;
    var imax = s.length
    if (imax === 0) {
        return s;
    }

    if (imax % 4 !== 0) {
        throw base64.makeDOMException();
    }

    pads = 0
    if (s.charAt(imax - 1) === base64.PADCHAR) {
        pads = 1;
        if (s.charAt(imax - 2) === base64.PADCHAR) {
            pads = 2;
        }
        // either way, we want to ignore this last block
        imax -= 4;
    }

    var x = [];
    for (i = 0; i < imax; i += 4) {
        b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12) |
            (getbyte64(s,i+2) << 6) | getbyte64(s,i+3);
        x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff, b10 & 0xff));
    }

    switch (pads) {
    case 1:
        b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12) | (getbyte64(s,i+2) << 6);
        x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff));
        break;
    case 2:
        b10 = (getbyte64(s,i) << 18) | (getbyte64(s,i+1) << 12);
        x.push(String.fromCharCode(b10 >> 16));
        break;
    }
    return x.join('');
  }

  base64.getbyte = function(s,i) {
    var x = s.charCodeAt(i);
    if (x > 255) {
        throw base64.makeDOMException();
    }
    return x;
  }

  base64.encode = function(s) {
    if (arguments.length !== 1) {
        throw new SyntaxError("Not enough arguments");
    }
    var padchar = base64.PADCHAR;
    var alpha   = base64.ALPHA;
    var getbyte = base64.getbyte;

    var i, b10;
    var x = [];

    // convert to string
    s = '' + s;

    var imax = s.length - s.length % 3;

    if (s.length === 0) {
        return s;
    }
    for (i = 0; i < imax; i += 3) {
        b10 = (getbyte(s,i) << 16) | (getbyte(s,i+1) << 8) | getbyte(s,i+2);
        x.push(alpha.charAt(b10 >> 18));
        x.push(alpha.charAt((b10 >> 12) & 0x3F));
        x.push(alpha.charAt((b10 >> 6) & 0x3f));
        x.push(alpha.charAt(b10 & 0x3f));
    }
    switch (s.length - imax) {
    case 1:
        b10 = getbyte(s,i) << 16;
        x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
               padchar + padchar);
        break;
    case 2:
        b10 = (getbyte(s,i) << 16) | (getbyte(s,i+1) << 8);
        x.push(alpha.charAt(b10 >> 18) + alpha.charAt((b10 >> 12) & 0x3F) +
               alpha.charAt((b10 >> 6) & 0x3f) + padchar);
        break;
    }
    return x.join('');
  }