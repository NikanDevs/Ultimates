declare global {
	namespace NodeJS {
		interface ProcessEnv {
			DISCORD_TOKEN: string;
			MONGODB: string;
			CLIENT_ID: string;
			GUILD_ID: string;
		}
	}
}

export {};
