import { Message } from "discord.js";
import { CommandData } from "../../types";
import Data from '../../data/chat-interactions.json';
import { SlashReplyType } from "../../utils/SlashReplyType";
import NameFormatter from "../../utils/NameFormatter";
import { MessageButton } from "discord-buttons";

export default class Command {
    public aliases = Object.keys(Data);
    public description = "User interaction command."
    public cooldown = 60
    public options = [
        {
            name: "user",
            description: "Pick a user to perform this action on.",
            required: true,
            type: SlashReplyType.MEMBER
        }
    ]
;
    private action: any = null;

    private PercVariableParser(text: string, data: {
        author: string,
        reciever: string,
        emote: string
    }) {

        for(const variable of text.match(/%(\w*)%/g) || []) {
            // @ts-ignore
            const value = data[variable.replace(/%/g, "").toLowerCase()]
            text = text.replace(variable, value); 
        }

        return text;
    }

    public async reply(data: CommandData, msg: Message) {

        if(!data.member || data.channel.type === "dm") return;

        const target = data.channel.guild?.members.cache.get(data.args[0]);

        if(data.args[0] === "@everyone") return `You wish you could do that to all ${Number(data.channel.guild?.members.cache.filter(m => !m.user.bot).size)-1} of us don't you. :smirk:`;

        if(!target) return "Looks like your friend never showed up... that sucks";
        if(target.id == data.member.id) return "I feel bad for you ...";

        // Using "hug" to bypass ts bs
        this.action = Data[data.name as "hug"];

        if(!this.action) return data.channel.send("Unexpected error");
        
        return (
            this.PercVariableParser(
                `> ${this.action.responses[Math.floor(Math.random() * this.action.responses.length)]}`,
                {
                    author: "**" + (NameFormatter(data.member)) + "**",
                    reciever: "**" + (NameFormatter(target)) + "**",
                    emote: this.action.emotes[Math.floor(Math.random() * this.action.emotes.length)]
                }
            )
        );

    }

}