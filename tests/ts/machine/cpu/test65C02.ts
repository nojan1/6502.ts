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

import Runner from './Runner';
import CpuInterface from '../../../../src/machine/cpu/CpuInterface';
// import * as util from './util';

export function run(cpuFactory: Runner.CpuFactory) {
    suite('JMP-new', function () {
        test('absolute indexed indirect, pc', () =>
            Runner.create(cpuFactory, [0x7c, 0x00, 0xc0])
                .setState({
                    x: 0x5,
                })
                .poke({
                    '0xC005': 0x10,
                    '0xC006': 0x20,
                })
                .run()
                // .assertCycles(6)
                .assertState({
                    p: 0x2010,
                }));
    });

    suite('PHX', function () {
        test('implied', () =>
            Runner.create(cpuFactory, [0xda])
                .setState({
                    x: 0xff,
                    s: 0xff,
                })
                .run()
                .assertCycles(3)
                .assertState({
                    s: 0xfe,
                })
                .assertMemory({
                    '0x01FF': 0xff,
                }));

        test('implied, stack overflow', () =>
            Runner.create(cpuFactory, [0xda])
                .setState({
                    x: 0xe8,
                    s: 0x00,
                })
                .run()
                .assertCycles(3)
                .assertState({
                    s: 0xff,
                })
                .assertMemory({
                    '0x0100': 0xe8,
                }));
    });

    suite('PLX', function () {
        test('implied', () =>
            Runner.create(cpuFactory, [0xfa])
                .setState({
                    x: 0,
                    s: 0xfe,
                    flags: CpuInterface.Flags.e,
                })
                .poke({
                    '0x01FF': 0xff,
                })
                .run()
                .assertCycles(4)
                .assertState({
                    s: 0xff,
                    x: 0xff,
                    flags: CpuInterface.Flags.e | CpuInterface.Flags.n,
                }));

        test('implied, stack underflow', () =>
            Runner.create(cpuFactory, [0xfa])
                .setState({
                    x: 0xff,
                    s: 0xff,
                    flags: CpuInterface.Flags.e,
                })
                .poke({
                    '0x0100': 0x00,
                })
                .run()
                .assertCycles(4)
                .assertState({
                    s: 0x00,
                    x: 0x00,
                    flags: CpuInterface.Flags.e | CpuInterface.Flags.z,
                }));
    });

    suite('PHY', function () {
        test('implied', () =>
            Runner.create(cpuFactory, [0x5a])
                .setState({
                    y: 0xff,
                    s: 0xff,
                })
                .run()
                .assertCycles(3)
                .assertState({
                    s: 0xfe,
                })
                .assertMemory({
                    '0x01FF': 0xff,
                }));

        test('implied, stack overflow', () =>
            Runner.create(cpuFactory, [0x5a])
                .setState({
                    y: 0xe8,
                    s: 0x00,
                })
                .run()
                .assertCycles(3)
                .assertState({
                    s: 0xff,
                })
                .assertMemory({
                    '0x0100': 0xe8,
                }));
    });

    suite('PLY', function () {
        test('implied', () =>
            Runner.create(cpuFactory, [0x7a])
                .setState({
                    y: 0,
                    s: 0xfe,
                    flags: CpuInterface.Flags.e,
                })
                .poke({
                    '0x01FF': 0xff,
                })
                .run()
                .assertCycles(4)
                .assertState({
                    s: 0xff,
                    y: 0xff,
                    flags: CpuInterface.Flags.e | CpuInterface.Flags.n,
                }));

        test('implied, stack underflow', () =>
            Runner.create(cpuFactory, [0x7a])
                .setState({
                    y: 0xff,
                    s: 0xff,
                    flags: CpuInterface.Flags.e,
                })
                .poke({
                    '0x0100': 0x00,
                })
                .run()
                .assertCycles(4)
                .assertState({
                    s: 0x00,
                    y: 0x00,
                    flags: CpuInterface.Flags.e | CpuInterface.Flags.z,
                }));
    });
}
