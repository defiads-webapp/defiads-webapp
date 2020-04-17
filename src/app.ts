import {
	isNone,
	isSome,
	none,
	defiadsClientFactory,
	defiadsFactory,
	asyncToFirstOf,
	optionTo,
	toNumber,
	asyncToChain,
	as,
	toChain,
	isString,
	unwrap,
	toTuple,
	toHtmlElement,
	focus,
	toOf,
	wrap,
	push,
	spreadArgs,
	flatAndTo,
	toJsonValue,
	isJsonObject,
	toJsonString,
	toNone,
	strictOrTo,
	flat,
	fromNullable,
	tryCatch,
	op,
	objectIsOfSome,
	unflat,
	toDisplayJsonString,
	isNonEmptyString,
	isArrayOf,
	ops,
	isListItem,
	shift,
	unwrapOr,
	strictAndTo,
	toString,
	filter,
	apiHelp,
	andIs,
	split,
	toFirstOf,
	toSelf,
	isDefiadsClientMethod,
	orIs,
	isSame,
	swap,
	asyncFlatAndTo,
	generateKey,
	keyToString,
	keyToJwk,
	jwkToString,
	jwkToPublic,
	jwkToKey,
	stringToJwk,
	jwkIsPrivate,
	sign,
	verify,
	hide,
	menuClearHighlight,
	menuUnselect,
	show,
	menuHighlight,
	menuSelect,
	withHtmlElement, xhrTransport, pre, digest,
} from "./core";
import type {
	AsyncToFn,
	DefiadId,
	DefiadsApi,
	DefiadsClient,
	DefiadsClientContext,
	JSONValue,
	Option,
	Transport,
	ToFn,
	RetToFn,
	DefiadCategory,
	ListItem,
	Fn,
	DefiadsApiWallet,
	IsFn,
	AsyncOption,
	ArgFn,
	Balance,
	Ad,
	AsyncFn,
	Err,
	PartialOptional,
	ErrHandler,
	SpreadArgsOverload2,
	DefiadsClientMethod,
	Prepared,
	DisplayableAd,
	WithMetaData,
	MultiStorage,
	DisplayContext,
	ContextCache, InputContext, InputLock, ErrHandlerMap, Context, ComposerContext,
} from "./types";
import Timeout = NodeJS.Timeout;

////////////////////////////////////////////////////////////////////////////////////////////////
/// 								Runtime Config
////////////////////////////////////////////////////////////////////////////////////////////////
///		Use this section in the final release target.html file to configure default
///		configuration values. This is useful for browsers like Brave, which don't allow access
///		to local storage for file protocol.
////////////////////////////////////////////////////////////////////////////////////////////////

const CONFIG = {
	endpoint: undefined,
	apiKey: undefined,
	privateKey: undefined,
};

const READ_ONLY_MODE = false;
const CURRENT_VERSION = 0 as const;
const AUTHORIZED_RELEASE_ISSUER = "e237cb4bf87442aff8b40a305332b02e3973d6cc01dd4abbf3f7f1057c806f5f" as const;

/// App Context and Context elements constructors

const getTransport: Fn<Context, Transport> =
	flat(strictOrTo)(
		(context: Context) => context.transport,
		(context: Context) => context.transport = xhrTransport,
	);

const getErrHandlerMap: Fn<Context, ErrHandlerMap> =
	flat(strictOrTo)(
		(context: Context) => context.errHandlerMap,
		(context: Context) => context.errHandlerMap = {
			default: toChain(op(console.log), toNone),
		},
	);

const getErrHandler: Fn<Context, ErrHandler> =
	(context: Context) =>
		(err: Err) => {
			const errHandlerMap = getErrHandlerMap(context);
			if (isNone(errHandlerMap)) {
				return none;
			}
			if (err.code in errHandlerMap) {
				return errHandlerMap[err.code](err);
			}
			return errHandlerMap.default(err);
		};

const getDefiadsClientContext: AsyncToFn<Context, DefiadsClientContext> =
	asyncToFirstOf(
		(context: Context) => context.defiadsClientContext,
		(context: Context) => asyncToChain(
			async (context: Context): Promise<PartialOptional<DefiadsClientContext>> => {
				const get = getVarGetter(getMultiStorage(context));
				const endpoint = await get("endpoint");
				const apiKey = await get("apiKey");
				return {
					endpoint,
					apiKey,
					errHandler: getErrHandler(context),
					transport: getTransport(context),
				};
			},
			toFirstOf(as(objectIsOfSome), op(console.log)),
			(clientConfig: DefiadsClientContext) => context.defiadsClientContext = clientConfig,
		)(context),
	);

const getDefiadsClient: AsyncToFn<Context, DefiadsClient> =
	asyncToFirstOf(
		(context: Context) => context.defiadsClient,
		async (context: Context) => context.defiadsClient = optionTo(defiadsClientFactory)(await getDefiadsClientContext(context))
	);

const getDefiadsApi: AsyncToFn<Context, DefiadsApi> =
	asyncToFirstOf(
		(context: Context) => context.defiadsApi,
		async (context: Context) => context.defiadsApi = optionTo(defiadsFactory)(await getDefiadsClient(context)),
	);

const getDefiadsApiWallet: AsyncToFn<Context, DefiadsApiWallet> =
	asyncToFirstOf(
		(context: Context) => context.defiadsApiWallet,
		(context: Context) => asyncToChain(
			getDefiadsApi,
			async (defiads: DefiadsApi) => {
				const get = getVarGetter(getMultiStorage(context));
				const passphrase = await get("passphrase");
				return isSome(passphrase) ? defiads.wallet(passphrase) : none;
			},
			(wallet: DefiadsApiWallet) => context.defiadsApiWallet = wallet,
		)(context),
	);

const getPrivateKey: AsyncToFn<Context, CryptoKey> =
	asyncToFirstOf(
		(context: Context) => context.privateKey,
		(context: Context) => asyncToChain(
			asyncToFirstOf(
				asyncToChain(
					getMultiStorage,
					swap(getVarGetter)("privateKey"),
					stringToJwk,
					as(jwkIsPrivate),
					jwkToKey
				),
				asyncToChain(
					generateKey,
					(keyPair: CryptoKeyPair) => keyPair.privateKey,
					op(asyncToChain(
						keyToString,
						(keyString: string) => ({ default: keyString }),
						swap(unflat(getVarGetter)(getMultiStorage(context)))("showPrivateKey")
					)),
				),
			),
			op((privateKey: CryptoKey) => context.privateKey = privateKey),
		)(context)
	);

