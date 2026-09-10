/**
 * Registers `className` support on the Paper components we lay out with NativeWind utilities.
 * Plain `View`/`Text`/`Pressable` from `react-native` already accept `className` via the
 * `jsxImportSource: "nativewind"` babel setting — this file is only for third-party components
 * NativeWind doesn't know about. Import once, for its side effect, before any screen renders.
 */
import { remapProps } from 'nativewind';
import { Button, Card, Chip, FAB } from 'react-native-paper';

remapProps(Card, { className: 'style' });
remapProps(Card.Content, { className: 'style' });
remapProps(Card.Actions, { className: 'style' });
remapProps(Button, { className: 'style' });
remapProps(FAB, { className: 'style' });
remapProps(Chip, { className: 'style' });
