import { ChatGroq } from "@langchain/groq";
import { createEventTool, getEventTool } from "./src/tools";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt"
import { AIMessage } from "@langchain/core/messages";

const tools: any = [createEventTool, getEventTool];
const toolNode = new ToolNode(tools)

const groq = new ChatGroq({
	apiKey: process.env.GROQ_API_KEY,
	model: "openai/gpt-oss-20b",
	temperature: 0,
}).bindTools(tools);


async function callModel(state: typeof MessagesAnnotation.State) {
	const response = await groq.invoke(state.messages);
	return { messages: [response] }
}

function shouldContinue(state: typeof MessagesAnnotation.State) {
	const lastMessage = state.messages[state.messages.length - 1] as AiMessage;

	  if (lastMessage.tool_calls?.length) {
	  	return "tools";
	  }

	  return "__end__";
}


const workflow = new StateGraph(MessagesAnnotation)
	.addNode("assistant", callModel)
	.addNode("tools", toolNode)
	.addEdge("__start__", "assistant")
	.addEdge("tools", "assistant")
	.addConditionalEdges("assistant", shouldContinue);


const app = workflow.compile();


async function main() {
	const result = await app.invoke({
		messages: [{ role: "user", content: "can you check If I do have any meetings in my calendar tomorrow ?" }]
	});

	console.log("AI: ", result.messages[result.messages.length - 1].content);
}

main();