const getComposerContext: Fn<Context, ComposerContext> = flat(strictOrTo)(
	(context: Context) => context.composerContext,
	(context: Context) => context.composerContext = {
		display: true,
		defiadId: none,
		prepared: none,
	},
);

const getCache: Fn<Context, ContextCache> = flat(strictOrTo)(
	(context: Context) => context.cache,
	(context: Context) => context.cache = {},
);

const getMultiStorage: Fn<Context, MultiStorage> =
	flat(strictOrTo)(
		(context: Context) => context.multiStorage,
		(context: Context) => context.multiStorage = flat(strictAndTo)(
			getCache,
			flat(strictAndTo)(getStorage, createMultiStorage)("local")
		)(context),
	);

/// Storage functions

const getStorage = tryCatch((type: "local" | "session") => type === "session" ? sessionStorage : localStorage);

const createMultiStorage = (storage: Option<Storage>) =>
	(cache: ContextCache): MultiStorage => ({
		get: (key: string) => cache[key] ?? (
			isSome(storage) ? fromNullable(tryCatch(storage.getItem.bind(storage)))(key) : none
		),
		set:
			(key: string) =>
				(value: string) => {
					cache[key] = value;
					return true;
				},
		persist:
			(key: string) =>
				(value: string) => {
					if (isSome(storage)) {
						tryCatch(unflat(storage.setItem.bind(storage))(key))(value);
					}
					return true;
				},
		delete: (key: string) => {
			cache[key] = none;
			if (isSome(storage)) {
				tryCatch(storage.removeItem.bind(storage))(key);
			}
			return true;
		},
		hasStorage: isSome(storage),
	});

const getVarGetter = (storage: MultiStorage, extraContext?: PartialOptional<InputContext>): AsyncToFn<keyof InputMap, string> =>
	asyncToFirstOf(
		storage.get,
		asyncToChain(
			configureInputContext(storage, extraContext ?? {}),
			(inputContext: InputContext) => asyncToChain(
				requestInput,
				op(storage.set(inputContext.name)),
			)(inputContext),
		)
	);

const cachedAsyncCall = (storage: MultiStorage, timeoutMs: number) =>
	<T extends JSONValue>(fn: AsyncToFn<string, T>, isFn: IsFn<JSONValue, T>): AsyncToFn<string, T> =>
		asyncToFirstOf(
			toChain(
				storage.get,
				toJsonValue,
				as(isFn)
			),
			(key: string) => asyncToChain(
				fn,
				op(
					toChain(
						toJsonString,
						storage.set(key),
						() => setTimeout(() => storage.delete(key), timeoutMs)
					) as ArgFn<T>
				),
			)(key),
		);


/// User Input component

const inputMap = {
	endpoint: {
		name: "endpoint",
		msg: "Configure defiads endpoint",
		type: "text",
		allowStorage: true,
		allowStorageDefault: true,
		placeholder: "http://hostname:port",
		default: "http://127.0.0.1:21867",
	},
	apiKey: {
		name: "apiKey",
		msg: "Enter API key",
		type: "text",
		allowStorage: true,
		allowStorageDefault: true,
		placeholder: "Enter API key located in defiads config file",
	},
	passphrase: {
		name: "passphrase",
		msg: "Please unlock wallet",
		type: "password",
		allowStorage: false,
		allowStorageDefault: false,
		placeholder: "Enter passphrase",
		submitLabel: "Unlock",
	},
	privateKey: {
		name: "privateKey",
		msg: "Provide private key for signing",
		type: "password",
		allowStorage: true,
		allowStorageDefault: false,
		placeholder: "Leave empty to generate new one",
	},
	showPrivateKey: {
		name: "privateKey",
		msg: "Please save your newly generated private key",
		type: "text",
		allowStorage: true,
		allowStorageDefault: false,
		readonly: true,
		submitLabel: "OK",
	},
	link: {
		name: "link",
		msg: "Enter link to release notes",
		type: "text",
		allowStorage: false,
		allowStorageDefault: false,
	}
} as const;

type InputMap = typeof inputMap;

const inputLock: InputLock = {
	counter: 0,
	resolvers: {}
};


const getInputContext = (name: keyof InputMap): InputContext =>
	inputMap[name];

const configureInputContext = (storage: MultiStorage, extraContext: PartialOptional<InputContext>) =>
	flatAndTo(
		getInputContext,
		(inputContext: InputContext) => ({
			...inputContext,
			...(inputContext.allowStorage ? {
				onRemember: storage.persist(inputContext.name),
				storagePossible: storage.hasStorage,
			} : {}),
			...extraContext
		}),
	);


const requestInput = (inputContext: InputContext): AsyncOption<string> =>
	new Promise<Option<string>>( (_resolve) => {
		if (READ_ONLY_MODE) {
			return _resolve(none);
		}
		if (inputLock.counter++ > 0) {
			if (isNone(inputLock.resolvers[inputContext.name])) {
				inputLock.resolvers[inputContext.name] = [];
			}
			inputLock.resolvers[inputContext.name].push(_resolve);
			inputLock.counter--;
			return;
		}
		const container = unwrap(toHtmlElement("dialog"));
		const containerSecurity = unwrap(toHtmlElement("dialog.security"));
		const msgElement = unwrap(toHtmlElement("dialog.msg"));
		const inputElement = unwrap(toHtmlElement("dialog.input")) as HTMLInputElement;
		const storageElement = unwrap(toHtmlElement("dialog.storage"));
		const storagePossibleElement = unwrap(toHtmlElement("dialog.storage.possible"));
		const storageImpossibleElement = unwrap(toHtmlElement("dialog.storage.impossible"));
		const button = unwrap(toHtmlElement("dialog.submit"));
		const saveElement = unwrap(toHtmlElement("dialog.save")) as HTMLInputElement;

		msgElement.innerText = inputContext.msg;
		inputElement.type = inputContext.type;
		inputElement.readOnly = isSome(inputContext.readonly);

		const storagePossible = inputContext.storagePossible ?? false;
		if (inputContext.allowStorage) {
			show(storageElement);
			container.style.height = "250px";
			if (storagePossible) {
				if (inputContext.allowStorageDefault) {
					saveElement.checked = true;
				}
			} else {
				saveElement.checked = false;
				saveElement.disabled = true;
				hide(storagePossibleElement);
				show(storageImpossibleElement);
			}
		}

		if (isSome(inputContext.min)) {
			inputElement.min = inputContext.min.toString();
		}

		if (isSome(inputContext.max)) {
			inputElement.max = inputContext.max.toString();
		}

		if (isSome(inputContext.placeholder)) {
			inputElement.placeholder = inputContext.placeholder;
		}

		if (isSome(inputContext.submitLabel)) {
			button.innerText = inputContext.submitLabel;
		}

		if (isSome(inputContext.default)) {
			inputElement.value = inputContext.default;
		}

		const buttonListener = () => resolve(inputElement.value);
		const keyBoardListener = (event: KeyboardEvent) => {
			if (event.key === "Enter") {
				buttonListener();
			}
		};

		const resolve = (value: Option<string>) => {
			inputElement.removeEventListener("keyup", keyBoardListener);
			button.removeEventListener("click", buttonListener);
			msgElement.innerText = "";
			inputElement.placeholder = "";
			button.innerText = "Submit";
			hide(storageElement);
			show(storagePossibleElement);
			hide(storageImpossibleElement);
			hide(containerSecurity);
			container.style.height = "200px";
			saveElement.disabled = false;
			inputElement.value = "";
			_resolve(value);
			if (isSome(value) && saveElement.checked && isSome(inputContext.onRemember)) {
				inputContext.onRemember(value);
			}
			saveElement.checked = false;
			if (isSome(inputLock.resolvers[inputContext.name])) {
				inputLock.resolvers[inputContext.name].forEach(r => r(value));
				inputLock.resolvers[inputContext.name] = [];
			}
			inputLock.counter--;
		};

		setTimeout(() => {
			show(containerSecurity);
			inputElement.focus();
		}, 300);

		button.addEventListener("click", buttonListener);
		inputElement.addEventListener("keyup", keyBoardListener);
	});


