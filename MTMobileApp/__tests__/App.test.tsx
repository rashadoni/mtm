/**
 * @format
 */

import React from 'react';
import { TextInput } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import LoginScreen from '../src/screens/auth/LoginScreen';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

test('keeps technical tenant and server configuration out of login', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<LoginScreen />);
  });

  expect(renderer.root.findAllByType(TextInput)).toHaveLength(2);
  const screen = JSON.stringify(renderer.toJSON());
  expect(screen).not.toContain('Server');
  expect(screen).not.toContain('Təşkilat kodu');
});
