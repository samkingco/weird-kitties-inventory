import type { NextApiRequest, NextApiResponse } from "next";
import kittiesData from "../../../data/ranked-kitties.json";
import { Kitty, ResponseError } from "../../../utils";

export interface KittiesResponse {
  kitties: Kitty[];
  nextCursor: number | null;
  hasNextPage: boolean;
}

const rankedKitties = kittiesData as Kitty[];

export default async (
  req: NextApiRequest,
  res: NextApiResponse<KittiesResponse | ResponseError>
) => {
  const kittyNumber = req.query.kittyNumber;
  const limit = req.query.limit as string;
  const cursor = req.query.cursor as string;

  if (!limit) {
    res.status(400);
    res.json({ message: "Please use a limit param.", status: 400 });
    return;
  }

  const start = cursor ? parseInt(cursor, 10) : 0;
  const end = parseInt(limit, 10) + start;

  let kitties = rankedKitties;

  if (kittyNumber) {
    if (Array.isArray(kittyNumber)) {
      kitties = kitties.filter((i) => kittyNumber.includes(i.number));
    } else {
      kitties = kitties.filter((i) => i.number === kittyNumber);
    }
  }

  const paginatedKitties = kitties.slice(start, end);
  const hasNextPage = parseInt(limit, 10) < kitties.length;
  const nextCursor = hasNextPage ? end : null;

  res.status(200).json({
    kitties: paginatedKitties,
    nextCursor,
    hasNextPage,
  });
};
