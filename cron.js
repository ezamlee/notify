var express = require("express");
var request = require("request");
var cors = require('cors');
var app = express();
var cron = require('node-cron');
var rp = require('request-promise');

function update_data() {
	rp({
			uri: 'https://hst-api.wialon.com/wialon/ajax.html?svc=token/login&params={"token":"0e31585320d29e3db8ca8cbeab99ed5f0D7BE7ABF62C6B2B116939425C9D0537945796ED"}',
			method: "GET",
			header: {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			json: true
		})
		.then((wialonResp) => {
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
			return resources.items[1].tags
		})
		.then((tags) => {
			var result = Object.keys(tags).map(function (key) {
				return tags[key];
			});
			return result
		})
		.then((tagsArray) => {
			var result = tagsArray.map(function (obj) {
				return {
					"name": obj["n"],
					"tag_id": obj["c"],
					"bus": obj["jp"]["bus"],
					"bus_id": obj["jp"]["bus_id"],
					"pnid": obj["jp"]["pnid"]
				}
			})
			return result
		})
		.then((tagsArray) => {
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
						if (!Object.keys(parentData.children).includes(element.tag_id)) {
							parentData.children[element.tag_id] = {
								"bus": element.bus,
								"bus_id": element.bus_id,
								"name": element.name
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
								.then((success) => {}).catch((err) => {})
						}
					}
				}).catch((err) => {})
			})
		})
		.catch((err) => {})
}

cron.schedule('* */5 * * * *', function () {
	update_data();
});

//make listner for each resourc


//server end-point to list all resources
