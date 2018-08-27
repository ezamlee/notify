var conf  = require("../conf/serverconf");

let rp = require('request-promise');

function sessionModule(){
  let lastsid = null;
  let lastUpdate = null;

  return {
    getSession : function(){
      /*
      * response format
      * { sid : sesssion_id ,...   }
      *
      */
      console.log(lastsid);
      console.log(conf)
      return rp({
        method: 'GET',
        url: 'https://hst-api.wialon.com/wialon/ajax.html',
        qs: {
            svc: 'token/login',
            params:`{"token":"${conf.token}"}`
          }
      })
    }
  }
}


module.exports = sessionModule()
