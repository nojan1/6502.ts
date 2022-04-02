import Instruction from './Instruction';

class OpcodeResolver {
    private _opcodes: Array<Instruction>;

    constructor() {
        this._opcodes = new Array<Instruction>(256);

        for (let i = 0; i < 256; i++) {
            this._opcodes[i] = new Instruction(Instruction.Operation.invalid, Instruction.AddressingMode.invalid);
        }

        let operation: Instruction.Operation, addressingMode: Instruction.AddressingMode, opcode: number;

        for (let i = 0; i < 8; i++) {
            switch (i) {
                case 0:
                    operation = Instruction.Operation.ora;
                    break;
                case 1:
                    operation = Instruction.Operation.and;
                    break;
                case 2:
                    operation = Instruction.Operation.eor;
                    break;
                case 3:
                    operation = Instruction.Operation.adc;
                    break;
                case 4:
                    operation = Instruction.Operation.sta;
                    break;
                case 5:
                    operation = Instruction.Operation.lda;
                    break;
                case 6:
                    operation = Instruction.Operation.cmp;
                    break;
                case 7:
                    operation = Instruction.Operation.sbc;
                    break;
            }
            for (let j = 0; j < 8; j++) {
                switch (j) {
                    case 0:
                        addressingMode = Instruction.AddressingMode.indexedIndirectX;
                        break;
                    case 1:
                        addressingMode = Instruction.AddressingMode.zeroPage;
                        break;
                    case 2:
                        addressingMode = Instruction.AddressingMode.immediate;
                        break;
                    case 3:
                        addressingMode = Instruction.AddressingMode.absolute;
                        break;
                    case 4:
                        addressingMode = Instruction.AddressingMode.indirectIndexedY;
                        break;
                    case 5:
                        addressingMode = Instruction.AddressingMode.zeroPageX;
                        break;
                    case 6:
                        addressingMode = Instruction.AddressingMode.absoluteY;
                        break;
                    case 7:
                        addressingMode = Instruction.AddressingMode.absoluteX;
                        break;
                }

                if (
                    operation === Instruction.Operation.sta &&
                    addressingMode === Instruction.AddressingMode.immediate
                ) {
                    addressingMode = Instruction.AddressingMode.invalid;
                }

                if (
                    operation !== Instruction.Operation.invalid &&
                    addressingMode !== Instruction.AddressingMode.invalid
                ) {
                    opcode = (i << 5) | (j << 2) | 1;
                    this._opcodes[opcode] = new Instruction(operation, addressingMode);
                }
            }
        }

        this.set(0x06, Instruction.Operation.asl, Instruction.AddressingMode.zeroPage);
        this.set(0x0a, Instruction.Operation.asl, Instruction.AddressingMode.implied);
        this.set(0x0e, Instruction.Operation.asl, Instruction.AddressingMode.absolute);
        this.set(0x16, Instruction.Operation.asl, Instruction.AddressingMode.zeroPageX);
        this.set(0x1e, Instruction.Operation.asl, Instruction.AddressingMode.absoluteX);

        this.set(0x26, Instruction.Operation.rol, Instruction.AddressingMode.zeroPage);
        this.set(0x2a, Instruction.Operation.rol, Instruction.AddressingMode.implied);
        this.set(0x2e, Instruction.Operation.rol, Instruction.AddressingMode.absolute);
        this.set(0x36, Instruction.Operation.rol, Instruction.AddressingMode.zeroPageX);
        this.set(0x3e, Instruction.Operation.rol, Instruction.AddressingMode.absoluteX);

        this.set(0x46, Instruction.Operation.lsr, Instruction.AddressingMode.zeroPage);
        this.set(0x4a, Instruction.Operation.lsr, Instruction.AddressingMode.implied);
        this.set(0x4e, Instruction.Operation.lsr, Instruction.AddressingMode.absolute);
        this.set(0x56, Instruction.Operation.lsr, Instruction.AddressingMode.zeroPageX);
        this.set(0x5e, Instruction.Operation.lsr, Instruction.AddressingMode.absoluteX);

        this.set(0x66, Instruction.Operation.ror, Instruction.AddressingMode.zeroPage);
        this.set(0x6a, Instruction.Operation.ror, Instruction.AddressingMode.implied);
        this.set(0x6e, Instruction.Operation.ror, Instruction.AddressingMode.absolute);
        this.set(0x76, Instruction.Operation.ror, Instruction.AddressingMode.zeroPageX);
        this.set(0x7e, Instruction.Operation.ror, Instruction.AddressingMode.absoluteX);

        this.set(0x86, Instruction.Operation.stx, Instruction.AddressingMode.zeroPage);
        this.set(0x8e, Instruction.Operation.stx, Instruction.AddressingMode.absolute);
        this.set(0x96, Instruction.Operation.stx, Instruction.AddressingMode.zeroPageY);

        this.set(0xa2, Instruction.Operation.ldx, Instruction.AddressingMode.immediate);
        this.set(0xa6, Instruction.Operation.ldx, Instruction.AddressingMode.zeroPage);
        this.set(0xae, Instruction.Operation.ldx, Instruction.AddressingMode.absolute);
        this.set(0xb6, Instruction.Operation.ldx, Instruction.AddressingMode.zeroPageY);
        this.set(0xbe, Instruction.Operation.ldx, Instruction.AddressingMode.absoluteY);

        this.set(0xc6, Instruction.Operation.dec, Instruction.AddressingMode.zeroPage);
        this.set(0xce, Instruction.Operation.dec, Instruction.AddressingMode.absolute);
        this.set(0xd6, Instruction.Operation.dec, Instruction.AddressingMode.zeroPageX);
        this.set(0xde, Instruction.Operation.dec, Instruction.AddressingMode.absoluteX);

        this.set(0xe6, Instruction.Operation.inc, Instruction.AddressingMode.zeroPage);
        this.set(0xee, Instruction.Operation.inc, Instruction.AddressingMode.absolute);
        this.set(0xf6, Instruction.Operation.inc, Instruction.AddressingMode.zeroPageX);
        this.set(0xfe, Instruction.Operation.inc, Instruction.AddressingMode.absoluteX);

        this.set(0x24, Instruction.Operation.bit, Instruction.AddressingMode.zeroPage);
        this.set(0x2c, Instruction.Operation.bit, Instruction.AddressingMode.absolute);

        this.set(0x4c, Instruction.Operation.jmp, Instruction.AddressingMode.absolute);
        this.set(0x6c, Instruction.Operation.jmp, Instruction.AddressingMode.indirect);

        this.set(0x84, Instruction.Operation.sty, Instruction.AddressingMode.zeroPage);
        this.set(0x8c, Instruction.Operation.sty, Instruction.AddressingMode.absolute);
        this.set(0x94, Instruction.Operation.sty, Instruction.AddressingMode.zeroPageX);

        this.set(0xa0, Instruction.Operation.ldy, Instruction.AddressingMode.immediate);
        this.set(0xa4, Instruction.Operation.ldy, Instruction.AddressingMode.zeroPage);
        this.set(0xac, Instruction.Operation.ldy, Instruction.AddressingMode.absolute);
        this.set(0xb4, Instruction.Operation.ldy, Instruction.AddressingMode.zeroPageX);
        this.set(0xbc, Instruction.Operation.ldy, Instruction.AddressingMode.absoluteX);

        this.set(0xc0, Instruction.Operation.cpy, Instruction.AddressingMode.immediate);
        this.set(0xc4, Instruction.Operation.cpy, Instruction.AddressingMode.zeroPage);
        this.set(0xcc, Instruction.Operation.cpy, Instruction.AddressingMode.absolute);

        this.set(0xe0, Instruction.Operation.cpx, Instruction.AddressingMode.immediate);
        this.set(0xe4, Instruction.Operation.cpx, Instruction.AddressingMode.zeroPage);
        this.set(0xec, Instruction.Operation.cpx, Instruction.AddressingMode.absolute);

        this.set(0x10, Instruction.Operation.bpl, Instruction.AddressingMode.relative);
        this.set(0x30, Instruction.Operation.bmi, Instruction.AddressingMode.relative);
        this.set(0x50, Instruction.Operation.bvc, Instruction.AddressingMode.relative);
        this.set(0x70, Instruction.Operation.bvs, Instruction.AddressingMode.relative);
        this.set(0x90, Instruction.Operation.bcc, Instruction.AddressingMode.relative);
        this.set(0xb0, Instruction.Operation.bcs, Instruction.AddressingMode.relative);
        this.set(0xd0, Instruction.Operation.bne, Instruction.AddressingMode.relative);
        this.set(0xf0, Instruction.Operation.beq, Instruction.AddressingMode.relative);

        this.set(0x00, Instruction.Operation.brk, Instruction.AddressingMode.implied);
        this.set(
            0x20,
            Instruction.Operation.jsr,
            Instruction.AddressingMode.implied,
            Instruction.AddressingMode.absolute
        );
        this.set(0x40, Instruction.Operation.rti, Instruction.AddressingMode.implied);
        this.set(0x60, Instruction.Operation.rts, Instruction.AddressingMode.implied);
        this.set(0x08, Instruction.Operation.php, Instruction.AddressingMode.implied);
        this.set(0x28, Instruction.Operation.plp, Instruction.AddressingMode.implied);
        this.set(0x48, Instruction.Operation.pha, Instruction.AddressingMode.implied);
        this.set(0x68, Instruction.Operation.pla, Instruction.AddressingMode.implied);
        this.set(0x88, Instruction.Operation.dey, Instruction.AddressingMode.implied);
        this.set(0xa8, Instruction.Operation.tay, Instruction.AddressingMode.implied);
        this.set(0xc8, Instruction.Operation.iny, Instruction.AddressingMode.implied);
        this.set(0xe8, Instruction.Operation.inx, Instruction.AddressingMode.implied);
        this.set(0x18, Instruction.Operation.clc, Instruction.AddressingMode.implied);
        this.set(0x38, Instruction.Operation.sec, Instruction.AddressingMode.implied);
        this.set(0x58, Instruction.Operation.cli, Instruction.AddressingMode.implied);
        this.set(0x78, Instruction.Operation.sei, Instruction.AddressingMode.implied);
        this.set(0x98, Instruction.Operation.tya, Instruction.AddressingMode.implied);
        this.set(0xb8, Instruction.Operation.clv, Instruction.AddressingMode.implied);
        this.set(0xd8, Instruction.Operation.cld, Instruction.AddressingMode.implied);
        this.set(0xf8, Instruction.Operation.sed, Instruction.AddressingMode.implied);
        this.set(0x8a, Instruction.Operation.txa, Instruction.AddressingMode.implied);
        this.set(0x9a, Instruction.Operation.txs, Instruction.AddressingMode.implied);
        this.set(0xaa, Instruction.Operation.tax, Instruction.AddressingMode.implied);
        this.set(0xba, Instruction.Operation.tsx, Instruction.AddressingMode.implied);
        this.set(0xca, Instruction.Operation.dex, Instruction.AddressingMode.implied);
        this.set(0xea, Instruction.Operation.nop, Instruction.AddressingMode.implied);

        // instructions for undocumented opcodes
        this.set(0x1a, Instruction.Operation.nop, Instruction.AddressingMode.implied);
        this.set(0x3a, Instruction.Operation.nop, Instruction.AddressingMode.implied);
        this.set(0x5a, Instruction.Operation.nop, Instruction.AddressingMode.implied);
        this.set(0x7a, Instruction.Operation.nop, Instruction.AddressingMode.implied);
        this.set(0xda, Instruction.Operation.nop, Instruction.AddressingMode.implied);
        this.set(0xfa, Instruction.Operation.nop, Instruction.AddressingMode.implied);

        this.set(0x04, Instruction.Operation.dop, Instruction.AddressingMode.zeroPage);
        this.set(0x14, Instruction.Operation.dop, Instruction.AddressingMode.zeroPageX);
        this.set(0x34, Instruction.Operation.dop, Instruction.AddressingMode.zeroPageX);
        this.set(0x44, Instruction.Operation.dop, Instruction.AddressingMode.zeroPage);
        this.set(0x54, Instruction.Operation.dop, Instruction.AddressingMode.zeroPageX);
        this.set(0x64, Instruction.Operation.dop, Instruction.AddressingMode.zeroPage);
        this.set(0x74, Instruction.Operation.dop, Instruction.AddressingMode.zeroPageX);
        this.set(0x80, Instruction.Operation.dop, Instruction.AddressingMode.immediate);
        this.set(0x82, Instruction.Operation.dop, Instruction.AddressingMode.immediate);
        this.set(0x89, Instruction.Operation.dop, Instruction.AddressingMode.immediate);
        this.set(0xc2, Instruction.Operation.dop, Instruction.AddressingMode.immediate);
        this.set(0xd4, Instruction.Operation.dop, Instruction.AddressingMode.zeroPageX);
        this.set(0xe2, Instruction.Operation.dop, Instruction.AddressingMode.immediate);
        this.set(0xf4, Instruction.Operation.dop, Instruction.AddressingMode.zeroPageX);

        this.set(0x0c, Instruction.Operation.top, Instruction.AddressingMode.absolute);
        this.set(0x1c, Instruction.Operation.top, Instruction.AddressingMode.absoluteX);
        this.set(0x3c, Instruction.Operation.top, Instruction.AddressingMode.absoluteX);
        this.set(0x5c, Instruction.Operation.top, Instruction.AddressingMode.absoluteX);
        this.set(0x7c, Instruction.Operation.top, Instruction.AddressingMode.absoluteX);
        this.set(0xdc, Instruction.Operation.top, Instruction.AddressingMode.absoluteX);
        this.set(0xfc, Instruction.Operation.top, Instruction.AddressingMode.absoluteX);

        this.set(0xeb, Instruction.Operation.sbc, Instruction.AddressingMode.immediate);

        this.set(0x4b, Instruction.Operation.alr, Instruction.AddressingMode.immediate);

        this.set(0xcb, Instruction.Operation.axs, Instruction.AddressingMode.immediate);

        this.set(0xc7, Instruction.Operation.dcp, Instruction.AddressingMode.zeroPage);
        this.set(0xd7, Instruction.Operation.dcp, Instruction.AddressingMode.zeroPageX);
        this.set(0xcf, Instruction.Operation.dcp, Instruction.AddressingMode.absolute);
        this.set(0xdf, Instruction.Operation.dcp, Instruction.AddressingMode.absoluteX);
        this.set(0xdb, Instruction.Operation.dcp, Instruction.AddressingMode.absoluteY);
        this.set(0xc3, Instruction.Operation.dcp, Instruction.AddressingMode.indexedIndirectX);
        this.set(0xd3, Instruction.Operation.dcp, Instruction.AddressingMode.indirectIndexedY);

        this.set(0xa7, Instruction.Operation.lax, Instruction.AddressingMode.zeroPage);
        this.set(0xb7, Instruction.Operation.lax, Instruction.AddressingMode.zeroPageY);
        this.set(0xaf, Instruction.Operation.lax, Instruction.AddressingMode.absolute);
        this.set(0xbf, Instruction.Operation.lax, Instruction.AddressingMode.absoluteY);
        this.set(0xa3, Instruction.Operation.lax, Instruction.AddressingMode.indexedIndirectX);
        this.set(0xb3, Instruction.Operation.lax, Instruction.AddressingMode.indirectIndexedY);

        this.set(0x6b, Instruction.Operation.arr, Instruction.AddressingMode.immediate);

        this.set(0x07, Instruction.Operation.slo, Instruction.AddressingMode.zeroPage);
        this.set(0x17, Instruction.Operation.slo, Instruction.AddressingMode.zeroPageX);
        this.set(0x0f, Instruction.Operation.slo, Instruction.AddressingMode.absolute);
        this.set(0x1f, Instruction.Operation.slo, Instruction.AddressingMode.absoluteX);
        this.set(0x1b, Instruction.Operation.slo, Instruction.AddressingMode.absoluteY);
        this.set(0x03, Instruction.Operation.slo, Instruction.AddressingMode.indexedIndirectX);
        this.set(0x13, Instruction.Operation.slo, Instruction.AddressingMode.indirectIndexedY);

        this.set(0x87, Instruction.Operation.aax, Instruction.AddressingMode.zeroPage);
        this.set(0x97, Instruction.Operation.aax, Instruction.AddressingMode.zeroPageY);
        this.set(0x83, Instruction.Operation.aax, Instruction.AddressingMode.indexedIndirectX);
        this.set(0x8f, Instruction.Operation.aax, Instruction.AddressingMode.absolute);

        this.set(0xbb, Instruction.Operation.lar, Instruction.AddressingMode.absoluteY);

        this.set(0xe7, Instruction.Operation.isc, Instruction.AddressingMode.zeroPage);
        this.set(0xf7, Instruction.Operation.isc, Instruction.AddressingMode.zeroPageX);
        this.set(0xef, Instruction.Operation.isc, Instruction.AddressingMode.absolute);
        this.set(0xff, Instruction.Operation.isc, Instruction.AddressingMode.absoluteX);
        this.set(0xfb, Instruction.Operation.isc, Instruction.AddressingMode.absoluteY);
        this.set(0xe3, Instruction.Operation.isc, Instruction.AddressingMode.indexedIndirectX);
        this.set(0xf3, Instruction.Operation.isc, Instruction.AddressingMode.indirectIndexedY);

        this.set(0x0b, Instruction.Operation.aac, Instruction.AddressingMode.immediate);
        this.set(0x2b, Instruction.Operation.aac, Instruction.AddressingMode.immediate);

        this.set(0xab, Instruction.Operation.atx, Instruction.AddressingMode.immediate);

        this.set(0x67, Instruction.Operation.rra, Instruction.AddressingMode.zeroPage);
        this.set(0x77, Instruction.Operation.rra, Instruction.AddressingMode.zeroPageX);
        this.set(0x6f, Instruction.Operation.rra, Instruction.AddressingMode.absolute);
        this.set(0x7f, Instruction.Operation.rra, Instruction.AddressingMode.absoluteX);
        this.set(0x7b, Instruction.Operation.rra, Instruction.AddressingMode.absoluteY);
        this.set(0x63, Instruction.Operation.rra, Instruction.AddressingMode.indexedIndirectX);
        this.set(0x73, Instruction.Operation.rra, Instruction.AddressingMode.indirectIndexedY);

        this.set(0x27, Instruction.Operation.rla, Instruction.AddressingMode.zeroPage);
        this.set(0x37, Instruction.Operation.rla, Instruction.AddressingMode.zeroPageX);
        this.set(0x2f, Instruction.Operation.rla, Instruction.AddressingMode.absolute);
        this.set(0x3f, Instruction.Operation.rla, Instruction.AddressingMode.absoluteX);
        this.set(0x3b, Instruction.Operation.rla, Instruction.AddressingMode.absoluteY);
        this.set(0x23, Instruction.Operation.rla, Instruction.AddressingMode.indexedIndirectX);
        this.set(0x33, Instruction.Operation.rla, Instruction.AddressingMode.indirectIndexedY);
    }

    public resolve(opcode: number) {
        return this._opcodes[opcode];
    }

    protected set(
        _opcode: number,
        _operation: Instruction.Operation,
        _addressingMode: Instruction.AddressingMode,
        _effectiveAdressingMode?: Instruction.AddressingMode,
        _override: boolean = false
    ): void {
        if (this._opcodes[_opcode].operation !== Instruction.Operation.invalid && !_override) {
            throw new Error('entry for opcode ' + _opcode + ' already exists');
        }

        this._opcodes[_opcode] = new Instruction(_operation, _addressingMode, _effectiveAdressingMode);
    }
}

export default OpcodeResolver;
