var express = require("express");
var request = require("request");
var cors = require('cors');
var app = express();
var cron = require('node-cron');
var resources_temp = {
	"units": [],
	"tags": [],
	"geos": []
}
app.use(cors());
var bodyParser = require('body-parser');
var notify = require('./notify.js');
notify.init('127.0.0.1', '27017', 'newDB')
app.use(bodyParser.json());
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
	extended: true
}));
app.listen(13456);

app.post("/register/:channel", function (req, resp) {
	notify.make(req.params.channel, eval("(" + req.body.fn + ")"));
	resp.send("success")
})

//get token
function getToken() {
	return new Promise((resolve, reject) => {
		var options = {
			method: 'GET',
			url: `https://hst-api.wialon.com/wialon/ajax.html?svc=token/login&params={"token":"0e31585320d29e3db8ca8cbeab99ed5f2C93B2C440D72DE3F86013521938F65D2330D0B2"}`,
		}
		request(options, function (error, response, body) {
			if (error) return reject(error)
			else return (resolve(JSON.parse(body).eid))
		})
	})

}

//get/update recources from wialon
function check_avaliable(type, id, name) {
	return new Promise((resolve, reject) => {
		var options = {
			method: 'GET',
			url: `http://localhost:3000/api/sources?filter[where][type]=${type}&filter[where][uniqueID]=${id}`
		};

		request(options, function (error, response, body) {
			if (error) reject(error)
			else {
				if (JSON.parse(body).length < 1) {
					saveInDB(type, id, name)
					var options2 = {
						method: 'POST',
						url: `http://localhost:13456/register/${id}`,
						body: {
							fn: 'function(data){return data}'
						},
						json: true
					};
					request(options2, function (error, response, body) {
						console.log(error, body)
					})
					console.log("true");
					resolve(true)
				} else {
					console.log("False");
					resolve(false)
				}
			}
		});
	})
}

function saveInDB(type, id, name) {
	var request = require("request");

	var options = {
		method: 'PUT',
		url: 'http://localhost:3000/api/sources',
		headers: {
			'accept': 'application/json',
			'content-type': 'application/json'
		},
		body: {
			'type': type,
			'uniqueID': id,
			'data': {
				'name': name
			}
		},
		json: true
	};

	request(options, function (error, response, body) {
		if (error) throw new Error(error);
	});

}

function getUnits(token) {
	return new Promise((resolve, reject) => {
		var options = {
			method: 'GET',
			url: `https://hst-api.wialon.com/wialon/ajax.html?svc=core/search_items&params={"spec":{"itemsType":"avl_unit","propName":"","propValueMask":"*","sortType":"","propType":"propitemname"},"force":1,"flags":4611686018427387903,"from":0,"to":0}&sid=${token}`
		}
		request(options, function (error, response, body) {
			if (error) return reject(error)
			else return resolve(JSON.parse(body).items)
		})
	})
}

function getResc(token) {
	return new Promise((resolve, reject) => {
		var options = {
			method: 'GET',
			url: `https://hst-api.wialon.com/wialon/ajax.html?svc=core/search_items&params={"spec":{"itemsType":"avl_resource","propName":"","propValueMask":"*","sortType":"","propType":"propitemname"},"force":1,"flags":4611686018427387903,"from":0,"to":0}&sid=${token}`
		}
		request(options, function (error, response, body) {
			if (error) return reject(error)
			else return resolve(JSON.parse(body).items)
		})
	})
}

function getUpdateData() {
	getToken().then((newtoken) => {
		getUnits(newtoken).then((items) => {
			if (items.length > 0) {
				items.forEach(function (unit) {
					check_avaliable("unit", unit.id, unit.nm).then((isNewSource) => {})
				});
			}
		}).catch((er) => {
			console.log(er)
		})
		getResc(newtoken).then((items) => {
			if (items.length > 0) {
				items.forEach(function (rc) {
					if (rc.tags) {
						Object.keys(rc.tags).forEach((i) => {
							check_avaliable("tag", rc["tags"][i]["c"], rc["tags"][i]["n"]).then((isNewSource) => {}).catch((er) => {
								console.log(er)
							})
						})
					}
					if (rc.zl) {
						Object.keys(rc.zl).forEach((j) => {
							check_avaliable("geo", rc["nm"] + "-" + rc["zl"][j]["id"], rc["zl"][j]["n"]).then((isNewSource) => {}).catch((er) => {
								console.log(er)
							})
						})
					}
				});
			}
		}).catch((er) => {
			console.log(er)
		})
	}).catch((er) => {
		console.log(er)
	})
}

cron.schedule('*/30 * * * * *', function () {
	getUpdateData();
});

//make listner for each resourc


//server end-point to list all resources
