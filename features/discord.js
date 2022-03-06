const Discord = require('discord.js');
const Canvas = require("canvas");
const path = require('path');
const fs = require('fs')

const dscConf = require('../configuration/discord.json')
const dbConf = require("../configuration/database.json")
const client = new Discord.Client()

client.on("ready", async () => {
    console.log("[DISCORD] Bot has connected.")
})

client.on("guildMemberAdd", async member => {
    const { guild } = member
    const canvas = Canvas.createCanvas(700, 250)
    const ctx = canvas.getContext('2d')
    const background = await Canvas.loadImage(
      path.join(__dirname, '../images/background.png')
    )
    let x = 0
    let y = 0
    ctx.drawImage(background, x, y)
    const pfp = await Canvas.loadImage(
        member.user.displayAvatarURL({
          format: 'png',
        })
      )
      x = canvas.width / 2 - pfp.width / 2
      y = 25
      ctx.drawImage(pfp, x, y)
      ctx.fillStyle = '#ffffff'
      ctx.font = '35px sans-serif'
      let text = `Welcome ${member.user.tag}!`
      x = canvas.width / 2 - ctx.measureText(text).width / 2
      ctx.fillText(text, x, 60 + pfp.height)
      ctx.font = '30px sans-serif'
      text = `Member #${guild.memberCount}`
      x = canvas.width / 2 - ctx.measureText(text).width / 2
      ctx.fillText(text, x, 100 + pfp.height)
    const attachment = new Discord.MessageAttachment(canvas.toBuffer())
    let embed = new Discord.MessageEmbed()
        .setTitle(":tada: | Welcome!")
        .setColor("#5865F2")
        .setDescription("Welcome to Uploader.One!\n We are an advanced invite only image uploader.")
    client.channels.cache.get("883436686967701525").send(embed)
    client.channels.cache.get("883436686967701525").send("", attachment)
})

function getClient() {
    return client;
}

function setNick(id, nick) {
    let memb = client.guilds.cache.get("883429594349314078").members.cache.get(`${id}`);
    if(!memb) return false;
    memb.setNickname(`${nick}`)
    return true;
}

function start() {
    client.login(dscConf.bot.token)
}

module.exports = {
    start,
    getClient,
    setNick
}
