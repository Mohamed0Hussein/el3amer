import { Colors } from '@/constants/theme';
import { tokens } from '@/constants/tokens';
import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  return { theme, tokens, isDark };
};
