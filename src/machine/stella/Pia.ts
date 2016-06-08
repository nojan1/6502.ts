import Event from '../../tools/event/Event';
import ControlPanelInterface from './ControlPanelInterface';
import DigitalJoystickInterface from '../io/DigitalJoystickInterface';

class Pia {

    constructor(
        private _controlPanel: ControlPanelInterface,
        private _joystick0 : DigitalJoystickInterface,
        private _joystick1 : DigitalJoystickInterface
    ) {}

    reset(): void {
        for (let i = 0; i < 128; i++) this.ram[i] = 0;
        this._interruptFlag = 0;
        this._flagSetDuringThisCycle = false;
    }

    read(address: number): number {
        // RAM select = A9 low?
        if (address & 0x0200) {
            if (address & 0x0004) {
                return this._readTimer(address);
            } else {
                return this._readIo(address);
            }
        } else {
            // Mask out A7 - A15
            return this.ram[address & 0x7F];
        }
    }

    write(address: number, value: number) {
        // RAM select = A9 low?
        if (address & 0x0200) {
            if (address & 0x0004) {
                return this._writeTimer(address, value);
            } else {
                return this._writeIo(address, value);
            }
        } else {
            // Mask out A7 - A15
            this.ram[address & 0x7F] = value;
        }
    }

    cycle(): void {
        this._cycleTimer();
    }

    getDebugState(): string {
        return `timer base: ${this._timerBase}   timer sub: ${this._timerSub}   timer value: ${this._timerValue}`;
    }

    trap = new Event<Pia.TrapPayload>();

    ram = new Uint8Array(128);

    private _writeIo(address: number, value: number): void {
    }

    private _writeTimer(address: number, value: number): void {
        switch (address & 0x029F) {
            case Pia.Registers.t1024t:
                return this._setTimer(1024, value);

            case Pia.Registers.tim64t:
                return this._setTimer(64, value);

            case Pia.Registers.tim8t:
                return this._setTimer(8, value);

            case Pia.Registers.tim1t:
                return this._setTimer(1, value);
        }
    }

    private _setTimer(base: number, value: number): void {
        this._timerBase = base;
        this._timerSub = 0;
        this._timerValue = value;
        this._interruptFlag = 0;
    }

    private _readIo(address: number): number {
        switch (address & 0x0283) {
            case Pia.Registers.swcha:
                return (
                    (this._joystick1.getUp().read()      ? 0 : 0x01) |
                    (this._joystick1.getDown().read()    ? 0 : 0x02) |
                    (this._joystick1.getLeft().read()    ? 0 : 0x04) |
                    (this._joystick1.getRight().read()   ? 0 : 0x08) |
                    (this._joystick0.getUp().read()      ? 0 : 0x10) |
                    (this._joystick0.getDown().read()    ? 0 : 0x20) |
                    (this._joystick0.getLeft().read()    ? 0 : 0x40) |
                    (this._joystick0.getRight().read()   ? 0 : 0x80)
                );

            case Pia.Registers.swchb:
                return (
                    (this._controlPanel.getResetButton().read()         ? 0 : 0x01) |
                    (this._controlPanel.getSelectSwitch().read()        ? 0 : 0x02) |
                    (this._controlPanel.getColorSwitch().read()         ? 0 : 0x08) |
                    (this._controlPanel.getDifficultySwitchP0().read()  ? 0 : 0x40) |
                    (this._controlPanel.getDifficultySwitchP1().read()  ? 0 : 0x80)
                );
        }

        return 0;
    }

    private _readTimer(address: number): number {
        if (address & 0x01) {
            const flag = this._interruptFlag;

            if (!this._flagSetDuringThisCycle) {
                this._interruptFlag = 0;
            }

            return flag;
        } else {
            if (!this._flagSetDuringThisCycle) {
                this._interruptFlag = 0;
            }

            return this._timerValue;
        }
    }

    private _cycleTimer(): void {
        this._timerSub++;
        this._flagSetDuringThisCycle = false;

        if (this._timerSub === this._timerBase) {
            if (this._timerValue === 0) {
                this._timerValue = 0xFF;
                this._timerBase = 1;
                this._flagSetDuringThisCycle = true;
                this._interruptFlag = 0xFF;
            } else {
                this._timerValue--;
            }

            this._timerSub = 0;
        }
    }

    private _timerValue = 0;
    private _timerSub = 0;
    private _timerBase = 1;
    private _interruptFlag = 0;
    private _flagSetDuringThisCycle = false;
}

module Pia {
    export const enum Registers {
        swcha   = 0x280,
        swacnt  = 0x281,
        swchb   = 0x282,
        swncnt  = 0x283,
        intim   = 0x284,
        instat  = 0x285,
        tim1t   = 0x294,
        tim8t   = 0x295,
        tim64t  = 0x296,
        t1024t  = 0x297
    }

    export const enum TrapReason {invalidRead, invalidWrite}

    export class TrapPayload {
        constructor (
            public reason: TrapReason,
            public pia: Pia,
            public message?: string
        ) {}
    }
}

export default Pia;
