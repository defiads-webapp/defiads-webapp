/// This file can only contain TypeScript-only code (generated js file must be empty)

/// Options

export type None = undefined;
export type Some<T> = T;

export type Option<T> = Some<T> | None;

export type Fn<T, U> = (v: T) => U;

export type IsFn<T, U extends T> = (v: T) => v is U;
export type AsFn<T, U extends T> = (v: T) => Option<U>;
export type ToFn<T, U> = (v: T) => Option<U>;


export type AnyFn = Fn<any, any>;


export type ArgFn<T> = <U>(v: T) => U;
export type RetFn<U> = <T>(v: T) => U;
export type GenFn = <T, U>(v: T) => U;

export type ArgIsFn<T> = <U extends T>(v: T) => v is U;
export type ArgAsFn<T> = <U extends T>(v: T) => Option<U>;

export type ArgToFn<T> = {
	<U>(v: T): Option<U>,
};

export type RetToFn<U> = <T>(v: T) => Option<U>;

export type GenToFn = {
	<T, U>(v: T): Option<U>,
	<T>(v: T): Option<any>,
	<U>(v: any): Option<U>,
};

export type FlatFn<T, U, V> = (arg1: T, arg2: U) => V;
export type AnyFlatFn = FlatFn<any, any, any>;

export type Arg<F extends GenFn> = Parameters<F>[0];
export type Ret<F extends AnyFn | AnyFlatFn> = ReturnType<F>;

export type Arg1<F extends AnyFlatFn> = Parameters<F>[0];
export type Arg2<F extends AnyFlatFn> = Parameters<F>[1];

export type AsyncOption<T> = Promise<Option<T>>;

export type AsyncFn<T, U> = Fn<T, Promise<U>>;
export type AsyncAsFn<T, U extends T> = Fn<T, AsyncOption<U>>;
export type AsyncToFn<T, U> = Fn<T, MaybeAsyncOption<U>>;

export type FnAsyncFn<F extends AnyFn> = AsyncFn<Arg<F>, Ret<F>>;

export type SyncFn<T, U> = U extends Promise<any> ? never : Fn<T, U>;

export type Future<T> = () => Promise<T>;

export type MaybeAsyncOption<T> = Option<T> | AsyncOption<T>;

export type OfLength<L extends number> = {length: L};
export type ArrayOfLength<T, L extends number> = Array<T> & {length: L};

export type PartialOptional<T> = {
	[P in keyof T]?: Option<T[P]>;
};

export type ToFlat = {
	<T, U, V>(func: Fn<T, Fn<U, V>>): FlatFn<T, U, V>,
	<T, U>(func: Fn<T, ArgFn<U>>): <V>(arg1: T, arg2: U) => V,
	<T, V>(func: Fn<T, RetFn<V>>): <U>(arg1: T, arg2: U) => V,
	<U, V>(func: RetFn<Fn<U, V>>): <T>(arg1: T, arg2: U) => V,

	<T>(func: ArgFn<T>): <U, V>(arg1: T, arg2: U) => V,

	<U>(func: RetFn<ArgFn<U>>): <T, V>(arg1: T, arg2: U) => V,
	<V>(func: RetFn<RetFn<V>>): <T, U>(arg1: T, arg2: U) => V,
	(func: GenFn): <T, U, V>(arg1: T, arg2: U) => V,
};
export type FromFlat = {
	<T, U, V>(func: FlatFn<T, U, V>): Fn<T, Fn<U, V>>,
	<T, U>(func: <V>(arg1: T, arg2: U) => V): Fn<T, ArgFn<U>>,
	<T, V>(func: <U>(arg1: T, arg2: U) => V): Fn<T, RetFn<V>>,
	<U, V>(func: <T>(arg1: T, arg2: U) => V): RetFn<Fn<U, V>>,
	<T>(func: <U, V>(arg1: T, arg2: U) => V): Fn<T, GenFn>,
	<U>(func: <T, V>(arg1: T, arg2: U) => V): RetFn<ArgFn<U>>,
	<V>(func: <T, U>(arg1: T, arg2: U) => V): RetFn<RetFn<V>>,
	(func: <T, U, V>(arg1: T, arg2: U) => V): RetFn<GenFn>,
};
export type Swap = {
	<T, U, V>(func: Fn<T, Fn<U, V>>): Fn<U, Fn<T, V>>,
	<T, U>(func: Fn<T, ArgFn<U>>): Fn<U, ArgFn<T>>,
	<T, V>(func: Fn<T, RetFn<V>>): RetFn<Fn<T, V>>,

	<U, V>(func: RetFn<Fn<U, V>>): Fn<U, RetFn<V>>,

	<T>(func: Fn<T, GenFn>): RetFn<ArgFn<T>>,
	<U>(func: RetFn<ArgFn<U>>): Fn<U, GenFn>,
	<V>(func: RetFn<RetFn<V>>): RetFn<RetFn<V>>,
};

