import type {
	Ad,
	Balance,
	DefiadsApi,
	DefiadsClient,
	DefiadsClientFactory,
	DefiadsFactory,
	JSONObject,
	JSONValue,
	ListItem,
	Method,
	None,
	Option,
	Prepared,
	Some,
	AsFn,
	IsFn,
	ToFn,
	OfLength,
	AsyncToFn,
	AsyncOption,
	DefiadsClientContext,
	Fn,
	FlatFn,
	RetToFn,
	JSONArray,
	AsyncFn,
	ToFlat,
	Err,
	Swap,
	FromFlat,
	ErrHandler,
	HasLength,
	FlatHasLength,
	IsArray,
	PartialOptional,
	IsOneOf,
	AndTo,
	ToChain,
	ToTuple,
	AsyncToChain,
	AsyncToFirstOf,
	ToFirstOf,
	CollectArgs,
	JsonRpcResponse, JsonRpcErrorResponse, Filter, JsonRpcRequest, DefiadsClientMethod, Transport,
} from "./types";

////////////////////////////////////////////////////////////////////////////////////////////////
/// 									Options
////////////////////////////////////////////////////////////////////////////////////////////////

export const isSome = <T>(option: Option<T>): option is Some<T> =>
	typeof option !== "undefined";
export const isNone: IsFn<Option<any>, None> = (option: Option<any>): option is None =>
	typeof option === "undefined";
export const none: None = void 0;

export const unwrap = <T>(option: Option<T>): T => {
	if (isNone(option)) {
		throw "Panic: Failed to unwrap Option";
	}
	return option;
};

export const unwrapOr = <T>(option: Option<T>, alternative: T): T =>
	option ?? alternative;

export const okOrErr = (errHandler: ErrHandler) =>
	<T>(option: Option<T>, err: Err) =>
		isSome(option) ? option: errHandler(err);

export const optionTo = <T, U>(transformer: ToFn<T, U>): ToFn<Option<T>, U> =>
	(value: Option<T>): Option<U> =>
		isSome(value) ? transformer(value): none;

////////////////////////////////////////////////////////////////////////////////////////////////
/// 									Errors
////////////////////////////////////////////////////////////////////////////////////////////////

export const isErr: IsFn<any, Err> =
	(value: any): value is Err =>
		typeof value === "object"
		&& value !== null
		&& !Array.isArray(value)
		&& "code" in value && typeof value.code === "number"
		&& "message" in value && typeof value.message === "string";

export const toErr = (code: number): Fn<string, Err> =>
	(message: string) => ({
		message,
		code,
	});

////////////////////////////////////////////////////////////////////////////////////////////////
/// 									Functions
////////////////////////////////////////////////////////////////////////////////////////////////

export const toValue = <T>(value: T): Fn<any, T> =>
	(): T =>
		value;

export const flat: ToFlat = <T, U, V>(fn: Fn<T, Fn<U, V>>): FlatFn<T, U, V> =>
	(arg1: T, arg2: U): V =>
		fn(arg1)(arg2);

export const unflat: FromFlat = <T, U, V>(flatFn: FlatFn<T, U, V>): Fn<T, Fn<U, V>> =>
	(arg1: T): Fn<U, V> =>
		(arg2: U): V =>
			flatFn(arg1, arg2);

export const swap: Swap = <T, U, V>(fn: Fn<T, Fn<U, V>>): Fn<U, Fn<T, V>> =>
	(arg1: U): Fn<T, V> =>
		(arg2: T): V =>
			fn(arg2)(arg1);

export const optionSwap = <T, U, V>(fn: ToFn<T, Fn<U, V>>): Fn<U, ToFn<T, V>> =>
	(arg1: U): ToFn<T, V> =>
		(arg2: T): Option<V> =>
			flat(strictOrTo)(fn, toValue(toNone))(arg2)(arg1);

export const swapFlat = <T, U, V>(flatFn: FlatFn<T, U, V>): FlatFn<U, T, V> =>
	(arg1: U, arg2: T): V =>
		flatFn(arg2, arg1);

export const as = <T, U extends T>(fn: IsFn<T, U>): AsFn<T, U> =>
	(value: T): Option<U> =>
		fn(value) ? value : none;

///			Basic logical predicates

