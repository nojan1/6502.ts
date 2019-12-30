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

import SchedulerInterface from '../SchedulerInterface';
import TaskInterface from '../TaskInterface';
import getTimestamp from '../getTimestamp';
import { setImmediate } from '../setImmediate';

const THRESHOLD = 1;

class ConstantTimesliceScheduler implements SchedulerInterface {
    start<T>(worker: SchedulerInterface.WorkerInterface<T>, context?: T, _timeSlice?: number): TaskInterface {
        const timeSlice = _timeSlice || 50;

        let running = true;

        function handler() {
            if (!running) {
                return;
            }

            const timestampStart = getTimestamp();
            let emulationTime = 0,
                delta = 0;

            while (getTimestamp() - timestampStart < timeSlice) {
                do {
                    delta = getTimestamp() - timestampStart - emulationTime;
                } while (delta < THRESHOLD);

                emulationTime += worker(context, delta) as number;
            }

            delta = getTimestamp() - timestampStart - emulationTime;
            if (delta > 0) {
                emulationTime += worker(context, delta) as number;
            }

            if (running) {
                setImmediate(handler);
            }
        }

        setImmediate(handler);

        return { stop: () => (running = false) };
    }
}

export { ConstantTimesliceScheduler as default };