/// Renderers and display functions

const renderMetaData = (displayContext: DisplayContext): Option<AsyncFn<Context, Option<string>>> => {
	const verifiedElement = unwrap(toHtmlElement("target.verified"));
	const verifiedFullElement = unwrap(toHtmlElement("target.verified.full"));
	const updateElement = unwrap(toHtmlElement("target.update")) as HTMLAnchorElement;
	const metaData = displayContext.metaData;
	[verifiedElement, verifiedFullElement, updateElement].forEach(hide);

	const toVerified = (e: HTMLElement) => {
		e.classList.add("verified");
		e.classList.remove("unverified");
	};
	const toUnverified = (e: HTMLElement) => {
		e.classList.add("unverified");
		e.classList.remove("verified");
	};

	const shouldBeSigned = (displayContext: DisplayContext): boolean =>
		displayContext.cat === "webapp:release";

	if (isNone(metaData)) {
		return none;
	}

	if (!metaData.supported) {
		displayContext.content = pre("Can't render ad because it's metadata is not supported by this client version");
		displayContext.abs = "Unsupported version";
		return none;
	}
	if (!metaData.valid) {
		displayContext.content = pre("Can't render ad because it's metadata is corrupted");
		displayContext.abs = "Corrupted metadata";
		return none;
	}

	if (!metaData.signed && shouldBeSigned(displayContext)) {
		[verifiedElement, verifiedFullElement].forEach(ops(
			e => e.innerText = "Not signed",
			toUnverified,
		));
		show(verifiedElement);
		return none;
	}

	if (!metaData.signed) {
		return none;
	}

	show(verifiedElement);

	if (!metaData.verified) {
		[verifiedElement, verifiedFullElement].forEach(ops(
			e => e.innerText = "Not verified",
			toUnverified,
		));
		displayContext.content = pre("Signature verification failed");
		if (isSome(metaData.pubKeyHash)) {
			verifiedFullElement.innerText = verifiedFullElement.innerText + `: ${metaData.pubKeyHash}`;
		}
		return none;
	}

	const pubKeyHash = unwrap(metaData.pubKeyHash);

	if (displayContext.cat !== "webapp:release") {
		[verifiedElement, verifiedFullElement].forEach(toVerified);

		verifiedElement.innerText = `Verified: ${pubKeyHash.slice(0, 16)}`;
		verifiedFullElement.innerText = `Verified: ${pubKeyHash}`;
		
		return none;
	}

	if (pubKeyHash !== AUTHORIZED_RELEASE_ISSUER) {
		[verifiedElement, verifiedFullElement].forEach(ops(
			e => e.innerText = "Verified: Invalid Release Issuer",
			toUnverified,
		));
		[verifiedElement, verifiedFullElement].forEach(toUnverified);

		return none;
	}


	[verifiedElement, verifiedFullElement].forEach(ops(
		e => e.innerText = "Verified: Authorized Release Issuer",
		toVerified,
	));
	
	const abs = unwrapOr(displayContext.abs, "");
	if (!abs.startsWith("release-") || isNone(toNumber(abs.slice(8)))) {
		return none;
	}

	const textEncoder = new TextEncoder();
	updateElement.href = window.URL.createObjectURL(new Blob([textEncoder.encode(displayContext.content)]));
	updateElement.download = `defiads-webapp-${abs}.html`;
	displayContext.target = none;

	show(updateElement);

	const link = metaData.link;
	if (isNone(link)) {
		return none;
	}

	return asyncToChain(
		getDefiadsApi,
		(defiads: DefiadsApi) => defiads.readOne(link),
		(ad: Ad) => ad.text,
	) as AsyncFn<Context, Option<string>>;

};

const display = (context: Context, displayContext: DisplayContext): void => {
	const catListContainer = unwrap(toHtmlElement("target.catList"));
	const iframe = unwrap(toHtmlElement("target.iframe"));

	hide(iframe);
	hide(catListContainer);

	const getContent = renderMetaData(displayContext);

	if (isSome(getContent)) {
		displayContext.target = none;
		getContent(context).then(
			(html: Option<string>) => {
				if (isNone(html) || isNone(displayContext.content)) {
					return;
				}
				iframe.setAttribute("srcdoc", html);
				iframe.style.display = "inline-block";
			});
	}

	switch (displayContext.target) {
		case "cat":
			hide(iframe);
			if (isSome(displayContext.content)) {
				catListContainer.innerHTML = displayContext.content;
			}
			show(catListContainer);
			break;
		case "iframe":
			hide(catListContainer);
			if (isSome(displayContext.content)) {
				iframe.setAttribute("srcdoc", displayContext.content);
			}
			iframe.style.display = "inline-block";
			break;
		default:
			break;
	}
	const elements = ["defiadId", "cat", "amount", "abs"] as const;

	elements.forEach(key => {
		const element = toHtmlElement(`target.${key}`);
		const fullElement = toHtmlElement(`target.${key}.full`);

		if (isNone(element)) {
			return;
		}
		const data = displayContext[key];
		if (isNone(data)) {
			hide(element);
			return;
		}
		if (isSome(fullElement)) {
			fullElement.innerText = data;
			element.innerText = data.slice(0, 16);
		} else {
			element.innerText = data.slice(0, 64);
		}
		show(element);
		if (key === "cat") {
			if (isSome(displayContext.catLink) && displayContext.catLink) {
				element.setAttribute("data:cat", data);
				element.classList.add("catLink");
			} else {
				element.removeAttribute("data:cat");
				element.classList.remove("catLink");
			}
		}
	});
};

