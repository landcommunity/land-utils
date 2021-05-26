import { Message, MessageEmbed } from "discord.js";
import { CommandData } from "../../types";
import discordButtons from "discord-buttons";

export default class Command {
  public aliases = ["roles"];

  public async executor(msg: Message, data: CommandData) {
    if (msg.channel.type !== "text") return;
    if (!msg.member?.roles.cache.has("783337241757220918")) return;
    const content = data.args.join(" ");
    let roleData;
    try {
      roleData = JSON.parse(content);
    } catch (e) {
      return;
    }
    if (typeof roleData !== "object") return;
    const name = roleData.name || "";
    const description = roleData.description || "";

    if (!(roleData.roles instanceof Array)) return;
    const valid = roleData.roles.every(
      // @ts-ignore
      (d) =>
        typeof d.role === "string" &&
        typeof d.label === "string" &&
        ("color" in d ? typeof d.color === "string" : true)
    );
    if (!valid) return;
    // @ts-ignore
    const buttons = roleData.roles.map((d) => {
      return new discordButtons.MessageButton()
        .setLabel(d.label)
        .setID("giverole " + d.role)
        .setStyle(d.color || "gray");
    });
    msg.channel.send({
      // @ts-ignore
      buttons: buttons,
      embed: new MessageEmbed().setTitle(name).setDescription(description),
    });
  }
}
