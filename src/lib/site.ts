interface AssetUrlOpts {
  documentOrigin?: boolean;
  pathOnly?: boolean;
  pathVersion?: true | string;
}

export const baseUrl = () => document.body.getAttribute("data-asset-url") || "";

//const assetVersion = () => document.body.getAttribute("data-asset-version");

export const url = (path: string, opts: AssetUrlOpts = {}) => {
  const base = opts.documentOrigin
    ? window.location.origin
    : opts.pathOnly
      ? ""
      : baseUrl();
  //const pathVersion = !opts.pathVersion
  //? ""
  //: opts.pathVersion === true
  //? `_${assetVersion()}/`
  //: `_${opts.pathVersion}/`;
  //const hash = !pathVersion && site.manifest.hashed[path];
  return `${base}${path}`;
};

//function asHashed(path: string, hash: string) {
//const name = path.slice(path.lastIndexOf("/") + 1);
//const extPos = name.lastIndexOf(".");
//return `hashed/${extPos < 0 ? `${name}.${hash}` : `${name.slice(0, extPos)}.${hash}${name.slice(extPos)}`}`;
//}

const scriptCache = new Map<string, Promise<void>>();

const script = (src: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const nonce = document.body.getAttribute("data-nonce"),
      el = document.createElement("script");
    if (nonce) el.setAttribute("nonce", nonce);
    el.onload = resolve as () => void;
    el.onerror = reject;
    el.src = src;
    document.head.append(el);
  });

export const loadIife = (u: string, opts: AssetUrlOpts = {}): Promise<void> => {
  if (!scriptCache.has(u)) scriptCache.set(u, script(url(u, opts)));
  return scriptCache.get(u)!;
};