export const andIs = <T, U extends T, V extends U>(firstPredicate: IsFn<T, U>): Fn<IsFn<U, V>, IsFn<T, V>> =>
	<V extends U>(secondPredicate: IsFn<U, V>): IsFn<T, V> =>
		<V extends U>(value: T): value is V =>
			firstPredicate(value) && secondPredicate(value);

export const orIs = <T, U extends T, V extends Exclude<T, U>>(firstPredicate: IsFn<T, U>): Fn<IsFn<Exclude<T, U>, V>, IsFn<T, U | V>> =>
	<U extends T, V extends Exclude<T, U>>(secondPredicate: IsFn<Exclude<T, U>, V>): IsFn<T, U | V> =>
		<V extends Exclude<T, U>>(value: T): value is U | V =>
			firstPredicate(value) || secondPredicate(value as Exclude<T, U>);

export const notIs = <T, U extends T>(predicate: IsFn<T, U>): IsFn<T, Exclude<T, U>> =>
	<U extends T>(value: T): value is Exclude<T, U> =>
		!predicate(value);

// Option from number
export const fromNumber: ToFn<number, number> = // (number: number) =>
	as(notIs(isNaN as IsFn<number, number>));

export const hasLength = (<T, L extends number>(length: L) =>
	<T>(val: T & OfLength<number>): val is T & OfLength<L> =>
		val.length === length) as HasLength;

export const flatHasLength = flat(hasLength) as FlatHasLength;

export const isEmpty = hasLength(0);
export const isNonEmpty = notIs(isEmpty);

////////////////////////////////////////////////////////////////////////////////////////////////
/// 									Predicates
////////////////////////////////////////////////////////////////////////////////////////////////

///			Basic predicates

export const isString: IsFn<any, string> = (val: any): val is string =>
	typeof val === "string";
export const isNumber: IsFn<any, number> = (val: any): val is number =>
	typeof val === "number";
export const isBoolean: IsFn<any, boolean> = (val: any): val is boolean =>
	typeof val === "boolean";
export const isNull: IsFn<any, null> = (val: any): val is null =>
	val === null;

export const isNonEmptyString = andIs(isString)(isNonEmpty);

///		Array predicates

export const isArray: IsArray = Array.isArray;

export const isEither = flat(orIs);
export const isBoth = flat(andIs);

export const isOf = <T, U extends T>(predicate: IsFn<T, U>): IsFn<T[], U[]> =>
	(val: T[]): val is U[] =>
		val.every(predicate);

export const isArrayAnd = andIs(isArray);

export const isArrayOf = <U>(fn: IsFn<any, U>): IsFn<any, U[]> =>
	isArrayAnd(isOf(fn));

export const objectIsOfSome =
	<U extends {[key: string]: any}>(partial: PartialOptional<U>): partial is U =>
		isOf(isSome)(Object.keys(partial).map(key => partial[key]));


///		Composite predicates

export const isOneOf: IsOneOf = <T1, T2 extends T1>(predicate1: IsFn<T1, T2>, ...predicates: IsFn<Exclude<T1, T2>, any>[]): IsFn<T1, T2 | Exclude<T1, T2>> =>
	predicates.reduce(isEither, predicate1);

export const isPrimitive = isOneOf(isString, isNumber, isBoolean, isNull);

export const isSame = <T>(value: T) =>
	(val: any): val is T =>
		value === val;

export const toNone: ToFn<any, never> = () =>
	none;

export const asOf = <T, U extends T>(predicate: IsFn<T, U>): AsFn<T[], U[]> =>
	as(isOf(predicate));

export const andTo: AndTo = <T, U, V>(firstTransformer: ToFn<T, U>): Fn<ToFn<U, V>, ToFn<T, V>> =>
	(secondTransformer: ToFn<U, V>): ToFn<T, V> =>
		(value: T): Option<V> =>
			optionTo(secondTransformer)(firstTransformer(value));

export const strictAndTo = <T, U, V>(firstTransformer: Fn<T, U>): Fn<Fn<U, V>, Fn<T, V>> =>
	(secondTransformer: Fn<U, V>): Fn<T, V> =>
		(value: T): V =>
			secondTransformer(firstTransformer(value));

