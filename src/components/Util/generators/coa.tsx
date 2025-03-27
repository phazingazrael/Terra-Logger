export function generateCOA(
	format?: string,
	size?: number,
	seed?: number,
	colors?: string,
	coaString?: string,
) {}

// // extended route: queries
// router.get("/", async function (req, res, next) {
//   const format = req.query.get || req.query.format || FORMAT_DEFAULT;
//   const size = parseInt(req.query.size) || SIZE_DEFAULT;
//   const seed = req.query.seed ? parseSeed(req.query.seed) : Math.floor(Math.random() * 1e9);
//   const colors = getColors(req.query);
//   const coaString = req.query.coa;

//   try {
//     const collection = req.app.locals.collection;
//     const coa = coaString ? JSON.parse(coaString) : await getCOA(collection, seed);
//     if (req.query.shield) coa.shield = req.query.shield;
//     if (!coa.shield) coa.shield = SHIELD_DEFAULT;

//     const id = "coa" + (seed || Math.floor(Math.random() * 1e6));
//     const svg = await render(id, coa, size, colors);
//     send(format, svg, res);
//   } catch (error) {
//     return next(error);
//   }
// });
