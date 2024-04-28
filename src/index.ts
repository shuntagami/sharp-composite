import sharp from "sharp";
import fs from "fs";
import path from "path";

interface TilePosition {
  x: number;
  y: number;
  path: string;
}

const getTilePositions = (folderPath: string): TilePosition[] => {
  const fileNames = fs.readdirSync(folderPath);
  return fileNames
    .map((fileName) => {
      const parts = fileName.split(".png")[0]?.split("-")?.map(Number);
      if (!parts) {
        return null;
      }
      if (
        parts.length === 2 &&
        !isNaN(parts[0] as number) &&
        !isNaN(parts[1] as number)
      ) {
        const [x, y] = parts;
        return { x, y, path: path.join(folderPath, fileName) };
      }
      return null;
    })
    .filter((position) => position !== null) as TilePosition[];
};

const createCompositeImage = async (
  tilePositions: TilePosition[],
  outputFilePath: string
): Promise<void> => {
  if (tilePositions.length === 0) {
    return;
  }

  if (!tilePositions[0]) {
    return;
  }

  const firstTile = await sharp(tilePositions[0].path).metadata();
  const tileWidth = firstTile.width;
  const tileHeight = firstTile.height;
  if (!tileWidth || !tileHeight) {
    return;
  }
  const maxX = Math.max(...tilePositions.map((tile) => tile.x));
  const maxY = Math.max(...tilePositions.map((tile) => tile.y));

  const compositeParams = tilePositions.map(({ path, x, y }) => ({
    input: path,
    left: x * tileWidth,
    top: y * tileHeight,
  }));

  await sharp({
    create: {
      width: (maxX + 1) * tileWidth,
      height: (maxY + 1) * tileHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(compositeParams)
    .toFile(outputFilePath);
};

const main = async (): Promise<void> => {
  const folderPath = "./images/tiles";
  const outputFilePath = "./results/out.png";

  const tilePositions = getTilePositions(folderPath);
  await createCompositeImage(tilePositions, outputFilePath);
};

main();
