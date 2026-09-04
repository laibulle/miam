import { fireEvent, render, screen } from '@testing-library/react-native';

import { SegmentedControl } from './SegmentedControl';

const options = [1, 2, 3].map((value) => ({ value, label: String(value) }));

describe('SegmentedControl', () => {
  it('reports the pressed option value', async () => {
    const onChange = jest.fn();
    await render(<SegmentedControl options={options} value={1} onChange={onChange} />);

    await fireEvent.press(screen.getByRole('button', { name: '3' }));

    expect(onChange).toHaveBeenCalledWith(3);
  });
});
