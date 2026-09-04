import { fireEvent, render, screen } from '@testing-library/react-native';

import { ComposerCard } from './ComposerCard';

describe('ComposerCard', () => {
  it('reports text changes and submits the prompt', async () => {
    const onChangeText = jest.fn();
    const onSubmit = jest.fn();
    await render(<ComposerCard value="" onChangeText={onChangeText} onSubmit={onSubmit} />);

    await fireEvent.changeText(screen.getByLabelText("Décris l'envie du moment"), 'Un plat healthy');
    expect(onChangeText).toHaveBeenCalledWith('Un plat healthy');

    await fireEvent.press(screen.getByRole('button', { name: 'Trouver ma recette' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('disables the submit button while loading', async () => {
    const onSubmit = jest.fn();
    await render(<ComposerCard value="" onChangeText={() => {}} onSubmit={onSubmit} disabled />);

    await fireEvent.press(screen.getByRole('button', { name: 'Trouver ma recette' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
