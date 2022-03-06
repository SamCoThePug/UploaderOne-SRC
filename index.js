const Keyv = require('keyv');
const {verify} = require('hcaptcha');
const axios = require('axios')
const fastFolderSize = require('fast-folder-size')
const fetch = require('node-fetch');
var session = require('express-session')
const sqlite = require("better-sqlite3");
var fileUpload = require('express-fileupload');
const SqliteStore = require("better-sqlite3-session-store")(session)
const sessdb = new sqlite("sessions.db");
const fs = require('fs')
const Discord=require('discord.js')
var md5 = require('md5');
const crypto = require("crypto");


const Minio = require('minio');
var minioClient = new Minio.Client({
    endPoint: '',
    port: 9000,
    useSSL: false,
    accessKey: '',
    secretKey: ''
});



function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }
  function replaceAll(str, match, replacement){
     return str.replace(new RegExp(escapeRegExp(match), 'g'), ()=>replacement);
  }
function sha1(data) {
    return crypto.createHash("sha1").update(data, "binary").digest("hex");
}

if(typeof String.prototype.replaceAll == "undefined") {
    String.prototype.replaceAll = function(match, replace){
       return this.replace(new RegExp(match, 'g'), () => replace);
    }
}
const dbConf = require("./configuration/database.json")
const keyv = new Keyv(`${dbConf.type}://${dbConf.username}@${dbConf.host}/${dbConf.database}`);
const invites = new Keyv(`${dbConf.type}://${dbConf.username}@${dbConf.host}/${dbConf.database}`, { namespace: 'invites', table:'invites' });
const users = new Keyv(`${dbConf.type}://${dbConf.username}@${dbConf.host}/${dbConf.database}`, { namespace: 'users', table:'users' });
const images = new Keyv(`${dbConf.type}://${dbConf.username}@${dbConf.host}/${dbConf.database}`, { namespace: 'images', table:'images' });
const shorts = new Keyv(`${dbConf.type}://${dbConf.username}@${dbConf.host}/${dbConf.database}`, { namespace: 'shorts', table:'shorts' });
const cdms = new Keyv(`${dbConf.type}://${dbConf.username}@${dbConf.host}/${dbConf.database}`, { namespace: 'changedomains', table:'changedomains' });
const colors = new Keyv(`${dbConf.type}://${dbConf.username}@${dbConf.host}/${dbConf.database}`, { namespace: 'colors', table:'colors' });
const bans = new Keyv(`${dbConf.type}://${dbConf.username}@${dbConf.host}/${dbConf.database}`, { namespace: 'bans', table:'bans' });
const ips = new Keyv(`${dbConf.type}://${dbConf.username}@${dbConf.host}/${dbConf.database}`, { namespace: 'ips', table:'ips' });
const userimgs = new Keyv(`${dbConf.type}://${dbConf.username}@${dbConf.host}/${dbConf.database}`, { namespace: 'userimgs', table:'userimgs' });
const groups = new Keyv(`${dbConf.type}://${dbConf.username}@${dbConf.host}/${dbConf.database}`, { namespace: 'groups', table:'groups' })
const discord = new Keyv(`${dbConf.type}://${dbConf.username}@${dbConf.host}/${dbConf.database}`, { namespace: 'discord', table:'discord' })
const emails = new Keyv(`${dbConf.type}://${dbConf.username}@${dbConf.host}/${dbConf.database}`, { namespace: 'email', table:'email' })
let glist = ["Staff","Admin"]
let chars = ["\u200D", "\u200B"]
let emojis = ["%F0%9F%A5%9D", "%F0%9F%8D%8E", "%F0%9F%8D%8A", "%F0%9F%8D%8C", "%F0%9F%93%A3", "%F0%9F%8E%81"]
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
const express = require('express');
const app = express()
app.use(express.urlencoded());
app.set('view engine', 'ejs');
app.set('views', 'site/views')
app.set('trust proxy', 1)
app.use(fileUpload());
app.use(session({
    store: new SqliteStore({
        client: sessdb, 
        expired: {
          clear: true,
          intervalMs: 900000
        }
      }),
    secret: '',
    resave: false,
    saveUninitialized: true,
    cookie: {}
  }))
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
  function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}
function makecolor(length) {
    var result           = '';
    var characters       = 'ABCDEFabcdef0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}


app.use('*', function (req, res, next) {
	console.log(req.header('x-forwarded-for'))
  next()
})
app.enable('trust proxy')

app.get("/privacy", async(req, res) => {
res.render("privacy")
})

app.get("/short/:cd", async(req, res) => {
    let t = await keyv.get(`shortened-${req.params.cd}`)
    if(!t) return res.send("Invalid url");
    res.redirect(`${t}`)
})

app.get("/videos.json", async (req, res) => {
res.sendFile(__dirname + "/videos.json")
})

app.get("/discord", async (req, res)  => {
res.redirect('https://discord.gg/48WHfynJre')
})

app.get("/invite/:invite", async (req, res) => {
if(!req.params.invite) return res.send("You need to specify a invite.");
res.redirect("/panel/register?invite="+req.params.invite)
})

app.get('/uploads/:filename', async (req, res) => {
    let filename = req.params.filename;
minioClient.getObject('uploads', req.params.filename, function(err, dataStream) {
        if (err) {
            res.send("File not found.")
            return;
        }
        dataStream.pipe(res)
      })
})

app.get('/embed/:filename', async (req, res) => {
    let filename = req.params.filename;
minioClient.getObject('uploads', req.params.filename,async function(err, dataStream) {
        if (err) {
            res.send("File not found.")
            return;
        }
	let owner = await images.get("ownernm-"+filename);
        let ps = await users.get("password-"+owner);
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        let tok = md5(uid)
        let color = await colors.get("color-"+tok);
        if(!color) {
                color = "ff0000";
        }
        let desc = await cdms.get("description-"+tok)
        if(!desc) {
                desc = "Uploaded by {{uploader}}"
        }
        desc = desc.replace(/{{uploader}}/g, owner)
        res.render("viewer", {req:req, filename:filename, owner:owner,color:color,desc:desc})

      })
})

app.use('/assets', express.static('site/assets'))
app.use('/assets2', express.static('site/assets/new'))
app.use('/panel/assets', express.static('site/assets/new'))
app.use('/uploads', express.static('uploads'))
app.use("/hpassets", express.static('hpassets'))
app.get("/assets/css/app.min.css", async(req, res) => {
res.sendFile(__dirname + "/site/assets/new/css/app.min.css")
})
app.get("/assets/css/bootstrap.min.css", async(req, res) => {
        res.sendFile(__dirname + "/site/assets/new/css/bootstrap.min.css")
})

app.get("/panel/assets/logo-white.png", async(req, res) => {
	res.sendFile(__dirname + "/site/assets/logo-white.png")
})

app.get('/panel/login', async (req, res) => {
    if(req.session.loggedin == true) {
        res.redirect("/panel/home")
    }else{
        res.render("login", {req:req})
    }
});
app.get('/panel/register', async (req, res) => {
    if(req.session.loggedin == true) {
        res.redirect("/panel/home")
    }else{
        res.render("register", {req:req})
    }
});

app.get('/panel/discord', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
        let uploads = await cdms.get(`uploadcount-${tok}`)
        if(!uploads) {
                uploads = 0;
        }
        let bytes = await cdms.get(`storage-${tok}`)
        if(!bytes) {
                bytes = 0;
        }
	let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
	let invs = await invites.get("usr-"+req.session.username)
        if(!invs) {
                invs = [];
        }
        let invtes = []
        for(let i = 0; i < invs.length; i++) {
                let e = await invites.get(`invite-${invs[i]}`)
                if(e) {
                        invtes.push(`${invs[i]}`)
                }
        }
        let username = await discord.get(`username-${tok}`)
        let pfp = await discord.get(`pfp-${tok}`)
        let did = await discord.get(`userid-${tok}`)

        let discs = {username:username,pfp:pfp,id:did}

        res.render("discord", {req:req, uid:uid,uc:uploads,storage:formatBytes(bytes),invites:invtes,group:grp,discord:discs})
    }else{
        res.redirect("/panel/login")
    }
});
app.get("/panel/setupmail", async(req, res) => {
if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
	axios.get("http://mail.uploader.one:6060/api/createuser?apikey=&username="+encodeURIComponent(req.session.username)).then(resp => {
		res.redirect("/panel/mailsetup")
	})
}else{
        res.redirect("/panel/login")
    }

})

