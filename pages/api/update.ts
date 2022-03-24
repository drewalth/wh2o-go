import { NextApiRequest } from 'next';
import * as shell from 'shelljs';

const UpdateHandler = async (req: NextApiRequest, res: any) => {
  try {
    shell.exec(`cd ../ && pwd && docker ps`);
    res.send('ping').status(200);
  } catch (e) {
    console.error(e);
    res.send(e).status(500);
  }
};

export default UpdateHandler;
