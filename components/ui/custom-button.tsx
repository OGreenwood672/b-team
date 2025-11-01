import { Pressable, StyleSheet, Text } from 'react-native';

const colors = {
  primary: '#FFD400',
  text: '#333333',
  background: '#FFFFFF',
  secondary: '#FFF8DC',
};


export const CustomButton = ({ title, onPress, variant = 'primary' }: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.buttonBase,
        variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
        { opacity: pressed ? 0.8 : 1 }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.textBase,
        variant === 'primary' ? styles.textPrimary : styles.textSecondary
      ]}>
        {title}
      </Text>
    </Pressable>
  );
};


const styles = StyleSheet.create({
  buttonBase: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textBase: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  textPrimary: {
    color: colors.text,
  },
  buttonSecondary: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  textSecondary: {
    color: colors.primary,
  },
});