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
          params: `{\n"itemId":${conf.source},\n"id":0,\n"w":${r},\n"callMode":"create",\n"n": "${name} home",\n"d": "${locDesc}",\n"t": 3,\n"tc":16711884,\n"ts":12,\n"f": 48,\n"path":"",\n"p":[{"x": ${parseFloat(locLat)}, "y": ${parseFloat(locLong)}, "r": ${r}}],\n"c": 2566914048,\n"ts":20,\n"min":0,\n"max":18,\n"b":{\n    "min_x":${parseFloat(locLat)},\n    "min_y":${parseFloat(locLong)},\n    "max_x":${parseFloat(locLat)},\n    "max_y":${parseFloat(locLong)},\n    "cen_x":${parseFloat(locLat)},\n    "cen_y":${parseFloat(locLong)}\n    },\n"libId": 0,\n"i": 4294967295\n}`,
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
    ,updateFence: async function(obj) {
      //locDesc , locLat , locLong , id , name ,r
      let id = obj.id           || null;
      let name = obj.name       || null;
      let locLat = obj.locLat   || null;
      let locLong = obj.locLong || null;
      let locDesc = obj.locDesc || null;
      let r = obj.r             || 500;
      mySession = JSON.parse(await session.getSession());
      if (mySession.error) throw "unable to get session please verify token and try again later"
      return rp({
        url:`https://hst-api.wialon.com/wialon/ajax.html?svc=resource/update_zone&params={
        "itemId":${parseInt(conf.source)},
        "id":${parseInt(id)},
        "w":${parseInt(r)},
        "callMode":"update",
        "n": "${name}",
        "d": "${locDesc}ة",
        "t": 3,
        "tc":16711884,
        "ts":12,
        "f": 48,
        "path":"",
        "p":[{"x": ${parseFloat(locLat)}, "y": ${parseFloat(locLong)}, "r": ${parseInt(r)}}],
        "c": 2566914048,
        "ts":20,
        "min":0,
        "max":18,
        "b":{
            "min_x":${parseFloat(locLat)},
            "min_y":${parseFloat(locLong)},
            "max_x":${parseFloat(locLat)},
            "max_y":${parseFloat(locLong)},
            "cen_x":${parseFloat(locLat)},
            "cen_y":${parseFloat(locLong)}
            },
        "libId": 0,
        "i": 4294967295
      }&sid=${mySession.eid}`,
        method: 'GET',
        headers: {'Cache-Control': 'no-cache' }
      })
    }
  }
}

module.exports = fenceModule()
