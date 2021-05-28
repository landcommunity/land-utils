import { TextChannel, Webhook } from "discord.js";


class WebhookManager {
    private cache = new Map();

    async send(channel: TextChannel, name: string, imageURL: string, reply: string, id?: string) {
        if (channel.type !== "text") return null;
    
        let hook: Webhook = this.cache.get(id || name.toLowerCase());

        if (!hook) {
            hook = await channel.createWebhook(name, { avatar: imageURL });
            this.cache.set(id || name.toLowerCase(), hook);
        } else setTimeout(() => {
            hook.delete();
            this.cache.delete(id || name.toLowerCase());
        }, 5000);
    
        console.log(hook);
        hook.send(reply);
    
    }

}

export default new WebhookManager;