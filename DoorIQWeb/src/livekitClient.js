import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
  const { roomName, participantName } = req.query;
  
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity: participantName }
  );
  
  at.addGrant({ roomJoin: true, room: roomName, canPublish: false, canSubscribe: true });
  res.status(200).json({ token: await at.toJwt() });
}