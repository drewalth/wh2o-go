import { NextApiRequest, NextApiResponse } from "next";

export const handleRequest = async (model:any, req: NextApiRequest, res: NextApiResponse) => {
    const getHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            // @ts-ignore
            const alerts = await model.findAll()
            res.status(200).json(alerts)
        } catch (e) {
            console.error(e)
            res.status(500)
        }
    };

    const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        await model.create(req.body)
            .then((result:any) => {
                res.status(200).json(result);
            })
            .catch((e:any) => {
                console.error(e);
                res.status(500);
            });
    };

    const updateHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        await model.update(req.body, {
            where: {
                id: req.body.id
            }
        })
            .then((result:any) => {
                res.status(200).json(result);
            })
            .catch((e:any) => {
                console.error(e);
                res.status(500);
            });
    };

    const deleteHandler = async (req: NextApiRequest, res: NextApiResponse) => {
        await model.destroy({
            where: {
                id: req.query.id,
            },
        })
            .then((res:any) => res)
            .catch((e:any) => {
                console.error(e);
            });
    };

    switch (req.method) {
        case "DELETE":
            await deleteHandler(req, res);
            return;
        case "POST":
            await postHandler(req, res);
            return;
        case "PUT":
            await updateHandler(req, res);
            return;
        case "GET":
        default:
            await getHandler(req, res);
            return;
    }

}