const displayError = (context: Context, message: string) =>
	display(context, {
		target: "iframe",
		abs: "Error",
		content: pre(message),
	});

const checkTxIdsMenu = (context: Context) => {
	const storage = getMultiStorage(context);
	const txIds = unwrapOr(storage.get("txIds"), "");
	if (txIds.length > 0) {
		withHtmlElement("menu.txIds")(show);
	}
};

const updateTxIds = (context: Context, add: string) => {
	const storage = getMultiStorage(context);
	const txIds = unwrapOr(storage.get("txIds"), "") + add + "\n";
	storage.set("txIds")(txIds);
	storage.persist("txIds")(txIds);
	checkTxIdsMenu(context);
	withHtmlElement("menu.txIds")(menuHighlight);
};

const displayTxIds = (context: Context) => {
	const storage = getMultiStorage(context);
	const txIds = unwrapOr(storage.get("txIds"), "");

	menu(context, "blank");
	withHtmlElement("menu.txIds")(ops(menuClearHighlight, menuSelect));
	display(context, {
		target: "iframe",
		content: pre(txIds),
		abs: "Bitcoin transaction IDs",
	});
};

const extractMetaData = async <T extends Prepared>(rawAd: T): Promise<T & WithMetaData> => {

	const chunks = rawAd.abs.split("##");

	const ad: T & WithMetaData = {
		...rawAd,
		abs: chunks[0],
		metaData: {
			valid: true,
			pubKeyHash: none,
			signed: false,
			supported: true,
			verified: false,
			link: none,
		},
	};
	if (chunks.length > 2) {
		ad.metaData.valid = false;
	}
	if (chunks.length !== 2) {
		return ad;
	}
	const version = chunks[1].slice(0, 4);
	if (version !== "0000") {
		ad.metaData.supported = false;
		ad.metaData.valid = false;
		return ad;
	}
	const rawMetaData = flatAndTo(toJsonValue, as(isJsonObject))(chunks[1].slice(4));
	console.log(rawMetaData);
	if (isNone(rawMetaData)) {
		ad.metaData.valid = false;
		return ad;
	}

	ad.metaData.link = as(isString)(rawMetaData.link);

	const publicKeyString = as(isString)(rawMetaData.publicKey);
	const signatureString = as(isString)(rawMetaData.signature);

	if (isNone(publicKeyString) || isNone(signatureString)) {
		return ad;
	}
	ad.metaData.signed = true;

	const publicKeyJwk = stringToJwk(publicKeyString);
	if (isNone(publicKeyJwk)) {
		return ad;
	}

	const signContext = toSignContext(ad, ad.metaData.link);

	try {
		ad.metaData.pubKeyHash = await digest(publicKeyString);
		const publicKey = await jwkToKey(publicKeyJwk);

		console.log(serializeContext(signContext));
		ad.metaData.verified = await verify(serializeContext(signContext), signatureString, publicKey);
		// eslint-disable-next-line no-empty
	} catch (e) { }
	return ad;
};


const adToDisplayContext = (ad: DisplayableAd): DisplayContext => ({
	target: "iframe",
	content: ad.text,
	abs: ad.abs,
	cat: ad.cat,
	catLink: true,
	defiadId: ad.id,
	amount: ad.amount,
	metaData: ad.metaData,
});

const defiadIdToDisplayContext = async (context: Context, defiadId: DefiadId) => asyncToChain(
	getDefiadsApi,
	defiads => defiads.readOne(defiadId),
	extractMetaData,
	ad => ({...ad, amount: formatBitcoinBalance(ad.weight * ad.length)}),
	adToDisplayContext,
)(context);

const expandCat = async (context: Context, cat: Option<DefiadCategory>): Promise<void> => {
	if (isNone(cat)) {
		console.log("Not loading because category is undefined");
		return;
	}
	const storage = getMultiStorage(context);
	const cachedCall = cachedAsyncCall(storage, 60000);

	const defiads: Option<DefiadsApi> = await getDefiadsApi(context);
	if (isNone(defiads)) {
		return;
	}
	const cachedGetAds = cachedCall(() => defiads.list([cat]), isArrayOf(isListItem));
	const allAds = (await cachedGetAds("defiadsAdsIn" + cat));

	if (isNone(allAds)) {
		console.log("Failed to load ads");
		return;
	}
	const ads = allAds.slice(0, 9);

	const createElement = (ad: ListItem) => {
		const chunks = ad.abs.split("##");
		ad.abs = chunks[0];
		const p = document.createElement("p") as HTMLParagraphElement;
		p.innerText = ad.abs.slice(0, 64);
		p.addEventListener("click", async () => {
			const displayContext = await defiadIdToDisplayContext(context, ad.id);
			if (isNone(displayContext)) {
				return;
			}
			display(context, displayContext);
		});
		return p;
	};

	const catListContainer = toHtmlElement("target.catList");
	if (isNone(catListContainer)) {
		return;
	}
	catListContainer.innerHTML = "";

	toOf(flatAndTo(createElement, catListContainer.appendChild.bind(catListContainer)))(ads);
	display(context, {
		target: "cat",
		cat: cat,
		catLink: false,
	});
};

const loadCats = async (context: Context, prefix: string): Promise<void> => {
	const defiads: Option<DefiadsApi> = await getDefiadsApi(context);
	const storage = getMultiStorage(context);
	const cachedCall = cachedAsyncCall(storage, 60000);
	if (isNone(defiads)) {
		return;
	}

	const cachedGetAllCats = cachedCall(() => defiads.categories(), isArrayOf(isString));

	const allCats = await cachedGetAllCats("defiadsCategories");

	if (isNone(allCats)) {
		console.log("Failed to load categories");
		return;
	}
	const catsContainer = toHtmlElement("cats");
	if (isNone(catsContainer)) {
		return;
	}
	const cats = allCats.filter(cat => cat.startsWith(prefix)).slice(0, 9);
	catsContainer.innerHTML = "";
	if (cats.length === 0) {
		return;
	}
	const createElement = (cat: DefiadCategory) => {
		const p = document.createElement("span") as HTMLSpanElement;
		p.innerText = cat.slice(0, 64);
		p.onclick = () => expandCat(context, cat);
		return p;
	};
	toOf(flatAndTo(createElement, catsContainer.appendChild.bind(catsContainer)))(cats);
	return expandCat(context, cats[0]);
};

