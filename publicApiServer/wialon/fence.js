var session = require("./session");
let rp      = require('request-promise');
let conf    = require("../conf/serverconf");


function fenceModule() {
  return  {
     createFence: async function(obj) {

      //Extracting Data

      var name    = obj.name    || "no name" ;
      var locLat  = obj.locLat  || 0;
      var locLong = obj.locLong || 0;
      var locDesc = obj.locDesc || "No Description";
      var r       = obj.r       || 0;


      //Get Session
      mySession = JSON.parse(await session.getSession());
      if (mySession.error) throw "unable to get session please verify token and try again later"

      //API to create a geofence
      return rp({
        method: 'GET',
        url: 'https://hst-api.wialon.com/wialon/ajax.html',
        qs: {
          svc: 'resource/update_zone',
          params: `{\n"itemId":${conf.source},\n"id":0,\n"w":500,\n"callMode":"create",\n"n": "${name} home",\n"d": "${locDesc}",\n"t": 3,\n"tc":16711884,\n"ts":12,\n"f": 48,\n"path":"",\n"p":[{"x": ${parseFloat(locLat)}, "y": ${parseFloat(locLong)}, "r": ${r}}],\n"c": 2566914048,\n"ts":20,\n"min":0,\n"max":18,\n"b":{\n    "min_x":${parseFloat(locLat)},\n    "min_y":${parseFloat(locLong)},\n    "max_x":${parseFloat(locLat)},\n    "max_y":${parseFloat(locLong)},\n    "cen_x":${parseFloat(locLat)},\n    "cen_y":${parseFloat(locLong)}\n    },\n"libId": 0,\n"i": 4294967295\n}`,
          sid: `${mySession.eid}`
        },
        headers: {
          'cache-control': 'no-cache'
        }
      })

      /* returned

      [
        4 ,
        {
          "n": "ahmed home",
          "d": "this is trial home",
          "id": 4,
          "f": 48,
          "t": 3,
          "w": 500,
          "e": 8846,
          "c": 2566914048,
          "i": 4294967295,
          "libId": 0,
          "path": "",
          "b": {
            "min_x": 32.1155084257,
            "min_y": -0.00452189180679,
            "max_x": 32.1244915743,
            "max_y": 0.00452189180679,
            "cen_x": 32.12,
            "cen_y": 0
          },
          "ct": 1516503536,
          "mt": 1516503536
        }
      ]
      */
    }
    ,deleteFence: function() {
    }
  }
}

module.exports = fenceModule()
