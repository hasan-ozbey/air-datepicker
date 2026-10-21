import {afterEach, beforeAll, describe, expect, test} from '@jest/globals';
import Datepicker from 'datepicker';

let $input, dp;

beforeAll(() => {
    $input = document.createElement('input');
    document.body.appendChild($input);
});

afterEach(() => {
    dp.destroy();
    dp = false;
});

function occurrences(date) {
    if (date.getFullYear() !== 2026 || date.getMonth() !== 9 || date.getDate() !== 20) return;

    return [
        {id: 'first', html: '20¹'},
        {id: 'second', html: '20²'}
    ];
}

function init(opts = {}) {
    dp = new Datepicker($input, {
        visible: true,
        startDate: '2026-10-20',
        firstDay: 0,
        dateOccurrences: occurrences,
        ...opts
    });
}

describe('DATE OCCURRENCES', () => {
    test('renders repeated dates in a sparse row below their natural week', () => {
        init();

        let $rows = dp.$datepicker.querySelectorAll('.air-datepicker-body--cells-row'),
            $occurrenceRow = dp.$datepicker.querySelector('.-occurrence-row-');

        expect($rows).toHaveLength(6);
        expect($occurrenceRow.children).toHaveLength(1);
        expect($occurrenceRow.firstElementChild).toHaveTextContent('20²');
        expect($occurrenceRow.firstElementChild.style.gridColumn).toBe('3');
    });

    test('selects repeated dates independently', () => {
        init();

        dp.getCell('2026-10-20', 'day', 'second').click();

        expect(dp.selectedOccurrenceId).toBe('second');
        expect(dp.getCell('2026-10-20', 'day', 'first')).not.toHaveClass('-selected-');
        expect(dp.getCell('2026-10-20', 'day', 'second')).toHaveClass('-selected-');
    });

    test('selects both occurrences in multiple date mode', () => {
        init({multipleDates: true});

        dp.getCell('2026-10-20', 'day', 'first').click();
        dp.getCell('2026-10-20', 'day', 'second').click();

        expect(dp.selectedDates).toHaveLength(2);
        expect(dp.getCell('2026-10-20', 'day', 'first')).toHaveClass('-selected-');
        expect(dp.getCell('2026-10-20', 'day', 'second')).toHaveClass('-selected-');
    });

    test('restores the selected occurrence', () => {
        init({
            selectedDates: ['2026-10-20'],
            selectedOccurrenceId: 'second'
        });

        expect(dp.selectedOccurrenceId).toBe('second');
        expect(dp.getCell('2026-10-20', 'day', 'second')).toHaveClass('-selected-');
    });

    test('reports the selected occurrence', (done) => {
        init({
            onSelect({occurrenceId}) {
                expect(occurrenceId).toBe('second');
                done();
            }
        });

        dp.getCell('2026-10-20', 'day', 'second').click();
    });

    test('moves down into a repeated occurrence before the following week', () => {
        init();
        dp.setFocusDate('2026-10-20', {occurrenceId: 'first'});

        $input.dispatchEvent(new KeyboardEvent('keydown', {which: 40, key: 'ArrowDown'}));

        expect(dp.focusDate.getDate()).toBe(20);
        expect(dp.focusOccurrenceId).toBe('second');
    });

    test('selects the focused occurrence with the keyboard', () => {
        init();
        dp.setFocusDate('2026-10-20', {occurrenceId: 'second'});

        $input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));

        expect(dp.selectedOccurrenceId).toBe('second');
    });

    test('can enable occurrence rows with update', () => {
        dp = new Datepicker($input, {
            visible: true,
            startDate: '2026-10-20',
            firstDay: 0
        });

        dp.update({dateOccurrences: occurrences});

        expect(dp.$datepicker.querySelector('.-with-occurrences-')).not.toBeNull();
        expect(dp.$datepicker.querySelector('.-occurrence-row-')).not.toBeNull();
    });
});
