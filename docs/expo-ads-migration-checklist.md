# Expo Ads Migration Checklist

- [ ] Create Expo app in a sibling folder (example: `/Users/nagai/Desktop/hotel-mobile`)
- [ ] Recreate core game state model (`money`, `rooms`, `adr`, `occupancy`, `upgrades`, `achievements`)
- [ ] Reuse ad reward constants and rules from `src/lib/game/ad-reward.ts`
- [ ] Replace mock watch wait (`setTimeout`) with rewarded ad SDK callback
- [ ] Keep the same reward outputs:
  - boost: 30 minutes 2x income
  - instant: 10 minutes worth of income
- [ ] Preserve ad cooldown behavior (60 seconds) to avoid spam taps
- [ ] Save state with `AsyncStorage` instead of `localStorage`
- [ ] Add vibration and sound feedback for ad reward completion
- [ ] Verify both iOS and Android reward completion paths
- [ ] Add fallback handling when ad fails to load (retry + disabled button UI)

## Recommended SDK Path

- Expo managed workflow: `react-native-google-mobile-ads`
- Start with one rewarded placement ID for both reward types
- Select reward type in app logic based on pressed button
