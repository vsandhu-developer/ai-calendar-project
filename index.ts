import type { AIMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createEventTool, getEventTool } from "./src/tools";
import readline from "node:readline/promises";

const tools: any = [createEventTool, getEventTool];
const toolNode = new ToolNode(tools);

const groq = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-20b",
  temperature: 0,
}).bindTools(tools);

async function callModel(state: typeof MessagesAnnotation.State) {
  const response = await groq.invoke(state.messages);
  return { messages: [response] };
}

function shouldContinue(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;

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

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
  while(true) {
    const question = await rl.question("YOU: ");

    console.log("question", question);

    if(question === "bye") {
      break;

    }

    const result = await app.invoke({
      messages: [
        {
          role: "user",
          content: question,
          // content: `Can you create a meeting with hakam at 19 sep for 3'o clock canadian time zone EST about the design dicussions. hakamsandhu2006@gmail.com this is the email of hakam`,
        },
      ],
    });

    console.log("AI: ", result.messages[result.messages.length - 1]?.content);
  }
  rl.close();
}

main();
