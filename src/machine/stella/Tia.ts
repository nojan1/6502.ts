import VideoOutputInterface from '../io/VideoOutputInterface';
import RGBASurfaceInterface from '../../tools/surface/RGBASurfaceInterface';
import Event from '../../tools/event/Event';
import Config from './Config';
import CpuInterface from '../cpu/CpuInterface';

const VISIBLE_WIDTH = 160,
    TOTAL_WIDTH = 228,
    VISIBLE_LINES_NTSC = 192,
    VISIBLE_LINES_PAL = 228,
    VBLANK_NTSC = 40,
    VBLANK_PAL = 48,
    OVERSCAN_NTSC = 30,
    OVERSCAN_PAL = 36;

class Tia implements VideoOutputInterface {

    constructor(
        private _config: Config
    ) {
        this._setupMetrics(this._config);
    }

    reset(): void {
        this._hClock = this._vClock = 0;
        this._vsync = this._frameInProgress = false;
        this._cpu.resume();
    }

    setCpu(cpu: CpuInterface): Tia {
        this._cpu = cpu;

        return this;
    }

    getWidth(): number {
        return this._metrics.visibleWidth;
    }

    getHeight(): number {
        return this._metrics.visibleLines;
    }

    setSurfaceFactory(factory: VideoOutputInterface.SurfaceFactoryInterface): Tia {
        this._surfaceFactory = factory;

        return this;
    }

    newFrame = new Event<RGBASurfaceInterface>();

    cycle(): void {
        this._hClock++;

        if (this._frameInProgress &&
            this._hClock >= this._metrics.hblank &&
            this._vClock >= this._metrics.vblank
        ) {
            this._renderPixel(this._hClock - this._metrics.hblank, this._vClock - this._metrics.vblank);
        }

        if (this._hClock === 228) {
            this._cpu.resume();

            this._hClock = 0;
            this._nextLine();
        }
    }

    read(address: number): number {
        return 0;
    }

    write(address: number, value: number): void {
        // Mask out A6 - A15
        address &= 0x3F;

        let masked = 0;

        switch (address) {
            case Tia.Registers.wsync:
                this._cpu.halt();
                break;

            case Tia.Registers.vsync:
                if ((value & 2) > 0 && !this._vsync) {
                    this._vsync = true;
                    this._finalizeFrame();
                } else if (this._vsync) {
                    this._vsync = false;
                    this._startFrame();
                }

                break;

            case Tia.Registers.enam0:
                this._enableM0 = (value & 2) > 0;
                break;

            case Tia.Registers.enam1:
                this._enableM1 = (value & 2) > 0;
                break;

            case Tia.Registers.hmm0:
                masked = (value & 0xF0) >> 4;
                this._moveM0 = (masked & 0x80) ? -masked : 0xF - masked + 1;
                break;

            case Tia.Registers.hmm0:
                masked = (value & 0xF0) >> 4;
                this._moveM1 = (masked & 0x80) ? -masked : 0xF - masked + 1;
                break;

            case Tia.Registers.hmove:
                this._posM0 += this._moveM0;
                this._posM1 += this._moveM1;

                if (this._posM0 >= this._metrics.visibleWidth) this._posM0 -= this._metrics.visibleWidth;
                if (this._posM0 < 0) this._posM0 = this._posM0 + this._metrics.visibleWidth;


                break;

        }

    }

    getDebugState(): string {
        return '' +
            `hclock: ${this._hClock}   vclock: ${this._vClock}    vsync: ${this._vsync ? 1 : 0}    frame pending: ${this._frameInProgress ? "yes" : "no"}`;
    }

    trap = new Event<Tia.TrapPayload>();

    private _setupMetrics(config: Config): void {
        switch (this._config.tvMode) {

            case Config.TvMode.secam:
            case Config.TvMode.pal:
                this._metrics = new Metrics(VISIBLE_LINES_PAL, VBLANK_PAL, OVERSCAN_PAL);
                break;

            case Config.TvMode.ntsc:
                this._metrics = new Metrics(VISIBLE_LINES_NTSC, VBLANK_NTSC, OVERSCAN_NTSC);
                break;

            default:
                throw new Error('invalid TV mode');
        }
    }

    private _nextLine() {
        this._vClock++;

        if (this._frameInProgress) {
            if (this._vClock >= this._metrics.overscanStart){
                this._finalizeFrame();
            }
        }
    }

