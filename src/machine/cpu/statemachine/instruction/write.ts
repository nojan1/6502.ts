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

import StateMachineInterface from '../StateMachineInterface';
import CpuInterface from '../../CpuInterface';
import ResultImpl from '../ResultImpl';
import { freezeImmutables, Immutable } from '../../../../tools/decorators';

class Write implements StateMachineInterface<number> {
    constructor(state: CpuInterface.State, operation: Write.Operation) {
        this._state = state;
        this._operation = operation;

        freezeImmutables(this);
    }

    @Immutable
    reset = (operand: number): StateMachineInterface.Result =>
        this._result.write(() => null, operand, this._operation(this._state));

    @Immutable private readonly _result = new ResultImpl();

    @Immutable private readonly _state: CpuInterface.State;
    @Immutable private readonly _operation: Write.Operation;
}

namespace Write {
    export interface Operation {
        (s: CpuInterface.State): number;
    }
}

export const write = (state: CpuInterface.State, operation: Write.Operation) => new Write(state, operation);
