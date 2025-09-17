import { ChatGroq } from "@langchain/groq";
import { createEventTool, getEventTool } from "./src/tools"


const tools: any = [createEventTool, getEventTool];


const groq = new ChatGroq({
	apiKey: process.env.GROQ_API_KEY,
	model: "openai/gpt-oss-20b",
	temperature: 0,
}).bindTools(tools);