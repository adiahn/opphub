// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
type IconMapping = {
  [key: string]: MaterialIconName;
};
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'magnifyingglass': 'search',
  'heart.fill': 'favorite',
  'ellipsis': 'more-horiz',
  'person.fill': 'person',
  'bell.fill': 'notifications',
  'gear': 'settings',
  'questionmark.circle.fill': 'help',
  'info.circle.fill': 'info',
  'arrow.right.circle.fill': 'arrow-forward',
  'bookmark.fill': 'bookmark',
  'star.fill': 'star',
  'location.fill': 'location-on',
  'calendar': 'calendar-today',
  'clock.fill': 'access-time',
  'tag.fill': 'local-offer',
  'link': 'link',
  'square.and.arrow.up': 'share',
  'square.and.pencil': 'edit',
  'trash.fill': 'delete',
  'plus.circle.fill': 'add-circle',
  'minus.circle.fill': 'remove-circle',
  'checkmark.circle.fill': 'check-circle',
  'xmark.circle.fill': 'cancel',
  'exclamationmark.circle.fill': 'error',
  'arrow.up.circle.fill': 'arrow-upward',
  'arrow.down.circle.fill': 'arrow-downward',
  'arrow.left.circle.fill': 'arrow-back',
  'chevron.up': 'keyboard-arrow-up',
  'chevron.down': 'keyboard-arrow-down',
  'chevron.left': 'keyboard-arrow-left',
  'list.bullet': 'list',
  'square.grid.2x2': 'grid-view',
  'slider.horizontal.3': 'tune',
  'line.3.horizontal': 'menu',
  'square.and.arrow.down': 'file-download',
  'doc.fill': 'description',
  'folder.fill': 'folder',
  'photo.fill': 'image',
  'camera.fill': 'camera-alt',
  'mic.fill': 'mic',
  'video.fill': 'videocam',
  'phone.fill': 'phone',
  'envelope.fill': 'email',
  'message.fill': 'message',
  'bubble.left.fill': 'chat',
  'person.2.fill': 'people',
  'person.3.fill': 'group',
  'hand.raised.fill': 'pan-tool',
  'hand.thumbsup.fill': 'thumb-up',
  'hand.thumbsdown.fill': 'thumb-down',
  'heart.slash.fill': 'favorite-border',
  'bookmark.slash.fill': 'bookmark-border',
  'star.slash.fill': 'star-border',
  'bell.slash.fill': 'notifications-off',
  'moon.fill': 'dark-mode',
  'sun.max.fill': 'light-mode',
  'cloud.fill': 'cloud',
  'cloud.rain.fill': 'cloud-queue',
  'cloud.sun.fill': 'wb-sunny',
  'cloud.moon.fill': 'nightlight-round',
  'wifi': 'wifi',
  'wifi.slash': 'wifi-off',
  'battery.100': 'battery-full',
  'battery.0': 'battery-alert',
  'lock.fill': 'lock',
  'lock.open.fill': 'lock-open',
  'key.fill': 'vpn-key',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
  'creditcard.fill': 'credit-card',
  'cart.fill': 'shopping-cart',
  'bag.fill': 'shopping-bag',
  'gift.fill': 'card-giftcard',
  'ticket.fill': 'local-activity',
  'map.fill': 'map',
  'location.slash.fill': 'location-off',
  'flag.fill': 'flag',
  'flag.slash.fill': 'outlined-flag',
  'bell.badge.fill': 'notifications-active',
  'bell.and.waves.left.and.right.fill': 'notifications-paused',
  'bell.badge': 'notifications-none',
  'bell.and.waves.left.and.right': 'notifications-off',
  'bell.slash': 'notifications-off',
  'bell': 'notifications-none',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