const formatBitcoinBalance = (amtSat: number): string => {
	const units = {
		sat: 0,
		BTC: 8,
	} as const;
	const keys = Object.keys(units);
	let unit = unwrap(shift(keys)) as keyof typeof units;
	let formatted = amtSat;
	while (keys.length > 0 && formatted > 1000000) {
		unit = unwrap(shift(keys)) as keyof typeof units;
		formatted = amtSat / Math.pow(10, units[unit]);
	}
	return (Math.round(formatted * 1000) / 1000).toString() + " " + unit;
};

const balance =
	asyncToChain(
		getDefiadsApi,
		(defiads: DefiadsApi) => defiads.balance(),
		toChain(
			(result) => [result.total, result.available] as const,
			wrap,
			push(["balance.total", "balance.available"] as const) as RetToFn<[[number, number], [string, string]]>,
			toTuple(toOf(formatBitcoinBalance), toOf(toHtmlElement)),
			(spreadArgs as SpreadArgsOverload2)((formattedBalances: string[], htmlElements: HTMLElement[]) =>
				htmlElements.forEach(e => e.innerHTML = unwrap(formattedBalances.shift())),
			)
		)
	);

const refreshAvailableBalance: AsyncToFn<Context, string> = asyncToChain(
	getDefiadsApi,
	(defiads: DefiadsApi) => defiads.balance(),
	(balance: Balance) => balance.available,
	(available: number) => toChain(
		toHtmlElement as RetToFn<HTMLInputElement>,
		e => e.placeholder = `Available: ${available.toString()}`,
	)("composer.amtSat")
);

const menuMembers = ["explorer", "composer", "publisher", "client", "blank"] as const;

const menu = (context: Context, elementId: string) => {
	const element = toHtmlElement(elementId);
	if (isNone(element)) {
		return;
	}
	const toMenuElement = flatAndTo(key => "menu." + key, toHtmlElement);

	optionTo(menuSelect)(toMenuElement(elementId));

	["update", "txIds"].concat(menuMembers)
		.filter(e => e !== elementId)
		.forEach(ops(
			flatAndTo(toMenuElement, menuUnselect),
			flatAndTo(toHtmlElement, hide),
		));
	if (elementId !== "composer") {
		show(element);
	}

	const composerContext = getComposerContext(context);
	composerContext.display = elementId === "composer";
	renderComposer(context).then(() => {});

	if (elementId === "explorer") {
		const getInputValue = toChain(
			toHtmlElement as ToFn<string, HTMLInputElement>,
			(e: HTMLInputElement) => e.value,
			as(isNonEmptyString),
		);

		const catPrefix = getInputValue("explorer.cat");
		flatAndTo(toHtmlElement, focus)("explorer.cat");

		if (isSome(catPrefix)) {
			loadCats(context, catPrefix).then(() => {});
		} else {
			expandCat(context, "default").then(() => {});
		}
	}

	if (elementId === "client") {
		withHtmlElement("client.method")(focus);
	}

	if (elementId === "composer") {
		const composerContext = getComposerContext(context);
		composerContext.display = true;
		renderComposer(context).then(() => {});
	}
};

const registerMenu = (context: Context) => {
	menuMembers.filter(member => !READ_ONLY_MODE || member !== "composer").forEach(key => {
		const menuElement = toHtmlElement("menu." + key);
		if (isNone(menuElement)) {
			return;
		}
		menuElement.addEventListener("click", () => menu(context, key));
	});
	const walletElement = toHtmlElement("menu.wallet");
	if (isNone(walletElement)) {
		return;
	}

	let timeout: Option<Timeout> = none;

	const walletHide = () => {
		walletElement.classList.remove("selected");
		flatAndTo(toHtmlElement, hide)("wallet");
		timeout = none;
	};
	const walletShow = () => {
		balance(context);
		walletElement.classList.add("selected");
		flatAndTo(toHtmlElement, show)("wallet");
		timeout = setTimeout(walletHide, 30000);
	};

	walletElement.addEventListener("click", () => {
		if (isSome(timeout)) {
			clearTimeout(timeout);
			walletHide();
		} else {
			walletShow();
		}
	});

	const txIdsElement = toHtmlElement("menu.txIds");
	if (isNone(txIdsElement)) {
		return;
	}

	txIdsElement.addEventListener("click", () => displayTxIds(context));

	txIdsElement.addEventListener("dblclick", () => {
		getMultiStorage(context).delete("txIds");
		displayTxIds(context);
	});
};


const registerCatExplorer = (context: Context) => {
	const catElement = toHtmlElement("explorer.cat") as Option<HTMLInputElement>;
	if (isNone(catElement)) {
		return;
	}
	let timeout: Option<Timeout> = none;
	catElement.addEventListener("keyup", (event) => {
		if (catElement.value.length < 2) {
			return;
		}
		if (isSome(timeout)) {
			clearTimeout(timeout);
			timeout = none;
		}
		const handler = (val: string) => loadCats(context, val);
		if (event.key === "Enter") {
			handler(catElement.value).then(() => {});
		} else {
			timeout = setTimeout(() => handler(catElement.value), 500);
		}
	});
};

const serializeContext = (arrayContext: Option<string>[]) =>
	arrayContext.filter(isSome).map((value: string) =>
		value.length.toString(16).padStart(8, "0") + value
	).join("");

const unserializeContext = (serialized: string) : Option<string[]> => {
	const result: string[] = [];

	let index = 0;

	while (index < serialized.length) {
		const length = parseInt(serialized.substr(index, 8), 16);
		if (isNaN(length)) {
			return none;
		}
		const value = serialized.substr(index + 8, length);
		if (value.length !== length) {
			return none;
		}
		result.push(value);
		index += 8 + length;
	}
	return result;
};

const toSignContext = (prepared: Prepared, link: Option<string>) =>
	[prepared.cat, prepared.abs, prepared.text, link].filter(isString);

