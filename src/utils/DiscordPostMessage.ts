import { Client } from "discord.js";
import { Interaction } from "../types";

export default async (client: Client, d: Interaction, content: string, ephemeral?: boolean) => {
    // @ts-ignore
    client.api.interactions(d.id, d.token).callback.post({
        data: {
            type: 4,
            data: {
                content,
                flags: ephemeral ? 64 : null
            }
        }
    });
}