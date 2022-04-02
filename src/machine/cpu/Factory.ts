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

import RngInterface from '../../tools/rng/GeneratorInterface';
import BusInterface from '../bus/BusInterface';
import CpuInterface from './CpuInterface';
import StateMachineCpu from './StateMachineCpu';
import BatchedAccessCpu from './BatchedAccessCpu';
import { CompilerFactory } from './statemachine/CompilerInterface';
import OpcodeResolver from './OpcodeResolver';
import Compiler65C02 from './statemachine/Compiler65C02';
import OpcodeResolver65C02 from './OpcodeResolve65C02';

class Factory {
    constructor(private _type: Factory.Type) {}

    create(
        bus: BusInterface,
        rng?: RngInterface,
        compilerFactory?: CompilerFactory,
        opcodeResolver?: OpcodeResolver
    ): CpuInterface {
        switch (this._type) {
            case Factory.Type.stateMachine:
                return new StateMachineCpu(bus, rng, compilerFactory, opcodeResolver);

            case Factory.Type.batchedAccess:
                return new BatchedAccessCpu(bus, rng, opcodeResolver);

            default:
                throw new Error('invalid CPU type');
        }
    }
}

namespace Factory {
    export enum Type {
        stateMachine,
        batchedAccess,
    }
}

export const Create65C02Cpu = (type: Factory.Type, bus: BusInterface, rng?: RngInterface) =>
    new Factory(type).create(
        bus,
        rng,
        (state, opcodeResolver) => new Compiler65C02(state, opcodeResolver),
        new OpcodeResolver65C02()
    );

export default Factory;