export type HasLength = {
	(length: 0): (v: string) => v is string & OfLength<0>,
	(length: 0): (v: any[]) => v is [];
	(length: 1): <T>(v: T[]) => v is [T];
	(length: 2): <T>(v: T[]) => v is [T, T];
	(length: 3): <T>(v: T[]) => v is [T, T, T];
	(length: 4): <T>(v: T[]) => v is [T, T, T, T];
	(length: 5): <T>(v: T[]) => v is [T, T, T, T, T];
	<L extends number>(length: L): <T>(v: T[]) => v is T[] & OfLength<L>;
}
export type FlatHasLength = {
	(length: 0, v: any[]): v is [];
	<T>(length: 1, v: T[]): v is [T];
	<T>(length: 2, v: T[]): v is [T, T];
	<T>(length: 3, v: T[]): v is [T, T, T];
	<T>(length: 4, v: T[]): v is [T, T, T, T];
	<T>(length: 5, v: T[]): v is [T, T, T, T, T];
	<L extends number, T>(length: L, v: T[]): v is T[] & OfLength<L>;
}
export type IsArray = {
	(val: JSONValue): val is JSONArray,
	(val: any): val is any[],
};

export type IsOneOf = {
	<T1, T2 extends T1>(predicate1: IsFn<T1, T2>): IsFn<T1, T2>;
	<T1, T2 extends T1, T3 extends Exclude<T1, T2>>(predicate1: IsFn<T1, T2>, predicate2: IsFn<Exclude<T1, T2>, T3>): IsFn<T1, T2 | T3>;
	<T1, T2 extends T1, T3 extends Exclude<T1, T2>, T4 extends Exclude<T1, T2 | T3>>(predicate1: IsFn<T1, T2>, predicate2: IsFn<Exclude<T1, T2>, T3>, predicate3: IsFn<Exclude<T1, T2 | T3>, T4>): IsFn<T1, T2 | T3 | T4>;
	<T1, T2 extends T1, T3 extends Exclude<T1, T2>, T4 extends Exclude<T1, T2 | T3>, T5 extends Exclude<T1, T2 | T3 | T4>>(predicate1: IsFn<T1, T2>, predicate2: IsFn<Exclude<T1, T2>, T3>, predicate3: IsFn<Exclude<T1, T2 | T3>, T4>, predicate4: IsFn<Exclude<T1, T2 | T3 | T4>, T5>): IsFn<T1, T2 | T3 | T4 | T5>;
	<T1, T2 extends T1, T3 extends Exclude<T1, T2>, T4 extends Exclude<T1, T2 | T3>, T5 extends Exclude<T1, T2 | T3 | T4>, T6 extends Exclude<T1, T2 | T3 | T4 | T5>>(predicate1: IsFn<T1, T2>, predicate2: IsFn<Exclude<T1, T2>, T3>, predicate3: IsFn<Exclude<T1, T2 | T3>, T4>, predicate4: IsFn<Exclude<T1, T2 | T3 | T4>, T5>, predicate5: IsFn<Exclude<T1, T2 | T3 | T4 | T5>, T6>): IsFn<T1, T2 | T3 | T4 | T5 | T6>;
};
export type AndTo = {

	<T, U>(firstTransformer: ToFn<T, U>): <V>(secondTransformer: ToFn<U, V>) => ToFn<T, V>,
	<U, V>(firstTransformer: RetToFn<U>): Fn<ToFn<U, V>, RetToFn<V>>,
	<T, V>(firstTransformer: ArgToFn<T>): Fn<RetToFn<V>, ToFn<T, V>>,
	<T>(firstTransformer: ArgToFn<T>): <V>(secondTransformer: RetToFn<V>) => ToFn<T, V>,
	<U>(firstTransformer: RetToFn<U>): <V>(secondTransformer: RetToFn<V>) => RetToFn<V>,
	<V>(firstTransformer: GenToFn): Fn<RetToFn<V>, RetToFn<V>>,
	(firstTransformer: AnyFn): <V>(secondTransformer: RetToFn<V>) => RetToFn<V>,
	<T, U, V>(firstTransformer: ToFn<T, U>): Fn<ToFn<U, V>, ToFn<T, V>>,
	(firstTransformer: GenToFn): <V>(secondTransformer: RetToFn<V>) => RetToFn<V>,
};

