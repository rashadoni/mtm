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

test('uses tenant first and credentials second without exposing the server', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<LoginScreen />);
  });

  expect(renderer.root.findAllByType(TextInput)).toHaveLength(1);
  expect(JSON.stringify(renderer.toJSON())).toContain('Təşkilat');

  await ReactTestRenderer.act(() => {
    renderer.root
      .findByProps({ testID: 'tenant-input' })
      .props.onChangeText(' Zeytun ');
  });
  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ testID: 'tenant-continue' }).props.onPress();
  });

  expect(renderer.root.findAllByType(TextInput)).toHaveLength(2);
  const credentialsStep = JSON.stringify(renderer.toJSON());
  expect(credentialsStep).toContain('zeytun');
  expect(credentialsStep).toContain('E-poçt');
  expect(credentialsStep).not.toContain('Server');

  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ testID: 'tenant-change' }).props.onPress();
  });
  expect(renderer.root.findAllByType(TextInput)).toHaveLength(1);
});