export const asyncAndTo = <T, U, V>(firstTransformer: AsyncToFn<T, U>): Fn<AsyncToFn<U, V>, AsyncToFn<T, V>> =>
	(secondTransformer: AsyncToFn<U, V>): AsyncToFn<T, V> =>
		async (value: T): AsyncOption<V> =>
			await optionTo(secondTransformer)(await firstTransformer(value));

export const flatAndTo = flat(andTo) as <T, U, V>(firstTransformer: ToFn<T, U>, secondTransformer: ToFn<U, V>) => ToFn<T, V>;
export const swapAndTo = swap(andTo) as <T, U, V>(secondTransformer: ToFn<U, V>) => (firstTransformer: ToFn<T, U>) => ToFn<T, V>;

export const asyncFlatAndTo = flat(asyncAndTo) as <T, U, V>(firstTransformer: AsyncToFn<T, U>, secondTransformer: AsyncToFn<U, V>) => AsyncToFn<T, V>;

export const orTo = <T, U, V>(firstTransformer: ToFn<T, U>): Fn<ToFn<T, V>, ToFn<T, U | V>> =>
	<V>(secondTransformer: ToFn<T, V>): ToFn<T, U | V> =>
		(value: T): Option<U | V> =>
			firstTransformer(value) ?? secondTransformer(value);

export const strictOrTo = <T, U, V>(firstTransformer: ToFn<T, U>): Fn<Fn<T, V>, Fn<T, U | V>> =>
	<V>(secondTransformer: Fn<T, V>): Fn<T, U | V> =>
		(value: T): U | V =>
			firstTransformer(value) ?? secondTransformer(value);

export const asyncOrTo = <T, U, V>(firstTransformer: AsyncToFn<T, U>): Fn<AsyncToFn<T, V>, AsyncToFn<T, U | V>>  =>
	<V>(secondTransformer: AsyncToFn<T, V>): AsyncToFn<T, U | V> =>
		async (value: T): AsyncOption<U | V> =>
			await firstTransformer(value) ?? await secondTransformer(value);

export const asyncStrictOrTo = <T, U, V>(fn1: AsyncToFn<T, U>): Fn<AsyncFn<T, V>, AsyncFn<T, U | V>> =>
	<V>(fn2: AsyncFn<T, V>): AsyncFn<T, U | V> =>
		async (value: T): Promise<U | V> =>
			await fn1(value) ?? await fn2(value);

export const fallThrough = swapAndTo(toNone);

export const flatOrTo = flat(orTo);
export const flatAsyncOrTo = flat(asyncOrTo);

export const shift = <T>(array: T[]): Option<T> =>
	array.shift();

export const ops = <T>(...ops: Fn<T, any>[]): Fn<T, T> =>
	(val: T) => {
		ops.forEach(op => op(val));
		return val;
	};

export const op = <T>(op: Fn<T, any>): Fn<T, T> =>
	(val: T) => {
		op(val);
		return val;
	};

export const toSelf = <T>(val: T): T => val;

export const withLog: <T, U>(fn: Fn<T, U>) => Fn<T, U> =
	swapAndTo(op(console.log));

export const unshift = (item: any): ToFn<any[], any[]> =>
	//[item].concat;
	op((array: any[]) => array.unshift(item));

export const pop = <T>(array: T[]): Option<T> =>
	array.pop();

export const push = (item: any): ToFn<any[], any[]> =>
	op((array: any[]) => array.push(item));

export const toOne = shift;

export const wrap = <T>(value: T): [T] =>
	[value];

export const concatTo: Fn<any[], Fn<any[], any[]>> =
	(target: any[]): Fn<any[], any[]> =>
		(array: any[]): any[] =>
			target.concat(array);

export const flatConcatTo = flat(concatTo);

export const toNumber: ToFn<any, number> =
	flatAndTo(Number, fromNumber);

export const toBoolean: ToFn<any, boolean> = (value: any) =>
	optionTo((val: number) => val !== 0)(toNumber(value));

export const toString: ToFn<any, string> = (value: any) =>
	value + "";

export const toNonEmptyString: ToFn<any, string> =
	flatAndTo(toString, as(isNonEmpty));

export const toOf = <T, U>(transformer: ToFn<T, U>): ToFn<T[], U[]> =>
	(array: T[]): Option<U[]> =>
		asOf(isSome)(array.map(transformer));