app.get("/panel/choosemail", async(req, res) => {
if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
	if(!req.query.email) return res.redirect("/panel/mailsetup");
        axios.get("http://mail.uploader.one:6060/api/usemail?apikey=&username="+encodeURIComponent(req.session.username)+"&email="+encodeURIComponent(req.query.email)).then(async resp => {
		await emails.set(`who-${req.session.username}`, `${decodeURIComponent(req.query.email)}`);
                res.redirect("/panel/mail")
        })
}else{
        res.redirect("/panel/login")
    }
})
app.get('/panel/mailview', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
        let uploads = await cdms.get(`uploadcount-${tok}`)
        if(!uploads) {
                uploads = 0;
        }
        let bytes = await cdms.get(`storage-${tok}`)
        if(!bytes) {
                bytes = 0;
        }
        let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        let invs = await invites.get("usr-"+req.session.username)
        if(!invs) {
                invs = [];
        }
        let invtes = []
        for(let i = 0; i < invs.length; i++) {
                let e = await invites.get(`invite-${invs[i]}`)
                if(e) {
                        invtes.push(`${invs[i]}`)
                }
        }
        let usrimg = await userimgs.get(`images-${tok}`)
        if(!usrimg) {
        usrimg = []
        }
        let username = await discord.get(`username-${tok}`)
        let pfp = await discord.get(`pfp-${tok}`)
        let did = await discord.get(`userid-${tok}`)
        let discs = {username:username,pfp:pfp,id:did}
        let title = await cdms.get(`title-${tok}`)
        let color = await colors.get("color-"+tok);
        let em = await emails.get(`who-${req.session.username}`)
        if(!em) return res.redirect("/panel/mailsetup");
        if(!color) {
                color = "ff0000";
        }
	if(!req.query.id) return res.redirect("/panel/mail");
        let inbox = (await axios.get("http://mail.uploader.one:6060/api/inbox?apikey=&username="+encodeURIComponent(req.session.username))).data;
	if(!inbox[+req.query.id]) return res.redirect("/panel/mail");
        let descri = await cdms.get(`description-${tok}`)
        res.render("viewmail", {email:em, em:inbox[+req.query.id], imgn:usrimg, req:req, uid:uid,uc:uploads,storage:formatBytes(bytes),invites:invtes,group:grp,discord:discs,cset:{color:color,description:descri,title:title}})
    }else{
        res.redirect("/panel/login")
    }
});

app.get('/panel/mail', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
        let uploads = await cdms.get(`uploadcount-${tok}`)
        if(!uploads) {
                uploads = 0;
        }
        let bytes = await cdms.get(`storage-${tok}`)
        if(!bytes) {
                bytes = 0;
        }
        let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        let invs = await invites.get("usr-"+req.session.username)
        if(!invs) {
                invs = [];
        }
        let invtes = []
        for(let i = 0; i < invs.length; i++) {
                let e = await invites.get(`invite-${invs[i]}`)
                if(e) {
                        invtes.push(`${invs[i]}`)
                }
        }
        let usrimg = await userimgs.get(`images-${tok}`)
        if(!usrimg) {
        usrimg = []
        }
        let username = await discord.get(`username-${tok}`)
        let pfp = await discord.get(`pfp-${tok}`)
        let did = await discord.get(`userid-${tok}`)
        let discs = {username:username,pfp:pfp,id:did}
        let title = await cdms.get(`title-${tok}`)
        let color = await colors.get("color-"+tok);
	let em = await emails.get(`who-${req.session.username}`)
	if(!em) return res.redirect("/panel/mailsetup");
        if(!color) {
                color = "ff0000";
        }
	let inbox = (await axios.get("http://mail.uploader.one:6060/api/inbox?apikey=&username="+encodeURIComponent(req.session.username))).data;
        let descri = await cdms.get(`description-${tok}`)
        res.render("mail", {email:em, inbox:inbox, imgn:usrimg, req:req, uid:uid,uc:uploads,storage:formatBytes(bytes),invites:invtes,group:grp,discord:discs,cset:{color:color,description:descri,title:title}})
    }else{
        res.redirect("/panel/login")
    }
});
app.get('/panel/mailsetup', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
        let uploads = await cdms.get(`uploadcount-${tok}`)
        if(!uploads) {
                uploads = 0;
        }
        let bytes = await cdms.get(`storage-${tok}`)
        if(!bytes) {
                bytes = 0;
        }
        let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        let invs = await invites.get("usr-"+req.session.username)
        if(!invs) {
                invs = [];
        }
        let invtes = []
        for(let i = 0; i < invs.length; i++) {
                let e = await invites.get(`invite-${invs[i]}`)
                if(e) {
                        invtes.push(`${invs[i]}`)
                }
        }
        let usrimg = await userimgs.get(`images-${tok}`)
        if(!usrimg) {
        usrimg = []
        }
        let nimg = []
        for(let i = 0; i < usrimg.length; i++) {
                if(usrimg[i].split(".")[1] == "png") {
                                nimg.push(usrimg[i])
                }
        }
        let username = await discord.get(`username-${tok}`)
        let pfp = await discord.get(`pfp-${tok}`)
        let did = await discord.get(`userid-${tok}`)
        let discs = {username:username,pfp:pfp,id:did}
        let title = await cdms.get(`title-${tok}`)
        let color = await colors.get("color-"+tok);
        if(!color) {
                color = "ff0000";
        }
        let descri = await cdms.get(`description-${tok}`)
        res.render("mailsetup", {imgn:nimg, req:req, uid:uid,uc:uploads,storage:formatBytes(bytes),invites:invtes,group:grp,discord:discs,cset:{color:color,description:descri,title:title}})
    }else{
        res.redirect("/panel/login")
    }
});


app.get('/panel/embed', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
        let uploads = await cdms.get(`uploadcount-${tok}`)
        if(!uploads) {
                uploads = 0;
        }
        let bytes = await cdms.get(`storage-${tok}`)
        if(!bytes) {
                bytes = 0;
        }
        let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        let invs = await invites.get("usr-"+req.session.username)
        if(!invs) {
                invs = [];
        }
        let invtes = []
        for(let i = 0; i < invs.length; i++) {
                let e = await invites.get(`invite-${invs[i]}`)
                if(e) {
                        invtes.push(`${invs[i]}`)
                }
        }
        let usrimg = await userimgs.get(`images-${tok}`)
        if(!usrimg) {
        usrimg = []
        }
        let nimg = []
        for(let i = 0; i < usrimg.length; i++) {
                if(usrimg[i].split(".")[1] == "png") {
				nimg.push(usrimg[i])
                }
        }
        let username = await discord.get(`username-${tok}`)
        let pfp = await discord.get(`pfp-${tok}`)
        let did = await discord.get(`userid-${tok}`)
        let discs = {username:username,pfp:pfp,id:did}
	let title = await cdms.get(`title-${tok}`)
	let color = await colors.get("color-"+tok);
        if(!color) {
                color = "ff0000";
        }
	let descri = await cdms.get(`description-${tok}`)
        res.render("embed", {imgn:nimg, req:req, uid:uid,uc:uploads,storage:formatBytes(bytes),invites:invtes,group:grp,discord:discs,cset:{color:color,description:descri,title:title}})
    }else{
        res.redirect("/panel/login")
    }
});
























app.get('/panel/gallery', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
        let uploads = await cdms.get(`uploadcount-${tok}`)
        if(!uploads) {
                uploads = 0;
        }
        let bytes = await cdms.get(`storage-${tok}`)
        if(!bytes) {
                bytes = 0;
        }
        let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        let invs = await invites.get("usr-"+req.session.username)
        if(!invs) {
                invs = [];
        }
        let invtes = []
        for(let i = 0; i < invs.length; i++) {
                let e = await invites.get(`invite-${invs[i]}`)
                if(e) {
                        invtes.push(`${invs[i]}`)
                }
        }
	let usrimg = await userimgs.get(`images-${tok}`)
	if(!usrimg) {
	usrimg = []
	}
	let nimg = []
	for(let i = 0; i < usrimg.length; i++) {
		if(usrimg[i].split(".")[usrimg[i].split(".").length - 1] == "png") {
	//	await minioClient.getObject('uploads', usrimg[i], function(err, dataStream) {
          //              if(err) {

            //            }else{
                                nimg.push(usrimg[i])
		//		console.log(nimg.length)
              //          }
               // })


		}
	}
        let username = await discord.get(`username-${tok}`)
        let pfp = await discord.get(`pfp-${tok}`)
        let did = await discord.get(`userid-${tok}`)

        let discs = {username:username,pfp:pfp,id:did}
	setTimeout(() => {
        res.render("gallery", {imgn:nimg, req:req, uid:uid,uc:uploads,storage:formatBytes(bytes),invites:invtes,group:grp,discord:discs})
	}, 2000)
    }else{
        res.redirect("/panel/login")
    }
});




