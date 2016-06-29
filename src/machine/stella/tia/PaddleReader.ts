import Paddle from '../../io/Paddle';

const C = 68e-9,            // capacitor
    RPOT = 1e6,             // total paddle resistance
    R0 = 1.8e3,             // series resistor
    U = 5,                  // supply voltage
    LINES_FULL = 380;       // treshold voltage in terms of scanline count

// We only use the fourth order approximation for the exponential; should give
// the exact trip point up to a few percent.
function exp(x: number): number {
    const x2 = x * x / 2,
        x3 = x2 * x / 3,
        x4 = x3 * x / 4;

    return 1 + x + x2 + x3 + x4;
}

export default class PaddleReader {

    constructor(
        protected _clockFreq: number,
        protected _timestampRef: () => number,
        protected _paddle: Paddle
    ) {
        this._uThresh = U * (1 - Math.exp(-LINES_FULL * 228 / this._clockFreq  / (RPOT + R0) / C));

        this._paddle.valueChanged.addHandler((value: number) => {
            this._updateValue();
            this._value = value;
        });

        this.reset();
    }

    reset(): void {
        this._u = 0;
        this._value = this._paddle.getValue();
        this._dumped = false;
        this._timestamp = this._timestampRef();
    }

    vblank(value: number): void {
        const oldValue = this._dumped;

        if (value & 0x80) {
            this._dumped = true;
            this._u = 0;
        } else if (oldValue) {
            this._dumped = false;
            this._timestamp = this._timestampRef();
        }

    }

    inpt(): number {
        this._updateValue();

        const state = this._dumped ? false : this._u >= this._uThresh;

        return state ? 0x80 : 0;
    }

    protected _updateValue(): void {
        if (this._dumped) {
            return;
        }

        const timestamp = this._timestampRef();

        // Update the voltage with the integral between the two timestamps
        this._u = U * (1 - (1 - this._u / U) *
            exp(-(timestamp - this._timestamp) / (this._value * RPOT + R0) / C / this._clockFreq));

        this._timestamp = timestamp;
    }

    protected _uThresh = 0;
    protected _u = 0;
    protected _dumped = false;
    protected _value = 0.5;
    protected _timestamp = 0;

}