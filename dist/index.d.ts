/// <reference types="node" />
import { BroadcastTxResponse, CreatePsbtArgs, CreatePsbtResponse, Event, GenerateWalletArgs, GenerateWalletResponse, GetAddressArgs, GetAddressResponse, GetBalanceResponse, GetEventsArgs, GetExtPubKeyFromScriptResponse, GetFeeRateResponse, GetLatestEventsArgs, GetScanStatusResponse, GetStatusResponse, GetTransactionNoWalletResponse, GetTransactionResponse, GetTransactionsResponse, GetUtxosResponse, HealthCheckResponse, NBXClientOpts, PruneArgs, PruneResponse, RescanTxArgs, RpcProxyArgs, RpcProxyResponse, ScanWalletArgs, TrackDerivationSchemeArg, UpdatePsbtArgs, UpdatePsbtResponse } from './interfaces';
export declare class NBXClient {
    uri: string;
    cryptoCode: string;
    derivationScheme?: string;
    derivationSchemeInternal?: string;
    address?: string;
    instanceName?: string;
    private cookieFilePath?;
    private token?;
    constructor(opts: NBXClientOpts & {
        token?: string;
    });
    private get auth();
    private get hasWallet();
    track(trackDerivationSchemeArg?: TrackDerivationSchemeArg): Promise<void>;
    getTransactions(includeTransaction?: boolean): Promise<GetTransactionsResponse>;
    getTransaction(txid: string, includeTransaction?: boolean): Promise<GetTransactionResponse>;
    getBalance(): Promise<GetBalanceResponse>;
    getTransactionNoWallet(txid: string, includeTransaction?: boolean): Promise<GetTransactionNoWalletResponse>;
    getStatus(): Promise<GetStatusResponse>;
    getAddress(opts?: GetAddressArgs): Promise<GetAddressResponse>;
    getExtPubKeyFromScript(script: string): Promise<GetExtPubKeyFromScriptResponse>;
    getUtxos(): Promise<GetUtxosResponse>;
    broadcastTx(tx: Buffer, testMempoolAccept?: boolean): Promise<BroadcastTxResponse>;
    rescanTx(transactions: RescanTxArgs[]): Promise<void>;
    getFeeRate(blockCount: number): Promise<GetFeeRateResponse>;
    scanWallet(opts?: ScanWalletArgs): Promise<void>;
    getScanStatus(): Promise<GetScanStatusResponse>;
    getEvents(opts?: GetEventsArgs): Promise<Event[]>;
    getLatestEvents(opts?: GetLatestEventsArgs): Promise<Event[]>;
    createPsbt(opts: CreatePsbtArgs): Promise<CreatePsbtResponse>;
    updatePsbt(opts: UpdatePsbtArgs): Promise<UpdatePsbtResponse>;
    addMeta(key: string, value: any): Promise<void>;
    removeMeta(key: string): Promise<void>;
    /**
     * @returns An Object with one key that matches the string `key` argument.
     *   The data in key `key` is the same data passed as the `value` argument in
     *   addMeta.
     */
    getMeta(key: string): Promise<any>;
    prune(opts?: PruneArgs): Promise<PruneResponse>;
    generateWallet(opts: GenerateWalletArgs): Promise<GenerateWalletResponse>;
    rpcProxy(opts: RpcProxyArgs[]): Promise<RpcProxyResponse[]>;
    rpcProxy(opts: RpcProxyArgs): Promise<RpcProxyResponse>;
    healthCheck(): Promise<HealthCheckResponse>;
    private checkWallet;
    private checkHDWallet;
    private makeGet;
    private makePost;
}
export * from './interfaces';
