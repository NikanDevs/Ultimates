<h1>😄 Ultimates</h1>

## 📚 Description

Ultimates is a discord moderation bot with lots of features.

-    Advanced logging system
-    Auto expire for punishments
-    Useful utility commands
-    Modmail system through the bot's direct messages
-    etc...

## Statatics

-    Language: [Typescript](https://www.typescriptlang.org/)
-    Database: [MongoDB](https://www.mongodb.com/)
-    Library: [Discord.Js](https://discord.js.org)

## 🛠 Development Team

-    [Nikan#8064](https://discord.com/users/757268659239518329)
-    [pogchampy#3412](https://discord.com/users/837306535813054464)

<h1>⚙️ How to setup?</h1>

## Step One:

Make a file called `.env` in your preject's main directory `(/.env)`. Paste the code below into the file and set the requirements.

```
DISCORD_TOKEN=your_client_token
MONGODB=your_mongoDB_connection_string
GUILD_ID=your_guild_id
CLIENT_ID=your_client_id
```

## Step Two:

Use `npm run register` to register the slash commands to your guild.

## Step Three:

After the slash commands are registered, use the `/configure` command to setup everything for your server and bot.

## Step Four:

-    Skip this step if you have the all automod modules disabled (/configure automod)

Head over to `/src/config/automod.json` and edit your own configs in.

• ignore: Set channel-names, category Ids, role Ids and permission for each automod module to ignore.

## Step Five:

-    Skip this step if you have the all logging modules disabled (/configure logs)

Head over to `/src/config/logs.json` and edit your own configs in.

• ignore: Set channel-ids, category Ids and role Ids for each logging module to ignore.