export const filter: Filter = <T>(fn: Fn<T, boolean>): Fn<T[], T[]> =>
	(array: T[]): T[] =>
		array.filter(fn);

export const split = (separator: string): Fn<string, string[]> =>
	(value: string): string[] =>
		value.split(separator);

export const join = (separator: string): Fn<string[], string> =>
	(value: string[]): string =>
		value.join(separator);

export const toChain: ToChain = <T1, T2>(transformer1: ToFn<T1, T2>, ...transformers: ToFn<T2, T2>[]): ToFn<T1, T2> =>
	transformers.reduce(flatAndTo, transformer1);

export const asyncToChain: AsyncToChain = <T1, T2>(transformer1: AsyncToFn<T1, T2>, ...transformers: AsyncToFn<T2, T2>[]): AsyncToFn<T1, T2> =>
	transformers.reduce(asyncFlatAndTo, transformer1);

// TODO Rewrite properly
export const toTuple = (<T, U>(...transformers: ToFn<T, U>[]) =>
	(value: T[]) =>
		asOf(isSome)(transformers
			.map(transformer => toChain<T[], T, U, [U]>(shift, transformer, wrap))
			.map(fn => fn(value))
		)?.reduce(flatConcatTo, [])
) as ToTuple;

export const toFirstOf: ToFirstOf = <T, U1, SUM>(transformer1: ToFn<T, U1>, ...transformers: ToFn<T, any>[]): ToFn<T, U1 | SUM> =>
	transformers.reduce(flatOrTo, transformer1);


export const asyncToFirstOf: AsyncToFirstOf = <T, U1, SUM>(transformer1: AsyncToFn<T, U1>, ...transformers: AsyncToFn<T, any>[]): AsyncToFn<T, U1 | SUM> =>
	transformers.reduce(flatAsyncOrTo, transformer1);

export const toAsync = <T, U>(fn: ToFn<T, U>): Fn<T, AsyncOption<U>> =>
	(value: T): AsyncOption<U> =>
		Promise.resolve(fn(value));

export const collectArgs: CollectArgs = (<T, U>(fn: Fn<T[], U>) =>
	(...args: T[]): U =>
		fn(args)) as CollectArgs;

export const spreadArgs = <T, U>(fn: (...args: T[]) => U): Fn<T[], U> =>
	(args: T[]): U =>
		fn(...args);

export const fromNullable: <T, U>(fn: ToFn<T, U | null>) => ToFn<T, U> =
	swapAndTo(as(notIs(isNull)));

export const tryCatch = <T, U>(fn: Fn<T, U>): ToFn<T, U> =>
	(val: T): Option<U> => {
		try {
			return fn(val);
		} catch (e) {
			return none;
		}
	};

export const asyncTryCatch = <T, U>(fn: AsyncFn<T, U>): AsyncToFn<T, U> =>
	async (val: T): AsyncOption<U> => {
		try {
			return await fn(val);
		} catch (e) {
			return none;
		}
	};

export const errTryCatch = (errHandler: ErrHandler, code: number) =>
	<T, U>(fn: Fn<T, U>): ToFn<T, U> =>
		(val: T): Option<U> => {
			try {
				return fn(val);
			} catch (e) {
				console.log(e);
				return errHandler(toErr(code)(unwrapOr(tryCatch(toNonEmptyString)(e), "Generic error")));
			}
		};
export const asyncErrTryCatch = (errHandler: ErrHandler, code: number) =>
	<T, U>(fn: AsyncFn<T, U>): AsyncToFn<T, U> =>
		async (val: T): AsyncOption<U> => {
			try {
				return await fn(val);
			} catch (e) {
				console.log(e);
				return errHandler(toErr(code)(unwrapOr(tryCatch(toNonEmptyString)(e), "Generic error")));
			}
		};

///			JSON, JSONRPC Functions

export const toJsonValue = tryCatch(JSON.parse as Fn<string, JSONValue>);
export const toJsonString = tryCatch(JSON.stringify as Fn<JSONValue, string>);
export const toDisplayJsonString = tryCatch(((v => JSON.stringify(v, undefined, 2)) as Fn<JSONValue, string>));

export const isJsonObject: IsFn<JSONValue, JSONObject> = (val: JSONValue): val is JSONObject =>
	typeof val === "object"
	&& val !== null
	&& !Array.isArray(val);