export type ToChain = {
	<T1, T2>(transformer1: ToFn<T1, T2>): ToFn<T1, T2>;
	<T1, T2, T3>(transformer1: ToFn<T1, T2>, transformer2: ToFn<T2, T3>): ToFn<T1, T3>;
	<T1, T2, T3, T4>(transformer1: ToFn<T1, T2>, transformer2: ToFn<T2, T3>, transformer3: ToFn<T3, T4>): ToFn<T1, T4>;
	<T1, T2, T3, T4, T5>(transformer1: ToFn<T1, T2>, transformer2: ToFn<T2, T3>, transformer3: ToFn<T3, T4>, transformer4: ToFn<T4, T5>): ToFn<T1, T5>;
	<T1, T2, T3, T4, T5, T6>(transformer1: ToFn<T1, T2>, transformer2: ToFn<T2, T3>, transformer3: ToFn<T3, T4>, transformer4: ToFn<T4, T5>, transformer5: ToFn<T5, T6>): ToFn<T1, T6>;
	<T1, T2, T3, T4, T5, T6, T7>(transformer1: ToFn<T1, T2>, transformer2: ToFn<T2, T3>, transformer3: ToFn<T3, T4>, transformer4: ToFn<T4, T5>, transformer5: ToFn<T5, T6>, transformer6: ToFn<T6, T7>): ToFn<T1, T7>;
	<T1, T2, T3, T4, T5, T6, T7, T8>(transformer1: ToFn<T1, T2>, transformer2: ToFn<T2, T3>, transformer3: ToFn<T3, T4>, transformer4: ToFn<T4, T5>, transformer5: ToFn<T5, T6>, transformer6: ToFn<T6, T7>, transformer7: ToFn<T7, T8>): ToFn<T1, T8>;
	<T1, T2, PROD>(transformer1: ToFn<T1, T2>, ...transformers: ToFn<T2, PROD>[]): ToFn<T1, PROD>;
	// <T1, PROD>(...transformers: ToFn<T1, PROD>[]): ToFn<T1, PROD>;
};
export type AsyncToChain = {
	<T1, T2>(transformer1: AsyncToFn<T1, T2>): AsyncToFn<T1, T2>;
	<T1, T2, T3>(transformer1: AsyncToFn<T1, T2>, transformer2: AsyncToFn<T2, T3>): AsyncToFn<T1, T3>;
	<T1, T2, T3, T4>(transformer1: AsyncToFn<T1, T2>, transformer2: AsyncToFn<T2, T3>, transformer3: AsyncToFn<T3, T4>): AsyncToFn<T1, T4>;
	<T1, T2, T3, T4, T5>(transformer1: AsyncToFn<T1, T2>, transformer2: AsyncToFn<T2, T3>, transformer3: AsyncToFn<T3, T4>, transformer4: AsyncToFn<T4, T5>): AsyncToFn<T1, T5>;
	<T1, T2, T3, T4, T5, T6>(transformer1: AsyncToFn<T1, T2>, transformer2: AsyncToFn<T2, T3>, transformer3: AsyncToFn<T3, T4>, transformer4: AsyncToFn<T4, T5>, transformer5: AsyncToFn<T5, T6>): AsyncToFn<T1, T6>;
	<T1, T2, T3, T4, T5, T6, T7>(transformer1: AsyncToFn<T1, T2>, transformer2: AsyncToFn<T2, T3>, transformer3: AsyncToFn<T3, T4>, transformer4: AsyncToFn<T4, T5>, transformer5: AsyncToFn<T5, T6>, transformer6: AsyncToFn<T6, T7>): AsyncToFn<T1, T7>;
	<T1, T2, T3, T4, T5, T6, T7, T8>(transformer1: AsyncToFn<T1, T2>, transformer2: AsyncToFn<T2, T3>, transformer3: AsyncToFn<T3, T4>, transformer4: AsyncToFn<T4, T5>, transformer5: AsyncToFn<T5, T6>, transformer6: AsyncToFn<T6, T7>, transformer7: AsyncToFn<T7, T8>): AsyncToFn<T1, T8>;
	<T1, T2, PROD>(transformer1: AsyncToFn<T1, T2>, ...transformers: AsyncToFn<T2, PROD>[]): AsyncToFn<T1, PROD>;
};
export type ToTuple = {
	(): ToFn<any[], []>
	<T1, U1>(transformer1: ToFn<T1, U1>): ToFn<[T1, ...any[]], [U1]>;
	<T1, U1, T2, U2>(transformer1: ToFn<T1, U1>, transformer2: ToFn<T2, U2>): ToFn<[T1, T2, ...any[]], [U1, U2]>;
	<T1, U1, T2, U2, T3, U3>(transformer1: ToFn<T1, U1>, transformer2: ToFn<T2, U2>, transformer3: ToFn<T3, U3>): ToFn<[T1, T2, T3, ...any[]], [U1, U2, U3]>;
	<T1, U1, T2, U2, T3, U3, T4, U4>(transformer1: ToFn<T1, U1>, transformer2: ToFn<T2, U2>, transformer3: ToFn<T3, U3>, transformer4: ToFn<T4, U4>): ToFn<[T1, T2, T3, T4, ...any[]], [U1, U2, U3, U4]>;
	<T1, U1, T2, U2, T3, U3, T4, U4, T5, U5>(transformer1: ToFn<T1, U1>, transformer2: ToFn<T2, U2>, transformer3: ToFn<T3, U3>, transformer4: ToFn<T4, U4>, transformer5: ToFn<T5, U5>): ToFn<[T1, T2, T3, T4, T5, ...any[]], [U1, U2, U3, U4, U5]>;
	(...transformers: ToFn<any, any>[]): ToFn<any[], any[]>,
};
export type ToFirstOf = {
	<T, U1>(transformer1: ToFn<T, U1>): ToFn<T, U1>;
	<T, U1, U2>(transformer1: ToFn<T, U1>, transformer2: ToFn<T, U2>): ToFn<T, U1 | U2>;
	<T, U1, U2, U3>(transformer1: ToFn<T, U1>, transformer2: ToFn<T, U2>, transformer3: ToFn<T, U3>): ToFn<T, U1 | U2 | U3>;
	<T, U1, U2, U3, U4>(transformer1: ToFn<T, U1>, transformer2: ToFn<T, U2>, transformer3: ToFn<T, U3>, transformer4: ToFn<T, U4>): ToFn<T, U1 | U2 | U3 | U4>;
	<T, U1, U2, U3, U4, U5>(transformer1: ToFn<T, U1>, transformer2: ToFn<T, U2>, transformer3: ToFn<T, U3>, transformer4: ToFn<T, U4>, transformer5: ToFn<T, U5>): ToFn<T, U1 | U2 | U3 | U4 | U5>;
	<T, U1, SUM>(transformer1: ToFn<T, U1>, ...transformers: ToFn<T, any>[]): ToFn<T, U1 | SUM>;
};

