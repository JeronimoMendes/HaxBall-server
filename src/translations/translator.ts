import dotenv from "dotenv";
import translations from "./translations";

dotenv.config();

class Translator {
	private language: string;
	constructor(language: string) {
		this.language = language;
	}

	translate(message: string, variables: any = []) : string {
		let formattedMessage = translations[message][this.language];

		for (let variable in variables) {
			formattedMessage = formattedMessage.replace(`{${variable}}`, variables[variable]);
		}

		return formattedMessage;
	}
}

const language = process.env.LANGUAGE || "en";
const translator = new Translator(language);

export default translator;