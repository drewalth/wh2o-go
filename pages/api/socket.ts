import { Server, Socket } from 'socket.io';
import { NextApiRequest } from 'next';

export let socketRef: undefined | Socket;

const SocketHandler = (req: NextApiRequest, res: any) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      if (!socketRef) {
        socketRef = socket;
      }
    });
  }
  res.end();
};

export default SocketHandler;
