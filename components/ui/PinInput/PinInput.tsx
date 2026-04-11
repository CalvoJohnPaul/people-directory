'use client';

import {PinInput} from '@ark-ui/react';
import {createRecipeContext} from '~/utils/createRecipeContext';
import {pinInputRecipe} from './PinInput.recipe';

const {withContext, withProvider} = createRecipeContext(pinInputRecipe);

export const Root = withProvider(PinInput.Root, 'root');
export const Label = withContext(PinInput.Label, 'label');
export const Control = withContext(PinInput.Control, 'control');
export const Input = withContext(PinInput.Input, 'input');
export const HiddenInput = PinInput.HiddenInput;
export const Context = PinInput.Context;