export type AsyncToFirstOf = {
	<T, U1>(transformer1: AsyncToFn<T, U1>): AsyncToFn<T, U1>;
	<T, U1, U2>(transformer1: AsyncToFn<T, U1>, transformer2: AsyncToFn<T, U2>): AsyncToFn<T, U1 | U2>;
	<T, U1, U2, U3>(transformer1: AsyncToFn<T, U1>, transformer2: AsyncToFn<T, U2>, transformer3: AsyncToFn<T, U3>): AsyncToFn<T, U1 | U2 | U3>;
	<T, U1, U2, U3, U4>(transformer1: AsyncToFn<T, U1>, transformer2: AsyncToFn<T, U2>, transformer3: AsyncToFn<T, U3>, transformer4: AsyncToFn<T, U4>): AsyncToFn<T, U1 | U2 | U3 | U4>;
	<T, U1, U2, U3, U4, U5>(transformer1: AsyncToFn<T, U1>, transformer2: AsyncToFn<T, U2>, transformer3: AsyncToFn<T, U3>, transformer4: AsyncToFn<T, U4>, Asynctransformer5: AsyncToFn<T, U5>): AsyncToFn<T, U1 | U2 | U3 | U4 | U5>;
	<T, U1, SUM>(transformer1: AsyncToFn<T, U1>, ...transformers: AsyncToFn<T, any>[]): AsyncToFn<T, U1 | SUM>;
};