const renderComposer = async (context: Context): Promise<void> => {
	const composerContext = getComposerContext(context);

	if (!composerContext.display) {
		["composer.preview.edit", "composer", "publisher"].forEach(flatAndTo(toHtmlElement, hide));
		return;
	}

	if (isSome(composerContext.prepared)) {
		const extendedAd = await extractMetaData(composerContext.prepared);
		const displayContext = adToDisplayContext({
			...extendedAd,
			id: composerContext.defiadId,
		});
		displayContext.catLink = false;
		display(context, displayContext);
	}

	if (isSome(composerContext.defiadId)) {
		withHtmlElement("composer.preview.edit")(show);
		withHtmlElement("composer")(hide);
		withHtmlElement("publisher")(show);
		withHtmlElement("composer.amtSat")(focus);
	} else {
		withHtmlElement("composer.preview.edit")(hide);
		withHtmlElement("composer")(show);
		withHtmlElement("publisher")(hide);
		withHtmlElement("composer.content")(focus);
	}
};

const registerComposer = (context: Context) => {
	const catElement = unwrap(toHtmlElement("composer.cat")) as HTMLInputElement;
	const absElement = unwrap(toHtmlElement("composer.abs")) as HTMLInputElement;
	const contentElement = unwrap(toHtmlElement("composer.content")) as HTMLTextAreaElement;
	const signElement =  unwrap(toHtmlElement("composer.sign")) as HTMLInputElement;
	const prepareElement = unwrap(toHtmlElement("composer.prepare")) as HTMLButtonElement;

	const editElement = unwrap(toHtmlElement("composer.preview.edit")) as HTMLButtonElement;
	const amtSatElement = unwrap(toHtmlElement("composer.amtSat")) as HTMLInputElement;
	const termElement = unwrap(toHtmlElement("composer.term")) as HTMLInputElement;
	const feeElement = unwrap(toHtmlElement("composer.fee")) as HTMLInputElement;
	const fundElement = unwrap(toHtmlElement("composer.fund")) as HTMLButtonElement;

	const errHandler = getErrHandler(context);
	const storage = getMultiStorage(context);

	const get = getVarGetter(storage);

	amtSatElement.addEventListener("focus", () => refreshAvailableBalance(context));
	amtSatElement.addEventListener("keyup", () => {
		if (amtSatElement.value === "") {
			refreshAvailableBalance(context);
		}
	});

	absElement.addEventListener("keyup", (event: KeyboardEvent) => {
		if (event.key !== "Enter" || !event.ctrlKey) {
			return;
		}
		storage.delete("link");
		get("link");
	});

	const signAd = async (prepared: Prepared): Promise<void> => {
		const privateKey = await getPrivateKey(context);
		const link = as(isNonEmptyString)(storage.get("link"));
		console.log(privateKey);

		if (isNone(privateKey)) {
			errHandler({
				code: -3,
				message: "Can't get private key",
			});
			return;
		}

		const signature = await asyncToChain(
			flatAndTo(swap(unflat(toSignContext))(link), serializeContext),
			swap(unflat(sign))(privateKey)
		)(prepared);

		console.log(signature);
		if (isNone(signature)) {
			errHandler({
				code: -3,
				message: "Can't sign data",
			});
			return;
		}

		const publicKey = await asyncToChain(
			keyToJwk,
			jwkToPublic,
			jwkToString
		)(privateKey);

		console.log(publicKey);
		if (isNone(publicKey)) {
			errHandler({
				code: -3,
				message: "Can't serialize public key",
			});
			return;
		}

		prepared.abs += "##0000" + unwrap(toJsonString({
			publicKey,
			signature,
			link,
		}));
		console.log(prepared);
	};

	const prepare = (prepared: Prepared) => asyncToChain(
		getDefiadsApi,
		(defiads: DefiadsApi) => defiads.prepare(
			prepared.cat,
			prepared.abs,
			prepared.text
		),
	)(context);

	const doPrepare = async (): Promise<void> => {
		const composerContext = getComposerContext(context);
		composerContext.prepared = {
			cat: catElement.value,
			abs: absElement.value,
			text: contentElement.value,
		};
		if (signElement.checked) {
			await signAd(composerContext.prepared);
		}
		composerContext.defiadId = await prepare(composerContext.prepared);
		return renderComposer(context);
	};

	const doFund = async (): Promise<void> => {
		const composerContext = getComposerContext(context);

		const defiadId = composerContext.defiadId;
		if (isNone(defiadId)) {
			return renderComposer(context);
		}

		const amtSat = toNumber(amtSatElement.value);
		if (isSome(amtSat) && amtSat < 50000) {
			errHandler({
				code: -4,
				message: "Minimum amount is 50000 sat",
			});
			return;
		}

		const numberArgs = toOf(toNumber)([
			amtSatElement.value,
			termElement.value,
			feeElement.value
		]);
		if (isNone(numberArgs)) {
			errHandler({
				code: -2,
				message: "At least one of the numeric arguments is invalid",
			});
			return;
		}

		const wallet = await getDefiadsApiWallet(context);
		if (isNone(wallet)) {
			errHandler({
				code: -2,
				message: "Can't get wallet",
			});
			return;
		}
		const txId = await wallet.fund(defiadId, numberArgs[0], numberArgs[1], numberArgs[2]);
		if (isNone(txId)) {
			errHandler({
				code: -2,
				message: "Can't get transaction ID",
			});
			return;
		}
		updateTxIds(context, txId);
		composerContext.defiadId = none;
		composerContext.display = false;
		catElement.value = "";
		absElement.value = "";
		contentElement.value = "";
		return renderComposer(context);
	};

	const doEdit = async (): Promise<void> => {
		getComposerContext(context).defiadId = none;
		return renderComposer(context);
	};

	prepareElement.addEventListener("click", doPrepare);
	editElement.addEventListener("click", doEdit);
	fundElement.addEventListener("click", doFund);
};

