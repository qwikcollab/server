export class SocketSessionState {
  public static userMap: {
    [socketId: string]: {
      userId: string;
      roomId: string;
    };
  } = {};
}
