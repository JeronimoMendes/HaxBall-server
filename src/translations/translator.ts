import dotenv from "dotenv";
import { Log } from "../utils";
import translations from "./translations";

dotenv.config();

class Translator {
	private language: string;
	constructor(language: string) {
		this.language = language;
	}

	translate(message: string, variables: any = []) : string {
		let formattedMessage;
		try {
			formattedMessage = translations[message][this.language];
		} catch (error) {
			Log.error(`Could not find translation for ${message}`);
			return "Something went wrong.";
		}

		for (let variable in variables) {
			try {
				formattedMessage = formattedMessage.replace(`{${variable}}`, variables[variable]);
			} catch (error) {
				Log.error(`Could not replace variable ${variable} in message ${message}`);	
			}
		}

		return formattedMessage;
	}
}

const language = process.env.LANGUAGE || "en";
const translator = new Translator(language);

export default translator;