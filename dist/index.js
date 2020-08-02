"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NBXClient = void 0;
const fs = require("fs");
const axios_1 = require("axios");
const utils_1 = require("./utils");
class NBXClient {
    constructor(opts) {
        if (!opts.uri || !opts.cryptoCode) {
            throw new Error('Must contain uri (ex. https://nbx.mydomain.com ) and cryptoCode (ex. btc )');
        }
        if (!opts.address === false && !opts.address === !opts.derivationScheme) {
            throw new Error('Must contain address OR derivationScheme not both');
        }
        // make sure it is upper case
        opts.cryptoCode = opts.cryptoCode.toUpperCase();
        // remove trailing slash
        if (opts.uri.slice(-1) === '/')
            opts.uri = opts.uri.slice(0, -1);
        this.uri = opts.uri;
        this.cryptoCode = opts.cryptoCode;
        if (opts.derivationScheme) {
            this.derivationScheme = opts.derivationScheme;
            this.derivationSchemeInternal = utils_1.derivationSchemeInternalConvert(opts.derivationScheme);
        }
        if (opts.address)
            this.address = opts.address;
        if (opts.cookieFilePath)
            this.cookieFilePath = opts.cookieFilePath;
        if (opts.token)
            this.token = opts.token;
    }
    get auth() {
        if (this.cookieFilePath === undefined)
            return;
        if (this.cookieFilePath) {
            const text = fs.readFileSync(this.cookieFilePath, 'utf8');
            const [username, password] = text.split(':');
            return {
                username,
                password,
            };
        }
    }
    get hasWallet() {
        return !!this.address || !!this.derivationScheme;
    }
    async track(trackDerivationSchemeArg) {
        if (trackDerivationSchemeArg === undefined) {
            this.checkWallet();
        }
        else {
            try {
                this.checkHDWallet();
            }
            catch (err) {
                throw new Error('This method needs a derivationScheme when passing trackDerivationSchemeArg');
            }
        }
        const url = this.address
            ? this.uri + `/v1/cryptos/${this.cryptoCode}/addresses/${this.address}`
            : this.uri +
                `/v1/cryptos/${this.cryptoCode}/derivations/${this.derivationScheme}`;
        return this.makePost(url, this.auth, trackDerivationSchemeArg || {});
    }
    async getTransactions(includeTransaction) {
        this.checkWallet();
        const url = this.address
            ? this.uri +
                `/v1/cryptos/${this.cryptoCode}/addresses/${this.address}/transactions`
            : this.uri +
                `/v1/cryptos/${this.cryptoCode}/derivations/${this.derivationScheme}/transactions`;
        const query = includeTransaction !== undefined ? { includeTransaction } : undefined;
        return this.makeGet(url, this.auth, query);
    }
    async getTransaction(txid, includeTransaction) {
        this.checkWallet();
        const url = this.address
            ? this.uri +
                `/v1/cryptos/${this.cryptoCode}/addresses/${this.address}/transactions/${txid}`
            : this.uri +
                `/v1/cryptos/${this.cryptoCode}/derivations/${this.derivationScheme}/transactions/${txid}`;
        const query = includeTransaction !== undefined ? { includeTransaction } : undefined;
        return this.makeGet(url, this.auth, query);
    }
    async getBalance() {
        this.checkWallet();
        const url = this.address
            ? this.uri +
                `/v1/cryptos/${this.cryptoCode}/addresses/${this.address}/balance`
            : this.uri +
                `/v1/cryptos/${this.cryptoCode}/derivations/${this.derivationScheme}/balance`;
        return this.makeGet(url, this.auth);
    }
    async getTransactionNoWallet(txid, includeTransaction) {
        const url = this.uri + `/v1/cryptos/${this.cryptoCode}/transactions/${txid}`;
        const query = includeTransaction !== undefined ? { includeTransaction } : undefined;
        return this.makeGet(url, this.auth, query);
    }
    async getStatus() {
        const url = this.uri + `/v1/cryptos/${this.cryptoCode}/status`;
        return this.makeGet(url, this.auth);
    }
    async getAddress(opts) {
        this.checkHDWallet();
        const url = this.uri +
            `/v1/cryptos/${this.cryptoCode}/derivations/${this.derivationScheme}/addresses/unused`;
        return this.makeGet(url, this.auth, opts);
    }
    async getExtPubKeyFromScript(script) {
        this.checkHDWallet();
        const url = this.uri +
            `/v1/cryptos/${this.cryptoCode}/derivations/${this.derivationScheme}/scripts/${script}`;
        return this.makeGet(url, this.auth);
    }
    async getUtxos() {
        this.checkWallet();
        const url = this.address
            ? this.uri +
                `/v1/cryptos/${this.cryptoCode}/addresses/${this.address}/utxos`
            : this.uri +
                `/v1/cryptos/${this.cryptoCode}/derivations/${this.derivationScheme}/utxos`;
        return this.makeGet(url, this.auth);
    }
    async broadcastTx(tx, testMempoolAccept) {
        const url = this.uri + `/v1/cryptos/${this.cryptoCode}/transactions`;
        const query = testMempoolAccept === true ? { testMempoolAccept: true } : undefined;
        return this.makePost(url, this.auth, tx, query, {
            'Content-Type': 'application/octet-stream'
        }).then((res) => {
            if (res.success === true) {
                return res;
            }
            throw Object.assign(new Error(res.rpcCodeMessage ? res.rpcCodeMessage : ''), res);
        });
    }
    async rescanTx(transactions) {
        const url = this.uri + `/v1/cryptos/${this.cryptoCode}/rescan`;
        return this.makePost(url, this.auth, { transactions });
    }
    async getFeeRate(blockCount) {
        const url = this.uri + `/v1/cryptos/${this.cryptoCode}/fees/${blockCount}`;
        return this.makeGet(url, this.auth);
    }
    async scanWallet(opts) {
        this.checkHDWallet();
        const url = this.uri +
            `/v1/cryptos/${this.cryptoCode}/derivations/${this.derivationScheme}/utxos/scan`;
        return this.makePost(url, this.auth, undefined, opts);
    }
    async getScanStatus() {
        this.checkHDWallet();
        const url = this.uri +
            `/v1/cryptos/${this.cryptoCode}/derivations/${this.derivationScheme}/utxos/scan`;
        return this.makeGet(url, this.auth);
    }
    async getEvents(opts) {
        const url = this.uri + `/v1/cryptos/${this.cryptoCode}/events`;
        return this.makeGet(url, this.auth, opts);
    }
    async getLatestEvents(opts) {
        const url = this.uri + `/v1/cryptos/${this.cryptoCode}/events/latest`;
        return this.makeGet(url, this.auth, opts);
    }
    async createPsbt(opts) {
        this.checkHDWallet();
        const url = this.uri +
            `/v1/cryptos/${this.cryptoCode}/derivations/${this.derivationScheme}/psbt/create`;
        return this.makePost(url, this.auth, opts);
    }
    async updatePsbt(opts) {
        const url = this.uri + `/v1/cryptos/${this.cryptoCode}/psbt/update`;
        if (opts && !opts.derivationScheme && this.derivationScheme) {
            opts.derivationScheme = this.derivationScheme;
        }
        return this.makePost(url, this.auth, opts);
    }
    async addMeta(key, value) {
        this.checkHDWallet();
        const url = this.uri +
            `/v1/cryptos/${this.cryptoCode}/derivations/${this.derivationScheme}/metadata/${key}`;
        return this.makePost(url, this.auth, { [key]: value });
    }
    async removeMeta(key) {
        this.checkHDWallet();
        const url = this.uri +
            `/v1/cryptos/${this.cryptoCode}/derivations/${this.derivationScheme}/metadata/${key}`;
        return this.makePost(url, this.auth);
    }
    /**
     * @returns An Object with one key that matches the string `key` argument.
     *   The data in key `key` is the same data passed as the `value` argument in
     *   addMeta.
     */
    async getMeta(key) {
        this.checkHDWallet();
        const url = this.uri +
            `/v1/cryptos/${this.cryptoCode}/derivations/${this.derivationScheme}/metadata/${key}`;
        return this.makeGet(url, this.auth);
    }
    async prune(opts) {
        this.checkHDWallet();
        const url = this.uri +
            `/v1/cryptos/${this.cryptoCode}/derivations/${this.derivationScheme}/prune`;
        return this.makePost(url, this.auth, opts);
    }
    async generateWallet(opts) {
        const url = this.uri + `/v1/cryptos/${this.cryptoCode}/derivations`;
        const resp = await this.makePost(url, this.auth, opts);
        if (!this.derivationScheme) {
            this.derivationScheme = resp.derivationScheme;
            this.derivationSchemeInternal = utils_1.derivationSchemeInternalConvert(resp.derivationScheme);
        }
        return resp;
    }
    async rpcProxy(opts) {
        const url = this.uri + `/v1/cryptos/${this.cryptoCode}/rpc`;
        return this.makePost(url, this.auth, opts, {
            'Content-Type': 'application/json',
        });
    }
    async healthCheck() {
        const url = this.uri + `/health`;
        return this.makeGet(url, undefined);
    }
    checkWallet() {
        if (!this.hasWallet)
            throw new Error('This method needs an address or derivationScheme');
    }
    checkHDWallet() {
        if (!this.derivationScheme)
            throw new Error('This method needs a derivationScheme');
    }
    async makeGet(uri, auth, query, headers) {
        return axios_1.default.get(uri, { auth, params: query, headers: Object.assign(this.token ? { Authorization: `Basic ${this.token}` } : {}, headers) }).then(resp => {
            return resp.data;
        });
    }
    async makePost(uri, auth, body, query, headers) {
        return axios_1.default.post(uri, body, { auth, params: query, headers: Object.assign(this.token ? { Authorization: `Basic ${this.token}` } : {}, headers) }).then(resp => {
            return resp.data;
        });
    }
}
exports.NBXClient = NBXClient;
__exportStar(require("./interfaces"), exports);
