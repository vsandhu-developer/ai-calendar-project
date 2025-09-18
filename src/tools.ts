import { tool } from "@langchain/core/tools";
import { google } from "googleapis";
import { v4 as uuid } from "uuid";
import z from "zod";
import { oauth2Client } from "../server";
import tokens from "../tokens.json" assert { type: "json" };

oauth2Client.setCredentials(tokens);

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

interface Params {
  q: string;
  timeMin: string;
  timeMax: string;
}

type attendees = {
  email: string;
  displayName: string;
};

type EventData = {
  summary: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: attendees[];
};

export const getEventTool = tool(
  async (params) => {
    const { q, timeMin, timeMax } = params as Params;

    try {
      const response = await calendar.events.list({
        calendarId: "primary",
        q: q,
        timeMin: timeMin,
        timeMax: timeMax,
      });

      const result = response?.data?.items?.map((event) => {
        return {
          id: event.id,
          summary: event.summary,
          status: event.status,
          creator: event.creator,
          organizer: event.organizer,
          startTime: event.start,
          endTime: event.end,
          meetingUrl: event.hangoutLink,
          eventType: event.eventType,
        };
      });

      return JSON.stringify(result);
    } catch (error) {
      console.log("ERRERERE", error);
    }

    return "Failed to connect to calendar";
  },
  {
    name: "get-events",
    description: "this tool can be used to check the meetings in the calendar",
    schema: z.object({
      q: z
        .string()
        .describe(
          "The query parameter can be used to events from google calendar. You can pass parameter in this function like summary, description, location, attendee's displayName, attendee's email, organizer's displayName, organizer's email"
        ),
      timeMin: z
        .string()
        .describe("The from datetime in UTC format for the event"),
      timeMax: z
        .string()
        .describe("The to datetime in UTC format for the event"),
    }),
  }
);

export const createEventTool = tool(
  async (eventData) => {
    const { summary, start, end, attendees } = eventData as EventData;
    const response = await calendar.events.insert({
      calendarId: "primary",
      sendUpdates: "all",
      conferenceDataVersion: 1,
      requestBody: {
        summary,
        start,
        end,
        attendees,
        conferenceData: {
          createRequest: {
            requestId: uuid(),
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      },
    });

    if(response.status === 200) {
      return "The meeting has been schduled successfully."
    } 

    return "Unable to create a meeting";
  },
  {
    name: "create-event",
    description: "this tool can be used to create events and schedule meeting",
    schema: z.object({
      summary: z.string().describe("This is the title of the event"),
      start: z.object({
        dateTime: z
          .string()
          .describe("This is the start of the meeting in UTC format."),
        timeZone: z
          .string()
          .describe(
            "This is the timezone of the meeting which also follow UTC format"
          ),
      }),
      end: z.object({
        dateTime: z
          .string()
          .describe("This is the end of the meeting in UTC format."),
        timeZone: z
          .string()
          .describe(
            "This is the timezone of the meeting which also follow UTC format"
          ),
      }),
      attendees: z.array(
        z.object({
          email: z.string().describe("This is the email of the attendees"),
          displayName: z.string().describe("This is the name of the attendees"),
        })
      ),
    }),
  }
);