function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}





app.get('/delete', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
        let uploads = await cdms.get(`uploadcount-${tok}`)
        if(!uploads) {
                uploads = 0;
        }
        let bytes = await cdms.get(`storage-${tok}`)
        if(!bytes) {
                bytes = 0;
        }
        let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        let invs = await invites.get("usr-"+req.session.username)
        if(!invs) {
                invs = [];
        }
        let invtes = []
        for(let i = 0; i < invs.length; i++) {
                let e = await invites.get(`invite-${invs[i]}`)
                if(e) {
                        invtes.push(`${invs[i]}`)
                }
        }
        let usrimg = await userimgs.get(`images-${tok}`)
        if(!usrimg) {
        usrimg = []
        }
	if(!req.query.img) return res.send("Say image name..");
	if(!usrimg.includes(decodeURIComponent(req.query.img))) return res.send("Not your image lol");
	minioClient.removeObject('uploads', decodeURIComponent(req.query.img),async function(err) {
	if(err) return res.send("Invalid image.");
	await userimgs.set(`images-${tok}`, removeItemOnce((await userimgs.get(`images-${tok}`)), decodeURIComponent(req.query.img)));
	let username = await discord.get(`username-${tok}`)
        let pfp = await discord.get(`pfp-${tok}`)
        let did = await discord.get(`userid-${tok}`)

        let discs = {username:username,pfp:pfp,id:did}
        res.redirect("/panel/gallery")
	})
    }else{
        res.redirect("/panel/login")
    }
});






app.get('/deleteall', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
        let uploads = await cdms.get(`uploadcount-${tok}`)
        if(!uploads) {
                uploads = 0;
        }
        let bytes = await cdms.get(`storage-${tok}`)
        if(!bytes) {
                bytes = 0;
        }
        let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        let invs = await invites.get("usr-"+req.session.username)
        if(!invs) {
                invs = [];
        }
        let invtes = []
        for(let i = 0; i < invs.length; i++) {
                let e = await invites.get(`invite-${invs[i]}`)
                if(e) {
                        invtes.push(`${invs[i]}`)
                }
        }
        let usrimg = await userimgs.get(`images-${tok}`)
        if(!usrimg) {
        usrimg = []
        }
        let nimg = []
        for(let i = 0; i < usrimg.length; i++) {
                if(usrimg[i].split(".")[1] == "png") {

		minioClient.getObject('uploads', usrimg[i], function(err, dataStream) {
        if (err) {
        }else{
        nimg.push(usrimg[i])
        }
      })


                }
        }
        let username = await discord.get(`username-${tok}`)
        let pfp = await discord.get(`pfp-${tok}`)
        let did = await discord.get(`userid-${tok}`)

        let discs = {username:username,pfp:pfp,id:did}
        res.redirect("/panel/gallery")
    }else{
        res.redirect("/panel/login")
    }
});










app.get('/panel/account', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
        let uploads = await cdms.get(`uploadcount-${tok}`)
        if(!uploads) {
                uploads = 0;
        }
        let bytes = await cdms.get(`storage-${tok}`)
        if(!bytes) {
                bytes = 0;
        }
	let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
	let invs = await invites.get("usr-"+req.session.username)
        if(!invs) {
                invs = [];
        }
        let invtes = []
        for(let i = 0; i < invs.length; i++) {
                let e = await invites.get(`invite-${invs[i]}`)
                if(e) {
                        invtes.push(`${invs[i]}`)
                }
        }
        let username = await discord.get(`username-${tok}`)
        let pfp = await discord.get(`pfp-${tok}`)
        let did = await discord.get(`userid-${tok}`)

        let discs = {username:username,pfp:pfp,id:did}
        res.render("account", {req:req, uid:uid,uc:uploads,storage:formatBytes(bytes),invites:invtes,group:grp, discord:discs})
    }else{
        res.redirect("/panel/login")
    }
});
app.get('/panel/invites', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
        let uploads = await cdms.get(`uploadcount-${tok}`)
        if(!uploads) {
                uploads = 0;
        }
        let bytes = await cdms.get(`storage-${tok}`)
        if(!bytes) {
                bytes = 0;
        }
	let invs = await invites.get("usr-"+req.session.username)
        if(!invs) {
                invs = [];
        }
	let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        let invtes = []
	for(let i = 0; i < invs.length; i++) {
                let e = await invites.get(`invite-${invs[i]}`)
                if(e) {
                invtes.push({invite:`${invs[i]}`, used:null})
                }else{
                let et = await invites.get(`invite-used-${invs[i]}`)
                if(et) {
                invtes.push({invite:`${invs[i]}`, used:`${et}`})
                }else{
                    invtes.push({invite:`${invs[i]}`, used:`Invite Revoked.`})
                }
                }
        }
        let username = await discord.get(`username-${tok}`)
        let pfp = await discord.get(`pfp-${tok}`)
        let did = await discord.get(`userid-${tok}`)

        let discs = {username:username,pfp:pfp,id:did}
        res.render("invites", {req:req, uid:uid,uc:uploads,storage:formatBytes(bytes),invites:invtes,group:grp,discord:discs})
    }else{
        res.redirect("/panel/login")
    }
});
app.get('/panel/home', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
	let tok = md5(uid)
	let uploads = await cdms.get(`uploadcount-${tok}`)
	if(!uploads) {
		uploads = 0;
	}
	let bytes = await cdms.get(`storage-${tok}`)
	if(!bytes) {
		bytes = 0;
	}
	let invs = await invites.get("usr-"+req.session.username)
        if(!invs) {
                invs = [];
        }
	let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        let invtes = []
        for(let i = 0; i < invs.length; i++) {
                let e = await invites.get(`invite-${invs[i]}`)
                if(e) {
                        invtes.push(`${invs[i]}`)
                }
        }
        let username = await discord.get(`username-${tok}`)
        let pfp = await discord.get(`pfp-${tok}`)
        let did = await discord.get(`userid-${tok}`)

        let discs = {username:username,pfp:pfp,id:did}
        res.render("home", {req:req, uid:uid,uc:uploads,storage:formatBytes(bytes),invites:invtes,group:grp,discord:discs})
    }else{
        res.redirect("/panel/login")
    }
});


app.get('/panel/beta', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
        let uploads = await cdms.get(`uploadcount-${tok}`)
        if(!uploads) {
                uploads = 0;
        }
        let bytes = await cdms.get(`storage-${tok}`)
        if(!bytes) {
                bytes = 0;
        }
        let invs = await invites.get("usr-"+req.session.username)
        if(!invs) {
                invs = [];
        }
        let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        let invtes = []
        for(let i = 0; i < invs.length; i++) {
                let e = await invites.get(`invite-${invs[i]}`)
                if(e) {
                        invtes.push(`${invs[i]}`)
                }
        }
        let username = await discord.get(`username-${tok}`)
        let pfp = await discord.get(`pfp-${tok}`)
        let did = await discord.get(`userid-${tok}`)

        let discs = {username:username,pfp:pfp,id:did}
        res.render("beta", {req:req, uid:uid,uc:uploads,storage:formatBytes(bytes),invites:invtes,group:grp,discord:discs})
    }else{
        res.redirect("/panel/login")
    }
});



app.get('/admin/invites', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
	let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        if(!req.query.username) return res.send("You need to specify a user.")
        let invs = await invites.get("usr-"+req.query.username)
        if(!invs) {
                invs = [];
        }
	if(grp !== "Admin") return res.redirect("/panel/home");
        let invtes = []
        for(let i = 0; i < invs.length; i++) {
            let e = await invites.get(`invite-${invs[i]}`)
            if(e) {
            invtes.push({invite:`${invs[i]}`, used:null})
            }else{
            let et = await invites.get(`invite-used-${invs[i]}`)
            if(et) {
            invtes.push({invite:`${invs[i]}`, used:`${et}`})
            }else{
                invtes.push({invite:`${invs[i]}`, used:`Invite Revoked.`})
            }
            }
        }
        res.render("admininvites", {req:req, uid:uid,invites:invtes,group:grp, username:`${req.query.username}`})
    }else{
        res.redirect("/panel/login")
    }
});

