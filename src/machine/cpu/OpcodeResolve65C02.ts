import Instruction from './Instruction';
import OpcodeResolver from './OpcodeResolver';

class OpcodeResolver65C02 extends OpcodeResolver {
    constructor() {
        super();

        this.set(
            0xda,
            Instruction.Operation.phx,
            Instruction.AddressingMode.implied,
            Instruction.AddressingMode.implied,
            true
        );
        this.set(
            0x5a,
            Instruction.Operation.phy,
            Instruction.AddressingMode.implied,
            Instruction.AddressingMode.implied,
            true
        );

        this.set(
            0xfa,
            Instruction.Operation.plx,
            Instruction.AddressingMode.implied,
            Instruction.AddressingMode.implied,
            true
        );
        this.set(
            0x7a,
            Instruction.Operation.ply,
            Instruction.AddressingMode.implied,
            Instruction.AddressingMode.implied,
            true
        );

        this.set(
            0x7c,
            Instruction.Operation.jmp,
            Instruction.AddressingMode.indexedIndirectX,
            Instruction.AddressingMode.indexedIndirectX,
            true
        );
    }
}

export default OpcodeResolver65C02;