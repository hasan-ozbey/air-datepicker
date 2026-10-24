import {afterEach, describe, expect, test} from '@jest/globals';
import Datepicker from 'datepicker';

let $button, $container, dp;

afterEach(() => {
    dp.destroy();
    dp = false;
    $button.remove();
    if ($container) {
        $container.remove();
        $container = null;
    }
});

function init(opts = {}) {
    $button = document.createElement('button');
    document.body.appendChild($button);
    dp = new Datepicker($button, {
        startDate: '2026-10-20',
        ...opts
    });
}

function pressOn($el) {
    $el.dispatchEvent(new Event('pointerdown', {bubbles: true}));
}

describe('BUTTON TARGET', () => {
    test('opens as a popup, not inline', () => {
        init();

        expect(dp.treatAsInline).toBe(false);

        $button.click();

        expect(dp.visible).toBe(true);
        expect(dp.$datepicker).not.toHaveClass('-inline-');
        expect($button).not.toContainElement(dp.$datepicker);
    });

    test('closes when clicked again', () => {
        init();

        $button.click();
        $button.click();

        expect(dp.visible).toBe(false);
    });

    test('closes when pressed anywhere else', () => {
        init();

        $button.click();
        pressOn(document.body);

        expect(dp.visible).toBe(false);
    });

    test('stays open when its calendar is pressed', () => {
        init();

        $button.click();
        pressOn(dp.getCell('2026-10-12'));

        expect(dp.visible).toBe(true);
    });

    test('selects the focused date on Enter without toggling the calendar', () => {
        init();

        $button.click();
        dp.setFocusDate(new Date(2026, 9, 12));

        let event = new KeyboardEvent('keydown', {key: 'Enter', cancelable: true});
        $button.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
        expect(dp.selectedDates[0].getDate()).toBe(12);
    });

    test('stays inline when asked to', () => {
        init({inline: true});

        expect(dp.treatAsInline).toBe(true);
        expect(dp.$datepicker).toHaveClass('-inline-');
    });
});

describe('MOBILE OVERLAY IN A CUSTOM CONTAINER', () => {
    test('puts the overlay in the container', () => {
        $container = document.createElement('div');
        document.body.appendChild($container);
        init({isMobile: true, container: $container});

        $button.click();

        let $overlay = $container.querySelector('.air-datepicker-overlay');

        expect($overlay).toHaveClass('-active-');
        expect(dp.$datepicker).toHaveClass('-is-mobile-');
    });

    test('is centred even with a custom position', () => {
        $container = document.createElement('div');
        document.body.appendChild($container);
        let position = jest.fn();
        init({isMobile: true, container: $container, position});

        $button.click();

        expect(position).not.toHaveBeenCalled();
        expect(dp.$datepicker.style.left).toBe('50%');
        expect(dp.$datepicker.style.top).toBe('50%');
    });

    test('closes when the overlay is clicked', () => {
        $container = document.createElement('div');
        document.body.appendChild($container);
        init({isMobile: true, container: $container});

        $button.click();
        $container.querySelector('.air-datepicker-overlay').click();

        expect(dp.visible).toBe(false);
    });
});
