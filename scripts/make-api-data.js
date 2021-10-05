const fs = require("fs");
const path = require("path");

const kittiesJSON = fs.readFileSync(
  path.join(process.cwd(), "./data/kitties.json")
);

const rarityJSON = fs.readFileSync(
  path.join(process.cwd(), "./data/rarity.json")
);

const kitties = JSON.parse(kittiesJSON);
const rarity = JSON.parse(rarityJSON);

const combined = rarity.map((i) => ({
  ...kitties[i.number],
  rank: i.rarest,
}));

console.log(combined);

fs.writeFileSync(
  path.join(process.cwd(), "./data/ranked-kitties.json"),
  JSON.stringify(combined, null, 2)
);
