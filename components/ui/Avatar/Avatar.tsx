'use client';

import {Avatar} from '@ark-ui/react';
import {createRecipeContext} from '~/utils/createRecipeContext';
import {avatarRecipe} from './Avatar.recipe';

const {withProvider, withContext} = createRecipeContext(avatarRecipe);

export const Root = withProvider(Avatar.Root, 'root');
export const Image = withContext(Avatar.Image, 'image');
export const Fallback = withContext(Avatar.Fallback, 'fallback');
export const Context = Avatar.Context;
