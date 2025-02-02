// import { useState } from "react";
import { motion } from "framer-motion";
import AvaiableSoon from "@/components/Atoms/AvaiableSoon";

// const mockTokenLaunches = [
//   {
//     signature:
//       "4ikuYPcK75jWMDoqMqrb2qyBjYG26ZtD5CZyS2D2sXBmzheTotV1EWe6cXmsyHncQdzTea9jiNUnKUzTp2zAsvye",
//     mint: "3acpPNa9CJt8Grne5grf6e3Dej8oZkHTtCtB3hugXYRf",
//     traderPublicKey: "ELdfNbHR4HgmiaQ44UyRxGWTjFpTuwqfCyy6oq8CMDaJ",
//     txType: "create",
//     initialBuy: 2000000.45,
//     solAmount: 10.25,
//     bondingCurveKey: "DYRDgYy7JYYvKGu7xDMuQA6K4zo8PnJWcjPQHAJTf3yo",
//     vTokensInBondingCurve: 500000.34,
//     vSolInBondingCurve: 25.45,
//     marketCapSol: 50.2,
//     name: "DeepDive",
//     symbol: "DeepGPT",
//     uri: "https://ipfs.io/ipfs/QmYaA88yjqyXU7c4D3cYUBwPkZym7QhZiayQeDrvZNXZuW",
//     pool: "pump",
//     timestamp: 1672531200000,
//   },
//   {
//     signature:
//       "2mktXPfC12345DoqMqrb2qyBjYG26ZtD5CZyS2D2sXBmzheTovWE6cXmsyHncQdzTea9jiNUnKUzTp2zAsvye",
//     mint: "1bcpPQ3Jt9CJt8Grne5grf6e3Dej8oZkHTtCtB3hugXYRf",
//     traderPublicKey: "VLdfNbHR4HgmiaQ44UyRxGWTjFpTuwqfCyy6oq8CMDaL",
//     txType: "buy",
//     initialBuy: 1500000.67,
//     solAmount: 5.8,
//     bondingCurveKey: "JTYRgXrY7JYYvKGu7xDMuQA6K4zo8PnJWcjPQHAJTf3yo",
//     vTokensInBondingCurve: 800000.99,
//     vSolInBondingCurve: 30.65,
//     marketCapSol: 35.89,
//     name: "MoonToken",
//     symbol: "MOON",
//     uri: "https://ipfs.io/ipfs/QmYaC79Djz4HgmG4YQUkZYAYfRNfCqAukDrLyRkmBZL3Qo",
//     pool: "pump",
//     timestamp: 1672617600000,
//   },
// ];

// type FilterKey =
//   | "initialBuy"
//   | "marketCapSol"
//   | "vTokensInBondingCurve"
//   | "vSolInBondingCurve";

// interface Filter {
//   min: number;
//   max: number;
// }

export default function TokenTab() {
  // const [tokenLaunches] = useState(mockTokenLaunches);
  // const [filters, setFilters] = useState<Record<FilterKey, Filter>>({
  //   initialBuy: { min: 0, max: Infinity },
  //   marketCapSol: { min: 0, max: Infinity },
  //   vTokensInBondingCurve: { min: 0, max: Infinity },
  //   vSolInBondingCurve: { min: 0, max: Infinity },
  // });
  // const [appliedFilters, setAppliedFilters] = useState(filters);

  // const handleFilterChange = (
  //   key: FilterKey,
  //   type: "min" | "max",
  //   value: number
  // ) => {
  //   setFilters((prevFilters) => ({
  //     ...prevFilters,
  //     [key]: {
  //       ...prevFilters[key],
  //       [type]: value,
  //     },
  //   }));
  // };

  // const handleApplyFilters = () => {
  //   setAppliedFilters(filters);
  // };

  // const handleResetFilters = () => {
  //   const defaultFilters = {
  //     initialBuy: { min: 0, max: Infinity },
  //     marketCapSol: { min: 0, max: Infinity },
  //     vTokensInBondingCurve: { min: 0, max: Infinity },
  //     vSolInBondingCurve: { min: 0, max: Infinity },
  //   };
  //   setFilters(defaultFilters);
  //   setAppliedFilters(defaultFilters);
  // };

  // const filteredLaunches = tokenLaunches.filter((launch) => {
  //   return (
  //     launch.initialBuy >= appliedFilters.initialBuy.min &&
  //     launch.initialBuy <= appliedFilters.initialBuy.max &&
  //     launch.marketCapSol >= appliedFilters.marketCapSol.min &&
  //     launch.marketCapSol <= appliedFilters.marketCapSol.max &&
  //     launch.vTokensInBondingCurve >=
  //       appliedFilters.vTokensInBondingCurve.min &&
  //     launch.vTokensInBondingCurve <=
  //       appliedFilters.vTokensInBondingCurve.max &&
  //     launch.vSolInBondingCurve >= appliedFilters.vSolInBondingCurve.min &&
  //     launch.vSolInBondingCurve <= appliedFilters.vSolInBondingCurve.max
  //   );
  // });

  return (
    <div className="flex">
      {/* Sidebar de Filtros */}
      {/* <div className="w-64 bg-gray-900 text-white p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="space-y-4">
          {(
            [
              "initialBuy",
              "marketCapSol",
              "vTokensInBondingCurve",
              "vSolInBondingCurve",
            ] as FilterKey[]
          ).map((key) => (
            <div key={key}>
              <label className="text-sm font-bold capitalize">
                {key.replace(/([A-Z])/g, " $1")}:
              </label>
              <div className="flex space-x-2 mt-1">
                <input
                  type="number"
                  className="w-full p-2 bg-gray-800 rounded-lg"
                  placeholder="Min"
                  onChange={(e) =>
                    handleFilterChange(key, "min", Number(e.target.value))
                  }
                />
                <input
                  type="number"
                  className="w-full p-2 bg-gray-800 rounded-lg"
                  placeholder="Max"
                  onChange={(e) =>
                    handleFilterChange(key, "max", Number(e.target.value))
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <button
          className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
          onClick={handleApplyFilters}
        >
          Apply Filters
        </button>
        <button
          className="w-full mt-2 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
          onClick={handleResetFilters}
        >
          Reset Filters
        </button>
      </div> */}

      {/* Cards de Token Launch */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 gap-6 flex-1 ml-6"
      >
        {/* {filteredLaunches.map((launch, index) => (
          <TokenCard key={index} launch={launch} />
        ))} */}
              <AvaiableSoon/>
      </motion.div>
    </div>
  );
}
