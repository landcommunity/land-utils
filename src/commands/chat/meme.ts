import { CommandData } from "../../types";
import { SlashReplyType } from "../../utils/SlashReplyType";

export default class Command {

    public premium = true;
    public ratelimit = 5;
    public aliases = ["meme"];
    public options = [
        {
            name: "image",
            description: "Pick the image used for your meme.",
            required: true,
            type: SlashReplyType.STRING,
            choices: [
                {
                    "name": "10 Guy",
                    "value": "10-Guy"
                },
                {
                    "name": "1950s Middle Finger",
                    "value": "1950s-Middle-Finger"
                },
                {
                    "name": "1990s First World Problems",
                    "value": "1990s-First-World-Problems"
                },
                {
                    "name": "1st World Canadian Problems",
                    "value": "1st-World-Canadian-Problems"
                },
                {
                    "name": "2nd Term Obama",
                    "value": "2nd-Term-Obama"
                },
                {
                    "name": "Aaaaand Its Gone",
                    "value": "Aaaaand-Its-Gone"
                },
                {
                    "name": "Angry Asian",
                    "value": "Angry-Asian"
                },
                {
                    "name": "Ancient Aliens",
                    "value": "Ancient-Aliens"
                },
                {
                    "name": "Albert Cagestein",
                    "value": "Albert-Cagestein"
                },
                {
                    "name": "Angry Baby",
                    "value": "Angry-Baby"
                },
                {
                    "name": "Bad Luck Brian",
                    "value": "Bad-Luck-Brian"
                }
            ]
        },
        {
            name: "top-text",
            description: "Choose your top text.",
            required: false,
            type: SlashReplyType.STRING 
        },
        {
            name: "bottom-text",
            description: "Choose your bottom text.",
            required: false,
            type: SlashReplyType.STRING 
        }
    ]

    reply(data: CommandData) {
        return `http://apimeme.com/meme?meme=${data.args[0]}&top=${data.args[1] ? data.args[1].replace(/ /g, "+") : ""}&bottom=${data.args[2] ? data.args[2].replace(/ /g, "+") : ""}`;
    }

}