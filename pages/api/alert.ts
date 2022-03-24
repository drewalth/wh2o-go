import { CreateAlertDTO, Gage } from '../../types';
import { NextApiRequest, NextApiResponse } from 'next';
import { handleRequest } from '../../lib/handleRequest';
import { Alert, Gage as GageModel } from '../../api/database/database';

type Data = {
  gages: Gage[] | undefined;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  await handleRequest(Alert, req, res, {
    get: {
      include: [
        {
          model: GageModel,
          required: false,
        },
      ],
    },
    post: {
      callback: async (alert: typeof Alert, dto: CreateAlertDTO) => {
        if (dto.gageId) {
          // @ts-ignore
          await alert.setGage(dto.gageId);
        }

        return alert;
      },
    },
  });
}
