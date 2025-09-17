import { ChatGroq } from "@langchain/groq"

const tools: any = [];


const groq = ChatGroq({
	apiKey: process.env.GROQ_API_KEY,
	model: "openai/gpt-oss-20b",
	temperature: 0,
}).bindTools(tools);