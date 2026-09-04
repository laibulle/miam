import { defaultProfile, profileSchema } from './profile';

describe('profileSchema', () => {
  it('accepts the default profile fixture', () => {
    expect(profileSchema.safeParse(defaultProfile).success).toBe(true);
  });

  it('rejects an activity level outside 1-5', () => {
    const result = profileSchema.safeParse({ ...defaultProfile, activityLevel: 6 });
    expect(result.success).toBe(false);
  });

  it('rejects a non-positive age', () => {
    const result = profileSchema.safeParse({ ...defaultProfile, age: 0 });
    expect(result.success).toBe(false);
  });
});
