import FilesystemProviderInterface from '../fs/FilesystemProviderInterface';
import DebuggerCLI from './DebuggerCLI';

import BoardInterface from '../machine/board/BoardInterface';
import Board from '../machine/stella/Board';
import CartridgeInterface from '../machine/stella/CartridgeInterface';
import StellaConfig from '../machine/stella/Config';
import VideoOutputInterface from '../machine/io/VideoOutputInterface';
import ControlPanelInterface from '../machine/stella/ControlPanelInterface';
import DigitalJoystickInterface from '../machine/io/DigitalJoystickInterface';
import CartridgeFactory from '../machine/stella/CartridgeFactory';

import CommandInterpreter from './CommandInterpreter';
import ImmedateScheduler from '../tools/scheduler/ImmedateScheduler';
import LimitedScheduler from '../tools/scheduler/LimitingImmediateScheduler';
import PeriodicScheduler from '../tools/scheduler/PeriodicScheduler';
import SchedulerInterface from '../tools/scheduler/SchedulerInterface';
import Event from '../tools/event/Event';

import ClockProbe from '../tools/ClockProbe';

const enum RunMode {limited, unlimited};

const CLOCK_PROBE_INTERVAL = 1000;

class StellaCLI extends DebuggerCLI {

    constructor(fsProvider: FilesystemProviderInterface, protected _cartridgeFile?: string) {
        super(fsProvider);

        this._commandInterpreter.registerCommands({
            run: () => (this._setState(StellaCLI.State.run), 'running...')
        });

        this._runModeCommandInterpreter = new CommandInterpreter({
            stop: () => (this._setState(StellaCLI.State.debug), 'stopped, entered debugger')
        });

        this._setupModeCommandInterpreter = new CommandInterpreter({
            'load-cartridge': this._executeLoadCartridge.bind(this)
        });

        const runModeCommands: CommandInterpreter.CommandTableInterface = {
            'set-speed-limited': () => (this._setRunMode(RunMode.limited), 'speed limiting on'),
            'set-speed-unlimited': () => (this._setRunMode(RunMode.unlimited), 'speed limiting off')
        };

        this._commandInterpreter.registerCommands(runModeCommands);
        this._runModeCommandInterpreter.registerCommands(runModeCommands);
    }

    getVideoOutput(): VideoOutputInterface {
        return this._board.getVideoOutput();
    }

    getPrompt(): string {
        const frequency = this._clockProbe ? this._clockProbe.getFrequency() : 0,
            prefix = frequency > 0 ? `${(frequency / 1000000).toFixed(2)} MHz ` : '';

        switch (this._state) {
            case StellaCLI.State.setup:
                return `[setup] > `;

            case StellaCLI.State.debug:
                return `${prefix}[debug] > `;

            case StellaCLI.State.run:
                return `${prefix}[run] > `;

            default:
                throw new Error('invalid run state');
        }
    }

    interrupt(): void {
        switch (this._state) {
            case StellaCLI.State.debug:
                return this._quit();

            case StellaCLI.State.run:
                return this._setState(StellaCLI.State.debug);

        }
    }

    getControlPanel(): ControlPanelInterface {
        return this._board.getControlPanel();
    }

    getJoystick0(): DigitalJoystickInterface {
        return this._board.getJoystick0();
    }

    getJoystick1(): DigitalJoystickInterface {
        return this._board.getJoystick1();
    }

    getState(): StellaCLI.State {
        return this._state;
    }

    loadCartridgeFromBuffer(buffer: {[idx: number]: number, length: number}, name: string): void {
        const factory = new CartridgeFactory();

        try {
            this._cartridge = factory.createCartridge(buffer);
            this._initializeHardware();
            this._setState(StellaCLI.State.debug);
            this._cartridgeFile = name;

            this._outputLine(`successfully loaded ${name}`);
        } catch (e) {
            this._outputLine(e.message);
        }
    }

