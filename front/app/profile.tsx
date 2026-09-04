import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button/Button';
import { Chip } from '@/components/ui/Chip/Chip';
import { IconButton } from '@/components/ui/IconButton/IconButton';
import { BackIcon } from '@/components/ui/icons/icons';
import { NumberField } from '@/components/ui/NumberField/NumberField';
import { ScreenContainer } from '@/components/ui/ScreenContainer/ScreenContainer';
import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl';
import { SelectField } from '@/components/ui/SelectField/SelectField';
import { colors, spacing, typography } from '@/components/ui/tokens';
import { activityLevelLabels, genderLabels } from '@/domain/profile';
import { useProfileStore } from '@/features/profile/useProfileStore';

const genderOptions = (Object.keys(genderLabels) as Array<keyof typeof genderLabels>).map((value) => ({
  value,
  label: genderLabels[value],
}));

const activityOptions = [1, 2, 3, 4, 5].map((value) => ({ value, label: String(value) }));
const countryOptions = ['France', 'Belgique', 'Suisse', 'Canada'].map((value) => ({ value, label: value }));
const extraSportsPool = ['Natation', 'Yoga', 'Vélo', 'Randonnée', 'Danse'];

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useProfileStore();

  const nextSportToAdd = extraSportsPool.find((sport) => !profile.sports.includes(sport));

  return (
    <ScreenContainer gap={spacing.xl}>
      <View style={styles.header}>
        <IconButton icon={<BackIcon />} accessibilityLabel="Retour" onPress={() => router.back()} />
        <Text style={styles.skip} onPress={() => router.push('/home')}>
          Passer
        </Text>
      </View>

      <Text style={styles.eyebrow}>ÉTAPE 2 SUR 2</Text>
      <Text style={styles.headline}>Personnalise tes recettes</Text>
      <Text style={styles.body}>
        Ces informations nous aident à ajuster portions, apports et suggestions à ton profil.
      </Text>

      <View style={styles.row}>
        <NumberField label="Âge" value={profile.age} unit="ans" onChangeValue={profile.setAge} />
        <SelectField label="Genre" value={profile.gender} options={genderOptions} onChange={profile.setGender} />
      </View>

      <View style={styles.row}>
        <NumberField label="Taille" value={profile.heightCm} unit="cm" onChangeValue={profile.setHeightCm} />
        <NumberField label="Poids" value={profile.weightKg} unit="kg" onChangeValue={profile.setWeightKg} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Niveau d'activité</Text>
        <SegmentedControl options={activityOptions} value={profile.activityLevel} onChange={profile.setActivityLevel} />
        <Text style={styles.helper}>
          {profile.activityLevel} · {activityLevelLabels[profile.activityLevel]}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sports pratiqués</Text>
        <View style={styles.chipsWrap}>
          {profile.sports.map((sport) => (
            <Chip key={sport} label={sport} selected onPress={() => profile.removeSport(sport)} />
          ))}
          {nextSportToAdd ? <Chip label="+ Ajouter" onPress={() => profile.addSport(nextSportToAdd)} /> : null}
        </View>
      </View>

      <SelectField label="Pays / région" value={profile.country} options={countryOptions} onChange={profile.setCountry} />

      <Button variant="primary" fullWidth label="Continuer" onPress={() => router.push('/home')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skip: {
    ...typography.bodyMBold,
    color: colors.inkMuted,
  },
  eyebrow: {
    ...typography.label,
    color: colors.coral.strong,
  },
  headline: {
    ...typography.displayL,
    color: colors.ink,
  },
  body: {
    ...typography.bodyL,
    color: colors.inkMuted,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.bodyLBold,
    color: colors.ink,
  },
  helper: {
    ...typography.bodyM,
    color: colors.inkMuted,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