export const toJsonRpcRequest: ToFn<[Method, Option<JSONValue>, string | number], JsonRpcRequest> = (args) => ({
	jsonrpc: "2.0",
	method: args[0],
	params: args[1],
	id: args[2],
});

export const isJsonRpcResponse: IsFn<JSONValue, JsonRpcResponse> = (value: JSONValue): value is JsonRpcResponse =>
	typeof value === "object"
	&& value !== null
	&& !Array.isArray(value)
	&& "jsonrpc" in value && value.jsonrpc === "2.0"
	&& "result" in value && typeof value.result !== "undefined"
	&& "id" in value && typeof value.id !== "undefined";

export const isJsonRpcErrorResponse: IsFn<JSONValue, JsonRpcErrorResponse> = (value: JSONValue): value is JsonRpcErrorResponse =>
	typeof value === "object"
	&& value !== null
	&& !Array.isArray(value)
	&& "jsonrpc" in value && value.jsonrpc === "2.0"
	&& "error" in value && isErr(value.error)
	&& "id" in value && typeof value.id !== "undefined";

/// Crypto

export const generateKey = async () =>
	await crypto.subtle.generateKey(
		{
			name: "ECDSA",
			namedCurve: "P-384",
		},
		true,
		["sign", "verify"]
	);

export const bufferToHex: Fn<ArrayBuffer, string> = (buffer: ArrayBuffer) =>
	Array
		.from(new Uint8Array(buffer))
		.map(b => b.toString(16).padStart(2, "0"))
		.join("");

export const hexToBufferView = (str: string) => {
	if (str.length === 0) {
		return new Uint8Array();
	}

	const a = [];
	for (let i = 0, len = str.length; i < len; i += 2) {
		a.push(parseInt(str.substr(i,2),16));
	}

	return new Uint8Array(a);
};

export const sign = async (message: string, privateKey: CryptoKey): Promise<string> => {
	const encoder = new TextEncoder();

	const signature = await crypto.subtle.sign({
		name: "ECDSA",
		hash: "SHA-256",
	}, privateKey, encoder.encode(message));

	return bufferToHex(signature);
};

export const verify = async (message: string, signature: string, publicKey: CryptoKey): Promise<boolean> => {
	const encoder = new TextEncoder();

	return await crypto.subtle.verify({
		name: "ECDSA",
		hash: "SHA-256",
	}, publicKey, hexToBufferView(signature), encoder.encode(message));
};

export const digest = async (message: string): Promise<string> =>
	bufferToHex(await crypto.subtle.digest(
		"SHA-256",
		Uint8Array.from(message.split("").map(s => s.charCodeAt(0)))
	));

export const jwkIsValid = (jwk: JsonWebKey): jwk is JsonWebKey =>
	jwk.crv === "P-384" && jwk.ext === true && jwk.kty === "EC" && isSome(jwk.x) && isSome(jwk.y);

export const jwkIsPrivate: IsFn<JsonWebKey, JsonWebKey> =
	(jwk: JsonWebKey): jwk is JsonWebKey =>
		isSome(jwk.d) && "sign" === flatAndTo(as(isArray), a => a.find(v => v === "sign"))(jwk.key_ops);


export const jwkToString: (jwk: JsonWebKey) => Option<string> =
	toChain(
		as(jwkIsValid),
		(jwk: JsonWebKey) => concatTo(jwkIsPrivate(jwk) ? [jwk.d] : [])([jwk.x, jwk.y]),
		join(".")
	);

export const jwkToPublic = (jwk: JsonWebKey): JsonWebKey => ({
	...jwk,
	...{ d: none, key_ops: ["verify"] }
});

export const stringToJwk = (keyString: string): Option<JsonWebKey> => {
	const chunks = keyString.split(".");
	if (chunks.length < 2 || chunks.length > 3) {
		return none;
	}
	const jwk: JsonWebKey = {
		crv: "P-384",
		ext: true,
		kty: "EC",
	};
	if (chunks.length === 3) {
		jwk.d = chunks.shift();
		jwk.key_ops = ["sign"];
	} else {
		jwk.key_ops = ["verify"];
	}
	jwk.x = chunks.shift();
	jwk.y = chunks.shift();
	return jwk;
};

