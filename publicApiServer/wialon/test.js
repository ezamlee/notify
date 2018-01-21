var fence = require("./fence");
fence.createFence({
    name:"ahmed",
    locLat:32.12,
    locLat:32.12,
    r:500,
    locDesc:"this is trial home"
  })
  .then((data) => console.log("data is: ",data))
  .catch((error) => console.log("error is: ",error));
