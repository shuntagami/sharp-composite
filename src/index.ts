import sharp from "sharp";

const getImageAttributes = async (path: string) => {
  const image = sharp(path);
  const metadata = await image.metadata();
  const buf = await image.toBuffer();
  return {
    width: metadata.width as number,
    height: metadata.height as number,
    buf,
  };
};

const main = async () => {
  const imagePaths = ["images/1.jpg", "images/2.jpg", "images/3.jpg"];
  const imageAttrs = await Promise.all(imagePaths.map(getImageAttributes));

  const outputImgWidth = imageAttrs.reduce((acc, { width }) => acc + width, 0);
  const outputImgHeight = Math.max(...imageAttrs.map(({ height }) => height));

  const compositeParams = imageAttrs.reduce(
    (
      acc: { totalLeft: number; params: sharp.OverlayOptions[] },
      { width, buf }
    ) => {
      const left = acc.totalLeft;
      acc.totalLeft += width;
      acc.params.push({ input: buf, gravity: "northwest", left, top: 0 });
      return acc;
    },
    { totalLeft: 0, params: [] }
  ).params;

  await sharp({
    create: {
      width: outputImgWidth,
      height: outputImgHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite(compositeParams)
    .toFile("output.png");
};

main();
