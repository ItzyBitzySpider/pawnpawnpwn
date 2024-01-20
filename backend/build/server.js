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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { createServer } from "http";
import eetase from "eetase";
import socketClusterServer from "socketcluster-server";
import express from "express";
import morgan from "morgan";
import { generateRoomCode } from "./utils/calc.js";
import { debugServerLogs } from "./utils/debug.js";
import "dotenv";
var ENVIRONMENT = process.env.ENV || "dev";
var SOCKETCLUSTER_PORT = process.env.SOCKETCLUSTER_PORT || 8000;
var agOptions = {};
if (process.env.SOCKETCLUSTER_OPTIONS) {
    var envOptions = JSON.parse(process.env.SOCKETCLUSTER_OPTIONS);
    Object.assign(agOptions, envOptions);
}
var httpServer = eetase(createServer());
var expressApp = express();
if (ENVIRONMENT === "dev") {
    expressApp.use(morgan("dev"));
}
// Add GET /health-check express route
expressApp.get("/health-check", function (req, res) {
    res.status(200).send("OK");
});
// create-room express route
expressApp.get("/create-room", function (req, res) {
    var roomCode = generateRoomCode();
    console.log(roomCode);
    var agServer = socketClusterServer.attach(httpServer, {
        path: "/socketcluster/" + roomCode,
    });
    // SocketCluster/WebSocket connection handling loop.
    (function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, socket, e_1_1;
        var _d, e_1, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 5, 6, 11]);
                    _a = true, _b = __asyncValues(agServer.listener("connection"));
                    _g.label = 1;
                case 1: return [4 /*yield*/, _b.next()];
                case 2:
                    if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 4];
                    _f = _c.value;
                    _a = false;
                    socket = _f.socket;
                    console.log(socket.id + " connected to room " + roomCode);
                    _g.label = 3;
                case 3:
                    _a = true;
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 11];
                case 5:
                    e_1_1 = _g.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 11];
                case 6:
                    _g.trys.push([6, , 9, 10]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 8];
                    return [4 /*yield*/, _e.call(_b)];
                case 7:
                    _g.sent();
                    _g.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 10: return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    }); })();
    debugServerLogs(2, agServer);
    res.status(200).json({ roomCode: roomCode });
});
// HTTP request handling loop.
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c, requestData, e_2_1;
    var _d, e_2, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _g.trys.push([0, 5, 6, 11]);
                _a = true, _b = __asyncValues(httpServer.listener("request"));
                _g.label = 1;
            case 1: return [4 /*yield*/, _b.next()];
            case 2:
                if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 4];
                _f = _c.value;
                _a = false;
                requestData = _f;
                expressApp.apply(null, requestData);
                _g.label = 3;
            case 3:
                _a = true;
                return [3 /*break*/, 1];
            case 4: return [3 /*break*/, 11];
            case 5:
                e_2_1 = _g.sent();
                e_2 = { error: e_2_1 };
                return [3 /*break*/, 11];
            case 6:
                _g.trys.push([6, , 9, 10]);
                if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 8];
                return [4 /*yield*/, _e.call(_b)];
            case 7:
                _g.sent();
                _g.label = 8;
            case 8: return [3 /*break*/, 10];
            case 9:
                if (e_2) throw e_2.error;
                return [7 /*endfinally*/];
            case 10: return [7 /*endfinally*/];
            case 11: return [2 /*return*/];
        }
    });
}); })();
httpServer.listen(SOCKETCLUSTER_PORT);
