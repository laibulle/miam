import { fireEvent, render, screen } from '@testing-library/react-native';

import { SelectField } from './SelectField';

const options = [
  { value: 'female' as const, label: 'Femme' },
  { value: 'male' as const, label: 'Homme' },
];

describe('SelectField', () => {
  it('cycles to the next option on press', async () => {
    const onChange = jest.fn();
    await render(<SelectField label="Genre" value="female" options={options} onChange={onChange} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Genre' }));

    expect(onChange).toHaveBeenCalledWith('male');
  });

  it('wraps around to the first option after the last', async () => {
    const onChange = jest.fn();
    await render(<SelectField label="Genre" value="male" options={options} onChange={onChange} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Genre' }));

    expect(onChange).toHaveBeenCalledWith('female');
  });
});
