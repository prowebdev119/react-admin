import assert from 'assert';
import { stub } from 'sinon';

import { addRecordsFactory } from './data';

describe('data addRecordsFactory', () => {
    it('should call getFetchedAt with newRecords ids and oldRecordFetchedAt and return records returned by getFetchedAt', () => {
        const newRecords = [{ id: 'record1' }, { id: 'record2' }];
        const oldRecords = {};
        const getFetchedAt = stub().returns({
            record1: 'date',
            record2: 'date',
        });

        const newState = addRecordsFactory(getFetchedAt)(
            newRecords,
            oldRecords
        );

        assert.deepEqual(newState, {
            record1: { id: 'record1' },
            record2: { id: 'record2' },
        });

        assert(getFetchedAt.calledWith(['record1', 'record2'], undefined));

        assert.deepEqual(newState.fetchedAt, {
            record1: 'date',
            record2: 'date',
        });
    });

    it('should discard record that do not have their ids returned by getFetchedAt', () => {
        const newRecords = [{ id: 'record1' }, { id: 'record2' }];
        const oldRecords = { record3: 'record3' };
        const getFetchedAt = stub().returns({
            record1: 'date',
            record2: 'date',
        });

        const newState = addRecordsFactory(getFetchedAt)(
            newRecords,
            oldRecords
        );

        assert.deepEqual(newState, {
            record1: { id: 'record1' },
            record2: { id: 'record2' },
        });
    });

    it('should keep record that have their ids returned by getFetchedAt', () => {
        const newRecords = [{ id: 'record1' }, { id: 'record2' }];
        const oldRecords = { record3: 'record3' };
        const getFetchedAt = stub().returns({
            record1: 'date',
            record2: 'date',
            record3: 'date',
        });

        const newState = addRecordsFactory(getFetchedAt)(
            newRecords,
            oldRecords
        );

        assert.deepEqual(newState, {
            record1: { id: 'record1' },
            record2: { id: 'record2' },
            record3: 'record3',
        });
    });

    it('should replace oldRecord by new record', () => {
        const newRecords = [{ id: 'record1' }, { id: 'record2' }];
        const oldRecords = { record1: 'old record 1' };
        const getFetchedAt = stub().returns({
            record1: 'date',
            record2: 'date',
        });

        const newState = addRecordsFactory(getFetchedAt)(
            newRecords,
            oldRecords
        );

        assert.deepEqual(newState, {
            record1: { id: 'record1' },
            record2: { id: 'record2' },
        });
    });
});
