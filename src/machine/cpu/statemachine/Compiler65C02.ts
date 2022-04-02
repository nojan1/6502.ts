import Instruction from '../Instruction';
import Compiler from './Compiler';
import * as ops from './ops';
import { pull, push } from './instruction';
import StateMachineInterface from './StateMachineInterface';

class Compiler65C02 extends Compiler {
    compile(op: number): StateMachineInterface | null {
        const instruction = this._opcodeResolver.resolve(op);

        switch (instruction.operation) {
            case Instruction.Operation.phx:
                return push(this._state, (s) => s.x);

            case Instruction.Operation.phy:
                return push(this._state, (s) => s.y);

            case Instruction.Operation.plx:
                return pull(this._state, (s, o) => ops.genNullary(s, (state) => (state.x = o)));

            case Instruction.Operation.ply:
                return pull(this._state, (s, o) => ops.genNullary(s, (state) => (state.y = o)));

            default:
                return super.compile(op);
        }
    }
}

export default Compiler65C02;