export const jwkToKey = async (jwk: JsonWebKey) =>
	await crypto.subtle.importKey(
		"jwk",
		jwk,
		{ name: "ECDSA", namedCurve: "P-384" },
		true,
		unwrapOr(jwk.key_ops, [])
	);

export const keyToJwk = unflat(crypto.subtle.exportKey.bind(crypto.subtle))("jwk") as AsyncToFn<CryptoKey, JsonWebKey>;
export const keyToString = asyncFlatAndTo(keyToJwk, jwkToString);

///			HTML

export const toHtmlElement = fromNullable(document.getElementById.bind(document));

const setDisplay =
	(display: string) =>
		(element: HTMLElement) =>
			element.style.display = display;

export const show = setDisplay("block");
export const hide = setDisplay("none");
export const focus = (e: HTMLElement) => e.focus();

export const menuClearHighlight = (element: HTMLElement) =>
	element.classList.remove("highlight");

export const menuHighlight = (element: HTMLElement) =>
	element.classList.add("highlight");

export const menuSelect = (element: HTMLElement) =>
	element.classList.add("selected");

export const menuUnselect = (element: HTMLElement) =>
	element.classList.remove("selected");

export const withHtmlElement = swap(andTo(toHtmlElement));

export const escapeHtml = (unsafe: string) =>
	unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");

export const pre = (s: string) => `<pre>${escapeHtml(s)}</pre>`;

/// 		App Specific Predicates

export const isListItem: IsFn<any, ListItem> = (value: any): value is ListItem =>
	typeof value === "object"
	&& value !== null
	&& !Array.isArray(value)
	&& ("id" in value) && typeof value.id === "string"
	&& ("cat" in value) && typeof value.cat === "string"
	&& ("abs" in value) && typeof value.abs === "string";

export const isAd: IsFn<any, Ad> = (value: any): value is Ad =>
	typeof value === "object"
	&& value !== null
	&& !Array.isArray(value)
	&& ("text" in value) && typeof value.text === "string"
	&& ("weight" in value) && typeof value.weight === "number"
	&& ("length" in value) && typeof value.length === "number"
	&& ("height" in value) && typeof value.height === "number"
	&& ("publisher" in value) && typeof value.publisher === "string"
	&& ("term" in value) && typeof value.term === "number"
	&& ("start" in value) && typeof value.start === "number"
	&& ("end" in value) && typeof value.end === "number"
	&& isListItem(value);

export const isDefiadsClientMethod: IsFn<string, DefiadsClientMethod> = (method: string): method is DefiadsClientMethod =>
	method === "categories"
	|| method === "list"
	|| method === "read"
	|| method === "deposit"
	|| method === "balance"
	|| method === "prepare"
	|| method === "list_prepared"
	|| method === "read_prepared"
	|| method === "withdraw"
	|| method === "fund";

export const isMethod: IsFn<string, Method> = (method: string): method is Method =>
	method === "categories"
	|| method === "list"
	|| method === "read"
	|| method === "readOne"
	|| method === "deposit"
	|| method === "balance"
	|| method === "prepare"
	|| method === "list_prepared"
	|| method === "read_prepared"
	|| method === "withdraw"
	|| method === "fund"
	|| method === "help";

export const toListItem: ToFn<[string, string, string], ListItem> =
	(val) => ({
		id: val[0],
		cat: val[1],
		abs: val[2],
	});
export const toBalance: ToFn<[number, number], Balance> =
	(val) => ({
		total: val[0],
		available: val[1],
	});
export const toPrepared: ToFn<[string, string, string], Prepared> =
	(val) => ({
		cat: val[0],
		abs: val[1],
		text: val[2],
	});

///			API Transport Layer

export const defiadsClientFactory: DefiadsClientFactory =
	(context: DefiadsClientContext) =>
		(method: Method) =>
			collectArgs(asyncToChain(
				toChain( // prepare params
					as(isArrayOf(isPrimitive)),
					unshift(context.apiKey),
				),
				toChain( // prepare JsonRpcRequest
					wrap,
					unshift(method),
					push(0) as RetToFn<[Method, JSONArray, number]>,
					toJsonRpcRequest,
				),
				toChain( // prepare context for transport
					toJsonString,
					wrap,
					unshift("POST"),
					unshift(context.endpoint),
				),
				asyncErrTryCatch(context.errHandler, -1)(spreadArgs(context.transport)), // Perform request
				toChain( // Parse and validate,
					toJsonValue,
					flatOrTo(
						as(isJsonRpcResponse),
						toChain(
							as(isJsonRpcErrorResponse),
							(errResponse) => errResponse.error,
							context.errHandler
						)
					),
				),
				response => response.result, // return result
			));

