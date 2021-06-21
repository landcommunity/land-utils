import { MessageAttachment, MessageEmbed, User } from 'discord.js'
import Jimp from 'jimp'
import path from 'path'
import fetch from 'node-fetch'
import FormData from 'form-data'

export default async (target: User) => {

    const avatar = target.avatarURL({
        format: "jpeg",
        size: 256
    });

    if (avatar) {

        const Image = await Jimp.read(avatar);
        const Template = await Jimp.read(path.join(__dirname, "../assets/welcome-template.png"));

        Template.composite(Image, 0, 0).composite(await Jimp.read(path.join(__dirname, "../assets/welcome-template.png")), 0, 0);

        const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
        Template.print(
            font,
            0,
            0,
            {
                text: `${target.username} just landed!`,
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
            },
            1100,
            256
        );

        const attachment = new MessageAttachment(await Template.getBufferAsync("image/jpeg"), "join.jpg");
        const embed = new MessageEmbed()
            // @ts-ignore
            .attachFiles(attachment)
            .setTitle(`${target.username} just landed!`)
            .setImage("attachment://join.jpg")
            .setColor("#bc9dd6")

        return embed;

    } else return null;
}