export type CollectArgs = {
	<U>(func: Fn<[], U>): () => U,
	<T1, U>(func: Fn<[T1], U>): (arg1: T1) => U,
	<T1, T2, U>(func: Fn<[T1, T2], U>): (arg1: T1, arg2: T2) => U,
	<T1, T2, T3, U>(func: Fn<[T1, T2, T3], U>): (arg1: T1, arg2: T2, arg3: T3) => U,
	<T1, T2, T3, T4, U>(func: Fn<[T1, T2, T3, T4], U>): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => U,
	<T1, T2, T3, T4, T5, U>(func: Fn<[T1, T2, T3, T4, T5], U>): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => U,
	<T, U>(func: Fn<T[], U>): (...args: T[]) => U,
};
export type SpreadArgs = {
	<U>(fn: () => U): Fn<[], U>,
	<T1, U>(fn: (arg1: T1) => U): Fn<[T1], U>,
	<T1, T2, U>(fn: (arg1: T1, arg2: T2) => U): Fn<[T1, T2], U>,
	<T1, T2, T3, U>(fn: (arg1: T1, arg2: T2, arg3: T3) => U): Fn<[T1, T2, T3], U>,
	<T1, T2, T3, T4, U>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => U): Fn<[T1, T2, T3, T4], U>,
	<T1, T2, T3, T4, T5, U>(fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => U): Fn<[T1, T2, T3, T4, T5], U>,
	<T, U>(fn: (...args: T[]) => U): Fn<T[], U>,
};
export type SpreadArgsOverload2 = <T1, T2, U>(fn: (arg1: T1, arg2: T2) => U) => Fn<[T1, T2], U>;

export type Filter = {
	<T, U extends T>(fn: IsFn<T, U>): Fn<T[], U[]>
	<T>(fn: Fn<T, boolean>): Fn<T[], T[]>;
};

/// Errors

export type Err = {
	code: number,
	message: string,
};

export type ErrHandler = Fn<Err, None>;

// JSON extended types

export type JSONPrimitive = string | number | boolean | null;
export type JSONObject = {
	[property: string]: Option<JSONValue>,
}
export type JSONArray = Array<JSONValue>;
export type JSONStruct = JSONObject | JSONArray;
export type JSONValue = JSONPrimitive | JSONStruct;

export type JsonRpcRequest = {
	jsonrpc: "2.0",
	method: Method,
	params?: Option<JSONValue>,
	id: string | number,
};

export type JsonRpcResponse = {
	jsonrpc: "2.0",
	result: JSONValue,
	id: string | number | null,
};

export type JsonRpcErrorResponse  = {
	jsonrpc: "2.0",
	error: Err,
	id: string | number | null,
};

/// Low level transport

export type Transport = (endpoint: string, method: string, body: string) => Promise<string>;

/// Bitcoin

export type BitcoinAddress = string;
export type BitcoinTxId = string;
export type Balance = {
	total: number,
	available: number,
};

/// Defiads

export type DefiadsApiWallet = {
	withdraw:  (destAddress: BitcoinAddress, feeRate: number, amtSat?: number) => MaybeAsyncOption<DefiadsResultType["withdraw"]>,
	fund:  (defiadId: DefiadId, amtSat: number, term: number, feeRate: number) => MaybeAsyncOption<DefiadsResultType["fund"]>,
}

export type DefiadsApi = {
	categories: () => MaybeAsyncOption<DefiadsResultType["categories"]>,
	list: (categories: DefiadCategory[]) => MaybeAsyncOption<DefiadsResultType["list"]>,
	read: (defiadIds: DefiadId[]) => MaybeAsyncOption<DefiadsResultType["read"]>,
	readOne: (defiadId: DefiadId) => MaybeAsyncOption<DefiadsResultType["readOne"]>,
	deposit: () => MaybeAsyncOption<DefiadsResultType["deposit"]>,
	balance: () => MaybeAsyncOption<DefiadsResultType["balance"]>,
	prepare: (category: DefiadCategory, abstract: DefiadAbstract, content: DefiadContent) => MaybeAsyncOption<DefiadsResultType["prepare"]>,
	list_prepared: () => MaybeAsyncOption<DefiadsResultType["list_prepared"]>,
	read_prepared: (defiadId: DefiadId) => MaybeAsyncOption<DefiadsResultType["read_prepared"]>,
	wallet: (passphrase: string) => DefiadsApiWallet,
	help: () => DefiadsResultType["help"],
};

