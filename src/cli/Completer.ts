import CLIInterface = require('./CLIInterface');
import pathlib = require('path');
import FilesystemProviderInterface = require('../fs/FilesystemProviderInterface');

class Completer {

    constructor (
        private _availableCommands: Array<string>,
        private _fsProvider: FilesystemProviderInterface
    ) {}

    complete(cmd: string): Completer.CompletionResult {
        const chunks = cmd.split(/\s+/);

        if (chunks.length > 0 && chunks[0] === '') chunks.shift();

        switch (chunks.length) {
            case 0:
                return new Completer.CompletionResult(this._availableCommands, cmd);

            case 1:
                return new Completer.CompletionResult(
                    this._availableCommands.filter((candidate: string) => candidate.search(chunks[0]) === 0),
                    chunks[0]
                );

            default:
                const path = chunks[chunks.length - 1];

                return new Completer.CompletionResult(this._completePath(path), path);
        }
    }

    private _completePath(path: string): Array<string> {
        let dirname = pathlib.dirname(path),
            basename = pathlib.basename(path),
            directory: Array<string>;

        if (!this._fsProvider) return [];

        if (path && path[path.length - 1] === pathlib.sep || path[path.length - 1] === '/') {
            dirname = path;
            basename = '';
        }

        try {
            directory = this._fsProvider.readDirSync(dirname);

            return this._appendSlashesToDirectories(
                directory
                    .filter(
                        (candidate: string) => candidate.search(basename) === 0
                    )
                    .map(entry => pathlib.join(dirname, entry))
            );
        } catch(e) {}

        return [];
    }

    private _appendSlashesToDirectories(paths: Array<string>) {
        return paths.map((path: string): string => {
            try {
                return (this._fsProvider.getTypeSync(path) === FilesystemProviderInterface.FileType.DIRECTORY ?
                    pathlib.join(path, pathlib.sep) : path);
            } catch(e) {
                return path;
            }
        });
    }
}

module Completer {

    export class CompletionResult {
        constructor(
            public candidates: Array<string>,
            public match: string
        ) {}
    }

}

export = Completer;
