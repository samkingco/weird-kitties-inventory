import type { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";
import kittiesData from "../../../data/ranked-kitties.json";
import { Kitty, parseAddress, ResponseError } from "../../../utils";

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
  const walletAddress = req.query.walletAddress as string;
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

  if (walletAddress) {
    const { address, isValid } = await parseAddress(walletAddress);

    if (address && isValid && process.env.OS_API_KEY) {
      // Get tokenIds in wallet from opensea
      const response = await fetch(
        `https://api.opensea.io/api/v1/assets?asset_contract_address=0x495f947276749ce646f68ac8c248420045cb7b5e&collection=weird-kitties&limit=50&owner=${address}`,
        { headers: { "X-API-KEY": process.env.OS_API_KEY } }
      );

      // Parse to JSON
      const json: any = await response.json();
      const ownedTokenIds = json.assets.map((asset: any) => asset.token_id);
      kitties = kitties.filter((i) => ownedTokenIds.includes(i.tokenId));
    }
  }

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
