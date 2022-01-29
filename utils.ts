import { ethers } from "ethers";

export interface Kitty {
  tokenId: string;
  name: string;
  number: string;
  image: string;
  attributes: KittyAttribute[];
  rank: number;
}

export interface KittyAttribute {
  type: string;
  value: string;
}

export interface ResponseError {
  message: string;
  status: number;
}

export interface FetchError extends Error {
  status: number;
}

export async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the data."
    ) as FetchError;
    error.message = await res.json();
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export async function parseAddress(address: string) {
  const provider = ethers.getDefaultProvider();
  let ensAddress;
  if (address.trim().endsWith(".eth")) {
    ensAddress = await provider.resolveName(address);
  }
  try {
    ethers.utils.getAddress(ensAddress || address);
  } catch (e) {
    return {
      address: ensAddress || address,
      isValid: false,
    };
  }
  return {
    address: ensAddress || address,
    isValid: true,
  };
}