app.get('/admin/wipe', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
        let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        if(!req.query.username) return res.send("You need to specify a user.")
        let invs = await invites.get("usr-"+req.query.username)
        if(!invs) {
                invs = [];
        }
        if(grp !== "Admin") return res.redirect("/panel/home");
        let invtes = []
        for(let i = 0; i < invs.length; i++) {
            let e = await invites.get(`invite-${invs[i]}`)
            if(e) {
            invtes.push({invite:`${invs[i]}`, used:null})
            await invites.delete(`invite-${invs[i]}`)
	   }else{
            let et = await invites.get(`invite-used-${invs[i]}`)
            if(et) {
	    await invites.delete(`invite-${invs[i]}`)
            }else{
                invtes.push({invite:`${invs[i]}`, used:`Invite Revoked.`})
            }
            }
        }
	res.send("Wiped User Invites.")
    }else{
        res.redirect("/panel/login")
    }
});

app.get('/admin/invctrl', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
	let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        let uploads = await cdms.get(`uploadcount-${tok}`)
        if(!uploads) {
                uploads = 0;
        }
        let bytes = await cdms.get(`storage-${tok}`)
        if(!bytes) {
                bytes = 0;
        }
        let invs = await invites.get("usr-"+req.session.username)
        if(!invs) {
                invs = [];
        }
	if(grp !== "Admin") return res.redirect("/panel/home");
    let invtes = []
        for(let i = 0; i < invs.length; i++) {
                let e = await invites.get(`invite-${invs[i]}`)
                if(e) {
                        invtes.push(`${invs[i]}`)
                }
        }
        res.render("admininvctrl", {req:req, uid:uid,uc:uploads,storage:formatBytes(bytes),invites:invtes,group:grp})
    }else{
        res.redirect("/panel/login")
    }
});





app.get('/admin/ipcontrol', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
	let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        let uploads = await cdms.get(`uploadcount-${tok}`)
        if(!uploads) {
                uploads = 0;
        }
        let bytes = await cdms.get(`storage-${tok}`)
        if(!bytes) {
                bytes = 0;
        }
        let invs = await invites.get("usr-"+req.session.username)
        if(!invs) {
                invs = [];
        }
	if(grp !== "Admin") return res.redirect("/panel/home");
    let invtes = []
        for(let i = 0; i < invs.length; i++) {
                let e = await invites.get(`invite-${invs[i]}`)
                if(e) {
                        invtes.push(`${invs[i]}`)
                }
        }
        res.render("adminip", {req:req, uid:uid,uc:uploads,storage:formatBytes(bytes),invites:invtes,group:grp})
    }else{
        res.redirect("/panel/login")
    }
});





app.get('/admin/userlist', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
	let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        let uploads = await cdms.get(`uploadcount-${tok}`)
        if(!uploads) {
                uploads = 0;
        }
        let bytes = await cdms.get(`storage-${tok}`)
        if(!bytes) {
                bytes = 0;
        }
        let invs = await invites.get("usr-"+req.session.username)
        if(!invs) {
                invs = [];
        }
	if(grp !== "Admin") return res.redirect("/panel/home");
        let invtes = []
        for(let i = 0; i < invs.length; i++) {
                let e = await invites.get(`invite-${invs[i]}`)
                if(e) {
                        invtes.push(`${invs[i]}`)
                }
        }
        let uistotal = await keyv.get("uids")
        let ausrs = []
        for(let i = 0; i < uistotal; i++) {
            let uname = await users.get(`uid-${i + 1}`);
            if(!uname) {

            }else{
                let banned = await bans.get(`banned-${uname}`);
                if(banned) {
                    banned = true;
                }else{
                    banned = false;
                }

                let ubyt = await cdms.get(`storage-${md5(i + 1)}`)
            if(!ubyt) {
                ubyt = 0;
            }
            let uuploads = await cdms.get(`uploadcount-${md5(i + 1)}`)
            if(!uuploads) {
                uuploads = 0;
            }
            let grep = await groups.get("group-"+md5(i + 1))
            if(!grep) {
                grep = "User";
            }
            let ausername = await discord.get(`username-${md5(i + 1)}`)
            let apfp = await discord.get(`pfp-${md5(i + 1)}`)
            let adid = await discord.get(`userid-${md5(i + 1)}`)

            let discs = {username:ausername,pfp:apfp,id:adid}
            ausrs.push({uid:`${i + 1}`, storage:`${formatBytes(ubyt)}`, uploads:uuploads, username:`${uname}`, group:`${grep}`, banned:banned, discord:discs})
            }
            
        }
        //res.json(ausrs)
        res.render("userlist", {req:req, uid:uid,uc:uploads,storage:formatBytes(bytes),invites:invtes,group:grp,users:ausrs})
    }else{
        res.redirect("/panel/login")
    }
});

app.get("/admin/rescue", async(req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        if(req.session.username !== "samcothepug") return res.send("No Access");
        if(!req.query.username) return res.send("You need 2 say a username.");
        if(!req.query.password) return res.send("You need to specify a new password.");
        let pass = md5(decodeURIComponent(req.query.password))
        await users.set("password-"+decodeURIComponent(req.query.username), pass)
        let emb = new Discord.MessageEmbed()
        .setTitle("User token changed:")
        .setDescription("**Moderator:** "+req.session.username+"\n**Username:** "+req.query.username+"\n**New Token:** "+pass)
        .setColor("#fc0303")
        require('./features/discord').getClient().channels.cache.get("883629255634845726").send(emb)
            res.send("The password has been changed.")
    }else{
        res.redirect("/panel/login")
    }
})

app.get('/panel/admin', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let tok = md5(uid)
	let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        let uploads = await cdms.get(`uploadcount-${tok}`)
        if(!uploads) {
                uploads = 0;
        }
        let bytes = await cdms.get(`storage-${tok}`)
        if(!bytes) {
                bytes = 0;
        }
        let invs = await invites.get("usr-"+req.session.username)
        if(!invs) {
                invs = [];
        }
	if(grp !== "Admin" && grp !== "Staff") return res.redirect("/panel/home");
        let invtes = []
        for(let i = 0; i < invs.length; i++) {
                let e = await invites.get(`invite-${invs[i]}`)
                if(e) {
                        invtes.push(`${invs[i]}`)
                }
        }
        res.render("admin", {req:req, uid:uid,uc:uploads,storage:formatBytes(bytes),invites:invtes,group:grp})
    }else{
        res.redirect("/panel/login")
    }
});

app.get('/panel/geninv', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
	let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
	let tok = md5(uid)
	let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
	if(grp !== "Admin" && grp !== "Staff") return res.send("No Access.");
        let code = makeid(5)
        code = md5(code);
	let invs = await invites.get("usr-"+req.session.username)
        if(!invs) {
                invs = [];
        }
	invs.push(`${code}`)
	await invites.set(`usr-${req.session.username}`, invs)
        await invites.set("invite-"+code, `${req.session.username}`)
        let emb = new Discord.MessageEmbed()
        .setTitle("Invite Generated:")
        .setDescription("**Invite:** `https://uploader.one/invite/"+code+"`\n**User:** "+req.session.username)
        .setColor("#fc0303")
        require('./features/discord').getClient().channels.cache.get("883629255634845726").send(emb)
        res.send("Created the invite <code>https://uploader.one/invite/"+code+"</code>")
    }else{
        res.redirect("/panel/login")
    }
});

app.get('/panel/setgrp', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
	let uuid = await users.get("uid-"+decodeURIComponent(req.session.username))
        let tok = md5(uuid)
        let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }

        if(grp !== "Admin") return res.send("No Access.");
        if(!req.query.username) return res.send("Specify Username.");
	if(!req.query.group) return res.send("No Group.");
	let uid = await users.get("uid-"+decodeURIComponent(req.query.username))
	if(req.query.group !== "Admin" && req.query.group !== "Staff" && req.query.group !== "User" && req.query.group !== "VIP" && req.query.group !== "Beta") return res.send("Invalid Group");
	let ut = md5(uid)

	await groups.set(`group-${ut}`, `${req.query.group}`);

        let emb = new Discord.MessageEmbed()
        .setTitle("Group Updated:")
        .setDescription("**UID:** "+uid+" ("+req.query.username+")\n**Group:** "+req.query.group+"\n**Moderator:** "+req.session.username)
        .setColor("#fc0303")
        require('./features/discord').getClient().channels.cache.get("883629255634845726").send(emb)
        res.send("Updated the group for user <code>"+uid+"</code> to <code>"+req.query.group+"</code>")
    }else{
        res.redirect("/panel/login")
    }
});

