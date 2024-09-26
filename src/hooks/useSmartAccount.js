"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAINS = void 0;
exports.useSmartAccount = useSmartAccount;
var react_1 = require("react");
var web3a_1 = require("@jiffy-labs/web3a");
var react_auth_1 = require("@privy-io/react-auth");
var wagmi_1 = require("@privy-io/wagmi");
var permissionless_1 = require("permissionless");
var accounts_1 = require("permissionless/accounts");
var pimlico_1 = require("permissionless/clients/pimlico");
var chains_1 = require("viem/chains");
var wagmi_2 = require("wagmi");
var viem_1 = require("viem");
var openCompusChain = (0, viem_1.defineChain)({
    id: 656476,
    name: "OPEN_CAMPUS_TEST",
    nativeCurrency: {
        decimals: 18,
        name: "EDU",
        symbol: "EDU",
    },
    rpcUrls: {
        default: {
            http: ["https://rpc.open-campus-codex.gelato.digital/"],
        },
    },
    blockExplorers: {
        default: { name: "Explorer", url: "https://opencampus-codex.blockscout.com/" },
    },
});
// Define environment variables
var jiffyscanKey = process.env.NEXT_PUBLIC_JIFFYSCAN_API_KEY;
// Define the chains with their respective entry points and RPC URLs
exports.CHAINS = [
    {
        name: "Base Mainnet",
        chain: chains_1.base,
        bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL_BASE,
        explorerUrl: "https://basescan.org/",
    },
    {
        name: "Open Campus Codex",
        chain: openCompusChain,
        bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_URL_EDU_CHAIN,
        explorerUrl: "https://opencampus-codex.blockscout.com/",
    }
];
function useSmartAccount() {
    var _this = this;
    var _a = (0, react_1.useState)(null), smartAccountClient = _a[0], setSmartAccountClient = _a[1];
    var wallets = (0, react_auth_1.useWallets)().wallets;
    var isConnected = (0, wagmi_2.useAccount)().isConnected;
    var publicClient = (0, wagmi_2.usePublicClient)();
    var walletClient = (0, wagmi_2.useWalletClient)().data;
    var _b = (0, react_1.useState)(exports.CHAINS[0]), selectedChain = _b[0], setSelectedChain = _b[1]; // Ensure a valid initial value
    var embeddedWallet = (0, react_1.useMemo)(function () { return wallets.find(function (wallet) { return wallet.walletClientType === "privy"; }); }, [wallets]);
    var setActiveWallet = (0, wagmi_1.useSetActiveWallet)().setActiveWallet;
    // Set the active wallet if embeddedWallet is found
    (0, react_1.useEffect)(function () {
        if (embeddedWallet) {
            setActiveWallet(embeddedWallet);
        }
    }, [embeddedWallet, setActiveWallet]);
    // Initialize the SmartAccountClient when dependencies change
    (0, react_1.useEffect)(function () {
        (function () { return __awaiter(_this, void 0, void 0, function () {
            var customSigner, bundlerTransport, bundlerClient_1, jiffyPaymaster, simpleSmartAccountClient, smartAccountClient_1, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(isConnected && walletClient && publicClient && selectedChain)) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        customSigner = (0, permissionless_1.walletClientToSmartAccountSigner)(walletClient);
                        bundlerTransport = (0, wagmi_2.http)(selectedChain.bundlerUrl, {
                            fetchOptions: {
                                headers: { "x-api-key": jiffyscanKey },
                            },
                        });
                        bundlerClient_1 = (0, pimlico_1.createPimlicoBundlerClient)({
                            transport: bundlerTransport,
                            entryPoint: permissionless_1.ENTRYPOINT_ADDRESS_V06,
                        });
                        jiffyPaymaster = new web3a_1.JiffyPaymaster("https://paymaster.jiffyscan.xyz", selectedChain.chain.id, {
                            "x-api-key": jiffyscanKey,
                        });
                        return [4 /*yield*/, (0, accounts_1.signerToSimpleSmartAccount)(publicClient, {
                                entryPoint: permissionless_1.ENTRYPOINT_ADDRESS_V06,
                                signer: customSigner,
                            })];
                    case 2:
                        simpleSmartAccountClient = _a.sent();
                        smartAccountClient_1 = (0, permissionless_1.createSmartAccountClient)({
                            account: simpleSmartAccountClient,
                            entryPoint: permissionless_1.ENTRYPOINT_ADDRESS_V06,
                            chain: selectedChain.chain,
                            bundlerTransport: bundlerTransport,
                            middleware: {
                                gasPrice: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, bundlerClient_1.getUserOperationGasPrice()];
                                        case 1: return [2 /*return*/, (_a.sent()).fast];
                                    }
                                }); }); },
                                sponsorUserOperation: jiffyPaymaster.sponsorUserOperationV6,
                            },
                        });
                        setSmartAccountClient(smartAccountClient_1);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Error initializing SmartAccountClient:", error_1);
                        setSmartAccountClient(null);
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        setSmartAccountClient(null);
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        }); })();
    }, [isConnected, walletClient, publicClient, selectedChain]);
    // Handle chain selection change
    var handleChainChange = function (e) {
        var selectedChainId = parseInt(e.target.value, 10);
        var selected = exports.CHAINS.find(function (chain) { return chain.chain.id === selectedChainId; }) || exports.CHAINS[0]; // Fallback to default chain
        setSelectedChain(selected);
    };
    // Fetch user operation hash with retry logic
    var fetchUserOperationHash = function (txHash) { return __awaiter(_this, void 0, void 0, function () {
        var uoHash, retries, resObj, res, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    uoHash = "";
                    retries = 0;
                    resObj = null;
                    _a.label = 1;
                case 1:
                    if (!(retries < 20)) return [3 /*break*/, 11];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 8, , 10]);
                    return [4 /*yield*/, fetch("https://api.jiffyscan.xyz/v0/getBundleActivity?bundle=".concat(txHash, "&network=").concat(selectedChain === null || selectedChain === void 0 ? void 0 : selectedChain.chain.name, "&first=10&skip=0"), {
                            headers: {
                                "x-api-key": jiffyscanKey,
                            },
                        })];
                case 3:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 4:
                    resObj = _a.sent();
                    if (!(resObj.bundleDetails &&
                        resObj.bundleDetails.userOps &&
                        resObj.bundleDetails.userOps.length > 0)) return [3 /*break*/, 5];
                    return [2 /*return*/, resObj.bundleDetails.userOps[0].userOpHash];
                case 5:
                    console.log("No bundle details found, retrying...");
                    retries++;
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 3000); })];
                case 6:
                    _a.sent(); // wait for 3 seconds before retrying
                    _a.label = 7;
                case 7: return [3 /*break*/, 10];
                case 8:
                    error_2 = _a.sent();
                    console.error("Error fetching user operation hash:", error_2);
                    retries++;
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 3000); })];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 10: return [3 /*break*/, 1];
                case 11:
                    if (retries >= 20) {
                        console.log("Failed to fetch bundle details after 20 retries");
                    }
                    return [2 /*return*/, uoHash];
            }
        });
    }); };
    return {
        isConnected: isConnected,
        smartAccountClient: smartAccountClient,
        handleChainChange: handleChainChange,
        selectedChain: selectedChain,
        fetchUserOperationHash: fetchUserOperationHash,
    };
}
