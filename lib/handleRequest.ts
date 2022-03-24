import { NextApiRequest, NextApiResponse } from 'next';

const defaultOptions = {
  get: {},
  post: {},
  put: {},
  delete: {},
};

export const handleRequest = async (
  model: any,
  req: NextApiRequest,
  res: NextApiResponse,
  opts: any = defaultOptions,
) => {
  const getHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    let result;
    try {
      // @ts-ignore
      if (req.query.id) {
        result = await model
          .findOne({
            where: {
              id: +req.query.id,
            },
            ...opts.get,
          })
          .then((res: any) => {
            return res || undefined;
          });
      } else {
        result = await model.findAll({
          ...opts.get,
        });
      }
      res.status(200).json(result);
    } catch {
      res.status(500);
    }
    return;
  };

  const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    await model
      .create(req.body)
      .then(async (result: any) => {
        if (opts?.post?.callback) {
          await opts.post.callback(result, req.body);
        }

        res.status(200).json(result);
      })
      .catch(() => {
        res.status(500);
      });

    return;
  };

  const updateHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    await model
      .update(req.body, {
        where: {
          id: +req.query.id,
        },
      })
      .then((result: any) => {
        res.status(200).json(result);
      })
      .catch(() => {
        res.status(500);
      });
    return;
  };

  const deleteHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    await model
      .destroy({
        where: {
          id: +req.query.id,
        },
      })
      .then((result: any) => {
        res.status(200).json(result);
      })
      .catch(() => {
        res.status(500);
      });
  };

  switch (req.method) {
    case 'DELETE':
      await deleteHandler(req, res);
      return;
    case 'POST':
      await postHandler(req, res);
      return;
    case 'PUT':
      await updateHandler(req, res);
      return;
    case 'GET':
    default:
      await getHandler(req, res);
      return;
  }
};