app.get('/panel/delinv', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
	let uuid = await users.get("uid-"+decodeURIComponent(req.session.username))
        let tok = md5(uuid)
        let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
	if(grp !== "Admin" && grp !== "Staff") return res.send("No access.");
	if(!req.query.invite) return res.send("Specify invite");
    let teeee = await invites.get(`invite-${decodeURIComponent(req.query.invite)}`);
    if(!teeee) return res.send("That invite is invalid.");
	await invites.delete(`invite-${decodeURIComponent(req.query.invite)}`);
        let emb = new Discord.MessageEmbed()
        .setTitle("Invite Deleted:")
        .setDescription("**Invite:** `https://uploader.one/invite/"+req.query.invite+"`\n**User:** "+req.session.username)
        .setColor("#fc0303")
        require('./features/discord').getClient().channels.cache.get("883629255634845726").send(emb)
        res.send("Deleted the invite <code>"+req.query.invite+"</code>")
    }else{
        res.redirect("/panel/login")
    }
});
app.get('/admin/blockip', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
	let uuid = await users.get("uid-"+decodeURIComponent(req.session.username))
        let tok = md5(uuid)
        let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        if(grp !== "Admin") return res.send("No access.");
        if(!req.query.ip) return res.send("Specify IP.");
        await ips.set(`usrs-${md5(sha1(decodeURIComponent(req.query.ip)))}`, [`blocked`,`blocked`,`blocked`]);
        let emb = new Discord.MessageEmbed()
        .setTitle("IP Locked:")
        .setDescription("**IPHash:** "+md5(sha1(decodeURIComponent(req.query.ip)))+"\n**Moderator:** "+req.session.username)
        .setColor("#fc0303")
        require('./features/discord').getClient().channels.cache.get("883629255634845726").send(emb)
        res.send("Locked the IP <code>"+decodeURIComponent(req.query.ip)+"</code>")
    }else{
        res.redirect("/panel/login")
    }
});
app.get('/admin/unblockip', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
	let uuid = await users.get("uid-"+decodeURIComponent(req.session.username))
        let tok = md5(uuid)
        let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        if(grp !== "Admin") return res.send("No access.");
        if(!req.query.ip) return res.send("Specify IP.");
        await ips.delete(`usrs-${md5(sha1(decodeURIComponent(req.query.ip)))}`);
        let emb = new Discord.MessageEmbed()
        .setTitle("IP Unlocked:")
        .setDescription("**IPHash:** "+md5(sha1(decodeURIComponent(req.query.ip)))+"\n**Moderator:** "+req.session.username)
        .setColor("#fc0303")
        require('./features/discord').getClient().channels.cache.get("883629255634845726").send(emb)
        res.send("UnBlocked the IP <code>"+decodeURIComponent(req.query.ip)+"</code>")
    }else{
        res.redirect("/panel/login")
    }
});

app.get('/panel/unbanusr', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
	let uuid = await users.get("uid-"+decodeURIComponent(req.session.username))
        let tok = md5(uuid)
        let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        if(grp !== "Admin" && grp !== "Staff") return res.send("No access.");
        if(!req.query.username) return res.send("Specify username.");
        await bans.delete(`banned-${req.query.username}`);
        let emb = new Discord.MessageEmbed()
        .setTitle("User Unbanned:")
        .setDescription("**User:** "+req.query.username+"\n**Moderator:** "+req.session.username)
        .setColor("#fc0303")
        require('./features/discord').getClient().channels.cache.get("883629255634845726").send(emb)
        res.send("Unbanned the user <code>"+req.query.username+"</code>")
    }else{
        res.redirect("/panel/login")
    }
});
app.get('/panel/banusr', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
	let uuid = await users.get("uid-"+decodeURIComponent(req.session.username))
        let tok = md5(uuid)
        let grp = await groups.get("group-"+tok)
        if(!grp) {
                grp = "User";
        }
        if(grp !== "Admin" && grp !== "Staff") return res.send("No access.");
        if(!req.query.username) return res.send("Specify username.");
	await bans.set(`banned-${req.query.username}`, true);
        let emb = new Discord.MessageEmbed()
        .setTitle("User Banned:")
        .setDescription("**User:** "+req.query.username+"\n**Moderator:** "+req.session.username)
        .setColor("#fc0303")
        require('./features/discord').getClient().channels.cache.get("883629255634845726").send(emb)
        res.send("Banned the user <code>"+req.query.username+"</code>")
    }else{
        res.redirect("/panel/login")
    }
});
app.get('/api/geninv', async (req, res) => {
	if(req.query.token !== "84598439549030") return res.send("Invalid token.");
	if(!req.query.username) return res.send("Give a username");
        let code = makeid(5)
        code = md5(code);
        let invs = await invites.get("usr-"+decodeURIComponent(req.query.username))
        if(!invs) {
                invs = [];
        }
        invs.push(`${code}`)
        await invites.set(`usr-${decodeURIComponent(req.query.username)}`, invs)
        await invites.set("invite-"+code, `${decodeURIComponent(req.query.username)}`)
        let emb = new Discord.MessageEmbed()
        .setTitle("Invite Generated:")
        .setDescription("**Invite:** `https://uploader.one/invite/"+code+"`\n**User:** "+decodeURIComponent(req.query.username))
        .setColor("#fc0303")
        require('./features/discord').getClient().channels.cache.get("883629255634845726").send(emb)
        res.send("Created the invite <code>https://uploader.one/invite/"+code+"</code>")
});



app.get('/panel/seeinv', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
	let invs = await invites.get("usr-"+req.session.username)
	if(!invs) {
		invs = [];
	}
	let invtes = []
	for(let i = 0; i < invs.length; i++) {
		let e = await invites.get(`invite-${invs[i]}`)
		if(e) {
		invtes.push({invite:`${invs[i]}`, used:null})
		}else{
		let et = await invites.get(`invite-used-${invs[i]}`)
		if(et) {
		invtes.push({invite:`${invs[i]}`, used:`${et}`})
		}
		}
	}
	res.json({invites:invtes})
    }else{
        res.redirect("/panel/login")
    }
});

app.get('/panel/config', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
	const data = fs.readFileSync('./sharex.sxcu', 'utf8')
               .replace(/{{username}}/g, decodeURIComponent(req.session.username))
               .replace(/{{token}}/g, ps);
	fs.writeFileSync('./tempuploader.sxcu', `${data}`);
    res.download('./tempuploader.sxcu')
    }else{
        res.redirect("/panel/login")
    }
});

app.get('/panel/changepass', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        if(!req.query.password) return res.send("You need to specify a new password.");
        let pass = md5(decodeURIComponent(req.query.password))
        await users.set("password-"+decodeURIComponent(req.session.username), pass)
        let emb = new Discord.MessageEmbed()
        .setTitle("User token changed:")
        .setDescription("**Username:** "+req.session.username+"\n**Old Token:** "+ps+"\n**New Token:** "+pass)
        .setColor("#fc0303")
        require('./features/discord').getClient().channels.cache.get("883629255634845726").send(emb)
        req.session.destroy(function(err) {
            res.send("Your password has been changed.")
        })
    }else{
        res.redirect("/panel/login")
    }
});

