import { tool } from "@langchain/core/tools";
import z from "zod";

export const createEventTool = tool(
	async () => {
		return "Your meeting has been scheduled";
	},
	 {
	 	name: "create-event",
	 	description: "this tool can be used to create events and schedule meeting",
	 	schema: z.object({})
	 }
);


export const getEventTool = tool(
	async () => {
		return JSON.stringify({
			name: "Website Review",
			description: "The website is working just need to do some minor changes",
			time: "3AM",
			date: "17 Sept",
			platform: "Google Meet"
		})
	},
	 {
	 	name: "get-events",
	 	description: "this tool can be used to check the meetings in the calendar",
	 	schema: z.object({})
	 }
);