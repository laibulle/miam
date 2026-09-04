import { defaultProfile } from '../../domain/profile';
import { useProfileStore } from './useProfileStore';

describe('useProfileStore', () => {
  beforeEach(() => {
    useProfileStore.setState(defaultProfile);
  });

  it('starts from the default profile fixture', () => {
    expect(useProfileStore.getState().age).toBe(defaultProfile.age);
  });

  it('adds a sport only once', () => {
    useProfileStore.getState().addSport('Natation');
    useProfileStore.getState().addSport('Natation');

    expect(useProfileStore.getState().sports.filter((s) => s === 'Natation')).toHaveLength(1);
  });

  it('removes a sport', () => {
    useProfileStore.getState().removeSport('Course à pied');

    expect(useProfileStore.getState().sports).not.toContain('Course à pied');
  });
});
