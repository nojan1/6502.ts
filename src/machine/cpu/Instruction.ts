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

class Instruction {
    constructor(
        public readonly operation: Instruction.Operation,
        public readonly addressingMode: Instruction.AddressingMode,
        public readonly effectiveAddressingMode = addressingMode
    ) {}

    getSize(): number {
        switch (this.effectiveAddressingMode) {
            case Instruction.AddressingMode.immediate:
            case Instruction.AddressingMode.zeroPage:
            case Instruction.AddressingMode.zeroPageX:
            case Instruction.AddressingMode.zeroPageY:
            case Instruction.AddressingMode.indexedIndirectX:
            case Instruction.AddressingMode.indirectIndexedY:
            case Instruction.AddressingMode.relative:
                return 2;

            case Instruction.AddressingMode.absolute:
            case Instruction.AddressingMode.absoluteX:
            case Instruction.AddressingMode.absoluteY:
            case Instruction.AddressingMode.indirect:
                return 3;

            default:
                return 1;
        }
    }
}

namespace Instruction {
    export const enum Operation {
        adc,
        and,
        asl,
        bcc,
        bcs,
        beq,
        bit,
        bmi,
        bne,
        bpl,
        brk,
        bvc,
        bvs,
        clc,
        cld,
        cli,
        clv,
        cmp,
        cpx,
        cpy,
        dec,
        dex,
        dey,
        eor,
        inc,
        inx,
        iny,
        jmp,
        jsr,
        lda,
        ldx,
        ldy,
        lsr,
        nop,
        ora,
        pha,
        phx,
        phy,
        php,
        pla,
        plx,
        ply,
        plp,
        rol,
        ror,
        rti,
        rts,
        sbc,
        sec,
        sed,
        sei,
        sta,
        stx,
        sty,
        tax,
        tay,
        tsx,
        txa,
        txs,
        tya,
        // undocumented operations
        dop,
        top,
        alr,
        axs,
        dcp,
        lax,
        arr,
        slo,
        aax,
        lar,
        isc,
        aac,
        atx,
        rra,
        rla,
        invalid,
    }

    export enum OperationMap {
        adc,
        and,
        asl,
        bcc,
        bcs,
        beq,
        bit,
        bmi,
        bne,
        bpl,
        brk,
        bvc,
        bvs,
        clc,
        cld,
        cli,
        clv,
        cmp,
        cpx,
        cpy,
        dec,
        dex,
        dey,
        eor,
        inc,
        inx,
        iny,
        jmp,
        jsr,
        lda,
        ldx,
        ldy,
        lsr,
        nop,
        ora,
        pha,
        phx,
        phy,
        php,
        pla,
        plx,
        ply,
        plp,
        rol,
        ror,
        rti,
        rts,
        sbc,
        sec,
        sed,
        sei,
        sta,
        stx,
        sty,
        tax,
        tay,
        tsx,
        txa,
        txs,
        tya,
        // undocumented operations
        dop,
        top,
        alr,
        axs,
        dcp,
        lax,
        arr,
        slo,
        aax,
        lar,
        isc,
        aac,
        atx,
        rra,
        rla,
        invalid,
    }

    export const enum AddressingMode {
        implied,
        immediate,
        zeroPage,
        absolute,
        indirect,
        relative,
        zeroPageX,
        absoluteX,
        indexedIndirectX,
        zeroPageY,
        absoluteY,
        indirectIndexedY,
        invalid,
    }

    // export const opcodes = new Array<Instruction>(256);
    export namespace __init {}
}

export { Instruction as default };
