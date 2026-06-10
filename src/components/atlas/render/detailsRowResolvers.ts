import type { AtlasRenderContext } from "../../../definitions/Atlas";

export type DetailsRowResolver = (
  context: AtlasRenderContext,
  args?: Record<string, unknown>,
) => unknown;

export const detailsRowResolvers: Record<string, DetailsRowResolver> = {
  "country.capitalCityName": (context) => {
    const entity = context.entity as {
      cities?: Array<{
        name?: string;
        capital?: boolean;
      }>;
    };

    return (
      entity.cities?.find((city) => city.capital === true)?.name ?? ""
    );
  },

  "country.cityCount": (context) => {
    const entity = context.entity as {
      cities?: unknown[];
    };

    return entity.cities?.length ?? 0;
  },
};