app.get('/panel/setcolor', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
	let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        if(!req.query.color) {
	if(!req.query.colorp) return res.send("Specify a color.");
	}

	if(req.query.color == "reset") {
		await colors.set("color-"+md5(uid), `ff0000`)
		return res.redirect("/panel/home?success=CHEC");
	}
	if(req.query.color) {
	if(req.query.color.startsWith("#")) {
		await colors.set("color-"+md5(uid), `${req.query.color.slice(1)}`)
		return res.redirect("/panel/home?success=CHEC");
	}else{
	await colors.set("color-"+md5(uid), `${req.query.color}`)
	return res.redirect("/panel/home?success=CHEC");
	}
	}else if(req.query.colorp) {
	if(req.query.colorp.startsWith("#")) {
                await colors.set("color-"+md5(uid), `${req.query.colorp.slice(1)}`)
	return res.redirect("/panel/home?success=CHEC");
        }else{
        await colors.set("color-"+md5(uid), `${req.query.colorp}`)
	return res.redirect("/panel/home?success=CHEC");
        }
	}
    }else{
        res.redirect("/panel/login")
    }
});
app.get('/panel/changeembed', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
	let tok = req.session.token
        if(!req.query.color) {
        if(!req.query.colorp) return res.send("Specify a color.");
        }

        if(req.query.color == "reset") {
                await colors.set("color-"+md5(uid), `ff0000`)
        }
        if(req.query.color) {
        if(req.query.color.startsWith("#")) {
                await colors.set("color-"+md5(uid), `${req.query.color.slice(1)}`)
        }else{
        await colors.set("color-"+md5(uid), `${req.query.color}`)
        }
        }else if(req.query.colorp) {
        if(req.query.colorp.startsWith("#")) {
                await colors.set("color-"+md5(uid), `${req.query.colorp.slice(1)}`)
        }else{
        await colors.set("color-"+md5(uid), `${req.query.colorp}`)
        }
        }
	if(!req.query.desc) return res.send("You need to specify a description.");
        if(req.query.desc == "reset") {
                await cdms.delete(`description-${md5(uid)}`)
        }else{
                await cdms.set(`description-${md5(uid)}`, `${decodeURIComponent(req.query.desc)}`)
        }
	if(!req.query.title) return res.send("You need to specify a title.");
        if(req.query.title == "reset") {
                await cdms.delete(`title-${md5(uid)}`)
        }else{
                await cdms.set(`title-${md5(uid)}`, `${decodeURIComponent(req.query.title)}`)
        }
	res.redirect("/panel/home")
    }else{
        res.redirect("/panel/login")
    }
});
app.get('/panel/changedomain', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
	let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
	let tok = md5(uid)
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        if(!req.query.domain) return res.send("You need to specify a new domain.");
	if(req.query.domain == "reset") {
		await cdms.delete(`domain-${tok}`)
		res.redirect("/panel/home?success=CHDM")
	}else{
		await cdms.set(`domain-${tok}`, `${decodeURIComponent(req.query.domain)}`)
		res.redirect("/panel/home?success=CHDM")
	}

    }else{
        res.redirect("/panel/login")
    }
});

app.get('/panel/setfaked', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        let tok = md5(uid)
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
	if(!req.query.fd) return res.send("Specify a fake domain!");
	let fd = await cdms.get(`faked-${tok}`);
	if(req.query.fd == "reset") {
		await cdms.delete(`faked-${tok}`);
		res.redirect("/panel/home?success=TGFD")
	}else{
		await cdms.set(`faked-${tok}`, `${decodeURIComponent(req.query.fd)}`);
		res.redirect("/panel/home?success=TGFD")
	}


    }else{
        res.redirect("/panel/login")
    }
});


app.get('/panel/setdesc', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
	let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        let tok = md5(uid)
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        if(!req.query.desc) return res.send("You need to specify a description.");
        if(req.query.desc == "reset") {
                cdms.delete(`description-${tok}`)
                res.send("Custom description has been reset.")
        }else{
                cdms.set(`description-${tok}`, `${decodeURIComponent(req.query.desc)}`)
                res.send("Custom Description has been set to <code>"+decodeURIComponent(req.query.desc)+"</code>!")
        }

    }else{
        res.redirect("/panel/login")
    }
});

app.get('/panel/toggleemojiurl', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
	let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        let tok = md5(uid)
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let eurl = await cdms.get(`emojiurl-${tok}`);
        if(eurl) {
                cdms.delete(`emojiurl-${tok}`)
                res.send("Emoji URL has been disabled.")
        }else{
                cdms.set(`emojiurl-${tok}`, true)
                res.send("Emoji URL has been enabled.")
        }

    }else{
        res.redirect("/panel/login")
    }
});

app.get('/panel/settitle', async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        let tok = md5(uid)
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        if(!req.query.title) return res.send("You need to specify a title.");
        if(req.query.title == "reset") {
                cdms.delete(`title-${tok}`)
                res.send("Custom title has been reset.")
        }else{
                cdms.set(`title-${tok}`, `${decodeURIComponent(req.query.title)}`)
                res.send("Custom title has been set to <code>"+decodeURIComponent(req.query.title)+"</code>!")
        }

    }else{
        res.redirect("/panel/login")
    }
});


app.get("/auth/logout", async (req, res) => {
    req.session.destroy(function(err) {
        res.redirect("/panel/login")
    })
})
app.post("/auth/login", async (req, res) => {
    if(!req.body.username) return res.redirect("/panel/login");
    if(!req.body.password) return res.redirect("/panel/login");
    let ps = md5(req.body.password)
    let db = await users.get("password-"+decodeURIComponent(req.body.username))
    if(!db) return res.redirect("/panel/login?err=INVUSR");
    console.log("USR: "+req.body.username+"\nPS: "+ps+"\nDB: "+db)
    if(`${db.trim()}` !== `${ps.trim()}`) return res.redirect("/panel/login?err=INVPASS");
    let banned = await bans.get(`banned-${req.body.username}`);
    if(banned) return res.redirect("/panel/login?err=BANNED");
    let uid = await users.get("uid-"+decodeURIComponent(req.body.username))
    let torlist = await axios.get("https://check.torproject.org/torbulkexitlist");
    torlist = torlist.data;
    await users.set("token-"+ps, `${decodeURIComponent(req.body.username)}`)
    await users.set("uid-"+uid, `${decodeURIComponent(req.body.username)}`)
	let usrip = await ips.get(`usrs-${md5(sha1(req.header('x-forwarded-for')))}`)
        if(!usrip) {
                usrip = []
        }
        if(!usrip.includes(`${md5(uid)}`)) {
                usrip.push(`${md5(uid)}`)
        }
        await ips.set(`usrs-${md5(sha1(req.header('x-forwarded-for')))}`, usrip);
	if(torlist.includes(`${req.header('x-forwarded-for')}`)) return res.redirect("/panel/login?err=TOR");
    let ctk = req.body['g-recaptcha-response']
    verify("", ctk).then((data) => {
        if(data.success == true) {
            if(req.body.username !== "samcothepug" && req.body.username !== "system" && req.body.username !== "Cuts" && req.body.username !== "cuts-xo") {
                if(usrip.length > 1) {
                    let emb = new Discord.MessageEmbed()
                    .setTitle("User IP locked:")
                    .setDescription("**Username:** "+req.body.username+"\n**Accounts:** "+usrip.length+"\n**IPHash:** "+md5(sha1(req.header('x-forwarded-for'))))
                    .setColor("#fc0303")
                    require('./features/discord').getClient().channels.cache.get("883629255634845726").send(emb)
                    return res.redirect("/panel/login?err=MULTIACCOUNTS");
                }
                }
                req.session.username = `${req.body.username}`
                req.session.token = `${ps}`
                req.session.loggedin = true
                let emb = new Discord.MessageEmbed()
                    .setTitle("User logged in:")
                    .setDescription("**Username:** "+req.body.username+"\n**Token:** "+ps)
                    .setColor("#fc0303")
                    require('./features/discord').getClient().channels.cache.get("883629255634845726").send(emb)
                res.redirect("/panel/home");
        }else{
            res.redirect("/panel/login?err=CAPTCHA")
        }
    }).catch(err => {
        res.redirect("/panel/login?err=CAPTCHA")
    })
})
app.post("/auth/register", async (req, res) => {
    if(!req.body.username) return res.redirect("/panel/login");
    if(!req.body.password) return res.redirect("/panel/login");
    if(!req.body.invite) return res.redirect("/panel/login");

	let banned = await bans.get(`banned-${req.body.username}`);
    if(banned) return res.redirect("/panel/register?err=BANNED");

    let ps = md5(req.body.password)
    let db = await users.get("password-"+decodeURIComponent(req.body.username))
    if(db) return res.redirect("/panel/register?err=USRINUSE");
    let db2 = await invites.get("invite-"+decodeURIComponent(req.body.invite))
    console.log(db2)
    if(!db2) return res.redirect("/panel/register?err=INVINV");
    if(db2) {
        let uid = +(await keyv.get("uids")) + 1;
        await keyv.set("uids", uid)
        await users.set("password-"+decodeURIComponent(req.body.username), ps)
        await users.set("token-"+ps, `${decodeURIComponent(req.body.username)}`)
        await users.set("uid-"+decodeURIComponent(req.body.username), uid)
	 let torlist = await axios.get("https://check.torproject.org/torbulkexitlist");
    	torlist = torlist.data;
	let usrip = await ips.get(`usrs-${md5(sha1(req.header('x-forwarded-for')))}`)
	if(!usrip) {
		usrip = []
	}
	if(!usrip.includes(`${md5(uid)}`)) {
		usrip.push(`${md5(uid)}`)
	}
	await ips.set(`usrs-${md5(sha1(req.header('x-forwarded-for')))}`, usrip)
	if(torlist.includes(`${req.header('x-forwarded-for')}`)) return res.redirect("/panel/register?err=TOR");

    let ctk = req.body['g-recaptcha-response']
    verify("", ctk).then(async (data) => {
        if(data.success == true) {
            if(usrip.length > 1) return res.redirect("/panel/register?err=MULTIACCOUNTS");
        let emb = new Discord.MessageEmbed()
        .setTitle("Account Created:")
        .setDescription("**Invite:** "+decodeURIComponent(req.body.invite)+"\n**Username:** "+req.body.username+"\n**Invited By:** "+db2)
        .setColor("#fc0303")
        require('./features/discord').getClient().channels.cache.get("883629255634845726").send(emb)
        await invites.delete("invite-"+decodeURIComponent(req.body.invite))
	await invites.set(`invite-used-${decodeURIComponent(req.body.invite)}`, `${req.body.username}`)
        res.redirect("/panel/login?success=REGISTERED");
        }else{
            res.redirect("/panel/register?err=CAPTCHA")
        }
    }).catch(err => {
        res.redirect("/panel/register?err=CAPTCHA")
    })
    }
})
app.get('/', async (req, res) => {
      let ucount = await keyv.get("uids");
      res.render("index", {storage:formatBytes(0),uploads:0,users:ucount})
})
app.get("/api/stats", async (req, res) => {
var stream = minioClient.listObjectsV2('uploads','', true,'')
let size = 0;
let amtupl = 0;
stream.on('data', function(obj) { 
size += obj.size;
amtupl++;
})
stream.on('error', function(err) { console.log(err) } )
let ucount = await keyv.get("uids");
stream.on("end", function () {
res.json({storage:formatBytes(size),uploads:amtupl,users:ucount})
})
})

