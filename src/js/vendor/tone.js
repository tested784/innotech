!function (root) {
    "use strict";

    function Main(t) {
        Tone = t()
    }

    function Module(t) {
        t(Tone)
    }

    var Tone;
    /**
     *  Tone.js
     *  @author Yotam Mann
     *  @license http://opensource.org/licenses/MIT MIT License
     *  @copyright 2014-2015 Yotam Mann
     */
    Main(function () {
        function t(t) {
            return void 0 === t
        }

        function e(t) {
            return "function" == typeof t
        }

        var i, s, n, o;
        if (t(window.AudioContext) && (window.AudioContext = window.webkitAudioContext), t(window.OfflineAudioContext) && (window.OfflineAudioContext = window.webkitOfflineAudioContext), t(AudioContext)) throw new Error("Web Audio is not supported in this browser");
        return i = new AudioContext, e(AudioContext.prototype.createGain) || (AudioContext.prototype.createGain = AudioContext.prototype.createGainNode), e(AudioContext.prototype.createDelay) || (AudioContext.prototype.createDelay = AudioContext.prototype.createDelayNode), e(AudioContext.prototype.createPeriodicWave) || (AudioContext.prototype.createPeriodicWave = AudioContext.prototype.createWaveTable), e(AudioBufferSourceNode.prototype.start) || (AudioBufferSourceNode.prototype.start = AudioBufferSourceNode.prototype.noteGrainOn), e(AudioBufferSourceNode.prototype.stop) || (AudioBufferSourceNode.prototype.stop = AudioBufferSourceNode.prototype.noteOff), e(OscillatorNode.prototype.start) || (OscillatorNode.prototype.start = OscillatorNode.prototype.noteOn), e(OscillatorNode.prototype.stop) || (OscillatorNode.prototype.stop = OscillatorNode.prototype.noteOff), e(OscillatorNode.prototype.setPeriodicWave) || (OscillatorNode.prototype.setPeriodicWave = OscillatorNode.prototype.setWaveTable), AudioNode.prototype._nativeConnect = AudioNode.prototype.connect, AudioNode.prototype.connect = function (e, i, s) {
            if (e.input) Array.isArray(e.input) ? (t(s) && (s = 0), this.connect(e.input[s])) : this.connect(e.input, i, s);
            else try {
                e instanceof AudioNode ? this._nativeConnect(e, i, s) : this._nativeConnect(e, i)
            } catch (n) {
                throw new Error("error connecting to node: " + e)
            }
        }, s = function (e, i) {
            t(e) || 1 === e ? this.input = this.context.createGain() : e > 1 && (this.input = new Array(e)), t(i) || 1 === i ? this.output = this.context.createGain() : i > 1 && (this.output = new Array(e))
        }, s.prototype.set = function (e, i, n) {
            var o, r, a, l, h, u;
            this.isObject(e) ? n = i : this.isString(e) && (o = {}, o[e] = i, e = o);
            for (r in e) {
                if (i = e[r], a = this, -1 !== r.indexOf(".")) {
                    for (l = r.split("."), h = 0; h < l.length - 1; h++) a = a[l[h]];
                    r = l[l.length - 1]
                }
                u = a[r], t(u) || (s.Signal && u instanceof s.Signal || s.Param && u instanceof s.Param ? u.value !== i && (t(n) ? u.value = i : u.rampTo(i, n)) : u instanceof AudioParam ? u.value !== i && (u.value = i) : u instanceof s ? u.set(i) : u !== i && (a[r] = i))
            }
            return this
        }, s.prototype.get = function (i) {
            var n, o, r, a, l, h, u, c, p;
            for (t(i) ? i = this._collectDefaults(this.constructor) : this.isString(i) && (i = [i]), n = {}, o = 0; o < i.length; o++) {
                if (r = i[o], a = this, l = n, -1 !== r.indexOf(".")) {
                    for (h = r.split("."), u = 0; u < h.length - 1; u++) c = h[u], l[c] = l[c] || {}, l = l[c], a = a[c];
                    r = h[h.length - 1]
                }
                p = a[r], this.isObject(i[r]) ? l[r] = p.get() : s.Signal && p instanceof s.Signal ? l[r] = p.value : s.Param && p instanceof s.Param ? l[r] = p.value : p instanceof AudioParam ? l[r] = p.value : p instanceof s ? l[r] = p.get() : e(p) || t(p) || (l[r] = p)
            }
            return n
        }, s.prototype._collectDefaults = function (e) {
            var i, s, n = [];
            if (t(e.defaults) || (n = Object.keys(e.defaults)), !t(e._super)) for (i = this._collectDefaults(e._super), s = 0; s < i.length; s++) -1 === n.indexOf(i[s]) && n.push(i[s]);
            return n
        }, s.prototype.toString = function () {
            var t, i, n;
            for (t in s) if (i = t[0].match(/^[A-Z]$/), n = s[t] === this.constructor, e(s[t]) && i && n) return t;
            return "Tone"
        }, s.context = i, s.prototype.context = s.context, s.prototype.bufferSize = 2048, s.prototype.blockTime = 128 / s.context.sampleRate, s.prototype.dispose = function () {
            return this.isUndef(this.input) || (this.input instanceof AudioNode && this.input.disconnect(), this.input = null), this.isUndef(this.output) || (this.output instanceof AudioNode && this.output.disconnect(), this.output = null), this
        }, n = null, s.prototype.noGC = function () {
            return this.output.connect(n), this
        }, AudioNode.prototype.noGC = function () {
            return this.connect(n), this
        }, s.prototype.connect = function (t, e, i) {
            return Array.isArray(this.output) ? (e = this.defaultArg(e, 0), this.output[e].connect(t, 0, i)) : this.output.connect(t, e, i), this
        }, s.prototype.disconnect = function (t) {
            return Array.isArray(this.output) ? (t = this.defaultArg(t, 0), this.output[t].disconnect()) : this.output.disconnect(), this
        }, s.prototype.connectSeries = function () {
            var t, e, i;
            if (arguments.length > 1) for (t = arguments[0], e = 1; e < arguments.length; e++) i = arguments[e], t.connect(i), t = i;
            return this
        }, s.prototype.connectParallel = function () {
            var t, e, i = arguments[0];
            if (arguments.length > 1) for (t = 1; t < arguments.length; t++) e = arguments[t], i.connect(e);
            return this
        }, s.prototype.chain = function () {
            var t, e, i;
            if (arguments.length > 0) for (t = this, e = 0; e < arguments.length; e++) i = arguments[e], t.connect(i), t = i;
            return this
        }, s.prototype.fan = function () {
            if (arguments.length > 0) for (var t = 0; t < arguments.length; t++) this.connect(arguments[t]);
            return this
        }, AudioNode.prototype.chain = s.prototype.chain, AudioNode.prototype.fan = s.prototype.fan, s.prototype.defaultArg = function (e, i) {
            var s, n, o;
            if (this.isObject(e) && this.isObject(i)) {
                s = {};
                for (n in e) s[n] = this.defaultArg(i[n], e[n]);
                for (o in i) s[o] = this.defaultArg(e[o], i[o]);
                return s
            }
            return t(e) ? i : e
        }, s.prototype.optionsObject = function (t, e, i) {
            var s, n = {};
            if (1 === t.length && this.isObject(t[0])) n = t[0];
            else for (s = 0; s < e.length; s++) n[e[s]] = t[s];
            return this.isUndef(i) ? n : this.defaultArg(n, i)
        }, s.prototype.isUndef = t, s.prototype.isFunction = e, s.prototype.isNumber = function (t) {
            return "number" == typeof t
        }, s.prototype.isObject = function (t) {
            return "[object Object]" === Object.prototype.toString.call(t) && t.constructor === Object
        }, s.prototype.isBoolean = function (t) {
            return "boolean" == typeof t
        }, s.prototype.isArray = function (t) {
            return Array.isArray(t)
        }, s.prototype.isString = function (t) {
            return "string" == typeof t
        }, s.noOp = function () {
        }, s.prototype._readOnly = function (t) {
            if (Array.isArray(t)) for (var e = 0; e < t.length; e++) this._readOnly(t[e]);
            else Object.defineProperty(this, t, {
                writable: !1,
                enumerable: !0
            })
        }, s.prototype._writable = function (t) {
            if (Array.isArray(t)) for (var e = 0; e < t.length; e++) this._writable(t[e]);
            else Object.defineProperty(this, t, {
                writable: !0
            })
        }, s.State = {
            Started: "started",
            Stopped: "stopped",
            Paused: "paused"
        }, s.prototype.equalPowerScale = function (t) {
            var e = .5 * Math.PI;
            return Math.sin(t * e)
        }, s.prototype.dbToGain = function (t) {
            return Math.pow(2, t / 6)
        }, s.prototype.gainToDb = function (t) {
            return 20 * (Math.log(t) / Math.LN10)
        }, s.prototype.now = function () {
            return this.context.currentTime
        }, s.extend = function (e, i) {
            function n() {
            }

            t(i) && (i = s), n.prototype = i.prototype, e.prototype = new n, e.prototype.constructor = e, e._super = i
        }, o = [], s._initAudioContext = function (t) {
            t(s.context), o.push(t)
        }, s.setContext = function (t) {
            s.prototype.context = t, s.context = t;
            for (var e = 0; e < o.length; e++) o[e](t)
        }, s.startMobile = function () {
            var t, e = s.context.createOscillator(),
                i = s.context.createGain();
            i.gain.value = 0, e.connect(i), i.connect(s.context.destination), t = s.context.currentTime, e.start(t), e.stop(t + 1)
        }, s._initAudioContext(function (t) {
            s.prototype.blockTime = 128 / t.sampleRate, n = t.createGain(), n.gain.value = 0, n.connect(t.destination)
        }), s.version = "r6", console.log("%c * Tone.js " + s.version + " * ", "background: #000; color: #fff"), s
    }), Module(function (t) {
        return t.SignalBase = function () {
        }, t.extend(t.SignalBase), t.SignalBase.prototype.connect = function (e, i, s) {
            return t.Signal && t.Signal === e.constructor || t.Param && t.Param === e.constructor || t.TimelineSignal && t.TimelineSignal === e.constructor ? (e._param.cancelScheduledValues(0), e._param.value = 0, e.overridden = !0) : e instanceof AudioParam && (e.cancelScheduledValues(0), e.value = 0), t.prototype.connect.call(this, e, i, s), this
        }, t.SignalBase
    }), Module(function (t) {
        return t.WaveShaper = function (t, e) {
            this._shaper = this.input = this.output = this.context.createWaveShaper(), this._curve = null, Array.isArray(t) ? this.curve = t : isFinite(t) || this.isUndef(t) ? this._curve = new Float32Array(this.defaultArg(t, 1024)) : this.isFunction(t) && (this._curve = new Float32Array(this.defaultArg(e, 1024)), this.setMap(t))
        }, t.extend(t.WaveShaper, t.SignalBase), t.WaveShaper.prototype.setMap = function (t) {
            var e, i, s;
            for (e = 0, i = this._curve.length; i > e; e++) s = e / i * 2 - 1, this._curve[e] = t(s, e);
            return this._shaper.curve = this._curve, this
        }, Object.defineProperty(t.WaveShaper.prototype, "curve", {
            get: function () {
                return this._shaper.curve
            },
            set: function (t) {
                this._curve = new Float32Array(t), this._shaper.curve = this._curve
            }
        }), Object.defineProperty(t.WaveShaper.prototype, "oversample", {
            get: function () {
                return this._shaper.oversample
            },
            set: function (t) {
                if (-1 === ["none", "2x", "4x"].indexOf(t)) throw new Error("invalid oversampling: " + t);
                this._shaper.oversample = t
            }
        }), t.WaveShaper.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._shaper.disconnect(), this._shaper = null, this._curve = null, this
        }, t.WaveShaper
    }), Module(function (Tone) {
        function getTransportBpm() {
            return Tone.Transport && Tone.Transport.bpm ? Tone.Transport.bpm.value : 120
        }

        function getTransportTimeSignature() {
            return Tone.Transport && Tone.Transport.timeSignature ? Tone.Transport.timeSignature : 4
        }

        function toNotationHelper(t, e, i, s) {
            var n, o, r, a, l = this.toSeconds(t),
                h = this.notationToSeconds(s[s.length - 1], e, i),
                u = "";
            for (n = 0; n < s.length; n++) if (o = this.notationToSeconds(s[n], e, i), r = l / o, a = 1e-6, a > 1 - r % 1 && (r += a), r = Math.floor(r), r > 0) {
                if (u += 1 === r ? s[n] : r.toString() + "*" + s[n], l -= r * o, h > l) break;
                u += " + "
            }
            return "" === u && (u = "0"), u
        }

        var noteToScaleIndex, scaleIndexToNote;
        return Tone.Type = {
            Default: "number",
            Time: "time",
            Frequency: "frequency",
            NormalRange: "normalRange",
            AudioRange: "audioRange",
            Decibels: "db",
            Interval: "interval",
            BPM: "bpm",
            Positive: "positive",
            Cents: "cents",
            Degrees: "degrees",
            MIDI: "midi",
            TransportTime: "transportTime",
            Ticks: "tick",
            Note: "note",
            Milliseconds: "milliseconds",
            Notation: "notation"
        }, Tone.prototype.isNowRelative = function () {
            var t = new RegExp(/^\s*\+(.)+/i);
            return function (e) {
                return t.test(e)
            }
        }(), Tone.prototype.isTicks = function () {
            var t = new RegExp(/^\d+i$/i);
            return function (e) {
                return t.test(e)
            }
        }(), Tone.prototype.isNotation = function () {
            var t = new RegExp(/^[0-9]+[mnt]$/i);
            return function (e) {
                return t.test(e)
            }
        }(), Tone.prototype.isTransportTime = function () {
            var t = new RegExp(/^(\d+(\.\d+)?\:){1,2}(\d+(\.\d+)?)?$/i);
            return function (e) {
                return t.test(e)
            }
        }(), Tone.prototype.isNote = function () {
            var t = new RegExp(/^[a-g]{1}(b|#|x|bb)?-?[0-9]+$/i);
            return function (e) {
                return t.test(e)
            }
        }(), Tone.prototype.isFrequency = function () {
            var t = new RegExp(/^\d*\.?\d+hz$/i);
            return function (e) {
                return t.test(e)
            }
        }(), Tone.prototype.notationToSeconds = function (t, e, i) {
            var s, n, o, r;
            return e = this.defaultArg(e, getTransportBpm()), i = this.defaultArg(i, getTransportTimeSignature()), s = 60 / e, "1n" === t && (t = "1m"), n = parseInt(t, 10), o = 0, 0 === n && (o = 0), r = t.slice(-1), o = "t" === r ? 4 / n * 2 / 3 : "n" === r ? 4 / n : "m" === r ? n * i : 0, s * o
        }, Tone.prototype.transportTimeToSeconds = function (t, e, i) {
            var s, n, o, r, a;
            return e = this.defaultArg(e, getTransportBpm()), i = this.defaultArg(i, getTransportTimeSignature()), s = 0, n = 0, o = 0, r = t.split(":"), 2 === r.length ? (s = parseFloat(r[0]), n = parseFloat(r[1])) : 1 === r.length ? n = parseFloat(r[0]) : 3 === r.length && (s = parseFloat(r[0]), n = parseFloat(r[1]), o = parseFloat(r[2])), a = s * i + n + o / 4, a * (60 / e)
        }, Tone.prototype.ticksToSeconds = function (t, e) {
            if (this.isUndef(Tone.Transport)) return 0;
            t = parseFloat(t), e = this.defaultArg(e, getTransportBpm());
            var i = 60 / e / Tone.Transport.PPQ;
            return i * t
        }, Tone.prototype.frequencyToSeconds = function (t) {
            return 1 / parseFloat(t)
        }, Tone.prototype.samplesToSeconds = function (t) {
            return t / this.context.sampleRate
        }, Tone.prototype.secondsToSamples = function (t) {
            return t * this.context.sampleRate
        }, Tone.prototype.secondsToTransportTime = function (t, e, i) {
            var s, n, o, r, a;
            return e = this.defaultArg(e, getTransportBpm()), i = this.defaultArg(i, getTransportTimeSignature()), s = 60 / e, n = t / s, o = Math.floor(n / i), r = n % 1 * 4, n = Math.floor(n) % i, a = [o, n, r], a.join(":")
        }, Tone.prototype.secondsToFrequency = function (t) {
            return 1 / t
        }, Tone.prototype.toTransportTime = function (t, e, i) {
            var s = this.toSeconds(t);
            return this.secondsToTransportTime(s, e, i)
        }, Tone.prototype.toFrequency = function (t, e) {
            return this.isFrequency(t) ? parseFloat(t) : this.isNotation(t) || this.isTransportTime(t) ? this.secondsToFrequency(this.toSeconds(t, e)) : this.isNote(t) ? this.noteToFrequency(t) : t
        }, Tone.prototype.toTicks = function (t) {
            var e, i, s, n, o, r;
            if (this.isUndef(Tone.Transport)) return 0;
            if (e = Tone.Transport.bpm.value, i = 0, this.isNowRelative(t)) t = t.replace("+", ""), i = Tone.Transport.ticks;
            else if (this.isUndef(t)) return Tone.Transport.ticks;
            return s = this.toSeconds(t), n = 60 / e, o = s / n, r = o * Tone.Transport.PPQ, Math.round(r + i)
        }, Tone.prototype.toSamples = function (t) {
            var e = this.toSeconds(t);
            return Math.round(e * this.context.sampleRate)
        }, Tone.prototype.toSeconds = function (time, now) {
            var plusTime, betweenParens, j, symbol, symbolVal, quantizationSplit, toQuantize, subdivision, components, originalTime, i, symb, val;
            if (now = this.defaultArg(now, this.now()), this.isNumber(time)) return time;
            if (this.isString(time)) {
                if (plusTime = 0, this.isNowRelative(time) && (time = time.replace("+", ""), plusTime = now), betweenParens = time.match(/\(([^)(]+)\)/g)) for (j = 0; j < betweenParens.length; j++) symbol = betweenParens[j].replace(/[\(\)]/g, ""), symbolVal = this.toSeconds(symbol), time = time.replace(betweenParens[j], symbolVal);
                if (-1 !== time.indexOf("@")) {
                    if (quantizationSplit = time.split("@"), this.isUndef(Tone.Transport)) throw new Error("quantization requires Tone.Transport");
                    toQuantize = quantizationSplit[0].trim(), "" === toQuantize && (toQuantize = void 0), plusTime > 0 && (toQuantize = "+" + toQuantize, plusTime = 0), subdivision = quantizationSplit[1].trim(), time = Tone.Transport.quantize(toQuantize, subdivision)
                } else if (components = time.split(/[\(\)\-\+\/\*]/), components.length > 1) {
                    for (originalTime = time, i = 0; i < components.length; i++) symb = components[i].trim(), "" !== symb && (val = this.toSeconds(symb), time = time.replace(symb, val));
                    try {
                        time = eval(time)
                    } catch (e) {
                        throw new EvalError("cannot evaluate Time: " + originalTime)
                    }
                } else time = this.isNotation(time) ? this.notationToSeconds(time) : this.isTransportTime(time) ? this.transportTimeToSeconds(time) : this.isFrequency(time) ? this.frequencyToSeconds(time) : this.isTicks(time) ? this.ticksToSeconds(time) : parseFloat(time);
                return time + plusTime
            }
            return now
        }, Tone.prototype.toNotation = function (t, e, i) {
            var s = ["1m", "2n", "4n", "8n", "16n", "32n", "64n", "128n"],
                n = toNotationHelper.call(this, t, e, i, s),
                o = ["1m", "2n", "2t", "4n", "4t", "8n", "8t", "16n", "16t", "32n", "32t", "64n", "64t", "128n"],
                r = toNotationHelper.call(this, t, e, i, o);
            return r.split("+").length < n.split("+").length ? r : n
        }, Tone.prototype.fromUnits = function (t, e) {
            if (!this.convert && !this.isUndef(this.convert)) return t;
            switch (e) {
                case Tone.Type.Time:
                    return this.toSeconds(t);
                case Tone.Type.Frequency:
                    return this.toFrequency(t);
                case Tone.Type.Decibels:
                    return this.dbToGain(t);
                case Tone.Type.NormalRange:
                    return Math.min(Math.max(t, 0), 1);
                case Tone.Type.AudioRange:
                    return Math.min(Math.max(t, -1), 1);
                case Tone.Type.Positive:
                    return Math.max(t, 0);
                default:
                    return t
            }
        }, Tone.prototype.toUnits = function (t, e) {
            if (!this.convert && !this.isUndef(this.convert)) return t;
            switch (e) {
                case Tone.Type.Decibels:
                    return this.gainToDb(t);
                default:
                    return t
            }
        }, noteToScaleIndex = {
            cbb: -2,
            cb: -1,
            c: 0,
            "c#": 1,
            cx: 2,
            dbb: 0,
            db: 1,
            d: 2,
            "d#": 3,
            dx: 4,
            ebb: 2,
            eb: 3,
            e: 4,
            "e#": 5,
            ex: 6,
            fbb: 3,
            fb: 4,
            f: 5,
            "f#": 6,
            fx: 7,
            gbb: 5,
            gb: 6,
            g: 7,
            "g#": 8,
            gx: 9,
            abb: 7,
            ab: 8,
            a: 9,
            "a#": 10,
            ax: 11,
            bbb: 9,
            bb: 10,
            b: 11,
            "b#": 12,
            bx: 13
        }, scaleIndexToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], Tone.A4 = 440, Tone.prototype.noteToFrequency = function (t) {
            var e, i, s, n = t.split(/(-?\d+)/);
            return 3 === n.length ? (e = noteToScaleIndex[n[0].toLowerCase()], i = n[1], s = e + 12 * (parseInt(i, 10) + 1), this.midiToFrequency(s)) : 0
        }, Tone.prototype.frequencyToNote = function (t) {
            var e, i = Math.log(t / Tone.A4) / Math.LN2,
                s = Math.round(12 * i) + 57,
                n = Math.floor(s / 12);
            return 0 > n && (s += -12 * n), e = scaleIndexToNote[s % 12], e + n.toString()
        }, Tone.prototype.intervalToFrequencyRatio = function (t) {
            return Math.pow(2, t / 12)
        }, Tone.prototype.midiToNote = function (t) {
            var e = Math.floor(t / 12) - 1,
                i = t % 12;
            return scaleIndexToNote[i] + e
        }, Tone.prototype.noteToMidi = function (t) {
            var e, i, s = t.split(/(\d+)/);
            return 3 === s.length ? (e = noteToScaleIndex[s[0].toLowerCase()], i = s[1], e + 12 * (parseInt(i, 10) + 1)) : 0
        }, Tone.prototype.midiToFrequency = function (t) {
            return Tone.A4 * Math.pow(2, (t - 69) / 12)
        }, Tone
    }), Module(function (t) {
        return t.Param = function () {
            var e = this.optionsObject(arguments, ["param", "units", "convert"], t.Param.defaults);
            this._param = this.input = e.param, this.units = e.units, this.convert = e.convert, this.overridden = !1, this.isUndef(e.value) || (this.value = e.value)
        }, t.extend(t.Param), t.Param.defaults = {
            units: t.Type.Default,
            convert: !0,
            param: void 0
        }, Object.defineProperty(t.Param.prototype, "value", {
            get: function () {
                return this._toUnits(this._param.value)
            },
            set: function (t) {
                var e = this._fromUnits(t);
                this._param.value = e
            }
        }), t.Param.prototype._fromUnits = function (e) {
            if (!this.convert && !this.isUndef(this.convert)) return e;
            switch (this.units) {
                case t.Type.Time:
                    return this.toSeconds(e);
                case t.Type.Frequency:
                    return this.toFrequency(e);
                case t.Type.Decibels:
                    return this.dbToGain(e);
                case t.Type.NormalRange:
                    return Math.min(Math.max(e, 0), 1);
                case t.Type.AudioRange:
                    return Math.min(Math.max(e, -1), 1);
                case t.Type.Positive:
                    return Math.max(e, 0);
                default:
                    return e
            }
        }, t.Param.prototype._toUnits = function (e) {
            if (!this.convert && !this.isUndef(this.convert)) return e;
            switch (this.units) {
                case t.Type.Decibels:
                    return this.gainToDb(e);
                default:
                    return e
            }
        }, t.Param.prototype._minOutput = 1e-5, t.Param.prototype.setValueAtTime = function (t, e) {
            return t = this._fromUnits(t), this._param.setValueAtTime(t, this.toSeconds(e)), this
        }, t.Param.prototype.setRampPoint = function (t) {
            t = this.defaultArg(t, this.now());
            var e = this._param.value;
            return this._param.setValueAtTime(e, t), this
        }, t.Param.prototype.linearRampToValueAtTime = function (t, e) {
            return t = this._fromUnits(t), this._param.linearRampToValueAtTime(t, this.toSeconds(e)), this
        }, t.Param.prototype.exponentialRampToValueAtTime = function (t, e) {
            return t = this._fromUnits(t), t = Math.max(this._minOutput, t), this._param.exponentialRampToValueAtTime(t, this.toSeconds(e)), this
        }, t.Param.prototype.exponentialRampToValue = function (t, e) {
            var i = this.now(),
                s = this.value;
            return this.setValueAtTime(Math.max(s, this._minOutput), i), this.exponentialRampToValueAtTime(t, i + this.toSeconds(e)), this
        }, t.Param.prototype.linearRampToValue = function (t, e) {
            var i = this.now();
            return this.setRampPoint(i), this.linearRampToValueAtTime(t, i + this.toSeconds(e)), this
        }, t.Param.prototype.setTargetAtTime = function (t, e, i) {
            return t = this._fromUnits(t), t = Math.max(this._minOutput, t), i = Math.max(this._minOutput, i), this._param.setTargetAtTime(t, this.toSeconds(e), i), this
        }, t.Param.prototype.setValueCurveAtTime = function (t, e, i) {
            for (var s = 0; s < t.length; s++) t[s] = this._fromUnits(t[s]);
            return this._param.setValueCurveAtTime(t, this.toSeconds(e), this.toSeconds(i)), this
        }, t.Param.prototype.cancelScheduledValues = function (t) {
            return this._param.cancelScheduledValues(this.toSeconds(t)), this
        }, t.Param.prototype.rampTo = function (e, i) {
            return i = this.defaultArg(i, 0), this.units === t.Type.Frequency || this.units === t.Type.BPM ? this.exponentialRampToValue(e, i) : this.linearRampToValue(e, i), this
        }, t.Param.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._param = null, this
        }, t.Param
    }), Module(function (t) {
        return t.Gain = function () {
            var e = this.optionsObject(arguments, ["gain", "units"], t.Gain.defaults);
            this.input = this.output = this._gainNode = this.context.createGain(), this.gain = new t.Param({
                param: this._gainNode.gain,
                units: e.units,
                value: e.gain,
                convert: e.convert
            }), this._readOnly("gain")
        }, t.extend(t.Gain), t.Gain.defaults = {
            gain: 1,
            convert: !0
        }, t.Gain.prototype.dispose = function () {
            t.Param.prototype.dispose.call(this), this._gainNode.disconnect(), this._gainNode = null, this._writable("gain"), this.gain.dispose(), this.gain = null
        }, t.Gain
    }), Module(function (t) {
        return t.Signal = function () {
            var e = this.optionsObject(arguments, ["value", "units"], t.Signal.defaults);
            this.output = this._gain = this.context.createGain(), e.param = this._gain.gain, t.Param.call(this, e), this.input = this._param = this._gain.gain, t.Signal._constant.chain(this._gain)
        }, t.extend(t.Signal, t.Param), t.Signal.defaults = {
            value: 0,
            units: t.Type.Default,
            convert: !0
        }, t.Signal.prototype.connect = t.SignalBase.prototype.connect, t.Signal.prototype.dispose = function () {
            return t.Param.prototype.dispose.call(this), this._param = null, this._gain.disconnect(), this._gain = null, this
        }, t.Signal._constant = null, t._initAudioContext(function (e) {
            var i, s = e.createBuffer(1, 128, e.sampleRate),
                n = s.getChannelData(0);
            for (i = 0; i < n.length; i++) n[i] = 1;
            t.Signal._constant = e.createBufferSource(), t.Signal._constant.channelCount = 1, t.Signal._constant.channelCountMode = "explicit", t.Signal._constant.buffer = s, t.Signal._constant.loop = !0, t.Signal._constant.start(0), t.Signal._constant.noGC()
        }), t.Signal
    }), Module(function (t) {
        return t.Timeline = function () {
            var e = this.optionsObject(arguments, ["memory"], t.Timeline.defaults);
            this._timeline = [], this._toRemove = [], this._iterating = !1, this.memory = e.memory
        }, t.extend(t.Timeline), t.Timeline.defaults = {
            memory: 1 / 0
        }, Object.defineProperty(t.Timeline.prototype, "length", {
            get: function () {
                return this._timeline.length
            }
        }), t.Timeline.prototype.addEvent = function (t) {
            var e, i;
            if (this.isUndef(t.time)) throw new Error("events must have a time attribute");
            return t.time = this.toSeconds(t.time), this._timeline.length ? (e = this._search(t.time), this._timeline.splice(e + 1, 0, t)) : this._timeline.push(t), this.length > this.memory && (i = this.length - this.memory, this._timeline.splice(0, i)), this
        }, t.Timeline.prototype.removeEvent = function (t) {
            if (this._iterating) this._toRemove.push(t);
            else {
                var e = this._timeline.indexOf(t);
                -1 !== e && this._timeline.splice(e, 1)
            }
            return this
        }, t.Timeline.prototype.getEvent = function (t) {
            t = this.toSeconds(t);
            var e = this._search(t);
            return -1 !== e ? this._timeline[e] : null
        }, t.Timeline.prototype.getEventAfter = function (t) {
            t = this.toSeconds(t);
            var e = this._search(t);
            return e + 1 < this._timeline.length ? this._timeline[e + 1] : null
        }, t.Timeline.prototype.getEventBefore = function (t) {
            t = this.toSeconds(t);
            var e = this._search(t);
            return e - 1 >= 0 ? this._timeline[e - 1] : null
        }, t.Timeline.prototype.cancel = function (t) {
            if (this._timeline.length > 1) {
                t = this.toSeconds(t);
                var e = this._search(t);
                this._timeline = e >= 0 ? this._timeline.slice(0, e) : []
            } else 1 === this._timeline.length && this._timeline[0].time >= t && (this._timeline = []);
            return this
        }, t.Timeline.prototype.cancelBefore = function (t) {
            if (this._timeline.length) {
                t = this.toSeconds(t);
                var e = this._search(t);
                e >= 0 && (this._timeline = this._timeline.slice(e + 1))
            }
            return this
        }, t.Timeline.prototype._search = function (t) {
            for (var e, i, s, n, o = 0, r = this._timeline.length, a = r; a >= o && r > o;) {
                if (e = Math.floor(o + (a - o) / 2), i = this._timeline[e], i.time === t) {
                    for (s = e; s < this._timeline.length; s++) n = this._timeline[s], n.time === t && (e = s);
                    return e
                }
                i.time > t ? a = e - 1 : i.time < t && (o = e + 1)
            }
            return o - 1
        }, t.Timeline.prototype._iterate = function (t, e, i) {
            var s, n, o;
            for (this._iterating = !0, e = this.defaultArg(e, 0), i = this.defaultArg(i, this._timeline.length - 1), s = e; i >= s; s++) t(this._timeline[s]);
            if (this._iterating = !1, this._toRemove.length > 0) {
                for (n = 0; n < this._toRemove.length; n++) o = this._timeline.indexOf(this._toRemove[n]), -1 !== o && this._timeline.splice(o, 1);
                this._toRemove = []
            }
        }, t.Timeline.prototype.forEach = function (t) {
            return this._iterate(t), this
        }, t.Timeline.prototype.forEachBefore = function (t, e) {
            t = this.toSeconds(t);
            var i = this._search(t);
            return -1 !== i && this._iterate(e, 0, i), this
        }, t.Timeline.prototype.forEachAfter = function (t, e) {
            t = this.toSeconds(t);
            var i = this._search(t);
            return this._iterate(e, i + 1), this
        }, t.Timeline.prototype.forEachFrom = function (t, e) {
            t = this.toSeconds(t);
            for (var i = this._search(t); i >= 0 && this._timeline[i].time >= t;) i--;
            return this._iterate(e, i + 1), this
        }, t.Timeline.prototype.forEachAtTime = function (t, e) {
            t = this.toSeconds(t);
            var i = this._search(t);
            return -1 !== i && this._iterate(function (i) {
                i.time === t && e(i)
            }, 0, i), this
        }, t.Timeline.prototype.dispose = function () {
            t.prototype.dispose.call(this), this._timeline = null, this._toRemove = null
        }, t.Timeline
    }), Module(function (t) {
        return t.TimelineSignal = function () {
            var e = this.optionsObject(arguments, ["value", "units"], t.Signal.defaults);
            t.Signal.apply(this, e), e.param = this._param, t.Param.call(this, e), this._events = new t.Timeline(10), this._initial = this._fromUnits(this._param.value)
        }, t.extend(t.TimelineSignal, t.Param), t.TimelineSignal.Type = {
            Linear: "linear",
            Exponential: "exponential",
            Target: "target",
            Set: "set"
        }, Object.defineProperty(t.TimelineSignal.prototype, "value", {
            get: function () {
                return this._toUnits(this._param.value)
            },
            set: function (t) {
                var e = this._fromUnits(t);
                this._initial = e, this._param.value = e
            }
        }), t.TimelineSignal.prototype.setValueAtTime = function (e, i) {
            return e = this._fromUnits(e), i = this.toSeconds(i), this._events.addEvent({
                type: t.TimelineSignal.Type.Set,
                value: e,
                time: i
            }), this._param.setValueAtTime(e, i), this
        }, t.TimelineSignal.prototype.linearRampToValueAtTime = function (e, i) {
            return e = this._fromUnits(e), i = this.toSeconds(i), this._events.addEvent({
                type: t.TimelineSignal.Type.Linear,
                value: e,
                time: i
            }), this._param.linearRampToValueAtTime(e, i), this
        }, t.TimelineSignal.prototype.exponentialRampToValueAtTime = function (e, i) {
            return e = this._fromUnits(e), e = Math.max(this._minOutput, e), i = this.toSeconds(i), this._events.addEvent({
                type: t.TimelineSignal.Type.Exponential,
                value: e,
                time: i
            }), this._param.exponentialRampToValueAtTime(e, i), this
        }, t.TimelineSignal.prototype.setTargetAtTime = function (e, i, s) {
            return e = this._fromUnits(e), e = Math.max(this._minOutput, e), s = Math.max(this._minOutput, s), i = this.toSeconds(i), this._events.addEvent({
                type: t.TimelineSignal.Type.Target,
                value: e,
                time: i,
                constant: s
            }), this._param.setTargetAtTime(e, i, s), this
        }, t.TimelineSignal.prototype.cancelScheduledValues = function (t) {
            return this._events.cancel(t), this._param.cancelScheduledValues(this.toSeconds(t)), this
        }, t.TimelineSignal.prototype.setRampPoint = function (e) {
            var i, s;
            return e = this.toSeconds(e), i = this.getValueAtTime(e), s = this._searchAfter(e), s && (this.cancelScheduledValues(e), s.type === t.TimelineSignal.Type.Linear ? this.linearRampToValueAtTime(i, e) : s.type === t.TimelineSignal.Type.Exponential && this.exponentialRampToValueAtTime(i, e)), this.setValueAtTime(i, e), this
        }, t.TimelineSignal.prototype.linearRampToValueBetween = function (t, e, i) {
            return this.setRampPoint(e), this.linearRampToValueAtTime(t, i), this
        }, t.TimelineSignal.prototype.exponentialRampToValueBetween = function (t, e, i) {
            return this.setRampPoint(e), this.exponentialRampToValueAtTime(t, i), this
        }, t.TimelineSignal.prototype._searchBefore = function (t) {
            return this._events.getEvent(t)
        }, t.TimelineSignal.prototype._searchAfter = function (t) {
            return this._events.getEventAfter(t)
        }, t.TimelineSignal.prototype.getValueAtTime = function (e) {
            var i, s, n = this._searchAfter(e),
                o = this._searchBefore(e),
                r = this._initial;
            return null === o ? r = this._initial : o.type === t.TimelineSignal.Type.Target ? (i = this._events.getEventBefore(o.time), s = null === i ? this._initial : i.value, r = this._exponentialApproach(o.time, s, o.value, o.constant, e)) : r = null === n ? o.value : n.type === t.TimelineSignal.Type.Linear ? this._linearInterpolate(o.time, o.value, n.time, n.value, e) : n.type === t.TimelineSignal.Type.Exponential ? this._exponentialInterpolate(o.time, o.value, n.time, n.value, e) : o.value, r
        }, t.TimelineSignal.prototype.connect = t.SignalBase.prototype.connect, t.TimelineSignal.prototype._exponentialApproach = function (t, e, i, s, n) {
            return i + (e - i) * Math.exp(-(n - t) / s)
        }, t.TimelineSignal.prototype._linearInterpolate = function (t, e, i, s, n) {
            return e + (s - e) * ((n - t) / (i - t))
        }, t.TimelineSignal.prototype._exponentialInterpolate = function (t, e, i, s, n) {
            return e = Math.max(this._minOutput, e), e * Math.pow(s / e, (n - t) / (i - t))
        }, t.TimelineSignal.prototype.dispose = function () {
            t.Signal.prototype.dispose.call(this), t.Param.prototype.dispose.call(this), this._events.dispose(), this._events = null
        }, t.TimelineSignal
    }), Module(function (t) {
        return t.Pow = function (e) {
            this._exp = this.defaultArg(e, 1), this._expScaler = this.input = this.output = new t.WaveShaper(this._expFunc(this._exp), 8192)
        }, t.extend(t.Pow, t.SignalBase), Object.defineProperty(t.Pow.prototype, "value", {
            get: function () {
                return this._exp
            },
            set: function (t) {
                this._exp = t, this._expScaler.setMap(this._expFunc(this._exp))
            }
        }), t.Pow.prototype._expFunc = function (t) {
            return function (e) {
                return Math.pow(Math.abs(e), t)
            }
        }, t.Pow.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._expScaler.dispose(), this._expScaler = null, this
        }, t.Pow
    }), Module(function (t) {
        return t.Envelope = function () {
            var e = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], t.Envelope.defaults);
            this.attack = e.attack, this.decay = e.decay, this.sustain = e.sustain, this.release = e.release, this._attackCurve = t.Envelope.Type.Linear, this._releaseCurve = t.Envelope.Type.Exponential, this._minOutput = 1e-5, this._sig = this.output = new t.TimelineSignal, this._sig.setValueAtTime(this._minOutput, 0), this.attackCurve = e.attackCurve, this.releaseCurve = e.releaseCurve
        }, t.extend(t.Envelope), t.Envelope.defaults = {
            attack: .01,
            decay: .1,
            sustain: .5,
            release: 1,
            attackCurve: "linear",
            releaseCurve: "exponential"
        }, t.Envelope.prototype._timeMult = .25, Object.defineProperty(t.Envelope.prototype, "value", {
            get: function () {
                return this._sig.value
            }
        }), Object.defineProperty(t.Envelope.prototype, "attackCurve", {
            get: function () {
                return this._attackCurve
            },
            set: function (e) {
                if (e !== t.Envelope.Type.Linear && e !== t.Envelope.Type.Exponential) throw Error('attackCurve must be either "linear" or "exponential". Invalid type: ', e);
                this._attackCurve = e
            }
        }), Object.defineProperty(t.Envelope.prototype, "releaseCurve", {
            get: function () {
                return this._releaseCurve
            },
            set: function (e) {
                if (e !== t.Envelope.Type.Linear && e !== t.Envelope.Type.Exponential) throw Error('releaseCurve must be either "linear" or "exponential". Invalid type: ', e);
                this._releaseCurve = e
            }
        }), t.Envelope.prototype.triggerAttack = function (e, i) {
            var s, n, o = this.now() + this.blockTime;
            return e = this.toSeconds(e, o), s = this.toSeconds(this.attack) + e, n = this.toSeconds(this.decay), i = this.defaultArg(i, 1), this._attackCurve === t.Envelope.Type.Linear ? this._sig.linearRampToValueBetween(i, e, s) : this._sig.exponentialRampToValueBetween(i, e, s), this._sig.setValueAtTime(i, s), this._sig.exponentialRampToValueAtTime(this.sustain * i, s + n), this
        }, t.Envelope.prototype.triggerRelease = function (e) {
            var i, s = this.now() + this.blockTime;
            return e = this.toSeconds(e, s), i = this.toSeconds(this.release), this._releaseCurve === t.Envelope.Type.Linear ? this._sig.linearRampToValueBetween(this._minOutput, e, e + i) : this._sig.exponentialRampToValueBetween(this._minOutput, e, i + e), this
        }, t.Envelope.prototype.triggerAttackRelease = function (t, e, i) {
            return e = this.toSeconds(e), this.triggerAttack(e, i), this.triggerRelease(e + this.toSeconds(t)), this
        }, t.Envelope.prototype.connect = t.Signal.prototype.connect, t.Envelope.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._sig.dispose(), this._sig = null, this
        }, t.Envelope.Phase = {
            Attack: "attack",
            Decay: "decay",
            Sustain: "sustain",
            Release: "release",
            Standby: "standby"
        }, t.Envelope.Type = {
            Linear: "linear",
            Exponential: "exponential"
        }, t.Envelope
    }), Module(function (t) {
        return t.AmplitudeEnvelope = function () {
            t.Envelope.apply(this, arguments), this.input = this.output = new t.Gain, this._sig.connect(this.output.gain)
        }, t.extend(t.AmplitudeEnvelope, t.Envelope), t.AmplitudeEnvelope.prototype.dispose = function () {
            return this.input.dispose(), this.input = null, t.Envelope.prototype.dispose.call(this), this
        }, t.AmplitudeEnvelope
    }), Module(function (t) {
        return t.Analyser = function () {
            var e = this.optionsObject(arguments, ["size", "type"], t.Analyser.defaults);
            this._analyser = this.input = this.context.createAnalyser(), this._type = e.type, this._returnType = e.returnType, this._buffer = null, this.size = e.size, this.type = e.type, this.returnType = e.returnType, this.minDecibels = e.minDecibels, this.maxDecibels = e.maxDecibels
        }, t.extend(t.Analyser), t.Analyser.defaults = {
            size: 2048,
            returnType: "byte",
            type: "fft",
            smoothing: .8,
            maxDecibels: -30,
            minDecibels: -100
        }, t.Analyser.Type = {
            Waveform: "waveform",
            FFT: "fft"
        }, t.Analyser.ReturnType = {
            Byte: "byte",
            Float: "float"
        }, t.Analyser.prototype.analyse = function () {
            return this._type === t.Analyser.Type.FFT ? this._returnType === t.Analyser.ReturnType.Byte ? this._analyser.getByteFrequencyData(this._buffer) : this._analyser.getFloatFrequencyData(this._buffer) : this._type === t.Analyser.Type.Waveform && (this._returnType === t.Analyser.ReturnType.Byte ? this._analyser.getByteTimeDomainData(this._buffer) : this._analyser.getFloatTimeDomainData(this._buffer)), this._buffer
        }, Object.defineProperty(t.Analyser.prototype, "size", {
            get: function () {
                return this._analyser.frequencyBinCount
            },
            set: function (t) {
                this._analyser.fftSize = 2 * t, this.type = this._type
            }
        }), Object.defineProperty(t.Analyser.prototype, "returnType", {
            get: function () {
                return this._returnType
            },
            set: function (e) {
                if (e === t.Analyser.ReturnType.Byte) this._buffer = new Uint8Array(this._analyser.frequencyBinCount);
                else {
                    if (e !== t.Analyser.ReturnType.Float) throw new Error("Invalid Return Type: " + e);
                    this._buffer = new Float32Array(this._analyser.frequencyBinCount)
                }
                this._returnType = e
            }
        }), Object.defineProperty(t.Analyser.prototype, "type", {
            get: function () {
                return this._type
            },
            set: function (e) {
                if (e !== t.Analyser.Type.Waveform && e !== t.Analyser.Type.FFT) throw new Error("Invalid Type: " + e);
                this._type = e
            }
        }), Object.defineProperty(t.Analyser.prototype, "smoothing", {
            get: function () {
                return this._analyser.smoothingTimeConstant
            },
            set: function (t) {
                this._analyser.smoothingTimeConstant = t
            }
        }), Object.defineProperty(t.Analyser.prototype, "minDecibels", {
            get: function () {
                return this._analyser.minDecibels
            },
            set: function (t) {
                this._analyser.minDecibels = t
            }
        }), Object.defineProperty(t.Analyser.prototype, "maxDecibels", {
            get: function () {
                return this._analyser.maxDecibels
            },
            set: function (t) {
                this._analyser.maxDecibels = t
            }
        }), t.Analyser.prototype.dispose = function () {
            t.prototype.dispose.call(this), this._analyser.disconnect(), this._analyser = null, this._buffer = null
        }, t.Analyser
    }), Module(function (t) {
        return t.Compressor = function () {
            var e = this.optionsObject(arguments, ["threshold", "ratio"], t.Compressor.defaults);
            this._compressor = this.input = this.output = this.context.createDynamicsCompressor(), this.threshold = this._compressor.threshold, this.attack = new t.Param(this._compressor.attack, t.Type.Time), this.release = new t.Param(this._compressor.release, t.Type.Time), this.knee = this._compressor.knee, this.ratio = this._compressor.ratio, this._readOnly(["knee", "release", "attack", "ratio", "threshold"]), this.set(e)
        }, t.extend(t.Compressor), t.Compressor.defaults = {
            ratio: 12,
            threshold: -24,
            release: .25,
            attack: .003,
            knee: 30
        }, t.Compressor.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._writable(["knee", "release", "attack", "ratio", "threshold"]), this._compressor.disconnect(), this._compressor = null, this.attack.dispose(), this.attack = null, this.release.dispose(), this.release = null, this.threshold = null, this.ratio = null, this.knee = null, this
        }, t.Compressor
    }), Module(function (t) {
        return t.Add = function (e) {
            t.call(this, 2, 0), this._sum = this.input[0] = this.input[1] = this.output = this.context.createGain(), this._param = this.input[1] = new t.Signal(e), this._param.connect(this._sum)
        }, t.extend(t.Add, t.Signal), t.Add.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._sum.disconnect(), this._sum = null, this._param.dispose(), this._param = null, this
        }, t.Add
    }), Module(function (t) {
        return t.Multiply = function (e) {
            t.call(this, 2, 0), this._mult = this.input[0] = this.output = this.context.createGain(), this._param = this.input[1] = this.output.gain, this._param.value = this.defaultArg(e, 0)
        }, t.extend(t.Multiply, t.Signal), t.Multiply.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._mult.disconnect(), this._mult = null, this._param = null, this
        }, t.Multiply
    }), Module(function (t) {
        return t.Negate = function () {
            this._multiply = this.input = this.output = new t.Multiply(-1)
        }, t.extend(t.Negate, t.SignalBase), t.Negate.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._multiply.dispose(), this._multiply = null, this
        }, t.Negate
    }), Module(function (t) {
        return t.Subtract = function (e) {
            t.call(this, 2, 0), this._sum = this.input[0] = this.output = this.context.createGain(), this._neg = new t.Negate, this._param = this.input[1] = new t.Signal(e), this._param.chain(this._neg, this._sum)
        }, t.extend(t.Subtract, t.Signal), t.Subtract.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._neg.dispose(), this._neg = null, this._sum.disconnect(), this._sum = null, this._param.dispose(), this._param = null, this
        }, t.Subtract
    }), Module(function (t) {
        return t.GreaterThanZero = function () {
            this._thresh = this.output = new t.WaveShaper(function (t) {
                return 0 >= t ? 0 : 1
            }), this._scale = this.input = new t.Multiply(1e4), this._scale.connect(this._thresh)
        }, t.extend(t.GreaterThanZero, t.SignalBase), t.GreaterThanZero.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._scale.dispose(), this._scale = null, this._thresh.dispose(), this._thresh = null, this
        }, t.GreaterThanZero
    }), Module(function (t) {
        return t.EqualZero = function () {
            this._scale = this.input = new t.Multiply(1e4), this._thresh = new t.WaveShaper(function (t) {
                return 0 === t ? 1 : 0
            }, 128), this._gtz = this.output = new t.GreaterThanZero, this._scale.chain(this._thresh, this._gtz)
        }, t.extend(t.EqualZero, t.SignalBase), t.EqualZero.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._gtz.dispose(), this._gtz = null, this._scale.dispose(), this._scale = null, this._thresh.dispose(), this._thresh = null, this
        }, t.EqualZero
    }), Module(function (t) {
        return t.Equal = function (e) {
            t.call(this, 2, 0), this._sub = this.input[0] = new t.Subtract(e), this._equals = this.output = new t.EqualZero, this._sub.connect(this._equals), this.input[1] = this._sub.input[1]
        }, t.extend(t.Equal, t.SignalBase), Object.defineProperty(t.Equal.prototype, "value", {
            get: function () {
                return this._sub.value
            },
            set: function (t) {
                this._sub.value = t
            }
        }), t.Equal.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._equals.dispose(), this._equals = null, this._sub.dispose(), this._sub = null, this
        }, t.Equal
    }), Module(function (t) {
        t.Select = function (i) {
            var s, n;
            for (i = this.defaultArg(i, 2), t.call(this, i, 1), this.gate = new t.Signal(0), this._readOnly("gate"), s = 0; i > s; s++) n = new e(s), this.input[s] = n, this.gate.connect(n.selecter), n.connect(this.output)
        }, t.extend(t.Select, t.SignalBase), t.Select.prototype.select = function (t, e) {
            return t = Math.floor(t), this.gate.setValueAtTime(t, this.toSeconds(e)), this
        }, t.Select.prototype.dispose = function () {
            this._writable("gate"), this.gate.dispose(), this.gate = null;
            for (var e = 0; e < this.input.length; e++) this.input[e].dispose(), this.input[e] = null;
            return t.prototype.dispose.call(this), this
        };
        var e = function (e) {
            this.selecter = new t.Equal(e), this.gate = this.input = this.output = this.context.createGain(), this.selecter.connect(this.gate.gain)
        };
        return t.extend(e), e.prototype.dispose = function () {
            t.prototype.dispose.call(this), this.selecter.dispose(), this.gate.disconnect(), this.selecter = null, this.gate = null
        }, t.Select
    }), Module(function (t) {
        return t.IfThenElse = function () {
            t.call(this, 3, 0), this._selector = this.output = new t.Select(2), this["if"] = this.input[0] = this._selector.gate, this.then = this.input[1] = this._selector.input[1], this["else"] = this.input[2] = this._selector.input[0]
        }, t.extend(t.IfThenElse, t.SignalBase), t.IfThenElse.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._selector.dispose(), this._selector = null, this["if"] = null, this.then = null, this["else"] = null, this
        }, t.IfThenElse
    }), Module(function (t) {
        return t.OR = function (e) {
            e = this.defaultArg(e, 2), t.call(this, e, 0), this._sum = this.context.createGain(), this._gtz = this.output = new t.GreaterThanZero;
            for (var i = 0; e > i; i++) this.input[i] = this._sum;
            this._sum.connect(this._gtz)
        }, t.extend(t.OR, t.SignalBase), t.OR.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._gtz.dispose(), this._gtz = null, this._sum.disconnect(), this._sum = null, this
        }, t.OR
    }), Module(function (t) {
        return t.AND = function (e) {
            e = this.defaultArg(e, 2), t.call(this, e, 0), this._equals = this.output = new t.Equal(e);
            for (var i = 0; e > i; i++) this.input[i] = this._equals
        }, t.extend(t.AND, t.SignalBase), t.AND.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._equals.dispose(), this._equals = null, this
        }, t.AND
    }), Module(function (t) {
        return t.NOT = t.EqualZero, t.NOT
    }), Module(function (t) {
        return t.GreaterThan = function (e) {
            t.call(this, 2, 0), this._param = this.input[0] = new t.Subtract(e), this.input[1] = this._param.input[1], this._gtz = this.output = new t.GreaterThanZero, this._param.connect(this._gtz)
        }, t.extend(t.GreaterThan, t.Signal), t.GreaterThan.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._param.dispose(), this._param = null, this._gtz.dispose(), this._gtz = null, this
        }, t.GreaterThan
    }), Module(function (t) {
        return t.LessThan = function (e) {
            t.call(this, 2, 0), this._neg = this.input[0] = new t.Negate, this._gt = this.output = new t.GreaterThan, this._rhNeg = new t.Negate, this._param = this.input[1] = new t.Signal(e), this._neg.connect(this._gt), this._param.connect(this._rhNeg), this._rhNeg.connect(this._gt, 0, 1)
        }, t.extend(t.LessThan, t.Signal), t.LessThan.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._neg.dispose(), this._neg = null, this._gt.dispose(), this._gt = null, this._rhNeg.dispose(), this._rhNeg = null, this._param.dispose(), this._param = null, this
        }, t.LessThan
    }), Module(function (t) {
        return t.Abs = function () {
            t.call(this, 1, 0), this._ltz = new t.LessThan(0), this._switch = this.output = new t.Select(2), this._negate = new t.Negate, this.input.connect(this._switch, 0, 0), this.input.connect(this._negate), this._negate.connect(this._switch, 0, 1), this.input.chain(this._ltz, this._switch.gate)
        }, t.extend(t.Abs, t.SignalBase), t.Abs.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._switch.dispose(), this._switch = null, this._ltz.dispose(), this._ltz = null, this._negate.dispose(), this._negate = null, this
        }, t.Abs
    }), Module(function (t) {
        return t.Max = function (e) {
            t.call(this, 2, 0), this.input[0] = this.context.createGain(), this._param = this.input[1] = new t.Signal(e), this._ifThenElse = this.output = new t.IfThenElse, this._gt = new t.GreaterThan, this.input[0].chain(this._gt, this._ifThenElse["if"]), this.input[0].connect(this._ifThenElse.then), this._param.connect(this._ifThenElse["else"]), this._param.connect(this._gt, 0, 1)
        }, t.extend(t.Max, t.Signal), t.Max.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._param.dispose(), this._ifThenElse.dispose(), this._gt.dispose(), this._param = null, this._ifThenElse = null, this._gt = null, this
        }, t.Max
    }), Module(function (t) {
        return t.Min = function (e) {
            t.call(this, 2, 0), this.input[0] = this.context.createGain(), this._ifThenElse = this.output = new t.IfThenElse, this._lt = new t.LessThan, this._param = this.input[1] = new t.Signal(e), this.input[0].chain(this._lt, this._ifThenElse["if"]), this.input[0].connect(this._ifThenElse.then), this._param.connect(this._ifThenElse["else"]), this._param.connect(this._lt, 0, 1)
        }, t.extend(t.Min, t.Signal), t.Min.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._param.dispose(), this._ifThenElse.dispose(), this._lt.dispose(), this._param = null, this._ifThenElse = null, this._lt = null, this
        }, t.Min
    }), Module(function (t) {
        return t.Modulo = function (e) {
            t.call(this, 1, 1), this._shaper = new t.WaveShaper(Math.pow(2, 16)), this._multiply = new t.Multiply, this._subtract = this.output = new t.Subtract, this._modSignal = new t.Signal(e), this.input.fan(this._shaper, this._subtract), this._modSignal.connect(this._multiply, 0, 0), this._shaper.connect(this._multiply, 0, 1), this._multiply.connect(this._subtract, 0, 1), this._setWaveShaper(e)
        }, t.extend(t.Modulo, t.SignalBase), t.Modulo.prototype._setWaveShaper = function (t) {
            this._shaper.setMap(function (e) {
                var i = Math.floor((e + 1e-4) / t);
                return i
            })
        }, Object.defineProperty(t.Modulo.prototype, "value", {
            get: function () {
                return this._modSignal.value
            },
            set: function (t) {
                this._modSignal.value = t, this._setWaveShaper(t)
            }
        }), t.Modulo.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._shaper.dispose(), this._shaper = null, this._multiply.dispose(), this._multiply = null, this._subtract.dispose(), this._subtract = null, this._modSignal.dispose(), this._modSignal = null, this
        }, t.Modulo
    }), Module(function (t) {
        return t.AudioToGain = function () {
            this._norm = this.input = this.output = new t.WaveShaper(function (t) {
                return (t + 1) / 2
            })
        }, t.extend(t.AudioToGain, t.SignalBase), t.AudioToGain.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._norm.dispose(), this._norm = null, this
        }, t.AudioToGain
    }), Module(function (t) {
        function e(t, e, i) {
            var s = new t;
            return i._eval(e[0]).connect(s, 0, 0), i._eval(e[1]).connect(s, 0, 1), s
        }

        function i(t, e, i) {
            var s = new t;
            return i._eval(e[0]).connect(s, 0, 0), s
        }

        function s(t) {
            return t ? parseFloat(t) : void 0
        }

        function n(t) {
            return t && t.args ? parseFloat(t.args) : void 0
        }

        return t.Expr = function () {
            var t, e, i, s = this._replacements(Array.prototype.slice.call(arguments)),
                n = this._parseInputs(s);
            for (this._nodes = [], this.input = new Array(n), t = 0; n > t; t++) this.input[t] = this.context.createGain();
            e = this._parseTree(s);
            try {
                i = this._eval(e)
            } catch (o) {
                throw this._disposeNodes(), new Error("Could evaluate expression: " + s)
            }
            this.output = i
        }, t.extend(t.Expr, t.SignalBase), t.Expr._Expressions = {
            value: {
                signal: {
                    regexp: /^\d+\.\d+|^\d+/,
                    method: function (e) {
                        var i = new t.Signal(s(e));
                        return i
                    }
                },
                input: {
                    regexp: /^\$\d/,
                    method: function (t, e) {
                        return e.input[s(t.substr(1))]
                    }
                }
            },
            glue: {
                "(": {
                    regexp: /^\(/
                },
                ")": {
                    regexp: /^\)/
                },
                ",": {
                    regexp: /^,/
                }
            },
            func: {
                abs: {
                    regexp: /^abs/,
                    method: i.bind(this, t.Abs)
                },
                min: {
                    regexp: /^min/,
                    method: e.bind(this, t.Min)
                },
                max: {
                    regexp: /^max/,
                    method: e.bind(this, t.Max)
                },
                "if": {
                    regexp: /^if/,
                    method: function (e, i) {
                        var s = new t.IfThenElse;
                        return i._eval(e[0]).connect(s["if"]), i._eval(e[1]).connect(s.then), i._eval(e[2]).connect(s["else"]), s
                    }
                },
                gt0: {
                    regexp: /^gt0/,
                    method: i.bind(this, t.GreaterThanZero)
                },
                eq0: {
                    regexp: /^eq0/,
                    method: i.bind(this, t.EqualZero)
                },
                mod: {
                    regexp: /^mod/,
                    method: function (e, i) {
                        var s = n(e[1]),
                            o = new t.Modulo(s);
                        return i._eval(e[0]).connect(o), o
                    }
                },
                pow: {
                    regexp: /^pow/,
                    method: function (e, i) {
                        var s = n(e[1]),
                            o = new t.Pow(s);
                        return i._eval(e[0]).connect(o), o
                    }
                },
                a2g: {
                    regexp: /^a2g/,
                    method: function (e, i) {
                        var s = new t.AudioToGain;
                        return i._eval(e[0]).connect(s), s
                    }
                }
            },
            binary: {
                "+": {
                    regexp: /^\+/,
                    precedence: 1,
                    method: e.bind(this, t.Add)
                },
                "-": {
                    regexp: /^\-/,
                    precedence: 1,
                    method: function (s, n) {
                        return 1 === s.length ? i(t.Negate, s, n) : e(t.Subtract, s, n)
                    }
                },
                "*": {
                    regexp: /^\*/,
                    precedence: 0,
                    method: e.bind(this, t.Multiply)
                },
                ">": {
                    regexp: /^\>/,
                    precedence: 2,
                    method: e.bind(this, t.GreaterThan)
                },
                "<": {
                    regexp: /^</,
                    precedence: 2,
                    method: e.bind(this, t.LessThan)
                },
                "==": {
                    regexp: /^==/,
                    precedence: 3,
                    method: e.bind(this, t.Equal)
                },
                "&&": {
                    regexp: /^&&/,
                    precedence: 4,
                    method: e.bind(this, t.AND)
                },
                "||": {
                    regexp: /^\|\|/,
                    precedence: 5,
                    method: e.bind(this, t.OR)
                }
            },
            unary: {
                "-": {
                    regexp: /^\-/,
                    method: i.bind(this, t.Negate)
                },
                "!": {
                    regexp: /^\!/,
                    method: i.bind(this, t.NOT)
                }
            }
        }, t.Expr.prototype._parseInputs = function (t) {
            var e, i, s = t.match(/\$\d/g),
                n = 0;
            if (null !== s) for (e = 0; e < s.length; e++) i = parseInt(s[e].substr(1)) + 1, n = Math.max(n, i);
            return n
        }, t.Expr.prototype._replacements = function (t) {
            var e, i = t.shift();
            for (e = 0; e < t.length; e++) i = i.replace(/\%/i, t[e]);
            return i
        }, t.Expr.prototype._tokenize = function (e) {
            function i(e) {
                var i, s, n, o, r, a;
                for (i in t.Expr._Expressions) {
                    s = t.Expr._Expressions[i];
                    for (n in s) if (o = s[n], r = o.regexp, a = e.match(r), null !== a) return {
                        type: i,
                        value: a[0],
                        method: o.method
                    }
                }
                throw new SyntaxError("Unexpected token " + e)
            }

            for (var s, n = -1, o = []; e.length > 0;) e = e.trim(), s = i(e), o.push(s), e = e.substr(s.value.length);
            return {
                next: function () {
                    return o[++n]
                },
                peek: function () {
                    return o[n + 1]
                }
            }
        }, t.Expr.prototype._parseTree = function (e) {
            function i(t, e) {
                return !u(t) && "glue" === t.type && t.value === e
            }

            function s(e, i, s) {
                var n, o, r = !1,
                    a = t.Expr._Expressions[i];
                if (!u(e)) for (n in a) if (o = a[n], o.regexp.test(e.value)) {
                    if (u(s)) return !0;
                    if (o.precedence === s) return !0
                }
                return r
            }

            function n(t) {
                var e, i;
                for (u(t) && (t = 5), e = 0 > t ? o() : n(t - 1), i = h.peek(); s(i, "binary", t);) i = h.next(), e = {
                    operator: i.value,
                    method: i.method,
                    args: [e, n(t)]
                }, i = h.peek();
                return e
            }

            function o() {
                var t, e;
                return t = h.peek(), s(t, "unary") ? (t = h.next(), e = o(), {
                    operator: t.value,
                    method: t.method,
                    args: [e]
                }) : r()
            }

            function r() {
                var t, e;
                if (t = h.peek(), u(t)) throw new SyntaxError("Unexpected termination of expression");
                if ("func" === t.type) return t = h.next(), a(t);
                if ("value" === t.type) return t = h.next(), {
                    method: t.method,
                    args: t.value
                };
                if (i(t, "(")) {
                    if (h.next(), e = n(), t = h.next(), !i(t, ")")) throw new SyntaxError("Expected )");
                    return e
                }
                throw new SyntaxError("Parse error, cannot process token " + t.value)
            }

            function a(t) {
                var e, s = [];
                if (e = h.next(), !i(e, "(")) throw new SyntaxError('Expected ( in a function call "' + t.value + '"');
                if (e = h.peek(), i(e, ")") || (s = l()), e = h.next(), !i(e, ")")) throw new SyntaxError('Expected ) in a function call "' + t.value + '"');
                return {
                    method: t.method,
                    args: s,
                    name: name
                }
            }

            function l() {
                for (var t, e, s = []; ;) {
                    if (e = n(), u(e)) break;
                    if (s.push(e), t = h.peek(), !i(t, ",")) break;
                    h.next()
                }
                return s
            }

            var h = this._tokenize(e),
                u = this.isUndef.bind(this);
            return n()
        }, t.Expr.prototype._eval = function (t) {
            if (!this.isUndef(t)) {
                var e = t.method(t.args, this);
                return this._nodes.push(e), e
            }
        }, t.Expr.prototype._disposeNodes = function () {
            var t, e;
            for (t = 0; t < this._nodes.length; t++) e = this._nodes[t], this.isFunction(e.dispose) ? e.dispose() : this.isFunction(e.disconnect) && e.disconnect(), e = null, this._nodes[t] = null;
            this._nodes = null
        }, t.Expr.prototype.dispose = function () {
            t.prototype.dispose.call(this), this._disposeNodes()
        }, t.Expr
    }), Module(function (t) {
        return t.EqualPowerGain = function () {
            this._eqPower = this.input = this.output = new t.WaveShaper(function (t) {
                return Math.abs(t) < .001 ? 0 : this.equalPowerScale(t)
            }.bind(this), 4096)
        }, t.extend(t.EqualPowerGain, t.SignalBase), t.EqualPowerGain.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._eqPower.dispose(), this._eqPower = null, this
        }, t.EqualPowerGain
    }), Module(function (t) {
        return t.CrossFade = function (e) {
            t.call(this, 2, 1), this.a = this.input[0] = this.context.createGain(), this.b = this.input[1] = this.context.createGain(), this.fade = new t.Signal(this.defaultArg(e, .5), t.Type.NormalRange), this._equalPowerA = new t.EqualPowerGain, this._equalPowerB = new t.EqualPowerGain, this._invert = new t.Expr("1 - $0"), this.a.connect(this.output), this.b.connect(this.output), this.fade.chain(this._equalPowerB, this.b.gain), this.fade.chain(this._invert, this._equalPowerA, this.a.gain), this._readOnly("fade")
        }, t.extend(t.CrossFade), t.CrossFade.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._writable("fade"), this._equalPowerA.dispose(), this._equalPowerA = null, this._equalPowerB.dispose(), this._equalPowerB = null, this.fade.dispose(), this.fade = null, this._invert.dispose(), this._invert = null, this.a.disconnect(), this.a = null, this.b.disconnect(), this.b = null, this
        }, t.CrossFade
    }), Module(function (t) {
        return t.Filter = function () {
            t.call(this);
            var e = this.optionsObject(arguments, ["frequency", "type", "rolloff"], t.Filter.defaults);
            this._filters = [], this.frequency = new t.Signal(e.frequency, t.Type.Frequency), this.detune = new t.Signal(0, t.Type.Cents), this.gain = new t.Signal({
                value: e.gain,
                convert: !1
            }), this.Q = new t.Signal(e.Q), this._type = e.type, this._rolloff = e.rolloff, this.rolloff = e.rolloff, this._readOnly(["detune", "frequency", "gain", "Q"])
        }, t.extend(t.Filter), t.Filter.defaults = {
            type: "lowpass",
            frequency: 350,
            rolloff: -12,
            Q: 1,
            gain: 0
        }, Object.defineProperty(t.Filter.prototype, "type", {
            get: function () {
                return this._type
            },
            set: function (t) {
                var e, i = ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"];
                if (-1 === i.indexOf(t)) throw new Error("Tone.Filter does not have filter type " + t);
                for (this._type = t, e = 0; e < this._filters.length; e++) this._filters[e].type = t
            }
        }), Object.defineProperty(t.Filter.prototype, "rolloff", {
            get: function () {
                return this._rolloff
            },
            set: function (t) {
                var e, i, s, n, o, r;
                if (t = parseInt(t, 10), e = [-12, -24, -48, -96], i = e.indexOf(t), -1 === i) throw new Error("Filter rolloff can only be -12, -24, -48 or -96");
                for (i += 1, this._rolloff = t, this.input.disconnect(), s = 0; s < this._filters.length; s++) this._filters[s].disconnect(), this._filters[s] = null;
                for (this._filters = new Array(i), n = 0; i > n; n++) o = this.context.createBiquadFilter(), o.type = this._type, this.frequency.connect(o.frequency), this.detune.connect(o.detune), this.Q.connect(o.Q), this.gain.connect(o.gain), this._filters[n] = o;
                r = [this.input].concat(this._filters).concat([this.output]), this.connectSeries.apply(this, r)
            }
        }), t.Filter.prototype.dispose = function () {
            t.prototype.dispose.call(this);
            for (var e = 0; e < this._filters.length; e++) this._filters[e].disconnect(), this._filters[e] = null;
            return this._filters = null, this._writable(["detune", "frequency", "gain", "Q"]), this.frequency.dispose(), this.Q.dispose(), this.frequency = null, this.Q = null, this.detune.dispose(), this.detune = null, this.gain.dispose(), this.gain = null, this
        }, t.Filter
    }), Module(function (t) {
        return t.MultibandSplit = function () {
            var e = this.optionsObject(arguments, ["lowFrequency", "highFrequency"], t.MultibandSplit.defaults);
            this.input = this.context.createGain(), this.output = new Array(3), this.low = this.output[0] = new t.Filter(0, "lowpass"), this._lowMidFilter = new t.Filter(0, "highpass"), this.mid = this.output[1] = new t.Filter(0, "lowpass"), this.high = this.output[2] = new t.Filter(0, "highpass"), this.lowFrequency = new t.Signal(e.lowFrequency, t.Type.Frequency), this.highFrequency = new t.Signal(e.highFrequency, t.Type.Frequency), this.Q = new t.Signal(e.Q), this.input.fan(this.low, this.high), this.input.chain(this._lowMidFilter, this.mid), this.lowFrequency.connect(this.low.frequency), this.lowFrequency.connect(this._lowMidFilter.frequency), this.highFrequency.connect(this.mid.frequency), this.highFrequency.connect(this.high.frequency), this.Q.connect(this.low.Q), this.Q.connect(this._lowMidFilter.Q), this.Q.connect(this.mid.Q), this.Q.connect(this.high.Q), this._readOnly(["high", "mid", "low", "highFrequency", "lowFrequency"])
        }, t.extend(t.MultibandSplit), t.MultibandSplit.defaults = {
            lowFrequency: 400,
            highFrequency: 2500,
            Q: 1
        }, t.MultibandSplit.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._writable(["high", "mid", "low", "highFrequency", "lowFrequency"]), this.low.dispose(), this.low = null, this._lowMidFilter.dispose(), this._lowMidFilter = null, this.mid.dispose(), this.mid = null, this.high.dispose(), this.high = null, this.lowFrequency.dispose(), this.lowFrequency = null, this.highFrequency.dispose(), this.highFrequency = null, this.Q.dispose(), this.Q = null, this
        }, t.MultibandSplit
    }), Module(function (t) {
        return t.EQ3 = function () {
            var e = this.optionsObject(arguments, ["low", "mid", "high"], t.EQ3.defaults);
            this.output = this.context.createGain(), this._multibandSplit = this.input = new t.MultibandSplit({
                lowFrequency: e.lowFrequency,
                highFrequency: e.highFrequency
            }), this._lowGain = new t.Gain(e.low, t.Type.Decibels), this._midGain = new t.Gain(e.mid, t.Type.Decibels), this._highGain = new t.Gain(e.high, t.Type.Decibels), this.low = this._lowGain.gain, this.mid = this._midGain.gain, this.high = this._highGain.gain, this.Q = this._multibandSplit.Q, this.lowFrequency = this._multibandSplit.lowFrequency, this.highFrequency = this._multibandSplit.highFrequency, this._multibandSplit.low.chain(this._lowGain, this.output), this._multibandSplit.mid.chain(this._midGain, this.output), this._multibandSplit.high.chain(this._highGain, this.output), this._readOnly(["low", "mid", "high", "lowFrequency", "highFrequency"])
        }, t.extend(t.EQ3), t.EQ3.defaults = {
            low: 0,
            mid: 0,
            high: 0,
            lowFrequency: 400,
            highFrequency: 2500
        }, t.EQ3.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._writable(["low", "mid", "high", "lowFrequency", "highFrequency"]), this._multibandSplit.dispose(), this._multibandSplit = null, this.lowFrequency = null, this.highFrequency = null, this._lowGain.dispose(), this._lowGain = null, this._midGain.dispose(), this._midGain = null, this._highGain.dispose(), this._highGain = null, this.low = null, this.mid = null, this.high = null, this.Q = null, this
        }, t.EQ3
    }), Module(function (t) {
        return t.Scale = function (e, i) {
            this._outputMin = this.defaultArg(e, 0), this._outputMax = this.defaultArg(i, 1), this._scale = this.input = new t.Multiply(1), this._add = this.output = new t.Add(0), this._scale.connect(this._add), this._setRange()
        }, t.extend(t.Scale, t.SignalBase), Object.defineProperty(t.Scale.prototype, "min", {
            get: function () {
                return this._outputMin
            },
            set: function (t) {
                this._outputMin = t, this._setRange()
            }
        }), Object.defineProperty(t.Scale.prototype, "max", {
            get: function () {
                return this._outputMax
            },
            set: function (t) {
                this._outputMax = t, this._setRange()
            }
        }), t.Scale.prototype._setRange = function () {
            this._add.value = this._outputMin, this._scale.value = this._outputMax - this._outputMin
        }, t.Scale.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._add.dispose(), this._add = null, this._scale.dispose(), this._scale = null, this
        }, t.Scale
    }), Module(function (t) {
        return t.ScaleExp = function (e, i, s) {
            this._scale = this.output = new t.Scale(e, i), this._exp = this.input = new t.Pow(this.defaultArg(s, 2)), this._exp.connect(this._scale)
        }, t.extend(t.ScaleExp, t.SignalBase), Object.defineProperty(t.ScaleExp.prototype, "exponent", {
            get: function () {
                return this._exp.value
            },
            set: function (t) {
                this._exp.value = t
            }
        }), Object.defineProperty(t.ScaleExp.prototype, "min", {
            get: function () {
                return this._scale.min
            },
            set: function (t) {
                this._scale.min = t
            }
        }), Object.defineProperty(t.ScaleExp.prototype, "max", {
            get: function () {
                return this._scale.max
            },
            set: function (t) {
                this._scale.max = t
            }
        }), t.ScaleExp.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._scale.dispose(), this._scale = null, this._exp.dispose(), this._exp = null, this
        }, t.ScaleExp
    }), Module(function (t) {
        return t.FeedbackCombFilter = function () {
            t.call(this);
            var e = this.optionsObject(arguments, ["delayTime", "resonance"], t.FeedbackCombFilter.defaults);
            this._delay = this.input = this.output = this.context.createDelay(1), this.delayTime = new t.Param({
                param: this._delay.delayTime,
                value: e.delayTime,
                units: t.Type.Time
            }), this._feedback = this.context.createGain(), this.resonance = new t.Param({
                param: this._feedback.gain,
                value: e.resonance,
                units: t.Type.NormalRange
            }), this._delay.chain(this._feedback, this._delay), this._readOnly(["resonance", "delayTime"])
        }, t.extend(t.FeedbackCombFilter), t.FeedbackCombFilter.defaults = {
            delayTime: .1,
            resonance: .5
        }, t.FeedbackCombFilter.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._writable(["resonance", "delayTime"]), this._delay.disconnect(), this._delay = null, this.delayTime.dispose(), this.delayTime = null, this.resonance.dispose(), this.resonance = null, this._feedback.disconnect(), this._feedback = null, this
        }, t.FeedbackCombFilter
    }), Module(function (t) {
        return t.Follower = function () {
            t.call(this);
            var e = this.optionsObject(arguments, ["attack", "release"], t.Follower.defaults);
            this._abs = new t.Abs, this._filter = this.context.createBiquadFilter(), this._filter.type = "lowpass", this._filter.frequency.value = 0, this._filter.Q.value = -100, this._frequencyValues = new t.WaveShaper, this._sub = new t.Subtract, this._delay = this.context.createDelay(), this._delay.delayTime.value = this.blockTime, this._mult = new t.Multiply(1e4), this._attack = e.attack, this._release = e.release, this.input.chain(this._abs, this._filter, this.output), this._abs.connect(this._sub, 0, 1), this._filter.chain(this._delay, this._sub), this._sub.chain(this._mult, this._frequencyValues, this._filter.frequency), this._setAttackRelease(this._attack, this._release)
        }, t.extend(t.Follower), t.Follower.defaults = {
            attack: .05,
            release: .5
        }, t.Follower.prototype._setAttackRelease = function (t, e) {
            var i = this.blockTime;
            t = this.secondsToFrequency(this.toSeconds(t)), e = this.secondsToFrequency(this.toSeconds(e)), t = Math.max(t, i), e = Math.max(e, i), this._frequencyValues.setMap(function (i) {
                return 0 >= i ? t : e
            })
        }, Object.defineProperty(t.Follower.prototype, "attack", {
            get: function () {
                return this._attack
            },
            set: function (t) {
                this._attack = t, this._setAttackRelease(this._attack, this._release)
            }
        }), Object.defineProperty(t.Follower.prototype, "release", {
            get: function () {
                return this._release
            },
            set: function (t) {
                this._release = t, this._setAttackRelease(this._attack, this._release)
            }
        }), t.Follower.prototype.connect = t.Signal.prototype.connect, t.Follower.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._filter.disconnect(), this._filter = null, this._frequencyValues.disconnect(), this._frequencyValues = null, this._delay.disconnect(), this._delay = null, this._sub.disconnect(), this._sub = null, this._abs.dispose(), this._abs = null, this._mult.dispose(), this._mult = null, this._curve = null, this
        }, t.Follower
    }), Module(function (t) {
        return t.ScaledEnvelope = function () {
            var e = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], t.Envelope.defaults);
            t.Envelope.call(this, e), e = this.defaultArg(e, t.ScaledEnvelope.defaults), this._exp = this.output = new t.Pow(e.exponent), this._scale = this.output = new t.Scale(e.min, e.max), this._sig.chain(this._exp, this._scale)
        }, t.extend(t.ScaledEnvelope, t.Envelope), t.ScaledEnvelope.defaults = {
            min: 0,
            max: 1,
            exponent: 1
        }, Object.defineProperty(t.ScaledEnvelope.prototype, "min", {
            get: function () {
                return this._scale.min
            },
            set: function (t) {
                this._scale.min = t
            }
        }), Object.defineProperty(t.ScaledEnvelope.prototype, "max", {
            get: function () {
                return this._scale.max
            },
            set: function (t) {
                this._scale.max = t
            }
        }), Object.defineProperty(t.ScaledEnvelope.prototype, "exponent", {
            get: function () {
                return this._exp.value
            },
            set: function (t) {
                this._exp.value = t
            }
        }), t.ScaledEnvelope.prototype.dispose = function () {
            return t.Envelope.prototype.dispose.call(this), this._scale.dispose(), this._scale = null, this._exp.dispose(), this._exp = null, this
        }, t.ScaledEnvelope
    }), Module(function (t) {
        return t.FrequencyEnvelope = function () {
            var e = this.optionsObject(arguments, ["attack", "decay", "sustain", "release"], t.Envelope.defaults);
            t.ScaledEnvelope.call(this, e), e = this.defaultArg(e, t.FrequencyEnvelope.defaults), this._octaves = e.octaves, this.baseFrequency = e.baseFrequency, this.octaves = e.octaves
        }, t.extend(t.FrequencyEnvelope, t.Envelope), t.FrequencyEnvelope.defaults = {
            baseFrequency: 200,
            octaves: 4,
            exponent: 2
        }, Object.defineProperty(t.FrequencyEnvelope.prototype, "baseFrequency", {
            get: function () {
                return this._scale.min
            },
            set: function (t) {
                this._scale.min = this.toFrequency(t)
            }
        }), Object.defineProperty(t.FrequencyEnvelope.prototype, "octaves", {
            get: function () {
                return this._octaves
            },
            set: function (t) {
                this._octaves = t, this._scale.max = this.baseFrequency * Math.pow(2, t)
            }
        }), Object.defineProperty(t.FrequencyEnvelope.prototype, "exponent", {
            get: function () {
                return this._exp.value
            },
            set: function (t) {
                this._exp.value = t
            }
        }), t.FrequencyEnvelope.prototype.dispose = function () {
            return t.ScaledEnvelope.prototype.dispose.call(this), this
        }, t.FrequencyEnvelope
    }), Module(function (t) {
        return t.Gate = function () {
            t.call(this);
            var e = this.optionsObject(arguments, ["threshold", "attack", "release"], t.Gate.defaults);
            this._follower = new t.Follower(e.attack, e.release), this._gt = new t.GreaterThan(this.dbToGain(e.threshold)), this.input.connect(this.output), this.input.chain(this._gt, this._follower, this.output.gain)
        }, t.extend(t.Gate), t.Gate.defaults = {
            attack: .1,
            release: .1,
            threshold: -40
        }, Object.defineProperty(t.Gate.prototype, "threshold", {
            get: function () {
                return this.gainToDb(this._gt.value)
            },
            set: function (t) {
                this._gt.value = this.dbToGain(t)
            }
        }), Object.defineProperty(t.Gate.prototype, "attack", {
            get: function () {
                return this._follower.attack
            },
            set: function (t) {
                this._follower.attack = t
            }
        }), Object.defineProperty(t.Gate.prototype, "release", {
            get: function () {
                return this._follower.release
            },
            set: function (t) {
                this._follower.release = t
            }
        }), t.Gate.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._follower.dispose(), this._gt.dispose(), this._follower = null, this._gt = null, this
        }, t.Gate
    }), Module(function (t) {
        return t.TimelineState = function (e) {
            t.Timeline.call(this), this._initial = e
        }, t.extend(t.TimelineState, t.Timeline), t.TimelineState.prototype.getStateAtTime = function (t) {
            var e = this.getEvent(t);
            return null !== e ? e.state : this._initial
        }, t.TimelineState.prototype.setStateAtTime = function (t, e) {
            this.addEvent({
                state: t,
                time: this.toSeconds(e)
            })
        }, t.TimelineState
    }), Module(function (t) {
        return t.Clock = function () {
            var e = this.optionsObject(arguments, ["callback", "frequency"], t.Clock.defaults);
            this.callback = e.callback, this._lookAhead = "auto", this._computedLookAhead = 1 / 60, this._threshold = .5, this._nextTick = -1, this._lastUpdate = 0, this._loopID = -1, this.frequency = new t.TimelineSignal(e.frequency, t.Type.Frequency), this.ticks = 0, this._state = new t.TimelineState(t.State.Stopped), this._boundLoop = this._loop.bind(this), this._readOnly("frequency"), this._loop()
        }, t.extend(t.Clock), t.Clock.defaults = {
            callback: t.noOp,
            frequency: 1,
            lookAhead: "auto"
        }, Object.defineProperty(t.Clock.prototype, "state", {
            get: function () {
                return this._state.getStateAtTime(this.now())
            }
        }), Object.defineProperty(t.Clock.prototype, "lookAhead", {
            get: function () {
                return this._lookAhead
            },
            set: function (t) {
                this._lookAhead = "auto" === t ? "auto" : this.toSeconds(t)
            }
        }), t.Clock.prototype.start = function (e, i) {
            return e = this.toSeconds(e), this._state.getStateAtTime(e) !== t.State.Started && this._state.addEvent({
                state: t.State.Started,
                time: e,
                offset: i
            }), this
        }, t.Clock.prototype.stop = function (e) {
            return e = this.toSeconds(e), this._state.getStateAtTime(e) !== t.State.Stopped && this._state.setStateAtTime(t.State.Stopped, e), this
        }, t.Clock.prototype.pause = function (e) {
            return e = this.toSeconds(e), this._state.getStateAtTime(e) === t.State.Started && this._state.setStateAtTime(t.State.Paused, e), this
        }, t.Clock.prototype._loop = function (e) {
            var i, s, n, o, r, a;
            if (this._loopID = requestAnimationFrame(this._boundLoop), "auto" === this._lookAhead ? this.isUndef(e) || (i = (e - this._lastUpdate) / 1e3, this._lastUpdate = e, i < this._threshold && (this._computedLookAhead = (9 * this._computedLookAhead + i) / 10)) : this._computedLookAhead = this._lookAhead, s = this.now(), n = 2 * this._computedLookAhead, o = this._state.getEvent(s + n), r = t.State.Stopped, o && (r = o.state, -1 === this._nextTick && r === t.State.Started && (this._nextTick = o.time, this.isUndef(o.offset) || (this.ticks = o.offset))), r === t.State.Started) for (; s + n > this._nextTick;) s > this._nextTick + this._threshold && (this._nextTick = s),
                a = this._nextTick, this._nextTick += 1 / this.frequency.getValueAtTime(this._nextTick), this.callback(a), this.ticks++;
            else r === t.State.Stopped && (this._nextTick = -1, this.ticks = 0)
        }, t.Clock.prototype.getStateAtTime = function (t) {
            return this._state.getStateAtTime(t)
        }, t.Clock.prototype.dispose = function () {
            cancelAnimationFrame(this._loopID), t.TimelineState.prototype.dispose.call(this), this._writable("frequency"), this.frequency.dispose(), this.frequency = null, this._boundLoop = t.noOp, this._nextTick = 1 / 0, this.callback = null, this._state.dispose(), this._state = null
        }, t.Clock
    }), Module(function (t) {
        return t.Emitter = function () {
            this._events = {}
        }, t.extend(t.Emitter), t.Emitter.prototype.on = function (t, e) {
            var i, s, n = t.split(/\W+/);
            for (i = 0; i < n.length; i++) s = n[i], this._events.hasOwnProperty(s) || (this._events[s] = []), this._events[s].push(e);
            return this
        }, t.Emitter.prototype.off = function (e, i) {
            var s, n, o, r = e.split(/\W+/);
            for (s = 0; s < r.length; s++) if (e = r[s], this._events.hasOwnProperty(e)) if (t.prototype.isUndef(i)) this._events[e] = [];
            else for (n = this._events[e], o = 0; o < n.length; o++) n[o] === i && n.splice(o, 1);
            return this
        }, t.Emitter.prototype.trigger = function (t) {
            var e, i, s, n;
            if (this._events && (e = Array.prototype.slice.call(arguments, 1), this._events.hasOwnProperty(t))) for (i = this._events[t], s = 0, n = i.length; n > s; s++) i[s].apply(this, e);
            return this
        }, t.Emitter.mixin = function (e) {
            var i, s, n, o = ["on", "off", "trigger"];
            for (e._events = {}, i = 0; i < o.length; i++) s = o[i], n = t.Emitter.prototype[s], e[s] = n
        }, t.Emitter.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._events = null, this
        }, t.Emitter
    }), Module(function (t) {
        t.IntervalTimeline = function () {
            this._root = null, this._length = 0
        }, t.extend(t.IntervalTimeline), t.IntervalTimeline.prototype.addEvent = function (t) {
            if (this.isUndef(t.time) || this.isUndef(t.duration)) throw new Error("events must have time and duration parameters");
            var i = new e(t.time, t.time + t.duration, t);
            for (null === this._root ? this._root = i : this._root.insert(i), this._length++; null !== i;) i.updateHeight(), i.updateMax(), this._rebalance(i), i = i.parent;
            return this
        }, t.IntervalTimeline.prototype.removeEvent = function (t) {
            var e, i, s;
            if (null !== this._root) for (e = [], this._root.search(t.time, e), i = 0; i < e.length; i++) if (s = e[i], s.event === t) {
                this._removeNode(s), this._length--;
                break
            }
            return this
        }, Object.defineProperty(t.IntervalTimeline.prototype, "length", {
            get: function () {
                return this._length
            }
        }), t.IntervalTimeline.prototype.cancel = function (t) {
            return t = this.toSeconds(t), this.forEachAfter(t, function (t) {
                this.removeEvent(t)
            }.bind(this)), this
        }, t.IntervalTimeline.prototype._setRoot = function (t) {
            this._root = t, null !== this._root && (this._root.parent = null)
        }, t.IntervalTimeline.prototype._replaceNodeInParent = function (t, e) {
            null !== t.parent ? (t.isLeftChild() ? t.parent.left = e : t.parent.right = e, this._rebalance(t.parent)) : this._setRoot(e)
        }, t.IntervalTimeline.prototype._removeNode = function (t) {
            var e, i, s;
            if (null === t.left && null === t.right) this._replaceNodeInParent(t, null);
            else if (null === t.right) this._replaceNodeInParent(t, t.left);
            else if (null === t.left) this._replaceNodeInParent(t, t.right);
            else {
                if (e = t.getBalance(), e > 0) if (null === t.left.right) i = t.left, i.right = t.right, s = i;
                else {
                    for (i = t.left.right; null !== i.right;) i = i.right;
                    i.parent.right = i.left, s = i.parent, i.left = t.left, i.right = t.right
                } else if (null === t.right.left) i = t.right, i.left = t.left, s = i;
                else {
                    for (i = t.right.left; null !== i.left;) i = i.left;
                    i.parent = i.parent, i.parent.left = i.right, s = i.parent, i.left = t.left, i.right = t.right
                }
                null !== t.parent ? t.isLeftChild() ? t.parent.left = i : t.parent.right = i : this._setRoot(i), this._rebalance(s)
            }
            t.dispose()
        }, t.IntervalTimeline.prototype._rotateLeft = function (t) {
            var e = t.parent,
                i = t.isLeftChild(),
                s = t.right;
            t.right = s.left, s.left = t, null !== e ? i ? e.left = s : e.right = s : this._setRoot(s)
        }, t.IntervalTimeline.prototype._rotateRight = function (t) {
            var e = t.parent,
                i = t.isLeftChild(),
                s = t.left;
            t.left = s.right, s.right = t, null !== e ? i ? e.left = s : e.right = s : this._setRoot(s)
        }, t.IntervalTimeline.prototype._rebalance = function (t) {
            var e = t.getBalance();
            e > 1 ? t.left.getBalance() < 0 ? this._rotateLeft(t.left) : this._rotateRight(t) : -1 > e && (t.right.getBalance() > 0 ? this._rotateRight(t.right) : this._rotateLeft(t))
        }, t.IntervalTimeline.prototype.getEvent = function (t) {
            var e, i, s;
            if (null !== this._root && (e = [], this._root.search(t, e), e.length > 0)) {
                for (i = e[0], s = 1; s < e.length; s++) e[s].low > i.low && (i = e[s]);
                return i.event
            }
            return null
        }, t.IntervalTimeline.prototype.forEach = function (t) {
            var e, i, s;
            if (null !== this._root) for (e = [], null !== this._root && this._root.traverse(function (t) {
                e.push(t)
            }), i = 0; i < e.length; i++) s = e[i].event, s && t(s);
            return this
        }, t.IntervalTimeline.prototype.forEachOverlap = function (t, e) {
            var i, s, n;
            if (t = this.toSeconds(t), null !== this._root) for (i = [], this._root.search(t, i), s = i.length - 1; s >= 0; s--) n = i[s].event, n && e(n);
            return this
        }, t.IntervalTimeline.prototype.forEachAfter = function (t, e) {
            var i, s, n;
            if (t = this.toSeconds(t), null !== this._root) for (i = [], this._root.searchAfter(t, i), s = i.length - 1; s >= 0; s--) n = i[s].event, n && e(n);
            return this
        }, t.IntervalTimeline.prototype.dispose = function () {
            var t, e = [];
            for (null !== this._root && this._root.traverse(function (t) {
                e.push(t)
            }), t = 0; t < e.length; t++) e[t].dispose();
            return e = null, this._root = null, this
        };
        var e = function (t, e, i) {
            this.event = i, this.low = t, this.high = e, this.max = this.high, this._left = null, this._right = null, this.parent = null, this.height = 0
        };
        return e.prototype.insert = function (t) {
            t.low <= this.low ? null === this.left ? this.left = t : this.left.insert(t) : null === this.right ? this.right = t : this.right.insert(t)
        }, e.prototype.search = function (t, e) {
            t > this.max || (null !== this.left && this.left.search(t, e), this.low <= t && this.high >= t && e.push(this), this.low > t || null !== this.right && this.right.search(t, e))
        }, e.prototype.searchAfter = function (t, e) {
            this.low >= t && (e.push(this), null !== this.left && this.left.searchAfter(t, e)), null !== this.right && this.right.searchAfter(t, e)
        }, e.prototype.traverse = function (t) {
            t(this), null !== this.left && this.left.traverse(t), null !== this.right && this.right.traverse(t)
        }, e.prototype.updateHeight = function () {
            this.height = null !== this.left && null !== this.right ? Math.max(this.left.height, this.right.height) + 1 : null !== this.right ? this.right.height + 1 : null !== this.left ? this.left.height + 1 : 0
        }, e.prototype.updateMax = function () {
            this.max = this.high, null !== this.left && (this.max = Math.max(this.max, this.left.max)), null !== this.right && (this.max = Math.max(this.max, this.right.max))
        }, e.prototype.getBalance = function () {
            var t = 0;
            return null !== this.left && null !== this.right ? t = this.left.height - this.right.height : null !== this.left ? t = this.left.height + 1 : null !== this.right && (t = -(this.right.height + 1)), t
        }, e.prototype.isLeftChild = function () {
            return null !== this.parent && this.parent.left === this
        }, Object.defineProperty(e.prototype, "left", {
            get: function () {
                return this._left
            },
            set: function (t) {
                this._left = t, null !== t && (t.parent = this), this.updateHeight(), this.updateMax()
            }
        }), Object.defineProperty(e.prototype, "right", {
            get: function () {
                return this._right
            },
            set: function (t) {
                this._right = t, null !== t && (t.parent = this), this.updateHeight(), this.updateMax()
            }
        }), e.prototype.dispose = function () {
            this.parent = null, this._left = null, this._right = null, this.event = null
        }, t.IntervalTimeline
    }), Module(function (t) {
        t.Transport = function () {
            t.Emitter.call(this), this.loop = !1, this._loopStart = 0, this._loopEnd = 0, this._ppq = e.defaults.PPQ, this._clock = new t.Clock({
                callback: this._processTick.bind(this),
                frequency: 0
            }), this.bpm = this._clock.frequency, this.bpm._toUnits = this._toUnits.bind(this), this.bpm._fromUnits = this._fromUnits.bind(this), this.bpm.units = t.Type.BPM, this.bpm.value = e.defaults.bpm, this._readOnly("bpm"), this._timeSignature = e.defaults.timeSignature, this._scheduledEvents = {}, this._eventID = 0, this._timeline = new t.Timeline, this._repeatedEvents = new t.IntervalTimeline, this._onceEvents = new t.Timeline, this._syncedSignals = [];
            var i = this.notationToSeconds(e.defaults.swingSubdivision, e.defaults.bpm, e.defaults.timeSignature);
            this._swingTicks = i / (60 / e.defaults.bpm) * this._ppq, this._swingAmount = 0
        }, t.extend(t.Transport, t.Emitter), t.Transport.defaults = {
            bpm: 120,
            swing: 0,
            swingSubdivision: "16n",
            timeSignature: 4,
            loopStart: 0,
            loopEnd: "4m",
            PPQ: 48
        }, t.Transport.prototype._processTick = function (t) {
            this._swingAmount > 0 && this._clock.ticks % this._ppq !== 0 && this._clock.ticks % this._swingTicks === 0 && (t += this.ticksToSeconds(this._swingTicks) * this._swingAmount), this.loop && this._clock.ticks === this._loopEnd && (this.ticks = this._loopStart, this.trigger("loop", t));
            var e = this._clock.ticks;
            this._timeline.forEachAtTime(e, function (e) {
                e.callback(t)
            }), this._repeatedEvents.forEachOverlap(e, function (i) {
                (e - i.time) % i.interval === 0 && i.callback(t)
            }), this._onceEvents.forEachBefore(e, function (e) {
                e.callback(t)
            }), this._onceEvents.cancelBefore(e)
        }, t.Transport.prototype.schedule = function (t, e) {
            var i = {
                time: this.toTicks(e),
                callback: t
            }, s = this._eventID++;
            return this._scheduledEvents[s.toString()] = {
                event: i,
                timeline: this._timeline
            }, this._timeline.addEvent(i), s
        }, t.Transport.prototype.scheduleRepeat = function (t, e, i, s) {
            var n, o;
            if (0 >= e) throw new Error("repeat events must have an interval larger than 0");
            return n = {
                time: this.toTicks(i),
                duration: this.toTicks(this.defaultArg(s, 1 / 0)),
                interval: this.toTicks(e),
                callback: t
            }, o = this._eventID++, this._scheduledEvents[o.toString()] = {
                event: n,
                timeline: this._repeatedEvents
            }, this._repeatedEvents.addEvent(n), o
        }, t.Transport.prototype.scheduleOnce = function (t, e) {
            var i = {
                time: this.toTicks(e),
                callback: t
            }, s = this._eventID++;
            return this._scheduledEvents[s.toString()] = {
                event: i,
                timeline: this._onceEvents
            }, this._onceEvents.addEvent(i), s
        }, t.Transport.prototype.clear = function (t) {
            if (this._scheduledEvents.hasOwnProperty(t)) {
                var e = this._scheduledEvents[t.toString()];
                e.timeline.removeEvent(e.event), delete this._scheduledEvents[t.toString()]
            }
            return this
        }, t.Transport.prototype.cancel = function (t) {
            return t = this.defaultArg(t, 0), t = this.toTicks(t), this._timeline.cancel(t), this._onceEvents.cancel(t), this._repeatedEvents.cancel(t), this
        }, t.Transport.prototype.quantize = function (e, i) {
            var s, n, o;
            return i = this.defaultArg(i, "4n"), s = this.toTicks(e), i = this.toTicks(i), n = i - s % i, n === i && (n = 0), o = this.now(), this.state === t.State.Started && (o = this._clock._nextTick), this.toSeconds(e, o) + this.ticksToSeconds(n)
        }, Object.defineProperty(t.Transport.prototype, "state", {
            get: function () {
                return this._clock.getStateAtTime(this.now())
            }
        }), t.Transport.prototype.start = function (t, e) {
            return t = this.toSeconds(t), e = this.isUndef(e) ? this.defaultArg(e, this._clock.ticks) : this.toTicks(e), this._clock.start(t, e), this.trigger("start", t, this.ticksToSeconds(e)), this
        }, t.Transport.prototype.stop = function (t) {
            return t = this.toSeconds(t), this._clock.stop(t), this.trigger("stop", t), this
        }, t.Transport.prototype.pause = function (t) {
            return t = this.toSeconds(t), this._clock.pause(t), this.trigger("pause", t), this
        }, Object.defineProperty(t.Transport.prototype, "timeSignature", {
            get: function () {
                return this._timeSignature
            },
            set: function (t) {
                this.isArray(t) && (t = t[0] / t[1] * 4), this._timeSignature = t
            }
        }), Object.defineProperty(t.Transport.prototype, "loopStart", {
            get: function () {
                return this.ticksToSeconds(this._loopStart)
            },
            set: function (t) {
                this._loopStart = this.toTicks(t)
            }
        }), Object.defineProperty(t.Transport.prototype, "loopEnd", {
            get: function () {
                return this.ticksToSeconds(this._loopEnd)
            },
            set: function (t) {
                this._loopEnd = this.toTicks(t)
            }
        }), t.Transport.prototype.setLoopPoints = function (t, e) {
            return this.loopStart = t, this.loopEnd = e, this
        }, Object.defineProperty(t.Transport.prototype, "swing", {
            get: function () {
                return 2 * this._swingAmount
            },
            set: function (t) {
                this._swingAmount = .5 * t
            }
        }), Object.defineProperty(t.Transport.prototype, "swingSubdivision", {
            get: function () {
                return this.toNotation(this._swingTicks + "i")
            },
            set: function (t) {
                this._swingTicks = this.toTicks(t)
            }
        }), Object.defineProperty(t.Transport.prototype, "position", {
            get: function () {
                var t, e = this.ticks / this._ppq,
                    i = Math.floor(e / this._timeSignature),
                    s = e % 1 * 4;
                return s % 1 > 0 && (s = s.toFixed(3)), e = Math.floor(e) % this._timeSignature, t = [i, e, s], t.join(":")
            },
            set: function (t) {
                var e = this.toTicks(t);
                this.ticks = e
            }
        }), Object.defineProperty(t.Transport.prototype, "progress", {
            get: function () {
                return this.loop ? (this.ticks - this._loopStart) / (this._loopEnd - this._loopStart) : 0
            }
        }), Object.defineProperty(t.Transport.prototype, "ticks", {
            get: function () {
                return this._clock.ticks
            },
            set: function (t) {
                this._clock.ticks = t
            }
        }), Object.defineProperty(t.Transport.prototype, "PPQ", {
            get: function () {
                return this._ppq
            },
            set: function (t) {
                this._ppq = t, this.bpm.value = this.bpm.value
            }
        }), t.Transport.prototype._fromUnits = function (t) {
            return 1 / (60 / t / this.PPQ)
        }, t.Transport.prototype._toUnits = function (t) {
            return t / this.PPQ * 60
        }, t.Transport.prototype.syncSignal = function (e, i) {
            i || (i = 0 !== e._param.value ? e._param.value / this.bpm._param.value : 0);
            var s = new t.Gain(i);
            return this.bpm.chain(s, e._param), this._syncedSignals.push({
                ratio: s,
                signal: e,
                initial: e._param.value
            }), e._param.value = 0, this
        }, t.Transport.prototype.unsyncSignal = function (t) {
            var e, i;
            for (e = this._syncedSignals.length - 1; e >= 0; e--) i = this._syncedSignals[e], i.signal === t && (i.ratio.dispose(), i.signal._param.value = i.initial, this._syncedSignals.splice(e, 1));
            return this
        }, t.Transport.prototype.dispose = function () {
            return t.Emitter.prototype.dispose.call(this), this._clock.dispose(), this._clock = null, this._writable("bpm"), this.bpm = null, this._timeline.dispose(), this._timeline = null, this._onceEvents.dispose(), this._onceEvents = null, this._repeatedEvents.dispose(), this._repeatedEvents = null, this
        }, t.Transport.prototype.setInterval = function (e, i) {
            return console.warn("This method is deprecated. Use Tone.Transport.scheduleRepeat instead."), t.Transport.scheduleRepeat(e, i)
        }, t.Transport.prototype.clearInterval = function (e) {
            return console.warn("This method is deprecated. Use Tone.Transport.clear instead."), t.Transport.clear(e)
        }, t.Transport.prototype.setTimeout = function (e, i) {
            return console.warn("This method is deprecated. Use Tone.Transport.scheduleOnce instead."), t.Transport.scheduleOnce(e, i)
        }, t.Transport.prototype.clearTimeout = function (e) {
            return console.warn("This method is deprecated. Use Tone.Transport.clear instead."), t.Transport.clear(e)
        }, t.Transport.prototype.setTimeline = function (e, i) {
            return console.warn("This method is deprecated. Use Tone.Transport.schedule instead."), t.Transport.schedule(e, i)
        }, t.Transport.prototype.clearTimeline = function (e) {
            return console.warn("This method is deprecated. Use Tone.Transport.clear instead."), t.Transport.clear(e)
        };
        var e = t.Transport;
        return t._initAudioContext(function () {
            if ("function" == typeof t.Transport) t.Transport = new t.Transport;
            else {
                t.Transport.stop();
                var i = t.Transport.get();
                t.Transport.dispose(), e.call(t.Transport), t.Transport.set(i)
            }
        }), t.Transport
    }), Module(function (t) {
        return t.Volume = function () {
            var e = this.optionsObject(arguments, ["volume"], t.Volume.defaults);
            this.output = this.input = new t.Gain(e.volume, t.Type.Decibels), this.volume = this.output.gain, this._readOnly("volume")
        }, t.extend(t.Volume), t.Volume.defaults = {
            volume: 0
        }, t.Volume.prototype.dispose = function () {
            return this.input.dispose(), t.prototype.dispose.call(this), this._writable("volume"), this.volume.dispose(), this.volume = null, this
        }, t.Volume
    }), Module(function (t) {
        return t.Source = function (e) {
            t.call(this), e = this.defaultArg(e, t.Source.defaults), this._volume = this.output = new t.Volume(e.volume), this.volume = this._volume.volume, this._readOnly("volume"), this._state = new t.TimelineState(t.State.Stopped), this._syncStart = function (t, e) {
                t = this.toSeconds(t), t += this.toSeconds(this._startDelay), this.start(t, e)
            }.bind(this), this._syncStop = this.stop.bind(this), this._startDelay = 0, this._volume.output.output.channelCount = 2, this._volume.output.output.channelCountMode = "explicit"
        }, t.extend(t.Source), t.Source.defaults = {
            volume: 0
        }, Object.defineProperty(t.Source.prototype, "state", {
            get: function () {
                return this._state.getStateAtTime(this.now())
            }
        }), t.Source.prototype.start = function (e) {
            return e = this.toSeconds(e), (this._state.getStateAtTime(e) !== t.State.Started || this.retrigger) && (this._state.setStateAtTime(t.State.Started, e), this._start && this._start.apply(this, arguments)), this
        }, t.Source.prototype.stop = function (e) {
            return e = this.toSeconds(e), this._state.getStateAtTime(e) === t.State.Started && (this._state.setStateAtTime(t.State.Stopped, e), this._stop && this._stop.apply(this, arguments)), this
        }, t.Source.prototype.sync = function (e) {
            return this._startDelay = this.defaultArg(e, 0), t.Transport.on("start", this._syncStart), t.Transport.on("stop pause", this._syncStop), this
        }, t.Source.prototype.unsync = function () {
            return this._startDelay = 0, t.Transport.off("start", this._syncStart), t.Transport.off("stop pause", this._syncStop), this
        }, t.Source.prototype.dispose = function () {
            this.stop(), t.prototype.dispose.call(this), this.unsync(), this._writable("volume"), this._volume.dispose(), this._volume = null, this.volume = null, this._state.dispose(), this._state = null, this._syncStart = null, this._syncStart = null
        }, t.Source
    }), Module(function (t) {
        return t.Oscillator = function () {
            var e = this.optionsObject(arguments, ["frequency", "type"], t.Oscillator.defaults);
            t.Source.call(this, e), this._oscillator = null, this.frequency = new t.Signal(e.frequency, t.Type.Frequency), this.detune = new t.Signal(e.detune, t.Type.Cents), this._wave = null, this._partials = this.defaultArg(e.partials, [1]), this._phase = e.phase, this._type = null, this.type = e.type, this.phase = this._phase, this._readOnly(["frequency", "detune"])
        }, t.extend(t.Oscillator, t.Source), t.Oscillator.defaults = {
            type: "sine",
            frequency: 440,
            detune: 0,
            phase: 0,
            partials: []
        }, t.Oscillator.Type = {
            Sine: "sine",
            Triangle: "triangle",
            Sawtooth: "sawtooth",
            Square: "square",
            Custom: "custom"
        }, t.Oscillator.prototype._start = function (t) {
            this._oscillator = this.context.createOscillator(), this._oscillator.setPeriodicWave(this._wave), this._oscillator.connect(this.output), this.frequency.connect(this._oscillator.frequency), this.detune.connect(this._oscillator.detune), this._oscillator.start(this.toSeconds(t))
        }, t.Oscillator.prototype._stop = function (t) {
            return this._oscillator && (this._oscillator.stop(this.toSeconds(t)), this._oscillator = null), this
        }, t.Oscillator.prototype.syncFrequency = function () {
            return t.Transport.syncSignal(this.frequency), this
        }, t.Oscillator.prototype.unsyncFrequency = function () {
            return t.Transport.unsyncSignal(this.frequency), this
        }, Object.defineProperty(t.Oscillator.prototype, "type", {
            get: function () {
                return this._type
            },
            set: function (t) {
                var e = this._getRealImaginary(t, this._phase),
                    i = this.context.createPeriodicWave(e[0], e[1]);
                this._wave = i, null !== this._oscillator && this._oscillator.setPeriodicWave(this._wave), this._type = t
            }
        }), t.Oscillator.prototype._getRealImaginary = function (e, i) {
            var s, n, o, r, a = 4096,
                l = a / 2,
                h = new Float32Array(l),
                u = new Float32Array(l),
                c = 1;
            for (e === t.Oscillator.Type.Custom ? (c = this._partials.length + 1, l = c) : (s = /^(sine|triangle|square|sawtooth)(\d+)$/.exec(e), s && (c = parseInt(s[2]) + 1, e = s[1], c = Math.max(c, 2), l = c)), n = 1; l > n; ++n) {
                switch (o = 2 / (n * Math.PI), e) {
                    case t.Oscillator.Type.Sine:
                        r = c >= n ? 1 : 0;
                        break;
                    case t.Oscillator.Type.Square:
                        r = 1 & n ? 2 * o : 0;
                        break;
                    case t.Oscillator.Type.Sawtooth:
                        r = o * (1 & n ? 1 : -1);
                        break;
                    case t.Oscillator.Type.Triangle:
                        r = 1 & n ? 2 * o * o * (n - 1 >> 1 & 1 ? -1 : 1) : 0;
                        break;
                    case t.Oscillator.Type.Custom:
                        r = this._partials[n - 1];
                        break;
                    default:
                        throw new Error("invalid oscillator type: " + e)
                }
                0 !== r ? (h[n] = -r * Math.sin(i * n), u[n] = r * Math.cos(i * n)) : (h[n] = 0, u[n] = 0)
            }
            return [h, u]
        }, t.Oscillator.prototype._inverseFFT = function (t, e, i) {
            var s, n = 0,
                o = t.length;
            for (s = 0; o > s; s++) n += t[s] * Math.cos(s * i) + e[s] * Math.sin(s * i);
            return n
        }, t.Oscillator.prototype._getInitialValue = function () {
            var t, e = this._getRealImaginary(this._type, 0),
                i = e[0],
                s = e[1],
                n = 0,
                o = 2 * Math.PI;
            for (t = 0; 8 > t; t++) n = Math.max(this._inverseFFT(i, s, t / 8 * o), n);
            return -this._inverseFFT(i, s, this._phase) / n
        }, Object.defineProperty(t.Oscillator.prototype, "partials", {
            get: function () {
                return this._type !== t.Oscillator.Type.Custom ? [] : this._partials
            },
            set: function (e) {
                this._partials = e, this.type = t.Oscillator.Type.Custom
            }
        }), Object.defineProperty(t.Oscillator.prototype, "phase", {
            get: function () {
                return this._phase * (180 / Math.PI)
            },
            set: function (t) {
                this._phase = t * Math.PI / 180, this.type = this._type
            }
        }), t.Oscillator.prototype.dispose = function () {
            return t.Source.prototype.dispose.call(this), null !== this._oscillator && (this._oscillator.disconnect(), this._oscillator = null), this._wave = null, this._writable(["frequency", "detune"]), this.frequency.dispose(), this.frequency = null, this.detune.dispose(), this.detune = null, this._partials = null, this
        }, t.Oscillator
    }), Module(function (t) {
        return t.LFO = function () {
            var e = this.optionsObject(arguments, ["frequency", "min", "max"], t.LFO.defaults);
            this._oscillator = new t.Oscillator({
                frequency: e.frequency,
                type: e.type
            }), this.frequency = this._oscillator.frequency, this.amplitude = this._oscillator.volume, this.amplitude.units = t.Type.NormalRange, this.amplitude.value = e.amplitude, this._stoppedSignal = new t.Signal(0, t.Type.AudioRange), this._stoppedValue = 0, this._a2g = new t.AudioToGain, this._scaler = this.output = new t.Scale(e.min, e.max), this._units = t.Type.Default, this.units = e.units, this._oscillator.chain(this._a2g, this._scaler), this._stoppedSignal.connect(this._a2g), this._readOnly(["amplitude", "frequency"]), this.phase = e.phase
        }, t.extend(t.LFO, t.Oscillator), t.LFO.defaults = {
            type: "sine",
            min: 0,
            max: 1,
            phase: 0,
            frequency: "4n",
            amplitude: 1,
            units: t.Type.Default
        }, t.LFO.prototype.start = function (t) {
            return t = this.toSeconds(t), this._stoppedSignal.setValueAtTime(0, t), this._oscillator.start(t), this
        }, t.LFO.prototype.stop = function (t) {
            return t = this.toSeconds(t), this._stoppedSignal.setValueAtTime(this._stoppedValue, t), this._oscillator.stop(t), this
        }, t.LFO.prototype.sync = function (t) {
            return this._oscillator.sync(t), this._oscillator.syncFrequency(), this
        }, t.LFO.prototype.unsync = function () {
            return this._oscillator.unsync(), this._oscillator.unsyncFrequency(), this
        }, Object.defineProperty(t.LFO.prototype, "min", {
            get: function () {
                return this._toUnits(this._scaler.min)
            },
            set: function (t) {
                t = this._fromUnits(t), this._scaler.min = t
            }
        }), Object.defineProperty(t.LFO.prototype, "max", {
            get: function () {
                return this._toUnits(this._scaler.max)
            },
            set: function (t) {
                t = this._fromUnits(t), this._scaler.max = t
            }
        }), Object.defineProperty(t.LFO.prototype, "type", {
            get: function () {
                return this._oscillator.type
            },
            set: function (t) {
                this._oscillator.type = t, this._stoppedValue = this._oscillator._getInitialValue(), this._stoppedSignal.value = this._stoppedValue
            }
        }), Object.defineProperty(t.LFO.prototype, "phase", {
            get: function () {
                return this._oscillator.phase
            },
            set: function (t) {
                this._oscillator.phase = t, this._stoppedValue = this._oscillator._getInitialValue(), this._stoppedSignal.value = this._stoppedValue
            }
        }), Object.defineProperty(t.LFO.prototype, "units", {
            get: function () {
                return this._units
            },
            set: function (t) {
                var e = this.min,
                    i = this.max;
                this._units = t, this.min = e, this.max = i
            }
        }), Object.defineProperty(t.LFO.prototype, "state", {
            get: function () {
                return this._oscillator.state
            }
        }), t.LFO.prototype.connect = function (e) {
            return (e.constructor === t.Signal || e.constructor === t.Param || e.constructor === t.TimelineSignal) && (this.convert = e.convert, this.units = e.units), t.Signal.prototype.connect.apply(this, arguments), this
        }, t.LFO.prototype._fromUnits = t.Param.prototype._fromUnits, t.LFO.prototype._toUnits = t.Param.prototype._toUnits, t.LFO.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._writable(["amplitude", "frequency"]), this._oscillator.dispose(), this._oscillator = null, this._stoppedSignal.dispose(), this._stoppedSignal = null, this._scaler.dispose(), this._scaler = null, this._a2g.dispose(), this._a2g = null, this.frequency = null, this.amplitude = null, this
        }, t.LFO
    }), Module(function (t) {
        return t.Limiter = function () {
            var e = this.optionsObject(arguments, ["threshold"], t.Limiter.defaults);
            this._compressor = this.input = this.output = new t.Compressor({
                attack: .001,
                decay: .001,
                threshold: e.threshold
            }), this.threshold = this._compressor.threshold, this._readOnly("threshold")
        }, t.extend(t.Limiter), t.Limiter.defaults = {
            threshold: -12
        }, t.Limiter.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._compressor.dispose(), this._compressor = null, this._writable("threshold"), this.threshold = null, this
        }, t.Limiter
    }), Module(function (t) {
        return t.LowpassCombFilter = function () {
            t.call(this);
            var e = this.optionsObject(arguments, ["delayTime", "resonance", "dampening"], t.LowpassCombFilter.defaults);
            this._delay = this.input = this.context.createDelay(1), this.delayTime = new t.Signal(e.delayTime, t.Type.Time), this._lowpass = this.output = this.context.createBiquadFilter(), this._lowpass.Q.value = 0, this._lowpass.type = "lowpass", this.dampening = new t.Param({
                param: this._lowpass.frequency,
                units: t.Type.Frequency,
                value: e.dampening
            }), this._feedback = this.context.createGain(), this.resonance = new t.Param({
                param: this._feedback.gain,
                units: t.Type.NormalRange,
                value: e.resonance
            }), this._delay.chain(this._lowpass, this._feedback, this._delay), this.delayTime.connect(this._delay.delayTime), this._readOnly(["dampening", "resonance", "delayTime"])
        }, t.extend(t.LowpassCombFilter), t.LowpassCombFilter.defaults = {
            delayTime: .1,
            resonance: .5,
            dampening: 3e3
        }, t.LowpassCombFilter.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._writable(["dampening", "resonance", "delayTime"]), this.dampening.dispose(), this.dampening = null, this.resonance.dispose(), this.resonance = null, this._delay.disconnect(), this._delay = null, this._lowpass.disconnect(), this._lowpass = null, this._feedback.disconnect(), this._feedback = null, this.delayTime.dispose(), this.delayTime = null, this
        }, t.LowpassCombFilter
    }), Module(function (t) {
        return t.Merge = function () {
            t.call(this, 2, 0), this.left = this.input[0] = this.context.createGain(), this.right = this.input[1] = this.context.createGain(), this._merger = this.output = this.context.createChannelMerger(2), this.left.connect(this._merger, 0, 0), this.right.connect(this._merger, 0, 1), this.left.channelCount = 1, this.right.channelCount = 1, this.left.channelCountMode = "explicit", this.right.channelCountMode = "explicit"
        }, t.extend(t.Merge), t.Merge.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this.left.disconnect(), this.left = null, this.right.disconnect(), this.right = null, this._merger.disconnect(), this._merger = null, this
        }, t.Merge
    }), Module(function (t) {
        return t.Meter = function () {
            var e, i, s = this.optionsObject(arguments, ["channels", "smoothing"], t.Meter.defaults);
            for (t.call(this), this._channels = s.channels, this.smoothing = s.smoothing, this.clipMemory = s.clipMemory, this.clipLevel = s.clipLevel, this._volume = new Array(this._channels), this._values = new Array(this._channels), e = 0; e < this._channels; e++) this._volume[e] = 0, this._values[e] = 0;
            for (this._lastClip = new Array(this._channels), i = 0; i < this._lastClip.length; i++) this._lastClip[i] = 0;
            this._jsNode = this.context.createScriptProcessor(s.bufferSize, this._channels, 1), this._jsNode.onaudioprocess = this._onprocess.bind(this), this._jsNode.noGC(), this.input.connect(this.output), this.input.connect(this._jsNode)
        }, t.extend(t.Meter), t.Meter.defaults = {
            smoothing: .8,
            bufferSize: 1024,
            clipMemory: .5,
            clipLevel: .9,
            channels: 1
        }, t.Meter.prototype._onprocess = function (t) {
            var e, i, s, n, o, r, a, l, h = this._jsNode.bufferSize,
                u = this.smoothing;
            for (e = 0; e < this._channels; e++) {
                for (i = t.inputBuffer.getChannelData(e), s = 0, n = 0, r = 0; h > r; r++) o = i[r], n += o, s += o * o;
                a = n / h, l = Math.sqrt(s / h), l > .9 && (this._lastClip[e] = Date.now()), this._volume[e] = Math.max(l, this._volume[e] * u), this._values[e] = a
            }
        }, t.Meter.prototype.getLevel = function (t) {
            t = this.defaultArg(t, 0);
            var e = this._volume[t];
            return 1e-5 > e ? 0 : e
        }, t.Meter.prototype.getValue = function (t) {
            return t = this.defaultArg(t, 0), this._values[t]
        }, t.Meter.prototype.getDb = function (t) {
            return this.gainToDb(this.getLevel(t))
        }, t.Meter.prototype.isClipped = function (t) {
            return t = this.defaultArg(t, 0), Date.now() - this._lastClip[t] < 1e3 * this._clipMemory
        }, t.Meter.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._jsNode.disconnect(), this._jsNode.onaudioprocess = null, this._jsNode = null, this._volume = null, this._values = null, this._lastClip = null, this
        }, t.Meter
    }), Module(function (t) {
        return t.Split = function () {
            t.call(this, 0, 2), this._splitter = this.input = this.context.createChannelSplitter(2), this.left = this.output[0] = this.context.createGain(), this.right = this.output[1] = this.context.createGain(), this._splitter.connect(this.left, 0, 0), this._splitter.connect(this.right, 1, 0)
        }, t.extend(t.Split), t.Split.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._splitter.disconnect(), this.left.disconnect(), this.right.disconnect(), this.left = null, this.right = null, this._splitter = null, this
        }, t.Split
    }), Module(function (t) {
        t.MidSideSplit = function () {
            t.call(this, 0, 2), this._split = this.input = new t.Split, this.mid = this.output[0] = new t.Expr("($0 + $1) * $2"), this.side = this.output[1] = new t.Expr("($0 - $1) * $2"), this._split.connect(this.mid, 0, 0), this._split.connect(this.mid, 1, 1), this._split.connect(this.side, 0, 0), this._split.connect(this.side, 1, 1), e.connect(this.mid, 0, 2), e.connect(this.side, 0, 2)
        }, t.extend(t.MidSideSplit);
        var e = null;
        return t._initAudioContext(function () {
            e = new t.Signal(1 / Math.sqrt(2))
        }), t.MidSideSplit.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this.mid.dispose(), this.mid = null, this.side.dispose(), this.side = null, this._split.dispose(), this._split = null, this
        }, t.MidSideSplit
    }), Module(function (t) {
        t.MidSideMerge = function () {
            t.call(this, 2, 0), this.mid = this.input[0] = this.context.createGain(), this._left = new t.Expr("($0 + $1) * $2"), this.side = this.input[1] = this.context.createGain(), this._right = new t.Expr("($0 - $1) * $2"), this._merge = this.output = new t.Merge, this.mid.connect(this._left, 0, 0), this.side.connect(this._left, 0, 1), this.mid.connect(this._right, 0, 0), this.side.connect(this._right, 0, 1), this._left.connect(this._merge, 0, 0), this._right.connect(this._merge, 0, 1), e.connect(this._left, 0, 2), e.connect(this._right, 0, 2)
        }, t.extend(t.MidSideMerge);
        var e = null;
        return t._initAudioContext(function () {
            e = new t.Signal(1 / Math.sqrt(2))
        }), t.MidSideMerge.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this.mid.disconnect(), this.mid = null, this.side.disconnect(), this.side = null, this._left.dispose(), this._left = null, this._right.dispose(), this._right = null, this._merge.dispose(), this._merge = null, this
        }, t.MidSideMerge
    }), Module(function (t) {
        return t.MidSideCompressor = function (e) {
            e = this.defaultArg(e, t.MidSideCompressor.defaults), this._midSideSplit = this.input = new t.MidSideSplit, this._midSideMerge = this.output = new t.MidSideMerge, this.mid = new t.Compressor(e.mid), this.side = new t.Compressor(e.side), this._midSideSplit.mid.chain(this.mid, this._midSideMerge.mid), this._midSideSplit.side.chain(this.side, this._midSideMerge.side), this._readOnly(["mid", "side"])
        }, t.extend(t.MidSideCompressor), t.MidSideCompressor.defaults = {
            mid: {
                ratio: 3,
                threshold: -24,
                release: .03,
                attack: .02,
                knee: 16
            },
            side: {
                ratio: 6,
                threshold: -30,
                release: .25,
                attack: .03,
                knee: 10
            }
        }, t.MidSideCompressor.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._writable(["mid", "side"]), this.mid.dispose(), this.mid = null, this.side.dispose(), this.side = null, this._midSideSplit.dispose(), this._midSideSplit = null, this._midSideMerge.dispose(), this._midSideMerge = null, this
        }, t.MidSideCompressor
    }), Module(function (t) {
        return t.Mono = function () {
            t.call(this, 1, 0), this._merge = this.output = new t.Merge, this.input.connect(this._merge, 0, 0), this.input.connect(this._merge, 0, 1), this.input.gain.value = this.dbToGain(-10)
        }, t.extend(t.Mono), t.Mono.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._merge.dispose(), this._merge = null, this
        }, t.Mono
    }), Module(function (t) {
        return t.MultibandCompressor = function (e) {
            e = this.defaultArg(arguments, t.MultibandCompressor.defaults), this._splitter = this.input = new t.MultibandSplit({
                lowFrequency: e.lowFrequency,
                highFrequency: e.highFrequency
            }), this.lowFrequency = this._splitter.lowFrequency, this.highFrequency = this._splitter.highFrequency, this.output = this.context.createGain(), this.low = new t.Compressor(e.low), this.mid = new t.Compressor(e.mid), this.high = new t.Compressor(e.high), this._splitter.low.chain(this.low, this.output), this._splitter.mid.chain(this.mid, this.output), this._splitter.high.chain(this.high, this.output), this._readOnly(["high", "mid", "low", "highFrequency", "lowFrequency"])
        }, t.extend(t.MultibandCompressor), t.MultibandCompressor.defaults = {
            low: t.Compressor.defaults,
            mid: t.Compressor.defaults,
            high: t.Compressor.defaults,
            lowFrequency: 250,
            highFrequency: 2e3
        }, t.MultibandCompressor.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._splitter.dispose(), this._writable(["high", "mid", "low", "highFrequency", "lowFrequency"]), this.low.dispose(), this.mid.dispose(), this.high.dispose(), this._splitter = null, this.low = null, this.mid = null, this.high = null, this.lowFrequency = null, this.highFrequency = null, this
        }, t.MultibandCompressor
    }), Module(function (t) {
        return t.GainToAudio = function () {
            this._norm = this.input = this.output = new t.WaveShaper(function (t) {
                return 2 * Math.abs(t) - 1
            })
        }, t.extend(t.GainToAudio, t.SignalBase), t.GainToAudio.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._norm.dispose(), this._norm = null, this
        }, t.GainToAudio
    }), Module(function (t) {
        return t.Panner = function (e) {
            t.call(this), this._hasStereoPanner = this.isFunction(this.context.createStereoPanner), this._hasStereoPanner ? (this._panner = this.input = this.output = this.context.createStereoPanner(), this.pan = new t.Signal(0, t.Type.NormalRange), this._scalePan = new t.GainToAudio, this.pan.chain(this._scalePan, this._panner.pan)) : (this._crossFade = new t.CrossFade, this._merger = this.output = new t.Merge, this._splitter = this.input = new t.Split, this.pan = this._crossFade.fade, this._splitter.connect(this._crossFade, 0, 0), this._splitter.connect(this._crossFade, 1, 1), this._crossFade.a.connect(this._merger, 0, 0), this._crossFade.b.connect(this._merger, 0, 1)), this.pan.value = this.defaultArg(e, .5), this._readOnly("pan")
        }, t.extend(t.Panner), t.Panner.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._writable("pan"), this._hasStereoPanner ? (this._panner.disconnect(), this._panner = null, this.pan.dispose(), this.pan = null, this._scalePan.dispose(), this._scalePan = null) : (this._crossFade.dispose(), this._crossFade = null, this._splitter.dispose(), this._splitter = null, this._merger.dispose(), this._merger = null, this.pan = null), this
        }, t.Panner
    }), Module(function (t) {
        return t.PanVol = function () {
            var e = this.optionsObject(arguments, ["pan", "volume"], t.PanVol.defaults);
            this._panner = this.input = new t.Panner(e.pan), this.pan = this._panner.pan, this._volume = this.output = new t.Volume(e.volume), this.volume = this._volume.volume, this._panner.connect(this._volume), this._readOnly(["pan", "volume"])
        }, t.extend(t.PanVol), t.PanVol.defaults = {
            pan: .5,
            volume: 0
        }, t.PanVol.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._writable(["pan", "volume"]), this._panner.dispose(), this._panner = null, this.pan = null, this._volume.dispose(), this._volume = null, this.volume = null, this
        }, t.PanVol
    }), Module(function (t) {
        return t.CtrlInterpolate = function () {
            var e = this.optionsObject(arguments, ["values", "index"], t.CtrlInterpolate.defaults);
            this.values = e.values, this.index = e.index
        }, t.extend(t.CtrlInterpolate), t.CtrlInterpolate.defaults = {
            index: 0,
            values: []
        }, Object.defineProperty(t.CtrlInterpolate.prototype, "value", {
            get: function () {
                var t, e, i, s = this.index;
                return s = Math.min(s, this.values.length - 1), t = Math.floor(s), e = this.values[t], i = this.values[Math.ceil(s)], this._interpolate(s - t, e, i)
            }
        }), t.CtrlInterpolate.prototype._interpolate = function (t, e, i) {
            var s, n, o, r;
            if (this.isArray(e)) {
                for (s = [], n = 0; n < e.length; n++) s[n] = this._interpolate(t, e[n], i[n]);
                return s
            }
            if (this.isObject(e)) {
                o = {};
                for (r in e) o[r] = this._interpolate(t, e[r], i[r]);
                return o
            }
            return e = this._toNumber(e), i = this._toNumber(i), (1 - t) * e + t * i
        }, t.CtrlInterpolate.prototype._toNumber = function (t) {
            return this.isNumber(t) ? t : this.isNote(t) ? this.toFrequency(t) : this.toSeconds(t)
        }, t.CtrlInterpolate.prototype.dispose = function () {
            this.values = null
        }, t.CtrlInterpolate
    }), Module(function (t) {
        return t.CtrlMarkov = function (t, e) {
            this.values = this.defaultArg(t, {}), this.value = this.defaultArg(e, Object.keys(this.values)[0])
        }, t.extend(t.CtrlMarkov), t.CtrlMarkov.prototype.next = function () {
            var t, e, i, s, n, o, r;
            if (this.values.hasOwnProperty(this.value)) if (t = this.values[this.value], this.isArray(t)) for (e = this._getProbDistribution(t), i = Math.random(), s = 0, n = 0; n < e.length; n++) o = e[n], i > s && s + o > i && (r = t[n], this.value = this.isObject(r) ? r.value : r), s += o;
            else this.value = t;
            return this.value
        }, t.CtrlMarkov.prototype._getProbDistribution = function (t) {
            var e, i, s, n = [],
                o = 0,
                r = !1;
            for (e = 0; e < t.length; e++) i = t[e], this.isObject(i) ? (r = !0, n[e] = i.probability) : n[e] = 1 / t.length, o += n[e];
            if (r) for (s = 0; s < n.length; s++) n[s] = n[s] / o;
            return n
        }, t.CtrlMarkov.prototype.dispose = function () {
            this.values = null
        }, t.CtrlMarkov
    }), Module(function (t) {
        return t.CtrlPattern = function () {
            var e = this.optionsObject(arguments, ["values", "type"], t.CtrlPattern.defaults);
            this.values = e.values, this.index = 0, this._type = null, this._shuffled = null, this._direction = null, this.type = e.type
        }, t.extend(t.CtrlPattern), t.CtrlPattern.Type = {
            Up: "up",
            Down: "down",
            UpDown: "upDown",
            DownUp: "downUp",
            AlternateUp: "alternateUp",
            AlternateDown: "alternateDown",
            Random: "random",
            RandomWalk: "randomWalk",
            RandomOnce: "randomOnce"
        }, t.CtrlPattern.defaults = {
            type: t.CtrlPattern.Type.Up,
            values: []
        }, Object.defineProperty(t.CtrlPattern.prototype, "value", {
            get: function () {
                if (0 !== this.values.length) {
                    if (1 === this.values.length) return this.values[0];
                    this.index = Math.min(this.index, this.values.length - 1);
                    var e = this.values[this.index];
                    return this.type === t.CtrlPattern.Type.RandomOnce && (this.values.length !== this._shuffled.length && this._shuffleValues(), e = this.values[this._shuffled[this.index]]), e
                }
            }
        }), Object.defineProperty(t.CtrlPattern.prototype, "type", {
            get: function () {
                return this._type
            },
            set: function (e) {
                this._type = e, this._shuffled = null, this._type === t.CtrlPattern.Type.Up || this._type === t.CtrlPattern.Type.UpDown || this._type === t.CtrlPattern.Type.RandomOnce || this._type === t.CtrlPattern.Type.AlternateUp ? this.index = 0 : (this._type === t.CtrlPattern.Type.Down || this._type === t.CtrlPattern.Type.DownUp || this._type === t.CtrlPattern.Type.AlternateDown) && (this.index = this.values.length - 1), this._type === t.CtrlPattern.Type.UpDown || this._type === t.CtrlPattern.Type.AlternateUp ? this._direction = t.CtrlPattern.Type.Up : (this._type === t.CtrlPattern.Type.DownUp || this._type === t.CtrlPattern.Type.AlternateDown) && (this._direction = t.CtrlPattern.Type.Down), this._type === t.CtrlPattern.Type.RandomOnce ? this._shuffleValues() : this._type === t.CtrlPattern.Random && (this.index = Math.floor(Math.random() * this.values.length))
            }
        }), t.CtrlPattern.prototype.next = function () {
            var e = this.type;
            return e === t.CtrlPattern.Type.Up ? (this.index++, this.index >= this.values.length && (this.index = 0)) : e === t.CtrlPattern.Type.Down ? (this.index--, this.index < 0 && (this.index = this.values.length - 1)) : e === t.CtrlPattern.Type.UpDown || e === t.CtrlPattern.Type.DownUp ? (this._direction === t.CtrlPattern.Type.Up ? this.index++ : this.index--, this.index < 0 ? (this.index = 1, this._direction = t.CtrlPattern.Type.Up) : this.index >= this.values.length && (this.index = this.values.length - 2, this._direction = t.CtrlPattern.Type.Down)) : e === t.CtrlPattern.Type.Random ? this.index = Math.floor(Math.random() * this.values.length) : e === t.CtrlPattern.Type.RandomWalk ? Math.random() < .5 ? (this.index--, this.index = Math.max(this.index, 0)) : (this.index++, this.index = Math.min(this.index, this.values.length - 1)) : e === t.CtrlPattern.Type.RandomOnce ? (this.index++, this.index >= this.values.length && (this.index = 0, this._shuffleValues())) : e === t.CtrlPattern.Type.AlternateUp ? (this._direction === t.CtrlPattern.Type.Up ? (this.index += 2, this._direction = t.CtrlPattern.Type.Down) : (this.index -= 1, this._direction = t.CtrlPattern.Type.Up), this.index >= this.values.length && (this.index = 0, this._direction = t.CtrlPattern.Type.Up)) : e === t.CtrlPattern.Type.AlternateDown && (this._direction === t.CtrlPattern.Type.Up ? (this.index += 1, this._direction = t.CtrlPattern.Type.Down) : (this.index -= 2, this._direction = t.CtrlPattern.Type.Up), this.index < 0 && (this.index = this.values.length - 1, this._direction = t.CtrlPattern.Type.Down)), this.value
        }, t.CtrlPattern.prototype._shuffleValues = function () {
            var t, e, i = [];
            for (this._shuffled = [], t = 0; t < this.values.length; t++) i[t] = t;
            for (; i.length > 0;) e = i.splice(Math.floor(i.length * Math.random()), 1), this._shuffled.push(e[0])
        }, t.CtrlPattern.prototype.dispose = function () {
            this._shuffled = null, this.values = null
        }, t.CtrlPattern
    }), Module(function (t) {
        return t.CtrlRandom = function () {
            var e = this.optionsObject(arguments, ["min", "max"], t.CtrlRandom.defaults);
            this.min = e.min, this.max = e.max, this.integer = e.integer
        }, t.extend(t.CtrlRandom), t.CtrlRandom.defaults = {
            min: 0,
            max: 1,
            integer: !1
        }, Object.defineProperty(t.CtrlRandom.prototype, "value", {
            get: function () {
                var t = this.toSeconds(this.min),
                    e = this.toSeconds(this.max),
                    i = Math.random(),
                    s = i * t + (1 - i) * e;
                return this.integer && (s = Math.floor(s)), s
            }
        }), t.CtrlRandom
    }), Module(function (t) {
        return t.Buffer = function () {
            var e = this.optionsObject(arguments, ["url", "onload"], t.Buffer.defaults);
            this._buffer = null, this._reversed = e.reverse, this.url = void 0, this.loaded = !1, this.onload = e.onload.bind(this, this), e.url instanceof AudioBuffer || e.url instanceof t.Buffer ? (this.set(e.url), this.onload(this)) : this.isString(e.url) && (this.url = e.url, t.Buffer._addToQueue(e.url, this))
        }, t.extend(t.Buffer), t.Buffer.defaults = {
            url: void 0,
            onload: t.noOp,
            reverse: !1
        }, t.Buffer.prototype.set = function (e) {
            return this._buffer = e instanceof t.Buffer ? e.get() : e, this.loaded = !0, this
        }, t.Buffer.prototype.get = function () {
            return this._buffer
        }, t.Buffer.prototype.load = function (e, i) {
            return this.url = e, this.onload = this.defaultArg(i, this.onload), t.Buffer._addToQueue(e, this), this
        }, t.Buffer.prototype.dispose = function () {
            return t.prototype.dispose.call(this), t.Buffer._removeFromQueue(this), this._buffer = null, this.onload = t.Buffer.defaults.onload, this
        }, Object.defineProperty(t.Buffer.prototype, "duration", {
            get: function () {
                return this._buffer ? this._buffer.duration : 0
            }
        }), t.Buffer.prototype._reverse = function () {
            if (this.loaded) for (var t = 0; t < this._buffer.numberOfChannels; t++) Array.prototype.reverse.call(this._buffer.getChannelData(t));
            return this
        }, Object.defineProperty(t.Buffer.prototype, "reverse", {
            get: function () {
                return this._reversed
            },
            set: function (t) {
                this._reversed !== t && (this._reversed = t, this._reverse())
            }
        }), t.Emitter.mixin(t.Buffer), t.Buffer._queue = [], t.Buffer._currentDownloads = [], t.Buffer._totalDownloads = 0, t.Buffer.MAX_SIMULTANEOUS_DOWNLOADS = 6, t.Buffer._addToQueue = function (e, i) {
            t.Buffer._queue.push({
                url: e,
                Buffer: i,
                progress: 0,
                xhr: null
            }), this._totalDownloads++, t.Buffer._next()
        }, t.Buffer._removeFromQueue = function (e) {
            var i, s, n;
            for (i = 0; i < t.Buffer._queue.length; i++) s = t.Buffer._queue[i], s.Buffer === e && t.Buffer._queue.splice(i, 1);
            for (i = 0; i < t.Buffer._currentDownloads.length; i++) n = t.Buffer._currentDownloads[i], n.Buffer === e && (t.Buffer._currentDownloads.splice(i, 1), n.xhr.abort(), n.xhr.onprogress = null, n.xhr.onload = null, n.xhr.onerror = null)
        }, t.Buffer._next = function () {
            if (t.Buffer._queue.length > 0) {
                if (t.Buffer._currentDownloads.length < t.Buffer.MAX_SIMULTANEOUS_DOWNLOADS) {
                    var e = t.Buffer._queue.shift();
                    t.Buffer._currentDownloads.push(e), e.xhr = t.Buffer.load(e.url, function (i) {
                        var s = t.Buffer._currentDownloads.indexOf(e);
                        t.Buffer._currentDownloads.splice(s, 1), e.Buffer.set(i), e.Buffer._reversed && e.Buffer._reverse(), e.Buffer.onload(e.Buffer), t.Buffer._onprogress(), t.Buffer._next()
                    }), e.xhr.onprogress = function (i) {
                        e.progress = i.loaded / i.total, t.Buffer._onprogress()
                    }, e.xhr.onerror = function (e) {
                        t.Buffer.trigger("error", e)
                    }
                }
            } else 0 === t.Buffer._currentDownloads.length && (t.Buffer.trigger("load"), t.Buffer._totalDownloads = 0)
        }, t.Buffer._onprogress = function () {
            var e, i, s, n, o = 0,
                r = t.Buffer._currentDownloads.length,
                a = 0;
            if (r > 0) {
                for (e = 0; r > e; e++) i = t.Buffer._currentDownloads[e], o += i.progress;
                a = o
            }
            s = r - a, n = t.Buffer._totalDownloads - t.Buffer._queue.length - s, t.Buffer.trigger("progress", n / t.Buffer._totalDownloads)
        }, t.Buffer.load = function (e, i) {
            var s = new XMLHttpRequest;
            return s.open("GET", e, !0), s.responseType = "arraybuffer", s.onload = function () {
                t.context.decodeAudioData(s.response, function (t) {
                    if (!t) throw new Error("could not decode audio data:" + e);
                    i(t)
                })
            }, s.send(), s
        }, Object.defineProperty(t.Buffer, "onload", {
            set: function (e) {
                console.warn("Tone.Buffer.onload is deprecated, use Tone.Buffer.on('load', callback)"), t.Buffer.on("load", e)
            }
        }), Object.defineProperty(t.Buffer, "onprogress", {
            set: function (e) {
                console.warn("Tone.Buffer.onprogress is deprecated, use Tone.Buffer.on('progress', callback)"), t.Buffer.on("progress", e)
            }
        }), Object.defineProperty(t.Buffer, "onerror", {
            set: function (e) {
                console.warn("Tone.Buffer.onerror is deprecated, use Tone.Buffer.on('error', callback)"), t.Buffer.on("error", e)
            }
        }), t.Buffer
    }), Module(function (t) {
        var e = {};
        return t.prototype.send = function (t, i) {
            e.hasOwnProperty(t) || (e[t] = this.context.createGain());
            var s = this.context.createGain();
            return s.gain.value = this.dbToGain(this.defaultArg(i, 1)), this.output.chain(s, e[t]), s
        }, t.prototype.receive = function (t, i) {
            return e.hasOwnProperty(t) || (e[t] = this.context.createGain()), this.isUndef(i) && (i = this.input), e[t].connect(i), this
        }, t
    }), Module(function (t) {
        return t.Delay = function () {
            var e = this.optionsObject(arguments, ["delayTime", "maxDelay"], t.Delay.defaults);
            this._delayNode = this.input = this.output = this.context.createDelay(this.toSeconds(e.maxDelay)), this.delayTime = new t.Param({
                param: this._delayNode.delayTime,
                units: t.Type.Time,
                value: e.delayTime
            }), this._readOnly("delayTime")
        }, t.extend(t.Delay), t.Delay.defaults = {
            maxDelay: 1,
            delayTime: 0
        }, t.Delay.prototype.dispose = function () {
            return t.Param.prototype.dispose.call(this), this._delayNode.disconnect(), this._delayNode = null, this._writable("delayTime"), this.delayTime = null, this
        }, t.Delay
    }), Module(function (t) {
        t.Master = function () {
            t.call(this), this._unmutedVolume = 1, this._muted = !1, this._volume = this.output = new t.Volume, this.volume = this._volume.volume, this._readOnly("volume"), this.input.chain(this.output, this.context.destination)
        }, t.extend(t.Master), t.Master.defaults = {
            volume: 0,
            mute: !1
        }, Object.defineProperty(t.Master.prototype, "mute", {
            get: function () {
                return this._muted
            },
            set: function (t) {
                !this._muted && t ? (this._unmutedVolume = this.volume.value, this.volume.value = -(1 / 0)) : this._muted && !t && (this.volume.value = this._unmutedVolume), this._muted = t
            }
        }), t.Master.prototype.chain = function () {
            this.input.disconnect(), this.input.chain.apply(this.input, arguments), arguments[arguments.length - 1].connect(this.output)
        }, t.Master.prototype.dispose = function () {
            t.prototype.dispose.call(this), this._writable("volume"), this._volume.dispose(), this._volume = null, this.volume = null
        }, t.prototype.toMaster = function () {
            return this.connect(t.Master), this
        }, AudioNode.prototype.toMaster = function () {
            return this.connect(t.Master), this
        };
        var e = t.Master;
        return t._initAudioContext(function () {
            t.prototype.isUndef(t.Master) ? (e.prototype.dispose.call(t.Master), e.call(t.Master)) : t.Master = new e
        }), t.Master
    }), Module(function (t) {
        function e(t, e, s) {
            var n, o, r, a;
            if (i.hasOwnProperty(t)) for (n = i[t], o = 0, r = n.length; r > o; o++) a = n[o], Array.isArray(s) ? a.apply(window, [e].concat(s)) : a(e, s)
        }

        t.Note = function (e, i, s) {
            this.value = s, this._channel = e, this._timelineID = t.Transport.setTimeline(this._trigger.bind(this), i)
        }, t.Note.prototype._trigger = function (t) {
            e(this._channel, t, this.value)
        }, t.Note.prototype.dispose = function () {
            return t.Transport.clearTimeline(this._timelineID), this.value = null, this
        };
        var i = {};
        return t.Note.route = function (t, e) {
            i.hasOwnProperty(t) ? i[t].push(e) : i[t] = [e]
        }, t.Note.unroute = function (t, e) {
            var s, n;
            i.hasOwnProperty(t) && (s = i[t], n = s.indexOf(e), -1 !== n && i[t].splice(n, 1))
        }, t.Note.parseScore = function (e) {
            var i, s, n, o, r, a, l, h = [];
            for (i in e) if (s = e[i], "tempo" === i) t.Transport.bpm.value = s;
            else if ("timeSignature" === i) t.Transport.timeSignature = s[0] / (s[1] / 4);
            else {
                if (!Array.isArray(s)) throw new TypeError("score parts must be Arrays");
                for (n = 0; n < s.length; n++) o = s[n], Array.isArray(o) ? (a = o[0], l = o.slice(1), r = new t.Note(i, a, l)) : r = "object" == typeof o ? new t.Note(i, o.time, o) : new t.Note(i, o), h.push(r)
            }
            return h
        }, t.Note
    }), Module(function (t) {
        return t.Effect = function () {
            t.call(this);
            var e = this.optionsObject(arguments, ["wet"], t.Effect.defaults);
            this._dryWet = new t.CrossFade(e.wet), this.wet = this._dryWet.fade, this.effectSend = this.context.createGain(), this.effectReturn = this.context.createGain(), this.input.connect(this._dryWet.a), this.input.connect(this.effectSend), this.effectReturn.connect(this._dryWet.b), this._dryWet.connect(this.output), this._readOnly(["wet"])
        }, t.extend(t.Effect), t.Effect.defaults = {
            wet: 1
        }, t.Effect.prototype.connectEffect = function (t) {
            return this.effectSend.chain(t, this.effectReturn), this
        }, t.Effect.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._dryWet.dispose(), this._dryWet = null, this.effectSend.disconnect(), this.effectSend = null, this.effectReturn.disconnect(), this.effectReturn = null, this._writable(["wet"]), this.wet = null, this
        }, t.Effect
    }), Module(function (t) {
        return t.AutoFilter = function () {
            var e = this.optionsObject(arguments, ["frequency", "baseFrequency", "octaves"], t.AutoFilter.defaults);
            t.Effect.call(this, e), this._lfo = new t.LFO({
                frequency: e.frequency,
                amplitude: e.depth
            }), this.depth = this._lfo.amplitude, this.frequency = this._lfo.frequency, this.filter = new t.Filter(e.filter), this._octaves = 0, this.connectEffect(this.filter), this._lfo.connect(this.filter.frequency), this.type = e.type, this._readOnly(["frequency", "depth"]), this.octaves = e.octaves, this.baseFrequency = e.baseFrequency
        }, t.extend(t.AutoFilter, t.Effect), t.AutoFilter.defaults = {
            frequency: 1,
            type: "sine",
            depth: 1,
            baseFrequency: 200,
            octaves: 2.6,
            filter: {
                type: "lowpass",
                rolloff: -12,
                Q: 1
            }
        }, t.AutoFilter.prototype.start = function (t) {
            return this._lfo.start(t), this
        }, t.AutoFilter.prototype.stop = function (t) {
            return this._lfo.stop(t), this
        }, t.AutoFilter.prototype.sync = function (t) {
            return this._lfo.sync(t), this
        }, t.AutoFilter.prototype.unsync = function () {
            return this._lfo.unsync(), this
        }, Object.defineProperty(t.AutoFilter.prototype, "type", {
            get: function () {
                return this._lfo.type
            },
            set: function (t) {
                this._lfo.type = t
            }
        }), Object.defineProperty(t.AutoFilter.prototype, "baseFrequency", {
            get: function () {
                return this._lfo.min
            },
            set: function (t) {
                this._lfo.min = this.toFrequency(t)
            }
        }), Object.defineProperty(t.AutoFilter.prototype, "octaves", {
            get: function () {
                return this._octaves
            },
            set: function (t) {
                this._octaves = t, this._lfo.max = this.baseFrequency * Math.pow(2, t)
            }
        }), t.AutoFilter.prototype.dispose = function () {
            return t.Effect.prototype.dispose.call(this), this._lfo.dispose(), this._lfo = null, this.filter.dispose(), this.filter = null, this._writable(["frequency", "depth"]), this.frequency = null, this.depth = null, this
        }, t.AutoFilter
    }), Module(function (t) {
        return t.AutoPanner = function () {
            var e = this.optionsObject(arguments, ["frequency"], t.AutoPanner.defaults);
            t.Effect.call(this, e), this._lfo = new t.LFO({
                frequency: e.frequency,
                amplitude: e.depth,
                min: 0,
                max: 1
            }), this.depth = this._lfo.amplitude, this._panner = new t.Panner, this.frequency = this._lfo.frequency, this.connectEffect(this._panner), this._lfo.connect(this._panner.pan), this.type = e.type, this._readOnly(["depth", "frequency"])
        }, t.extend(t.AutoPanner, t.Effect), t.AutoPanner.defaults = {
            frequency: 1,
            type: "sine",
            depth: 1
        }, t.AutoPanner.prototype.start = function (t) {
            return this._lfo.start(t), this
        }, t.AutoPanner.prototype.stop = function (t) {
            return this._lfo.stop(t), this
        }, t.AutoPanner.prototype.sync = function (t) {
            return this._lfo.sync(t), this
        }, t.AutoPanner.prototype.unsync = function () {
            return this._lfo.unsync(), this
        }, Object.defineProperty(t.AutoPanner.prototype, "type", {
            get: function () {
                return this._lfo.type
            },
            set: function (t) {
                this._lfo.type = t
            }
        }), t.AutoPanner.prototype.dispose = function () {
            return t.Effect.prototype.dispose.call(this), this._lfo.dispose(), this._lfo = null, this._panner.dispose(), this._panner = null, this._writable(["depth", "frequency"]), this.frequency = null, this.depth = null, this
        }, t.AutoPanner
    }), Module(function (t) {
        return t.AutoWah = function () {
            var e = this.optionsObject(arguments, ["baseFrequency", "octaves", "sensitivity"], t.AutoWah.defaults);
            t.Effect.call(this, e), this.follower = new t.Follower(e.follower), this._sweepRange = new t.ScaleExp(0, 1, .5), this._baseFrequency = e.baseFrequency, this._octaves = e.octaves, this._inputBoost = this.context.createGain(), this._bandpass = new t.Filter({
                rolloff: -48,
                frequency: 0,
                Q: e.Q
            }), this._peaking = new t.Filter(0, "peaking"), this._peaking.gain.value = e.gain, this.gain = this._peaking.gain, this.Q = this._bandpass.Q, this.effectSend.chain(this._inputBoost, this.follower, this._sweepRange), this._sweepRange.connect(this._bandpass.frequency), this._sweepRange.connect(this._peaking.frequency), this.effectSend.chain(this._bandpass, this._peaking, this.effectReturn), this._setSweepRange(), this.sensitivity = e.sensitivity, this._readOnly(["gain", "Q"])
        }, t.extend(t.AutoWah, t.Effect), t.AutoWah.defaults = {
            baseFrequency: 100,
            octaves: 6,
            sensitivity: 0,
            Q: 2,
            gain: 2,
            follower: {
                attack: .3,
                release: .5
            }
        }, Object.defineProperty(t.AutoWah.prototype, "octaves", {
            get: function () {
                return this._octaves
            },
            set: function (t) {
                this._octaves = t, this._setSweepRange()
            }
        }), Object.defineProperty(t.AutoWah.prototype, "baseFrequency", {
            get: function () {
                return this._baseFrequency
            },
            set: function (t) {
                this._baseFrequency = t, this._setSweepRange()
            }
        }), Object.defineProperty(t.AutoWah.prototype, "sensitivity", {
            get: function () {
                return this.gainToDb(1 / this._inputBoost.gain.value)
            },
            set: function (t) {
                this._inputBoost.gain.value = 1 / this.dbToGain(t)
            }
        }), t.AutoWah.prototype._setSweepRange = function () {
            this._sweepRange.min = this._baseFrequency, this._sweepRange.max = Math.min(this._baseFrequency * Math.pow(2, this._octaves), this.context.sampleRate / 2)
        }, t.AutoWah.prototype.dispose = function () {
            return t.Effect.prototype.dispose.call(this), this.follower.dispose(), this.follower = null, this._sweepRange.dispose(), this._sweepRange = null, this._bandpass.dispose(), this._bandpass = null, this._peaking.dispose(), this._peaking = null, this._inputBoost.disconnect(), this._inputBoost = null, this._writable(["gain", "Q"]), this.gain = null, this.Q = null, this
        }, t.AutoWah
    }), Module(function (t) {
        return t.BitCrusher = function () {
            var e, i = this.optionsObject(arguments, ["bits"], t.BitCrusher.defaults);
            t.Effect.call(this, i), e = 1 / Math.pow(2, i.bits - 1), this._subtract = new t.Subtract, this._modulo = new t.Modulo(e), this._bits = i.bits, this.effectSend.fan(this._subtract, this._modulo), this._modulo.connect(this._subtract, 0, 1), this._subtract.connect(this.effectReturn)
        }, t.extend(t.BitCrusher, t.Effect), t.BitCrusher.defaults = {
            bits: 4
        }, Object.defineProperty(t.BitCrusher.prototype, "bits", {
            get: function () {
                return this._bits
            },
            set: function (t) {
                this._bits = t;
                var e = 1 / Math.pow(2, t - 1);
                this._modulo.value = e
            }
        }), t.BitCrusher.prototype.dispose = function () {
            return t.Effect.prototype.dispose.call(this), this._subtract.dispose(), this._subtract = null, this._modulo.dispose(), this._modulo = null, this
        }, t.BitCrusher
    }), Module(function (t) {
        return t.Chebyshev = function () {
            var e = this.optionsObject(arguments, ["order"], t.Chebyshev.defaults);
            t.Effect.call(this, e), this._shaper = new t.WaveShaper(4096), this._order = e.order, this.connectEffect(this._shaper), this.order = e.order, this.oversample = e.oversample
        }, t.extend(t.Chebyshev, t.Effect), t.Chebyshev.defaults = {
            order: 1,
            oversample: "none"
        }, t.Chebyshev.prototype._getCoefficient = function (t, e, i) {
            return i.hasOwnProperty(e) ? i[e] : (i[e] = 0 === e ? 0 : 1 === e ? t : 2 * t * this._getCoefficient(t, e - 1, i) - this._getCoefficient(t, e - 2, i), i[e])
        }, Object.defineProperty(t.Chebyshev.prototype, "order", {
            get: function () {
                return this._order
            },
            set: function (t) {
                var e, i, s, n;
                for (this._order = t, e = new Array(4096), i = e.length, s = 0; i > s; ++s) n = 2 * s / i - 1, e[s] = 0 === n ? 0 : this._getCoefficient(n, t, {});
                this._shaper.curve = e
            }
        }), Object.defineProperty(t.Chebyshev.prototype, "oversample", {
            get: function () {
                return this._shaper.oversample
            },
            set: function (t) {
                this._shaper.oversample = t
            }
        }), t.Chebyshev.prototype.dispose = function () {
            return t.Effect.prototype.dispose.call(this), this._shaper.dispose(), this._shaper = null, this
        }, t.Chebyshev
    }), Module(function (t) {
        return t.StereoEffect = function () {
            t.call(this);
            var e = this.optionsObject(arguments, ["wet"], t.Effect.defaults);
            this._dryWet = new t.CrossFade(e.wet), this.wet = this._dryWet.fade, this._split = new t.Split, this.effectSendL = this._split.left, this.effectSendR = this._split.right, this._merge = new t.Merge, this.effectReturnL = this._merge.left, this.effectReturnR = this._merge.right, this.input.connect(this._split), this.input.connect(this._dryWet, 0, 0), this._merge.connect(this._dryWet, 0, 1), this._dryWet.connect(this.output), this._readOnly(["wet"])
        }, t.extend(t.StereoEffect, t.Effect), t.StereoEffect.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._dryWet.dispose(), this._dryWet = null, this._split.dispose(), this._split = null, this._merge.dispose(), this._merge = null, this.effectSendL = null, this.effectSendR = null, this.effectReturnL = null, this.effectReturnR = null, this._writable(["wet"]), this.wet = null, this
        }, t.StereoEffect
    }), Module(function (t) {
        return t.FeedbackEffect = function () {
            var e = this.optionsObject(arguments, ["feedback"]);
            e = this.defaultArg(e, t.FeedbackEffect.defaults), t.Effect.call(this, e), this.feedback = new t.Signal(e.feedback, t.Type.NormalRange), this._feedbackGain = this.context.createGain(), this.effectReturn.chain(this._feedbackGain, this.effectSend), this.feedback.connect(this._feedbackGain.gain), this._readOnly(["feedback"])
        }, t.extend(t.FeedbackEffect, t.Effect), t.FeedbackEffect.defaults = {
            feedback: .125
        }, t.FeedbackEffect.prototype.dispose = function () {
            return t.Effect.prototype.dispose.call(this), this._writable(["feedback"]), this.feedback.dispose(), this.feedback = null, this._feedbackGain.disconnect(), this._feedbackGain = null, this
        }, t.FeedbackEffect
    }), Module(function (t) {
        return t.StereoXFeedbackEffect = function () {
            var e = this.optionsObject(arguments, ["feedback"], t.FeedbackEffect.defaults);
            t.StereoEffect.call(this, e), this.feedback = new t.Signal(e.feedback, t.Type.NormalRange), this._feedbackLR = this.context.createGain(), this._feedbackRL = this.context.createGain(), this.effectReturnL.chain(this._feedbackLR, this.effectSendR), this.effectReturnR.chain(this._feedbackRL, this.effectSendL), this.feedback.fan(this._feedbackLR.gain, this._feedbackRL.gain), this._readOnly(["feedback"])
        }, t.extend(t.StereoXFeedbackEffect, t.FeedbackEffect), t.StereoXFeedbackEffect.prototype.dispose = function () {
            return t.StereoEffect.prototype.dispose.call(this), this._writable(["feedback"]), this.feedback.dispose(), this.feedback = null, this._feedbackLR.disconnect(), this._feedbackLR = null, this._feedbackRL.disconnect(), this._feedbackRL = null, this
        }, t.StereoXFeedbackEffect
    }), Module(function (t) {
        return t.Chorus = function () {
            var e = this.optionsObject(arguments, ["frequency", "delayTime", "depth"], t.Chorus.defaults);
            t.StereoXFeedbackEffect.call(this, e), this._depth = e.depth, this._delayTime = e.delayTime / 1e3, this._lfoL = new t.LFO({
                frequency: e.frequency,
                min: 0,
                max: 1
            }), this._lfoR = new t.LFO({
                frequency: e.frequency,
                min: 0,
                max: 1,
                phase: 180
            }), this._delayNodeL = this.context.createDelay(), this._delayNodeR = this.context.createDelay(), this.frequency = this._lfoL.frequency, this.effectSendL.chain(this._delayNodeL, this.effectReturnL), this.effectSendR.chain(this._delayNodeR, this.effectReturnR), this.effectSendL.connect(this.effectReturnL), this.effectSendR.connect(this.effectReturnR), this._lfoL.connect(this._delayNodeL.delayTime), this._lfoR.connect(this._delayNodeR.delayTime), this._lfoL.start(), this._lfoR.start(), this._lfoL.frequency.connect(this._lfoR.frequency), this.depth = this._depth, this.frequency.value = e.frequency, this.type = e.type, this._readOnly(["frequency"]), this.spread = e.spread
        }, t.extend(t.Chorus, t.StereoXFeedbackEffect), t.Chorus.defaults = {
            frequency: 1.5,
            delayTime: 3.5,
            depth: .7,
            feedback: .1,
            type: "sine",
            spread: 180
        }, Object.defineProperty(t.Chorus.prototype, "depth", {
            get: function () {
                return this._depth
            },
            set: function (t) {
                this._depth = t;
                var e = this._delayTime * t;
                this._lfoL.min = Math.max(this._delayTime - e, 0), this._lfoL.max = this._delayTime + e, this._lfoR.min = Math.max(this._delayTime - e, 0), this._lfoR.max = this._delayTime + e
            }
        }), Object.defineProperty(t.Chorus.prototype, "delayTime", {
            get: function () {
                return 1e3 * this._delayTime
            },
            set: function (t) {
                this._delayTime = t / 1e3, this.depth = this._depth
            }
        }), Object.defineProperty(t.Chorus.prototype, "type", {
            get: function () {
                return this._lfoL.type
            },
            set: function (t) {
                this._lfoL.type = t, this._lfoR.type = t
            }
        }), Object.defineProperty(t.Chorus.prototype, "spread", {
            get: function () {
                return this._lfoR.phase - this._lfoL.phase
            },
            set: function (t) {
                this._lfoL.phase = 90 - t / 2, this._lfoR.phase = t / 2 + 90
            }
        }), t.Chorus.prototype.dispose = function () {
            return t.StereoXFeedbackEffect.prototype.dispose.call(this), this._lfoL.dispose(), this._lfoL = null, this._lfoR.dispose(), this._lfoR = null, this._delayNodeL.disconnect(), this._delayNodeL = null, this._delayNodeR.disconnect(), this._delayNodeR = null, this._writable("frequency"), this.frequency = null, this
        }, t.Chorus
    }), Module(function (t) {
        return t.Convolver = function () {
            var e = this.optionsObject(arguments, ["url"], t.Convolver.defaults);
            t.Effect.call(this, e), this._convolver = this.context.createConvolver(), this._buffer = new t.Buffer(e.url, function (t) {
                this.buffer = t, e.onload()
            }.bind(this)), this.connectEffect(this._convolver)
        }, t.extend(t.Convolver, t.Effect), t.Convolver.defaults = {
            url: "",
            onload: t.noOp
        }, Object.defineProperty(t.Convolver.prototype, "buffer", {
            get: function () {
                return this._buffer.get()
            },
            set: function (t) {
                this._buffer.set(t), this._convolver.buffer = this._buffer.get()
            }
        }), t.Convolver.prototype.load = function (t, e) {
            return this._buffer.load(t, function (t) {
                this.buffer = t, e && e()
            }.bind(this)), this
        }, t.Convolver.prototype.dispose = function () {
            return t.Effect.prototype.dispose.call(this), this._convolver.disconnect(), this._convolver = null, this._buffer.dispose(), this._buffer = null, this
        }, t.Convolver
    }), Module(function (t) {
        return t.Distortion = function () {
            var e = this.optionsObject(arguments, ["distortion"], t.Distortion.defaults);
            t.Effect.call(this, e), this._shaper = new t.WaveShaper(4096), this._distortion = e.distortion, this.connectEffect(this._shaper), this.distortion = e.distortion, this.oversample = e.oversample
        }, t.extend(t.Distortion, t.Effect), t.Distortion.defaults = {
            distortion: .4,
            oversample: "none"
        }, Object.defineProperty(t.Distortion.prototype, "distortion", {
            get: function () {
                return this._distortion
            },
            set: function (t) {
                var e, i;
                this._distortion = t, e = 100 * t, i = Math.PI / 180, this._shaper.setMap(function (t) {
                    return Math.abs(t) < .001 ? 0 : (3 + e) * t * 20 * i / (Math.PI + e * Math.abs(t))
                })
            }
        }), Object.defineProperty(t.Distortion.prototype, "oversample", {
            get: function () {
                return this._shaper.oversample
            },
            set: function (t) {
                this._shaper.oversample = t
            }
        }), t.Distortion.prototype.dispose = function () {
            return t.Effect.prototype.dispose.call(this), this._shaper.dispose(), this._shaper = null, this
        }, t.Distortion
    }), Module(function (t) {
        return t.FeedbackDelay = function () {
            var e = this.optionsObject(arguments, ["delayTime", "feedback"], t.FeedbackDelay.defaults);
            t.FeedbackEffect.call(this, e), this.delayTime = new t.Signal(e.delayTime, t.Type.Time), this._delayNode = this.context.createDelay(4), this.connectEffect(this._delayNode), this.delayTime.connect(this._delayNode.delayTime), this._readOnly(["delayTime"])
        }, t.extend(t.FeedbackDelay, t.FeedbackEffect), t.FeedbackDelay.defaults = {
            delayTime: .25
        }, t.FeedbackDelay.prototype.dispose = function () {
            return t.FeedbackEffect.prototype.dispose.call(this), this.delayTime.dispose(), this._delayNode.disconnect(), this._delayNode = null, this._writable(["delayTime"]), this.delayTime = null, this
        }, t.FeedbackDelay
    }), Module(function (t) {
        var e = [1557 / 44100, 1617 / 44100, 1491 / 44100, 1422 / 44100, 1277 / 44100, 1356 / 44100, 1188 / 44100, 1116 / 44100],
            i = [225, 556, 441, 341];
        return t.Freeverb = function () {
            var s, n, o, r, a, l, h = this.optionsObject(arguments, ["roomSize", "dampening"], t.Freeverb.defaults);
            for (t.StereoEffect.call(this, h), this.roomSize = new t.Signal(h.roomSize, t.Type.NormalRange), this.dampening = new t.Signal(h.dampening, t.Type.Frequency), this._combFilters = [], this._allpassFiltersL = [], this._allpassFiltersR = [], s = 0; s < i.length; s++) n = this.context.createBiquadFilter(), n.type = "allpass", n.frequency.value = i[s], this._allpassFiltersL.push(n);
            for (o = 0; o < i.length; o++) r = this.context.createBiquadFilter(), r.type = "allpass", r.frequency.value = i[o], this._allpassFiltersR.push(r);
            for (a = 0; a < e.length; a++) l = new t.LowpassCombFilter(e[a]), a < e.length / 2 ? this.effectSendL.chain(l, this._allpassFiltersL[0]) : this.effectSendR.chain(l, this._allpassFiltersR[0]), this.roomSize.connect(l.resonance), this.dampening.connect(l.dampening), this._combFilters.push(l);
            this.connectSeries.apply(this, this._allpassFiltersL), this.connectSeries.apply(this, this._allpassFiltersR), this._allpassFiltersL[this._allpassFiltersL.length - 1].connect(this.effectReturnL), this._allpassFiltersR[this._allpassFiltersR.length - 1].connect(this.effectReturnR), this._readOnly(["roomSize", "dampening"])
        }, t.extend(t.Freeverb, t.StereoEffect), t.Freeverb.defaults = {
            roomSize: .7,
            dampening: 3e3
        }, t.Freeverb.prototype.dispose = function () {
            var e, i, s;
            for (t.StereoEffect.prototype.dispose.call(this), e = 0; e < this._allpassFiltersL.length; e++) this._allpassFiltersL[e].disconnect(), this._allpassFiltersL[e] = null;
            for (this._allpassFiltersL = null, i = 0; i < this._allpassFiltersR.length; i++) this._allpassFiltersR[i].disconnect(), this._allpassFiltersR[i] = null;
            for (this._allpassFiltersR = null, s = 0; s < this._combFilters.length; s++) this._combFilters[s].dispose(), this._combFilters[s] = null;
            return this._combFilters = null, this._writable(["roomSize", "dampening"]), this.roomSize.dispose(), this.roomSize = null, this.dampening.dispose(), this.dampening = null,
                this
        }, t.Freeverb
    }), Module(function (t) {
        var e = [.06748, .06404, .08212, .09004],
            i = [.773, .802, .753, .733],
            s = [347, 113, 37];
        return t.JCReverb = function () {
            var n, o, r, a, l = this.optionsObject(arguments, ["roomSize"], t.JCReverb.defaults);
            for (t.StereoEffect.call(this, l), this.roomSize = new t.Signal(l.roomSize, t.Type.NormalRange), this._scaleRoomSize = new t.Scale(-.733, .197), this._allpassFilters = [], this._feedbackCombFilters = [], n = 0; n < s.length; n++) o = this.context.createBiquadFilter(), o.type = "allpass", o.frequency.value = s[n], this._allpassFilters.push(o);
            for (r = 0; r < e.length; r++) a = new t.FeedbackCombFilter(e[r], .1), this._scaleRoomSize.connect(a.resonance), a.resonance.value = i[r], this._allpassFilters[this._allpassFilters.length - 1].connect(a), a.connect(r < e.length / 2 ? this.effectReturnL : this.effectReturnR), this._feedbackCombFilters.push(a);
            this.roomSize.connect(this._scaleRoomSize), this.connectSeries.apply(this, this._allpassFilters), this.effectSendL.connect(this._allpassFilters[0]), this.effectSendR.connect(this._allpassFilters[0]), this._readOnly(["roomSize"])
        }, t.extend(t.JCReverb, t.StereoEffect), t.JCReverb.defaults = {
            roomSize: .5
        }, t.JCReverb.prototype.dispose = function () {
            var e, i;
            for (t.StereoEffect.prototype.dispose.call(this), e = 0; e < this._allpassFilters.length; e++) this._allpassFilters[e].disconnect(), this._allpassFilters[e] = null;
            for (this._allpassFilters = null, i = 0; i < this._feedbackCombFilters.length; i++) this._feedbackCombFilters[i].dispose(), this._feedbackCombFilters[i] = null;
            return this._feedbackCombFilters = null, this._writable(["roomSize"]), this.roomSize.dispose(), this.roomSize = null, this._scaleRoomSize.dispose(), this._scaleRoomSize = null, this
        }, t.JCReverb
    }), Module(function (t) {
        return t.MidSideEffect = function () {
            t.Effect.apply(this, arguments), this._midSideSplit = new t.MidSideSplit, this._midSideMerge = new t.MidSideMerge, this.midSend = this._midSideSplit.mid, this.sideSend = this._midSideSplit.side, this.midReturn = this._midSideMerge.mid, this.sideReturn = this._midSideMerge.side, this.effectSend.connect(this._midSideSplit), this._midSideMerge.connect(this.effectReturn)
        }, t.extend(t.MidSideEffect, t.Effect), t.MidSideEffect.prototype.dispose = function () {
            return t.Effect.prototype.dispose.call(this), this._midSideSplit.dispose(), this._midSideSplit = null, this._midSideMerge.dispose(), this._midSideMerge = null, this.midSend = null, this.sideSend = null, this.midReturn = null, this.sideReturn = null, this
        }, t.MidSideEffect
    }), Module(function (t) {
        return t.Phaser = function () {
            var e = this.optionsObject(arguments, ["frequency", "octaves", "baseFrequency"], t.Phaser.defaults);
            t.StereoEffect.call(this, e), this._lfoL = new t.LFO(e.frequency, 0, 1), this._lfoR = new t.LFO(e.frequency, 0, 1), this._lfoR.phase = 180, this._baseFrequency = e.baseFrequency, this._octaves = e.octaves, this.Q = new t.Signal(e.Q, t.Type.Positive), this._filtersL = this._makeFilters(e.stages, this._lfoL, this.Q), this._filtersR = this._makeFilters(e.stages, this._lfoR, this.Q), this.frequency = this._lfoL.frequency, this.frequency.value = e.frequency, this.effectSendL.connect(this._filtersL[0]), this.effectSendR.connect(this._filtersR[0]), this._filtersL[e.stages - 1].connect(this.effectReturnL), this._filtersR[e.stages - 1].connect(this.effectReturnR), this._lfoL.frequency.connect(this._lfoR.frequency), this.baseFrequency = e.baseFrequency, this.octaves = e.octaves, this._lfoL.start(), this._lfoR.start(), this._readOnly(["frequency", "Q"])
        }, t.extend(t.Phaser, t.StereoEffect), t.Phaser.defaults = {
            frequency: .5,
            octaves: 3,
            stages: 10,
            Q: 10,
            baseFrequency: 350
        }, t.Phaser.prototype._makeFilters = function (t, e, i) {
            var s, n, o = new Array(t);
            for (s = 0; t > s; s++) n = this.context.createBiquadFilter(), n.type = "allpass", i.connect(n.Q), e.connect(n.frequency), o[s] = n;
            return this.connectSeries.apply(this, o), o
        }, Object.defineProperty(t.Phaser.prototype, "octaves", {
            get: function () {
                return this._octaves
            },
            set: function (t) {
                this._octaves = t;
                var e = this._baseFrequency * Math.pow(2, t);
                this._lfoL.max = e, this._lfoR.max = e
            }
        }), Object.defineProperty(t.Phaser.prototype, "baseFrequency", {
            get: function () {
                return this._baseFrequency
            },
            set: function (t) {
                this._baseFrequency = t, this._lfoL.min = t, this._lfoR.min = t, this.octaves = this._octaves
            }
        }), t.Phaser.prototype.dispose = function () {
            var e, i;
            for (t.StereoEffect.prototype.dispose.call(this), this._writable(["frequency", "Q"]), this.Q.dispose(), this.Q = null, this._lfoL.dispose(), this._lfoL = null, this._lfoR.dispose(), this._lfoR = null, e = 0; e < this._filtersL.length; e++) this._filtersL[e].disconnect(), this._filtersL[e] = null;
            for (this._filtersL = null, i = 0; i < this._filtersR.length; i++) this._filtersR[i].disconnect(), this._filtersR[i] = null;
            return this._filtersR = null, this.frequency = null, this
        }, t.Phaser
    }), Module(function (t) {
        return t.PingPongDelay = function () {
            var e = this.optionsObject(arguments, ["delayTime", "feedback"], t.PingPongDelay.defaults);
            t.StereoXFeedbackEffect.call(this, e), this._leftDelay = this.context.createDelay(e.maxDelayTime), this._rightDelay = this.context.createDelay(e.maxDelayTime), this._rightPreDelay = this.context.createDelay(e.maxDelayTime), this.delayTime = new t.Signal(e.delayTime, t.Type.Time), this.effectSendL.chain(this._leftDelay, this.effectReturnL), this.effectSendR.chain(this._rightPreDelay, this._rightDelay, this.effectReturnR), this.delayTime.fan(this._leftDelay.delayTime, this._rightDelay.delayTime, this._rightPreDelay.delayTime), this._feedbackLR.disconnect(), this._feedbackLR.connect(this._rightDelay), this._readOnly(["delayTime"])
        }, t.extend(t.PingPongDelay, t.StereoXFeedbackEffect), t.PingPongDelay.defaults = {
            delayTime: .25,
            maxDelayTime: 1
        }, t.PingPongDelay.prototype.dispose = function () {
            return t.StereoXFeedbackEffect.prototype.dispose.call(this), this._leftDelay.disconnect(), this._leftDelay = null, this._rightDelay.disconnect(), this._rightDelay = null, this._rightPreDelay.disconnect(), this._rightPreDelay = null, this._writable(["delayTime"]), this.delayTime.dispose(), this.delayTime = null, this
        }, t.PingPongDelay
    }), Module(function (t) {
        return t.PitchShift = function () {
            var e, i = this.optionsObject(arguments, ["pitch"], t.PitchShift.defaults);
            t.FeedbackEffect.call(this, i), this._frequency = new t.Signal(0), this._delayA = new t.Delay(0, 1), this._lfoA = new t.LFO({
                min: 0,
                max: .1,
                type: "sawtooth"
            }).connect(this._delayA.delayTime), this._delayB = new t.Delay(0, 1), this._lfoB = new t.LFO({
                min: 0,
                max: .1,
                type: "sawtooth",
                phase: 180
            }).connect(this._delayB.delayTime), this._crossFade = new t.CrossFade, this._crossFadeLFO = new t.LFO({
                min: 0,
                max: 1,
                type: "triangle",
                phase: 90
            }).connect(this._crossFade.fade), this._feedbackDelay = new t.Delay(i.delayTime), this.delayTime = this._feedbackDelay.delayTime, this._readOnly("delayTime"), this._pitch = i.pitch, this._windowSize = i.windowSize, this._delayA.connect(this._crossFade.a), this._delayB.connect(this._crossFade.b), this._frequency.fan(this._lfoA.frequency, this._lfoB.frequency, this._crossFadeLFO.frequency), this.effectSend.fan(this._delayA, this._delayB), this._crossFade.chain(this._feedbackDelay, this.effectReturn), e = this.now(), this._lfoA.start(e), this._lfoB.start(e), this._crossFadeLFO.start(e), this.windowSize = this._windowSize
        }, t.extend(t.PitchShift, t.FeedbackEffect), t.PitchShift.defaults = {
            pitch: 0,
            windowSize: .1,
            delayTime: 0,
            feedback: 0
        }, Object.defineProperty(t.PitchShift.prototype, "pitch", {
            get: function () {
                return this._pitch
            },
            set: function (t) {
                this._pitch = t;
                var e = 0;
                0 > t ? (this._lfoA.min = 0, this._lfoA.max = this._windowSize, this._lfoB.min = 0, this._lfoB.max = this._windowSize, e = this.intervalToFrequencyRatio(t - 1) + 1) : (this._lfoA.min = this._windowSize, this._lfoA.max = 0, this._lfoB.min = this._windowSize, this._lfoB.max = 0, e = this.intervalToFrequencyRatio(t) - 1), this._frequency.value = e * (1.2 / this._windowSize)
            }
        }), Object.defineProperty(t.PitchShift.prototype, "windowSize", {
            get: function () {
                return this._windowSize
            },
            set: function (t) {
                this._windowSize = this.toSeconds(t), this.pitch = this._pitch
            }
        }), t.PitchShift.prototype.dispose = function () {
            return t.FeedbackEffect.prototype.dispose.call(this), this._frequency.dispose(), this._frequency = null, this._delayA.disconnect(), this._delayA = null, this._delayB.disconnect(), this._delayB = null, this._lfoA.dispose(), this._lfoA = null, this._lfoB.dispose(), this._lfoB = null, this._crossFade.dispose(), this._crossFade = null, this._crossFadeLFO.dispose(), this._crossFadeLFO = null, this._writable("delayTime"), this._feedbackDelay.dispose(), this._feedbackDelay = null, this.delayTime = null, this
        }, t.PitchShift
    }), Module(function (t) {
        return t.StereoFeedbackEffect = function () {
            var e = this.optionsObject(arguments, ["feedback"], t.FeedbackEffect.defaults);
            t.StereoEffect.call(this, e), this.feedback = new t.Signal(e.feedback, t.Type.NormalRange), this._feedbackL = this.context.createGain(), this._feedbackR = this.context.createGain(), this.effectReturnL.chain(this._feedbackL, this.effectSendL), this.effectReturnR.chain(this._feedbackR, this.effectSendR), this.feedback.fan(this._feedbackL.gain, this._feedbackR.gain), this._readOnly(["feedback"])
        }, t.extend(t.StereoFeedbackEffect, t.FeedbackEffect), t.StereoFeedbackEffect.prototype.dispose = function () {
            return t.StereoEffect.prototype.dispose.call(this), this._writable(["feedback"]), this.feedback.dispose(), this.feedback = null, this._feedbackL.disconnect(), this._feedbackL = null, this._feedbackR.disconnect(), this._feedbackR = null, this
        }, t.StereoFeedbackEffect
    }), Module(function (t) {
        return t.StereoWidener = function () {
            var e = this.optionsObject(arguments, ["width"], t.StereoWidener.defaults);
            t.MidSideEffect.call(this, e), this.width = new t.Signal(e.width, t.Type.NormalRange), this._midMult = new t.Expr("$0 * ($1 * (1 - $2))"), this._sideMult = new t.Expr("$0 * ($1 * $2)"), this._two = new t.Signal(2), this._two.connect(this._midMult, 0, 1), this.width.connect(this._midMult, 0, 2), this._two.connect(this._sideMult, 0, 1), this.width.connect(this._sideMult, 0, 2), this.midSend.chain(this._midMult, this.midReturn), this.sideSend.chain(this._sideMult, this.sideReturn), this._readOnly(["width"])
        }, t.extend(t.StereoWidener, t.MidSideEffect), t.StereoWidener.defaults = {
            width: .5
        }, t.StereoWidener.prototype.dispose = function () {
            return t.MidSideEffect.prototype.dispose.call(this), this._writable(["width"]), this.width.dispose(), this.width = null, this._midMult.dispose(), this._midMult = null, this._sideMult.dispose(), this._sideMult = null, this._two.dispose(), this._two = null, this
        }, t.StereoWidener
    }), Module(function (t) {
        return t.Tremolo = function () {
            var e = this.optionsObject(arguments, ["frequency", "depth"], t.Tremolo.defaults);
            t.StereoEffect.call(this, e), this._lfoL = new t.LFO({
                phase: e.spread,
                min: 1,
                max: 0
            }), this._lfoR = new t.LFO({
                phase: e.spread,
                min: 1,
                max: 0
            }), this._amplitudeL = new t.Gain, this._amplitudeR = new t.Gain, this.frequency = new t.Signal(e.frequency, t.Type.Frequency), this.depth = new t.Signal(e.depth, t.Type.NormalRange), this._readOnly(["frequency", "depth"]), this.effectSendL.chain(this._amplitudeL, this.effectReturnL), this.effectSendR.chain(this._amplitudeR, this.effectReturnR), this._lfoL.connect(this._amplitudeL.gain), this._lfoR.connect(this._amplitudeR.gain), this.frequency.fan(this._lfoL.frequency, this._lfoR.frequency), this.depth.fan(this._lfoR.amplitude, this._lfoL.amplitude), this.type = e.type, this.spread = e.spread
        }, t.extend(t.Tremolo, t.StereoEffect), t.Tremolo.defaults = {
            frequency: 10,
            type: "sine",
            depth: .5,
            spread: 180
        }, t.Tremolo.prototype.start = function (t) {
            return this._lfoL.start(t), this._lfoR.start(t), this
        }, t.Tremolo.prototype.stop = function (t) {
            return this._lfoL.stop(t), this._lfoR.stop(t), this
        }, t.Tremolo.prototype.sync = function (t) {
            return this._lfoL.sync(t), this._lfoR.sync(t), this
        }, t.Tremolo.prototype.unsync = function () {
            return this._lfoL.unsync(), this._lfoR.unsync(), this
        }, Object.defineProperty(t.Tremolo.prototype, "type", {
            get: function () {
                return this._lfoL.type
            },
            set: function (t) {
                this._lfoL.type = t, this._lfoR.type = t
            }
        }), Object.defineProperty(t.Tremolo.prototype, "spread", {
            get: function () {
                return this._lfoR.phase - this._lfoL.phase
            },
            set: function (t) {
                this._lfoL.phase = 90 - t / 2, this._lfoR.phase = t / 2 + 90
            }
        }), t.Tremolo.prototype.dispose = function () {
            return t.StereoEffect.prototype.dispose.call(this), this._writable(["frequency", "depth"]), this._lfoL.dispose(), this._lfoL = null, this._lfoR.dispose(), this._lfoR = null, this._amplitudeL.dispose(), this._amplitudeL = null, this._amplitudeR.dispose(), this._amplitudeR = null, this.frequency = null, this.depth = null, this
        }, t.Tremolo
    }), Module(function (t) {
        return t.Vibrato = function () {
            var e = this.optionsObject(arguments, ["frequency", "depth"], t.Vibrato.defaults);
            t.Effect.call(this, e), this._delayNode = new t.Delay(0, e.maxDelay), this._lfo = new t.LFO({
                type: e.type,
                min: 0,
                max: e.maxDelay,
                frequency: e.frequency,
                phase: -90
            }).start().connect(this._delayNode.delayTime), this.frequency = this._lfo.frequency, this.depth = this._lfo.amplitude, this.depth.value = e.depth, this._readOnly(["frequency", "depth"]), this.effectSend.chain(this._delayNode, this.effectReturn)
        }, t.extend(t.Vibrato, t.Effect), t.Vibrato.defaults = {
            maxDelay: .005,
            frequency: 5,
            depth: .1,
            type: "sine"
        }, Object.defineProperty(t.Vibrato.prototype, "type", {
            get: function () {
                return this._lfo.type
            },
            set: function (t) {
                this._lfo.type = t
            }
        }), t.Vibrato.prototype.dispose = function () {
            t.Effect.prototype.dispose.call(this), this._delayNode.dispose(), this._delayNode = null, this._lfo.dispose(), this._lfo = null, this._writable(["frequency", "depth"]), this.frequency = null, this.depth = null
        }, t.Vibrato
    }), Module(function (t) {
        return t.Event = function () {
            var e = this.optionsObject(arguments, ["callback", "value"], t.Event.defaults);
            this._loop = e.loop, this.callback = e.callback, this.value = e.value, this._loopStart = this.toTicks(e.loopStart), this._loopEnd = this.toTicks(e.loopEnd), this._state = new t.TimelineState(t.State.Stopped), this._playbackRate = 1, this._startOffset = 0, this.probability = e.probability, this.humanize = e.humanize, this.mute = e.mute, this.playbackRate = e.playbackRate
        }, t.extend(t.Event), t.Event.defaults = {
            callback: t.noOp,
            loop: !1,
            loopEnd: "1m",
            loopStart: 0,
            playbackRate: 1,
            value: null,
            probability: 1,
            mute: !1,
            humanize: !1
        }, t.Event.prototype._rescheduleEvents = function (e) {
            return e = this.defaultArg(e, -1), this._state.forEachFrom(e, function (e) {
                var i, s, n;
                e.state === t.State.Started && (this.isUndef(e.id) || t.Transport.clear(e.id), s = e.time + Math.round(this.startOffset / this._playbackRate), this._loop ? (i = 1 / 0, this.isNumber(this._loop) && (i = (this._loop - 1) * this._getLoopDuration()), n = this._state.getEventAfter(s), null !== n && (i = Math.min(i, n.time - s)), i !== 1 / 0 && (this._state.setStateAtTime(t.State.Stopped, s + i + 1), i += "i"), e.id = t.Transport.scheduleRepeat(this._tick.bind(this), this._getLoopDuration().toString() + "i", s + "i", i)) : e.id = t.Transport.schedule(this._tick.bind(this), s + "i"))
            }.bind(this)), this
        }, Object.defineProperty(t.Event.prototype, "state", {
            get: function () {
                return this._state.getStateAtTime(t.Transport.ticks)
            }
        }), Object.defineProperty(t.Event.prototype, "startOffset", {
            get: function () {
                return this._startOffset
            },
            set: function (t) {
                this._startOffset = t
            }
        }), t.Event.prototype.start = function (e) {
            return e = this.toTicks(e), this._state.getStateAtTime(e) === t.State.Stopped && (this._state.addEvent({
                state: t.State.Started,
                time: e,
                id: void 0
            }), this._rescheduleEvents(e)), this
        }, t.Event.prototype.stop = function (e) {
            var i, s;
            return this.cancel(e), e = this.toTicks(e), this._state.getStateAtTime(e) === t.State.Started && (this._state.setStateAtTime(t.State.Stopped, e), i = this._state.getEventBefore(e), s = e, null !== i && (s = i.time), this._rescheduleEvents(s)), this
        }, t.Event.prototype.cancel = function (e) {
            return e = this.defaultArg(e, -(1 / 0)), e = this.toTicks(e), this._state.forEachFrom(e, function (e) {
                t.Transport.clear(e.id)
            }), this._state.cancel(e), this
        }, t.Event.prototype._tick = function (e) {
            if (!this.mute && this._state.getStateAtTime(t.Transport.ticks) === t.State.Started) {
                if (this.probability < 1 && Math.random() > this.probability) return;
                if (this.humanize) {
                    var i = .02;
                    this.isBoolean(this.humanize) || (i = this.toSeconds(this.humanize)), e += (2 * Math.random() - 1) * i
                }
                this.callback(e, this.value)
            }
        }, t.Event.prototype._getLoopDuration = function () {
            return Math.round((this._loopEnd - this._loopStart) / this._playbackRate)
        }, Object.defineProperty(t.Event.prototype, "loop", {
            get: function () {
                return this._loop
            },
            set: function (t) {
                this._loop = t, this._rescheduleEvents()
            }
        }), Object.defineProperty(t.Event.prototype, "playbackRate", {
            get: function () {
                return this._playbackRate
            },
            set: function (t) {
                this._playbackRate = t, this._rescheduleEvents()
            }
        }), Object.defineProperty(t.Event.prototype, "loopEnd", {
            get: function () {
                return this.toNotation(this._loopEnd + "i")
            },
            set: function (t) {
                this._loopEnd = this.toTicks(t), this._loop && this._rescheduleEvents()
            }
        }), Object.defineProperty(t.Event.prototype, "loopStart", {
            get: function () {
                return this.toNotation(this._loopStart + "i")
            },
            set: function (t) {
                this._loopStart = this.toTicks(t), this._loop && this._rescheduleEvents()
            }
        }), Object.defineProperty(t.Event.prototype, "progress", {
            get: function () {
                var e, i, s, n;
                return this._loop ? (e = t.Transport.ticks, i = this._state.getEvent(e), null !== i && i.state === t.State.Started ? (s = this._getLoopDuration(), n = (e - i.time) % s, n / s) : 0) : 0
            }
        }), t.Event.prototype.dispose = function () {
            this.cancel(), this._state.dispose(), this._state = null, this.callback = null, this.value = null
        }, t.Event
    }), Module(function (t) {
        return t.Loop = function () {
            var e = this.optionsObject(arguments, ["callback", "interval"], t.Loop.defaults);
            this._event = new t.Event({
                callback: this._tick.bind(this),
                loop: !0,
                loopEnd: e.interval,
                playbackRate: e.playbackRate,
                probability: e.probability
            }), this.callback = e.callback, this.iterations = e.iterations
        }, t.extend(t.Loop), t.Loop.defaults = {
            interval: "4n",
            callback: t.noOp,
            playbackRate: 1,
            iterations: 1 / 0,
            probability: !0,
            mute: !1
        }, t.Loop.prototype.start = function (t) {
            return this._event.start(t), this
        }, t.Loop.prototype.stop = function (t) {
            return this._event.stop(t), this
        }, t.Loop.prototype.cancel = function (t) {
            return this._event.cancel(t), this
        }, t.Loop.prototype._tick = function (t) {
            this.callback(t)
        }, Object.defineProperty(t.Loop.prototype, "state", {
            get: function () {
                return this._event.state
            }
        }), Object.defineProperty(t.Loop.prototype, "progress", {
            get: function () {
                return this._event.progress
            }
        }), Object.defineProperty(t.Loop.prototype, "interval", {
            get: function () {
                return this._event.loopEnd
            },
            set: function (t) {
                this._event.loopEnd = t
            }
        }), Object.defineProperty(t.Loop.prototype, "playbackRate", {
            get: function () {
                return this._event.playbackRate
            },
            set: function (t) {
                this._event.playbackRate = t
            }
        }), Object.defineProperty(t.Loop.prototype, "humanize", {
            get: function () {
                return this._event.humanize
            },
            set: function (t) {
                this._event.humanize = t
            }
        }), Object.defineProperty(t.Loop.prototype, "probability", {
            get: function () {
                return this._event.probability
            },
            set: function (t) {
                this._event.probability = t
            }
        }), Object.defineProperty(t.Loop.prototype, "mute", {
            get: function () {
                return this._event.mute
            },
            set: function (t) {
                this._event.mute = t
            }
        }), Object.defineProperty(t.Loop.prototype, "iterations", {
            get: function () {
                return this._event.loop === !0 ? 1 / 0 : this._event.loop
            },
            set: function (t) {
                this._event.loop = t === 1 / 0 ? !0 : t
            }
        }), t.Loop.prototype.dispose = function () {
            this._event.dispose(), this._event = null, this.callback = null
        }, t.Loop
    }), Module(function (t) {
        return t.Part = function () {
            var e, i, s = this.optionsObject(arguments, ["callback", "events"], t.Part.defaults);
            if (this._loop = s.loop, this._loopStart = this.toTicks(s.loopStart), this._loopEnd = this.toTicks(s.loopEnd), this._playbackRate = s.playbackRate, this._probability = s.probability, this._humanize = s.humanize, this._startOffset = 0, this._state = new t.TimelineState(t.State.Stopped), this._events = [], this.callback = s.callback, this.mute = s.mute, e = this.defaultArg(s.events, []), !this.isUndef(s.events)) for (i = 0; i < e.length; i++) Array.isArray(e[i]) ? this.add(e[i][0], e[i][1]) : this.add(e[i])
        }, t.extend(t.Part, t.Event), t.Part.defaults = {
            callback: t.noOp,
            loop: !1,
            loopEnd: "1m",
            loopStart: 0,
            playbackRate: 1,
            probability: 1,
            humanize: !1,
            mute: !1
        }, t.Part.prototype.start = function (e, i) {
            var s = this.toTicks(e);
            return this._state.getStateAtTime(s) !== t.State.Started && (i = this.defaultArg(i, 0), i = this.toTicks(i), this._state.addEvent({
                state: t.State.Started,
                time: s,
                offset: i
            }), this._forEach(function (t) {
                this._startNote(t, s, i)
            })), this
        }, t.Part.prototype._startNote = function (t, e, i) {
            e -= i, this._loop ? t.startOffset >= this._loopStart && t.startOffset < this._loopEnd && (t.startOffset < i && (e += this._getLoopDuration()), t.start(e + "i")) : t.startOffset >= i && t.start(e + "i")
        }, Object.defineProperty(t.Part.prototype, "startOffset", {
            get: function () {
                return this._startOffset
            },
            set: function (t) {
                this._startOffset = t, this._forEach(function (t) {
                    t.startOffset += this._startOffset
                })
            }
        }), t.Part.prototype.stop = function (e) {
            var i = this.toTicks(e);
            return this._state.getStateAtTime(i) === t.State.Started && (this._state.setStateAtTime(t.State.Stopped, i), this._forEach(function (t) {
                t.stop(e)
            })), this
        }, t.Part.prototype.at = function (t, e) {
            var i, s, n;
            for (t = this.toTicks(t), i = this.ticksToSeconds(1), s = 0; s < this._events.length; s++) if (n = this._events[s], Math.abs(t - n.startOffset) < i) return this.isUndef(e) || (n.value = e), n;
            return this.isUndef(e) ? null : (this.add(t + "i", e), this._events[this._events.length - 1])
        }, t.Part.prototype.add = function (e, i) {
            this.isObject(e) && e.hasOwnProperty("time") && (i = e, e = i.time, delete i.time), e = this.toTicks(e);
            var s;
            return i instanceof t.Event ? (s = i, s.callback = this._tick.bind(this)) : s = new t.Event({
                callback: this._tick.bind(this),
                value: i
            }), s.startOffset = e, s.set({
                loopEnd: this.loopEnd,
                loopStart: this.loopStart,
                loop: this.loop,
                humanize: this.humanize,
                playbackRate: this.playbackRate,
                probability: this.probability
            }), this._events.push(s), this._restartEvent(s), this
        }, t.Part.prototype._restartEvent = function (e) {
            var i = this._state.getEvent(this.now());
            i && i.state === t.State.Started && this._startNote(e, i.time, i.offset)
        }, t.Part.prototype.remove = function (e, i) {
            var s, n;
            for (this.isObject(e) && e.hasOwnProperty("time") && (i = e, e = i.time), e = this.toTicks(e), s = this._events.length - 1; s >= 0; s--) n = this._events[s], n instanceof t.Part ? n.remove(e, i) : n.startOffset === e && (this.isUndef(i) || !this.isUndef(i) && n.value === i) && (this._events.splice(s, 1), n.dispose());
            return this
        }, t.Part.prototype.removeAll = function () {
            return this._forEach(function (t) {
                t.dispose()
            }), this._events = [], this
        }, t.Part.prototype.cancel = function (t) {
            return this._forEach(function (e) {
                e.cancel(t)
            }), this._state.cancel(t), this
        }, t.Part.prototype._forEach = function (e, i) {
            var s, n;
            for (i = this.defaultArg(i, this), s = this._events.length - 1; s >= 0; s--) n = this._events[s], n instanceof t.Part ? n._forEach(e, i) : e.call(i, n);
            return this
        }, t.Part.prototype._setAll = function (t, e) {
            this._forEach(function (i) {
                i[t] = e
            })
        }, t.Part.prototype._tick = function (t, e) {
            this.mute || this.callback(t, e)
        }, t.Part.prototype._testLoopBoundries = function (e) {
            e.startOffset < this._loopStart || e.startOffset >= this._loopEnd ? e.cancel() : e.state === t.State.Stopped && this._restartEvent(e)
        }, Object.defineProperty(t.Part.prototype, "probability", {
            get: function () {
                return this._probability
            },
            set: function (t) {
                this._probability = t, this._setAll("probability", t)
            }
        }), Object.defineProperty(t.Part.prototype, "humanize", {
            get: function () {
                return this._humanize
            },
            set: function (t) {
                this._humanize = t, this._setAll("humanize", t)
            }
        }), Object.defineProperty(t.Part.prototype, "loop", {
            get: function () {
                return this._loop
            },
            set: function (t) {
                this._loop = t, this._forEach(function (e) {
                    e._loopStart = this._loopStart, e._loopEnd = this._loopEnd, e.loop = t, this._testLoopBoundries(e)
                })
            }
        }), Object.defineProperty(t.Part.prototype, "loopEnd", {
            get: function () {
                return this.toNotation(this._loopEnd + "i")
            },
            set: function (t) {
                this._loopEnd = this.toTicks(t), this._loop && this._forEach(function (t) {
                    t.loopEnd = this.loopEnd, this._testLoopBoundries(t)
                })
            }
        }), Object.defineProperty(t.Part.prototype, "loopStart", {
            get: function () {
                return this.toNotation(this._loopStart + "i")
            },
            set: function (t) {
                this._loopStart = this.toTicks(t), this._loop && this._forEach(function (t) {
                    t.loopStart = this.loopStart, this._testLoopBoundries(t)
                })
            }
        }), Object.defineProperty(t.Part.prototype, "playbackRate", {
            get: function () {
                return this._playbackRate
            },
            set: function (t) {
                this._playbackRate = t, this._setAll("playbackRate", t)
            }
        }), Object.defineProperty(t.Part.prototype, "length", {
            get: function () {
                return this._events.length
            }
        }), t.Part.prototype.dispose = function () {
            return this.removeAll(), this._state.dispose(), this._state = null, this.callback = null, this._events = null, this
        }, t.Part
    }), Module(function (t) {
        return t.Pattern = function () {
            var e = this.optionsObject(arguments, ["callback", "events", "pattern"], t.Pattern.defaults);
            t.Loop.call(this, e), this._pattern = new t.CtrlPattern({
                values: e.events,
                type: e.pattern,
                index: e.index
            })
        }, t.extend(t.Pattern, t.Loop), t.Pattern.defaults = {
            pattern: t.CtrlPattern.Type.Up,
            events: []
        }, t.Pattern.prototype._tick = function (t) {
            this.callback(t, this._pattern.value), this._pattern.next()
        }, Object.defineProperty(t.Pattern.prototype, "index", {
            get: function () {
                return this._pattern.index
            },
            set: function (t) {
                this._pattern.index = t
            }
        }), Object.defineProperty(t.Pattern.prototype, "events", {
            get: function () {
                return this._pattern.values
            },
            set: function (t) {
                this._pattern.values = t
            }
        }), Object.defineProperty(t.Pattern.prototype, "value", {
            get: function () {
                return this._pattern.value
            }
        }), Object.defineProperty(t.Pattern.prototype, "pattern", {
            get: function () {
                return this._pattern.type
            },
            set: function (t) {
                this._pattern.type = t
            }
        }), t.Pattern.prototype.dispose = function () {
            t.Loop.prototype.dispose.call(this), this._pattern.dispose(), this._pattern = null
        }, t.Pattern
    }), Module(function (t) {
        return t.Sequence = function () {
            var e, i = this.optionsObject(arguments, ["callback", "events", "subdivision"], t.Sequence.defaults),
                s = i.events;
            if (delete i.events, t.Part.call(this, i), this._subdivision = this.toTicks(i.subdivision), this.isUndef(i.loopEnd) && !this.isUndef(s) && (this._loopEnd = s.length * this._subdivision), this._loop = !0, !this.isUndef(s)) for (e = 0; e < s.length; e++) this.add(e, s[e])
        }, t.extend(t.Sequence, t.Part), t.Sequence.defaults = {
            subdivision: "4n"
        }, Object.defineProperty(t.Sequence.prototype, "subdivision", {
            get: function () {
                return this.toNotation(this._subdivision + "i")
            }
        }), t.Sequence.prototype.at = function (e, i) {
            return this.isArray(i) && this.remove(e), t.Part.prototype.at.call(this, this._indexTime(e), i)
        }, t.Sequence.prototype.add = function (e, i) {
            if (null === i) return this;
            if (this.isArray(i)) {
                var s = Math.round(this._subdivision / i.length) + "i";
                i = new t.Sequence(this._tick.bind(this), i, s)
            }
            return t.Part.prototype.add.call(this, this._indexTime(e), i), this
        }, t.Sequence.prototype.remove = function (e, i) {
            return t.Part.prototype.remove.call(this, this._indexTime(e), i), this
        }, t.Sequence.prototype._indexTime = function (t) {
            return this.isTicks(t) ? t : t * this._subdivision + this.startOffset + "i"
        }, t.Sequence.prototype.dispose = function () {
            return t.Part.prototype.dispose.call(this), this
        }, t.Sequence
    }), Module(function (t) {
        return t.PulseOscillator = function () {
            var e = this.optionsObject(arguments, ["frequency", "width"], t.Oscillator.defaults);
            t.Source.call(this, e), this.width = new t.Signal(e.width, t.Type.NormalRange), this._widthGate = this.context.createGain(), this._sawtooth = new t.Oscillator({
                frequency: e.frequency,
                detune: e.detune,
                type: "sawtooth",
                phase: e.phase
            }), this.frequency = this._sawtooth.frequency, this.detune = this._sawtooth.detune, this._thresh = new t.WaveShaper(function (t) {
                return 0 > t ? -1 : 1
            }), this._sawtooth.chain(this._thresh, this.output), this.width.chain(this._widthGate, this._thresh), this._readOnly(["width", "frequency", "detune"])
        }, t.extend(t.PulseOscillator, t.Oscillator), t.PulseOscillator.defaults = {
            frequency: 440,
            detune: 0,
            phase: 0,
            width: .2
        }, t.PulseOscillator.prototype._start = function (t) {
            t = this.toSeconds(t), this._sawtooth.start(t), this._widthGate.gain.setValueAtTime(1, t)
        }, t.PulseOscillator.prototype._stop = function (t) {
            t = this.toSeconds(t), this._sawtooth.stop(t), this._widthGate.gain.setValueAtTime(0, t)
        }, Object.defineProperty(t.PulseOscillator.prototype, "phase", {
            get: function () {
                return this._sawtooth.phase
            },
            set: function (t) {
                this._sawtooth.phase = t
            }
        }), Object.defineProperty(t.PulseOscillator.prototype, "type", {
            get: function () {
                return "pulse"
            }
        }), Object.defineProperty(t.PulseOscillator.prototype, "partials", {
            get: function () {
                return []
            }
        }), t.PulseOscillator.prototype.dispose = function () {
            return t.Source.prototype.dispose.call(this), this._sawtooth.dispose(), this._sawtooth = null, this._writable(["width", "frequency", "detune"]), this.width.dispose(), this.width = null, this._widthGate.disconnect(), this._widthGate = null, this._widthGate = null, this._thresh.disconnect(), this._thresh = null, this.frequency = null, this.detune = null, this
        }, t.PulseOscillator
    }), Module(function (t) {
        return t.PWMOscillator = function () {
            var e = this.optionsObject(arguments, ["frequency", "modulationFrequency"], t.PWMOscillator.defaults);
            t.Source.call(this, e), this._pulse = new t.PulseOscillator(e.modulationFrequency), this._pulse._sawtooth.type = "sine", this._modulator = new t.Oscillator({
                frequency: e.frequency,
                detune: e.detune,
                phase: e.phase
            }), this._scale = new t.Multiply(1.01), this.frequency = this._modulator.frequency, this.detune = this._modulator.detune, this.modulationFrequency = this._pulse.frequency, this._modulator.chain(this._scale, this._pulse.width), this._pulse.connect(this.output), this._readOnly(["modulationFrequency", "frequency", "detune"])
        }, t.extend(t.PWMOscillator, t.Oscillator), t.PWMOscillator.defaults = {
            frequency: 440,
            detune: 0,
            phase: 0,
            modulationFrequency: .4
        }, t.PWMOscillator.prototype._start = function (t) {
            t = this.toSeconds(t), this._modulator.start(t), this._pulse.start(t)
        }, t.PWMOscillator.prototype._stop = function (t) {
            t = this.toSeconds(t), this._modulator.stop(t), this._pulse.stop(t)
        }, Object.defineProperty(t.PWMOscillator.prototype, "type", {
            get: function () {
                return "pwm"
            }
        }), Object.defineProperty(t.PWMOscillator.prototype, "partials", {
            get: function () {
                return []
            }
        }), Object.defineProperty(t.PWMOscillator.prototype, "phase", {
            get: function () {
                return this._modulator.phase
            },
            set: function (t) {
                this._modulator.phase = t
            }
        }), t.PWMOscillator.prototype.dispose = function () {
            return t.Source.prototype.dispose.call(this), this._pulse.dispose(), this._pulse = null, this._scale.dispose(), this._scale = null, this._modulator.dispose(), this._modulator = null, this._writable(["modulationFrequency", "frequency", "detune"]), this.frequency = null, this.detune = null, this.modulationFrequency = null, this
        }, t.PWMOscillator
    }), Module(function (t) {
        t.OmniOscillator = function () {
            var e = this.optionsObject(arguments, ["frequency", "type"], t.OmniOscillator.defaults);
            t.Source.call(this, e), this.frequency = new t.Signal(e.frequency, t.Type.Frequency), this.detune = new t.Signal(e.detune, t.Type.Cents), this._sourceType = void 0, this._oscillator = null, this.type = e.type, this.phase = e.phase, this._readOnly(["frequency", "detune"]), this.isArray(e.partials) && (this.partials = e.partials)
        }, t.extend(t.OmniOscillator, t.Oscillator), t.OmniOscillator.defaults = {
            frequency: 440,
            detune: 0,
            type: "sine",
            phase: 0,
            width: .4,
            modulationFrequency: .4
        };
        var e = {
            PulseOscillator: "PulseOscillator",
            PWMOscillator: "PWMOscillator",
            Oscillator: "Oscillator"
        };
        return t.OmniOscillator.prototype._start = function (t) {
            this._oscillator.start(t)
        }, t.OmniOscillator.prototype._stop = function (t) {
            this._oscillator.stop(t)
        }, Object.defineProperty(t.OmniOscillator.prototype, "type", {
            get: function () {
                return this._oscillator.type
            },
            set: function (i) {
                if (0 === i.indexOf("sine") || 0 === i.indexOf("square") || 0 === i.indexOf("triangle") || 0 === i.indexOf("sawtooth") || i === t.Oscillator.Type.Custom) this._sourceType !== e.Oscillator && (this._sourceType = e.Oscillator, this._createNewOscillator(t.Oscillator)), this._oscillator.type = i;
                else if ("pwm" === i) this._sourceType !== e.PWMOscillator && (this._sourceType = e.PWMOscillator, this._createNewOscillator(t.PWMOscillator));
                else {
                    if ("pulse" !== i) throw new Error("Tone.OmniOscillator does not support type " + i);
                    this._sourceType !== e.PulseOscillator && (this._sourceType = e.PulseOscillator, this._createNewOscillator(t.PulseOscillator))
                }
            }
        }), Object.defineProperty(t.OmniOscillator.prototype, "partials", {
            get: function () {
                return this._oscillator.partials
            },
            set: function (i) {
                this._sourceType !== e.Oscillator && (this.type = t.Oscillator.Type.Custom), this._oscillator.partials = i
            }
        }), t.OmniOscillator.prototype._createNewOscillator = function (e) {
            var i, s = this.now() + this.blockTime;
            null !== this._oscillator && (i = this._oscillator, i.stop(s), setTimeout(function () {
                i.dispose(), i = null
            }, 1e3 * this.blockTime)), this._oscillator = new e, this.frequency.connect(this._oscillator.frequency), this.detune.connect(this._oscillator.detune), this._oscillator.connect(this.output), this.state === t.State.Started && this._oscillator.start(s)
        }, Object.defineProperty(t.OmniOscillator.prototype, "phase", {
            get: function () {
                return this._oscillator.phase
            },
            set: function (t) {
                this._oscillator.phase = t
            }
        }), Object.defineProperty(t.OmniOscillator.prototype, "width", {
            get: function () {
                return this._sourceType === e.PulseOscillator ? this._oscillator.width : void 0
            }
        }), Object.defineProperty(t.OmniOscillator.prototype, "modulationFrequency", {
            get: function () {
                return this._sourceType === e.PWMOscillator ? this._oscillator.modulationFrequency : void 0
            }
        }), t.OmniOscillator.prototype.dispose = function () {
            return t.Source.prototype.dispose.call(this),
                this._writable(["frequency", "detune"]), this.detune.dispose(), this.detune = null, this.frequency.dispose(), this.frequency = null, this._oscillator.dispose(), this._oscillator = null, this._sourceType = null, this
        }, t.OmniOscillator
    }), Module(function (t) {
        return t.Instrument = function (e) {
            e = this.defaultArg(e, t.Instrument.defaults), this._volume = this.output = new t.Volume(e.volume), this.volume = this._volume.volume, this._readOnly("volume")
        }, t.extend(t.Instrument), t.Instrument.defaults = {
            volume: 0
        }, t.Instrument.prototype.triggerAttack = t.noOp, t.Instrument.prototype.triggerRelease = t.noOp, t.Instrument.prototype.triggerAttackRelease = function (t, e, i, s) {
            return i = this.toSeconds(i), e = this.toSeconds(e), this.triggerAttack(t, i, s), this.triggerRelease(i + e), this
        }, t.Instrument.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._volume.dispose(), this._volume = null, this._writable(["volume"]), this.volume = null, this
        }, t.Instrument
    }), Module(function (t) {
        return t.Monophonic = function (e) {
            e = this.defaultArg(e, t.Monophonic.defaults), t.Instrument.call(this, e), this.portamento = e.portamento
        }, t.extend(t.Monophonic, t.Instrument), t.Monophonic.defaults = {
            portamento: 0
        }, t.Monophonic.prototype.triggerAttack = function (t, e, i) {
            return e = this.toSeconds(e), this._triggerEnvelopeAttack(e, i), this.setNote(t, e), this
        }, t.Monophonic.prototype.triggerRelease = function (t) {
            return this._triggerEnvelopeRelease(t), this
        }, t.Monophonic.prototype._triggerEnvelopeAttack = function () {
        }, t.Monophonic.prototype._triggerEnvelopeRelease = function () {
        }, t.Monophonic.prototype.setNote = function (t, e) {
            var i, s;
            return e = this.toSeconds(e), this.portamento > 0 ? (i = this.frequency.value, this.frequency.setValueAtTime(i, e), s = this.toSeconds(this.portamento), this.frequency.exponentialRampToValueAtTime(t, e + s)) : this.frequency.setValueAtTime(t, e), this
        }, t.Monophonic
    }), Module(function (t) {
        return t.MonoSynth = function (e) {
            e = this.defaultArg(e, t.MonoSynth.defaults), t.Monophonic.call(this, e), this.oscillator = new t.OmniOscillator(e.oscillator), this.frequency = this.oscillator.frequency, this.detune = this.oscillator.detune, this.filter = new t.Filter(e.filter), this.filterEnvelope = new t.FrequencyEnvelope(e.filterEnvelope), this.envelope = new t.AmplitudeEnvelope(e.envelope), this.oscillator.chain(this.filter, this.envelope, this.output), this.oscillator.start(), this.filterEnvelope.connect(this.filter.frequency), this._readOnly(["oscillator", "frequency", "detune", "filter", "filterEnvelope", "envelope"])
        }, t.extend(t.MonoSynth, t.Monophonic), t.MonoSynth.defaults = {
            frequency: "C4",
            detune: 0,
            oscillator: {
                type: "square"
            },
            filter: {
                Q: 6,
                type: "lowpass",
                rolloff: -24
            },
            envelope: {
                attack: .005,
                decay: .1,
                sustain: .9,
                release: 1
            },
            filterEnvelope: {
                attack: .06,
                decay: .2,
                sustain: .5,
                release: 2,
                baseFrequency: 200,
                octaves: 7,
                exponent: 2
            }
        }, t.MonoSynth.prototype._triggerEnvelopeAttack = function (t, e) {
            return this.envelope.triggerAttack(t, e), this.filterEnvelope.triggerAttack(t), this
        }, t.MonoSynth.prototype._triggerEnvelopeRelease = function (t) {
            return this.envelope.triggerRelease(t), this.filterEnvelope.triggerRelease(t), this
        }, t.MonoSynth.prototype.dispose = function () {
            return t.Monophonic.prototype.dispose.call(this), this._writable(["oscillator", "frequency", "detune", "filter", "filterEnvelope", "envelope"]), this.oscillator.dispose(), this.oscillator = null, this.envelope.dispose(), this.envelope = null, this.filterEnvelope.dispose(), this.filterEnvelope = null, this.filter.dispose(), this.filter = null, this.frequency = null, this.detune = null, this
        }, t.MonoSynth
    }), Module(function (t) {
        return t.AMSynth = function (e) {
            e = this.defaultArg(e, t.AMSynth.defaults), t.Monophonic.call(this, e), this.carrier = new t.MonoSynth(e.carrier), this.carrier.volume.value = -10, this.modulator = new t.MonoSynth(e.modulator), this.modulator.volume.value = -10, this.frequency = new t.Signal(440, t.Type.Frequency), this.harmonicity = new t.Multiply(e.harmonicity), this.harmonicity.units = t.Type.Positive, this._modulationScale = new t.AudioToGain, this._modulationNode = this.context.createGain(), this.frequency.connect(this.carrier.frequency), this.frequency.chain(this.harmonicity, this.modulator.frequency), this.modulator.chain(this._modulationScale, this._modulationNode.gain), this.carrier.chain(this._modulationNode, this.output), this._readOnly(["carrier", "modulator", "frequency", "harmonicity"])
        }, t.extend(t.AMSynth, t.Monophonic), t.AMSynth.defaults = {
            harmonicity: 3,
            carrier: {
                volume: -10,
                oscillator: {
                    type: "sine"
                },
                envelope: {
                    attack: .01,
                    decay: .01,
                    sustain: 1,
                    release: .5
                },
                filterEnvelope: {
                    attack: .01,
                    decay: 0,
                    sustain: 1,
                    release: .5,
                    baseFrequency: 2e4,
                    octaves: 0
                },
                filter: {
                    Q: 6,
                    type: "lowpass",
                    rolloff: -24
                }
            },
            modulator: {
                volume: -10,
                oscillator: {
                    type: "square"
                },
                envelope: {
                    attack: 2,
                    decay: 0,
                    sustain: 1,
                    release: .5
                },
                filterEnvelope: {
                    attack: 4,
                    decay: .2,
                    sustain: .5,
                    release: .5,
                    baseFrequency: 20,
                    octaves: 6
                },
                filter: {
                    Q: 6,
                    type: "lowpass",
                    rolloff: -24
                }
            }
        }, t.AMSynth.prototype._triggerEnvelopeAttack = function (t, e) {
            return t = this.toSeconds(t), this.carrier.envelope.triggerAttack(t, e), this.modulator.envelope.triggerAttack(t), this.carrier.filterEnvelope.triggerAttack(t), this.modulator.filterEnvelope.triggerAttack(t), this
        }, t.AMSynth.prototype._triggerEnvelopeRelease = function (t) {
            return this.carrier.triggerRelease(t), this.modulator.triggerRelease(t), this
        }, t.AMSynth.prototype.dispose = function () {
            return t.Monophonic.prototype.dispose.call(this), this._writable(["carrier", "modulator", "frequency", "harmonicity"]), this.carrier.dispose(), this.carrier = null, this.modulator.dispose(), this.modulator = null, this.frequency.dispose(), this.frequency = null, this.harmonicity.dispose(), this.harmonicity = null, this._modulationScale.dispose(), this._modulationScale = null, this._modulationNode.disconnect(), this._modulationNode = null, this
        }, t.AMSynth
    }), Module(function (t) {
        return t.DrumSynth = function (e) {
            e = this.defaultArg(e, t.DrumSynth.defaults), t.Instrument.call(this, e), this.oscillator = new t.Oscillator(e.oscillator).start(), this.envelope = new t.AmplitudeEnvelope(e.envelope), this.octaves = e.octaves, this.pitchDecay = e.pitchDecay, this.oscillator.chain(this.envelope, this.output), this._readOnly(["oscillator", "envelope"])
        }, t.extend(t.DrumSynth, t.Instrument), t.DrumSynth.defaults = {
            pitchDecay: .05,
            octaves: 10,
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: .001,
                decay: .4,
                sustain: .01,
                release: 1.4,
                attackCurve: "exponential"
            }
        }, t.DrumSynth.prototype.triggerAttack = function (t, e, i) {
            e = this.toSeconds(e), t = this.toFrequency(t);
            var s = t * this.octaves;
            return this.oscillator.frequency.setValueAtTime(s, e), this.oscillator.frequency.exponentialRampToValueAtTime(t, e + this.toSeconds(this.pitchDecay)), this.envelope.triggerAttack(e, i), this
        }, t.DrumSynth.prototype.triggerRelease = function (t) {
            return this.envelope.triggerRelease(t), this
        }, t.DrumSynth.prototype.dispose = function () {
            return t.Instrument.prototype.dispose.call(this), this._writable(["oscillator", "envelope"]), this.oscillator.dispose(), this.oscillator = null, this.envelope.dispose(), this.envelope = null, this
        }, t.DrumSynth
    }), Module(function (t) {
        return t.DuoSynth = function (e) {
            e = this.defaultArg(e, t.DuoSynth.defaults), t.Monophonic.call(this, e), this.voice0 = new t.MonoSynth(e.voice0), this.voice0.volume.value = -10, this.voice1 = new t.MonoSynth(e.voice1), this.voice1.volume.value = -10, this._vibrato = new t.LFO(e.vibratoRate, -50, 50), this._vibrato.start(), this.vibratoRate = this._vibrato.frequency, this._vibratoGain = this.context.createGain(), this.vibratoAmount = new t.Param({
                param: this._vibratoGain.gain,
                units: t.Type.Positive,
                value: e.vibratoAmount
            }), this._vibratoDelay = this.toSeconds(e.vibratoDelay), this.frequency = new t.Signal(440, t.Type.Frequency), this.harmonicity = new t.Multiply(e.harmonicity), this.harmonicity.units = t.Type.Positive, this.frequency.connect(this.voice0.frequency), this.frequency.chain(this.harmonicity, this.voice1.frequency), this._vibrato.connect(this._vibratoGain), this._vibratoGain.fan(this.voice0.detune, this.voice1.detune), this.voice0.connect(this.output), this.voice1.connect(this.output), this._readOnly(["voice0", "voice1", "frequency", "vibratoAmount", "vibratoRate"])
        }, t.extend(t.DuoSynth, t.Monophonic), t.DuoSynth.defaults = {
            vibratoAmount: .5,
            vibratoRate: 5,
            vibratoDelay: 1,
            harmonicity: 1.5,
            voice0: {
                volume: -10,
                portamento: 0,
                oscillator: {
                    type: "sine"
                },
                filterEnvelope: {
                    attack: .01,
                    decay: 0,
                    sustain: 1,
                    release: .5
                },
                envelope: {
                    attack: .01,
                    decay: 0,
                    sustain: 1,
                    release: .5
                }
            },
            voice1: {
                volume: -10,
                portamento: 0,
                oscillator: {
                    type: "sine"
                },
                filterEnvelope: {
                    attack: .01,
                    decay: 0,
                    sustain: 1,
                    release: .5
                },
                envelope: {
                    attack: .01,
                    decay: 0,
                    sustain: 1,
                    release: .5
                }
            }
        }, t.DuoSynth.prototype._triggerEnvelopeAttack = function (t, e) {
            return t = this.toSeconds(t), this.voice0.envelope.triggerAttack(t, e), this.voice1.envelope.triggerAttack(t, e), this.voice0.filterEnvelope.triggerAttack(t), this.voice1.filterEnvelope.triggerAttack(t), this
        }, t.DuoSynth.prototype._triggerEnvelopeRelease = function (t) {
            return this.voice0.triggerRelease(t), this.voice1.triggerRelease(t), this
        }, t.DuoSynth.prototype.dispose = function () {
            return t.Monophonic.prototype.dispose.call(this), this._writable(["voice0", "voice1", "frequency", "vibratoAmount", "vibratoRate"]), this.voice0.dispose(), this.voice0 = null, this.voice1.dispose(), this.voice1 = null, this.frequency.dispose(), this.frequency = null, this._vibrato.dispose(), this._vibrato = null, this._vibratoGain.disconnect(), this._vibratoGain = null, this.harmonicity.dispose(), this.harmonicity = null, this.vibratoAmount.dispose(), this.vibratoAmount = null, this.vibratoRate = null, this
        }, t.DuoSynth
    }), Module(function (t) {
        return t.FMSynth = function (e) {
            e = this.defaultArg(e, t.FMSynth.defaults), t.Monophonic.call(this, e), this.carrier = new t.MonoSynth(e.carrier), this.carrier.volume.value = -10, this.modulator = new t.MonoSynth(e.modulator), this.modulator.volume.value = -10, this.frequency = new t.Signal(440, t.Type.Frequency), this.harmonicity = new t.Multiply(e.harmonicity), this.harmonicity.units = t.Type.Positive, this.modulationIndex = new t.Multiply(e.modulationIndex), this.modulationIndex.units = t.Type.Positive, this._modulationNode = this.context.createGain(), this.frequency.connect(this.carrier.frequency), this.frequency.chain(this.harmonicity, this.modulator.frequency), this.frequency.chain(this.modulationIndex, this._modulationNode), this.modulator.connect(this._modulationNode.gain), this._modulationNode.gain.value = 0, this._modulationNode.connect(this.carrier.frequency), this.carrier.connect(this.output), this._readOnly(["carrier", "modulator", "frequency", "harmonicity", "modulationIndex"])
        }, t.extend(t.FMSynth, t.Monophonic), t.FMSynth.defaults = {
            harmonicity: 3,
            modulationIndex: 10,
            carrier: {
                volume: -10,
                portamento: 0,
                oscillator: {
                    type: "sine"
                },
                envelope: {
                    attack: .01,
                    decay: 0,
                    sustain: 1,
                    release: .5
                },
                filterEnvelope: {
                    attack: .01,
                    decay: 0,
                    sustain: 1,
                    release: .5,
                    baseFrequency: 200,
                    octaves: 8
                }
            },
            modulator: {
                volume: -10,
                portamento: 0,
                oscillator: {
                    type: "triangle"
                },
                envelope: {
                    attack: .01,
                    decay: 0,
                    sustain: 1,
                    release: .5
                },
                filterEnvelope: {
                    attack: .01,
                    decay: 0,
                    sustain: 1,
                    release: .5,
                    baseFrequency: 600,
                    octaves: 5
                }
            }
        }, t.FMSynth.prototype._triggerEnvelopeAttack = function (t, e) {
            return t = this.toSeconds(t), this.carrier.envelope.triggerAttack(t, e), this.modulator.envelope.triggerAttack(t), this.carrier.filterEnvelope.triggerAttack(t), this.modulator.filterEnvelope.triggerAttack(t), this
        }, t.FMSynth.prototype._triggerEnvelopeRelease = function (t) {
            return this.carrier.triggerRelease(t), this.modulator.triggerRelease(t), this
        }, t.FMSynth.prototype.dispose = function () {
            return t.Monophonic.prototype.dispose.call(this), this._writable(["carrier", "modulator", "frequency", "harmonicity", "modulationIndex"]), this.carrier.dispose(), this.carrier = null, this.modulator.dispose(), this.modulator = null, this.frequency.dispose(), this.frequency = null, this.modulationIndex.dispose(), this.modulationIndex = null, this.harmonicity.dispose(), this.harmonicity = null, this._modulationNode.disconnect(), this._modulationNode = null, this
        }, t.FMSynth
    }), Module(function (t) {
        t.Noise = function () {
            var e = this.optionsObject(arguments, ["type"], t.Noise.defaults);
            t.Source.call(this, e), this._source = null, this._buffer = null, this._playbackRate = e.playbackRate, this.type = e.type
        }, t.extend(t.Noise, t.Source), t.Noise.defaults = {
            type: "white",
            playbackRate: 1
        }, Object.defineProperty(t.Noise.prototype, "type", {
            get: function () {
                return this._buffer === s ? "white" : this._buffer === i ? "brown" : this._buffer === e ? "pink" : void 0
            },
            set: function (n) {
                if (this.type !== n) {
                    switch (n) {
                        case "white":
                            this._buffer = s;
                            break;
                        case "pink":
                            this._buffer = e;
                            break;
                        case "brown":
                            this._buffer = i;
                            break;
                        default:
                            throw new Error("invalid noise type: " + n)
                    }
                    if (this.state === t.State.Started) {
                        var o = this.now() + this.blockTime;
                        this._stop(o), this._start(o)
                    }
                }
            }
        }), Object.defineProperty(t.Noise.prototype, "playbackRate", {
            get: function () {
                return this._playbackRate
            },
            set: function (t) {
                this._playbackRate = t, this._source && (this._source.playbackRate.value = t)
            }
        }), t.Noise.prototype._start = function (t) {
            this._source = this.context.createBufferSource(), this._source.buffer = this._buffer, this._source.loop = !0, this._source.playbackRate.value = this._playbackRate, this._source.connect(this.output), this._source.start(this.toSeconds(t))
        }, t.Noise.prototype._stop = function (t) {
            this._source && this._source.stop(this.toSeconds(t))
        }, t.Noise.prototype.dispose = function () {
            return t.Source.prototype.dispose.call(this), null !== this._source && (this._source.disconnect(), this._source = null), this._buffer = null, this
        };
        var e = null,
            i = null,
            s = null;
        return t._initAudioContext(function (t) {
            var n = t.sampleRate,
                o = 4 * n;
            e = function () {
                var e, i, s, r, a, l, h, u, c, p, f, d = t.createBuffer(2, o, n);
                for (e = 0; e < d.numberOfChannels; e++) for (i = d.getChannelData(e), s = r = a = l = h = u = c = 0, p = 0; o > p; p++) f = 2 * Math.random() - 1, s = .99886 * s + .0555179 * f, r = .99332 * r + .0750759 * f, a = .969 * a + .153852 * f, l = .8665 * l + .3104856 * f, h = .55 * h + .5329522 * f, u = -.7616 * u - .016898 * f, i[p] = s + r + a + l + h + u + c + .5362 * f, i[p] *= .11, c = .115926 * f;
                return d
            }(), i = function () {
                var e, i, s, r, a, l = t.createBuffer(2, o, n);
                for (e = 0; e < l.numberOfChannels; e++) for (i = l.getChannelData(e), s = 0, r = 0; o > r; r++) a = 2 * Math.random() - 1, i[r] = (s + .02 * a) / 1.02, s = i[r], i[r] *= 3.5;
                return l
            }(), s = function () {
                var e, i, s, r = t.createBuffer(2, o, n);
                for (e = 0; e < r.numberOfChannels; e++) for (i = r.getChannelData(e), s = 0; o > s; s++) i[s] = 2 * Math.random() - 1;
                return r
            }()
        }), t.Noise
    }), Module(function (t) {
        return t.NoiseSynth = function (e) {
            e = this.defaultArg(e, t.NoiseSynth.defaults), t.Instrument.call(this, e), this.noise = new t.Noise, this.filter = new t.Filter(e.filter), this.filterEnvelope = new t.FrequencyEnvelope(e.filterEnvelope), this.envelope = new t.AmplitudeEnvelope(e.envelope), this.noise.chain(this.filter, this.envelope, this.output), this.noise.start(), this.filterEnvelope.connect(this.filter.frequency), this._readOnly(["noise", "filter", "filterEnvelope", "envelope"])
        }, t.extend(t.NoiseSynth, t.Instrument), t.NoiseSynth.defaults = {
            noise: {
                type: "white"
            },
            filter: {
                Q: 6,
                type: "highpass",
                rolloff: -24
            },
            envelope: {
                attack: .005,
                decay: .1,
                sustain: 0
            },
            filterEnvelope: {
                attack: .06,
                decay: .2,
                sustain: 0,
                release: 2,
                baseFrequency: 20,
                octaves: 5
            }
        }, t.NoiseSynth.prototype.triggerAttack = function (t, e) {
            return this.envelope.triggerAttack(t, e), this.filterEnvelope.triggerAttack(t), this
        }, t.NoiseSynth.prototype.triggerRelease = function (t) {
            return this.envelope.triggerRelease(t), this.filterEnvelope.triggerRelease(t), this
        }, t.NoiseSynth.prototype.triggerAttackRelease = function (t, e, i) {
            return e = this.toSeconds(e), t = this.toSeconds(t), this.triggerAttack(e, i), this.triggerRelease(e + t), this
        }, t.NoiseSynth.prototype.dispose = function () {
            return t.Instrument.prototype.dispose.call(this), this._writable(["noise", "filter", "filterEnvelope", "envelope"]), this.noise.dispose(), this.noise = null, this.envelope.dispose(), this.envelope = null, this.filterEnvelope.dispose(), this.filterEnvelope = null, this.filter.dispose(), this.filter = null, this
        }, t.NoiseSynth
    }), Module(function (t) {
        return t.PluckSynth = function (e) {
            e = this.defaultArg(e, t.PluckSynth.defaults), t.Instrument.call(this, e), this._noise = new t.Noise("pink"), this.attackNoise = 1, this._lfcf = new t.LowpassCombFilter({
                resonance: e.resonance,
                dampening: e.dampening
            }), this.resonance = this._lfcf.resonance, this.dampening = this._lfcf.dampening, this._noise.connect(this._lfcf), this._lfcf.connect(this.output), this._readOnly(["resonance", "dampening"])
        }, t.extend(t.PluckSynth, t.Instrument), t.PluckSynth.defaults = {
            attackNoise: 1,
            dampening: 4e3,
            resonance: .9
        }, t.PluckSynth.prototype.triggerAttack = function (t, e) {
            t = this.toFrequency(t), e = this.toSeconds(e);
            var i = 1 / t;
            return this._lfcf.delayTime.setValueAtTime(i, e), this._noise.start(e), this._noise.stop(e + i * this.attackNoise), this
        }, t.PluckSynth.prototype.dispose = function () {
            return t.Instrument.prototype.dispose.call(this), this._noise.dispose(), this._lfcf.dispose(), this._noise = null, this._lfcf = null, this._writable(["resonance", "dampening"]), this.dampening = null, this.resonance = null, this
        }, t.PluckSynth
    }), Module(function (t) {
        return t.PolySynth = function () {
            var e, i, s;
            for (t.Instrument.call(this), e = this.optionsObject(arguments, ["polyphony", "voice"], t.PolySynth.defaults), this.voices = new Array(e.polyphony), this.stealVoices = !0, this._freeVoices = [], this._activeVoices = {}, i = 0; i < e.polyphony; i++) s = new e.voice(arguments[2], arguments[3]), this.voices[i] = s, s.connect(this.output);
            this._freeVoices = this.voices.slice(0)
        }, t.extend(t.PolySynth, t.Instrument), t.PolySynth.defaults = {
            polyphony: 4,
            voice: t.MonoSynth
        }, t.PolySynth.prototype.triggerAttack = function (t, e, i) {
            var s, n, o, r, a;
            for (Array.isArray(t) || (t = [t]), s = 0; s < t.length; s++) if (n = t[s], o = JSON.stringify(n), this._activeVoices.hasOwnProperty(o)) this._activeVoices[o].triggerAttack(n, e, i);
            else if (this._freeVoices.length > 0) r = this._freeVoices.shift(), r.triggerAttack(n, e, i), this._activeVoices[o] = r;
            else if (this.stealVoices) for (a in this._activeVoices) {
                this._activeVoices[a].triggerAttack(n, e, i);
                break
            }
            return this
        }, t.PolySynth.prototype.triggerAttackRelease = function (t, e, i, s) {
            return i = this.toSeconds(i), this.triggerAttack(t, i, s), this.triggerRelease(t, i + this.toSeconds(e)), this
        }, t.PolySynth.prototype.triggerRelease = function (t, e) {
            var i, s, n;
            for (Array.isArray(t) || (t = [t]), i = 0; i < t.length; i++) s = JSON.stringify(t[i]), n = this._activeVoices[s], n && (n.triggerRelease(e), this._freeVoices.push(n), delete this._activeVoices[s], n = null);
            return this
        }, t.PolySynth.prototype.set = function (t, e, i) {
            for (var s = 0; s < this.voices.length; s++) this.voices[s].set(t, e, i);
            return this
        }, t.PolySynth.prototype.get = function (t) {
            return this.voices[0].get(t)
        }, t.PolySynth.prototype.releaseAll = function (t) {
            for (var e = 0; e < this.voices.length; e++) this.voices[e].triggerRelease(t);
            return this
        }, t.PolySynth.prototype.dispose = function () {
            t.Instrument.prototype.dispose.call(this);
            for (var e = 0; e < this.voices.length; e++) this.voices[e].dispose(), this.voices[e] = null;
            return this.voices = null, this._activeVoices = null, this._freeVoices = null, this
        }, t.PolySynth
    }), Module(function (t) {
        return t.Player = function (e) {
            var i;
            e instanceof t.Buffer ? (e = e.get(), i = t.Player.defaults) : i = this.optionsObject(arguments, ["url", "onload"], t.Player.defaults), t.Source.call(this, i), this._source = null, this.autostart = i.autostart, this._buffer = new t.Buffer({
                url: i.url,
                onload: this._onload.bind(this, i.onload),
                reverse: i.reverse
            }), e instanceof AudioBuffer && this._buffer.set(e), this._loop = i.loop, this._loopStart = i.loopStart, this._loopEnd = i.loopEnd, this._playbackRate = i.playbackRate, this.retrigger = i.retrigger
        }, t.extend(t.Player, t.Source), t.Player.defaults = {
            onload: t.noOp,
            playbackRate: 1,
            loop: !1,
            autostart: !1,
            loopStart: 0,
            loopEnd: 0,
            retrigger: !1,
            reverse: !1
        }, t.Player.prototype.load = function (t, e) {
            return this._buffer.load(t, this._onload.bind(this, e)), this
        }, t.Player.prototype._onload = function (t) {
            t(this), this.autostart && this.start()
        }, t.Player.prototype._start = function (e, i, s) {
            if (!this._buffer.loaded) throw Error("tried to start Player before the buffer was loaded");
            return i = this._loop ? this.defaultArg(i, this._loopStart) : this.defaultArg(i, 0), i = this.toSeconds(i), s = this.defaultArg(s, this._buffer.duration - i), e = this.toSeconds(e), s = this.toSeconds(s), this._source = this.context.createBufferSource(), this._source.buffer = this._buffer.get(), this._loop ? (this._source.loop = this._loop, this._source.loopStart = this.toSeconds(this._loopStart), this._source.loopEnd = this.toSeconds(this._loopEnd)) : this._state.setStateAtTime(t.State.Stopped, e + s), this._source.playbackRate.value = this._playbackRate, this._source.connect(this.output), this._loop ? this._source.start(e, i) : this._source.start(e, i, s), this
        }, t.Player.prototype._stop = function (t) {
            return this._source && (this._source.stop(this.toSeconds(t)), this._source = null), this
        }, t.Player.prototype.setLoopPoints = function (t, e) {
            return this.loopStart = t, this.loopEnd = e, this
        }, Object.defineProperty(t.Player.prototype, "loopStart", {
            get: function () {
                return this._loopStart
            },
            set: function (t) {
                this._loopStart = t, this._source && (this._source.loopStart = this.toSeconds(t))
            }
        }), Object.defineProperty(t.Player.prototype, "loopEnd", {
            get: function () {
                return this._loopEnd
            },
            set: function (t) {
                this._loopEnd = t, this._source && (this._source.loopEnd = this.toSeconds(t))
            }
        }), Object.defineProperty(t.Player.prototype, "buffer", {
            get: function () {
                return this._buffer
            },
            set: function (t) {
                this._buffer.set(t)
            }
        }), Object.defineProperty(t.Player.prototype, "loop", {
            get: function () {
                return this._loop
            },
            set: function (t) {
                this._loop = t, this._source && (this._source.loop = t)
            }
        }), Object.defineProperty(t.Player.prototype, "playbackRate", {
            get: function () {
                return this._playbackRate
            },
            set: function (t) {
                this._playbackRate = t, this._source && (this._source.playbackRate.value = t)
            }
        }), Object.defineProperty(t.Player.prototype, "reverse", {
            get: function () {
                return this._buffer.reverse
            },
            set: function (t) {
                this._buffer.reverse = t
            }
        }), t.Player.prototype.dispose = function () {
            return t.Source.prototype.dispose.call(this), null !== this._source && (this._source.disconnect(), this._source = null), this._buffer.dispose(), this._buffer = null, this
        }, t.Player
    }), Module(function (t) {
        return t.Sampler = function (e, i) {
            i = this.defaultArg(i, t.Sampler.defaults), t.Instrument.call(this, i), this.player = new t.Player(i.player), this.player.retrigger = !0, this._buffers = {}, this.envelope = new t.AmplitudeEnvelope(i.envelope), this.filterEnvelope = new t.FrequencyEnvelope(i.filterEnvelope), this._sample = i.sample, this._pitch = i.pitch, this.filter = new t.Filter(i.filter), this._loadBuffers(e), this.pitch = i.pitch, this.player.chain(this.filter, this.envelope, this.output), this.filterEnvelope.connect(this.filter.frequency), this._readOnly(["player", "filterEnvelope", "envelope", "filter"])
        }, t.extend(t.Sampler, t.Instrument), t.Sampler.defaults = {
            sample: 0,
            pitch: 0,
            player: {
                loop: !1
            },
            envelope: {
                attack: .001,
                decay: 0,
                sustain: 1,
                release: .1
            },
            filterEnvelope: {
                attack: .001,
                decay: .001,
                sustain: 1,
                release: .5,
                baseFrequency: 20,
                octaves: 10
            },
            filter: {
                type: "lowpass"
            }
        }, t.Sampler.prototype._loadBuffers = function (e) {
            var i, s;
            if (this.isString(e)) this._buffers[0] = new t.Buffer(e, function () {
                this.sample = "0"
            }.bind(this));
            else {
                e = this._flattenUrls(e);
                for (i in e) this._sample = i, s = e[i], this._buffers[i] = new t.Buffer(s)
            }
        }, t.Sampler.prototype._flattenUrls = function (t) {
            var e, i, s, n = {};
            for (e in t) if (t.hasOwnProperty(e)) if (this.isObject(t[e])) {
                i = this._flattenUrls(t[e]);
                for (s in i) i.hasOwnProperty(s) && (n[e + "." + s] = i[s])
            } else n[e] = t[e];
            return n
        }, t.Sampler.prototype.triggerAttack = function (t, e, i) {
            return e = this.toSeconds(e), t && (this.sample = t), this.player.start(e), this.envelope.triggerAttack(e, i), this.filterEnvelope.triggerAttack(e), this
        }, t.Sampler.prototype.triggerRelease = function (t) {
            return t = this.toSeconds(t), this.filterEnvelope.triggerRelease(t), this.envelope.triggerRelease(t), this.player.stop(this.toSeconds(this.envelope.release) + t), this
        }, Object.defineProperty(t.Sampler.prototype, "sample", {
            get: function () {
                return this._sample
            },
            set: function (t) {
                if (!this._buffers.hasOwnProperty(t)) throw new Error("Sampler does not have a sample named " + t);
                this._sample = t, this.player.buffer = this._buffers[t]
            }
        }), Object.defineProperty(t.Sampler.prototype, "reverse", {
            get: function () {
                for (var t in this._buffers) return this._buffers[t].reverse
            },
            set: function (t) {
                for (var e in this._buffers) this._buffers[e].reverse = t
            }
        }), Object.defineProperty(t.Sampler.prototype, "pitch", {
            get: function () {
                return this._pitch
            },
            set: function (t) {
                this._pitch = t, this.player.playbackRate = this.intervalToFrequencyRatio(t)
            }
        }), t.Sampler.prototype.dispose = function () {
            t.Instrument.prototype.dispose.call(this), this._writable(["player", "filterEnvelope", "envelope", "filter"]), this.player.dispose(), this.filterEnvelope.dispose(), this.envelope.dispose(), this.filter.dispose(), this.player = null, this.filterEnvelope = null, this.envelope = null, this.filter = null;
            for (var e in this._buffers) this._buffers[e].dispose(), this._buffers[e] = null;
            return this._buffers = null, this
        }, t.Sampler
    }), Module(function (t) {
        return t.SimpleSynth = function (e) {
            e = this.defaultArg(e, t.SimpleSynth.defaults), t.Monophonic.call(this, e), this.oscillator = new t.OmniOscillator(e.oscillator), this.frequency = this.oscillator.frequency, this.detune = this.oscillator.detune, this.envelope = new t.AmplitudeEnvelope(e.envelope), this.oscillator.chain(this.envelope, this.output), this.oscillator.start(), this._readOnly(["oscillator", "frequency", "detune", "envelope"])
        }, t.extend(t.SimpleSynth, t.Monophonic), t.SimpleSynth.defaults = {
            oscillator: {
                type: "triangle"
            },
            envelope: {
                attack: .005,
                decay: .1,
                sustain: .3,
                release: 1
            }
        }, t.SimpleSynth.prototype._triggerEnvelopeAttack = function (t, e) {
            return this.envelope.triggerAttack(t, e), this
        }, t.SimpleSynth.prototype._triggerEnvelopeRelease = function (t) {
            return this.envelope.triggerRelease(t), this
        }, t.SimpleSynth.prototype.dispose = function () {
            return t.Monophonic.prototype.dispose.call(this), this._writable(["oscillator", "frequency", "detune", "envelope"]), this.oscillator.dispose(), this.oscillator = null, this.envelope.dispose(), this.envelope = null, this.frequency = null, this.detune = null, this
        }, t.SimpleSynth
    }), Module(function (t) {
        return t.SimpleAM = function (e) {
            e = this.defaultArg(e, t.SimpleAM.defaults), t.Monophonic.call(this, e), this.carrier = new t.SimpleSynth(e.carrier), this.modulator = new t.SimpleSynth(e.modulator), this.frequency = new t.Signal(440, t.Type.Frequency), this.harmonicity = new t.Multiply(e.harmonicity), this.harmonicity.units = t.Type.Positive, this._modulationScale = new t.AudioToGain, this._modulationNode = this.context.createGain(), this.frequency.connect(this.carrier.frequency), this.frequency.chain(this.harmonicity, this.modulator.frequency), this.modulator.chain(this._modulationScale, this._modulationNode.gain), this.carrier.chain(this._modulationNode, this.output), this._readOnly(["carrier", "modulator", "frequency", "harmonicity"])
        }, t.extend(t.SimpleAM, t.Monophonic), t.SimpleAM.defaults = {
            harmonicity: 3,
            carrier: {
                volume: -10,
                portamento: 0,
                oscillator: {
                    type: "sine"
                },
                envelope: {
                    attack: .01,
                    decay: .01,
                    sustain: 1,
                    release: .5
                }
            },
            modulator: {
                volume: -10,
                portamento: 0,
                oscillator: {
                    type: "sine"
                },
                envelope: {
                    attack: .5,
                    decay: .1,
                    sustain: 1,
                    release: .5
                }
            }
        }, t.SimpleAM.prototype._triggerEnvelopeAttack = function (t, e) {
            return t = this.toSeconds(t), this.carrier.envelope.triggerAttack(t, e), this.modulator.envelope.triggerAttack(t), this
        }, t.SimpleAM.prototype._triggerEnvelopeRelease = function (t) {
            return this.carrier.triggerRelease(t), this.modulator.triggerRelease(t), this
        }, t.SimpleAM.prototype.dispose = function () {
            return t.Monophonic.prototype.dispose.call(this), this._writable(["carrier", "modulator", "frequency", "harmonicity"]), this.carrier.dispose(), this.carrier = null, this.modulator.dispose(), this.modulator = null, this.frequency.dispose(), this.frequency = null, this.harmonicity.dispose(), this.harmonicity = null, this._modulationScale.dispose(), this._modulationScale = null, this._modulationNode.disconnect(), this._modulationNode = null, this
        }, t.SimpleAM
    }), Module(function (t) {
        return t.SimpleFM = function (e) {
            e = this.defaultArg(e, t.SimpleFM.defaults), t.Monophonic.call(this, e), this.carrier = new t.SimpleSynth(e.carrier), this.carrier.volume.value = -10, this.modulator = new t.SimpleSynth(e.modulator), this.modulator.volume.value = -10, this.frequency = new t.Signal(440, t.Type.Frequency), this.harmonicity = new t.Multiply(e.harmonicity), this.harmonicity.units = t.Type.Positive, this.modulationIndex = new t.Multiply(e.modulationIndex), this.modulationIndex.units = t.Type.Positive, this._modulationNode = this.context.createGain(), this.frequency.connect(this.carrier.frequency), this.frequency.chain(this.harmonicity, this.modulator.frequency), this.frequency.chain(this.modulationIndex, this._modulationNode), this.modulator.connect(this._modulationNode.gain), this._modulationNode.gain.value = 0, this._modulationNode.connect(this.carrier.frequency), this.carrier.connect(this.output), this._readOnly(["carrier", "modulator", "frequency", "harmonicity", "modulationIndex"])
        }, t.extend(t.SimpleFM, t.Monophonic), t.SimpleFM.defaults = {
            harmonicity: 3,
            modulationIndex: 10,
            carrier: {
                volume: -10,
                portamento: 0,
                oscillator: {
                    type: "sine"
                },
                envelope: {
                    attack: .01,
                    decay: 0,
                    sustain: 1,
                    release: .5
                }
            },
            modulator: {
                volume: -10,
                portamento: 0,
                oscillator: {
                    type: "triangle"
                },
                envelope: {
                    attack: .01,
                    decay: 0,
                    sustain: 1,
                    release: .5
                }
            }
        }, t.SimpleFM.prototype._triggerEnvelopeAttack = function (t, e) {
            return t = this.toSeconds(t), this.carrier.envelope.triggerAttack(t, e), this.modulator.envelope.triggerAttack(t), this
        }, t.SimpleFM.prototype._triggerEnvelopeRelease = function (t) {
            return this.carrier.triggerRelease(t), this.modulator.triggerRelease(t), this
        }, t.SimpleFM.prototype.dispose = function () {
            return t.Monophonic.prototype.dispose.call(this), this._writable(["carrier", "modulator", "frequency", "harmonicity", "modulationIndex"]), this.carrier.dispose(), this.carrier = null, this.modulator.dispose(), this.modulator = null, this.frequency.dispose(), this.frequency = null, this.modulationIndex.dispose(), this.modulationIndex = null, this.harmonicity.dispose(), this.harmonicity = null, this._modulationNode.disconnect(), this._modulationNode = null, this
        }, t.SimpleFM
    }), Module(function (t) {
        return navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia, t.ExternalInput = function () {
            var e = this.optionsObject(arguments, ["inputNum"], t.ExternalInput.defaults);
            t.Source.call(this, e), this._mediaStream = null, this._stream = null, this._constraints = {
                audio: !0
            }, this._inputNum = e.inputNum, this._gate = new t.Gain(0).connect(this.output)
        }, t.extend(t.ExternalInput, t.Source), t.ExternalInput.defaults = {
            inputNum: 0
        }, t.ExternalInput.prototype._getUserMedia = function (e) {
            if (!t.ExternalInput.supported) throw new Error("browser does not support 'getUserMedia'");
            t.ExternalInput.sources[this._inputNum] && (this._constraints = {
                audio: {
                    optional: [{
                        sourceId: t.ExternalInput.sources[this._inputNum].id
                    }]
                }
            }), navigator.getUserMedia(this._constraints, function (t) {
                this._onStream(t), e()
            }.bind(this), function (t) {
                e(t)
            })
        }, t.ExternalInput.prototype._onStream = function (t) {
            if (!this.isFunction(this.context.createMediaStreamSource)) throw new Error("browser does not support the 'MediaStreamSourceNode'");
            this._stream || (this._stream = t, this._mediaStream = this.context.createMediaStreamSource(t), this._mediaStream.connect(this._gate))
        }, t.ExternalInput.prototype.open = function (e) {
            return e = this.defaultArg(e, t.noOp), t.ExternalInput.getSources(function () {
                this._getUserMedia(e)
            }.bind(this)), this
        }, t.ExternalInput.prototype.close = function () {
            if (this._stream) {
                var t = this._stream.getTracks()[this._inputNum];
                this.isUndef(t) || t.stop(), this._stream = null
            }
            return this
        }, t.ExternalInput.prototype._start = function (t) {
            return t = this.toSeconds(t), this._gate.gain.setValueAtTime(1, t), this
        }, t.ExternalInput.prototype._stop = function (t) {
            return t = this.toSeconds(t), this._gate.gain.setValueAtTime(0, t), this
        }, t.ExternalInput.prototype.dispose = function () {
            return t.Source.prototype.dispose.call(this), this.close(), this._mediaStream && (this._mediaStream.disconnect(), this._mediaStream = null), this._constraints = null, this._gate.dispose(), this._gate = null, this
        }, t.ExternalInput.sources = [], t.ExternalInput._canGetSources = !t.prototype.isUndef(window.MediaStreamTrack) && t.prototype.isFunction(MediaStreamTrack.getSources), Object.defineProperty(t.ExternalInput, "supported", {
            get: function () {
                return t.prototype.isFunction(navigator.getUserMedia)
            }
        }), t.ExternalInput.getSources = function (e) {
            return 0 === t.ExternalInput.sources.length && t.ExternalInput._canGetSources ? MediaStreamTrack.getSources(function (i) {
                for (var s = 0; s < i.length; s++) "audio" === i[s].kind && (t.ExternalInput.sources[s] = i[s]);
                e(t.ExternalInput.sources)
            }) : e(t.ExternalInput.sources), this
        }, t.ExternalInput
    }), Module(function (t) {
        return t.Microphone = function () {
            t.ExternalInput.call(this, 0)
        }, t.extend(t.Microphone, t.ExternalInput), Object.defineProperty(t.Microphone, "supported", {
            get: function () {
                return t.ExternalInput.supported
            }
        }), t.Microphone
    }), Module(function (t) {
        return t.Clip = function (e, i) {
            if (e > i) {
                var s = e;
                e = i, i = s
            }
            this.min = this.input = new t.Min(i), this._readOnly("min"), this.max = this.output = new t.Max(e), this._readOnly("max"), this.min.connect(this.max)
        }, t.extend(t.Clip, t.SignalBase),
            t.Clip.prototype.dispose = function () {
                return t.prototype.dispose.call(this), this._writable("min"), this.min.dispose(), this.min = null, this._writable("max"), this.max.dispose(), this.max = null, this
            }, t.Clip
    }), Module(function (t) {
        return t.Normalize = function (e, i) {
            this._inputMin = this.defaultArg(e, 0), this._inputMax = this.defaultArg(i, 1), this._sub = this.input = new t.Add(0), this._div = this.output = new t.Multiply(1), this._sub.connect(this._div), this._setRange()
        }, t.extend(t.Normalize, t.SignalBase), Object.defineProperty(t.Normalize.prototype, "min", {
            get: function () {
                return this._inputMin
            },
            set: function (t) {
                this._inputMin = t, this._setRange()
            }
        }), Object.defineProperty(t.Normalize.prototype, "max", {
            get: function () {
                return this._inputMax
            },
            set: function (t) {
                this._inputMax = t, this._setRange()
            }
        }), t.Normalize.prototype._setRange = function () {
            this._sub.value = -this._inputMin, this._div.value = 1 / (this._inputMax - this._inputMin)
        }, t.Normalize.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._sub.dispose(), this._sub = null, this._div.dispose(), this._div = null, this
        }, t.Normalize
    }), Module(function (t) {
        t.Route = function (i) {
            var s, n;
            for (i = this.defaultArg(i, 2), t.call(this, 1, i), this.gate = new t.Signal(0), this._readOnly("gate"), s = 0; i > s; s++) n = new e(s), this.output[s] = n, this.gate.connect(n.selecter), this.input.connect(n)
        }, t.extend(t.Route, t.SignalBase), t.Route.prototype.select = function (t, e) {
            return t = Math.floor(t), this.gate.setValueAtTime(t, this.toSeconds(e)), this
        }, t.Route.prototype.dispose = function () {
            this._writable("gate"), this.gate.dispose(), this.gate = null;
            for (var e = 0; e < this.output.length; e++) this.output[e].dispose(), this.output[e] = null;
            return t.prototype.dispose.call(this), this
        };
        var e = function (e) {
            this.selecter = new t.Equal(e), this.gate = this.input = this.output = this.context.createGain(), this.selecter.connect(this.gate.gain)
        };
        return t.extend(e), e.prototype.dispose = function () {
            t.prototype.dispose.call(this), this.selecter.dispose(), this.selecter = null, this.gate.disconnect(), this.gate = null
        }, t.Route
    }), Module(function (t) {
        return t.Switch = function (e) {
            e = this.defaultArg(e, !1), t.call(this), this.gate = new t.Signal(0), this._readOnly("gate"), this._thresh = new t.GreaterThan(.5), this.input.connect(this.output), this.gate.chain(this._thresh, this.output.gain), e && this.open()
        }, t.extend(t.Switch, t.SignalBase), t.Switch.prototype.open = function (t) {
            return this.gate.setValueAtTime(1, this.toSeconds(t)), this
        }, t.Switch.prototype.close = function (t) {
            return this.gate.setValueAtTime(0, this.toSeconds(t)), this
        }, t.Switch.prototype.dispose = function () {
            return t.prototype.dispose.call(this), this._writable("gate"), this.gate.dispose(), this.gate = null, this._thresh.dispose(), this._thresh = null, this
        }, t.Switch
    }), "function" == typeof define && define.amd ? define(function () {
        return Tone
    }) : "object" == typeof module ? module.exports = Tone : root.Tone = Tone
}(this);