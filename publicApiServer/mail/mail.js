let conf    = require("../conf/serverconf");
let nodemailer = require('nodemailer');

mailModule function(){
  let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: `${conf.mailUser}`,
        pass: `${conf.mailPass}`
      }
  });

  return{
    sendMessage : function(obj){

      let msg       = obj.msg     || 'no message';
      let html      = obj.html    || '<p>No message </p>'
      let email     = obj.email   || 'null@gmail.com'
      let subject   = obj.subject || 'School Tracking System Administration'

      var message = {
        from: 'schooltrackingsystems@gmail.com',
        to: email,
        subject: subject ,
        text: msg,
        html:html
      };

      transporter.sendMail(message, (error, info) => {
        if (error) throw "Verification mail sending failed";
        console.log(info);
      });
    }
  }
}
module.exports = mailModule();
