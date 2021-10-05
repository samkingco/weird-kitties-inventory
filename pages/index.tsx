import { useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import useSWRInfinite from "swr/infinite";
import { KeyLoader } from "swr";
import { fetcher, FetchError, isValidAddress, Kitty } from "../utils";
import { KittiesResponse } from "./api/kitties";

const getKey: (
  limit: number,
  kittyNumbers: string[],
  walletAddress: string
) => KeyLoader<KittiesResponse> =
  (limit, kittyNumbers, walletAddress) => (_, previousPageData) => {
    if (previousPageData && !previousPageData.hasNextPage) return null;

    const queryParams = new URLSearchParams();

    queryParams.set("limit", limit.toString());

    if (previousPageData && previousPageData.nextCursor) {
      queryParams.set("cursor", previousPageData.nextCursor.toString());
    }
    if (walletAddress && isValidAddress(walletAddress)) {
      queryParams.set("walletAddress", walletAddress);
    } else {
      kittyNumbers.forEach((kittyNumber) => {
        queryParams.append("kittyNumber", kittyNumber);
      });
    }

    return `/api/kitties?${queryParams.toString()}`;
  };

const Home: NextPage = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const validWallet = isValidAddress(walletAddress);

  const [searchTerm, setSearchTerm] = useState("");
  const kittyNumbers = searchTerm
    ? searchTerm.split(",").map((i) => i.trim())
    : [];

  const PAGE_SIZE = 60;
  const { data, error, size, setSize } = useSWRInfinite<
    KittiesResponse,
    FetchError
  >(getKey(PAGE_SIZE, kittyNumbers, walletAddress), fetcher);

  const kitties = data
    ? data.reduce((acc: Kitty[], page) => [...acc, ...page.kitties], [])
    : [];
  const isLoadingInitialData = !data && !error;
  const isLoadingMore = Boolean(
    isLoadingInitialData ||
      (size > 0 && data && typeof data[size - 1] === "undefined")
  );
  const isEmpty = data && data[0]?.kitties.length === 0;
  const hasReachedEnd =
    isEmpty || (data && !data[data.length - 1]?.hasNextPage);

  return (
    <div className="page">
      <Head>
        <title>Weird Kitties</title>
        <meta
          name="description"
          content="This is a WIP ranking tool for Weird Kitties, a collection of 777 weird, limited, and unique kitties living on the Etherum blockchain."
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </Head>

      <main className="main">
        <div className="center-content">
          <a href="https://weirdkitties.com/">
            <img src="/wk-logo.png" width={280} />
          </a>
        </div>

        <div className="search-container">
          <input
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.currentTarget.value)}
            placeholder="Paste wallet address"
          />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            placeholder="Search by kitty numbers"
            disabled={Boolean(walletAddress && validWallet)}
          />
        </div>

        {isLoadingInitialData && (
          <div className="center-content">
            <div className="loading-indicator" />
          </div>
        )}

        {isEmpty ? (
          <div className="center-content">
            <p>
              <strong>No kitties found 😿</strong>
            </p>
          </div>
        ) : (
          <article className="kitty-grid">
            {kitties.map((kitty) => {
              const openSeaLink = `https://opensea.io/assets/0x495f947276749ce646f68ac8c248420045cb7b5e/${kitty.tokenId}`;

              return (
                <div className="kitty" key={kitty.tokenId}>
                  <a href={openSeaLink}>
                    <img src={kitty.image} alt={kitty.name} />
                  </a>
                  <p className="kitty-meta">
                    <a href={openSeaLink}>{kitty.name}</a>
                    <br />
                    <span className="subdued">Rank {kitty.rank}</span>
                  </p>
                </div>
              );
            })}
          </article>
        )}

        {!(hasReachedEnd || isLoadingInitialData || isLoadingMore) && (
          <div className="center-content">
            <button onClick={() => setSize(size + 1)} disabled={isLoadingMore}>
              See more kitties
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
