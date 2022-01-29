import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useQueryState } from "next-usequerystate";
import useSWRInfinite from "swr/infinite";
import { fetcher, FetchError, Kitty, parseAddress } from "../utils";
import { KittiesResponse } from "./api/kitties";
import { KeyLoader } from "swr";

function keyMaker(
  limit: number,
  kittyNumbers: string[],
  walletAddress: string,
  isValidAddress: boolean
): KeyLoader<KittiesResponse> {
  return (_, previousPageData) => {
    if (previousPageData && !previousPageData.hasNextPage) return null;
    if (walletAddress && !isValidAddress) return null;

    const queryParams = new URLSearchParams();
    queryParams.set("limit", limit.toString());
    if (previousPageData && previousPageData.nextCursor) {
      queryParams.set("cursor", previousPageData.nextCursor.toString());
    }
    if (walletAddress) {
      queryParams.set("walletAddress", walletAddress);
    }
    if (kittyNumbers && kittyNumbers.length > 0) {
      kittyNumbers.forEach((kittyNumber) => {
        queryParams.append("kittyNumber", kittyNumber);
      });
    }

    return `/api/kitties?${queryParams.toString()}`;
  };
}

const Home: NextPage = () => {
  const [walletAddress, setWalletAddress] = useQueryState("address");
  const [walletAddressInput, setWalletAddressInput] = useState(
    walletAddress || ""
  );
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [parsedAddress, setParsedAddress] = useState("");
  const [searchTerm, setSearchTerm] = useQueryState("kitty");
  const [searchTermInput, setSearchTermInput] = useState(searchTerm || "");
  const kittyNumbers = searchTermInput
    ? searchTermInput.split(" ").map((i) => i.trim())
    : [];

  useEffect(() => {
    if (walletAddressInput) {
      setIsValidatingAddress(true);
      parseAddress(walletAddressInput)
        .then(({ address, isValid }) => {
          setParsedAddress(address);
          setIsValidAddress(isValid);
          setIsValidatingAddress(false);
        })
        .catch((e) => {
          console.error(e);
          setIsValidatingAddress(false);
        });
    } else {
      setParsedAddress("");
    }
  }, [walletAddressInput]);

  useEffect(() => {
    setWalletAddress(walletAddressInput === "" ? null : walletAddressInput);
  }, [walletAddressInput]);

  useEffect(() => {
    setSearchTerm(searchTermInput === "" ? null : searchTermInput);
  }, [searchTermInput]);

  const PAGE_SIZE = 60;
  const { data, error, size, setSize } = useSWRInfinite<
    KittiesResponse,
    FetchError
  >(keyMaker(PAGE_SIZE, kittyNumbers, parsedAddress, isValidAddress), fetcher);

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
            value={walletAddressInput || ""}
            onChange={(e) => setWalletAddressInput(e.currentTarget.value)}
            placeholder="Paste wallet address"
          />
          <input
            value={searchTermInput || ""}
            onChange={(e) => setSearchTermInput(e.currentTarget.value)}
            placeholder="Search by kitty numbers"
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

        {!(
          hasReachedEnd ||
          isLoadingInitialData ||
          isValidatingAddress ||
          isLoadingMore
        ) && (
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
