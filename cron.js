var express = require("express");
var request = require("request");
var cors = require('cors');
var app = express();
var cron = require('node-cron');
var rp = require('request-promise');
var conf = require('./publicApiServer/conf/serverconf');
function update_data() {
	rp({
		uri: `https://hst-api.wialon.com/wialon/ajax.html?svc=token/login&params={"token":"0e31585320d29e3db8ca8cbeab99ed5f8FF39C43F147343E1164472619A14ADA69B535B7"}`,
		method: "GET",
		header: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		json: true
	})
		.then((wialonResp) => {
			console.log(wialonResp, wialonResp.eid)
			return wialonResp.eid
		})
		.then((eid) => {
			return rp({
				uri: `https://hst-api.wialon.com/wialon/ajax.html?svc=core/search_items&params={"spec":{"itemsType":"avl_resource","propName":"","propValueMask":"*","sortType":"","propType":"propitemname"},"force":1,"flags":4611686018427387903,"from":0,"to":0}&sid=${eid}`,
				method: "GET",
				header: {
					"Content-Type": "application/json",
					"Accept": "application/json"
				},
				json: true
			})
		})
		.then((resources) => {
			console.log(resources);
			if (resources && resources.items) {
				console.log(resources, resources.items[1])
				return resources.items[1].tags
			}
		})
		.then((tags) => {
			console.log(tags)
			if (tags && typeof tags === 'object') {

				var result = Object.keys(tags).map(function (key) {
					return tags[key];
				});
				return result
			}
		})
		.then((tagsArray) => {
			var result = tagsArray.map(function (obj) {
				return {
					"name": obj["n"],
					"tag_id": obj["c"],
					"bus": obj["jp"]["bus"],
					"bus_id": obj["jp"]["bus_id"],
					"pnid": obj["jp"]["pnid"],
					"id": obj["id"]
				}
			})
			return result
		})
		.then((tagsArray) => {
			console.log(tagsArray)
			tagsArray.forEach((element) => {
				rp({
					uri: `http://localhost:3000/api/parents?filter[where][nid]=${element.pnid}`,
					method: "GET",
					header: {
						"Content-Type": "application/json",
						"Accept": "application/json"
					},
					json: true
				}).then((parentData) => {
					if (parentData.length > 0) {
						parentData = parentData[0];
						console.log(Object.keys(parentData.children, element.tag_id));
						if (!Object.keys(parentData.children).includes(element.tag_id)) {
							parentData.children[element.tag_id] = {
								"bus": element.bus,
								"bus_id": element.bus_id,
								"name": element.name,
								"id": element.id,
								"source": conf.source
							}
							rp({
								uri: `http://localhost:3000/api/parents`,
								method: "PUT",
								header: {
									"Content-Type": "application/json",
									"Accept": "application/json"
								},
								body: parentData,
								json: true
							})
								.then((success) => { }).catch((err) => { })
						}
					}
				}).catch((err) => console.log(err))
			})
		})
		.catch((err) => console.log(err))
}
update_data();
// cron.schedule('* */5 * * * *', function () {
// 	update_data();
// });
