/*
 *   This file is part of 6502.ts, an emulator for 6502 based systems built
 *   in Typescript
 *
 *   Copyright (c) 2014 -- 2020 Christian Speckner and contributors
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in all
 *   copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *   SOFTWARE.
 */

import { freezeImmutables, Immutable } from '../../../../tools/decorators';
import CpuInterface from '../../CpuInterface';
import StateMachineInterface from '../StateMachineInterface';
import ResultImpl from '../ResultImpl';

class Push implements StateMachineInterface {
    constructor(state: CpuInterface.State, operation: Push.Operation) {
        this._state = state;
        this._operation = operation;

        freezeImmutables(this);
    }

    @Immutable reset = (): StateMachineInterface.Result => this._result.read(this._dummyRead, this._state.p);

    @Immutable
    private _dummyRead = (): StateMachineInterface.Result =>
        this._result.write(this._push, 0x0100 + this._state.s, this._operation(this._state));

    @Immutable
    private _push = (): null => {
        this._state.s = (this._state.s - 1) & 0xff;

        return null;
    };

    @Immutable private readonly _result = new ResultImpl();

    @Immutable private readonly _state: CpuInterface.State;
    @Immutable private readonly _operation: Push.Operation;
}

namespace Push {
    export interface Operation {
        (s: CpuInterface.State): number;
    }
}

export const push = (state: CpuInterface.State, operation: Push.Operation) => new Push(state, operation);
