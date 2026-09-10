import { format, isSameDay, parseISO } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Appbar, Button, Divider, HelperText, Menu, Text, TextInput, useTheme } from 'react-native-paper';
import { DatePickerInput, DatePickerModal } from 'react-native-paper-dates';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentPicker } from '@/components/AccentPicker';
import { applyExpiryPreset, EXPIRY_PRESETS } from '@/lib/dates';
import { sessionsFor, usePacks } from '@/store/usePacks';
import { accentOrder, type AccentKey } from '@/theme/paper';

export default function EditPackScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const existing = usePacks((state) => state.packs.find((p) => p.id === id));
  const sessions = usePacks((state) => state.sessions);
  const addPack = usePacks((state) => state.addPack);
  const updatePack = usePacks((state) => state.updatePack);

  const isEditing = !!existing;
  const usedCount = existing ? sessionsFor(sessions, existing.id).length : 0;

  const [name, setName] = useState(existing?.name ?? '');
  const [totalText, setTotalText] = useState(existing ? String(existing.totalSessions) : '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    existing ? parseISO(existing.startDate) : new Date(),
  );
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    existing?.expiryDate ? parseISO(existing.expiryDate) : undefined,
  );
  const [accent, setAccent] = useState<AccentKey>(existing?.accent ?? accentOrder[0]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [expiryMenuVisible, setExpiryMenuVisible] = useState(false);
  const [customDatePickerVisible, setCustomDatePickerVisible] = useState(false);

  const matchingPreset = EXPIRY_PRESETS.find(
    (preset) => expiryDate && isSameDay(expiryDate, applyExpiryPreset(startDate ?? new Date(), preset.key)),
  );
  const expiryDisplayLabel = !expiryDate
    ? 'No expiry'
    : (matchingPreset?.label ?? format(expiryDate, 'MMM d, yyyy'));

  const totalSessions = Number.parseInt(totalText, 10);
  const nameError = name.trim().length === 0;
  const totalError = useMemo(() => {
    if (totalText.trim().length === 0) return 'Enter how many sessions the pack includes';
    if (!Number.isInteger(totalSessions) || totalSessions < 1) return 'Must be a whole number, 1 or more';
    if (isEditing && totalSessions < usedCount) {
      return `Can't be less than the ${usedCount} session(s) already used`;
    }
    return null;
  }, [totalText, totalSessions, isEditing, usedCount]);
  const startDateError = !startDate;

  const canSubmit = !nameError && !totalError && !startDateError;

  function handleSave() {
    if (!canSubmit || !startDate) return;
    setSubmitError(null);
    const input = {
      name: name.trim(),
      totalSessions,
      startDate: format(startDate, 'yyyy-MM-dd'),
      expiryDate: expiryDate ? format(expiryDate, 'yyyy-MM-dd') : undefined,
      accent,
    };
    try {
      if (existing) {
        updatePack(existing.id, input);
      } else {
        addPack(input);
      }
      router.back();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not save this pack');
    }
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.Action icon="close" onPress={() => router.back()} accessibilityLabel="Cancel" />
        <Appbar.Content title={isEditing ? 'Edit pack' : 'Add pack'} />
        <Appbar.Action icon="check" onPress={handleSave} accessibilityLabel="Save" disabled={!canSubmit} />
      </Appbar.Header>

      <ScrollView
        className="p-md"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32, gap: 4 }}
        keyboardShouldPersistTaps="handled">
        <TextInput
          mode="outlined"
          label="Name"
          placeholder="e.g. Coworking"
          value={name}
          onChangeText={setName}
          error={nameError && name.length > 0}
          accessibilityLabel="Name"
        />
        <HelperText type="error" visible={nameError && name.length > 0}>
          Name is required
        </HelperText>

        <TextInput
          mode="outlined"
          label="Total sessions"
          placeholder="e.g. 24"
          value={totalText}
          onChangeText={setTotalText}
          keyboardType="number-pad"
          error={!!totalError && totalText.length > 0}
          accessibilityLabel="Total sessions"
        />
        <HelperText type="error" visible={!!totalError && totalText.length > 0}>
          {totalError}
        </HelperText>

        <View className="mt-sm">
          <DatePickerInput
            locale="en"
            label="Start date"
            inputMode="start"
            value={startDate}
            onChange={setStartDate}
            mode="outlined"
          />
        </View>

        <View className="mt-sm">
          <Menu
            visible={expiryMenuVisible}
            onDismiss={() => setExpiryMenuVisible(false)}
            anchor={
              <Pressable
                onPress={() => setExpiryMenuVisible(true)}
                accessibilityLabel={`Expiry date, ${expiryDisplayLabel}`}>
                <View pointerEvents="none">
                  <TextInput
                    mode="outlined"
                    label="Expiry date (optional)"
                    value={expiryDisplayLabel}
                    editable={false}
                    right={<TextInput.Icon icon="menu-down" />}
                  />
                </View>
              </Pressable>
            }>
            {EXPIRY_PRESETS.map((preset) => (
              <Menu.Item
                key={preset.key}
                title={preset.label}
                onPress={() => {
                  setExpiryDate(applyExpiryPreset(startDate ?? new Date(), preset.key));
                  setExpiryMenuVisible(false);
                }}
              />
            ))}
            <Divider />
            <Menu.Item
              title="No expiry"
              onPress={() => {
                setExpiryDate(undefined);
                setExpiryMenuVisible(false);
              }}
            />
            <Menu.Item
              title="Custom date…"
              onPress={() => {
                setExpiryMenuVisible(false);
                setCustomDatePickerVisible(true);
              }}
            />
          </Menu>
          <DatePickerModal
            locale="en"
            mode="single"
            visible={customDatePickerVisible}
            date={expiryDate}
            onDismiss={() => setCustomDatePickerVisible(false)}
            onConfirm={({ date }) => {
              setExpiryDate(date);
              setCustomDatePickerVisible(false);
            }}
          />
        </View>

        <Text variant="labelLarge" className="mt-lg mb-xs">
          Color
        </Text>
        <AccentPicker value={accent} onChange={setAccent} />

        {submitError ? (
          <HelperText type="error" visible>
            {submitError}
          </HelperText>
        ) : null}

        <Button mode="contained" onPress={handleSave} disabled={!canSubmit} className="mt-lg">
          {isEditing ? 'Save changes' : 'Add pack'}
        </Button>
      </ScrollView>
    </View>
  );
}