const registerWallet = (context: Context) => {
	const depositElement = unwrap(toHtmlElement("deposit.request"));
	const withdrawElement = unwrap(toHtmlElement("withdraw.request"));
	const errHandler = getErrHandler(context);

	depositElement.addEventListener("click", async () => {
		const defiads = await getDefiadsApi(context);
		if (isNone(defiads)) {
			return;
		}
		const address = await defiads.deposit();
		if (isNone(address)) {
			errHandler({
				code: -2,
				message: "Can't request new deposit address",
			});
			return;
		}
		await requestInput({
			allowStorage: false,
			allowStorageDefault: false,
			default: address,
			msg: "Your new deposit address",
			name: "deposit",
			readonly: true,
			submitLabel: "OK",
			type: "text",
		});
	});

	withdrawElement.addEventListener("click", async () => {
		const err = {
			code: -2,
			message: "User input validation failed",
		};

		const destAddressInput = await requestInput({
			allowStorage: false,
			allowStorageDefault: false,
			msg: "Enter destination address",
			name: "destAddress",
			placeholder: "Destination Bitcoin address",
			type: "text",
		});

		const destAddress = as(isNonEmptyString)(destAddressInput);
		if (isNone(destAddress)) {
			errHandler(err);
			return;
		}

		const placeholder = unwrapOr(await asyncToChain(
			getDefiadsApi,
			(defiads: DefiadsApi) => defiads.balance(),
			(balance: Balance) => balance.available,
			toString,
			(s) => "Available: " + s,
		)(context), "Amount in sat to use all available funds");


		const amtSatInput = await requestInput({
			allowStorage: false,
			allowStorageDefault: false,
			msg: "Enter amount in satoshi",
			name: "feeRate",
			placeholder,
			type: "number",
			min: 50000,
		});

		const amtSat = flatAndTo(toNumber, Math.floor)(amtSatInput);
		if (isNone(amtSat) || amtSat <= 0) {
			errHandler(err);
			return;
		}
		if (amtSat < 50000) {
			errHandler({
				code: -4,
				message: "Minimum amount is 50000 sat",
			});
			return;
		}

		const feeRateInput = await requestInput({
			allowStorage: false,
			allowStorageDefault: false,
			msg: "Enter fee rate (sat/byte)",
			name: "feeRate",
			placeholder: "fee rate (enter 10 if not sure)",
			type: "number",
			max: 1000,
		});

		const feeRate = flatAndTo(toNumber, Math.floor)(feeRateInput);
		if (isNone(feeRate) || feeRate <= 0) {
			errHandler(err);
			return;
		}

		const wallet = await getDefiadsApiWallet(context);
		if (isNone(wallet)) {
			errHandler({
				code: -2,
				message: "Can't get wallet",
			});
			return;
		}

		const txId = await wallet.withdraw(destAddress, feeRate, amtSat);
		if (isNone(txId)) {
			errHandler({
				code: -2,
				message: "Can't get transaction ID",
			});
			return;
		}
		updateTxIds(context, txId);
	});
};

const targetFullScreen = (fullScreen: boolean) => {
	const fullScreenContainer = unwrap(toHtmlElement("fullScreen"));
	const target: HTMLElement = unwrap(toHtmlElement("target"));
	const staticElement = unwrap(toHtmlElement("static"));
	const extrasContainer = unwrap(toHtmlElement("target.extra"));

	if (isNone(fullScreenContainer) || isNone(target) || isNone(staticElement)) {
		return;
	}
	if (fullScreen) {
		show(fullScreenContainer);
		fullScreenContainer.appendChild(target);
		target.style.height = "100%";
		extrasContainer.style.position = "sticky";
	} else {
		hide(fullScreenContainer);
		staticElement.appendChild(target);
		extrasContainer.style.position = "static";
	}
};

const toggleFullScreen = () => {
	const fullScreenContainer = unwrap(toHtmlElement("fullScreen"));
	targetFullScreen(fullScreenContainer.style.display === "none");
};

const registerNavigation = (context: Context) => {
	const listener = (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			targetFullScreen(false);
		}
		if (!event.ctrlKey) {
			return;
		}
		switch (event.key) {
			case "1":
				menu(context, "explorer");
				break;
			case "2":
				if (!READ_ONLY_MODE) {
					menu(context, "composer");
				}
				break;
			case "3":
				menu(context, "client");
				break;
			case "4":
				if (!READ_ONLY_MODE) {
					flatAndTo(toHtmlElement, e => e.dispatchEvent(new Event("click")))("menu.wallet");
				}
				break;
			case "f":
				toggleFullScreen();
				break;
			default:
				break;
		}
	};

	document.body.addEventListener("keyup", listener);
	const iframe = unwrap(toHtmlElement("target.iframe"));
	iframe.addEventListener("keyup", listener);
};

const registerDisplay = (context: Context) => {
	["defiadId", "verified"].forEach((key: string) => {
		const element = unwrap(toHtmlElement(`target.${key}`));
		const fullElement = unwrap(toHtmlElement(`target.${key}.full`));

		let fullTimeout: Option<Timeout> = none;
		element.addEventListener("click", () => {
			hide(element);
			show(fullElement);
			if (isSome(fullTimeout)) {
				clearTimeout(fullTimeout);
				fullTimeout = none;
			}
			fullTimeout = setTimeout(
				() => {
					hide(fullElement);
					show(element);
				},
				1500
			);
		});
	});
	withHtmlElement("target.cat")(e => e.addEventListener("click", () => asyncFlatAndTo(
		fromNullable(e.getAttribute.bind(e)),
		unflat(expandCat)(context)
	)("data:cat")));

	// TODO Scripts support is to be implemented in the next release
	withHtmlElement("target.scripts")(e => e.addEventListener("click", () => {
		const iframeElement = unwrap(toHtmlElement("target.iframe")) as HTMLIFrameElement;
		iframeElement.setAttribute("sandbox", "allow-scripts");
	}));
};

const registerUpdate = async (context: Context) => {
	const defiads: Option<DefiadsApi> = await getDefiadsApi(context);
	if (isNone(defiads)) {
		return;
	}
	const releaseItems = await defiads.list(["webapp:release"]);
	if (isNone(releaseItems)) {
		return;
	}

	const ads = await defiads.read(releaseItems.map((listItem: ListItem) => listItem.id));
	if (isNone(ads)) {
		return;
	}

	let maxVersion: number = READ_ONLY_MODE ? -1 : CURRENT_VERSION;
	let updateCandidate: Option<Ad> = none;

	for (let i = 0; i < ads.length; i++) {
		const rawAd = ads[i];
		const ad = await extractMetaData(rawAd);

		const version = ad.abs.startsWith("release-") ? toNumber(ad.abs.slice(8)): none;
		if (isNone(version) || version <= maxVersion) {
			continue;
		}

		if (!ad.metaData.signed || !ad.metaData.verified || ad.metaData.pubKeyHash !== AUTHORIZED_RELEASE_ISSUER) {
			continue;
		}

		maxVersion = version;
		updateCandidate = rawAd;
	}

	if (isNone(updateCandidate)) {
		return;
	}

	const updateId = updateCandidate.id;
	const updateElement = toHtmlElement("menu.update");
	if (isNone(updateElement)) {
		return;
	}
	updateElement.addEventListener("click", async () => {
		menu(context, "blank");
		const displayContext = await defiadIdToDisplayContext(context, updateId);
		if (isNone(displayContext)) {
			return;
		}
		display(context, displayContext);
		withHtmlElement("menu.update")(ops(menuSelect, menuClearHighlight));
	});
	if (READ_ONLY_MODE) {
		flatAndTo(toHtmlElement, e => e.innerText = "Download")("menu.update");
	}
	show(updateElement);
};

