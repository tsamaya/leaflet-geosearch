import AbstractProvider, {
  EndpointArgument,
  ParseArgument,
  ProviderOptions,
  RequestType,
  SearchResult,
} from './provider';

export type RequestResult = RawResult[];

export interface RawResult {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
}

export type OpenStreetMapProviderOptions = {
  searchUrl?: string;
  reverseUrl?: string;
} & ProviderOptions;

export default class CivilDefenseMapProvider extends AbstractProvider<
  RawResult[],
  RawResult
> {
  searchUrl: string;
  reverseUrl: string;

  constructor(options: OpenStreetMapProviderOptions = {}) {
    super(options);

    const host = 'https://civildefense.fit.vutbr.cz';
    this.searchUrl = options.searchUrl || `${host}/search`;
    this.reverseUrl = options.reverseUrl || `${host}/reverse`;
  }

  endpoint({ query, type }: EndpointArgument): string {
    const params = typeof query === 'string' ? { q: query } : query;
    params.format = 'json';

    switch (type) {
      case RequestType.REVERSE:
        return this.getUrl(this.reverseUrl, params);

      default:
        return this.getUrl(this.searchUrl, params);
    }
  }

  parse(response: ParseArgument<RequestResult>): SearchResult<RawResult>[] {
    const records = Array.isArray(response.data)
      ? response.data
      : [response.data];

    return records.map((r) => ({
      x: Number(r.lon),
      y: Number(r.lat),
      label: r.display_name,
      bounds: [
        [parseFloat(r.boundingbox[0]), parseFloat(r.boundingbox[2])], // s, w
        [parseFloat(r.boundingbox[1]), parseFloat(r.boundingbox[3])], // n, e
      ],
      raw: r,
    }));
  }
}
