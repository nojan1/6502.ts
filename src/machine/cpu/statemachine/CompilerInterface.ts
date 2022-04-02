import CpuInterface from '../CpuInterface';
import OpcodeResolver from '../OpcodeResolver';
import StateMachineInterface from './StateMachineInterface';

export type CompilerFactory = (state: CpuInterface.State, opcodeResolver: OpcodeResolver) => CompilerInterface;

interface CompilerInterface {
    compile(op: number): StateMachineInterface | null;
}

export default CompilerInterface;
