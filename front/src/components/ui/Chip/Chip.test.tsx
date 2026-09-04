import { fireEvent, render, screen } from '@testing-library/react-native';

import { Chip } from './Chip';

describe('Chip', () => {
  it('calls onPress when tapped and reports selected state', async () => {
    const onPress = jest.fn();
    await render(<Chip label="Végétarien" selected onPress={onPress} />);

    const chip = screen.getByRole('button', { name: /Végétarien/ });
    expect(chip.props.accessibilityState.selected).toBe(true);

    await fireEvent.press(chip);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