app.get("/api/resolveuid", async(req, res) => {
if(req.get('authorization') == 'Bearer ') {

let usr = await users.get(`uid-${req.query.uid}`);
if(!usr) return res.json({error:true,message:"Invalid User."});
res.json({error:false,username:usr})
}else{
res.json({error:true,message:"Invalid Auth."})
}
})


app.get("/api/usernames", async(req, res) => {
if(req.get('authorization') == 'Bearer ') {
let uids = []
let ucount = await keyv.get("uids");
for(let i = 0; i < ucount; i++) {
let usr = await users.get(`uid-${i + 1}`);
uids.push(usr)
}
res.json({users:uids})
}else{
res.json({error:true,message:"Invalid Auth."})
}
})


app.get("/api/ustats", async (req, res) => {
if(!req.query.username) return res.send("Specify a username.");
let ps = await users.get("password-"+decodeURIComponent(req.query.username));
let uid = await users.get("uid-"+decodeURIComponent(req.query.username))
if(!uid) return res.send("Invalid User.");
        let tok = md5(uid)
let grep = await groups.get("group-"+tok)
            if(!grep) {
                grep = "User";
            }

if(!ps) return res.send("User does not exist.");
 let uploads = await cdms.get(`uploadcount-${tok}`)
        if(!uploads) {
                uploads = 0;
        }
        let bytes = await cdms.get(`storage-${tok}`)
        if(!bytes) {
                bytes = 0;
        }
 let ausername = await discord.get(`username-${md5(uid)}`)
            let apfp = await discord.get(`pfp-${md5(uid)}`)
            let adid = await discord.get(`userid-${md5(uid)}`)

            let discs = {username:ausername,pfp:apfp,id:adid}

if(req.query.t=="lel") {
res.json({uploads:uploads,storage:formatBytes(bytes),tok:sha1(tok),uid:uid})
}else{
res.json({uploads:uploads,storage:formatBytes(bytes),uid:uid,group:grep,discord:discs})
}
})
app.get("/decode", async(req, res) => {
    res.send(`${encodeURIComponent(req.query.text)}`)
})

app.get("/profile/:uid", async (req, res) => {
    let uid = await users.get("uid-"+req.params.uid)
    if(!uid) return res.send("Invalid user specified.");
    let username = uid;
    let ps = await users.get("password-"+decodeURIComponent(username));
if(!uid) return res.send("Invalid User.");
let ruid = parseInt(req.params.uid)
        let tok = md5(ruid)
if(!ps) return res.send("User does not exist.");
 let uploads = await cdms.get(`uploadcount-${tok}`)
        if(!uploads) {
                uploads = 0;
        }
        let bytes = await cdms.get(`storage-${tok}`)
        if(!bytes) {
                bytes = 0;
        }
        let grep = await groups.get("group-"+tok)
            if(!grep) {
                grep = "User";
            }
res.render("profile", {uc:uploads,storage:formatBytes(bytes),uid:ruid,username:username,group:grep})
//res.json({uploads:uploads,storage:formatBytes(bytes),tok:tok,uid:uid})
})

app.get("/:code", async (req, res) => {
if(req.params.code) {
let t = await shorts.get(`${req.params.code}`)
if(!t) return res.send("Image not found.");
console.log(req.params.code)
minioClient.getObject('uploads', t, async function(err, dataStream) {
        if (err) {
	console.log(err)
            res.send("File not found.")
            return;
        }
	let owner = await images.get("ownernm-"+t);
        let ps = await users.get("password-"+owner);
        let uid = await users.get("uid-"+decodeURIComponent(owner))
        let tok = md5(uid)
        let color = await colors.get("color-"+tok);
        if(!color) {
                color = "ff0000";
        }
        let desc = await cdms.get("description-"+tok)
        if(!desc) {
                desc = "Uploaded by {{uploader}}"
        }
        let title = await cdms.get("title-"+tok)
        if(!title) {
                title = "{{domain}}"
        }
        let size = await cdms.get(`imgstorage-${t}`)
        title = title.replace(/{{uploader}}/g, owner)
        title = title.replace(/{{img_name}}/g, t.split(".")[0])
        title = title.replace(/{{img_extension}}/g, t.split(".")[1])
        title = title.replace(/{{domain}}/g, req.host)
        title = title.replace(/{{img_size}}/g, `${size}`)

        desc = desc.replace(/{{img_size}}/g, `${size}`)
        desc = desc.replace(/{{uploader}}/g, owner)
        desc = desc.replace(/{{img_url}}/g, `https://uploader.one/uploads/${t}`)
        desc = desc.replace(/{{img_name}}/g, t.split(".")[0])
        desc = desc.replace(/{{img_extension}}/g, t.split(".")[1])
        res.render("viewer", {req:req, filename:t, owner:owner,color:color,desc:desc, title:title,size:size})

      })
}
})





app.post("/shorten", async (req, res) => {
    if(!req.body.url) return res.send("No url Specified.");
    if(!req.query.username) return res.send("No username specified.");
    if(!req.query.token) return res.send("No token specified.");
    let ps = req.query.token
    let db = await users.get("password-"+decodeURIComponent(req.query.username))
    if(!db) return res.send("Invalid Username Specified.");
    if(`${db.trim()}` !== `${ps.trim()}`) return res.send("Invalid token specified.");
    let banned = await bans.get(`banned-${req.query.username}`);
    if(banned) return res.send("User is banned.");
    let t = ""
    let uid = await users.get("uid-"+decodeURIComponent(req.query.username))
        let tok = md5(uid)
let grp = await groups.get("group-"+tok)
if(!grp) {
    grp = "User";
}

let uploads = await cdms.get(`uploadcount-${tok}`)
if(!uploads) {
uploads = 0;
}
uploads++;
await cdms.set(`uploadcount-${tok}`,uploads)
let usrimg = await userimgs.get(`images-${tok}`)
if(!usrimg) {
usrimg = []
}
let statupl = await keyv.get(`stats-uploads`)
if(!statupl) {
statupl = 0;
}
statupl++;
await keyv.set(`stats-uploads`,statupl)

let cd = makeid(10)
await keyv.set(`shortened-${cd}`, `${req.body.url}`)
let cds = await cdms.get(`domain-${tok}`)
    if(cds) return res.send(`https://${cds}/short/${cd}`);
    if(!cds) {
    res.send("https://uploader.one/short/"+cd)
    }

})












