export interface Kitty {
  tokenId: string;
  name: string;
  number: string;
  image:  string;
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