    private _finalizeFrame(): void {
        if (this._frameInProgress) {
            if (this._surface) {
                this.newFrame.dispatch(this._surface);
                this._surface = null;
            }

            this._frameInProgress = false;
        }
    }

    private _startFrame(): void {
        if (this._surfaceFactory) {
            this._surface = this._surfaceFactory();
        }

        this._frameInProgress = true;
        this._vClock = 0;
    }

    private _renderPixel(x: number, y: number): void {
        if (!this._surface) {
            return;
        }

        let colorMP = -1;

        if (this._enableM0 && x >= this._posM0 && (x - this._posM0) < this._widthM0) {
            colorMP = this._colorM0;
        }
        if (this._enableM1 && x >= this._posM1 && (x - this._posM1) < this._widthM1) {
            colorMP = this._colorM1;
        }

        let color = this._colorBk;
        if (colorMP > 0) {
            color = colorMP;
        }

        this._surface.getBuffer()[y * this._metrics.visibleWidth + x] = color;
    }

    private _surfaceFactory: VideoOutputInterface.SurfaceFactoryInterface;
    private _surface: RGBASurfaceInterface = null;

    private _cpu: CpuInterface;

    private _metrics: Metrics;
    private _hClock = 0;
    private _vClock = 0;

    private _frameInProgress = false;
    private _vsync = false;

    private _colorBk = 0xFF000000;

    private _colorM0 = 0xFFFFFFFF;
    private _posM0 = 0;
    private _widthM0 = 1;
    private _enableM0 = false;

    private _colorM1 = 0xFFFFFFFF;
    private _posM1 = 0;
    private _widthM1 = 0;
    private _enableM1 = false;

    private _moveM0 = 0;
    private _moveM1 = 0;
}

module Tia {

    export const enum Registers {
        vsync   = 0x00,
        vblank  = 0x01,
        wsync   = 0x02,
        rsync   = 0x03,
        nusiz0  = 0x04,
        nusiz1  = 0x05,
        colup0  = 0x06,
        colup1  = 0x07,
        colupf  = 0x08,
        colubk  = 0x09,
        ctrlpf  = 0x0A,
        refp0   = 0x0B,
        refp1   = 0x0C,
        pf0     = 0x0D,
        pf1     = 0x0E,
        pf2     = 0x0F,
        resp1   = 0x10,
        resp2   = 0x11,
        resm0   = 0x12,
        resm1   = 0x13,
        resbl   = 0x14,
        audc0   = 0x15,
        audc1   = 0x16,
        audf0   = 0x17,
        audf1   = 0x18,
        audv0   = 0x19,
        audv1   = 0x1A,
        grp0    = 0x1B,
        grp1    = 0x1C,
        enam0   = 0x1D,
        enam1   = 0x1E,
        enambl  = 0x1F,
        hmp0    = 0x20,
        hmp1    = 0x21,
        hmm0    = 0x22,
        hmm1    = 0x23,
        hmbl    = 0x24,
        vdelp0  = 0x25,
        vdelp1  = 0x26,
        vdelbl  = 0x27,
        resmp0  = 0x28,
        resmp1  = 0x29,
        hmove   = 0x2A,
        hmclr   = 0x2B,
        cxclr   = 0x2C,
        cxm0p   = 0x30,
        cxm1p   = 0x31,
        cxp0fb  = 0x32,
        cxp1fb  = 0x33,
        cxm0fb  = 0x34,
        cxm1fb  = 0x35,
        cxblpf  = 0x36,
        cxppmm  = 0x37,
        inpt0   = 0x38,
        inpt1   = 0x39,
        inpt2   = 0x3A,
        inpt3   = 0x3B,
        inpt4   = 0x3C,
        inpt5   = 0x3D
    }

    export const enum TrapReason {invalidRead, invalidWrite}

    export class TrapPayload {
        constructor(
            public reason: TrapReason,
            public tia: Tia,
            public message?: string
        ) {}
    }
}

class Metrics {
    constructor(
        public visibleLines: number,
        public vblank: number,
        public overscan: number
    ) {
        this.visibleWidth = VISIBLE_WIDTH;
        this.totalWidth = TOTAL_WIDTH;
        this.hblank = TOTAL_WIDTH - VISIBLE_WIDTH;
        this.overscanStart = vblank + visibleLines;
    }

    public visibleWidth: number;
    public totalWidth: number;
    public overscanStart: number;
    public hblank: number;
    public maxX: number;
}


export default Tia;