    protected _getCommandInterpreter(): CommandInterpreter {
        switch (this._state) {
            case StellaCLI.State.setup:
                return this._setupModeCommandInterpreter;

            case StellaCLI.State.debug:
                return super._getCommandInterpreter();

            case StellaCLI.State.run:
                return this._runModeCommandInterpreter;

            default:
                throw new Error('invalid run state');
        }
    }

    protected _executeLoadCartridge(args: Array<string>): string {
        if (args.length === 0) {
            return 'ERROR: filename required';
        }

        const file = args[0];

        try {
            this._loadCartridge(file);
            this._cartridgeFile = file;
            this._initializeHardware();
            this._setState(StellaCLI.State.debug);
        } catch (e) {
            return e.message;
        }

        return `succesfully loaded ${file}`;
    }

    protected _loadCartridge(file: string): void {
        const fileBuffer = this._fsProvider.readBinaryFileSync(file),
            factory = new CartridgeFactory();

        this._cartridge = factory.createCartridge(fileBuffer);
    }

    protected _initialize(): void {
        if (this._cartridgeFile) {
            try {
                this._loadCartridge(this._cartridgeFile);
                this._initializeHardware();
                this._setState(StellaCLI.State.debug);
            } catch (e) {
                this._outputLine(e.message);
            }
        }

        this._prompt();
    }

    protected _initializeHardware(): void {
        const config = new StellaConfig(StellaConfig.TvMode.ntsc),
            board = new Board(config, this._cartridge);

        this._board = board;

        const clockProbe = new ClockProbe(new PeriodicScheduler(CLOCK_PROBE_INTERVAL));
        clockProbe.attach(this._board.clock);
        clockProbe.frequencyUpdate.addHandler(() => this.events.promptChanged.dispatch(undefined));

        this._debugger.attach(this._board);
        this._board.trap.addHandler(this._onTrap, this);

        this._clockProbe = clockProbe;

        this.hardwareInitialized.dispatch(undefined);
    }

    protected _setState(state: StellaCLI.State) {
        if (state === this._state) {
            return;
        }

        this._state = state;
        this.events.availableCommandsChanged.dispatch(undefined);
        this.events.promptChanged.dispatch(undefined);

        switch (state) {
            case StellaCLI.State.debug:
                this._clockProbe.stop();
                this._board.getTimer().stop();
                break;

            case StellaCLI.State.run:
                this._clockProbe.start();
                this._board.getTimer().start(this._getScheduler());
                break;
        }
    }

    protected _setRunMode(runMode: RunMode) {
        if (runMode === this._runMode) {
            return;
        }

        this._runMode = runMode;

        if (this._state === StellaCLI.State.run) {
            const timer = this._board.getTimer();

            timer.stop();
            timer.start(this._getScheduler());
        }
    }

    protected _getScheduler(): SchedulerInterface {
        switch (this._runMode) {
            case RunMode.limited:
                return this._limitingScheduler;

            case RunMode.unlimited:
                return this._nonLimitingScheduler;

            default:
                throw new Error('invalid run mode');
        }
    }

    protected _onTrap(trap: BoardInterface.TrapPayload, ctx: this): void {
        if (ctx._state === StellaCLI.State.run) {
            ctx._setState(StellaCLI.State.debug);
            ctx._outputLine(ctx._debuggerFrontend.describeTrap(trap));
        }
    }

    hardwareInitialized = new Event<void>();

    protected _board: Board;
    protected _cartridge: CartridgeInterface;
    protected _runModeCommandInterpreter: CommandInterpreter;
    protected _setupModeCommandInterpreter: CommandInterpreter;

    protected _limitingScheduler = new LimitedScheduler();
    protected _nonLimitingScheduler = new ImmedateScheduler();
    protected _clockProbe: ClockProbe;

    protected _state = StellaCLI.State.setup;
    protected _runMode = RunMode.limited;
}

module StellaCLI {
    export const enum State {setup, debug, run};
}

export default StellaCLI;