/// Result Types

export type DefiadsResultType = {
	categories: DefiadCategory[],
	list: ListItem[],
	read: Ad[],
	readOne: Ad,
	deposit: BitcoinAddress,
	balance: Balance,
	prepare: DefiadId,
	list_prepared: DefiadId[],
	read_prepared: Prepared,
	withdraw: BitcoinTxId,
	fund: BitcoinTxId,
	help: JSONObject,
};

export type Method = keyof DefiadsResultType;

export type DefiadsClientMethod = "categories" | "list" | "read" | "deposit" | "balance" | "prepare" | "list_prepared" | "read_prepared" | "withdraw" | "fund";

export type Ad = {
	id: DefiadId,
	cat: DefiadCategory,
	abs: DefiadAbstract,
	text: DefiadContent,
	weight: number,
	length: number,
	height: number,
	publisher: string,
	term: number,
	start: number,
	end: number,
};

export type DefiadId = string;
export type DefiadCategory = string;
export type DefiadAbstract = string;
export type DefiadContent = string;

export type MetaData = {
	supported: boolean,
	valid: boolean,
	signed: boolean,
	verified: boolean,
	pubKeyHash: Option<string>,
	link: Option<string>,
};

export type ListItem = {
	id: DefiadId,
	cat: DefiadCategory,
	abs: DefiadAbstract,
};

export type Prepared = {
	cat: DefiadCategory,
	abs: DefiadAbstract,
	text: DefiadContent,
};

export type WithMetaData = {
	metaData: MetaData,
}

export type WithDisplayMetaData = {
	id?: Option<DefiadId>,
	amount?: Option<string>,
} & WithMetaData;

export type DisplayableAd = Prepared & WithDisplayMetaData;

export type DefiadsClient = (method: DefiadsClientMethod) =>
	(...params: any[]) =>
		MaybeAsyncOption<JSONValue>;

export type DefiadsClientFactory = (defiadsClientConfig: DefiadsClientContext) => DefiadsClient;

export type DefiadsFactory = (defiadsClient: DefiadsClient) => DefiadsApi;

export type DefiadsClientContext = {
	transport: Transport,
	endpoint: string,
	apiKey: string,
	errHandler: ErrHandler,
};



/// Web App specific types

export type ContextCache = {
	[k: string]: Option<string>,
};

export type ComposerContext = {
	display: boolean,
	defiadId: Option<string>,
	prepared: Option<Prepared>,
};

export type ContextMap = {
	transport: Transport,
	errHandlerMap: ErrHandlerMap,
	errHandler: ErrHandler,
	defiadsClientContext: DefiadsClientContext,
	defiadsClient: DefiadsClient,
	defiadsApi: DefiadsApi,
	defiadsApiWallet: DefiadsApiWallet,
	privateKey: CryptoKey,
	composerContext: ComposerContext,
	cache: ContextCache,
	multiStorage: MultiStorage,
};

export type Context = PartialOptional<ContextMap>;

export type InputContext = {
	name: string,
	msg: string,
	type: "text" | "number" | "password",
	allowStorage: boolean,
	allowStorageDefault: boolean,
	storagePossible?: Option<boolean>,
	readonly?: Option<true>,
	onRemember?: (value: string) => void,
	placeholder?: Option<string>,
	submitLabel?: Option<string>,
	default?: Option<string>,
	min?: Option<number>,
	max?: Option<number>
};

export type MultiStorage = {
	get: (key: string) => Option<string>,
	set: (key: string) => (value: string) => boolean,
	persist: (key: string) => (value: string) => boolean,
	delete: (key: string) => boolean,
	hasStorage: boolean,
};

export type InputLock = {
	counter: number,
	resolvers: {
		[k: string]: Array<(val: Option<string>) => void>,
	}
}

export type ErrHandlerMap = {
	[code: number]: ErrHandler,
	default: ErrHandler,
};

export type DisplayContextMap = {
	target: "cat" | "iframe",
	cat: string,
	catLink: boolean,
	abs: string,
	defiadId: string,
	amount: string,
	metaData: MetaData,
	content: string,
};

export type DisplayContext = PartialOptional<DisplayContextMap>;
