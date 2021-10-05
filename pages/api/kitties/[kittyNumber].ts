import type { NextApiRequest, NextApiResponse } from "next";
import kittiesData from "../../../data/ranked-kitties.json";
import { Kitty, ResponseError } from "../../../utils";

export interface KittyResponse extends Kitty {}

const kitties = kittiesData as Kitty[];

export default async (
  req: NextApiRequest,
  res: NextApiResponse<KittyResponse | ResponseError>
) => {
  const tokenId = req.query.kittyNumber as string;
  const kitty = kitties.find((i) => i.tokenId.toString() === tokenId);

  if (!kitty) {
    res.status(404).json({
      message: `No kitty found with 'tokenId' ${tokenId}`,
      status: 404,
    });
    return;
  }

  res.status(200).json(kitty);
};
