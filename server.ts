import express, { Request, Response } from "express";
import {google} from "googleapis";
import session from "cookie-session";

const app = express();

export const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URL);

app.use(session({
	name: session,
	keys: ["super-secure-key"]
}))

app.get("/auth", (req: Request, res: Response) => {
	const scopes = [
	  'https://www.googleapis.com/auth/calendar'
	];

	const url = oauth2Client.generateAuthUrl({
	  access_type: 'offline',
	  scope: scopes,
	  prompt: "consent"
	});


	res.redirect(url);
});


app.get("/oauth2callback", async (req: Request, res: Response) => {
	const code = req.query.code as string;
	
	const { tokens } = await oauth2Client.getToken(code);
	oauth2Client.setCredentials(tokens);
	
	res.send("You can now close this tab");
});


app.listen(3000, () => console.log("Server is running on 3000"));