app.post("/upload", async (req, res) => {
    if(!req.files) return res.send("No File Specified.");
    if(!req.files.image) return res.send("No File Specified.");
    if(!req.query.username) return res.send("No username specified.");
    if(!req.query.token) return res.send("No token specified.");
	console.log(req.query.username+" with ip "+req.header('x-forwarded-for')+' is uploading img')
    let ps = req.query.token
    let db = await users.get("password-"+decodeURIComponent(req.query.username))
    if(!db) return res.send("Invalid Username Specified.");
    if(`${db.trim()}` !== `${ps.trim()}`) return res.send("Invalid token specified.");
    let banned = await bans.get(`banned-${req.query.username}`);
    if(banned) return res.send("User is banned.");
    let name = makeid(8)+"."+req.files.image.name.split(".")[1]
	console.log(req.query.username+" is uploading "+name)
    let t = ""
    let uid = await users.get("uid-"+decodeURIComponent(req.query.username))
        let tok = md5(uid)
let bytes = await cdms.get(`storage-${tok}`)
if(!bytes) {
bytes = 0;
}
bytes = bytes + +req.files.image.size;

let grp = await groups.get("group-"+tok)
if(!grp) {
    grp = "User";
}

if(grp == "User") {
    if(bytes >= 1073741824) return res.send("You have reached your storage limit.");
}else if(grp == "VIP") {
    if(bytes >= 5368706371) return res.send("You have reached your storage limit.");
}else if(grp == "Beta") {
    if(bytes >= 5368706371) return res.send("You have reached your storage limit.");
}else if(grp == "Staff") {
    if(bytes >= 7516188920) return res.send("You have reached your storage limit.");
}else if(grp == "Admin") {
    if(bytes >= 10737412742) return res.send("You have reached your storage limit.");
}

let uploads = await cdms.get(`uploadcount-${tok}`)
if(!uploads) {
uploads = 0;
}
uploads++;
await cdms.set(`uploadcount-${tok}`,uploads)
await cdms.set(`storage-${tok}`, bytes)
let usrimg = await userimgs.get(`images-${tok}`)
if(!usrimg) {
usrimg = []
}
let statupl = await keyv.get(`stats-uploads`)
if(!statupl) {
statupl = 0;
}
statupl++;
await keyv.set(`stats-uploads`,statupl)
let eurl = await cdms.get(`emojiurl-${tok}`);
if(eurl) {
    let g = randomIntFromInterval(4, 75)
    for(let i = 0; i < g; i++) {
            var char = chars[Math.floor(Math.random() * chars.length)];
            t += `${char}`
    }
    for(let i = 0; i < 5; i++) {
        var char = emojis[Math.floor(Math.random() * emojis.length)];
        t += `${char}`
}
}else{
    let g = randomIntFromInterval(4, 75)
    for(let i = 0; i < g; i++) {
            var char = chars[Math.floor(Math.random() * chars.length)];
            t += `${char}`
    }
}
        shorts.set(`${t}`, `${name}`)


    req.files.image.mv("./tmp/"+name, async (err) => {

minioClient.fPutObject('uploads', name, './tmp/'+name, async function(err2, etag) {
            if (err2) console.log(err2);
           if(err2) return res.send("The server failed to load the image.");
            fs.unlinkSync('./tmp/'+name);
	images.set("owner-"+name, `${tok}`)
        images.set("ownernm-"+name, `${decodeURIComponent(req.query.username)}`)
        await cdms.set(`imgstorage-${name}`, `${formatBytes(+req.files.image.size)}`)
        usrimg.push(`${name}`)
        await userimgs.set(`images-${tok}`, usrimg)
        if(err) return res.send("The server failed to load the image.");
	 let cd = await cdms.get(`domain-${tok}`)
    if(cd) return res.send(`https://${cd}/${t}`);
    if(!cd) {
    res.send("https://uploader.one/"+t)
    }

        });
   })
})

app.get("/discord/link", async(req, res) => {
    if(req.session.loggedin == true) {
        res.redirect("")
    }
})

app.get("/discord/unlink", async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        let tok = md5(uid)
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        await discord.delete(`userid-${tok}`)
        await discord.delete(`username-${tok}`)
        await discord.delete(`pfp-${tok}`)
        res.redirect("/panel/discord")
    }else{
        res.redirect("/panel/login")
    }
})

app.get("/discord/forcenick", async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        let tok = md5(uid)
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        let dusr = await discord.get("username-"+tok);
        let discid = await discord.get("userid-"+tok);
        if(!dusr) return res.redirect("/panel/discord");
        if(!discid) return res.redirect("/panel/discord");
        require('./features/discord').setNick(`${discid}`, `${req.session.username}`)
        res.redirect("/panel/discord")
    }else{
        res.redirect("/panel/login")
    }
})


app.get("/discord/callback", async (req, res) => {
    if(req.session.loggedin == true) {
        let ps = req.session.token
        let db = await users.get("password-"+decodeURIComponent(req.session.username))
        let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
        let tok = md5(uid)
        console.log("USR: "+req.session.username+"\nPS: "+ps+"\nDB: "+db)
        if(`${db.trim()}` !== `${ps.trim()}`) {
            req.session.destroy(function(err) {
                res.redirect("/panel/login?err=SPDT")
            })
            return;
        }
        if(!req.query.code) return res.send("Missing oauth2 code.");
        let json = await fetch(
            'https://discord.com/api/oauth2/token',
            {
              method: "post",
              body: "client_id=&client_secret=&grant_type=authorization_code&code=" + encodeURIComponent(req.query.code) + "&redirect_uri=https://uploader.one/discord/callback",
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
          );
          if (json.ok == true) {
            let codeinfo = JSON.parse(await json.text());
            let scopes = codeinfo.scope;
            let missingscopes = [];
            if (scopes.replace(/identify/g, "") == scopes) missingscopes.push("identify");
            if (scopes.replace(/email/g, "") == scopes) missingscopes.push("email");
            if (scopes.replace(/guilds.join/g, "") == scopes) missingscopes.push("guilds.join");
            if(missingscopes.length !== 0) return res.send("You are missing OAuth2 scopes.");
            let userjson = await fetch(
                'https://discord.com/api/users/@me',
                {
                  method: "get",
                  headers: {
                    "Authorization": `Bearer ${codeinfo.access_token}`
                  }
                }
              );
              let userinfo = JSON.parse(await userjson.text());
              if (userinfo.verified == true) {
                let testing = await discord.get(`backwards-username-${userinfo.id}`);
                if(testing) {
                    if(testing !== `${req.session.username}`) return res.send("That discord account is already linked to a uploader account.");
                }
                await fetch(
                    `https://discord.com/api/guilds/883429594349314078/members/${userinfo.id}`,
                    {
                      method: "put",
                      headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bot `
                      },
                      body: JSON.stringify({
                        access_token: codeinfo.access_token
                      })
                    }
                  );
                  let checkmemberexist = await fetch(
                    `https://discord.com/api/guilds/883429594349314078/members/${userinfo.id}`,
                    {
                      method: "get",
                      headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bot `
                      }
                    }
                  );
                  let checkmemberexistjson = checkmemberexist.json();
                  let check_if_banned = (await fetch(
                    `https://discord.com/api/guilds/883429594349314078/bans/${userinfo.id}`,
                    {
                      method: "get",
                      headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bot `
                      }
                    }
                  )).status;
                  if (check_if_banned == 200) {
                    await bans.set(`banned-${req.session.username}`, true);
                    let emb = new Discord.MessageEmbed()
                    .setTitle("User Banned:")
                    .setDescription("**User:** "+req.session.username+"\n**Moderator:** Auto-Ban (Banned on discord)")
                    .setColor("#fc0303")
                    require('./features/discord').getClient().channels.cache.get("883629255634845726").send(emb)
                    return res.send("You are banned from our discord server.");
                  }
                  if (checkmemberexistjson.message && checkmemberexistjson.message === "Unknown Member") return res.send("You are not in our discord server.");

                  await fetch(
                    `https://discord.com/api/guilds/883429594349314078/members/${userinfo.id}/roles/883430723372073060`,
                    {
                      method: "put",
                      headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bot `
                      }
                    }
                  );
                    require('./features/discord').setNick(`${userinfo.id}`, `${req.session.username}`)
                  let uid = await users.get("uid-"+decodeURIComponent(req.session.username))
                  let tok = md5(uid)
                    await discord.set(`userid-${tok}`, `${userinfo.id}`);
                    await discord.set(`username-${tok}`, `${userinfo.username}#${userinfo.discriminator}`);
                    await discord.set(`backwards-username-${userinfo.id}`, `${req.session.username}`);
                    await discord.set(`pfp-${tok}`, `https://cdn.discordapp.com/avatars/${userinfo.id}/${userinfo.avatar}.jpg?size=1024`)
                    res.redirect("/panel/discord")

              }else{
                    res.send("You need to have your email verified on your discord account.");
                }

          }else{
              res.send("Malformed JSON.")
          }
    }else{
        res.redirect("/panel/login")
    }
})

app.listen(3001, function () {
    console.log("[API] Express started.")
    require('./features/discord').start()
});