const registerClient = (context: Context) => {
	const storage = getMultiStorage(context);
	const get = getVarGetter(storage);
	const errHandler = getErrHandler(context);

	const methodElement = unwrap(toHtmlElement("client.method")) as HTMLInputElement;
	const paramsElement = unwrap(toHtmlElement("client.params")) as HTMLTextAreaElement;

	const submitRun = async () => {
		const isValidMethod = flat(orIs)(isDefiadsClientMethod, isSame("help")) as IsFn<string, DefiadsClientMethod | "help">;
		const method = as(flat(andIs)(isString, isValidMethod))(methodElement.value);
		const params = toChain(
			as(isString),
			split("\n"),
			filter(isNonEmptyString),
			toOf(toFirstOf(toNumber, toSelf)) as ToFn<Array<string>, Array<string | number>>
		)(paramsElement.value);

		if (isNone(method) || isNone(params)) {
			errHandler({
				code: -2,
				message: "Can't get method or params",
			});
			return;
		}
		const defiadsClient = await getDefiadsClient(context);
		if (isNone(defiadsClient)) {
			errHandler({
				code: -2,
				message: "Can't get defiads client",
			});
			return;
		}


		if (method === "fund" || method === "withdraw") {
			const passphrase = await get("passphrase");
			if (isNone(passphrase)) {
				errHandler({
					code: -2,
					message: "Can't get passphrase",
				});
				return;
			}
			params.unshift(passphrase);
		}

		const result = method === "help"
			? apiHelp
			: await defiadsClient(method)(...params);

		if (isSome(result)) {
			if (method === "fund" || method === "withdraw") {
				updateTxIds(context, unwrap(as(isString)(result)));
			}
			display(context, {
				target: "iframe",
				content: flatAndTo(toDisplayJsonString, pre)(result),
				abs: "command: " + method,
			});
		} else {
			displayError(context, "Execution errored");
		}
	};

	let timeout: Option<Timeout> = none;
	let mayClear = true;
	let count = 4;

	methodElement.setAttribute("placeholder", Object.keys(apiHelp.commands).join(" | "));
	methodElement.addEventListener("keyup", (event: KeyboardEvent): void => {
		mayClear = true;
		if (event.key === "Enter") {
			submitRun().then(() => {});
			return;
		}
		if (isSome(timeout)) {
			clearTimeout(timeout);
			timeout = none;
		}

		const setParamsPlaceholder = (placeholder: string) => {
			const currentPlaceholder = paramsElement.getAttribute("placeholder");
			if (mayClear && currentPlaceholder !== placeholder) {
				paramsElement.value = "";
			}
			count = placeholder.split("\n").filter(isNonEmptyString).length;
			if (count > 0) {
				paramsElement.setAttribute("rows", count.toString());
			}
			paramsElement.setAttribute("placeholder", placeholder);
		};

		timeout = setTimeout(() => {
			const setButtonText = (text: string) =>
				flatAndTo(toHtmlElement, e => e.innerText = text)("client.submit");

			const isValidMethod = flat(orIs)(isDefiadsClientMethod, isSame("help")) as IsFn<string, DefiadsClientMethod | "help">;
			const method = as(flat(andIs)(isString, isValidMethod))(methodElement.value);

			if (isNone(method)) {
				setParamsPlaceholder("");
				setButtonText("Invalid command");
				return;
			}

			setButtonText(apiHelp.commands[method].description);
			setParamsPlaceholder(
				unwrapOr(as(isNonEmptyString)(
					apiHelp.commands[method].args.replace(/, /g, "\n")
				), "[no args]")
			);
		}, 300);
	});

	paramsElement.addEventListener("keydown", () => mayClear = false);
	paramsElement.addEventListener("keyup", (event) => {
		if ((event.ctrlKey || count <= 1) && event.key === "Enter") {
			submitRun().then(() => {});
		}
	});
	flatAndTo(toHtmlElement, e => e.addEventListener("click", submitRun))("client.submit");
};

const registerReadOnlyMode = () =>
	["menu.composer", "menu.wallet"].forEach(flatAndTo(toHtmlElement, hide));

const init = (context: Context) => {
	const storage = getMultiStorage(context);

	if (isNone(storage.get("endpoint"))) {
		storage.set("endpoint")(inputMap.endpoint.default);
	}

	registerDisplay(context);
	registerCatExplorer(context);
	registerClient(context);
	registerMenu(context);
	registerNavigation(context);
	registerUpdate(context).then(() => {});

	if (READ_ONLY_MODE) {
		registerReadOnlyMode();
	} else {
		registerWallet(context);
		registerComposer(context);
		checkTxIdsMenu(context);
	}

	const errHandlerMap = getErrHandlerMap(context);

	errHandlerMap[-32602] = (err: Err) => {
		toChain(toDisplayJsonString, pre, unflat(displayError)(context))(err);
		switch (err.message) {
			case "Cipher error: invalid padding":
				context.defiadsApiWallet = none;
				storage.delete("passphrase");
				alert("Passphrase is incorrect");
				break;
			case "invalid api key":
				context.defiadsClientContext = none;
				context.defiadsClient = none;
				context.defiadsApi = none;
				context.defiadsApiWallet = none;
				storage.delete("apiKey");
				getDefiadsClientContext(context);
				break;
			case "Unsupported: insufficient funds":
				alert("Not enough funds, go to wallet to deposit");
				break;
			default:
				break;
		}
		return none;
	};
	errHandlerMap[-1] = (err: Err) => {
		console.log(err);
		const inputContext = getInputContext("endpoint");
		inputContext.onRemember = storage.persist("endpoint");
		inputContext.default = storage.get("endpoint");
		inputContext.storagePossible = storage.hasStorage;
		requestInput(inputContext).then((endpoint: Option<string>) => {
			if (isNone(endpoint)) {
				return;
			}
			storage.set("endpoint")(endpoint);
			context.defiadsClientContext = none;
			context.defiadsClient = none;
			context.defiadsApi = none;
			context.defiadsApiWallet = none;
		});
		return none;
	};
	errHandlerMap[-2] = (err: Err) => {
		displayError(context, err.message);
		return none;
	};
	errHandlerMap[-3] = (err: Err) => {
		alert(err.message);
		return none;
	};

	errHandlerMap[-4] = (err: Err) => {
		alert(err.message);
		return none;
	};


	setTimeout(() => menu(context, "explorer"), 200);
};

window.addEventListener("load", () => init({
	cache: CONFIG,
}));
