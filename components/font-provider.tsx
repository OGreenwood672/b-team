import { Fonts as PlatformFonts } from '@/constants/theme';
import * as Font from 'expo-font';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type FontKey = 'sans' | 'serif' | 'rounded' | 'mono';

type FontContextValue = {
  fontKey: FontKey;
  setFontKey: (k: FontKey) => void;
  fonts: Record<string, string>;
  loaded: boolean;
};

const defaultFonts = PlatformFonts as Record<string, string>;

const FontContext = createContext<FontContextValue>({
  fontKey: 'mono',
  setFontKey: () => {},
  fonts: defaultFonts,
  loaded: false,
});

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [fontKey, setFontKey] = useState<FontKey>('mono');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
          await Font.loadAsync({
            'JetBrains Mono': require('../assets/fonts/JetBrainsMono-Regular.ttf'),
          });
      } catch (e) {
        console.warn('[FontProvider] failed to load fonts', e);
      } finally {
        if (mounted) setLoaded(true);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const fonts = useMemo(() => {
    const f = { ...(defaultFonts as Record<string, string>) };
    f.mono = 'JetBrains Mono';
    f['JetBrainsMono'] = 'JetBrainsMono';
    return f;
  }, []);

  return (
    <FontContext.Provider value={{ fontKey, setFontKey, fonts, loaded }}>
      {loaded ? children : null}
    </FontContext.Provider>
  );
}

export function useAppFont() {
  return useContext(FontContext);
}

export default FontProvider;
