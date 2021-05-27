import { Message, MessageEmbed } from "discord.js";
import { CommandData, RoleTemplate } from "../../types";
import discordButtons from "discord-buttons";
import fs from 'fs';
import path from 'path';

export default class Command {
  public aliases = ["roles"];
  private templates = fs.readdirSync(path.join(__dirname, "../../reaction-roles"));

  public async executor(msg: Message, data: CommandData) {
    if (msg.channel.type !== "text") return;
    if (!msg.member?.roles.cache.has("783337241757220918")) return;
    
    const foundTemplates = this.templates.filter(t => t === data.args[0].toLowerCase()+".json");

    if(foundTemplates.length <= 0) return msg.channel.send("lol not found");
    
    const roleData = require("../../reaction-roles/"+foundTemplates[0]) as RoleTemplate;
    roleData._id = data.args[0].toLowerCase();

    if (typeof roleData !== "object") return;
    const name = roleData.name || "";
    const description = roleData.description || "";

    if (!(roleData.roles instanceof Array)) return;
    const valid = roleData.roles.every(
      // @ts-ignore
      (d) =>
        typeof d.role === "string" &&
        (typeof d.label === "string" || "emoji" in d) &&
        ("color" in d ? typeof d.color === "string" : true)
    );
    if (!valid) return;
    // @ts-ignore
    const buttons = roleData.roles.map((d) => {
      const button = new discordButtons.MessageButton()
        .setLabel(d.label || "")
        .setID(`giverole ${d.role} ${roleData.unique} ${roleData._id}`)
        .setStyle(d.color || "gray")
        .toJSON();
      //   @ts-ignore
      if (d.emoji) button.emoji = d.emoji;
      return button;
    });

    const clearButton = new discordButtons.MessageButton()
    .setLabel("Clear")
    .setID(`clearrole ${roleData._id}`)
    .setStyle("red")
    .toJSON();

    buttons.push(clearButton);

    const response = new MessageEmbed()
    .setTitle(name)
    .setDescription(description)
    .setColor("#2F3136")

    // @ts-ignore
    msg.client.api.channels(msg.channel.id).messages.post({
      data: {
        embed: response.toJSON(),
        components: [
          {
            type: 1,
            components: buttons,
          },
        ],
      },
    });
  }
}
