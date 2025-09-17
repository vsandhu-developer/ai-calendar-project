import { tool } from "@langchain/core/tools";
import z from "zod";
import { google } from "googleapis";
import { oauth2Client } from "../server";
import tokens from "../tokens.json" assert { type: "json" };

oauth2Client.setCredentials(tokens);	

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

interface Params {
	q: string;
	timeMin: string;
	timeMax: string;
}

export const getEventTool = tool(
	async (params) => {

		const { q, timeMin, timeMax } = params as Params;

		try {
			const response = await calendar.events.list({
				calendarId: "vinaysandhuindia@gmail.com",
				q: q,
				timeMin: timeMin,
				timeMax: timeMax
			});

			const result = response.data.items.map((event) => {
				return {
					id: event.id,
					summary: event.summary,
					status: event.status,
					creator: event.creator,
					organizer: event.organizer,
					startTime: event.start,
					endTime: event.end,
					meetingUrl: event.hangoutLink,
					eventType: event.eventType
				}
			})

			return JSON.stringify(result);
		} catch(error) {
			console.log("ERRERERE", error);
		}

		return "Failed to connect to calendar";
	},
	 {
	 	name: "get-events",
	 	description: "this tool can be used to check the meetings in the calendar",
	 	schema: z.object({
	 		q: z.string().describe("The query parameter can be used to events from google calendar. You can pass parameter in this function like summary, description, location, attendee's displayName, attendee's email, organizer's displayName, organizer's email"),
	 		timeMin: z.string().describe("The from datetime in UTC format for the event"),
	 		timeMax: z.string().describe("The to datetime in UTC format for the event")
	 	})
	 }
);

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


