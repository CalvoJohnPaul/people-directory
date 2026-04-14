'use client';

import {Swap} from '@ark-ui/react';
import {createRecipeContext} from '~/utils/createRecipeContext';
import {swapRecipe} from './Swap.recipe';

const {withProvider, withContext} = createRecipeContext(swapRecipe);

export const Root = withProvider(Swap.Root, 'root');
export const Indicator = withContext(Swap.Indicator, 'indicator');