/// Main API

export const apiHelp = {
	version: "0.0.1",
	commands: {
		categories: {
			args: "",
			description: "Gets list of known categories",
		},
		list: {
			args: "category: string",
			description: "List ads within a category",
		},
		read: {
			args: "defiadId: string",
			description: "Read full contents of an ad",
		},
		deposit: {
			args: "",
			description: "Get new deposit address",
		},
		balance: {
			args: "",
			description: "Get wallet balance",
		},
		prepare: {
			args: "category: string, abstract: string, content: string",
			description: "Prepare an ad",
		},
		list_prepared: {
			args: "",
			description: "List prepared ads",
		},
		read_prepared: {
			args: "defiadId: string",
			description: "Read a prepared ad",
		},
		withdraw: {
			args: "destAddress: BitcoinAddress, feeRate: number, amtSat?: number",
			description: "Withdraw Bitcoin from the wallet",
		},
		fund: {
			args: "defiadId: DefiadId, amtSat: number, term: number, feeRate: number",
			description: "Fund prepared ad and publish it to the network",
		},
		help: {
			args: "",
			description: "Show help information",
		}
	},
} as const;

export const defiadsFactory: DefiadsFactory = (defiadsClient: DefiadsClient): DefiadsApi => ({
	categories: collectArgs(asyncToChain(
		spreadArgs(defiadsClient("categories")),
		as(isArrayOf(isString)),
	)),
	list: collectArgs(asyncToChain(
		toOne,
		spreadArgs(defiadsClient("list")),
		as(isArrayOf(isBoth(isArrayOf(isString), hasLength(3)))),
		toOf(toListItem),
	)),
	read: collectArgs(asyncToChain(
		toOne,
		spreadArgs(defiadsClient("read")),
		as(isArrayOf(isAd)),
	)),
	readOne: collectArgs(asyncToChain(
		spreadArgs(defiadsClient("read")),
		as(isArrayOf(isAd)),
		toOne,
	)),
	deposit: collectArgs(asyncToChain(
		spreadArgs(defiadsClient("deposit")),
		as(isString),
	)),
	balance: collectArgs(asyncToChain(
		spreadArgs(defiadsClient("balance")),
		as(isArray),
		toOf(toNumber),
		as(isBoth(isArrayOf(isNumber), hasLength(2))),
		toBalance,
	)),
	prepare: collectArgs(asyncToChain(
		spreadArgs(defiadsClient("prepare")),
		as(isString),
	)),
	list_prepared: collectArgs(asyncToChain(
		spreadArgs(defiadsClient("list_prepared")),
		as(isArrayOf(isString)),
	)),
	read_prepared: collectArgs(asyncToChain(
		spreadArgs(defiadsClient("read_prepared")),
		as(isBoth(isArrayOf(isString), hasLength(3))),
		toPrepared,
	)),
	wallet: (passphrase) => ({
		withdraw: collectArgs(asyncToChain(
			unshift(passphrase),
			spreadArgs(defiadsClient("withdraw")),
			as(isString)
		)),
		fund: collectArgs(asyncToChain(
			unshift(passphrase),
			spreadArgs(defiadsClient("fund")),
			as(isString)
		)),
	}),
	help: () => apiHelp,
});


/// Browser-specific Transport (XHR)

export const xhrTransport: Transport = (endpoint, method, body?) =>
	new Promise(((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => {
			if (xhr.readyState !== 4) {
				return;
			}
			if (xhr.status !== 200) {
				return reject(xhr.statusText);
			}
			resolve(xhr.responseText);
		};

		try {
			xhr.open(method, endpoint, true);
			if (isSome(body)) {
				xhr.setRequestHeader("Content-Type", "application/json");
				xhr.send(body);
			} else {
				xhr.send();
			}
		} catch (e) {
			reject(e);
		}
	}));
