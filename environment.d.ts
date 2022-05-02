declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TOKEN: string;
			MONGODB: string;
		}
	}
}

export {};

